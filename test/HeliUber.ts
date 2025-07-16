import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from "chai"
import { ethers } from "hardhat"

export const tokens = (n: number) => ethers.parseEther(n.toString())

export const expectBalanceChange = (actualDelta: bigint, expectedDelta: bigint, options: { allowGreater?: boolean; epsilon?: bigint; allowLess?: boolean } = {}) => {
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
  require("./Pilot")
  require("./Passenger")
  require("./Booking")
})
