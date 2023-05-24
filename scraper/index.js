import * as rpc from './rpc.js';
import { FileCursor, S3Cursor } from './cursor.js';
import { S3 } from '@aws-sdk/client-s3';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const rpcEndpoint = process.env.RPC_ENDPOINT ?? 'https://rpc.testnet.mantle.xyz';
const useS3 = !!process.env.USE_S3;
const s3 = new S3({});
const s3BucketName = process.env.S3_BUCKET_NAME;
const s3CursorKey = process.env.S3_CURSOR_KEY ?? 'cursor.json';

async function processBlocks(blocks) {
  const txHashes = blocks.reduce((a, b) => ([...a, ...b.transactions]), []);
  console.log(txHashes);
  const txs = await rpc.getTransactions(rpcEndpoint, txHashes);
  console.log(JSON.stringify(txs, null, 2));
  console.log(JSON.stringify(blocks, null, 2));

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
    const nextBlockNumberTo = Math.min(cursorBlockNumber + blockNumberBatchSize, latestBlockNumber);
    try {
      const blocks = await rpc.scrapeBlocks(rpcEndpoint, cursorBlockNumber + 1, nextBlockNumberTo);
<<<<<<< HEAD
      const blockNumbers = blocks.map(b => parseInt(b.number, 16));
      console.log(`Scraped ${blocks.length} blocks!`, Math.min(...blockNumbers), Math.max(...blockNumbers));
=======
>>>>>>> s3 for cursor and block storage
      await processBlocks(blocks);
      await cursor.save(nextBlockNumberTo);
      cursorBlockNumber = nextBlockNumberTo;
    } catch (err) {
      console.error(err);
      console.log(`error so will try again from block ${cursorBlockNumber} to ${nextBlockNumberTo}`);
    }
  }
}

await run();

