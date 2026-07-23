import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Award, CheckCircle, ArrowLeft, Clock, Zap, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 0;

export default async function DiplomaDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: diploma } = await supabase
    .from('diplomas')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!diploma) {
    return <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center font-heading text-2xl font-bold">Diploma not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans">
      <Header />

      <main className="pt-24 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
        <Link href="/diplomas" className="inline-flex items-center text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Diplomas
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Column: Details */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold text-xs mb-4 border border-[var(--brand-primary)]/20 uppercase tracking-wider">
              Hanhub Diploma
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-6 font-heading tracking-tight leading-tight">
              {diploma.title}
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed">
              {diploma.description}
            </p>

            <div className="space-y-4 mb-10">
              <h3 className="font-bold text-xl font-heading mb-4">What's included:</h3>
              {diploma.benefits ? diploma.benefits.split('\n').map((benefit: string, idx: number) => (
                benefit.trim() && (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] leading-relaxed">{benefit.trim()}</span>
                  </div>
                )
              )) : (
                <>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] leading-relaxed">Imtixaan iskugu jira su'aalo iyo gacan ka samayis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] leading-relaxed">Diploma caalami ah oo la aqoonsan yahay</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] leading-relaxed">Xirfado shaqada loogu talagalay (Industry-ready skills)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Pricing Tiers */}
          <div className="space-y-6">
            <h3 className="font-bold text-2xl font-heading mb-6">Choose your study pace:</h3>

            {/* Slow Tier */}
            <div className="rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 hover:border-[var(--brand-primary)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[var(--text-secondary)]" />
                  <h4 className="font-bold text-lg">Slow Diploma</h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black">${diploma.price_slow}</span>
                  <span className="text-[var(--text-secondary)] text-sm">/mo</span>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-6">Ideal for busy professionals. Learn at your own comfortable pace.</p>
              <Link href={`/checkout/${diploma.id}?type=diploma&tier=slow`} className="btn-secondary w-full py-3 block text-center">
                Enroll in Slow Pace
              </Link>
            </div>

            {/* Speedy Tier */}
            <div className="rounded-[24px] border-2 border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[var(--brand-primary)] text-[var(--on-brand)] text-xs font-bold px-3 py-1 rounded-bl-[16px]">
                RECOMMENDED
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[var(--brand-primary)]" />
                  <h4 className="font-bold text-lg text-[var(--brand-primary)]">Speedy Diploma</h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black">${diploma.price_speedy}</span>
                  <span className="text-[var(--text-secondary)] text-sm">/mo</span>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-6">Fast-track your learning and get certified in half the time.</p>
              <Link href={`/checkout/${diploma.id}?type=diploma&tier=speedy`} className="btn-primary w-full py-3 block text-center shadow-lg shadow-[var(--brand-primary)]/20">
                Enroll in Speedy Pace
              </Link>
            </div>

            {/* One Time Tier */}
            <div className="rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 hover:border-[var(--brand-primary)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <h4 className="font-bold text-lg">One-Time Payment</h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black">${diploma.price_onetime}</span>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-6">Pay once and get unlimited lifetime access to the diploma program.</p>
              <Link href={`/checkout/${diploma.id}?type=diploma&tier=onetime`} className="btn-secondary w-full py-3 block text-center">
                Pay One-Time
              </Link>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
