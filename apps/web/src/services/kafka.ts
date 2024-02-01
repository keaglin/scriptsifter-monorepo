import { Kafka } from "kafkajs";

const host = process.env.NODE_ENV === 'production' ?
  'kafka' : 'localhost'

export const kafka = new Kafka({
  clientId: "scriptsifter-web-client",
  brokers: [`${host}:9092`],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "web-uploaders" });

export { producer, consumer }
