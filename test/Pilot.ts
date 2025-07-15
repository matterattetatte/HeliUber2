describe("Pilot", () => {
  // describe creating pilot profile
  let heliUber, deployer, pilot, transaction

  beforeEach(async () => {
    [deployer, pilot] = await ethers.getSigners()
    const HeliUber = await ethers.getContractFactory("HeliUber")
    heliUber = await HeliUber.deploy()
  })

  it("gets empty profile", async () => {
    const profile = await heliUber.getPilotProfile(pilot.address)

    expect(profile.name).to.equal("")
  })

  it("should create a pilot profile and then fetch its data", async () => {
    const profile = {
      name: "John Doe",
      licenseNumber: "XYZ123",
    }

    transaction = await heliUber.connect(pilot).registerPilot(profile.name, profile.licenseNumber)
    await transaction.wait()
    const pilotProfile = await heliUber.getPilotProfile(pilot.address)
    expect(pilotProfile.name).to.equal(profile.name)
    expect(pilotProfile.licenseNumber).to.equal(profile.licenseNumber)
    expect(pilotProfile.rating).to.equal(0)
    expect(pilotProfile.totalRides).to.equal(0)
  })
})