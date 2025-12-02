import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './index.css'

import App from './App.vue'
import router from './router'
import { initBarion } from '@/lib/barion'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize Barion pixel if configured via Vite env
const _barionPixelId = import.meta.env.VITE_BARION_PIXEL_ID as string | undefined
const _barionScriptUrl = import.meta.env.VITE_BARION_PIXEL_SCRIPT_URL as string | undefined
if (_barionPixelId) {
	initBarion(_barionPixelId, { scriptUrl: _barionScriptUrl })
}

app.mount('#app')
