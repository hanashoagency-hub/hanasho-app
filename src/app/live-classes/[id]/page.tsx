import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Video, ArrowLeft, Calendar, Clock, MonitorPlay, Users, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 0;

export default async function ZoomClassDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: zoomClass } = await supabase
    .from('zoom_classes')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!zoomClass) {
    return <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center font-heading text-2xl font-bold">Class not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans">
      <Header />

      <main className="pt-24 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
        <Link href="/live-classes" className="inline-flex items-center text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Live Classes
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Details (Takes up 2 cols on large screens) */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold text-xs mb-4 border border-[var(--brand-primary)]/20 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse"></span>
                LIVE COHORT
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-6 font-heading tracking-tight leading-tight">
                {zoomClass.title}
              </h1>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                {zoomClass.description}
              </p>
            </div>

            {zoomClass.cover_image && (
              <div className="w-full aspect-video rounded-[24px] overflow-hidden border border-[var(--border-color)]">
                <img src={zoomClass.cover_image} alt={zoomClass.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-4 pt-6 border-t border-[var(--border-color)]">
              <h3 className="font-bold text-2xl font-heading mb-6">Why Join This Live Class?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-[20px]">
                  <MonitorPlay className="w-8 h-8 text-[var(--brand-primary)] mb-3" />
                  <h4 className="font-bold text-lg mb-2">Live Instruction</h4>
                  <p className="text-sm text-[var(--text-secondary)]">Learn directly from industry experts in real-time. Ask questions and get immediate feedback.</p>
                </div>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-[20px]">
                  <Users className="w-8 h-8 text-[var(--brand-primary)] mb-3" />
                  <h4 className="font-bold text-lg mb-2">Cohort Based</h4>
                  <p className="text-sm text-[var(--text-secondary)]">Learn alongside a community of driven peers. Network and collaborate on projects.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Enrollment Card */}
          <div className="relative">
            <div className="sticky top-28 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-2xl">
              <h3 className="font-bold text-2xl mb-6">Enrollment Open</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-color)]">
                  <Calendar className="w-5 h-5 text-[var(--text-secondary)]" />
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">Start Date</p>
                    <p className="font-bold">{new Date(zoomClass.start_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-color)]">
                  <Clock className="w-5 h-5 text-[var(--text-secondary)]" />
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">Schedule & Duration</p>
                    <p className="font-bold">{zoomClass.schedule}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{zoomClass.duration_weeks} Weeks Total</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[var(--text-secondary)]">Total Fee</span>
                  <span className="text-3xl font-black">${zoomClass.price}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" /> One-time payment. No hidden fees.
                </p>
              </div>

              <Link href={`/checkout/${zoomClass.id}?type=zoom`} className="btn-primary w-full py-4 text-lg shadow-[var(--brand-primary)]/20 shadow-xl text-center block">
                Secure Your Spot Now
              </Link>
              
              <p className="text-center text-xs text-[var(--text-secondary)] mt-4">
                Seats are extremely limited.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
