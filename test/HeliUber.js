const { expect } = require("chai")

global.expect = expect
global.tokens = (n) => ethers.parseEther(n.toString())

/**
 * Assert expected ETH balance changes after a transaction
 *
 * @param {bigint} actualDelta - Actual change in ETH balance (in wei)
 * @param {bigint} expectedDelta - Expected change in ETH balance (in wei)
 * @param {object} options - { allowGreater?: boolean, epsilon?: bigint }
 */
global.expectBalanceChange = (actualDelta, expectedDelta, options = {}) => {
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
  require("./Pilot.js")
  require("./Passenger.js")
  require("./Booking.js")
})
