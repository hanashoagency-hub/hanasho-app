"use client";

import React, { useRef } from "react";
import { 
  Bot, 
  Cpu, 
  Database, 
  Coins, 
  Bitcoin, 
  TrendingUp, 
  Megaphone, 
  Briefcase, 
  Video,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Star,
  Clock
} from "lucide-react";

// Categories and mock data
const categories = [
  {
    name: "AI",
    icon: <Bot className="w-6 h-6 text-[#D9D9D9]" />,
    courses: [
      { id: 1, title: "Introduction to Artificial Intelligence", instructor: "Dr. Ahmed Ali", duration: "4 Weeks", rating: 4.8, students: 1200 },
      { id: 2, title: "Advanced Machine Learning", instructor: "Sarah Johnson", duration: "8 Weeks", rating: 4.9, students: 850 },
      { id: 3, title: "Neural Networks & Deep Learning", instructor: "Michael Chen", duration: "6 Weeks", rating: 4.7, students: 920 },
      { id: 4, title: "AI Ethics and Governance", instructor: "Emma Davis", duration: "3 Weeks", rating: 4.6, students: 430 },
    ]
  },
  {
    name: "AI Automations",
    icon: <Cpu className="w-6 h-6 text-[#D9D9D9]" />,
    courses: [
      { id: 5, title: "Automating Business Workflows", instructor: "David Smith", duration: "5 Weeks", rating: 4.8, students: 1100 },
      { id: 6, title: "Zapier & Make Mastery", instructor: "Lisa Wang", duration: "4 Weeks", rating: 4.9, students: 1500 },
      { id: 7, title: "Building AI Chatbots", instructor: "Omar Hassan", duration: "6 Weeks", rating: 4.7, students: 890 },
      { id: 8, title: "No-Code AI Automation", instructor: "Rachel Green", duration: "3 Weeks", rating: 4.8, students: 760 },
    ]
  },
  {
    name: "Web3 Consulting",
    icon: <Database className="w-6 h-6 text-[#D9D9D9]" />,
    courses: [
      { id: 9, title: "Web3 Fundamentals for Business", instructor: "Alex Turner", duration: "4 Weeks", rating: 4.7, students: 640 },
      { id: 10, title: "Smart Contract Auditing", instructor: "Elena Rodriguez", duration: "8 Weeks", rating: 4.9, students: 520 },
      { id: 11, title: "Decentralized Finance (DeFi) Explained", instructor: "James Wilson", duration: "5 Weeks", rating: 4.8, students: 810 },
      { id: 12, title: "NFT Strategies for Brands", instructor: "Sophie Taylor", duration: "3 Weeks", rating: 4.6, students: 490 },
    ]
  },
  {
    name: "Memecoin",
    icon: <Coins className="w-6 h-6 text-[#D9D9D9]" />,
    courses: [
      { id: 13, title: "Understanding Memecoin Economics", instructor: "Doge Master", duration: "2 Weeks", rating: 4.5, students: 2100 },
      { id: 14, title: "Community Building for Tokens", instructor: "Shiba Fan", duration: "3 Weeks", rating: 4.7, students: 1800 },
      { id: 15, title: "Evaluating Tokenomics", instructor: "Crypto Analyst", duration: "4 Weeks", rating: 4.8, students: 950 },
      { id: 16, title: "Marketing Viral Assets", instructor: "Meme Lord", duration: "2 Weeks", rating: 4.6, students: 1200 },
    ]
  },
  {
    name: "Crypto",
    icon: <Bitcoin className="w-6 h-6 text-[#D9D9D9]" />,
    courses: [
      { id: 17, title: "Cryptocurrency Investing 101", instructor: "Warren Block", duration: "4 Weeks", rating: 4.8, students: 3200 },
      { id: 18, title: "Blockchain Architecture", instructor: "Satoshi Nakamoto", duration: "8 Weeks", rating: 4.9, students: 1500 },
      { id: 19, title: "Securing Crypto Assets", instructor: "Security Pro", duration: "3 Weeks", rating: 4.9, students: 880 },
      { id: 20, title: "Altcoin Research Strategies", instructor: "Invest Guide", duration: "5 Weeks", rating: 4.7, students: 1100 },
    ]
  },
  {
    name: "Trading Strategy",
    icon: <TrendingUp className="w-6 h-6 text-[#D9D9D9]" />,
    courses: [
      { id: 21, title: "Technical Analysis Masterclass", instructor: "Trading Guru", duration: "6 Weeks", rating: 4.8, students: 2400 },
      { id: 22, title: "Risk Management in Trading", instructor: "Safe Trader", duration: "3 Weeks", rating: 4.9, students: 1600 },
      { id: 23, title: "Algorithmic Trading Basics", instructor: "Code Trader", duration: "8 Weeks", rating: 4.7, students: 950 },
      { id: 24, title: "Day Trading Crypto Markets", instructor: "Flash Trader", duration: "4 Weeks", rating: 4.6, students: 1800 },
    ]
  },
  {
    name: "Digital Marketing Income",
    icon: <Megaphone className="w-6 h-6 text-[#D9D9D9]" />,
    courses: [
      { id: 25, title: "Social Media Monetization", instructor: "Market Pro", duration: "4 Weeks", rating: 4.8, students: 2800 },
      { id: 26, title: "SEO for Passive Income", instructor: "Search Master", duration: "6 Weeks", rating: 4.7, students: 1500 },
      { id: 27, title: "Email Marketing Funnels", instructor: "Convert King", duration: "5 Weeks", rating: 4.9, students: 1200 },
      { id: 28, title: "Affiliate Marketing Success", instructor: "Link Builder", duration: "4 Weeks", rating: 4.8, students: 2100 },
    ]
  },
  {
    name: "Freelancing",
    icon: <Briefcase className="w-6 h-6 text-[#D9D9D9]" />,
    courses: [
      { id: 29, title: "Upwork Success Blueprint", instructor: "Top Rated", duration: "3 Weeks", rating: 4.9, students: 3500 },
      { id: 30, title: "Building a Freelance Portfolio", instructor: "Design Pro", duration: "2 Weeks", rating: 4.8, students: 2200 },
      { id: 31, title: "Client Communication Skills", instructor: "Talk Master", duration: "4 Weeks", rating: 4.7, students: 1800 },
      { id: 32, title: "Pricing Your Services", instructor: "Value Pro", duration: "3 Weeks", rating: 4.8, students: 1600 },
    ]
  },
  {
    name: "Viral Content Creation Tips & Tricks",
    icon: <Video className="w-6 h-6 text-[#D9D9D9]" />,
    courses: [
      { id: 33, title: "TikTok Algorithm Secrets", instructor: "Viral King", duration: "3 Weeks", rating: 4.8, students: 4200 },
      { id: 34, title: "YouTube Shorts Mastery", instructor: "Shorts Pro", duration: "4 Weeks", rating: 4.9, students: 3800 },
      { id: 35, title: "Video Editing for Engagement", instructor: "Edit Master", duration: "5 Weeks", rating: 4.7, students: 2500 },
      { id: 36, title: "Storytelling in 60 Seconds", instructor: "Story Teller", duration: "2 Weeks", rating: 4.8, students: 2900 },
    ]
  }
];

