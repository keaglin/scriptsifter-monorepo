// import { NextRequest, Response } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/services/supabase/server'
import { producer } from '@/services/kafka'
import { storageLimit } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const data = await request.json()
  console.log('data', data)
  const { fileUploadLocation, token: bearerToken } = data
  // const file: File | null = data.get('file') as unknown as File
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const token = JSON.parse(cookieStore.get('sb-uhpcxcyzuhmshpzfoxgc-auth-token')?.value ?? '{}')?.access_token

  if (token !== bearerToken) return Response.json({ success: false })

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return Response.json({ success: false })

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id

  // save a new transcript to the database and put the bucket path in a column
  // TODO: fix types
  // @ts-ignore
  const { data: createData, error: createError } = await supabase.from('transcripts').insert({ user_id: userId, filepath: fileUploadLocation }).select('id')
  if (createError) {
    console.log('Error creating transcript:', createError.message)
    return Response.json({ success: false })
  }

  console.log('Transcript created successfully:', createData)

  const transcriptId = createData[0].id

  const payload = {
    // TODO:
    // transactionid, -- uuid or cid for the transaction itself; for traceability/observability
    location: fileUploadLocation,
    token,
    transcriptId
  }

  try {
    await producer.connect()
    await producer.send({ topic: 'file-uploaded', messages: [{ value: JSON.stringify(payload) }] })
  } catch (err) {
    console.log('Error publishing to Kafka:', err)
  }

  // return Response.json({ success: true })
  revalidatePath('/transcripts')
  redirect(`/transcripts/${transcriptId}`)
}
