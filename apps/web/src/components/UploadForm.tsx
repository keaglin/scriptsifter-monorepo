'use client'
import { useEffect, useRef, useState } from 'react';
import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import Tus from '@uppy/tus'
// import RemoteSources from "@uppy/remote-sources";
import Webcam from "@uppy/webcam";
import ScreenCapture from "@uppy/screen-capture";
import Audio from "@uppy/audio";
import { Dashboard as DashboardComponent, DashboardModal, DragDrop, ProgressBar, FileInput } from '@uppy/react'

import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import '@uppy/drag-drop/dist/style.css'
import '@uppy/file-input/dist/style.css'
import '@uppy/progress-bar/dist/style.css'

export default function UploadForm({ token, userId }: { token: string, userId: string }) {
  const [uploadStatus, setUploadStatus] = useState<string>('idle')
  const [fileUploadLocation, setFileUploadLocation] = useState<string>('')
  const filename = useRef<string>('')
  // TODO: Fix ReferenceError: document is not defined; Uppy wants to render before the dom is ready
  // if (typeof window === 'undefined') return null
  // const [uppy] = useState(() =>

  const uppy = useRef<Uppy>(
    new Uppy().use(Dashboard, {
      inline: true, height: 470, width: '100%'
    })
      .use(Webcam, {
        target: Dashboard,
        showVideoSourceDropdown: true,
        showRecordingLength: true
      })
      .use(Audio, {
        target: Dashboard,
        showAudioSourceDropdown: true
      })
      .use(ScreenCapture, { target: Dashboard })
      .use(Tus, {
        endpoint: `https://uhpcxcyzuhmshpzfoxgc.supabase.co/storage/v1/upload/resumable`,
        uploadDataDuringCreation: true,
        headers: {
          // TODO: make sure this thing is fresh before you use it
          Authorization: `Bearer ${token}`,
        },
        chunkSize: 6 * 1024 * 1024,
        allowedMetaFields: null,
        removeFingerprintOnSuccess: true
      })
  )

  // useEffect(() => {
  //   uppy = new Uppy().use(Dashboard, {
  //     inline: true, height: 470, width: '100%'
  //   })
  //     .use(Webcam, {
  //       target: Dashboard,
  //       showVideoSourceDropdown: true,
  //       showRecordingLength: true
  //     })
  //     .use(Audio, {
  //       target: Dashboard,
  //       showAudioSourceDropdown: true
  //     })
  //     .use(ScreenCapture, { target: Dashboard })
  //     .use(Tus, {
  //       endpoint: `https://uhpcxcyzuhmshpzfoxgc.supabase.co/storage/v1/upload/resumable`,
  //       uploadDataDuringCreation: true,
  //       headers: {
  //         // TODO: make sure this thing is fresh before you use it
  //         Authorization: `Bearer ${token}`,
  //       },
  //       chunkSize: 6 * 1024 * 1024,
  //       allowedMetaFields: null,
  //       removeFingerprintOnSuccess: true
  //     })
  // }, [token])
  // // )

  if (!uppy) return null

  const folderName = userId
  // console.log('folderName', folderName)

  uppy.current?.on('file-added', (file) => {
    filename.current = `${Date.now()}-${file.name}`
    const fileUploadLocation = `${folderName}/${filename.current}`
    console.log('fileUploadLocation', fileUploadLocation)
    // console.log('file.name', file.name)
    file.meta = {
      ...file.meta,
      bucketName: 'transcripts',
      objectName: fileUploadLocation,
      contentType: file.type,
    }
    setFileUploadLocation(fileUploadLocation)
    // console.log('file.meta', file.meta)
  })


  uppy.current?.on("complete", (result) => {
    if (result.failed.length === 0) {
      console.log("Upload successful");
      console.log("successful files:", result.successful);
      setUploadStatus('success')
    } else {
      console.warn("Upload failed");
      console.log("failed files:", result.failed);
      setUploadStatus('failed')
    }
  })

  // useEffect(() => {
  // console.log('useEffect ran ', Date.now())
  // const supabase = createClient()
  const processUpload = async () => {
    const body = JSON.stringify({
      token,
      userId,
      fileUploadLocation,
    })

    setUploadStatus('idle')
    setFileUploadLocation('')
    filename.current = ''

    await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })
  }

  if (uploadStatus === 'success') {
    processUpload()
  }


  // }, [uploadStatus, userId, fileUploadLocation, token]);

  return (
    <DashboardComponent uppy={uppy.current} plugins={['Webcam', 'Audio', 'ScreenCapture']} />
  )
}

