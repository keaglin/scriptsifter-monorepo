import UploadForm from '@/components/UploadForm'
import { createClient } from '@/services/supabase/server'
import { cookies } from 'next/headers'

export default async function UploadPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  // TODO: move cookie to .env?
  const token = JSON.parse(cookieStore.get('sb-uhpcxcyzuhmshpzfoxgc-auth-token')?.value ?? '{}')?.access_token

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return Response.json({ success: false })

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? ''

  return (
    <UploadForm token={token} userId={userId} />
  )
}

