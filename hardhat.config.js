require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

const PRIVATE_KEY = process.env.PRIVATE_KEY
const POLY_MAINNET_RPC_URL = process.env.POLY_MAINNET_RPC_URL
const ETH_MAINNET_RPC_URL = process.env.ETH_MAINNET_RPC_URL
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const POLYGONSCAN_API = process.env.POLYGONSCAN_API
const ETHERSCAN_API = process.env.ETHERSCAN_API
const COINMARKETCAP_API = process.env.COINMARKETCAP_API

module.exports = {
    solidity: "0.8.17",
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.6.12",
            },
            {
                version: "0.4.19",
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            // chainId: 31337,
            forking: {
                url: process.env.ETH_MAINNET_RPC_URL,
            },
        },
        polygonMumbai: {
            chainId: 80001,
            url: MUMBAI_RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
            blockConfirmations: 6,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            chainId: 5,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
        },
    },
    etherscan: {
        apiKey: {
            goerli: ETHERSCAN_API,
            polygonMumbai: POLYGONSCAN_API,
        },
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
}
