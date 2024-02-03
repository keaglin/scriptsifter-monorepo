'use server'

import { storageLimit } from "@/lib/utils"
import { producer } from "@/services/kafka"
import { createClient } from "@/services/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { permanentRedirect } from "next/navigation"
import { NextResponse } from "next/server"
import * as tus from 'tus-js-client'
import intoStream from "into-stream"
import fs from "fs"


export const uploadFile = async (formData: FormData) => {
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

  const { data: storageData, error } = await supabase.storage.from('transcripts').upload(`${userId}/${Date.now()}-${fileInfo.name}`, fileInfo.file)

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
  revalidatePath(`/transcripts/${transcriptId}`)
  permanentRedirect(`/transcripts/${transcriptId}`)
}

export const uploadWithTus = async (formData: FormData) => {
  const cookieStore = cookies()
  const token: string = JSON.parse(cookieStore.get('sb-uhpcxcyzuhmshpzfoxgc-auth-token')?.value ?? '{}')?.access_token ?? ''
  const userId: string = JSON.parse(cookieStore.get('sb-uhpcxcyzuhmshpzfoxgc-auth-token')?.value ?? '{}')?.user?.id ?? ''
  // console.log('userId', userId)
  const fileInfo = Object.fromEntries(formData)
  console.log('fileInfo', fileInfo)
  // return
  const file: File | null = fileInfo.file as unknown as File
  const stream = file.stream()
  const stream2 = intoStream(await file.arrayBuffer())
  // const stream3 = fs.createReadStream(file.path)
  const reader = stream.getReader()


  const projectId = 'uhpcxcyzuhmshpzfoxgc'

  return new Promise<void>((resolve, reject) => {
    let upload = new tus.Upload(stream2, {
      endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${token}`,
        apiKey: process.env.SUPABASE_ANON_KEY!
        // 'x-upsert': 'true', // optionally set upsert to true to overwrite existing files
      },
      uploadDataDuringCreation: false,
      uploadLengthDeferred: true,
      // removeFingerprintOnSuccess: true, // Important if you want to allow re-uploading the same file https://github.com/tus/tus-js-client/blob/main/docs/api.md#removefingerprintonsuccess
      metadata: {
        bucketName: 'transcripts',
        objectName: `${userId}/${file.name}`,
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
      onSuccess: function () {
        // const file = upload.file
        console.log('Download %s from %s', file.name, upload.url)
        resolve()
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
