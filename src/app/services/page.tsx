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
      color: "from-green-500/20 to-emerald-500/5",
      iconColor: "text-green-400"
    },
    {
      title: "Web & App Development",
      description: "We build premium, fast, and responsive websites and mobile applications tailored to your specific business needs and brand identity.",
      icon: Smartphone,
      color: "from-blue-500/20 to-cyan-500/5",
      iconColor: "text-blue-400"
    },
    {
      title: "AI Automations",
      description: "Eliminate manual, repetitive tasks from your business. We create intelligent automation workflows that save you time and reduce operational costs.",
      icon: Zap,
      color: "from-purple-500/20 to-pink-500/5",
      iconColor: "text-purple-400"
    },
    {
      title: "Custom Software Solutions",
      description: "No matter how complex your requirements are, we can build custom software that perfectly covers your needs and automates your business.",
      icon: Terminal,
      color: "from-orange-500/20 to-red-500/5",
      iconColor: "text-orange-400"
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
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/[0.03] blur-[150px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center mb-24">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6">
            Solution-Based <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F5F5] to-[#D9D9D9]">AI Systems</span>
          </h1>
          <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
            We build any software or app that covers your needs. From AI-powered WhatsApp agents to 
            complex business automations, we transform the way you do business.
          </p>
        </div>

        {/* SERVICES GRID */}
        <div className="grid gap-6 md:grid-cols-2 mb-32">
          {services.map((service, i) => (
            <div key={i} className="group relative rounded-3xl border border-white/10 bg-[#0A0A0A] p-10 transition-all hover:bg-white/5 hover:border-white/20">
              <div className={`mb-8 inline-flex rounded-2xl bg-white/5 border border-white/10 p-5 shadow-lg`}>
                <service.icon className={`h-10 w-10 text-white`} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white mb-4">
                {service.title}
              </h3>
              <p className="text-white/60 leading-relaxed text-lg mb-8">
                {service.description}
              </p>
              <button className="inline-flex items-center gap-2 text-sm font-bold text-[#D9D9D9] group-hover:text-white uppercase tracking-wider">
                Learn More <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* CUSTOM SOFTWARE BANNER */}
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-12 text-center mb-32 relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <Code className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6">
            We Can Automate Your Business
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
            Tell us about your manual, repeated business tasks. We will design and develop a custom AI 
            solution that handles it for you, so you can focus on growth.
          </p>
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-heading font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Get a Free Consultation
          </button>
        </div>

        {/* PORTFOLIO SECTION */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 mb-4 rounded-full bg-white/10 text-[#D9D9D9] text-xs font-bold tracking-wider uppercase border border-white/20">
            Our Work
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6">
            Recent Projects
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Explore the exact websites and AI systems we've built for our clients to help them scale and automate.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((project, i) => (
            <div key={i} className="group rounded-3xl border border-white/10 bg-white/5 overflow-hidden transition-all hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
              <div className="relative h-56 overflow-hidden bg-black">
                <img 
                  src={project.img} 
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-80" />
              </div>
              <div className="p-8">
                <h3 className="font-heading text-xl font-bold text-white mb-2">
                  {project.name}
                </h3>
                <p className="text-white/50 text-sm mb-6">
                  Custom Web & AI Solution built by Hanasho.
                </p>
                <Link 
                  href={project.url}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
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
