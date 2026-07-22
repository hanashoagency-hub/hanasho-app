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
        className={`${inter.variable} ${manrope.variable} bg-grid-pattern antialiased`}
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <Header />
        {children}
        <Footer />
        <WhatsAppWidget />
        <XirfadleAIWidget />
      </body>
    </html>
  );
}
