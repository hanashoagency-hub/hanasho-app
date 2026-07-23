import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  
  // Force www.hanhub.so in production to prevent redirect loops or wrong domains
  const baseOrigin = origin.includes('localhost') ? origin : 'https://www.hanhub.so'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${baseOrigin}${next}`)
    }
  }

  // For implicit flow, tokens arrive as URL hash fragments which are
  // handled client-side. Check if there's a hash-based redirect needed.
  // If no code was provided, redirect to the callback page that handles
  // hash fragments client-side.
  return NextResponse.redirect(`${baseOrigin}/auth/callback/handle`)
}
