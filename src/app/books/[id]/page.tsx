"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BookMarked, Loader2, ShoppingCart, Download, CheckCircle, User as UserIcon, Plus, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getPublicBookDetailsAction, checkPurchaseStatusAction } from "@/app/portal-live/actions";
import { useCart } from "@/components/CartProvider";

export default function BookDetailsPage() {
  const params = useParams();
  const bookId = params.id as string;
  const router = useRouter();
  const supabase = createClient();
  const { addItem, isInCart } = useCart();

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchBook = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      const res = await getPublicBookDetailsAction(bookId);
      if (res.success && res.book) {
        setBook(res.book);
      } else {
        router.push("/books");
        return;
      }

      if (currentUser) {
        const purchaseRes = await checkPurchaseStatusAction(currentUser.id, bookId);
        if (purchaseRes.purchased) setHasPurchased(true);
      }

      setLoading(false);
    };

    fetchBook();
  }, [bookId]);

  if (loading) return <div className="min-h-screen bg-transparent flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary)]" /></div>;
  if (!book) return <div className="min-h-screen bg-transparent flex items-center justify-center text-[var(--text-primary)]">Book not found.</div>;

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cover */}
        <div className="lg:col-span-1">
          <div className="aspect-[2/3] rounded-[20px] overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm sticky top-32">
            {book.cover_image ? (
              <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookMarked className="w-16 h-16 text-[var(--border-color)]" />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            {book.category && (
              <span className="inline-block text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider mb-3">{book.category}</span>
            )}
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-3 tracking-tight leading-tight text-[var(--text-primary)]">{book.title}</h1>
            {book.author && (
              <p className="flex items-center gap-2 text-[var(--text-secondary)]">
                <UserIcon className="w-4 h-4" /> {book.author}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 border-y border-[var(--border-color)] py-6">
            {hasPurchased ? (
              <a
                href={book.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary py-3"
              >
                <Download className="w-5 h-5 mr-2" /> Download Book
              </a>
            ) : user ? (
              <Link href={`/checkout/${bookId}?type=book`} className="btn-primary py-3">
                <ShoppingCart className="w-5 h-5 mr-2" /> Buy for ${book.price}
              </Link>
            ) : (
              <Link href={`/register?next=/checkout/${bookId}?type=book`} className="btn-primary py-3">
                <ShoppingCart className="w-5 h-5 mr-2" /> Create Account to Buy (${book.price})
              </Link>
            )}
            {!hasPurchased && (
              <button
                onClick={() => addItem({ id: bookId, type: 'book', title: book.title, price: Number(book.price), cover_image: book.cover_image })}
                disabled={isInCart(bookId, 'book')}
                className="flex items-center px-6 py-3 rounded-[20px] bg-[var(--bg-secondary)] border border-[var(--border-color)] transition-all font-bold hover:border-[var(--brand-primary)] disabled:opacity-60 disabled:cursor-default"
              >
                {isInCart(bookId, 'book') ? (
                  <><Check className="w-5 h-5 mr-2 text-green-400" /> In Cart</>
                ) : (
                  <><Plus className="w-5 h-5 mr-2 text-[var(--text-secondary)]" /> Add to Cart</>
                )}
              </button>
            )}
          </div>

          <div className="prose prose-invert max-w-none">
            <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
              <BookMarked className="w-5 h-5 mr-2 text-[var(--brand-primary)]" />
              About this book
            </h3>
            <div className="text-[var(--text-secondary)] space-y-4 text-base md:text-lg leading-relaxed">
              <p>{book.description}</p>

              {book.benefits && (
                <div className="mt-8">
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">What you will get:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {book.benefits.split('\n').map((b: string, i: number) => (
                      b.trim() && <li key={i}>{b.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {hasPurchased && (
            <div className="flex items-center gap-2 text-green-400 text-sm font-bold bg-green-500/10 border border-green-500/20 rounded-[14px] px-4 py-3">
              <CheckCircle className="w-4 h-4" /> You own this book — the download link above is yours for good.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
