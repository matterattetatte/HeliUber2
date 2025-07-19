import { expect } from "chai"
import { ethers } from "hardhat"
import { expectBalanceChange, tokens } from "./HeliUber"

describe("Booking", () => {
  describe("Creating Booking", () => {
    let heliUber, plnc, passenger, deployer, pilot, transaction

    beforeEach(async () => {
      [deployer, passenger, pilot] = await ethers.getSigners()

      const PLNC = await ethers.getContractFactory("PLNC")
      plnc = await PLNC.deploy(deployer.address)

      const HeliUber = await ethers.getContractFactory("HeliUber")
      heliUber = await HeliUber.deploy(await plnc.getAddress())

      await plnc.connect(deployer).mint(passenger.address, tokens(1000))
    })
    it("create booking and process payment", async () => {
      const destination = ethers.encodeBytes32String("Somewhere")

      const token = tokens(100)

      await plnc.connect(passenger).approve(await heliUber.getAddress(), token);

      const tx = await heliUber.connect(passenger).bookRide(pilot.address, token, destination)
      await tx.wait()

      expect(tx).to.emit(heliUber, "RideBooked")

      const rides = await heliUber.getRidesForPassenger(passenger.address)

      expect(rides.length).to.equal(1)

      expect(rides[0].passenger).to.equal(passenger.address)
      expect(rides[0].pilot).to.equal(pilot.address)
      expect(rides[0].price).to.equal(token)
      expect(rides[0].destination).to.equal(destination)
      expect(rides[0].status).to.equal(1) // Paid
      expect(rides[0].passengerConfirmed).to.equal(false)
      expect(rides[0].pilotConfirmed).to.equal(false)
    })
    it("should create booking and process payment, even if the user has another booking", async () => {
      // populate data first
      const destination = ethers.encodeBytes32String("Somewhere")
      const token = tokens(0.1)

      await plnc.connect(passenger).approve(await heliUber.getAddress(), token * 2n);

      const tx1 = await heliUber.connect(passenger).bookRide(pilot.address, token, destination)
      await tx1.wait()
      
      const tx2 = await heliUber.connect(passenger).bookRide(pilot.address, token, destination)
      await tx2.wait()
      expect(tx2).to.emit(heliUber, "RideBooked")

      const rides = await heliUber.getRidesForPassenger(passenger.address)
      expect(rides.length).to.equal(2)
    })
  })
  describe("Confirming Booking", () => {
    let heliUber, deployer, passenger, pilot, plnc, transaction, token, initialPassengerBalance, initialPilotBalance, initialheliUberBalance, heliUberAddress

    beforeEach(async () => {
      [deployer, passenger, pilot] = await ethers.getSigners()

      const PLNC = await ethers.getContractFactory("PLNC")
      plnc = await PLNC.deploy(deployer.address)

      const HeliUber = await ethers.getContractFactory("HeliUber")
      heliUber = await HeliUber.deploy(await plnc.getAddress())

      await plnc.connect(deployer).mint(passenger.address, tokens(1000))

      initialPassengerBalance = await plnc.balanceOf(passenger.address)
      initialPilotBalance = await plnc.balanceOf(pilot.address)
      heliUberAddress = await heliUber.getAddress()
      initialheliUberBalance = await plnc.balanceOf(heliUberAddress)

      // Create a booking
      const destination = ethers.encodeBytes32String("Somewhere")
      token = tokens(0.1)

      await plnc.connect(passenger).approve(await heliUber.getAddress(), token);

      transaction = await heliUber.connect(passenger).bookRide(pilot.address, token, destination)
      await transaction.wait()
    })

    it("should confirm booking by passenger first", async () => {
      // Passenger confirms
      transaction = await heliUber.connect(passenger).confirmRide(passenger.address, 0)
      await transaction.wait()

      // Check ride status
      const rides = await heliUber.getRidesForPassenger(passenger.address)
      expect(rides[0].status).to.equal(2) // PassengerConfirmed

      // Pilot confirms
      transaction = await heliUber.connect(pilot).confirmRide(passenger.address, 0)
      await transaction.wait()

      // Check ride status after pilot confirmation
      expect(rides[0].status).to.equal(2) // BothConfirmed

      const passengerBalance = await plnc.balanceOf(passenger.address)
      const pilotBalance = await plnc.balanceOf(pilot.address)
      const heliUberBalance = await plnc.balanceOf(heliUberAddress)

      expect(passengerBalance).to.be.lessThan(initialPassengerBalance)
      expect(pilotBalance).to.be.greaterThan(initialPilotBalance)
      expect(heliUberBalance).to.be.greaterThan(initialheliUberBalance)
    })
    it("should confirm booking by pilot first", async () => {
      transaction = await heliUber.connect(pilot).confirmRide(passenger.address, 0)
      await transaction.wait()

      const rides = await heliUber.getRidesForPassenger(passenger.address)
      expect(rides[0].status).to.equal(3) // DriverConfirmed

      transaction = await heliUber.connect(passenger).confirmRide(passenger.address, 0)
      await transaction.wait()

      const updatedRides = await heliUber.getRidesForPassenger(passenger.address)

      expect(updatedRides[0].status).to.equal(5) // Completed

      const passengerBalance = await plnc.balanceOf(passenger.address)
      const pilotBalance = await plnc.balanceOf(pilot.address)
      const heliUberBalance = await plnc.balanceOf(heliUberAddress)

      const passengerDelta = initialPassengerBalance - passengerBalance;
      const pilotDelta     = pilotBalance - initialPilotBalance;
      const contractDelta  = heliUberBalance - initialheliUberBalance;

      expectBalanceChange(BigInt(passengerDelta), token, { allowGreater: true });
      expectBalanceChange(BigInt(pilotDelta), token * 99n / 100n, { allowLess: true });
      expectBalanceChange(BigInt(contractDelta), token * 1n / 100n);
    })
  })
})