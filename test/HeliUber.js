const { expect } = require("chai")

const tokens = (n) => ethers.parseEther(n.toString())

describe("HeliUber", () => {
  let heliUber
  let deployer, buyer

  beforeEach(async () => {
    // Setup accounts
    [deployer, buyer] = await ethers.getSigners()

    // Deploy contract
    const HeliUber = await ethers.getContractFactory("HeliUber")
    heliUber = await HeliUber.deploy()
  })

  describe("Deployment", () => {
    it("Sets the owner", async () => {
      expect(await heliUber.owner()).to.equal(deployer.address)
    })
  })

  describe("Creating Booking", () => {
    let heliUber, deployer, passenger, pilot, transaction

    beforeEach(async () => {
      // Get signers
      [deployer, passenger, pilot] = await ethers.getSigners()

      const HeliUber = await ethers.getContractFactory("HeliUber")
      heliUber = await HeliUber.deploy()
    })
    it("create booking and process payment", async () => {
      const destination = ethers.encodeBytes32String("Somewhere")

      const token = tokens(0.1)

      const tx = await heliUber.connect(passenger).bookRide(pilot.address, token, destination, { value: token })
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
      const tx1 = await heliUber.connect(passenger).bookRide(pilot.address, token, destination, { value: token })
      await tx1.wait()
      
      const tx2 = await heliUber.connect(passenger).bookRide(pilot.address, token, destination, { value: token })
      await tx2.wait()
      expect(tx2).to.emit(heliUber, "RideBooked")

      const rides = await heliUber.getRidesForPassenger(passenger.address)
      expect(rides.length).to.equal(2)
    })
  })
  describe("Confirming Booking", () => {
    // it's only when both passenger and pilot confirm that the ride is considered confirmed
    // one test for when the driver confirms first
    // another test for when the passenger confirms first
    // make sure to check before and after the second confirmation
    let heliUber, deployer, passenger, pilot, transaction, token, initialPassengerBalance, initialPilotBalance, initialDeployerBalance

    beforeEach(async () => {
      // Get signers
      [deployer, passenger, pilot] = await ethers.getSigners()

      const HeliUber = await ethers.getContractFactory("HeliUber")
      heliUber = await HeliUber.deploy()

      // Create a booking
      const destination = ethers.encodeBytes32String("Somewhere")
      token = tokens(0.1)
      transaction = await heliUber.connect(passenger).bookRide(pilot.address, token, destination, { value: token })
      await transaction.wait()

      initialPassengerBalance = await ethers.provider.getBalance(passenger.address)
      initialPilotBalance = await ethers.provider.getBalance(pilot.address)
      initialDeployerBalance = await ethers.provider.getBalance(deployer.address)
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

      const passengerBalance = await ethers.provider.getBalance(passenger.address)
      const pilotBalance = await ethers.provider.getBalance(pilot.address)
      const deployerBalance = await ethers.provider.getBalance(deployer.address)

      expect(passengerBalance).to.be.lessThan(initialPassengerBalance)
      expect(pilotBalance).to.be.greaterThan(initialPilotBalance)
      expect(deployerBalance).to.be.greaterThan(initialDeployerBalance)
    })
    it.only("should confirm booking by pilot first", async () => {
      transaction = await heliUber.connect(pilot).confirmRide(passenger.address, 0)
      await transaction.wait()

      const rides = await heliUber.getRidesForPassenger(passenger.address)
      expect(rides[0].status).to.equal(3) // DriverConfirmed

      transaction = await heliUber.connect(passenger).confirmRide(passenger.address, 0)
      await transaction.wait()

      const updatedRides = await heliUber.getRidesForPassenger(passenger.address)

      expect(updatedRides[0].status).to.equal(5) // Completed

      const passengerBalance = await ethers.provider.getBalance(passenger.address)
      const pilotBalance = await ethers.provider.getBalance(pilot.address)
      const deployerBalance = await ethers.provider.getBalance(deployer.address)

      expect(passengerBalance).to.be.lessThan(initialPassengerBalance)
      expect(pilotBalance).to.be.greaterThan(initialPilotBalance)
      expect(deployerBalance).to.be.greaterThan(initialDeployerBalance)
    })
  })
})
