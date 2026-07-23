import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Award, FileText, User, ExternalLink } from 'lucide-react';

export const revalidate = 0;

export default async function AdminCertificatesPage() {
  const supabase = await createClient();
  
  const { data: certificates } = await supabase
    .from('certificates')
    .select('*, profiles(full_name, email), courses(title)')
    .order('issued_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Certificates</h1>
          <p className="text-white/50 mt-1">View all certificates issued to students.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white/70 text-sm">
          Total: <span className="font-bold text-white">{certificates?.length || 0}</span>
        </div>
      </div>

      {!certificates || certificates.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-2xl">
          <Award className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Certificates Yet</h3>
          <p className="text-white/50">Certificates will appear here when students complete courses.</p>
        </div>
      ) : (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-xs font-bold text-white/50 uppercase tracking-wider">Student</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-white/50 uppercase tracking-wider">Course</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-white/50 uppercase tracking-wider">Certificate #</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-white/50 uppercase tracking-wider">Issued</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-white/50 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {certificates.map((cert: any) => (
                  <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-white/50" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{cert.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-white/50">{cert.profiles?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-white/30" />
                        <span className="text-sm text-white/80">{cert.courses?.title || 'Unknown Course'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-mono text-white/70 bg-white/5 px-2 py-1 rounded-lg">
                        {cert.certificate_number}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-white/50">
                        {new Date(cert.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Link 
                        href={`/certificate/${cert.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
