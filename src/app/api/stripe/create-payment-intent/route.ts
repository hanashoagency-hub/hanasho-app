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

    // .trim() guards against a stray trailing newline/space from copy-pasting
    // into Vercel's env var UI — a common cause of "the key looks right but
    // every request fails" that's otherwise invisible.
    const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secretKey) {
      return NextResponse.json({ error: "Card payments are not configured yet (missing STRIPE_SECRET_KEY)." }, { status: 500 });
    }
    if (secretKey.startsWith("pk_")) {
      console.error("[stripe] STRIPE_SECRET_KEY is set to a publishable key, not the secret key.");
      return NextResponse.json({ error: "Card payments are misconfigured (wrong key type). Please contact support." }, { status: 500 });
    }

    const stripe = new Stripe(secretKey);

    const body = await request.json();
    const { courseId } = body;
    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    const admin = getAdminClient();

    // Server-authoritative price lookup — the amount charged is always
    // read from the DB, never trusted from the client.
    const { data: course, error: courseErr } = await admin
      .from("courses")
      .select("id, title, price, currency")
      .eq("id", courseId)
      .eq("is_published", true)
      .maybeSingle();

    if (courseErr || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const { data: existingPurchase } = await admin
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existingPurchase) {
      return NextResponse.json({ error: "You already own this course." }, { status: 400 });
    }

    const currency = (course.currency || "USD").toLowerCase();
    const amount = Math.round(Number(course.price) * 100);

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "This course doesn't have a valid price." }, { status: 400 });
    }
    // Stripe's platform-wide minimum charge (roughly $0.50 for USD) — checking
    // here gives a clear, specific message instead of a raw Stripe API error.
    if (currency === "usd" && amount < 50) {
      return NextResponse.json({
        error: "This course's price is too low for card payments (Stripe requires at least $0.50). Please contact support.",
      }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
      metadata: {
        user_id: user.id,
        course_id: courseId,
        course_title: course.title,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      currency,
    });
  } catch (error: any) {
    console.error("[stripe] create-payment-intent error:", error?.message || error, error?.type ? `(${error.type})` : "");

    // Stripe SDK errors carry a `.type` (StripeInvalidRequestError,
    // StripeAuthenticationError, StripePermissionError, ...) and a
    // `.message` that's written to be safe to show end users — surface it
    // directly instead of a generic string, since that's the fastest way
    // to actually diagnose a misconfiguration in production.
    const isStripeError = typeof error?.type === "string" && error.type.startsWith("Stripe");
    return NextResponse.json({
      error: isStripeError
        ? `Stripe error: ${error.message}`
        : "Payment setup failed on our server. Please try again or contact support.",
    }, { status: 500 });
  }
}
