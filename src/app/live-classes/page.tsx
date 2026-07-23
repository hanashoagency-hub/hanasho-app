import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Video, Calendar, ArrowRight, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 0;

export default async function ZoomClassesPage() {
  const supabase = await createClient();
  const { data: classes } = await supabase
    .from('zoom_classes')
    .select('*')
    .eq('is_published', true)
    .order('start_date', { ascending: true });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold text-sm mb-6 border border-[var(--brand-primary)]/20">
          <Video className="w-4 h-4" />
          Hanhub Live Zoom Classes
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] mb-6 font-heading tracking-tight leading-tight">
          Master Skills Live
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
          Kusoo dhawaw Hurbad Live Classes oo aad ka helayso Courses mudo kooban si toos loogu qaadanayo Zoom Class. Ka xulo xirfada aad danaynayso iyo xiliga ay baxayaan. Si toos ah ayaa Eng Buzuri wax kuu barayaa, ee hada kusoo biir! Waa tiro kooban ardayda Live Classes ka ee yayna kaa buuxsamin ee hada <strong>HADA DALBO.</strong>
        </p>
      </section>

      {/* Classes List */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes && classes.length > 0 ? (
            classes.map((zoomClass) => (
              <div key={zoomClass.id} className="group flex flex-col rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden hover:border-[var(--brand-primary)] transition-all duration-300 shadow-sm">
                <div className="aspect-[16/9] w-full bg-[var(--bg-primary)] relative overflow-hidden">
                  {zoomClass.cover_image ? (
                    <img 
                      src={zoomClass.cover_image} 
                      alt={zoomClass.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-16 h-16 text-[var(--border-color)]" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-[var(--brand-primary)] px-3 py-1 rounded-full text-xs font-bold text-[var(--on-brand)] flex items-center gap-1.5 shadow-lg shadow-[var(--brand-primary)]/20">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    LIVE COHORT
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold font-heading mb-3 line-clamp-2">{zoomClass.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                    {zoomClass.description || "Master industry-leading certifications with live, interactive Zoom classes led by certified Professionals."}
                  </p>
                  
                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center text-sm text-[var(--text-secondary)]">
                      <Calendar className="w-4 h-4 mr-2 text-[var(--brand-primary)]" />
                      Starts: {new Date(zoomClass.start_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-[var(--text-secondary)]">
                      <Clock className="w-4 h-4 mr-2 text-[var(--brand-primary)]" />
                      {zoomClass.duration_weeks} Weeks - {zoomClass.schedule}
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-wider font-bold">One-Time Fee</p>
                      <p className="text-lg font-bold text-[var(--text-primary)]">${zoomClass.price}</p>
                    </div>
                    <Link 
                      href={`/live-classes/${zoomClass.id}`}
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
              <Video className="w-16 h-16 text-[var(--border-color)] mx-auto mb-4" />
              <h3 className="text-2xl font-bold font-heading mb-2">No Live Classes Scheduled</h3>
              <p className="text-[var(--text-secondary)]">We are currently preparing our upcoming live cohorts. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
