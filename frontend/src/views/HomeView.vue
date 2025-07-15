<script setup lang="ts">
import { ref } from 'vue'
import { publicClient, walletClient } from '../clients'

const userAddress = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// const SONIC_PARAMS = {
//   chainId: '57054',
//   chainName: 'Sonic Blaze Testnet',
//   rpcUrls: ['https://rpc.blaze.soniclabs.com'],
//   nativeCurrency: { name: 'Sonic', symbol: 'S', decimals: 18 },
//   blockExplorerUrls: ['https://testnet.sonicscan.org'],
// }

  const connect = async () => {
    const [addr] = await walletClient.requestAddresses();
    userAddress.value = addr;
  }

  connect()
</script>

<template>
  <main>
    <div>
      <h1>Welcome to HeliUber</h1>
      <div v-if="!userAddress">
        <button @click="connect">Connect Wallet</button>
        <p v-if="errorMessage">{{ errorMessage }}</p>
      </div>
      <div v-else>
        <p>Connected to Sonic as {{ userAddress }}</p>
        <!-- Proceed with passenger/pilot options here -->
         <!-- are you a pilot or a passenger? -->
        <p>Are you a pilot or a passenger?</p>
        <RouterLink to="/pilot">
          <button>Pilot</button>
        </RouterLink>
        <RouterLink to="/passenger">
          <button>Passenger</button>
        </RouterLink>
      </div>
    </div>
  </main>
</template>
