"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

// Stripe redirects here after a 3D Secure bank challenge (cards that
// don't need it never leave the checkout page). We just need to
// re-confirm the PaymentIntent server-side and finish enrollment.
export default function CheckoutCompletePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const paymentIntentId = searchParams.get("payment_intent");
    if (!paymentIntentId) {
      setStatus("error");
      setMessage("Missing payment reference.");
      return;
    }

    const confirm = async () => {
      try {
        const res = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId }),
        });
        const data = await res.json();
        if (data.success) {
          setStatus("success");
          setMessage(data.message);
          setTimeout(() => router.push("/dashboard"), 2500);
        } else {
          setStatus("error");
          setMessage(data.error || "Payment could not be confirmed.");
        }
      } catch {
        setStatus("error");
        setMessage("Payment could not be confirmed. Please contact support.");
      }
    };
    confirm();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="text-center bg-[#0A0A0A] border border-white/10 rounded-3xl p-10 max-w-md w-full">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-white/50 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2">Confirming your payment...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-white/60">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Issue</h2>
            <p className="text-white/60">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
