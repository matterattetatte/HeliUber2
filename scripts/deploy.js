// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")
const { writeFileSync } = require("fs")
const mockPilots = require("../mock/pilots.json")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  const [deployer, ...pilotSigners] = await ethers.getSigners()

  const PLNC = await hre.ethers.getContractFactory("PLNC")
  const plnc = await PLNC.deploy(deployer.address)

  // Deploy HeliUber
  const HeliUber = await hre.ethers.getContractFactory("HeliUber")
  const heliuber = await HeliUber.deploy(await plnc.getAddress())
  await heliuber.waitForDeployment()

  const address = await heliuber.getAddress()

  console.log(`Deployed HeliUber Contract at: ${address}\n`)
  console.log(`Check out out in the Sonic Explorer: https://testnet.soniclabs.com/address/${address}\n`)
  console.log(`Update the .env file in ../frontend with the new contract address\n`)

  console.log('Now, registering some random pilots...')

  for (const [index, pilot] of mockPilots.slice(0, 2).entries()) {
    const pilotBalance = await deployer.provider.getBalance(pilot.pilotAddress)
    console.log(`Pilot ${pilot.pilotAddress} balance before:`, ethers.formatEther(pilotBalance), 'ETH')

    if (pilotBalance === 0n) {
      const fundTx = await deployer.sendTransaction({
        to: pilot.pilotAddress,
        value: ethers.parseEther('0.05'), // e.g. 0.05 ETH
      })
      await fundTx.wait()
      console.log(`  → Funded with 0.05 ETH`)
    } else {
      console.log('  → Already has balance, skipping')
    }

    const pilotSigner = pilotSigners[index];

    // TODO: USE IPFS AND ALSO INCLUDE AN IMAGE URL
    const tx = await heliuber.connect(pilotSigner).registerPilot(pilot.name, pilot.licenseNumber, pilot.imageUrl);
    await tx.wait();
    console.log(`Registered pilot: ${pilot.name} with license ${pilot.licenseNumber}`);
  }



  writeFileSync('./frontend/.env', `VITE_HELIUBER_CONTRACT_ADDRESS=${address}\n`, { flag: 'w' })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
