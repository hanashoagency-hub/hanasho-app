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

    // Use service role key to securely bypass RLS for transactions & purchases
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://worerikjebqpeibrepgz.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcmVyaWtqZWJxcGVpYnJlcGd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYzNTk4NiwiZXhwIjoyMDk2MjExOTg2fQ.rHBeYbUnD0WNCgUduf95ddjBx3cSrsTeoPtXMu0Y9dU"
    );

    const body = await request.json();
    const { courseId, phoneNumber, amount, paymentMethod } = body;

    if (!courseId || !phoneNumber || !amount || !paymentMethod) {
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
      timestamp: Date.now().toString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid,
        apiUserId,
        apiKey,
        paymentMethod: "mwallet_account",
        payerInfo: {
          accountNo: phoneNumber
        },
        transactionInfo: {
          referenceId,
          invoiceId: referenceId,
          amount: amount.toString(),
          currency,
          description: "Hanasho LMS Course Purchase"
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
    const { data: tx, error: txError } = await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      course_id: courseId,
      amount,
      currency,
      payment_method: paymentMethod,
      phone_number: phoneNumber,
      reference_id: referenceId,
      status: data.responseCode === '2001' ? 'success' : 'failed',
      waafipay_response: data
    }).select().single();

    if (txError) {
      console.error("Tx Error:", txError);
    }

    if (data.responseCode === '2001') {
      // Payment successful, grant access
      await supabaseAdmin.from('purchases').insert({
        user_id: user.id,
        course_id: courseId
      });

      return NextResponse.json({ success: true, message: 'Payment successful, course unlocked!' });
    } else {
      // Payment failed or user rejected USSD
      return NextResponse.json({ success: false, error: data.responseMsg || 'Payment failed or rejected' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Payment Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
