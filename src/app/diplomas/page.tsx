import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { BookOpen, Award, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 0;

export default async function DiplomasPage() {
  const supabase = await createClient();
  const { data: diplomas } = await supabase
    .from('diplomas')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold text-sm mb-6 border border-[var(--brand-primary)]/20">
          <Award className="w-4 h-4" />
          Hanhub Diploma Program
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] mb-6 font-heading tracking-tight leading-tight">
          Hanhub Diploma
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
          Hanhub Diploma waa program aan ugu tala galnay in ay ardayda wax kabarata Hanhub ay kuqaataan Diploma caalami ah, taasoo aad ugalaysid imtixaan iskugu jira su'aalo iyo gacan ka samayis. Boggaan waxaad ka helaysaa wixii Diploma ah uu bixiyo Hanhub.
        </p>
      </section>

      {/* Diplomas List */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {diplomas && diplomas.length > 0 ? (
            diplomas.map((diploma) => (
              <div key={diploma.id} className="group flex flex-col rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden hover:border-[var(--brand-primary)] transition-all duration-300 shadow-sm hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.15)]">
                <div className="aspect-[4/3] w-full bg-[var(--bg-primary)] relative overflow-hidden">
                  {diploma.cover_image ? (
                    <img 
                      src={diploma.cover_image} 
                      alt={diploma.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Award className="w-16 h-16 text-[var(--border-color)]" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-[var(--bg-primary)]/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold border border-[var(--border-color)]">
                    {diploma.duration_months} Months
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold font-heading mb-3 line-clamp-2">{diploma.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                    {diploma.description || "Learn industry-leading skills and earn a globally recognized diploma."}
                  </p>
                  
                  <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-wider font-bold">Starts from</p>
                      <p className="text-lg font-bold text-[var(--brand-primary)]">${diploma.price_slow}/mo</p>
                    </div>
                    <Link 
                      href={`/diplomas/${diploma.id}`}
                      className="w-10 h-10 rounded-full bg-[var(--brand-primary)] text-[var(--on-brand)] flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-[var(--brand-primary)]/25"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <Award className="w-16 h-16 text-[var(--border-color)] mx-auto mb-4" />
              <h3 className="text-2xl font-bold font-heading mb-2">No Diplomas Available</h3>
              <p className="text-[var(--text-secondary)]">We are currently preparing our diploma programs. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
