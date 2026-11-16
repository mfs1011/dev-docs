import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initSync } from './sync'
import { initQisqartma } from './qisqartma'
import './styles/main.css'

initSync()
initQisqartma()

createApp(App).use(router).mount('#app')
