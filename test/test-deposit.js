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

// Set up HDWallet provider for transactions on Goerli.
const goerliHDWalletProvider = new HDWalletProvider(
    mnemonic,
    `https://goerli.infura.io/v3/${infuraKey}`
    );

// Set up Web3 provider for monitoring the state transfer.
const mumbaiWeb3Provider = new Web3.providers.WebsocketProvider(
    `wss://rpc-mumbai.maticvigil.com/ws/v1/${maticvigilKey}`
);

// Contract adresses.
const goerliRootChainManagerProxy = "0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74";
const goerliMintableERC20PredicateProxy = fs.readFileSync(
    "../env/goerli_mintableERC20_predicate_proxy").toString().trim();
const kissaGoerliToken = "0x6d590c894825DAC2eb92c5915eFde0DB77935F8F";

// Amount we will deposit to Mumbai from Goerli.
const depositAmount = "1000000000000000000";  // 10 KISSA (in wei)

const goerliGasPrice = "500000000000";  // 500 gwei (in wei)
const goerliGasAmount = "8000000";  // Set 8,000,000 gas limit.


const maticPOSClient = new MaticPOSClient({
    network: "testnet",
    version: "mumbai",
    parentProvider: goerliHDWalletProvider,
    maticProvider: mumbaiWeb3Provider,
    posRootChainManager: goerliRootChainManagerProxy,
    posERC20Predicate: goerliMintableERC20PredicateProxy,
    parentDefaultOptions: {
        from: testUser,
        gasPrice: goerliGasPrice,
        gas: goerliGasAmount
    },
    maticDefaultOptions: { from: testUser }
});

// To make things easier to read.
let amountInEth = Web3.utils.fromWei(depositAmount, "ether");


// Approve Goerli MintableERC20Proxy to spend test user's KISSA,
// deposit KISSA with MintableERC20Proxy,
// wait for tokens to be minted to test user's account on Mumbai.
console.log(`Approving ${amountInEth} KISSA for deposit in Goerli...`);
maticPOSClient.approveERC20ForDeposit(
    kissaGoerliToken,
    depositAmount
).then((tx) => {
    console.log("Tokens approved.");
    let txHash = tx.transactionHash;
    console.log(`Approval Tx hash:\n${txHash}`);    
}).catch((err) => {
    console.log("Error approving tokens:");
    console.log(err);
    process.exit(1);
}).then(async () => {
    console.log("Depositing tokens...");
    let depositTx = await maticPOSClient.depositERC20ForUser(
        kissaGoerliToken,
        testUser,
        depositAmount
    );
    return depositTx.transactionHash;
}).then((txHash) => {
    console.log("Tokens deposited.");
    console.log(`Deposit Tx hash:\n${txHash}`);
    console.log("Transaction can take a few minutes to show up in Polygon.");
}).catch((err) => {
    console.log("Error depositing tokens:");
    console.log(err);
    process.exit(1);
}).then(() => process.exit(0));