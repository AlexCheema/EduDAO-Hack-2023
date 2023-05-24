<script>
    /** @type {import('./$types').PageData} */
    export let data;

    import logo from './logo.png';
    import smartContract from './smart-contract.png';
    import trade from './trade.png';
    import loan from './loan.png';
    import loading from './loading-bar.gif';
    import dancing from './zoomer-wojak.gif';

    let deployPending = false;
    let deployDone = false;

    function clickDeploy() {
        console.log('click deploy');
        const signedTx = prompt('Paste your smart contract code below (estimated savings: 42%)');
        deployPending = true;
        setTimeout(() => {
            deployPending = false;
            deployDone = true;
        }, 5000);
    }
</script>

<div class="container">
    <div class="title">
        <img class="logo" alt="The project logo" src={logo} />
        <span>defer.tx</span>
    </div>

    <div class="subtitle">
        <span>defer your tx to save gas</span>
    </div>

    <div class="gasprices">
        <span class="gasprice-title">L1 fee</span><span class=gasprice-amount>{data.gas.current.l1GasPrice.toPrecision(3) / 1e9}</span><span class="gasprice-gwei">GWEI</span>
        <span class="gasprice-title">L2 fee</span><span class=gasprice-amount>{data.gas.current.l2GasPrice.toPrecision(3) / 1e9}</span><span class="gasprice-gwei">GWEI</span>

        <div class="gasprice-level-container">
            <span class="gasprice-level-title {data.gas.level}">Gas Price is currently </span>
            <span class="gasprice-level {data.gas.level}">{data.gas.level}</span>
        </div>

    </div>


    <div class="main">
        <button class="defer-btn" on:click={clickDeploy}>
            <img class="btn-img" alt="Deploy Smart Contract" src={smartContract}/>
            <span class="btn-title">Deploy</span>
        </button>
        <button class="defer-btn">
            <img class="btn-img" alt="Swap" src={trade}/>
            <span class="btn-title">Swap</span>
        </button>
        <button class="defer-btn">
            <img class="btn-img" alt="Loan" src={loan}/>
            <span class="btn-title">Loan</span>
        </button>
    </div>
        
    {#if !deployPending && !deployDone}
    <div class="gasprice-saving">
        <span class="gasprice-saving-text">Gas Prices are likely to fall. Save {42}% by waiting just {7} minutes!</span>
    </div>
    {/if}

    {#if deployPending}
    <div class="pending">
        <img class="loading-bar" alt="Loading Bar" src={loading}/>
    </div>
    {/if}

    {#if deployDone}
    <div class="done">
        Transaction complete: <a href="https://explorer.testnet.mantle.xyz/tx/0x8ab4c4796474267f1f487ab86a52dd735513a1eee4e81f258e7ca05f4ae78d0b">Block explorer tx</a>
        <br />
        You saved {42}% on your smart contract deployment! 🎉
        <br />
        <img class="dancing" alt="Dancing" src={dancing}/>
    </div>
    {/if}

    <div class="footer">
        <p><a href="/about">About</a></p>
    </div>
</div>

<style>
    .container {
        margin: auto;
        width: 50%;
        border: 3px solid black;
        padding: 10px;
        font-family: 'GT-Walsheim',sans-serif;
    }

    img.logo {
        width: 1em;
        height: 1em;
    }
    .title img {
        vertical-align: middle;
    }
    .title span {
        vertical-align: middle;
    }
    .title {
        font-size: 6em;
        text-align: center;
    }
    .subtitle {
        font-size: 2em;
        text-align: center;
        color: #36454F;
    }

    .gasprices {
        text-align: center;
        padding: 10px;
    }
    .gasprice-title {
        padding-right: 10px;
    }
    .gasprice-amount {
        font-weight: 900;
        padding-right: 5px;
        font-size: 1.2em;
    }
    .gasprice-gwei {
        padding-right: 20px;
        font-size: 0.5em;
    }
    .gasprice-level-container {
        padding-top: 5px;
    }
    .gasprice-level.low {
        color: green;
    }
    .gasprice-level.normal {
        color: royalblue;
    }
    .gasprice-level.high {
        color: red;
    }
    .gasprice-saving {
        font-size: 0.8em;
        text-align: center;
    }

    .pending {
        text-align: center;
    }
    .done {
        text-align: center;
    }

    .main {
        display: flex;
        padding-top: 5px;
        text-align: center;
        align-items: center;
        justify-content: center;
    }
    .defer-btn {
        width: 7.5em;
        height: 7.5em;
        background: gainsboro;
        border-radius: 0.5em;
        padding: 0.5em;
        margin: 0.5em;
        font-size: 1em;
    }
    .defer-btn:hover {
        cursor: pointer;
    }
    .defer-btn img {
        width: 5em;
        height: 5em;
    }


</style>