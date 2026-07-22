"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, Code, Terminal, Brain, TrendingUp, 
  CheckCircle, ChevronDown, MessageSquare, Layout 
} from "lucide-react";

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)]">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center text-center">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-5xl leading-tight text-center mx-auto mb-6 relative z-10">
          Baro xirfadaha<br />
          <span className="text-[var(--brand-primary)]">
            mustaqbalka.
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg text-[var(--text-secondary)] md:text-xl leading-relaxed">
          Baro xirfadaha ugu baahida badan aduunka. Laga soo bilaabo AI iyo Web3 ilaa 
          Digital Marketing iyo Freelancing, dhamaantoodna waxaa lagu dhigaa Af-Soomaali.
        </p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="btn-primary"
          >
            Bilow Maanta <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/courses"
            className="btn-secondary"
          >
            Arag Koorsooyinka
          </Link>
        </div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="border-y border-[var(--border-color)] bg-[var(--bg-secondary)] py-12 relative z-10">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 gap-8 md:grid-cols-4 divide-x divide-[var(--border-color)] text-center">
          <div>
            <h3 className="text-4xl font-extrabold text-[var(--text-primary)] mb-2 font-heading tracking-tight">5,000+</h3>
            <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Ardayda Diiwaangashan</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-[var(--text-primary)] mb-2 font-heading tracking-tight">12+</h3>
            <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Koorsooyin Premium Ah</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-[var(--text-primary)] mb-2 font-heading tracking-tight">24/7</h3>
            <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Caawimaad AI Ah</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-[var(--text-primary)] mb-2 font-heading tracking-tight">94%</h3>
            <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Heerka Guusha</p>
          </div>
        </div>
      </section>

      {/* ================= COURSE PREVIEW SECTION ================= */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] md:text-5xl mb-4">
              Baro Xirfadaha Berito
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
              Koorsooyinkeena waxaa loo qaabeeyey inay si toos ah kaaga caawiyaan sidii aad 
              dakhli online ah u abuuri lahayd adigoo adeegsanaya teknoolojiyadda cusub.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "AI & Automations", desc: "Baro sida AI loogu isticmaalo shaqooyinka", icon: Brain },
              { title: "Web3 & Crypto", desc: "Fahamka blockchain iyo maalgashiga", icon: Code },
              { title: "Digital Marketing", desc: "Suuqgeynta casriga ah ee internetka", icon: TrendingUp },
            ].map((course, i) => (
              <div key={i} className="premium-card group">
                <div className="mb-6 inline-flex rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-4">
                  <course.icon className="h-8 w-8 text-[var(--brand-primary)]" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-3">
                  {course.title}
                </h3>
                <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                  {course.desc}
                </p>
                <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-primary)] group-hover:text-[var(--brand-hover)]">
                  Arag faahfaahinta <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 mb-12">
            <Link href="/courses" className="inline-block font-bold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors">
              Arag Koorsooyinka oo dhan &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SERVICES SECTION ================= */}
      <section className="py-24 px-6 relative border-y border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] md:text-5xl mb-4">
              Adeegeena (Our Services)
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
              Waxaan dhisnaa nidaamyo casri ah oo kor u qaadaya ganacsigaaga adigoo adeegsanaya teknoolojiyaddii ugu dambeysay.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              { title: "Web Pages", desc: "Waxaan dhisnaa bogag internet oo qurux badan, degdeg ah, isla markaana leh tayo sare.", icon: Layout },
              { title: "SaaS Products", desc: "Waxaan abuurnaa barnaamijyo iyo adeegyo SaaS oo si fudud loo isticmaali karo.", icon: Code },
              { title: "AI Solutions", desc: "Nidaamyo caqli macmal ah (AI) oo xaliya caqabadaha ganacsigaaga.", icon: Brain },
              { title: "Automations", desc: "Waxaan iswadaa shaqooyinkaaga adigoo isticmaalaya automation-ka AI ee ugu dambeeyay.", icon: Terminal },
            ].map((service, i) => (
              <div key={i} className="premium-card">
                <div className="mb-6 inline-flex rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 text-[var(--brand-primary)]">
                  <service.icon className="h-8 w-8" />
                </div>
                <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-3">
                  {service.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ROADMAP SECTION ================= */}
      <section className="py-24 px-6 relative">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] md:text-5xl mb-4">
            Khariidadda Guushaada
          </h2>
          <p className="text-[var(--text-secondary)] text-lg">
            Hage tillaabo-tillaabo ah oo ku geynaya heerka ugu sarreeya ee xirfadaha digital-ka.
          </p>
        </div>

        <div className="mx-auto max-w-3xl relative">
          <div className="absolute left-[28px] top-4 bottom-4 w-px bg-[var(--border-color)] md:left-1/2 md:-ml-[1px]" />

          {[
            { step: "01", title: "Asaasiga", desc: "Fahamka internetka iyo hababka lacag sameynta online-ka ah. Sameynta maskaxda ganacsade." },
            { step: "02", title: "Xirfadda", desc: "Barashada hal xirfad oo muhiim ah (sida AI, Suuqgeyn, ama Crypto) adigoo qaadanaya koorsooyinkeena qoto-dheer." },
            { step: "03", title: "Ku Dhaqanka", desc: "Isticmaalka madasha Community-geena si aad ula wadaagto mashruucyadaada ardayda kale." },
            { step: "04", title: "Guusha", desc: "Inaad hesho macmiilkaagii ugu horreeyey ama dakhligaagii ugu horreeyey ee internetka." },
          ].map((item, i) => (
            <div key={i} className={`relative flex items-center mb-12 ${i % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"} flex-row`}>
              <div className="hidden md:block md:w-1/2" />
              <div className="absolute left-0 md:left-1/2 flex h-14 w-14 -ml-[2px] md:-ml-7 items-center justify-center rounded-full border-4 border-[var(--bg-primary)] bg-[var(--bg-secondary)] font-bold text-[var(--brand-primary)] z-10 shadow-sm">
                {item.step}
              </div>
              <div className={`w-full pl-20 md:w-1/2 ${i % 2 === 0 ? "md:pl-0 md:pr-12 text-left md:text-right" : "md:pl-12 text-left"}`}>
                <div className="premium-card p-6">
                  <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-heading">{item.title}</h4>
                  <p className="text-[var(--text-secondary)]">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= AI SHOWCASE ================= */}
      <section className="py-24 px-6 border-y border-[var(--border-color)] bg-[var(--bg-secondary)] relative">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="md:w-1/2 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2 mb-6">
              <span className="text-sm font-bold text-[var(--brand-primary)] uppercase tracking-wider">Xirfadle AI Barahaaga</span>
            </div>
            <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] md:text-5xl mb-6 leading-tight">
              Macalin Khaas Ah Oo Kula Jooga Mar Kasta
            </h2>
            <p className="text-[var(--text-secondary)] text-lg mb-8 leading-relaxed">
              La kulan Xirfadle AI — Waa caawiyahaaga gaarka ah oo si buuxda ugu hadla Af-Soomaali. 
              Wuxuu kaa caawinayaa fahamka casharada, wuxuu kaaga jawaabayaa su'aalahaaga, wuxuuna ku 
              hagi doonaa wadada saxda ah 24/7.
            </p>
            <ul className="space-y-4 mb-10">
              {["Jawaabo degdeg ah oo Af-Soomaali ah", "Sharaxaadda koodhka iyo casharada adag", "Talooyin ganacsi iyo hagid toos ah"].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[var(--brand-primary)]" />
                  <span className="text-[var(--text-primary)]">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:w-1/2 w-full">
            <div className="rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 shadow-xl">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-[var(--border-color)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--border-color)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--border-color)]" />
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex-shrink-0" />
                  <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 text-sm text-[var(--text-primary)] rounded-tl-none border border-[var(--border-color)]">
                    Sidee baan u bilaabi karaa barashada Artificial Intelligence?
                  </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#071E16]">X</span>
                  </div>
                  <div className="bg-[var(--brand-primary)] rounded-2xl p-4 text-sm text-[#071E16] rounded-tr-none">
                    Tilaabada ugu horreysa waa inaad fahanto aasaaska. Waxaad ka bilaabi kartaa koorsadeena "AI Automations" oo ku tusi doonta sida qalabka AI loogu isticmaalo nolol maalmeedkaaga...
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3 border-t border-[var(--border-color)] pt-4">
                <div className="flex-1 bg-[var(--bg-secondary)] rounded-[12px] px-4 py-2 border border-[var(--border-color)] flex items-center">
                  <span className="text-[var(--text-secondary)] text-sm">Ku qor su'aashaada...</span>
                </div>
                <div className="w-10 h-10 rounded-[12px] bg-[var(--brand-primary)] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-[#071E16]" />
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
            <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] md:text-5xl mb-4">
              Ardaydeenu Waxay Dhiheen
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
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
              <div key={i} className="premium-card">
                <p className="text-[var(--text-primary)] mb-8 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-4 border-t border-[var(--border-color)] pt-6">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center font-bold text-[var(--brand-primary)]">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[var(--text-primary)]">{t.name}</h5>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="py-24 px-6 border-t border-[var(--border-color)]">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] md:text-4xl mb-4">
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
                className={`rounded-[16px] border transition-all duration-300 overflow-hidden ${activeFaq === i ? 'border-[var(--brand-primary)] bg-[var(--bg-secondary)]' : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-secondary)]'}`}
              >
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold text-[var(--text-primary)]">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-[var(--brand-primary)]' : ''}`} />
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MODERN CTA ================= */}
      <section className="py-24 px-6 relative overflow-hidden bg-[var(--bg-secondary)] border-y border-[var(--border-color)]">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-heading text-4xl font-extrabold text-[var(--text-primary)] md:text-6xl mb-6">
            Diyaar Ma U Tahay Inaad <br className="hidden md:block" />
            <span className="text-[var(--brand-primary)]">
              Beddesho Noloshaada?
            </span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
            Ku biir kumannaan dhalinyaro Soomaaliyeed ah oo baranaya xirfadaha 
            mustaqbalka, abuurayana ilo dakhli oo cusub.
          </p>
          
          <Link
            href="/register"
            className="btn-primary inline-flex"
          >
            Is Diiwaangeli Hadda <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
      
      {/* ================= ABOUT FOUNDER SECTION ================= */}
      <section id="about" className="py-24 px-6 relative bg-[var(--bg-primary)]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="/assets/founder.jpg" 
              alt="Eng Buzuri" 
              className="w-72 h-72 md:w-96 md:h-96 object-cover rounded-[24px] border border-[var(--border-color)] shadow-sm"
            />
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <span className="inline-block px-4 py-2 mb-6 rounded-full bg-[var(--bg-secondary)] text-[var(--brand-primary)] text-xs font-bold tracking-wider uppercase border border-[var(--border-color)]">
              Founder & CEO
            </span>
            <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] md:text-5xl mb-4">
              Mohamed Aweis Mohamed
            </h2>
            <p className="text-xl text-[var(--text-secondary)] font-medium mb-6">
              Known as <span className="text-[var(--text-primary)] font-bold">Eng Buzuri</span> (sometimes Ryder)
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed text-lg mb-8 max-w-xl mx-auto md:mx-0">
              The founder of hanasho.io. He is a Software Engineer, AI & Technology Expert dedicated to empowering Somali youth with cutting-edge technology and innovation.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <Link href="https://buzuri.com" target="_blank" className="btn-secondary">
                Booqo Buzuri.com
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
