import { Kafka } from 'kafkajs'

const kafka = new Kafka({
  clientId: 'scriptsifter-web-client',
  brokers: ['localhost:9092', 'kafka:9092'],
});

const admin = kafka.admin();

async function createTopic() {
  await admin.connect();
  try {
    await admin.createTopics({
      topics: [
        { topic: 'file-uploaded', numPartitions: 10, replicationFactor: 1 },
        // I wonder if we could change the topics below so we can fire off 'progress' messages
        // from their respective services
        { topic: 'transcription-complete', numPartitions: 10, replicationFactor: 1 },
        { topic: 'mining-complete', numPartitions: 10, replicationFactor: 1 },
      ],
      waitForLeaders: true
    });
    console.log('Topics created successfully');
  } catch (error) {
    console.error('Error creating topics:', error);
  } finally {
    await admin.disconnect();
  }
}

createTopic();
