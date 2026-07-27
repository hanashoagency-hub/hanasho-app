import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/certificates";
import { provisionTelegramAccessForPurchase } from "@/utils/telegramInvites";
import { sendPurchaseReceipt } from "@/utils/email";

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
    const stripe = new Stripe(secretKey);

    const { paymentIntentId } = await request.json();
    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.metadata?.user_id !== user.id) {
      return NextResponse.json({ error: "This payment does not belong to your account." }, { status: 403 });
    }

    const itemsEncoded = intent.metadata?.items;
    if (!itemsEncoded) {
      return NextResponse.json({ error: "Payment is missing order information." }, { status: 400 });
    }

    const parsedItems = itemsEncoded.split("|").map((entry) => {
      const [itemType, itemId] = entry.split(":");
      return { itemType, itemId };
    }).filter((i) => i.itemType && i.itemId && TABLE_BY_TYPE[i.itemType]);

    if (parsedItems.length === 0) {
      return NextResponse.json({ error: "Payment is missing order information." }, { status: 400 });
    }

    const isSuccess = intent.status === "succeeded";
    const admin = getAdminClient();

    // Re-derive each item's real price server-side (never trust anything
    // client-controlled), splitting the single charge across N purchase
    // rows with unique reference_ids — same pattern as the WaafiPay cart route.
    let anyRpcError = false;
    const receiptItems: { itemType: string; itemId: string; title: string; price: number }[] = [];
    for (let i = 0; i < parsedItems.length; i++) {
      const { itemType, itemId } = parsedItems[i];
      const table = TABLE_BY_TYPE[itemType];
      const { data: itemRow } = await admin.from(table).select("title, price").eq("id", itemId).maybeSingle();
      const price = Number(itemRow?.price) || 0;
      receiptItems.push({ itemType, itemId, title: itemRow?.title || "Your purchase", price });

      const { error: rpcErr } = await admin.rpc("complete_purchase", {
        p_user_id: user.id,
        p_course_id: itemId,
        p_amount: price,
        p_currency: intent.currency.toUpperCase(),
        p_payment_method: "card",
        p_phone_number: null,
        p_reference_id: `${intent.id}-${i}`,
        p_status: isSuccess ? "success" : "failed",
        p_waafipay_response: intent,
      });
      if (rpcErr) {
        anyRpcError = true;
        console.error(`[stripe/cart] complete_purchase RPC failed (pi ${intent.id}-${i}, user ${user.id}, item ${itemId}):`, rpcErr);
      }
    }

    if (!isSuccess) {
      return NextResponse.json({ success: false, error: "Payment failed or was declined." }, { status: 400 });
    }

    if (anyRpcError) {
      return NextResponse.json({
        success: false,
        error: `Your card was charged, but we couldn't confirm enrollment for every item automatically. Please contact support with reference ${intent.id} and we'll unlock everything right away.`,
      }, { status: 500 });
    }

    {
      const { data: profile } = await admin.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      const firstName = profile?.full_name?.split(" ")[0] || "there";

      for (const item of receiptItems) {
        if (item.itemType === "course") {
          await provisionTelegramAccessForPurchase({
            userId: user.id,
            userEmail: user.email,
            userName: profile?.full_name,
            courseId: item.itemId,
          });
        }

        if (user.email) {
          await sendPurchaseReceipt({
            to: user.email,
            firstName,
            itemTitle: item.title,
            amount: item.price,
            currency: intent.currency.toUpperCase(),
            referenceId: intent.id,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment successful, items unlocked!",
    });
  } catch (error: any) {
    console.error("[stripe/cart] confirm-cart error:", error?.message || error, error?.type ? `(${error.type})` : "");
    const isStripeError = typeof error?.type === "string" && error.type.startsWith("Stripe");
    return NextResponse.json({
      success: false,
      error: isStripeError ? `Stripe error: ${error.message}` : "Something went wrong confirming your payment.",
    }, { status: 500 });
  }
}
