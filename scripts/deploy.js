// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")
const { items } = require("../src/items.json")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  const [deployer] = await ethers.getSigners()

  // Deploy HeliUber
  const HeliUber = await hre.ethers.getContractFactory("HeliUber")
  const heliuber = await HeliUber.deploy()

  console.log(`Deployed HeliUber Contract at: ${await heliuber.getAddress()}\n`)
  console.log(`Check out out in the Sonic Explorer: https://testnet.soniclabs.com/address/${await heliuber.getAddress()}\n`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
