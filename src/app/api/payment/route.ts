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
    
    // Decode the JWT to check if the user accidentally pasted the anon key
    let keyRole = 'unknown';
    try {
      if (serviceKey.includes('.')) {
        const payload = JSON.parse(Buffer.from(serviceKey.split('.')[1], 'base64').toString());
        keyRole = payload.role || 'unknown';
      }
    } catch (e) {
      console.error("Could not parse JWT role", e);
    }

    if (keyRole === 'anon') {
      return NextResponse.json({ 
        success: false, 
        error: "CRITICAL CONFIG ERROR: Your Vercel SUPABASE_SERVICE_ROLE_KEY is currently set to the 'anon' public key. You must change it to the 'service_role' secret key in Vercel settings and REDEPLOY." 
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

    // Save transaction
    const { error: txErr } = await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      course_id: targetItemId,
      amount: Number(amount),
      currency,
      payment_method: paymentMethod,
      phone_number: phoneNumber,
      reference_id: referenceId,
      status: isSuccess ? 'success' : 'failed',
      waafipay_response: data
    });

    if (txErr) {
      console.error("Transaction save error:", txErr);
      // We still want to give them access if they paid, so we don't return error yet
    }

    if (isSuccess) {
      // Save purchase record
      const { error: purchaseErr } = await supabaseAdmin.from('purchases').insert({
        user_id: user.id,
        course_id: targetItemId,
      });

      if (purchaseErr) {
        // If the error is a unique constraint violation, it means they already own it!
        if (purchaseErr.code === '23505') {
          console.log("User already owns this course. Proceeding to unlock.");
          return NextResponse.json({ success: true, message: 'Payment successful, item already owned!' });
        }
        
        console.error("Purchase save error:", purchaseErr);
        // If we failed to save the purchase for another reason, return an error.
        return NextResponse.json({ 
          success: false, 
          error: `Payment succeeded but failed to save purchase: ${purchaseErr.message}` 
        }, { status: 500 });
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
