const fs = require('fs');

const contractOwner = fs.readFileSync("../env/contract_owner").toString().trim();

// For debug/testing
const goerliMintableERC20PredicateProxy = fs.readFileSync(
    "../env/goerli_mintableERC20_predicate_proxy").toString().trim();

// For Mainnet
const ethereumMintableERC20PredicateProxy = fs.readFileSync(
    "../env/ethereum_mainnet_mintableERC20_predicate_proxy").toString().trim();

// For debug/testing
const mumbaiChildChainManagerProxy = fs.readFileSync(
    "../env/mumbai_child_chain_manager_proxy").toString().trim();

// For Matic Mainnet
const maticmainnetChildChainManagerProxy = fs.readFileSync(
    "../env/matic_mainnet_child_chain_manager_proxy").toString().trim();

module.exports = async function (deployer, network, accounts) {

    let ethNetworks = ["goerli", "mainnet", "ropsten"];
    let maticNetworks = ["mumbai", "maticmainnet"];

    let isEthNetwork = ethNetworks.includes(network);
    let isMaticNetwork = maticNetworks.includes(network);

    if (isEthNetwork) {
        const Kissa = artifacts.require("Kissa");

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

    } else if (isMaticNetwork) {

        const KissaChild = artifacts.require("KissaChild");

        if (network == "mumbai") {
            childChainManagerProxy = mumbaiChildChainManagerProxy;
        }
        else if (network == "maticmainnet") {
            childChainManagerProxy = maticmainnetChildChainManagerProxy;
        }
        else {
            childChainManagerProxy = contractOwner;
        }
        await deployer.deploy(KissaChild, childChainManagerProxy);
        const KissaChildToken = await KissaChild.deployed();

    }
}


