"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Globe, ChevronDown, ShoppingCart, User, LogOut, LayoutDashboard, Sun, Moon, Search, Home, Info, Briefcase, BookOpen, Wrench, FileText, Store, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage, type Lang } from "@/i18n/LanguageProvider";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, dict } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

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

  const languages: { code: Lang; label: string }[] = [
    { code: "so", label: "Soomaali" },
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/#about", label: dict.nav.about, icon: Info },
    { href: "/services", label: dict.nav.services, icon: Briefcase },
    { href: "/courses", label: dict.nav.courses, icon: BookOpen },
    { href: "/ai-tools", label: dict.nav.aiTools, icon: Wrench },
    { href: "/blogs", label: dict.nav.blog, icon: FileText },
    { href: "/marketplace", label: dict.nav.marketplace, icon: Store },
    { href: "/community", label: dict.nav.community, icon: Users },
  ];

  const changeLanguage = (code: Lang) => {
    setLang(code);
    setLangOpen(false);
  };

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/portal-live")) return null;

  const currentLogo = theme === "light" ? "/assets/logo-light.png" : "/assets/logo.png";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--bg-primary)] border-b border-[var(--border-color)] py-3 shadow-md shadow-black/10"
            : "bg-transparent py-5"
        }`}
      >
        {/* We use flex-row-reverse on mobile so the logo goes to the right, and the menu controls to the left */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 flex-row-reverse md:flex-row">
          
          <Link href="/" className="flex items-center group">
            <img
              src={currentLogo}
              alt="HanHub"
              className="h-12 md:h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
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

          {/* Desktop Auth / Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Lang Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mr-2"
              >
                <Globe className="w-4 h-4" />
                {lang.toUpperCase()}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>

              {langOpen && (
                <div className="absolute top-full right-0 mt-4 w-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl py-2 flex flex-col z-50 overflow-hidden">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => changeLanguage(l.code)}
                      className={`px-4 py-2 text-sm text-left transition-colors hover:bg-[var(--border-color)] ${lang === l.code ? 'text-[var(--brand-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}
                    >
                      {l.label}
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
                  <span className="text-sm font-medium text-[var(--text-primary)]">{dict.nav.account}</span>
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
                      <LayoutDashboard className="w-4 h-4" /> {dict.nav.dashboard}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left w-full"
                    >
                      <LogOut className="w-4 h-4" /> {dict.nav.signOut}
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
                  {dict.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="rounded-[16px] bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-heading font-bold text-[var(--on-brand)] transition-transform hover:-translate-y-0.5"
                >
                  {dict.nav.signup}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Controls (Menu Left, Search/Translate Center) */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex text-[var(--text-primary)]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
            
            <button onClick={() => setLangOpen(!langOpen)} className="w-9 h-9 flex items-center justify-center text-[var(--text-primary)] relative">
              <Globe className="w-5 h-5" />
              {langOpen && (
                <div className="absolute top-full left-0 mt-4 w-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl py-2 flex flex-col z-50 overflow-hidden">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={(e) => {
                        e.stopPropagation();
                        changeLanguage(l.code);
                      }}
                      className={`px-4 py-2 text-sm text-left transition-colors hover:bg-[var(--border-color)] ${lang === l.code ? 'text-[var(--brand-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </button>

            <Link href="/courses" className="w-9 h-9 flex items-center justify-center text-[var(--text-primary)]">
              <Search className="w-5 h-5" />
            </Link>

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
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-[var(--bg-primary)] transition-all duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 font-heading text-2xl font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
            >
              <Icon className="w-6 h-6" />
              {link.label}
            </Link>
          );
        })}

        {user ? (
          <>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 font-heading text-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-4"
            >
              <LayoutDashboard className="w-5 h-5" /> {dict.nav.dashboard}
            </Link>
            <button
              onClick={() => { setMobileOpen(false); handleSignOut(); }}
              className="mt-4 rounded-full bg-red-500/10 border border-red-500/20 px-8 py-3 font-heading font-semibold text-red-400 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> {dict.nav.signOut}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="font-heading text-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-4"
            >
              {dict.nav.login}
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="mt-4 rounded-[16px] bg-[var(--brand-primary)] px-8 py-3 font-heading font-bold text-[var(--on-brand)]"
            >
              {dict.nav.signup}
            </Link>
          </>
        )}
      </div>
    </>
  );
}
