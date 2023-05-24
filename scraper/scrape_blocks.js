import * as rpc from './rpc.js';
import { FileCursor, S3Cursor } from './cursor.js';
import { S3 } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const rpcEndpoint = process.env.RPC_ENDPOINT ?? 'https://rpc.testnet.mantle.xyz';
const useS3 = !!process.env.USE_S3;
const s3 = new S3({});
const s3BucketName = process.env.S3_BUCKET_NAME;
const s3CursorKey = process.env.S3_CURSOR_KEY ?? 'cursor.json';

async function processBlocks(blocks) {
  // const txHashes = blocks.reduce((a, b) => ([...a, ...b.transactions]), []);
  // const txs = await rpc.getTransactions(rpcEndpoint, txHashes);

  const blockNumbers = blocks.map(b => parseInt(b.number, 16));
  const min = Math.min(...blockNumbers);
  const max = Math.max(...blockNumbers);
  console.log(`Scraped ${blocks.length} blocks from ${min} to ${max}!`);
  if (!useS3) return;

  const key = `blocks/${min}_${max}.json`;
  await s3.send(new PutObjectCommand({
    Bucket: s3BucketName, Key: key, Body: JSON.stringify(blocks)
  }));
}

async function run() {
  const cursor = useS3 ?
    S3Cursor(s3, s3BucketName, s3CursorKey) :
    FileCursor('cursor.json', 0);

  const latestBlockNumber = await rpc.getLatestIndexedBlockNumber(rpcEndpoint);
  console.log({ latestBlockNumber });

  let cursorBlockNumber = await cursor.get();
  const blockNumberBatchSize = 1000;
  while (cursorBlockNumber < latestBlockNumber) {
    try {
      const concurrency = 25;
      const scrapedBlockNumbers = await Promise.all([...Array(concurrency).keys()].map(async (batch) => {
        const fromBlock = cursorBlockNumber + 1 + batch*blockNumberBatchSize;
        const toBlock = Math.min(fromBlock + blockNumberBatchSize - 1, latestBlockNumber);
        if (fromBlock > latestBlockNumber) return [latestBlockNumber, latestBlockNumber];

        console.log(`Sccraping from ${fromBlock} to ${toBlock}`);
        const blocks = await rpc.scrapeBlocks(rpcEndpoint, fromBlock, toBlock);
        await processBlocks(blocks);

        return [fromBlock, toBlock];
      }));
      const nextCursor = Math.max(...scrapedBlockNumbers.map(bn => bn[1]));
      await cursor.save(nextCursor);
      cursorBlockNumber = nextCursor;
    } catch (err) {
      console.error(err);
      console.log(`error so will try again from block ${cursorBlockNumber}`);
    }
  }
}

await run();

