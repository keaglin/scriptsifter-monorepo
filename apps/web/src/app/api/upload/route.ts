import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/services/supabase/server'
import { producer } from '@/services/kafka'
import { storageLimit } from '@/lib/utils'
import { redirect } from 'next/navigation'

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const token = JSON.parse(cookieStore.get('sb-uhpcxcyzuhmshpzfoxgc-auth-token')?.value ?? '{}')?.access_token

  // console.log('token', token)

  if (!file) {
    return NextResponse.json({ success: false })
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ success: false })

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id

  if (file.size > storageLimit) {
    console.log('File too large')
    return NextResponse.json({ success: false })
  }

  const { data: storageData, error } = await supabase.storage.from('transcripts').upload(`${userId}/${Date.now()}-${file.name}`, file)

  if (error) {
    console.log('Error uploading file:', error.message)
    return NextResponse.json({ success: false })
  }

  console.log('File uploaded successfully:', storageData.path)

  // save a new transcript to the database and put the bucket path in a column
  // TODO: fix types
  // @ts-ignore
  const { data: createData, error: createError } = await supabase.from('transcripts').insert({ user_id: userId, filepath: storageData?.path }).select('id')
  if (createError) {
    console.log('Error creating transcript:', createError.message)
    return NextResponse.json({ success: false })
  }

  console.log('Transcript created successfully:', createData)

  const transcriptId = createData[0].id

  const payload = {
    // TODO:
    // transactionid, -- uuid or cid for the transaction itself; for traceability/observability
    location: storageData?.path,
    token,
    transcriptId
  }

  try {
    await producer.connect()
    await producer.send({ topic: 'file-uploaded', messages: [{ value: JSON.stringify(payload) }] })
  } catch (err) {
    console.log('Error publishing to Kafka:', err)
  }

  // return NextResponse.json({ success: true })
  redirect(`/transcripts/${transcriptId}`)
}
