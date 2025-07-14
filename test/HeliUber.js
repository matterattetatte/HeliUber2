const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

// Global constants for listing an item...
const ID = 1
const NAME = "Shoes"
const CATEGORY = "Clothing"
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
const COST = tokens(1)
const RATING = 4
const STOCK = 5

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

  describe("Listing", () => {
    let transaction

    beforeEach(async () => {
      // List a item
      transaction = await heliUber.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()
    })

    it("Returns item attributes", async () => {
      const item = await heliUber.items(ID)

      expect(item.id).to.equal(ID)
      expect(item.name).to.equal(NAME)
      expect(item.category).to.equal(CATEGORY)
      expect(item.image).to.equal(IMAGE)
      expect(item.cost).to.equal(COST)
      expect(item.rating).to.equal(RATING)
      expect(item.stock).to.equal(STOCK)
    })

    it("Emits List event", () => {
      expect(transaction).to.emit(heliUber, "List")
    })
  })

  describe("Buying", () => {
    let transaction

    beforeEach(async () => {
      // List a item
      transaction = await heliUber.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()

      // Buy a item
      transaction = await heliUber.connect(buyer).buy(ID, { value: COST })
      await transaction.wait()
    })


    it("Updates buyer's order count", async () => {
      const result = await heliUber.orderCount(buyer.address)
      expect(result).to.equal(1)
    })

    it("Adds the order", async () => {
      const order = await heliUber.orders(buyer.address, 1)

      expect(order.time).to.be.greaterThan(0)
      expect(order.item.name).to.equal(NAME)
    })

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(heliUber.address)
      expect(result).to.equal(COST)
    })

    it("Emits Buy event", () => {
      expect(transaction).to.emit(heliUber, "Buy")
    })
  })

  describe("Withdrawing", () => {
    let balanceBefore

    beforeEach(async () => {
      // List a item
      let transaction = await heliUber.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()

      // Buy a item
      transaction = await heliUber.connect(buyer).buy(ID, { value: COST })
      await transaction.wait()

      // Get Deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      // Withdraw
      transaction = await heliUber.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(heliUber.address)
      expect(result).to.equal(0)
    })
  })

  describe.only("Creating Booking", () => {
    let heliUber, deployer, passenger, pilot, transaction;

    beforeEach(async () => {
      // Get signers
      [deployer, passenger, pilot] = await ethers.getSigners();

      // Deploy contract (example)
      const HeliUber = await ethers.getContractFactory("HeliUber");
      heliUber = await HeliUber.deploy();

      const destination = ethers.encodeBytes32String("Somewhere");

      // Create a booking as user1
      transaction = await heliUber.connect(passenger).bookRide(pilot.address, tokens(0.1), destination);
      await transaction.wait();
    });

    it("Creates a booking", async () => {
      // Fetch booking info, assuming it’s stored by user address
      // const booking = await heliUber.bookings(pilot, ID);

      // expect(booking.amount).to.equal(tokens(0.1));
      // expect(booking.status).to.equal(0); // Pending
    });

    it("Emits BookingCreated event", async () => {
      await expect(
        heliUber.connect(passenger).bookRide(ID, tokens(0.1), 2)
      ).to.emit(heliUber, "BookingCreated");
    });
  });
})
