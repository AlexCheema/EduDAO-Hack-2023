import { scrapeBlocks, getLatestIndexedBlockNumber } from './rpc.js';

const rpcEndpoint = 'https://rpc.testnet.mantle.xyz' || process.env.RPC_ENDPOINT;

async function run() {
  const latestBlockNumber = await getLatestIndexedBlockNumber(rpcEndpoint);
  console.log({ latestBlockNumber });
  const blocks = await scrapeBlocks(rpcEndpoint, latestBlockNumber - 100, latestBlockNumber);
  console.log({ blocks: JSON.stringify(blocks, null, 2) });
}

await run();

