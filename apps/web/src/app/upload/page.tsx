import UploadForm from '@/components/UploadForm.uppy'
import { storageLimit } from '@/lib/utils'
import { producer } from '@/services/kafka'
import { createClient } from '@/services/supabase/server'
import intoStream from 'into-stream'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { permanentRedirect } from 'next/navigation'
import * as tus from 'tus-js-client'
import fs from 'fs'

export default function UploadPage() {
  const uploadWithTus = async (formData: FormData) => {
    'use server'
    const cookieStore = cookies()

    const token: string = JSON.parse(cookieStore.get('sb-uhpcxcyzuhmshpzfoxgc-auth-token')?.value ?? '{}')?.access_token ?? ''
    const userId: string = JSON.parse(cookieStore.get('sb-uhpcxcyzuhmshpzfoxgc-auth-token')?.value ?? '{}')?.user?.id ?? ''
    // console.log('userId', userId)
    const fileInfo = Object.fromEntries(formData)
    console.log('fileInfo', fileInfo)
    // return
    const file: File | null = fileInfo.file as unknown as File
    // const stream = file.stream()
    const stream2 = intoStream(await file.arrayBuffer())
    // const stream3 = fs.createReadStream(file)
    // const reader = stream.getReader()
    let fileUploadStatus = ''


    const projectId = 'uhpcxcyzuhmshpzfoxgc'
    const fileUploadLocation = `${userId}/${Date.now()}-${file.name}`

    console.log('fileUploadLocation', fileUploadLocation)

    return new Promise((resolve, reject) => {
      let upload = new tus.Upload(stream2, {
        endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${token}`,
          apiKey: process.env.SUPABASE_ANON_KEY!,
          'x-upsert': 'true', // optionally set upsert to true to overwrite existing files
        },
        uploadDataDuringCreation: true,
        uploadSize: file.size,
        // uploadLengthDeferred: true,
        // removeFingerprintOnSuccess: true, // Important if you want to allow re-uploading the same file https://github.com/tus/tus-js-client/blob/main/docs/api.md#removefingerprintonsuccess
        metadata: {
          bucketName: 'transcripts',
          objectName: fileUploadLocation,
          contentType: file.type,
          cacheControl: '3600',
        },
        chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
        onError: function (error) {
          console.log('Failed because: ' + error)
          reject(error)
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
          console.log(bytesUploaded, bytesTotal, percentage + '%')
        },
        onSuccess: async function () {
          console.log('upload', upload)
          console.log('Download %s from %s', file.name, upload.url)

          console.log('File uploaded successfully:', fileUploadLocation)
          const supabase = createClient(cookieStore)


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

          resolve(upload)
          revalidatePath(`/transcripts`)
          permanentRedirect(`/transcripts/${transcriptId}`)
        },
      })


      // Check if there are any previous uploads to continue.
      return upload.findPreviousUploads().then(function (previousUploads) {
        // Found previous uploads so we select the first one.
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0])
        }

        // Start the upload
        upload.start()
      })
    })

  }

  return (
    <form action={uploadWithTus}>
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

