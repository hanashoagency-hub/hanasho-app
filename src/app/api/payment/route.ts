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

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    // Save transaction - use only guaranteed columns
    try {
      await supabaseAdmin.from('transactions').insert({
        user_id: user.id,
        course_id: targetItemId,
        amount,
        currency,
        payment_method: paymentMethod,
        phone_number: phoneNumber,
        reference_id: referenceId,
        status: isSuccess ? 'success' : 'failed',
        waafipay_response: data
      });
    } catch (txErr) {
      console.error("Transaction save error:", txErr);
    }

    if (isSuccess) {
      // Save purchase record - use only guaranteed columns
      try {
        await supabaseAdmin.from('purchases').insert({
          user_id: user.id,
          course_id: targetItemId,
        });
      } catch (purchaseErr) {
        console.error("Purchase save error:", purchaseErr);
      }

      return NextResponse.json({ success: true, message: 'Payment successful, item unlocked!' });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.responseMsg || 'Payment failed or rejected' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Payment Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
