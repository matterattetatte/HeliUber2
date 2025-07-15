import type * as EthersNamespace from "ethers";
import { HeliUber, HeliUber__factory } from "../typechain-types";
import { expect as e } from 'chai'

declare module 'chai' {
  interface Assertion {
    emit: Chai.Assertion;
  }
}

declare global {
  var ethers: {
    encodeBytes32String: (value: string) => string;
    parseEther: (value: string) => bigint;
    getSigners: () => Promise<EthersNamespace.Signer[]>;
    provider: {
      getBalance: (address: string) => Promise<bigint>;
    };
    getContractFactory: (name: string) => Promise<HeliUber__factory>;
    parseUnits: (value: string, unit: number) => bigint;
  }

  var expectBalanceChange: (
    actualDelta: bigint,
    expectedDelta: bigint,
    options?: {
      allowGreater?: boolean;
      allowLess?: boolean;
      epsilon?: bigint;
    }
  ) => void;


  const HeliUber: HeliUber__factory;
  const heliUber: HeliUber;
  var tokens: (n: number) => bigint;
  // var expect: typeof e;
}

// Make this file a module to allow imports
export {};
