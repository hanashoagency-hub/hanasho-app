import Link from "next/link";
import {
  ArrowRight,
  Target,
  Eye,
  Sparkles,
  ShieldCheck,
  Rocket,
  GraduationCap,
  Building2,
  Brain,
  TrendingUp,
  Code,
  Globe2,
} from "lucide-react";

export const metadata = {
  title: "About Us — Hanhub.so",
  description:
    "HanHub.so is Somalia's first modern digital academy, operating under Hanasho LTD, equipping the next generation of Somali innovators with in-demand digital skills.",
};

export default function AboutPage() {
  const teachAreas = [
    { title: "Artificial Intelligence", icon: Brain },
    { title: "Digital Marketing", icon: TrendingUp },
    { title: "Freelancing", icon: Rocket },
    { title: "E-commerce", icon: Globe2 },
    { title: "Web3 & Cryptocurrency", icon: Sparkles },
    { title: "Graphic Design", icon: Sparkles },
    { title: "Web Development", icon: Code },
    { title: "Content Creation", icon: GraduationCap },
  ];

  const whyHanhub = [
    {
      title: "Practical, Hands-On Training",
      desc: "Every program is built around real projects, not just theory — so you graduate with work you can show, not just a certificate.",
      icon: Target,
    },
    {
      title: "Built for Somali Learners",
      desc: "Courses, community, and support are delivered in Af-Soomaali, removing the language barrier that keeps talent from reaching global opportunity.",
      icon: GraduationCap,
    },
    {
      title: "A Community, Not Just a Platform",
      desc: "Students learn alongside a bulsho of peers, mentors, and alumni who share opportunities and hold each other accountable.",
      icon: Eye,
    },
  ];

  return (
    <div className="relative min-h-screen bg-transparent">
      {/* ================= HERO ================= */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-24 px-6 flex flex-col items-center justify-center text-center">
        <span className="inline-block px-4 py-2 mb-6 rounded-full bg-[var(--bg-secondary)] text-[var(--brand-primary)] text-xs font-bold tracking-wider uppercase border border-[var(--border-color)]">
          About HanHub
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-4xl leading-tight mx-auto mb-6">
          Somalia's First Modern <span className="text-[var(--brand-primary)]">Digital Academy</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--text-secondary)] md:text-xl leading-relaxed">
          Bringing the world's most in-demand digital skills together under one platform —
          for innovators, entrepreneurs, freelancers, and professionals across Somalia.
        </p>
      </section>

      {/* ================= OUR STORY ================= */}
      <section className="py-20 px-6 relative z-10">
        <div className="mx-auto max-w-5xl">
          <div className="premium-card md:p-12">
            <div className="mb-6 inline-flex rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-4">
              <Rocket className="h-8 w-8 text-[var(--brand-primary)]" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
              Our Story
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
              HanHub.so is Somalia's first modern digital academy dedicated to bringing the world's
              most in-demand digital skills together under one platform. Our mission is to equip the
              next generation of Somali innovators, entrepreneurs, freelancers, and professionals with
              practical, industry-ready knowledge that creates real opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* ================= MEET THE FOUNDER ================= */}
      <section className="py-20 px-6 relative z-10 border-y border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/3">
              <div className="relative rounded-2xl overflow-hidden border-2 border-[var(--brand-primary)] shadow-2xl">
                <img 
                  src="/assets/founder.jpeg" 
                  alt="Founder of HanHub" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
                Meet the Founder
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed text-lg mb-6">
                HanHub was founded with a singular vision: to empower the Somali youth with the digital skills necessary to thrive in a globalized world. After seeing the immense potential of our people being hindered by language barriers and a lack of structured, accessible education, HanHub was created as a bridge to those opportunities.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
                "Our goal is not just to teach skills, but to build a community of innovators who will shape the future of the digital economy."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MISSION & VISION ================= */}
      <section className="py-20 px-6 relative border-y border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl grid gap-6 md:grid-cols-2">
          <div className="premium-card !bg-[var(--bg-primary)]">
            <div className="mb-6 inline-flex rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4">
              <Target className="h-8 w-8 text-[var(--brand-primary)]" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-3">Mission</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              To equip the next generation of Somali innovators, entrepreneurs, freelancers, and
              professionals with practical, industry-ready knowledge that creates real opportunities
              in the global digital economy.
            </p>
          </div>
          <div className="premium-card !bg-[var(--bg-primary)]">
            <div className="mb-6 inline-flex rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4">
              <Eye className="h-8 w-8 text-[var(--brand-primary)]" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-3">Vision</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              A Somalia where every ambitious young person has the skills, community, and resources
              to build careers, launch businesses, and compete confidently in the digital economy —
              regardless of where they start.
            </p>
          </div>
        </div>
      </section>

      {/* ================= WHAT WE TEACH ================= */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] md:text-5xl mb-4">
              What We Teach
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
              High-quality training across today's fastest-growing fields, each designed with a
              practical, hands-on approach.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {teachAreas.map((area, i) => (
              <div key={i} className="premium-card !p-6 text-center flex flex-col items-center">
                <div className="mb-4 inline-flex rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-3">
                  <area.icon className="h-6 w-6 text-[var(--brand-primary)]" />
                </div>
                <h3 className="font-heading text-sm md:text-base font-bold text-[var(--text-primary)]">
                  {area.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY HANHUB ================= */}
      <section className="py-24 px-6 relative border-y border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] md:text-5xl mb-4">
              Why HanHub
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
              Whether you're starting from scratch or upgrading your skills, we provide the guidance,
              community, and resources you need to succeed.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {whyHanhub.map((item, i) => (
              <div key={i} className="premium-card">
                <div className="mb-6 inline-flex rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-4">
                  <item.icon className="h-8 w-8 text-[var(--brand-primary)]" />
                </div>
                <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-3">
                  {item.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= COMPANY LEGITIMACY ================= */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-5xl">
          <div className="premium-card md:p-12 flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0 inline-flex rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-4">
              <ShieldCheck className="h-8 w-8 text-[var(--brand-primary)]" />
            </div>
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
                A Legally Registered Company
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed text-lg mb-4">
                HanHub proudly operates under <span className="text-[var(--text-primary)] font-bold">Hanasho LTD</span>,
                a legally registered company holding both Somali and international business licenses.
                This ensures our learners receive training from a trusted, professional organization
                committed to quality, transparency, and long-term impact.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--brand-primary)]">
                <Building2 className="w-4 h-4" /> Registered under Hanasho LTD
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 px-6 relative overflow-hidden bg-[var(--bg-secondary)] border-y border-[var(--border-color)]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-heading text-3xl font-extrabold text-[var(--text-primary)] md:text-5xl mb-6">
            Join HanHub today, and turn your <br className="hidden md:block" />
            <span className="text-[var(--brand-primary)]">ambition into achievement.</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-4 max-w-2xl mx-auto">
            HanHub — Hankaaga halka uu ka hirgalo.
          </p>
          <div className="mt-8">
            <Link href="/register" className="btn-primary inline-flex">
              Bilow Maanta <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
