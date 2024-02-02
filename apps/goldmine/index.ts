import { Kafka } from 'kafkajs';
import { splitTranscriptIntoBatches, getGoodBitsFromDaVinci } from './helpers';
import createSupabaseClient from './services/supabase';

const host = process.env.NODE_ENV === 'production' ?
  'kafka' : 'localhost'

const kafka = new Kafka({
  clientId: 'scriptsifter-goldmine',
  brokers: [`${host}:9092`],
});

const consumer = kafka.consumer({ groupId: 'miners' });
const producer = kafka.producer();

const runConsumer = async () => {
  await consumer.connect();
  // subscribe to 'transcription complete' topic
  await consumer.subscribe({ topic: 'transcription-complete', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const messageValue = JSON.parse(message.value?.toString());
      console.log({
        partition,
        offset: message.offset,
        // @ts-ignore
        value: messageValue,
      });

      const { entries, token, transcriptId } = messageValue
      const supabase = createSupabaseClient(token);

      console.log('entries[0]', entries[0])

      // 1. make context-sized chunks
      const batches = splitTranscriptIntoBatches(entries)
      console.log('batches[0]', batches[0])


      // 2. send chunks to gpt-4
      const gptResponse = await getGoodBitsFromDaVinci(batches)
      console.log('gptResponse[0]', gptResponse[0])
      if (!gptResponse || !(gptResponse.length > 0)) {
        // response.status(500).json({ error: 'No response from Whisper' })
        // throw error
        console.error('No response from Whisper')
      }

      // 3. process the gpt-4 responses and aggregate the results
      const getSelections = (responses: ChatCompletion[]) => {
        return responses.flatMap(({ choices }) => {
          const content = choices[0].message.content?.split('\n').filter(Boolean)
          return content?.map((selection) => {
            const parts = selection.split(': ')
            const times = parts[0].split(' - ')
            return {
              start: parseFloat(times[0]),
              end: parseFloat(times[1]),
              content: parts[1]
            }
          })
        })
      }

      const selections = getSelections(gptResponse)

      console.log('selections[0]', selections[0])

      // 3. save relevant data to db
      const { data: id, error: dbError } = await supabase.rpc('save_selections_update_transcript', {
        transcript_input: gptResponse,
        selections_input: selections,
        transcript_id: transcriptId,
      })

      if (dbError) { console.error(dbError); return }
      console.log('data', id)



      // 4. publish 'processing complete' message to kafka topic with transcript id
      await producer.connect()
      await producer.send({ topic: 'mining-complete', messages: [{ value: JSON.stringify({ progress: 'done', transcriptId }) }] })
    },
  });
};

runConsumer().catch(console.error);


// const server = Bun.serve({
//   port: 3002,
//   fetch(request) {
//     console.log('request', request);
//     const res = new Response(JSON.stringify({ message: "Welcome to Bun2!" }));
//     res.headers.set("Access-Control-Allow-Origin", "*");
//     res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//     // res.headers.set("Access-Control-Allow-Headers", "Content-Type");
//     return res
//   },
// });

// console.log(`Listening on http://localhost:${server.port}`);
