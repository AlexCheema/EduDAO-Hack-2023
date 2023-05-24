import express from 'express';
import axios from 'axios';
import cors from 'cors';
const app = express();
app.use(cors());
const port = Number(process.env.PORT ?? '3000');
const rpcEndpoint = process.env.RPC_ENDPOINT ?? 'https://rpc.testnet.mantle.xyz';

async function getRollupGasPrices() {
  const resp = await axios.post(rpcEndpoint, {
    jsonrpc: "2.0",
    method: "rollup_gasPrices",
    params: [],
    id: 1,
  });

  if (!resp.data?.result) throw new Error(`no result in response: ${JSON.stringify(resp.data)}`);

  return {
    l1GasPrice: parseInt(resp.data.result.l1GasPrice, 16),
    l2GasPrice: parseInt(resp.data.result.l2GasPrice, 16),
  }
}

function gaussianRandom(mean=1e9, stdev=2e8) {
  let u = 1 - Math.random(); // Converting [0,1) to (0,1]
  let v = Math.random();
  let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}
async function getHistoricalGasPrices() {
  return [...Array(10).keys()].map(() => gaussianRandom());
}

app.get('/rollupGasPrices', async (req, res) => {
  const current = await getRollupGasPrices();
  const historical = await getHistoricalGasPrices();
  const spread = historical.reduce((tot, h) => tot + (h - current.l1GasPrice), 0);
  const avgSpread = spread / historical.length;
  const waitRatio = Math.random() > 0.5 ? Math.random()*2 : avgSpread / 1e9;
  const level = waitRatio > 1.2 ? 'high' : waitRatio < 0.8 ? 'low' : 'normal'
  res.json({
    current,
    waitRatio,
    level,
    historical,
  });
})

app.listen(port, () => {
  console.log(`listening on port ${port}`);
})

