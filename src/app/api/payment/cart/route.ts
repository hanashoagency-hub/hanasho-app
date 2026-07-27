import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient } from '@supabase/supabase-js';

const TABLE_BY_TYPE: Record<string, string> = {
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
      console.error(`[payment/cart] Service role key misconfigured: ${keyProblem}`);
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
    const { items, phoneNumber, paymentMethod } = body as {
      items: { itemId: string; itemType: string }[];
      phoneNumber: string;
      paymentMethod: string;
    };

    if (!Array.isArray(items) || items.length === 0 || !phoneNumber || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Server-authoritative price lookup for every item — the client-supplied
    // cart is only ever used for item ids, never for pricing.
    const resolvedItems: { itemId: string; itemType: string; price: number }[] = [];
    for (const { itemId, itemType } of items) {
      const table = TABLE_BY_TYPE[itemType];
      if (!table || !itemId) {
        return NextResponse.json({ error: `Invalid cart item (${itemType}).` }, { status: 400 });
      }
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('id, price')
        .eq('id', itemId)
        .maybeSingle();
      if (error || !data) {
        return NextResponse.json({ error: `One of the items in your cart could not be found.` }, { status: 404 });
      }
      resolvedItems.push({ itemId, itemType, price: Number(data.price) || 0 });
    }

    // Skip anything the user already owns instead of double-charging for it.
    const { data: existingPurchases } = await supabaseAdmin
      .from('purchases')
      .select('course_id')
      .eq('user_id', user.id)
      .in('course_id', resolvedItems.map((i) => i.itemId));
    const ownedIds = new Set((existingPurchases || []).map((p: any) => p.course_id));

    const payableItems = resolvedItems.filter((i) => !ownedIds.has(i.itemId));
    if (payableItems.length === 0) {
      return NextResponse.json({ error: 'You already own everything in this order.' }, { status: 400 });
    }

    const totalAmount = payableItems.reduce((sum, i) => sum + i.price, 0);
    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: 'This order does not have a valid total.' }, { status: 400 });
    }

    const currency = 'USD';
    const referenceId = `INV-CART-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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
          amount: totalAmount.toString(),
          currency,
          description: `HanHub LMS Cart Purchase (${payableItems.length} items)`
        }
      }
    };

    console.log("Sending to WaafiPay (cart):", JSON.stringify(waafipayPayload));

    const response = await fetch('https://api.waafipay.net/asm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(waafipayPayload)
    });

    const data = await response.json();
    console.log("WaafiPay Response (cart):", JSON.stringify(data));

    const isSuccess = data.responseCode === '2001';
    const status = isSuccess ? 'success' : 'failed';

    // One complete_purchase call per item, each with its own unique
    // reference_id (transactions.reference_id is a dedupe key — reusing the
    // same id across items would silently drop every row after the first)
    // and its own price, so revenue reporting stays accurate per item while
    // still being traceable back to this one combined charge.
    let anyRpcError = false;
    for (let i = 0; i < payableItems.length; i++) {
      const item = payableItems[i];
      const { error: rpcErr } = await supabaseAdmin.rpc('complete_purchase', {
        p_user_id: user.id,
        p_course_id: item.itemId,
        p_amount: item.price,
        p_currency: currency,
        p_payment_method: paymentMethod,
        p_phone_number: phoneNumber,
        p_reference_id: `${referenceId}-${i}`,
        p_status: status,
        p_waafipay_response: data,
      });
      if (rpcErr) {
        anyRpcError = true;
        console.error(`[payment/cart] complete_purchase RPC failed (ref ${referenceId}-${i}, user ${user.id}, item ${item.itemId}):`, rpcErr);
      }
    }

    if (!isSuccess) {
      return NextResponse.json({
        success: false,
        error: data.responseMsg || 'Payment failed or rejected',
      }, { status: 400 });
    }

    if (anyRpcError) {
      return NextResponse.json({
        success: false,
        error: `Your payment went through, but we couldn't confirm enrollment for every item automatically. Please contact support with reference ${referenceId} and we'll unlock everything right away.`,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment successful, items unlocked!',
    });

  } catch (error: any) {
    console.error('Cart Payment Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Something went wrong processing your payment. Please try again or contact support.',
    }, { status: 500 });
  }
}
