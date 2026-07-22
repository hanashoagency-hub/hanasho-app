import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import XirfadleAIWidget from "@/components/XirfadleAIWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "hanasho.io — Akademiyada #1 ee Digital-ka ah ee Soomaalida",
  description:
    "Baro AI, Digital Marketing, Web3, Crypto, Freelancing, iyo xirfado badan oo kale. Ku biir hanasho.io oo dhis mustaqbalkaaga digital-ka ah maanta.",
  icons: {
    icon: "/assets/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="so" dir="ltr">
      <body
        className={`${inter.variable} ${manrope.variable} antialiased min-h-screen relative`}
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <div className="site-bg">
          <div className="corner-dots corner-dots-tr"></div>
          <div className="corner-dots corner-dots-bl"></div>
        </div>
        
        <Header />
        {children}
        <Footer />
        <WhatsAppWidget />
        <XirfadleAIWidget />
      </body>
    </html>
  );
}
