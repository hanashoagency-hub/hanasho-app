import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client (bypasses RLS) — mirrors src/app/portal-live/actions.ts.
// Plain module (NOT "use server") so it can be imported by server components
// and server actions alike.
export function getAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://worerikjebqpeibrepgz.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcmVyaWtqZWJxcGVpYnJlcGd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYzNTk4NiwiZXhwIjoyMDk2MjExOTg2fQ.rHBeYbUnD0WNCgUduf95ddjBx3cSrsTeoPtXMu0Y9dU";
  return createClient(url, key);
}

export type Certificate = {
  id: string;
  certificate_number: string;
  student_name: string | null;
  course_title: string | null;
  issued_at: string;
};

/** Public certificate lookup by UUID id or human-readable certificate_number. */
export async function fetchCertificate(
  id: string
): Promise<Certificate | null> {
  const admin = getAdminClient();
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const query = admin
    .from("certificates")
    .select("id, certificate_number, student_name, course_title, issued_at");
  const { data, error } = await (isUuid
    ? query.eq("id", id)
    : query.eq("certificate_number", id)
  ).maybeSingle();
  if (error) {
    console.error("fetchCertificate error:", error.message);
    return null;
  }
  return data as Certificate | null;
}
