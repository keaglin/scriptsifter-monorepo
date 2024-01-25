import { createReadStream } from "node:fs"
import { stat, mkdir, writeFile } from "node:fs/promises"
import ffmpeg from 'fluent-ffmpeg'
import { openai } from './services/openai'
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import type { Transcription } from "openai/resources/audio/transcriptions.mjs"

async function saveFileToDisk(file: Blob, filename: string): Promise<string> {

  const filePath = join('./downloads', filename)

  // node
  // const buffer = await file.arrayBuffer()
  // await writeFile(filePath, new Uint8Array(buffer))

  // bun
  const size = await Bun.write(filePath, file);
  console.log('size', size);

  return filePath
}

const transcribeChunks = async (chunks: Chunk[]) => {
  const transcriptionPromises = chunks.map(async (chunk) => {
    let result = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: createReadStream(chunk.filePath),
      response_format: 'verbose_json'
    })

    // console.log('result', result)
    // @ts-ignore
    result = result.segments?.map((seg) => ({ ...seg, chunk_start_time: chunk.startTime }))
    return result
  })

  const results = await Promise.allSettled(transcriptionPromises)

  const transcriptions: Transcription[] = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => (result as PromiseFulfilledResult<Transcription>).value)

  return transcriptions
}

// current impl on main
async function chunkAudio(
  audioPath: string,
  chunkUploadPath: string,
  chunkDuration: number,
  overlap: number
): Promise<Chunk[]> {
  const outputDir = chunkUploadPath
  const chunks: Chunk[] = []

  await mkdir(outputDir).catch((err) => {
    if (err.code !== 'EEXIST') {
      throw err
    }
  })

  const totalDuration = await getAudioDurationInSeconds(audioPath)
  const numChunks = Math.ceil(totalDuration / (chunkDuration - overlap))

  for (let counter = 0; counter < numChunks; counter++) {
    const segmentStart = counter * (chunkDuration - overlap)
    const currentOutputPath = `${outputDir}/chunk-${counter}.wav`

    let fileSize = 0
    const maxFileSize = 25 * 1024 * 1024 // 25 MB

    do {
      await new Promise((segmentResolve, segmentReject) => {
        ffmpeg(audioPath)
          .seekInput(segmentStart)
          .duration(chunkDuration)
          .audioFilters('silencedetect=n=-50dB:d=5')
          .outputOptions('-b:a', '256k', '-f', 'segment', '-loglevel', 'debug')
          .audioCodec('pcm_s16le')
          .format('wav')
          .output(currentOutputPath)
          .on('start', () => console.log('Starting to chunk audio'))
          .on('progress', (progress) => console.log('Progress:', progress))
          .on('end', segmentResolve)
          .on('error', (err) => segmentReject(err))
          .run()
      })

      fileSize = await getFileSize(currentOutputPath)
      if (fileSize > maxFileSize) {
        console.log('Chunk too large, reducing duration')
        // biome-ignore lint: it works; we can change it another time
        chunkDuration *= 0.9 // Reduce chunk duration by 10%
      }
    } while (fileSize > maxFileSize)

    // chunks.push(currentOutputPath)
    chunks.push({ filePath: currentOutputPath, startTime: segmentStart })
  }

  // console.log('chunks', chunks)

  return chunks
}

async function getAudioDurationInSeconds(audioPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      if (metadata.format.duration) {
        resolve(metadata.format.duration);
      } else {
        reject(new Error("Duration not found"));
      }
    });
  });
}

async function extractAudioFromVideo(videoPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const audioPath = videoPath.replace(/\.(mp4|mkv|avi|webm)$/, '.wav')

    ffmpeg(videoPath)
      .output(audioPath)
      .audioCodec('pcm_s16le')
      .audioChannels(1)
      .audioFrequency(16000)
      .on('end', () => resolve(audioPath))
      .on('error', (err) => reject(err))
      .run()
  })
}

async function getFileSize(path: string): Promise<number> {
  const stats = await stat(path)
  return stats.size
}



export { chunkAudio, extractAudioFromVideo, saveFileToDisk, transcribeChunks }
