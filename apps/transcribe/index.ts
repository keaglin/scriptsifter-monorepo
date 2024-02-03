import { Kafka } from 'kafkajs';
import jwt from 'jsonwebtoken';
import createSupabaseClient from './services/supabase';
import { join } from 'node:path';
import { extractAudioFromVideo, chunkAudio, transcribeChunks } from './helpers';
import invariant from 'tiny-invariant';

const host = process.env.NODE_ENV === 'production' ?
  'kafka' : 'localhost'

const kafka = new Kafka({
  clientId: 'scriptsifter-transcriber',
  brokers: [`${host}:9092`],
});

const consumer = kafka.consumer({ groupId: 'transcribers' });
const producer = kafka.producer();

invariant(process.env.SUPABASE_JWT_SECRET, 'SUPABASE_JWT_SECRET env var is required');

const runConsumer = async () => {
  await consumer.connect();

  await consumer.subscribe({ topic: 'file-uploaded', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // @ts-ignore
      const messageValue = JSON.parse(message.value?.toString());
      console.log('messageValue', messageValue);
      console.log({
        partition,
        offset: message.offset,
        value: messageValue,
      });

      const { token, location, transcriptId } = messageValue;

      const decodedToken = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
      if (!decodedToken) return;


      const supabase = createSupabaseClient(token);

      // 1. get the file from bucket
      try {
        console.log('fetching file from bucket')
        const { data, error } = await supabase.storage.from('transcripts').download(location);
        console.log('data', data)
        if (error) { console.log('error', error); return }
        if (data) console.log('data', data);
        const filename = location.split('/')[1]
        console.log('File downloaded:', filename);

        let filepath = `./downloads/${filename}`;

        console.log('filepath', filepath);
        const size = await Bun.write(filepath, data);
        const file = Bun.file(filepath)
        console.log('size', size);

        // 1.5 do processing to make whisper-sized chunks of file? do we still need to do this?
        console.log('file name', file)
        const filenameWithoutExtension = filename.split('.')[0]
        const chunkUploadPath = join('./downloads', filenameWithoutExtension)

        console.log('chunkUploadPath', chunkUploadPath)

        const isAudio = file.type.startsWith('audio/')
        console.log('isAudio', isAudio)


        if (!isAudio) {
          filepath = await extractAudioFromVideo(filepath)
        }


        if (!filepath) {
          // response.status(500).json({ error: 'File save failed.' })
          // throw error
        }

        const chunkDuration = 756
        const overlap = 1 // Overlap duration in seconds

        // 1. Split the audio into chunks
        const chunks = await chunkAudio(filepath, chunkUploadPath, chunkDuration, overlap)
        console.log('chunks', chunks)
        // transcribeChunks(chunks)
        // 2. Send chunks to whisper
        const transcription = await transcribeChunks(chunks)
        console.log('result 0', transcription[0])

        console.log(transcription);
        // 3. save relevant bits of metadata to db
        const fragments = transcription.flatMap((fragment) => {
          console.log('fragment', fragment)
          // @ts-ignore
          return fragment.map((seg) => ({
            ...seg,
            start: seg.start + seg.chunk_start_time,
            end: seg.end + seg.chunk_start_time
          }))
        })

        console.log('fragments', fragments[0])
        const fullText = fragments.map((res) => res.text.trim()).join(' ')
        const transcript = {
          content: fullText,
          whisperResponse: transcription,
        }

        // const { data: updateData, error: updateError } = await supabase.from('transcripts').update({ transcript }).match({ id: transcriptId })
        const { data: id, error: updateError } = await supabase.rpc('save_fragments_update_transcript', {
          transcript_input: transcript,
          fragments_input: fragments,
          transcript_id: transcriptId,
        })

        if (updateError) { console.log('error updating transcript', updateError); return }
        console.log('transcript id from update', id)

        const entries = fragments.map(({ start, end, text }) => ({ start, end, text }))

        console.log('entries[0]', entries[0])
        // 4. publish 'transcription complete' message to transcription-complete topic with transcript id
        await producer.connect()
        await producer.send({ topic: 'transcription-complete', messages: [{ value: JSON.stringify({ entries, transcriptId, token }) }] })
      } catch (err) {
        console.error(err);
      }
    },
  });
};

runConsumer().catch(console.error);

// 5. delete file from disk
// maybe we listen to processing-complete for this?
// just start a new consumer and when it's all done for this transcriptId
// delete related files
// const deleteFiles = async () => {
//   // if we don't get a done message, delete after x days?
//   await consumer.connect();

//   await consumer.subscribe({ topic: 'mining-complete', fromBeginning: true });

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       console.log('topic', topic)
//       // @ts-ignore
//       const messageValue = JSON.parse(message.value?.toString());
//       console.log('messageValue', messageValue);
//       console.log({
//         partition,
//         offset: message.offset,
//         value: messageValue,
//       });
//     }
//   })
// }

// deleteFiles().catch(console.error)
