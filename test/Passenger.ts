import { expect } from "chai"
import { ethers } from "hardhat"
import { tokens } from "./HeliUber"

describe("Passenger", () => {
  // describe creating pilot profile
  let heliUber, deployer, passenger, transaction

  beforeEach(async () => {
    [deployer, passenger] = await ethers.getSigners()
    const HeliUber = await ethers.getContractFactory("HeliUber")
    heliUber = await HeliUber.deploy()
  })

  it("gets empty profile", async () => {
    const profile = await heliUber.getPassengerProfile(passenger.address)

    expect(profile.name).to.equal("")
  })

  it("should create a pilot profile and then fetch its data", async () => {
    const profile = {
      name: "John Doe",
    }

    transaction = await heliUber.connect(passenger).registerPassenger(profile.name)
    await transaction.wait()
    const passengerProfile = await heliUber.getPassengerProfile(passenger.address)
    expect(passengerProfile.name).to.equal(profile.name)
  })
})