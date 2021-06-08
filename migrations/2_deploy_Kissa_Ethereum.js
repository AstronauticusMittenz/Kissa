const Kissa = artifacts.require("Kissa")

const fs = require('fs');

const contractOwner = fs.readFileSync("../env/contract_owner").toString().trim();

// For debug/testing PoS Bridge
const goerliMintableERC20PredicateProxy = fs.readFileSync(
    "../env/goerli_mintableERC20_predicate_proxy").toString().trim();

// For Matic Mainnet
const ethereumMintableERC20PredicateProxy = fs.readFileSync(
    "../env/ethereum_mainnet_mintableERC20_predicate_proxy").toString().trim();

let allowedNetworks = ["goerli", "mainnet", "ropsten", "development", "private"];

module.exports = async function (deployer, network, accounts) {
    let isAllowedNetwork = allowedNetworks.includes(network);
    if (isAllowedNetwork) {
        if (network == "goerli") {
            mintableERC20PredicateProxy = goerliMintableERC20PredicateProxy;
        }
        else if (network == "mainnet") {
            mintableERC20PredicateProxy = ethereumMintableERC20PredicateProxy;
        }
        else {
            mintableERC20PredicateProxy = contractOwner;
        }
        await deployer.deploy(Kissa, mintableERC20PredicateProxy);
        const KissaToken = await Kissa.deployed();
    }
}