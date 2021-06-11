const fs = require('fs');
const Web3 = require("web3");
const HDWalletProvider = require('@truffle/hdwallet-provider');
const MaticPOSClient = require("@maticnetwork/maticjs").MaticPOSClient;

// Read in API keys.
const infuraKey = fs.readFileSync("../env/.infura_key").toString().trim();
const maticvigilKey = fs.readFileSync("../env/.maticvigil_key").toString().trim();
const mnemonic = fs.readFileSync("../env/.secret").toString().trim();
//const testUser = fs.readFileSync("../env/.user_test").toString().trim();
const testUser = "0x9805539dB3C2887075F185915bf371ccFa8a3402";

// Set up HDWallet providers for transactions that need to  be signed.
const goerliHDWalletProvider = new HDWalletProvider(
    mnemonic,
    `https://goerli.infura.io/v3/${infuraKey}`
    );
const mumbaiHDWalletProvider = new HDWalletProvider(
    mnemonic,
    `wss://rpc-mumbai.maticvigil.com/ws/v1/${maticvigilKey}`
    );

// Set up Web3 providers for monitoring the checkpoint.
const goerliWeb3Provider = new Web3.providers.WebsocketProvider(
    `wss://goerli.infura.io/ws/v3/${infuraKey}`
);
const goerliWeb3 = new Web3(goerliWeb3Provider);
const mumbaiWeb3Provider = new Web3.providers.WebsocketProvider(
    `wss://rpc-mumbai.maticvigil.com/ws/v1/${maticvigilKey}`
);
const mumbaiWeb3 = new Web3(mumbaiWeb3Provider);

// Contract adresses.
const goerliRootChainProxy = "0x2890bA17EfE978480615e330ecB65333b880928e";
const goerliRootChainManagerProxy = "0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74";
const goerliMintableERC20PredicateProxy = fs.readFileSync(
    "../env/goerli_mintableERC20_predicate_proxy").toString().trim();
const kissaMumbaiToken = "0xb73F00feEAFc232C247516AA180261fEc0E909fc";

// Amount we will withdraw from Mumbai to Goerli.
const withdrawalAmount = "10000000000000000000";  // 10 KISSA (in wei)

const goerliGasPrice = "500000000000";  // 500 gwei (in wei)
const goerliGasAmount = "8000000";  // Set 8,000,000 gas limit.


const maticPOSClient = new MaticPOSClient({
    network: "testnet",
    version: "mumbai",
    parentProvider: goerliHDWalletProvider,
    maticProvider: mumbaiHDWalletProvider,
    posRootChainManager: goerliRootChainManagerProxy,
    posERC20Predicate: goerliMintableERC20PredicateProxy,
    parentDefaultOptions: {
        from: testUser,
        gasPrice: goerliGasPrice,
        gas: goerliGasAmount
    },
    maticDefaultOptions: { from: testUser }
});

async function withdraw(amount) {
    try {
        let amountInEth = mumbaiWeb3.utils.fromWei(amount, "ether");
        console.log(`Burning ${amountInEth} KISSA on Mumbai...`);
        let tx = await maticPOSClient.burnERC20(
            kissaMumbaiToken,
            amount
            );
        console.log("Burned tokens on Mumbai.");
        console.log(tx.transactionHash);
        return tx.transactionHash;
    } catch (e) {
        console.error(e);
    }
}

// txHash - transaction hash on Matic
// rootChainAddress - root chain proxy address on Ethereum
// This check can take quite a long time to run (> 30 min).
async function checkInclusion(txHash, rootChainAddress) {
    console.log(`Waiting for verification of checkpoint inclusion of burn tx hash ${txHash}...`);
    let txDetails = await mumbaiWeb3.eth.getTransactionReceipt(txHash);

    block = txDetails.blockNumber;
    return new Promise(async (resolve, reject) => {
        goerliWeb3.eth.subscribe(
            "logs",
            {
                address: rootChainAddress,
            },
            async (error, result) => {
                if (error) {
                    reject(error);
                }

                console.log(result);
                if (result.data) {
                    let transaction = goerliWeb3.eth.abi.decodeParameters(
                        ["uint256", "uint256", "bytes32"],
                        result.data
                    );
                    if (block <= transaction["1"]) {
                        resolve(result);
                    }
                }
            }
        );
    });
}

// Make sure to give this enough gas on Goerli,
// otherwise it might take a long time or fail to mine.
async function exitTokens(burnHash) {
    try {
        console.log(`Exiting tokens with burn tx hash ${burnHash}...`);
        const tx = await maticPOSClient.exitERC20(burnHash);
        console.log("Exited tokens on Goerli.");
        console.log(tx.transactionHash);
        return tx.transactionHash;
    } catch (e) {
        console.error(e);
    }
}


// Withdraw tokens on Mumbai, 
// verify checkpoint inclusion,
// exit tokens on Goerli.

withdraw(withdrawalAmount).then((txHash) => {
    return [checkInclusion(txHash, goerliRootChainProxy),
    txHash];
}).then(async (res) => {
    let inclusionRes = await res[0];
    let burnHash = res[1];
    console.log(inclusionRes);
    goerliWeb3Provider.disconnect();
    return burnHash;
}).catch((err) => {
    console.log(err);
}).then(async (burnHash) => {
    await exitTokens(burnHash);
}).then(() => process.exit(0));