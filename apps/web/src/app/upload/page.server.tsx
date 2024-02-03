import UploadForm from '@/components/UploadForm'
import { storageLimit } from '@/lib/utils'
import { producer } from '@/services/kafka'
import { createClient } from '@/services/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { permanentRedirect } from 'next/navigation'
import * as tus from 'tus-js-client'

export default function UploadPage() {
  const uploadFile = async (formData: FormData) => {
    'use server'
    // const data = await request.formData()
    const fileInfo = Object.fromEntries(formData)
    console.log('fileInfo', fileInfo)
    // return
    const file: File | null = fileInfo.file as unknown as File
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    // TODO: move cookie to .env
    const token = JSON.parse(cookieStore.get('sb-uhpcxcyzuhmshpzfoxgc-auth-token')?.value ?? '{}')?.access_token

    // console.log('token', token)

    if (!file) {
      return Response.json({ success: false })
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return Response.json({ success: false })

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id

    if (file.size > storageLimit) {
      console.log('File too large')
      return Response.json({ success: false })
    }


    const uploadPath = `${userId}/${Date.now()}-${file.name}`
    console.log('uploadPath', uploadPath)

    const { data: storageData, error } = await supabase.storage.from('transcripts').upload(uploadPath, file)

    if (error) {
      console.log('Error uploading file:', error.message)
      throw new Error(error.message)
      // return Response.json({ success: false })
    }

    console.log('File uploaded successfully:', storageData.path)

    // save a new transcript to the database and put the bucket path in a column
    // TODO: fix types
    // @ts-ignore
    const { data: createData, error: createError } = await supabase.from('transcripts').insert({ user_id: userId, filepath: storageData?.path }).select('id')
    if (createError) {
      console.log('Error creating transcript:', createError.message)
      return Response.json({ success: false })
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

    console.log()

    try {
      await producer.connect()
      await producer.send({ topic: 'file-uploaded', messages: [{ value: JSON.stringify(payload) }] })
    } catch (err) {
      console.log('Error publishing to Kafka:', err)
    }

    // return NextResponse.json({ success: true })
    revalidatePath(`/transcripts`)
    permanentRedirect(`/transcripts/${transcriptId}`)
  }



  // return (<UploadForm />)
  return (
    <form action={uploadFile}>
      <label htmlFor="file">
        File (audio or video):
        <input
          type="file"
          name="file"
        />
      </label>
      <label htmlFor="title">
        Title:
        <input type="text" id="title" name="title" />
      </label>
      <label htmlFor="season">
        Season:
        <input type="number" id="season" name="season" />
      </label>
      <label htmlFor="episodeNum">
        Episode Number:
        <input type="number" id="episodeNum" name="episodeNum" />
      </label>

      <button type="submit">
        Upload
      </button>
    </form>
  )
}

