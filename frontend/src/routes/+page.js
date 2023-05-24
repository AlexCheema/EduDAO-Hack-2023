/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
    const apiEndpoint = 'http://localhost:3000';
    const gasResp = await fetch(`${apiEndpoint}/rollupGasPrices`);
    const gas = await gasResp.json();

    return {
        gas
    };
}