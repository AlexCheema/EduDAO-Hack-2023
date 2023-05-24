import * as rpc from './rpc.js';
import { FileCursor } from './cursor.js';

const rpcEndpoint = process.env.RPC_ENDPOINT || 'https://rpc.testnet.mantle.xyz';

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
      console.log(`Scraped ${blocks.length} blocks!`, JSON.stringify(blocks.map(b => b.number)));
      await cursor.save(nextBlockNumberTo);
      cursorBlockNumber = nextBlockNumberTo;
    } catch (err) {
      console.error(err);
      console.log(`error so will try again from block ${cursorBlockNumber} to ${nextBlockNumberTo}`);
    }
  }
}

await run();

