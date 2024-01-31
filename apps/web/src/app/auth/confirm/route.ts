
import { createClient } from '@/services/supabase/actions'
import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * This route is called when the user clicks the magic link to sign in.
 * Signs the user in and redirects them to the home page. Hopefully.
 * WORKING 2024-01-31 0518
 * @param request
 * @returns NextResponse
 */
export async function GET(request: NextRequest) {
  console.log('/auth/confirm route start')
  const url = new URL(request.url);
  console.log('url', url)
  const searchParams = new URLSearchParams(url.search);
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'
  const redirectTo = request.nextUrl.clone()
  // @ts-ignore
  redirectTo.pathname = process.env.NODE_ENV === 'production' ?
    process.env.RAILWAY_PUBLIC_DOMAIN : ''

  console.log('railway public domain env var', process.env.RAILWAY_PUBLIC_DOMAIN)
  console.log('redirectTo', redirectTo)


  if (token_hash && type) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash
    })

    if (!error) {
      return NextResponse.redirect(redirectTo)
    }

    console.error('There was a problem authenticating this user.', error)
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = '/auth/auth-code-error'
  console.log('/auth/confirm route end')
  return NextResponse.redirect(redirectTo)
}
