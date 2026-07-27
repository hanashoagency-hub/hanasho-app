"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, ArrowRight, BookOpen, BookMarked, Award, Video, CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useCart, type CartItemType } from "@/components/CartProvider";
import { checkPurchaseStatusAction } from "@/app/portal-live/actions";

const TYPE_ICON: Record<CartItemType, any> = {
  course: BookOpen,
  book: BookMarked,
  diploma: Award,
  zoom: Video,
};

const TYPE_HREF: Record<CartItemType, (id: string) => string> = {
  course: (id) => `/courses/${id}`,
  book: (id) => `/books/${id}`,
  diploma: (id) => `/diplomas/${id}`,
  zoom: (id) => `/live-classes/${id}`,
};

export default function CartPage() {
  const { items, removeItem } = useCart();
  const [user, setUser] = useState<any>(null);
  const [ownedKeys, setOwnedKeys] = useState<Set<string>>(new Set());
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const check = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser && items.length > 0) {
        const owned = new Set<string>();
        for (const item of items) {
          const res = await checkPurchaseStatusAction(currentUser.id, item.id);
          if (res?.purchased) owned.add(`${item.type}:${item.id}`);
        }
        setOwnedKeys(owned);
      }
      setCheckingOwnership(false);
    };
    check();
  }, [items.length]);

  const purchasableItems = items.filter((i) => !ownedKeys.has(`${i.type}:${i.id}`));
  const total = purchasableItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-transparent pt-32 pb-24 px-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-9 h-9 text-[var(--border-color)]" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">Your cart is empty</h1>
          <p className="text-[var(--text-secondary)] mb-8">Browse our courses and books to find something worth learning.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/courses" className="btn-primary py-3">Browse Courses</Link>
            <Link href="/books" className="btn-secondary py-3">Browse Books</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-[var(--brand-primary)]" /> Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const Icon = TYPE_ICON[item.type];
              const key = `${item.type}:${item.id}`;
              const owned = ownedKeys.has(key);

              return (
                <div key={key} className="flex items-center gap-4 p-4 rounded-[16px] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <div className="w-16 h-16 rounded-[12px] overflow-hidden bg-[var(--bg-primary)] border border-[var(--border-color)] flex-shrink-0 flex items-center justify-center">
                    {item.cover_image ? (
                      <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Icon className="w-6 h-6 text-[var(--text-secondary)]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link href={TYPE_HREF[item.type](item.id)} className="font-bold text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors truncate block">
                      {item.title}
                    </Link>
                    <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{item.type}</span>
                  </div>

                  {owned ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 flex-shrink-0">
                      <CheckCircle className="w-4 h-4" /> Already owned
                    </span>
                  ) : (
                    <span className="font-bold text-[var(--text-primary)] flex-shrink-0">${item.price}</span>
                  )}

                  <button
                    onClick={() => removeItem(item.id, item.type)}
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                    aria-label="Remove from cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6 sticky top-32">
              <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] mb-4">Order Summary</h2>

              {checkingOwnership ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[var(--text-secondary)]" /></div>
              ) : (
                <>
                  <div className="space-y-2 mb-4 pb-4 border-b border-[var(--border-color)] text-sm">
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Items ({purchasableItems.length})</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-[var(--text-primary)]">Total</span>
                    <span className="text-2xl font-bold text-[var(--text-primary)]">${total.toFixed(2)}</span>
                  </div>

                  {purchasableItems.length === 0 ? (
                    <p className="text-sm text-[var(--text-secondary)] text-center">You already own everything in your cart.</p>
                  ) : user ? (
                    <Link href="/checkout/cart" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                      Proceed to Checkout <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link href="/register?next=/checkout/cart" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                      Create Account to Checkout <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
