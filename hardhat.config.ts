import {config} from "dotenv"
config()

import "@nomicfoundation/hardhat-toolbox"
import '@typechain/hardhat'
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'


/** @type import('hardhat/config').HardhatUserConfig */

const SONIC_PRIVATE_KEY = process.env.SONIC_PRIVATE_KEY

module.exports = {
  solidity: "0.8.20",
  networks: {
    sonic: {
      url: "https://rpc.blaze.soniclabs.com",
      accounts: [SONIC_PRIVATE_KEY, '0xd8f9929df13d021412918b2c48c3cf024148cbff97ce91a970cd7b2e71157796', '0x48effaaa4c487766911c853f986fd101edb09ddabaae38a3be45533a13859b52']
    }
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
}