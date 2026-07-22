import Link from "next/link";
import { Award, ShieldCheck, ArrowLeft } from "lucide-react";
import { fetchCertificate } from "@/utils/certificates";
import PrintButton from "./PrintButton";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const certificate = await fetchCertificate(id);

  if (!certificate) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-6">
        <ShieldCheck className="w-14 h-14 text-white/20 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Certificate not found
        </h1>
        <p className="text-white/50 mb-6">
          We couldn&apos;t verify a certificate with this reference.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:scale-105 transition-transform"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const issued = new Date(certificate.issued_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 px-4 print:bg-white print:pt-0">
      <div className="max-w-4xl mx-auto">
        {/* Top controls (hidden when printing) */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <PrintButton />
        </div>

        {/* Certificate */}
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#0d0d0f] to-[#050505] p-8 md:p-16 shadow-[0_0_60px_rgba(0,0,0,0.6)] print:shadow-none print:border-[3px] print:border-[#c9a227] print:bg-white print:text-black">
          {/* Decorative gold frame */}
          <div className="pointer-events-none absolute inset-4 rounded-2xl border border-[#c9a227]/40 print:border-[#c9a227]" />

          <div className="relative text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f5e08c] to-[#c9a227] flex items-center justify-center shadow-[0_0_30px_rgba(201,162,39,0.4)]">
                <Award className="w-10 h-10 text-[#1a1400]" />
              </div>
            </div>

            <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-[#c9a227] font-semibold mb-2">
              XIRFADIFY Academy
            </p>
            <h1 className="font-heading text-3xl md:text-5xl font-extrabold mb-6 print:text-black">
              Certificate of Completion
            </h1>

            <p className="text-white/50 text-sm md:text-base mb-2 print:text-gray-600">
              This certifies that
            </p>
            <p className="text-2xl md:text-4xl font-bold mb-6 text-white print:text-black">
              {certificate.student_name}
            </p>

            <p className="text-white/50 text-sm md:text-base mb-2 print:text-gray-600">
              has successfully completed the course
            </p>
            <p className="text-xl md:text-3xl font-semibold mb-8 text-[#f5e08c] print:text-[#a8851f]">
              {certificate.course_title}
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 mt-10 pt-8 border-t border-white/10 print:border-gray-300">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-white/40 mb-1 print:text-gray-500">
                  Issued On
                </p>
                <p className="font-semibold print:text-black">{issued}</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-white/40 mb-1 print:text-gray-500">
                  Certificate No.
                </p>
                <p className="font-mono font-semibold text-[#f5e08c] print:text-black">
                  {certificate.certificate_number}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/40 text-sm mt-6 print:hidden">
          Verify this certificate at{" "}
          <span className="text-white/70">
            /certificate/{certificate.certificate_number}
          </span>
        </p>
      </div>
    </div>
  );
}
