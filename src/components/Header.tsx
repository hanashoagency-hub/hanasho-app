"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, ChevronDown, Sun, Moon, ShoppingCart } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("hanasho-theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved === "grey" ? "grey" : "");

    // Google Translate Initialization
    if (!document.getElementById("google-translate-script")) {
      const addScript = document.createElement("script");
      addScript.id = "google-translate-script";
      addScript.setAttribute(
        "src",
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      );
      document.body.appendChild(addScript);
      
      // @ts-ignore
      window.googleTranslateElementInit = () => {
        // @ts-ignore
        new window.google.translate.TranslateElement(
          { pageLanguage: "so", includedLanguages: "en,so,ar", autoDisplay: false },
          "google_translate_element"
        );
      };
    }

    // Set UI language from cookie
    const match = document.cookie.match(/googtrans=\/so\/(en|so|ar)/);
    if (match) {
      setCurrentLang(match[1].toUpperCase());
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "grey" : "dark";
    setTheme(next);
    localStorage.setItem("hanasho-theme", next);
    document.documentElement.setAttribute("data-theme", next === "grey" ? "grey" : "");
  };

  const languages = [
    { code: "EN", label: "English" },
    { code: "SO", label: "Somali" },
    { code: "AR", label: "Arabic" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/#about", label: "Annaga" },
    { href: "/services", label: "Services" },
    { href: "/courses", label: "Courses" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/community", label: "Community" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setLangOpen(false);
    let gCode = "so";
    if (langCode === "EN") gCode = "en";
    if (langCode === "AR") gCode = "ar";
    if (langCode === "SO") gCode = "so";
    
    document.cookie = `googtrans=/so/${gCode}; path=/`;
    document.cookie = `googtrans=/so/${gCode}; domain=${window.location.hostname}; path=/`;
    window.location.reload();
  };

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/10 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          {/* Logo — Full wordmark, swaps based on theme */}
          <Link href="/" className="flex items-center group">
            <img
              src={theme === "grey" ? "/assets/hanasho-grey-logo.png" : "/assets/hanasho-dark-logo.png"}
              alt="Hanasho"
              className="h-16 md:h-20 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-4">
            {/* Lang Switcher */}
            <div className="relative">
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white transition-colors mr-2"
              >
                <Globe className="w-4 h-4" />
                {currentLang}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
              
              {langOpen && (
                <div className="absolute top-full right-0 mt-4 w-32 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl py-2 flex flex-col z-50 overflow-hidden">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`px-4 py-2 text-sm text-left transition-colors hover:bg-white/10 ${currentLang === lang.code ? 'text-white font-bold' : 'text-white/60'}`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-white/70 hover:text-white transition-colors" />
              ) : (
                <Moon className="w-4 h-4 text-white/70 hover:text-white transition-colors" />
              )}
            </button>

            <Link href="/checkout" className="relative w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all duration-300 hover:scale-110">
              <ShoppingCart className="w-4 h-4 text-white/70 hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                0
              </span>
            </Link>

            <Link
              href="/login"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white px-6 py-2.5 text-sm font-heading font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex md:hidden text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black/95 backdrop-blur-xl transition-all duration-500 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="font-heading text-2xl font-semibold text-white/80 transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/login"
          onClick={() => setMobileOpen(false)}
          className="font-heading text-xl text-white/60 hover:text-white transition-colors"
        >
          Login
        </Link>
        <Link
          href="/register"
          onClick={() => setMobileOpen(false)}
          className="mt-4 rounded-full bg-white px-8 py-3 font-heading font-semibold text-black"
        >
          Sign Up
        </Link>
      </div>
      <div id="google_translate_element" style={{ display: "none" }}></div>
    </>
  );
}
