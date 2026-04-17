import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// AJOUTÉ DEPUIS STOCK THS : Tailwind CSS
import './assets/main.css'

// UX-6 : motion design SLA global (pulse, fade-in, stagger, prefers-reduced-motion)
import './assets/sla-motion.css'

// AJOUTÉ DEPUIS STOCK THS : Vue Toastification pour notifications
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const app = createApp(App)

// Configuration Vue Toastification (copiée depuis Stock THS)
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
}

app.use(createPinia())
app.use(router)
app.use(Toast, toastOptions)

console.log('[CRV] Application démarrée - Contrat backend intégré')

app.mount('#app')
