import { http, createPublicClient, createWalletClient, custom } from 'viem'
import { sonicBlazeTestnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: sonicBlazeTestnet,
  transport: http(),
})

export const walletClient = createWalletClient({
  chain: sonicBlazeTestnet,
  transport: custom(window.ethereum),
})