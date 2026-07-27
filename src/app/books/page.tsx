"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookMarked, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getPublicBooksAction, checkPurchaseStatusAction } from "@/app/portal-live/actions";

export default function BooksCatalogPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await getPublicBooksAction();
      if (res.success && res.data) {
        setBooks(res.data);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user && res.success && res.data) {
        const purchased = new Set<string>();
        for (const book of res.data) {
          const status = await checkPurchaseStatusAction(user.id, book.id);
          if (status?.purchased) purchased.add(book.id);
        }
        setPurchasedIds(purchased);
      }

      setLoading(false);
    };

    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-transparent pb-24 relative overflow-hidden">
      <div className="relative pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-[var(--text-primary)] mb-6 flex justify-center items-center gap-4">
            <BookMarked className="w-8 h-8 md:w-12 md:h-12 text-[var(--brand-primary)]" />
            Books
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Practical guides and playbooks to go deeper on AI, digital marketing, and building online — written to read in a weekend, not a semester.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--text-secondary)]" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px]">
            <BookMarked className="w-16 h-16 text-[var(--border-color)] mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">No Books Yet</h2>
            <p className="text-[var(--text-secondary)]">We are preparing our first titles. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {books.map((book) => (
              <div key={book.id} className="premium-card !p-0 flex flex-col overflow-hidden group">
                <div className="aspect-[2/3] relative overflow-hidden bg-[var(--bg-primary)] flex items-center justify-center border-b border-[var(--border-color)]">
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <BookMarked className="w-12 h-12 text-[var(--text-secondary)]" />
                  )}

                  <div className="absolute bottom-4 right-4 bg-[var(--bg-primary)] px-3 py-1 rounded-[10px] border border-[var(--border-color)] shadow-sm">
                    <span className="font-bold text-[var(--brand-primary)] text-sm">
                      {book.price > 0 ? `$${book.price}` : "FREE"}
                    </span>
                  </div>

                  {purchasedIds.has(book.id) && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Purchased
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] mb-1 line-clamp-2 leading-snug">{book.title}</h3>
                  {book.author && <p className="text-xs text-[var(--text-secondary)] mb-3">by {book.author}</p>}
                  <p className="text-sm text-[var(--text-secondary)] mb-6 line-clamp-2 flex-grow leading-relaxed">{book.description}</p>

                  <Link
                    href={`/books/${book.id}`}
                    className={`w-full py-2.5 px-4 flex items-center justify-center gap-2 rounded-[14px] font-bold text-sm transition-all ${purchasedIds.has(book.id) ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' : 'btn-primary'}`}
                  >
                    {purchasedIds.has(book.id) ? (<><CheckCircle className="w-4 h-4" /> View Book</>) : (<>View Details <ArrowRight className="w-4 h-4" /></>)}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
