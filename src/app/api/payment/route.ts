import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient } from '@supabase/supabase-js';

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
    const { itemId, itemType = 'course', phoneNumber, amount, paymentMethod } = body;
    const targetItemId = itemId || body.courseId;

    if (!targetItemId || !phoneNumber || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
          amount: amount.toString(),
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

    // Atomically save the transaction + (on success) the purchase record.
    // This runs as a single SECURITY DEFINER function call server-side,
    // so a failure partway through rolls back instead of leaving a
    // "charged but not enrolled" half-state.
    const { data: purchaseResult, error: rpcErr } = await supabaseAdmin.rpc('complete_purchase', {
      p_user_id: user.id,
      p_course_id: targetItemId,
      p_amount: Number(amount),
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
