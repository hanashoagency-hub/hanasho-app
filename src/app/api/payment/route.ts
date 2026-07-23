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
    // Fallback for old requests that still send courseId
    const targetItemId = itemId || body.courseId;

    if (!targetItemId || !phoneNumber || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine currency based on method or logic (WaafiPay uses USD for EVC usually)
    const currency = 'USD';
    const referenceId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const merchantUid = process.env.WAAFIPAY_MERCHANT_UID;
    const apiUserId = process.env.WAAFIPAY_API_USER_ID;
    const apiKey = process.env.WAAFIPAY_API_KEY;

    if (!merchantUid || !apiUserId || !apiKey) {
      return NextResponse.json({ error: 'WaafiPay credentials missing' }, { status: 500 });
    }

    // WaafiPay JSON Payload
    const payload = {
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
        payerInfo: {
          accountNo: phoneNumber
        },
        transactionInfo: {
          referenceId,
          invoiceId: referenceId,
          amount: amount.toString(),
          currency,
          description: `HanHub LMS Purchase (${itemType})`
        }
      }
    };

    console.log("Sending to WaafiPay:", JSON.stringify(payload));

    // Production WaafiPay endpoint
    const waafipayUrl = 'https://api.waafipay.net/asm';
    
    const response = await fetch(waafipayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("WaafiPay Response:", JSON.stringify(data));

    // Save transaction in database regardless of success/fail first
    const txPayload: any = {
      user_id: user.id,
      course_id: itemType === 'course' ? targetItemId : null, // keep legacy field for courses if needed
      amount,
      currency,
      payment_method: paymentMethod,
      phone_number: phoneNumber,
      reference_id: referenceId,
      status: data.responseCode === '2001' ? 'success' : 'failed',
      waafipay_response: data
    };

    let txError = null;
    try {
      const res = await supabaseAdmin.from('transactions').insert({
        ...txPayload,
        item_id: targetItemId,
        item_type: itemType,
      }).select().single();
      txError = res.error;

      if (txError && txError.code === '42703') { // undefined_column
        console.warn("Missing item_id/item_type in transactions. Falling back.");
        const fb = await supabaseAdmin.from('transactions').insert(txPayload).select().single();
        txError = fb.error;
      }
    } catch (err) {
      console.error("Tx Fallback Error:", err);
    }

    if (txError) {
      console.error("Tx Error:", txError);
    }

    if (data.responseCode === '2001') {
      // Payment successful, grant access
      const payload: any = {
        user_id: user.id,
        course_id: itemType === 'course' ? targetItemId : null,
      };

      // Add new columns if the migration was run, otherwise we'll try to insert and fallback
      try {
        const { error: purchaseError } = await supabaseAdmin.from('purchases').insert({
          ...payload,
          item_id: targetItemId,
          item_type: itemType
        });
        
        if (purchaseError && purchaseError.code === '42703') { // undefined_column
          console.warn("Missing item_id/item_type columns. Falling back to legacy course_id insert.");
          await supabaseAdmin.from('purchases').insert(payload);
        } else if (purchaseError) {
          console.error("Purchase Insert Error:", purchaseError);
        }
      } catch (err) {
        console.error("Purchase Fallback Error:", err);
      }

      return NextResponse.json({ success: true, message: 'Payment successful, item unlocked!' });
    } else {
      // Payment failed or user rejected USSD
      return NextResponse.json({ success: false, error: data.responseMsg || 'Payment failed or rejected' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Payment Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
