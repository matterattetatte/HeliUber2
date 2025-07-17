import './assets/main.css'
// import "leaflet/dist/leaflet.css";

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    if (accounts.length === 0) {
      window.location.href = '/'
    } else {
      console.log('🔑 Wallet connected/changed:', accounts[0]);
    }
  });
}
