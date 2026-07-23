"use client";

import { useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, Lock } from "lucide-react";
import { getStripe } from "@/utils/stripe/client";

function CardForm({
  amount,
  onSuccess,
  onError,
}: {
  amount: number;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}${window.location.pathname}/complete`,
      },
    });

    if (submitError) {
      onError(submitError.message || "Card payment failed.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      try {
        const res = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });
        const data = await res.json();
        if (data.success) {
          onSuccess(data.message);
        } else {
          onError(data.error || "Could not confirm your payment.");
        }
      } catch {
        onError("Could not confirm your payment. Please contact support.");
      }
    }
    // If status isn't "succeeded" and there's no error, Stripe is redirecting
    // the browser for 3D Secure — the /complete page picks it up from there.

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing payment...</>
        ) : (
          <><Lock className="w-5 h-5" /> Pay ${amount.toFixed(2)} with Card</>
        )}
      </button>
    </form>
  );
}

export default function StripeCardCheckout({
  courseId,
  amount,
  onSuccess,
  onError,
}: {
  courseId: string;
  amount: number;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const res = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setSetupError(data.error || "Could not start card payment.");
        }
      } catch {
        if (!cancelled) setSetupError("Could not start card payment. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    start();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  if (setupError || !clientSecret) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
        {setupError || "Card payments are unavailable right now."}
      </div>
    );
  }

  return (
    <Elements
      stripe={getStripe()}
      options={{ clientSecret, appearance: { theme: "night" } }}
    >
      <CardForm amount={amount} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
