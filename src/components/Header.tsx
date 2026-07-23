"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Globe, ChevronDown, ShoppingCart, User, LogOut, LayoutDashboard, Sun, Moon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useTheme } from "@/components/ThemeProvider";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
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

    // Check auth session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfileOpen(false);
    router.push("/");
    router.refresh();
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
    { href: "/blogs", label: "Blog" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/community", label: "Community" },
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

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/portal-live")) return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--bg-primary)] border-b border-[var(--border-color)] py-3 shadow-md shadow-black/10"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center group">
            <img
              src="/assets/logo.png"
              alt="HanHub"
              className="h-16 md:h-20 w-auto object-contain transition-all duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
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
                className="flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mr-2"
              >
                <Globe className="w-4 h-4" />
                {currentLang}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
              
              {langOpen && (
                <div className="absolute top-full right-0 mt-4 w-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl py-2 flex flex-col z-50 overflow-hidden">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`px-4 py-2 text-sm text-left transition-colors hover:bg-[var(--border-color)] ${currentLang === lang.code ? 'text-[var(--brand-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-[var(--border-color)] transition-all duration-300"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[var(--text-secondary)]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
              )}
            </button>

            <Link href="/checkout" className="relative w-10 h-10 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-[var(--border-color)] transition-all duration-300">
              <ShoppingCart className="w-4 h-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[10px] font-bold text-[var(--on-brand)]">
                0
              </span>
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] pl-3 pr-4 py-2 hover:bg-[var(--border-color)] transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--brand-primary)] flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-[var(--on-brand)]" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">Account</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                </button>

                {profileOpen && (
                  <div className="absolute top-full right-0 mt-3 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-xl py-2 flex flex-col z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[var(--border-color)] mb-1">
                      <p className="text-xs text-[var(--text-secondary)] truncate">Signed in as</p>
                      <p className="text-sm text-[var(--text-primary)] font-medium truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left w-full"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-[16px] bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-heading font-bold text-[var(--on-brand)] transition-transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-center"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[var(--text-secondary)]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex text-[var(--text-primary)]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-[var(--bg-primary)] transition-all duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="font-heading text-2xl font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
          >
            {link.label}
          </Link>
        ))}

        {user ? (
          <>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="font-heading text-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={() => { setMobileOpen(false); handleSignOut(); }}
              className="mt-4 rounded-full bg-red-500/10 border border-red-500/20 px-8 py-3 font-heading font-semibold text-red-400"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="font-heading text-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="mt-4 rounded-[16px] bg-[var(--brand-primary)] px-8 py-3 font-heading font-bold text-[var(--on-brand)]"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
      <div id="google_translate_element" style={{ display: "none" }}></div>
    </>
  );
}
