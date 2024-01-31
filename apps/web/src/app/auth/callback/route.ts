import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/services/supabase/actions'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  console.log('public domain env var', process.env.RAILWAY_PUBLIC_DOMAIN)
  console.log('origin', origin)
  searchParams.forEach((value, key) => {
    console.log(`${key}: ${value}`)
  })
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