const CategorySection = ({ category }: { category: any }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === "left" ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 px-4 md:px-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            {category.icon}
          </div>
          <h2 className="text-2xl font-bold text-white">{category.name}</h2>
        </div>
        <div className="flex items-center gap-2 hidden sm:flex">
          <button 
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 px-4 md:px-0 pb-4 snap-x snap-mandatory hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {category.courses.map((course: any) => (
          <div 
            key={course.id}
            className="min-w-[300px] sm:min-w-[340px] snap-start shrink-0 flex flex-col bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group"
          >
            {/* Image Placeholder */}
            <div className="h-44 bg-gradient-to-br from-white/5 to-white/10 relative flex items-center justify-center overflow-hidden">
              <PlayCircle className="w-12 h-12 text-white/40 group-hover:text-white/80 transition-colors duration-300 group-hover:scale-110" />
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1 border border-white/10">
                <Star className="w-3 h-3 text-[#D9D9D9] fill-[#D9D9D9]" />
                {course.rating}
              </div>
            </div>

            {/* Course Content */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{course.instructor}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1">
                  <PlayCircle className="w-4 h-4" />
                  {course.students.toLocaleString()} students
                </div>
              </div>

              <div className="mt-auto">
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400 font-medium">Status</span>
                    <span className="text-white font-medium">Not Enrolled</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D9D9D9] w-0 rounded-full"></div>
                  </div>
                </div>

                <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors duration-300 border border-white/5 flex items-center justify-center gap-2 group-hover:bg-[#D9D9D9] group-hover:text-black group-hover:border-[#D9D9D9]/50">
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CoursesCatalogPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/20">
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
      
      {/* Header */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.03] blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#F5F5F5] via-[#D9D9D9] to-[#888888] bg-clip-text text-transparent">
            Explore Our Premium Catalog
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Master the skills of the future. From AI to Web3, Memecoins to Digital Marketing, accelerate your career with XIRFADIFY.
          </p>
        </div>
      </div>

      {/* Course Categories */}
      <div className="max-w-7xl mx-auto pb-24 px-0 md:px-6">
        {categories.map((category) => (
          <CategorySection key={category.name} category={category} />
        ))}
      </div>
    </div>
  );
}
