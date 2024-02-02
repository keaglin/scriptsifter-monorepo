'use client'

import { upload } from "@/app/upload/actions"

export default function UploadForm() {
  return (
    <form action={upload}>
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
