const KissaChild = artifacts.require("KissaChild")

const fs = require('fs');

const contractOwner = fs.readFileSync("../env/contract_owner").toString().trim();

// For debug/testing
const mumbaiChildChainManagerProxy = fs.readFileSync(
    "../env/mumbai_child_chain_manager_proxy").toString().trim();

// For Matic Mainnet
const maticmainnetChildChainManagerProxy = fs.readFileSync(
    "../env/matic_mainnet_child_chain_manager_proxy").toString().trim();

let allowedNetworks = ["mumbai", "maticmainnet", "development-matic"];

module.exports = async function (deployer, network, accounts) {
    let isAllowedNetwork = allowedNetworks.includes(network);
    if (isAllowedNetwork) {
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