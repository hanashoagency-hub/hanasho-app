"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, ArrowLeft, CheckCircle, CreditCard, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getCheckoutItemAction, getCheckoutPriceAction } from "@/app/portal-live/actions";
import StripeCardCheckout from "@/components/StripeCardCheckout";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import Link from "next/link";

function MastercardIcon() {
  return (
    <svg width="28" height="18" viewBox="0 0 28 18" aria-label="Mastercard" role="img">
      <circle cx="10.5" cy="9" r="8" fill="#EB001B" />
      <circle cx="17.5" cy="9" r="8" fill="#F79E1B" fillOpacity="0.9" />
    </svg>
  );
}

function VisaIcon() {
  return (
    <svg width="34" height="18" viewBox="0 0 34 18" aria-label="Visa" role="img">
      <rect width="34" height="18" rx="3" fill="#1A1F71" />
      <text x="17" y="13" textAnchor="middle" fontSize="9" fontStyle="italic" fontWeight="bold" fill="#fff" fontFamily="Arial, sans-serif">
        VISA
      </text>
    </svg>
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const itemId = params.courseId as string;
  const itemType = searchParams.get("type") || "course";
  
  const router = useRouter();
  const supabase = createClient();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("evc");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Promo/coupon pricing (courses only; server is the source of truth)
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [pricing, setPricing] = useState<{ basePrice: number; finalPrice: number; appliedPct: number } | null>(null);

  const effectivePrice = itemType === "course" && pricing ? pricing.finalPrice : Number(item?.price || 0);

  const refreshPricing = async (coupon: string | null) => {
    if (itemType !== "course") return;
    const res = await getCheckoutPriceAction(itemId, coupon);
    if (res.success) {
      setPricing({ basePrice: res.basePrice!, finalPrice: res.finalPrice!, appliedPct: res.appliedPct! });
      if (coupon) {
        if (res.couponError) {
          setAppliedCoupon(null);
          setCouponMessage({ text: res.couponError, ok: false });
        } else if (res.couponPct! > 0) {
          setAppliedCoupon(coupon);
          setCouponMessage({ text: `Coupon applied — ${res.couponPct}% off!`, ok: true });
        }
      }
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponMessage(null);
    await refreshPricing(code);
    setApplyingCoupon(false);
  };

  useEffect(() => {
    const fetchItem = async () => {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?next=/checkout/${itemId}?type=${itemType}`);
        return;
      }

      // Fetch item details based on type
      let table = "courses";
      if (itemType === "diploma") table = "diplomas";
      if (itemType === "zoom") table = "zoom_classes";
      if (itemType === "book") table = "books";

      try {
        const res = await getCheckoutItemAction(table, itemId);
        if (res.success && res.item) {
          const data = res.item;
          // Adjust price based on tier if it's a diploma
          if (itemType === "diploma") {
            const tier = searchParams.get("tier");
            if (tier === "slow") data.price = data.price_slow;
            else if (tier === "speedy") data.price = data.price_speedy;
            else if (tier === "onetime") data.price = data.price_onetime;
          }
          setItem(data);
        } else {
          console.error("Checkout: item fetch failed", { table, itemId, res });
        }
      } catch (err) {
        console.error("Checkout: exception fetching item", err);
      }

      if (itemType === "course") {
        const priceRes = await getCheckoutPriceAction(itemId, null);
        if (priceRes.success) {
          setPricing({ basePrice: priceRes.basePrice!, finalPrice: priceRes.finalPrice!, appliedPct: priceRes.appliedPct! });
        }
      }

      setLoading(false);
    };
    fetchItem();
  }, [itemId, itemType, router]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      setError("Fadlan geli nambar sax ah.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          itemType,
          phoneNumber: "252" + phone.replace(/^0+/, ''), // Format for WaafiPay
          amount: effectivePrice,
          couponCode: appliedCoupon,
          paymentMethod
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard`);
        }, 3000);
      } else {
        setError(data.error || "Payment failed. Fadlan hubi in taleefankaagu furan yahay oo aad leedahay lacag kugu filan.");
        setProcessing(false);
      }
    } catch (err: any) {
      setError("Cilad ayaa dhacday, fadlan dib isku day.");
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>;
  if (!item) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Item not found.</div>;

  if (success) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="text-center bg-[#0A0A0A] border border-white/10 rounded-3xl p-10 max-w-md w-full animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Hambalyo!</h2>
          <p className="text-xl text-white/80 mb-8">Welcome to the course: <span className="font-bold text-white">{item.title}</span></p>
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white/40 text-sm">Redirecting you to the course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-white/20 pt-24 pb-20">
      <AnnouncementBanner placement="checkout" />
      <div className="max-w-4xl mx-auto px-6">
        <Link href={itemType === "course" ? `/courses/${itemId}` : itemType === "diploma" ? `/diplomas/${itemId}` : itemType === "book" ? `/books/${itemId}` : `/live-classes/${itemId}`} className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to details
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Payment Form */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" /> Payment Details
            </h2>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {['evc', 'zaad', 'sahal', 'somnet'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => { setPaymentMethod(method); setError(""); }}
                      className={`py-3 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all ${
                        paymentMethod === method
                          ? "bg-white/10 border-white text-white"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                  {itemType === 'course' && (
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('card'); setError(""); }}
                      className={`col-span-2 py-3 rounded-t-xl border text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        paymentMethod === 'card'
                          ? "bg-white/10 border-white text-white"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      <MastercardIcon /> <VisaIcon /> Card
                    </button>
                  )}
                </div>
              </div>

              {itemType === "course" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Coupon Code (optional)</label>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME20"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-mono tracking-wider placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponInput.trim()}
                      className="px-5 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors disabled:opacity-40"
                    >
                      {applyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-xs ${couponMessage.ok ? "text-green-400" : "text-red-400"}`}>{couponMessage.text}</p>
                  )}
                </div>
              )}

              {paymentMethod === 'card' ? (
                <StripeCardCheckout
                  key={appliedCoupon || "no-coupon"}
                  courseId={itemId}
                  amount={effectivePrice}
                  couponCode={appliedCoupon}
                  onSuccess={(msg) => {
                    setSuccess(true);
                    setTimeout(() => router.push('/dashboard'), 3000);
                  }}
                  onError={(msg) => setError(msg)}
                />
              ) : (
                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Phone Number (Ka reeb 252)</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-0 inset-y-0 flex items-center pl-4 pr-3 border-r border-white/10 text-white/50 bg-white/5 rounded-l-xl">
                        +252
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="61XXXXXXX"
                        maxLength={9}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-20 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing USSD Push...</>
                      ) : (
                        <><Lock className="w-5 h-5" /> Pay ${effectivePrice.toFixed(2)} Securely</>
                      )}
                    </button>
                  </div>
                </form>
              )}

              <p className="text-center text-xs text-white/40 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-400" /> 256-bit encrypted secure payment
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-[#0A0A0A]/50 border border-white/5 rounded-3xl p-8 h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
            <div className="flex gap-4 mb-6 pb-6 border-b border-white/10">
              {item.cover_image ? (
                <img src={item.cover_image} alt={item.title} className="w-24 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-24 h-16 bg-white/10 rounded-lg"></div>
              )}
              <div>
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="text-sm text-white/50">{itemType === "course" ? "Full Lifetime Access" : "Premium Access"}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-white/10">
              <div className="flex justify-between text-white/70">
                <span>Original Price</span>
                <span>${Number(item.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Discount{pricing && pricing.appliedPct > 0 ? ` (${pricing.appliedPct}%)` : ""}</span>
                <span className="text-green-400">-${(Number(item.price) - effectivePrice).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-white">Total</span>
              <span className="text-3xl font-bold text-white">${effectivePrice.toFixed(2)}</span>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-sm text-blue-200">
              <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <p>Waa lacag bixin ammaan ah. Isla marka aad bixiso lacagta, fasalka si toos ah ayuu kuugu furmayaa.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
