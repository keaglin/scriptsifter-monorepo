'use client'

import { useState } from 'react'

export default function UploadForm() {
  const [file, setFile] = useState<File>()
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    try {
      setIsSubmitting(true)
      const data = new FormData()
      data.set('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      })
      // handle the error
      if (!res.ok) throw new Error(await res.text())
    } catch (e: unknown) {
      // Handle errors here
      console.error(e)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="file">
        File (audio or video):
        <input
          type="file"
          name="file"
          onChange={(e) => setFile(e.target.files?.[0])}
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

      <button type="submit" disabled={isSubmitting}>
        Upload
      </button>
    </form>
  )
}
