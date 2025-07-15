export const USDC_CONTRACT_ADDRESS =
  '0xA4879Fed32Ecbef99399e5cbC247E533421C4eC6';

export const USDC_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to',    type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
];