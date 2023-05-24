import * as rpc from './rpc.js';
import { FileCursor } from './cursor.js';

const rpcEndpoint = process.env.RPC_ENDPOINT || 'https://rpc.testnet.mantle.xyz';

async function processBlocks(blocks) {
  const txHashes = blocks.reduce((a, b) => ([...a, ...b.transactions]), []);
  console.log(txHashes);
  const txs = await rpc.getTransactions(rpcEndpoint, txHashes);
  console.log(JSON.stringify(txs, null, 2));
  console.log(JSON.stringify(blocks, null, 2));
}

async function run() {
  const cursor = FileCursor('cursor.json', 0);

  const latestBlockNumber = await rpc.getLatestIndexedBlockNumber(rpcEndpoint);
  console.log({ latestBlockNumber });

  let cursorBlockNumber = await cursor.get();
  const blockNumberBatchSize = 1000;
  while (cursorBlockNumber < latestBlockNumber) {
    const nextBlockNumberTo = Math.min(cursorBlockNumber + blockNumberBatchSize, latestBlockNumber);
    try {
      const blocks = await rpc.scrapeBlocks(rpcEndpoint, cursorBlockNumber + 1, nextBlockNumberTo);
      const blockNumbers = blocks.map(b => parseInt(b.number, 16));
      console.log(`Scraped ${blocks.length} blocks!`, Math.min(...blockNumbers), Math.max(...blockNumbers));
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

