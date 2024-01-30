import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "scriptsifter-web-client",
  brokers: ["localhost:9092", 'kafka:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "web-uploaders" });

export { producer, consumer }
