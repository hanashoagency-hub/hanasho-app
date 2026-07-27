import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { provisionTelegramAccessForPurchase } from '@/utils/telegramInvites';
import { sendPurchaseReceipt } from '@/utils/email';
import { getEffectiveCoursePrice, incrementCouponUse } from '@/utils/pricing';

const RECEIPT_TABLE_BY_TYPE: Record<string, string> = {
  course: 'courses',
  book: 'books',
  diploma: 'diplomas',
  zoom: 'zoom_classes',
};

export async function POST(request: Request) {
  try {
    const supabaseServer = await createServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    // Guard against common misconfigurations before ever hitting the DB —
    // covers both the legacy JWT key format and the newer sb_secret_/
    // sb_publishable_ key format Supabase is migrating projects to.
    let keyProblem: string | null = null;
    if (!serviceKey) {
      keyProblem = "SUPABASE_SERVICE_ROLE_KEY is not set.";
    } else if (serviceKey.includes('.')) {
      try {
        const payload = JSON.parse(Buffer.from(serviceKey.split('.')[1], 'base64').toString());
        if (payload.role !== 'service_role') {
          keyProblem = `SUPABASE_SERVICE_ROLE_KEY is a '${payload.role || 'unknown'}' key, not 'service_role'.`;
        }
      } catch (e) {
        console.error("Could not parse JWT role", e);
      }
    } else if (serviceKey.startsWith('sb_publishable_')) {
      keyProblem = "SUPABASE_SERVICE_ROLE_KEY is set to a publishable (public) key, not the secret key.";
    }

    if (keyProblem) {
      console.error(`[payment] Service role key misconfigured: ${keyProblem}`);
      return NextResponse.json({
        success: false,
        error: "CRITICAL CONFIG ERROR: SUPABASE_SERVICE_ROLE_KEY is misconfigured. Set it to the project's service_role (or sb_secret_...) key in your environment and redeploy.",
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );

    const body = await request.json();
    const { itemId, itemType = 'course', phoneNumber, amount, paymentMethod, couponCode, plan } = body;
    const targetItemId = itemId || body.courseId;
    const isSubscription = plan === 'subscription' && itemType === 'course';

    if (!targetItemId || !phoneNumber || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Charge amount is always recomputed server-side — the client's amount is
    // display-only and never trusted. Subscriptions price off the monthly
    // rate + stepped discount; lifetime/one-time prices off base + promo/coupon.
    let chargeAmount = Number(amount);
    let redeemableCouponId: string | null = null;
    if (isSubscription) {
      const { getSubscriptionPricing } = await import('@/utils/subscription');
      const sub = await getSubscriptionPricing(targetItemId, user.id);
      if (!sub || !sub.offersSubscription) {
        return NextResponse.json({ error: 'This course does not offer a monthly subscription.' }, { status: 400 });
      }
      if (sub.price <= 0) {
        return NextResponse.json({ error: 'This subscription does not have a valid price.' }, { status: 400 });
      }
      chargeAmount = sub.price;
    } else if (itemType === 'course') {
      const effective = await getEffectiveCoursePrice(targetItemId, couponCode);
      if (!effective) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
      if (effective.isFree) {
        return NextResponse.json({ error: 'This course is currently free — no payment needed. Just open the course page and start learning.' }, { status: 400 });
      }
      chargeAmount = effective.finalPrice;
      redeemableCouponId = effective.couponId;
    }

    const currency = 'USD';
    const referenceId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const merchantUid = process.env.WAAFIPAY_MERCHANT_UID;
    const apiUserId = process.env.WAAFIPAY_API_USER_ID;
    const apiKey = process.env.WAAFIPAY_API_KEY;

    if (!merchantUid || !apiUserId || !apiKey) {
      return NextResponse.json({ error: 'WaafiPay credentials missing' }, { status: 500 });
    }

    const waafipayPayload = {
      schemaVersion: "1.0",
      requestId: referenceId,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid,
        apiUserId,
        apiKey,
        paymentMethod: "MWALLET_ACCOUNT",
        payerInfo: { accountNo: phoneNumber },
        transactionInfo: {
          referenceId,
          invoiceId: referenceId,
          amount: chargeAmount.toString(),
          currency,
          description: `HanHub LMS Purchase (${itemType})`
        }
      }
    };

    console.log("Sending to WaafiPay:", JSON.stringify(waafipayPayload));

    const response = await fetch('https://api.waafipay.net/asm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(waafipayPayload)
    });

    const data = await response.json();
    console.log("WaafiPay Response:", JSON.stringify(data));

    const isSuccess = data.responseCode === '2001';

    // ---- Subscription path: time-boxed access, no permanent purchase, no VIP ----
    if (isSubscription) {
      const subMethod = `sub_${paymentMethod}`;
      const { data: subResult, error: subErr } = await supabaseAdmin.rpc('complete_subscription', {
        p_user_id: user.id,
        p_course_id: targetItemId,
        p_amount: chargeAmount,
        p_currency: currency,
        p_payment_method: subMethod,
        p_phone_number: phoneNumber,
        p_reference_id: referenceId,
        p_status: isSuccess ? 'success' : 'failed',
        p_gateway_response: data,
      });

      if (subErr) {
        console.error(`[payment] complete_subscription RPC failed (ref ${referenceId}, user ${user.id}, course ${targetItemId}):`, subErr);
        if (isSuccess) {
          return NextResponse.json({
            success: false,
            error: `Your payment went through, but we couldn't activate your subscription automatically. Please contact support with reference ${referenceId}.`,
          }, { status: 500 });
        }
        return NextResponse.json({ success: false, error: data.responseMsg || 'Payment failed or rejected' }, { status: 400 });
      }

      if (!isSuccess) {
        return NextResponse.json({ success: false, error: data.responseMsg || 'Payment failed or rejected' }, { status: 400 });
      }

      if (user.email) {
        const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
        const { data: course } = await supabaseAdmin.from('courses').select('title').eq('id', targetItemId).maybeSingle();
        await sendPurchaseReceipt({
          to: user.email,
          firstName: profile?.full_name?.split(' ')[0] || 'there',
          itemTitle: `${course?.title || 'Course'} — Monthly Subscription`,
          amount: chargeAmount,
          currency,
          referenceId,
        });
      }

      const periodEnd = subResult?.[0]?.period_end;
      return NextResponse.json({
        success: true,
        message: 'Subscription active! You have 30 days of access.',
        periodEnd,
      });
    }

    // Atomically save the transaction + (on success) the purchase record.
    // This runs as a single SECURITY DEFINER function call server-side,
    // so a failure partway through rolls back instead of leaving a
    // "charged but not enrolled" half-state.
    const { data: purchaseResult, error: rpcErr } = await supabaseAdmin.rpc('complete_purchase', {
      p_user_id: user.id,
      p_course_id: targetItemId,
      p_amount: chargeAmount,
      p_currency: currency,
      p_payment_method: paymentMethod,
      p_phone_number: phoneNumber,
      p_reference_id: referenceId,
      p_status: isSuccess ? 'success' : 'failed',
      p_waafipay_response: data,
    });

    if (rpcErr) {
      // Log full detail for debugging, but never expose raw DB errors to the user.
      console.error(`[payment] complete_purchase RPC failed (ref ${referenceId}, user ${user.id}, course ${targetItemId}):`, rpcErr);

      if (isSuccess) {
        // Worst case: WaafiPay charged the student but we couldn't record it.
        // Give them a reference ID to quote for manual support follow-up
        // instead of a raw Postgres error string.
        return NextResponse.json({
          success: false,
          error: `Your payment went through, but we couldn't confirm enrollment automatically. Please contact support with reference ${referenceId} and we'll unlock your course right away.`,
        }, { status: 500 });
      }

      return NextResponse.json({
        success: false,
        error: data.responseMsg || 'Payment failed or rejected',
      }, { status: 400 });
    }

    if (!isSuccess) {
      return NextResponse.json({
        success: false,
        error: data.responseMsg || 'Payment failed or rejected',
      }, { status: 400 });
    }

    const alreadyOwned = purchaseResult?.[0]?.already_owned;

    if (!alreadyOwned) {
      if (redeemableCouponId) {
        await incrementCouponUse(redeemableCouponId);
      }

      const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      const firstName = profile?.full_name?.split(' ')[0] || 'there';

      if (itemType === 'course') {
        await provisionTelegramAccessForPurchase({
          userId: user.id,
          userEmail: user.email,
          userName: profile?.full_name,
          courseId: targetItemId,
        });
      }

      if (user.email) {
        const table = RECEIPT_TABLE_BY_TYPE[itemType] || 'courses';
        const { data: item } = await supabaseAdmin.from(table).select('title').eq('id', targetItemId).maybeSingle();
        await sendPurchaseReceipt({
          to: user.email,
          firstName,
          itemTitle: item?.title || 'Your purchase',
          amount: chargeAmount,
          currency,
          referenceId,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: alreadyOwned ? 'Payment successful, item already owned!' : 'Payment successful, item unlocked!',
    });

  } catch (error: any) {
    console.error('Payment Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Something went wrong processing your payment. Please try again or contact support.',
    }, { status: 500 });
  }
}
