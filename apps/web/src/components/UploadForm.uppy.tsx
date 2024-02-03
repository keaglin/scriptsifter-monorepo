'use client'

import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import Tus from '@uppy/tus'
// import RemoteSources from "@uppy/remote-sources";
import Webcam from "@uppy/webcam";
import ScreenCapture from "@uppy/screen-capture";
// import GoldenRetriever from "@uppy/golden-retriever";
import Audio from "@uppy/audio";
import { Dashboard as DashboardComponent, DashboardModal, DragDrop, ProgressBar, FileInput } from '@uppy/react'

import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import '@uppy/drag-drop/dist/style.css'
import '@uppy/file-input/dist/style.css'
import '@uppy/progress-bar/dist/style.css'

// .use(Dashboard, {
//   inline: true,
//   // height: 470,
//   width: '100%',
//   proudlyDisplayPoweredByUppy: true,
//   showProgressDetails: true,
//   hideUploadButton: true,
//   note: 'Upload audio or video',
//   metaFields: [
//     { id: 'title', name: 'Title', placeholder: 'Title' },>
//     { id: 'season', name: 'Season', placeholder: 'Season' },
//     { id: 'episodeNum', name: 'Episode Number', placeholder: 'Episode Number' },
//   ],
// })
export default function UploadForm({ token, userId }: { token: string, userId: string }) {
  const uppyDashboard = new Uppy()
    .use(Dashboard, {
      inline: true
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
        Authorization: `Bearer ${token}`,
      },
      chunkSize: 6 * 1024 * 1024,
      allowedMetaFields: null,
      removeFingerprintOnSuccess: true
    })


  const folderName = userId

  uppyDashboard.on('file-added', (file) => {
    file.name = `${Date.now()}-${file.name}`
    file.meta = {
      ...file.meta,
      bucketName: 'transcripts',
      objectName: folderName ? `${folderName}/${file.name}` : file.name,
      contentType: file.type,
    }
    // console.log('file.meta', file.meta)
  })


  uppyDashboard.on("complete", (result) => {
    if (result.failed.length === 0) {
      console.log("Upload successful");
    } else {
      console.warn("Upload failed");
    }
    console.log("successful files:", result.successful);
    console.log("failed files:", result.failed);
  });


  return (
    <DashboardComponent uppy={uppyDashboard} plugins={['Webcam', 'Audio', 'ScreenCapture']} />
  )
}

