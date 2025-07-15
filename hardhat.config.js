require('dotenv').config()
require("@nomicfoundation/hardhat-toolbox")

/** @type import('hardhat/config').HardhatUserConfig */

const SONIC_PRIVATE_KEY = process.env.SONIC_PRIVATE_KEY

module.exports = {
  solidity: "0.8.17",
  networks: {
    sonic: {
      url: "https://rpc.blaze.soniclabs.com",
      accounts: [SONIC_PRIVATE_KEY]
    }
  }
}