import { Wallet } from 'ethers'
import fs from 'fs'

// Generate N random wallets
const N = 5
const accounts = Array.from({ length: N }, () => {
  const wallet = Wallet.createRandom()
  return {
    privateKey: wallet.privateKey,
    address: wallet.address
  }
})

// Output to console
console.log(JSON.stringify(accounts, null, 2))

// (Optional) Save to file
fs.writeFileSync('sonic-testnet-accounts.json', JSON.stringify(accounts, null, 2))
console.log('Generated accounts saved to sonic-testnet-accounts.json')
