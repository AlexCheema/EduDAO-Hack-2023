import * as rpc from './rpc.js';
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { processPromisesBatch } from './utils.js';
import { S3Cursor, FileCursor } from './cursor.js';

const rpcEndpoint = process.env.RPC_ENDPOINT ?? 'https://rpc.testnet.mantle.xyz';
const s3 = new S3({});
const useS3 = !!process.env.USE_S3;
const s3BucketName = process.env.S3_BUCKET_NAME;
const s3CursorKey = process.env.S3_CURSOR_KEY ?? 'txs_cursor.json';

async function getBlockRanges() {
  let nextContinuationToken = undefined;
  const allKeys = [];
  do {
    const resp = await s3.send(new ListObjectsV2Command({
      Bucket: s3BucketName,
      Prefix: `blocks/`,
      ContinuationToken: nextContinuationToken,
      MaxKeys: 1000,
    }));
    console.log(resp);
    allKeys.push(...(resp.Contents?.map(m => m.Key) ?? []));
    nextContinuationToken = resp.NextContinuationToken ?? undefined;
  } while(nextContinuationToken !== undefined);

  return allKeys.map(key => key.split('blocks/')[1].split('.json')[0]).map(key => (
    [Number(key.split('_')[0]), Number(key.split('_')[1])]
  ));
}

  /*const txHashes = blocks.reduce((a, b) => ([...a, ...b.transactions]), []);
  const txs = await rpc.getTransactions(rpcEndpoint, txHashes);*/

async function run() {
  const cursor = useS3 ?
    S3Cursor(s3, s3BucketName, s3CursorKey) :
    FileCursor('txs_cursor.json', 0);

  const cursorBlockNumber = await cursor.get();

  let blockRanges = await getBlockRanges();
  if (cursorBlockNumber) {
    blockRanges = blockRanges.filter(br => br[0] > cursorBlockNumber);
  }
  if (!blockRanges?.length) {
    console.log(`no block ranges to process (cursor: ${cursorBlockNumber})`);
    return;
  }
  console.log(blockRanges);

  await processPromisesBatch(blockRanges, 100, async (blockRange) => {
    const blocksResp = await s3.send(new GetObjectCommand({
      Bucket: s3BucketName,
      Key: `blocks/${blockRange[0]}_${blockRange[1]}.json`
    }));

    // console.log(blocksResp);
    if (!blocksResp?.Body) return [];
    const blocksString = await blocksResp.Body.transformToString();
    const blocks = JSON.parse(blocksString);
    console.log(`blocks/${blockRange[0]}_${blockRange[1]}.json: ${blocks.length}`);

    const txHashes = blocks.map(block => block.transactions).flat();
    const txs = await rpc.getTransactions(rpcEndpoint, txHashes);

    await s3.send(new PutObjectCommand({
      Bucket: s3BucketName,
      Key: `txs/${blockRange[0]}_${blockRange[1]}.json`,
      Body: JSON.stringify(txs)
    }));

    // return { blockRange, txs };
  });

  const maxBlockNumber = Math.max(...blockRanges.map(br => br[1]));
  if (maxBlockNumber) {
    await cursor.save(maxBlockNumber);
  }
}

await run();

