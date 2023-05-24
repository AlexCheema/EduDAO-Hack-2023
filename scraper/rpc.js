import axios from 'axios';

function formatBlock(b) {
  return typeof b === 'number' ? `0x${b.toString(16)}` : b;
}

export async function scrapeBlocks(rpcEndpoint, startBlock, endBlock = 'latest') {
  const resp = await axios.post(rpcEndpoint, {
    jsonrpc: "2.0",
    method: "eth_getBlockRange",
    params: [formatBlock(startBlock), formatBlock(endBlock), false],
    id: 1,
  });

  if (!resp.data?.result) throw new Error(`no result in response: ${JSON.stringify(resp.data)}`);

  return resp.data.result;
}

export async function getLatestIndexedBlockNumber(rpcEndpoint) {
  const resp = await axios.post(rpcEndpoint, {
    jsonrpc: "2.0",
    method: "eth_blockNumber",
    params: [],
    id: 1,
  });

  if (!resp.data?.result) throw new Error(`no result in response: ${JSON.stringify(resp.data)}`);

  return parseInt(resp.data.result.substring(2), 16);
}

