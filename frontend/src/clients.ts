import { http, createPublicClient, createWalletClient, custom, defineChain } from 'viem'
import { sonicBlazeTestnet } from 'viem/chains'

const localhost = defineChain({
  id: 31337,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: { name: '', url: '' },
  },
})

const USE_LOCALHOST = false

const activeChain = USE_LOCALHOST ? localhost : sonicBlazeTestnet

export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(),
})

export const walletClient = createWalletClient({
  chain: activeChain,
  transport: custom(window.ethereum),
})
