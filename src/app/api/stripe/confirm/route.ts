import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/certificates";

export async function POST(request: Request) {
  try {
    const supabaseServer = await createServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secretKey) {
      return NextResponse.json({ error: "Card payments are not configured yet (missing STRIPE_SECRET_KEY)." }, { status: 500 });
    }
    const stripe = new Stripe(secretKey);

    const { paymentIntentId } = await request.json();
    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
    }

    // Re-fetch the PaymentIntent directly from Stripe — never trust a
    // client-reported "success", since that request body is attacker-controlled.
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.metadata?.user_id !== user.id) {
      return NextResponse.json({ error: "This payment does not belong to your account." }, { status: 403 });
    }

    const courseId = intent.metadata?.course_id;
    if (!courseId) {
      return NextResponse.json({ error: "Payment is missing course information." }, { status: 400 });
    }

    const isSuccess = intent.status === "succeeded";
    const admin = getAdminClient();

    // Same atomic function used by the WaafiPay flow — reused as-is so
    // there's a single source of truth for "save transaction + grant
    // access" regardless of payment provider.
    const { data: purchaseResult, error: rpcErr } = await admin.rpc("complete_purchase", {
      p_user_id: user.id,
      p_course_id: courseId,
      p_amount: intent.amount / 100,
      p_currency: intent.currency.toUpperCase(),
      p_payment_method: "card",
      p_phone_number: null,
      p_reference_id: intent.id,
      p_status: isSuccess ? "success" : "failed",
      p_waafipay_response: intent,
    });

    if (rpcErr) {
      console.error(`[stripe] complete_purchase RPC failed (pi ${intent.id}, user ${user.id}):`, rpcErr);
      if (isSuccess) {
        return NextResponse.json({
          success: false,
          error: `Your card was charged, but we couldn't confirm enrollment automatically. Please contact support with reference ${intent.id} and we'll unlock your course right away.`,
        }, { status: 500 });
      }
      return NextResponse.json({ success: false, error: "Payment failed or was declined." }, { status: 400 });
    }

    if (!isSuccess) {
      return NextResponse.json({ success: false, error: "Payment failed or was declined." }, { status: 400 });
    }

    const alreadyOwned = purchaseResult?.[0]?.already_owned;
    return NextResponse.json({
      success: true,
      message: alreadyOwned ? "Payment successful, course already owned!" : "Payment successful, course unlocked!",
    });
  } catch (error: any) {
    console.error("[stripe] confirm error:", error?.message || error, error?.type ? `(${error.type})` : "");
    const isStripeError = typeof error?.type === "string" && error.type.startsWith("Stripe");
    return NextResponse.json({
      success: false,
      error: isStripeError ? `Stripe error: ${error.message}` : "Something went wrong confirming your payment.",
    }, { status: 500 });
  }
}
