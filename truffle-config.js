/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const HDWalletProvider = require('@truffle/hdwallet-provider');
//
const fs = require('fs');
const infuraKey = fs.readFileSync("./env/.infura_key").toString().trim();
const etherscanKey = fs.readFileSync("./env/.etherscan_key").toString().trim();
const maticvigilKey = fs.readFileSync("./env/.maticvigil_key").toString().trim();
const mnemonic = fs.readFileSync("./env/.secret").toString().trim();
const contractOwner = fs.readFileSync("./env/contract_owner").toString().trim();

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    //development-matic: {
    //  host: "127.0.0.1",     // Localhost (default: none)
    //  port: 8545,            // Standard Ethereum port (default: none)
    //  network_id: "*",       // Any network (default: none)
    //},
    // Another network with more advanced options...
    // advanced: {
    // port: 8777,             // Custom port
    // network_id: 1342,       // Custom network
    // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
    // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
    // from: <address>,        // Account to send txs from (default: accounts[0])
    // websocket: true        // Enable EventEmitter interface for web3 (default: false)
    // },
    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/${infuraKey}`),
      network_id: 3,       // Ropsten's id
      from: contractOwner,  // Owner
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    goerli: {
      provider: () => new HDWalletProvider(mnemonic, `wss://goerli.infura.io/ws/v3/${infuraKey}`),
      network_id: 5,       // Goerli's id
      from: contractOwner,  // Owner
      gas: 8000000,        // Use 8 million for contract deployment on Goerli
      gasPrice: 2000000000000,  // 500 gwei on Goerli
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    mainnet: {
      provider: () => new HDWalletProvider(mnemonic, `wss://mainnet.infura.io/ws/v3/${infuraKey}`),
      network_id: 1,       // Mainnet id
      from: contractOwner,  // Owner
      gas: 2000000,        // Gas sent with each transaction
      gasPrice: 15000000000,  // 15 gwei (in wei) (adjust based on current gas prices)
      confirmations: 0,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 5000,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: false     // Skip dry run before migrations? (default: false for public nets )
    },
    mumbai: {
      provider: () => new HDWalletProvider(mnemonic, `wss://rpc-mumbai.maticvigil.com/ws/v1/${maticvigilKey}`),
      network_id: 80001,
      from: contractOwner,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: false
    },
    maticmainnet: {
      provider: () => new HDWalletProvider(mnemonic, `wss://rpc-mainnet.maticvigil.com/ws/v1/${maticvigilKey}`),
      network_id: 137,
      from: contractOwner,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
    // Useful for private networks
    // private: {
    // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
    // network_id: 2111,   // This network is yours, in the cloud.
    // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },


  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.4",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },

  // Truffle DB is currently disabled by default; to enable it, change enabled: false to enabled: true
  //
  // Note: if you migrated your contracts prior to enabling this field in your Truffle project and want
  // those previously migrated contracts available in the .db directory, you will need to run the following:
  // $ truffle migrate --reset --compile-all

  db: {
    enabled: false
  },

  plugins: [
    'truffle-plugin-verify'
  ],

  api_keys: {
    etherscan: etherscanKey
  }
};
