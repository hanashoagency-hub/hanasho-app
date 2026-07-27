import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/certificates";
import { getEffectiveCoursePrice } from "@/utils/pricing";

const TABLE_BY_TYPE: Record<string, string> = {
  course: "courses",
  book: "books",
  diploma: "diplomas",
  zoom: "zoom_classes",
};

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
    if (secretKey.startsWith("pk_")) {
      console.error("[stripe/cart] STRIPE_SECRET_KEY is set to a publishable key, not the secret key.");
      return NextResponse.json({ error: "Card payments are misconfigured (wrong key type). Please contact support." }, { status: 500 });
    }

    const stripe = new Stripe(secretKey);

    const body = await request.json();
    const items = body.items as { itemId: string; itemType: string }[];
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const admin = getAdminClient();

    // Server-authoritative price lookup for every item.
    const resolvedItems: { itemId: string; itemType: string; price: number }[] = [];
    for (const { itemId, itemType } of items) {
      const table = TABLE_BY_TYPE[itemType];
      if (!table || !itemId) {
        return NextResponse.json({ error: `Invalid cart item (${itemType}).` }, { status: 400 });
      }
      const { data, error } = await admin
        .from(table)
        .select("id, price")
        .eq("id", itemId)
        .eq("is_published", true)
        .maybeSingle();
      if (error || !data) {
        return NextResponse.json({ error: "One of the items in your cart could not be found." }, { status: 404 });
      }

      let price = Number(data.price) || 0;
      if (itemType === "course") {
        const effective = await getEffectiveCoursePrice(itemId);
        if (effective) price = effective.isFree ? 0 : effective.finalPrice;
      }
      resolvedItems.push({ itemId, itemType, price });
    }

    const { data: existingPurchases } = await admin
      .from("purchases")
      .select("course_id")
      .eq("user_id", user.id)
      .in("course_id", resolvedItems.map((i) => i.itemId));
    const ownedIds = new Set((existingPurchases || []).map((p: any) => p.course_id));

    const payableItems = resolvedItems.filter((i) => !ownedIds.has(i.itemId));
    if (payableItems.length === 0) {
      return NextResponse.json({ error: "You already own everything in this order." }, { status: 400 });
    }

    const currency = "usd";
    const amount = Math.round(payableItems.reduce((sum, i) => sum + i.price, 0) * 100);

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "This order does not have a valid total." }, { status: 400 });
    }
    if (amount < 50) {
      return NextResponse.json({
        error: "This order's total is too low for card payments (Stripe requires at least $0.50). Please contact support.",
      }, { status: 400 });
    }

    // Compact encoding: "type:id|type:id" — Stripe metadata values are
    // capped at 500 chars, comfortably enough for a normal-sized cart.
    const itemsEncoded = payableItems.map((i) => `${i.itemType}:${i.itemId}`).join("|");
    if (itemsEncoded.length > 480) {
      return NextResponse.json({ error: "Your cart has too many items for a single card payment. Please check out in smaller batches." }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
      metadata: {
        user_id: user.id,
        items: itemsEncoded,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      currency,
    });
  } catch (error: any) {
    console.error("[stripe/cart] create-payment-intent-cart error:", error?.message || error, error?.type ? `(${error.type})` : "");

    const isStripeError = typeof error?.type === "string" && error.type.startsWith("Stripe");
    return NextResponse.json({
      error: isStripeError
        ? `Stripe error: ${error.message}`
        : "Payment setup failed on our server. Please try again or contact support.",
    }, { status: 500 });
  }
}
