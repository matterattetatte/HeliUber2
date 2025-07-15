const { expect } = require("chai")

const tokens = (n) => ethers.parseEther(n.toString())

/**
 * Assert expected ETH balance changes after a transaction
 *
 * @param {bigint} actualDelta - Actual change in ETH balance (in wei)
 * @param {bigint} expectedDelta - Expected change in ETH balance (in wei)
 * @param {object} options - { allowGreater?: boolean, epsilon?: bigint }
 */
function expectBalanceChange(actualDelta, expectedDelta, options = {}) {
  const allowGreater = options.allowGreater ?? false;
  const allowLess = options.allowLess ?? false;
  const epsilon = options.epsilon ?? ethers.parseEther("0.001");

  if (allowGreater) {
    // e.g. passenger overpaid due to gas
    expect(actualDelta >= expectedDelta).to.be.true;
    expect(actualDelta - expectedDelta < epsilon).to.be.true;
  } else if (allowLess) {
    // e.g. pilot received funds but paid tx gas (so net increase is slightly less)
    expect(expectedDelta - actualDelta < epsilon).to.be.true;
  } else {
    expect(actualDelta).to.equal(expectedDelta);
  }
}

describe("HeliUber", () => {
  describe("Creating Booking", () => {
    let heliUber, passenger, pilot, transaction

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
    let heliUber, deployer, passenger, pilot, transaction, token, initialPassengerBalance, initialPilotBalance, initialContractBalance, contractAddress

    beforeEach(async () => {
      [deployer, passenger, pilot] = await ethers.getSigners()

      const HeliUber = await ethers.getContractFactory("HeliUber")
      heliUber = await HeliUber.deploy()

      initialPassengerBalance = await ethers.provider.getBalance(passenger.address)
      initialPilotBalance = await ethers.provider.getBalance(pilot.address)
      contractAddress = await heliUber.getAddress()
      initialContractBalance = await ethers.provider.getBalance(contractAddress)

      // Create a booking
      const destination = ethers.encodeBytes32String("Somewhere")
      token = tokens(0.1)
      transaction = await heliUber.connect(passenger).bookRide(pilot.address, token, destination, { value: token })
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

      const passengerBalance = await ethers.provider.getBalance(passenger.address)
      const pilotBalance = await ethers.provider.getBalance(pilot.address)
      const contractBalance = await ethers.provider.getBalance(contractAddress)

      expect(passengerBalance).to.be.lessThan(initialPassengerBalance)
      expect(pilotBalance).to.be.greaterThan(initialPilotBalance)
      expect(contractBalance).to.be.greaterThan(initialContractBalance)
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
      const contractBalance = await ethers.provider.getBalance(contractAddress)

      const passengerDelta = initialPassengerBalance - passengerBalance;
      const pilotDelta     = pilotBalance - initialPilotBalance;
      const contractDelta  = contractBalance - initialContractBalance;

      expectBalanceChange(passengerDelta, token, { allowGreater: true });
      expectBalanceChange(pilotDelta, token * 99n / 100n, { allowLess: true });
      expectBalanceChange(contractDelta, token * 1n / 100n);
    })
  })
})
