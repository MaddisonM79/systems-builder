import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@vue-flow/core/dist/style.css'
import './style.css'
import App from './App.vue'

// Apply saved theme before mount to prevent flash
const savedTheme = localStorage.getItem('sb-theme') ?? 'retro'
document.documentElement.dataset.theme = savedTheme

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
