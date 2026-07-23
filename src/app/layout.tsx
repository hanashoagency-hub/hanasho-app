import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import XirfadleAIWidget from "@/components/XirfadleAIWidget";
import ThemeProvider from "@/components/ThemeProvider";
import RainBackground from "@/components/RainBackground";
import TutorialButton from "@/components/TutorialButton";

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('hanhub-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Hanhub.so — Akademiyada #1 ee Digital-ka ah ee Soomaalida",
  description:
    "Baro AI, Digital Marketing, Web3, Crypto, Freelancing, iyo xirfado badan oo kale. Ku biir Hanhub.so oo dhis mustaqbalkaaga digital-ka ah maanta.",
  icons: {
    icon: "/assets/logo.png",
  },
  openGraph: {
    title: "Hanhub.so — Akademiyada #1 ee Digital-ka ah ee Soomaalida",
    description:
      "Baro AI, Digital Marketing, Web3, Crypto, Freelancing, iyo xirfado badan oo kale. Ku biir Hanhub.so oo dhis mustaqbalkaaga digital-ka ah maanta.",
    images: ["/assets/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="so" dir="ltr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} antialiased min-h-screen relative`}
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <ThemeProvider>
          <div className="site-bg">
            <div className="corner-dots corner-dots-tr"></div>
            <div className="corner-dots corner-dots-bl"></div>
          </div>
          <RainBackground />

          <Header />
          {children}
          <Footer />
          <WhatsAppWidget />
          <TutorialButton />
          <XirfadleAIWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
