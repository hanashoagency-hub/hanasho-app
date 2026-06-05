"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, Sparkles, Code, Terminal, Brain, TrendingUp, 
  Users, Star, CheckCircle, ChevronDown, MessageSquare, Layout 
} from "lucide-react";

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showRedWin, setShowRedWin] = useState(false);
  const [drops, setDrops] = useState<Array<{id: number, left: string, duration: string, delay: string}>>([]);

  useEffect(() => {
    setDrops(
      Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${Math.random() * 1 + 0.8}s`,
        delay: `${Math.random() * 2}s`,
      }))
    );

    const interval = setInterval(() => {
      setShowRedWin((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">
      {/* Global Glow Orbs - lightweight */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/[0.03] blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/[0.03] blur-[80px] rounded-full pointer-events-none" />

      {/* Rain Animation */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {drops.map((drop) => (
          <div
            key={drop.id}
            className="absolute top-0 w-[1px] h-[60px] bg-gradient-to-b from-transparent to-white/20 animate-rain"
            style={{
              left: drop.left,
              animationDuration: drop.duration,
              animationDelay: drop.delay,
            }}
          />
        ))}
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center text-center">
        {/* Removed Badge */}

        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-white max-w-5xl leading-tight text-center mx-auto mb-6 relative z-10 flex flex-wrap justify-center items-center gap-x-3 md:gap-x-5">
          <span className="text-gradient animate-shimmer drop-shadow-[0_0_30px_rgba(217,217,217,0.15)]">
            If you have skill you either
          </span>
          <div className="relative inline-flex items-center justify-start min-w-[3em]">
            <span 
              className={`absolute left-0 whitespace-nowrap text-gradient animate-shimmer drop-shadow-[0_0_30px_rgba(217,217,217,0.15)] transition-all duration-500 will-change-transform ${
                showRedWin ? "opacity-0 scale-95 pointer-events-none blur-sm" : "opacity-100 scale-100 blur-0"
              }`}
            >
              win or ...
            </span>
            <span 
              className={`absolute left-0 whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-red-600 bg-[length:200%_auto] animate-shimmer drop-shadow-[0_0_40px_rgba(239,68,68,0.8)] transition-all duration-500 will-change-transform ${
                showRedWin ? "opacity-100 scale-110 blur-0" : "opacity-0 scale-95 pointer-events-none blur-sm"
              }`}
            >
              win !
            </span>
            {/* Invisible placeholder to maintain width */}
            <span className="opacity-0 pointer-events-none whitespace-nowrap">win or ...</span>
          </div>
        </h1>

        <p className="mt-8 max-w-2xl text-lg text-white/60 md:text-xl leading-relaxed">
          Baro xirfadaha ugu baahida badan aduunka. Laga soo bilaabo AI iyo Web3 ilaa 
          Digital Marketing iyo Freelancing, dhamaantoodna waxaa lagu dhigaa Af-Soomaali.
        </p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 py-4 font-heading font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            <span className="relative z-10">Bilow Maanta</span>
            <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-gray-200 to-white opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          <Link
            href="/courses"
            className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 font-heading font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10 hover:border-white/20"
          >
            Arag Koorsooyinka
          </Link>
        </div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="border-y border-white/10 bg-white/5 py-12 backdrop-blur-sm relative z-10">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 gap-8 md:grid-cols-4 divide-x divide-white/10 text-center">
          <div>
            <h3 className="text-4xl font-extrabold text-white mb-2 tracking-tight">5,000+</h3>
            <p className="text-sm font-medium text-white/50 uppercase tracking-widest">Ardayda Diiwaangashan</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-white mb-2 tracking-tight">12+</h3>
            <p className="text-sm font-medium text-white/50 uppercase tracking-widest">Koorsooyin Premium Ah</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-white mb-2 tracking-tight">24/7</h3>
            <p className="text-sm font-medium text-white/50 uppercase tracking-widest">Caawimaad AI Ah</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-white mb-2 tracking-tight">94%</h3>
            <p className="text-sm font-medium text-white/50 uppercase tracking-widest">Heerka Guusha</p>
          </div>
        </div>
      </section>

      {/* ================= COURSE PREVIEW SECTION ================= */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-white md:text-5xl mb-4">
              Baro Xirfadaha Berito
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Koorsooyinkeena waxaa loo qaabeeyey inay si toos ah kaaga caawiyaan sidii aad 
              dakhli online ah u abuuri lahayd adigoo adeegsanaya teknoolojiyadda cusub.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "AI & Automations", desc: "Baro sida AI loogu isticmaalo shaqooyinka", icon: Brain, color: "from-[#D9D9D9]/30 to-white/20" },
              { title: "Web3 & Crypto", desc: "Fahamka blockchain iyo maalgashiga", icon: Code, color: "from-[#888888]/30 to-[#D9D9D9]/20" },
              { title: "Digital Marketing", desc: "Suuqgeynta casriga ah ee internetka", icon: TrendingUp, color: "from-[#555555]/30 to-[#888888]/20" },
            ].map((course, i) => (
              <div key={i} className="group relative rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                <div className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br ${course.color} p-4 shadow-lg`}>
                  <course.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-heading text-2xl font-semibold text-white mb-3">
                  {course.title}
                </h3>
                <p className="text-white/50 mb-6 leading-relaxed">
                  {course.desc}
                </p>
                <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-[#D9D9D9] group-hover:text-white">
                  Arag faahfaahinta <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 mb-12">
            <Link href="/courses" className="inline-block border-b border-white/30 text-white/70 pb-1 hover:text-white hover:border-white transition-colors">
              Arag Koorsooyinka oo dhan
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SERVICES SECTION ================= */}
      <section className="py-24 px-6 relative border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-white md:text-5xl mb-4">
              Adeegeena (Our Services)
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Waxaan dhisnaa nidaamyo casri ah oo kor u qaadaya ganacsigaaga adigoo adeegsanaya teknoolojiyaddii ugu dambeysay.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              { title: "Web Pages", desc: "Waxaan dhisnaa bogag internet oo qurux badan, degdeg ah, isla markaana leh tayo sare.", icon: Layout },
              { title: "SaaS Products", desc: "Waxaan abuurnaa barnaamijyo iyo adeegyo SaaS oo si fudud loo isticmaali karo.", icon: Code },
              { title: "AI Powered Solutions", desc: "Nidaamyo caqli macmal ah (AI) oo xaliya caqabadaha ganacsigaaga.", icon: Brain },
              { title: "AI Automations", desc: "Waxaan iswadaa shaqooyinkaaga adigoo isticmaalaya automation-ka AI ee ugu dambeeyay.", icon: Terminal },
            ].map((service, i) => (
              <div key={i} className="group relative rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 transition-all hover:bg-white/5 hover:border-white/20 hover:-translate-y-2">
                <div className="mb-6 inline-flex rounded-2xl bg-white/5 border border-white/10 p-4 shadow-lg text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <service.icon className="h-8 w-8" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-white/50 leading-relaxed text-sm">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ROADMAP SECTION ================= */}
      <section className="py-24 px-6 relative">
        <div className="absolute top-1/2 left-0 w-[200px] h-[200px] bg-white/[0.03] blur-[60px] rounded-full pointer-events-none" />
        
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="font-heading text-3xl font-bold text-white md:text-5xl mb-4">
            Khariidadda Guushaada
          </h2>
          <p className="text-white/50">
            Hage tillaabo-tillaabo ah oo ku geynaya heerka ugu sarreeya ee xirfadaha digital-ka.
          </p>
        </div>

        <div className="mx-auto max-w-3xl relative">
          <div className="absolute left-[28px] top-4 bottom-4 w-px bg-gradient-to-b from-[#D9D9D9] via-[#888888] to-[#555555] md:left-1/2 md:-ml-[1px]" />

          {[
            { step: "01", title: "Asaasiga", desc: "Fahamka internetka iyo hababka lacag sameynta online-ka ah. Sameynta maskaxda ganacsade." },
            { step: "02", title: "Xirfadda", desc: "Barashada hal xirfad oo muhiim ah (sida AI, Suuqgeyn, ama Crypto) adigoo qaadanaya koorsooyinkeena qoto-dheer." },
            { step: "03", title: "Ku Dhaqanka", desc: "Isticmaalka madasha Community-geena si aad ula wadaagto mashruucyadaada ardayda kale." },
            { step: "04", title: "Guusha", desc: "Inaad hesho macmiilkaagii ugu horreeyey ama dakhligaagii ugu horreeyey ee internetka." },
          ].map((item, i) => (
            <div key={i} className={`relative flex items-center mb-12 ${i % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"} flex-row`}>
              <div className="hidden md:block md:w-1/2" />
              <div className="absolute left-0 md:left-1/2 flex h-14 w-14 -ml-[2px] md:-ml-7 items-center justify-center rounded-full border-4 border-[#050505] bg-gradient-to-br from-[#D9D9D9]/40 to-white/20 font-bold text-white shadow-[0_0_20px_rgba(217,217,217,0.3)] z-10">
                {item.step}
              </div>
              <div className={`w-full pl-20 md:w-1/2 ${i % 2 === 0 ? "md:pl-0 md:pr-12 text-left md:text-right" : "md:pl-12 text-left"}`}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
                  <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-white/50">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= AI SHOWCASE ================= */}
      <section className="py-24 px-6 border-y border-white/10 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/[0.03] blur-[60px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="md:w-1/2 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 mb-6">
              <span className="text-sm font-medium text-[#D9D9D9]">Xirfadle AI Barahaaga</span>
            </div>
            <h2 className="font-heading text-3xl font-bold text-white md:text-5xl mb-6 leading-tight">
              Macalin Khaas Ah Oo Kula Jooga <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F5F5] to-[#D9D9D9]">Mar Kasta</span>
            </h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              La kulan Xirfadle AI — Waa caawiyahaaga gaarka ah oo si buuxda ugu hadla Af-Soomaali. 
              Wuxuu kaa caawinayaa fahamka casharada, wuxuu kaaga jawaabayaa su'aalahaaga, wuxuuna ku 
              hagi doonaa wadada saxda ah 24/7.
            </p>
            <ul className="space-y-4 mb-10">
              {["Jawaabo degdeg ah oo Af-Soomaali ah", "Sharaxaadda koodhka iyo casharada adag", "Talooyin ganacsi iyo hagid toos ah"].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#D9D9D9]" />
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:w-1/2 w-full">
            <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur-xl shadow-2xl relative">
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/30" />
                <div className="w-3 h-3 rounded-full bg-white/40" />
              </div>
              <div className="mt-8 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
                  <div className="bg-white/5 rounded-2xl p-4 text-sm text-white/80 border border-white/5 rounded-tl-none">
                    Sidee baan u bilaabi karaa barashada Artificial Intelligence?
                  </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#333] to-[#555] flex-shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(217,217,217,0.3)]">
                    <span className="text-xs font-bold text-white">X</span>
                  </div>
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 text-sm text-white border border-white/10 rounded-tr-none">
                    Tilaabada ugu horreysa waa inaad fahanto aasaaska. Waxaad ka bilaabi kartaa koorsadeena "AI Automations" oo ku tusi doonta sida qalabka AI loogu isticmaalo nolol maalmeedkaaga...
                  </div>
                </div>
              </div>
              
              {/* Floating Input mockup */}
              <div className="mt-6 flex gap-3 border-t border-white/10 pt-4">
                <div className="flex-1 bg-white/5 rounded-full px-4 py-2 border border-white/10 flex items-center">
                  <span className="text-white/30 text-sm">Ku qor su'aashaada...</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-black" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-white md:text-5xl mb-4">
              Ardaydeenu Waxay Dhiheen
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Ma nihin kaliya platform waxbarasho, waxaan nahay bulsho is caawisa oo 
              u heellan inay guuleystaan.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Ahmed Ali", role: "AI Automation Agency", text: "Xirfadify waxay gebi ahaanba beddeshay noloshayda. Intaanan ku biirin, ma aanan garaneyn sida AI looga sameeyo lacag." },
              { name: "Fadumo Hussein", role: "Freelance Designer", text: "Koorsooyinka waa kuwo tayo sare leh oo aad u fudud in la fahmo. Community-ga ayaa ugu sii wacan oo aad caawimaad ka heleysaa." },
              { name: "Omar Yasin", role: "Crypto Trader", text: "Xirfadle AI wuxuu ii ahaa macalin aan mar walba su'aal weydiin karo. Aad baan ugu riyaaqay qaabka wax loo dhigo halkan." },
            ].map((t, i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-8 relative overflow-hidden backdrop-blur-sm">
                <div className="flex text-[#D9D9D9] mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-white/80 mb-6 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#333] to-[#555] flex items-center justify-center font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">{t.name}</h5>
                    <p className="text-xs text-white/50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl mb-4">
              Su'aalaha Inta Badan La Isweydiiyo
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "Ma u baahanahay aqoon hore si aan ugu biiro?", a: "Maya, koorsooyinkeena waxaa loogu talagalay dadka bilowga ah ilaa heerka sare. Tillaabo-tillaabo ayaan kuu hageynaa." },
              { q: "Koorsooyinka ma Af-Soomaali baa lagu bixiyaa?", a: "Haa, dhammaan koorsooyinkeena, muuqalada, iyo chatbot-ka AI intuba waxay si buuxda ugu baxaan Af-Soomaali cad." },
              { q: "Lacag intee le'eg ayaan u baahanahay si aan wax u barto?", a: "Is-diiwaangelinta waa lacag la'aan, waxaadna geli kartaa qaar ka mid ah casharada hordhaca ah. Si aad koorsooyinka buuxa u hesho, waxaa jira xirmooyin qiimo jaban ah." },
              { q: "Sidee baan ugu biiri karaa Community-ga?", a: "Marka aad sameysato akoon, waxaad si toos ah uga mid noqoneysaa Community-ga Xirfadify oo aad la falgeli karto ardayda kale." },
            ].map((faq, i) => (
              <div 
                key={i} 
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${activeFaq === i ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
              >
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-white' : ''}`} />
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-white/60">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MODERN CTA ================= */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-white/[0.03] to-transparent pointer-events-none" />
        
        <div className="mx-auto max-w-5xl rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-12 text-center relative overflow-hidden backdrop-blur-xl shadow-[0_0_100px_rgba(217,217,217,0.08)]">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/[0.03] blur-[40px] rounded-full pointer-events-none" />
          
          <h2 className="relative z-10 font-heading text-4xl font-extrabold text-white md:text-6xl mb-6">
            Diyaar Ma U Tahay Inaad <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F5F5] to-[#D9D9D9]">
              Beddesho Noloshaada?
            </span>
          </h2>
          <p className="relative z-10 text-lg text-white/60 mb-10 max-w-2xl mx-auto">
            Ku biir kumannaan dhalinyaro Soomaaliyeed ah oo baranaya xirfadaha 
            mustaqbalka, abuurayana ilo dakhli oo cusub.
          </p>
          
          <Link
            href="/register"
            className="relative z-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-10 py-5 font-heading text-lg font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
          >
            Is Diiwaangeli Hadda <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
      {/* ================= ABOUT FOUNDER SECTION ================= */}
      <section id="about" className="py-24 px-6 relative border-t border-white/10 bg-[#050505]">
        <div className="absolute top-1/2 right-0 w-[200px] h-[200px] bg-white/[0.03] blur-[60px] rounded-full pointer-events-none" />
        
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/5 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <img 
                src="/assets/founder.jpg" 
                alt="Eng Buzuri" 
                className="relative w-72 h-72 md:w-96 md:h-96 object-cover rounded-full border-4 border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)] grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <span className="inline-block px-3 py-1 mb-4 rounded-full bg-white/10 text-[#D9D9D9] text-xs font-bold tracking-wider uppercase border border-white/20">
              Founder & CEO
            </span>
            <h2 className="font-heading text-3xl font-bold text-white md:text-5xl mb-4">
              Mohamed Aweis Mohamed
            </h2>
            <p className="text-xl text-white/80 font-medium mb-6">
              Known as <span className="text-white font-bold">Eng Buzuri</span> (sometimes Ryder)
            </p>
            <p className="text-white/60 leading-relaxed text-lg mb-8 max-w-xl mx-auto md:mx-0">
              The founder of hanasho.io. He is a Software Engineer, AI & Technology Expert dedicated to empowering Somali youth with cutting-edge technology and innovation.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <Link href="https://buzuri.com" target="_blank" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-heading font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10 hover:border-white/20">
                Booqo Buzuri.com
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
