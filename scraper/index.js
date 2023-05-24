import * as rpc from './rpc.js';

const rpcEndpoint = process.env.RPC_ENDPOINT || 'https://rpc.testnet.mantle.xyz';

async function run() {
  const latestBlockNumber = await rpc.getLatestIndexedBlockNumber(rpcEndpoint);
  console.log({ latestBlockNumber });
  const blocks = await rpc.scrapeBlocks(rpcEndpoint, latestBlockNumber - 100, latestBlockNumber);
  console.log({ blocks: JSON.stringify(blocks, null, 2) });
}

await run();

