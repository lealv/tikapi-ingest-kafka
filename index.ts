import { Kafka, Message, Producer, RecordMetadata } from "kafkajs";
import TikAPI from "tikapi";

const search: string = process.argv[2];
const limit: number = Number(process.argv[3]);
if (!search || isNaN(limit) || limit > 1000) {
  console.log("Usage : nodejs src/index.js <search> <limit>");
  console.log("<limit> must be a number <= 1000");
  process.exit(1);
}

const api = TikAPI("DemoAPIKeyTokenSeHYGXDfd4SFD320Sc39Asd0Sc39Asd4s");
api.set({
  $sandbox: true,
});

interface TikAPIVideoItem {
  author: {},
  authorStats: {},
  challenges: Array<any>,
  collected: boolean,
  createTime: number,
  desc: string,
  digged: boolean,
  duetEnabled: boolean,
  duetInfo: {},
  forFriend: boolean,
  id: string,
  isAd: boolean,
  itemCommentStatus: number,
  itemMute: boolean,
  music: {},
  officalItem: boolean,
  originalItem: boolean,
  privateItem: boolean,
  secret: boolean,
  shareEnabled: boolean,
  showNotPass: boolean,
  stats: {},
  stitchEnabled: boolean,
  textExtra: {},
  video: {},
  vl1: boolean
}

const kafka: Kafka = new Kafka({
  clientId: "app",
  brokers: ["localhost:9092"],
});
const producer: Producer = kafka.producer();

/**
 * Queries TikAPI's search endpoint.
 * Note that each request only pulls 12 items, so repeat requests until we reach the limit.
 * @param searchTerm
 * @param limit
 */
const searchTikAPI = async (
  searchTerm: string,
  limit: number
): Promise<TikAPIVideoItem[]> => {
  try {
    let response: Awaited<ReturnType<(typeof api)["public"]["search"]>> =
      await api.public.search({
        category: "videos",
        query: searchTerm,
      });

    let items: TikAPIVideoItem[] = response?.json?.item_list;

    while (response && items.length < limit) {
      response = await Promise.resolve(response?.nextItems?.());
      items = items.concat(response?.json?.item_list);
    }

    return items;
  } catch (err: any) {
    throw new Error("TikAPI request error: " + err?.message);
  }
};

run();
async function run() {
  try {
    const data = await searchTikAPI(search, limit);
    let messages: Message[] = data.map((x) => {
      return {
        value: JSON.stringify(x),
        partition: 0,
      };
    });

    console.log("Connecting to Kafka...");
    await producer.connect();
    console.log("Connected to Kafka!");

    console.log(`Sending ${messages.length} messages to Kafka...`);
    const result: RecordMetadata[] = await producer.send({
      topic: "TikAPI",
      messages: messages,
    });

    console.log(`Sent successfully to Kafka: ${JSON.stringify(result)}`);
    await producer.disconnect();
  } catch (ex: any) {
    console.error(`ERROR: ${ex?.message}`);
  } finally {
    process.exit(0);
  }
}
