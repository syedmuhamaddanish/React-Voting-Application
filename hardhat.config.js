
// Import the necessary modules
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")

// Define the environment variables
const GOERLI_URL = process.env.GOERLI_URL
// const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL ||
    "https://eth-sepolia.g.alchemy.com/v2/GHw98pcUCgbcC-_dFsPHkZ3p9iul_fV4"
const PRIVATE_KEY =
    process.env.PRIVATE_KEY ||
    "65699bb05c87c442dae754bf4caae5b74a00148d9dad1bdb5c4b2cfe65c6298b"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""

// Configure the Hardhat settings
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        goerli:{
            url: GOERLI_URL
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.8.7",
            },
            {
                version: "0.6.6",
            },
        ],
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
        // customChains: [], // uncomment this line if you are getting a TypeError: customChains is not iterable
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: COINMARKETCAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
    mocha: {
        timeout: 500000,
    },
}
//
//This code sets up the Hardhat configuration with the necessary plugins and settings. It defines the environment variables for the Ethereum network, the Etherscan API key, and the private key for the deployer. The configuration includes the default network, the list of networks, the Solidity compiler versions, the Etherscan settings, the gas reporter settings, the named accounts, and the Mocha test runner settings..</s>