import React from "react";
import Link from "next/link";
import { 
  Bot, 
  Code, 
  Terminal, 
  Smartphone, 
  Zap, 
  ArrowRight,
  ExternalLink
} from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      title: "WhatsApp AI Agent",
      description: "Automate your customer service and sales through WhatsApp. Our AI agents can handle inquiries, book appointments, and close sales 24/7.",
      icon: Bot,
    },
    {
      title: "Web & App Development",
      description: "We build premium, fast, and responsive websites and mobile applications tailored to your specific business needs and brand identity.",
      icon: Smartphone,
    },
    {
      title: "AI Automations",
      description: "Eliminate manual, repetitive tasks from your business. We create intelligent automation workflows that save you time and reduce operational costs.",
      icon: Zap,
    },
    {
      title: "Custom Software Solutions",
      description: "No matter how complex your requirements are, we can build custom software that perfectly covers your needs and automates your business.",
      icon: Terminal,
    }
  ];

  const portfolio = [
    { name: "somdiet.com", url: "http://somdiet.com", img: "https://hanasho.space/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-22-at-8.40.05-AM-1.jpeg" },
    { name: "caafimaadai.com", url: "http://caafimaadai.com", img: "https://hanasho.space/wp-content/uploads/2026/01/Screenshot-2026-01-22-081142.png" },
    { name: "delitecoffe.com", url: "http://delitecoffe.com", img: "https://hanasho.space/wp-content/uploads/2026/01/Screenshot-2026-01-22-081353.png" },
    { name: "hanasho.io", url: "http://Hanasho.io", img: "https://hanasho.space/wp-content/uploads/2026/01/Screenshot-2026-01-22-081630.png" },
    { name: "luuqadai.site", url: "http://luuqadai.site", img: "https://hanasho.space/wp-content/uploads/2026/01/Screenshot-2026-01-22-080831.png" },
    { name: "Hadafai.site", url: "http://hadafai.site", img: "https://hanasho.space/wp-content/uploads/2026/01/Screenshot-2026-01-22-082202.png" },
    { name: "Soomarai.shop", url: "https://soomarai.shop/", img: "https://hanasho.space/wp-content/uploads/2026/01/Screenshot-2026-01-22-075827.png" },
    { name: "qudwatii.com", url: "http://qudwatii.com", img: "https://hanasho.space/wp-content/uploads/2026/01/Screenshot-2026-01-22-081942.png" },
    { name: "Bunniskin.com", url: "https://bunniskin.com/", img: "https://hanasho.space/wp-content/uploads/2026/01/Screenshot-2026-01-22-085721.png" },
    { name: "Mohamedshiine.com", url: "https://Mohamedshiine.com/", img: "https://hanasho.space/wp-content/uploads/2026/03/Screenshot_20260302_224651_Chrome.jpg" },
    { name: "Nasiibsacoaching.com", url: "https://nasiibacoaching.com/", img: "https://hanasho.space/wp-content/uploads/2026/03/Screenshot_20260302_224643_Chrome.jpg" }
  ];

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center mb-24">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-[var(--text-primary)] mb-6">
            Solution-Based <span className="text-[var(--brand-primary)]">AI Systems</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
            We build any software or app that covers your needs. From AI-powered WhatsApp agents to 
            complex business automations, we transform the way you do business.
          </p>
        </div>

        {/* SERVICES GRID */}
        <div className="grid gap-6 md:grid-cols-2 mb-32">
          {services.map((service, i) => (
            <div key={i} className="premium-card group">
              <div className="mb-8 inline-flex rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-5">
                <service.icon className="h-10 w-10 text-[var(--brand-primary)]" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-4">
                {service.title}
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed text-lg mb-8">
                {service.description}
              </p>
              <button className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--brand-primary)] uppercase tracking-wider transition-colors">
                Learn More <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* CUSTOM SOFTWARE BANNER */}
        <div className="rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-12 text-center mb-32 relative">
          <Code className="h-16 w-16 text-[var(--brand-primary)] mx-auto mb-6" />
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
            We Can Automate Your Business
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
            Tell us about your manual, repeated business tasks. We will design and develop a custom AI 
            solution that handles it for you, so you can focus on growth.
          </p>
          <button className="btn-primary">
            Get a Free Consultation
          </button>
        </div>

        {/* PORTFOLIO SECTION */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 mb-6 rounded-full bg-[var(--bg-secondary)] text-[var(--brand-primary)] text-xs font-bold tracking-wider uppercase border border-[var(--border-color)]">
            Our Work
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Recent Projects
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            Explore the exact websites and AI systems we've built for our clients to help them scale and automate.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((project, i) => (
            <div key={i} className="group rounded-[20px] border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden transition-all hover:border-[var(--brand-primary)] hover:-translate-y-2 card-shadow">
              <div className="relative h-56 overflow-hidden bg-[var(--bg-primary)]">
                <img 
                  src={project.img} 
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-2">
                  {project.name}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mb-6">
                  Custom Web & AI Solution built by Hanasho.
                </p>
                <Link 
                  href={project.url}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-primary)] hover:text-[var(--brand-hover)] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" /> Visit Website
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
