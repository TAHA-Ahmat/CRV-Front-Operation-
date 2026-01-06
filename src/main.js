import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// AJOUTÉ DEPUIS STOCK THS : Tailwind CSS
import './assets/main.css'

// AJOUTÉ DEPUIS STOCK THS : Vue Toastification pour notifications
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Directives personnalisées - CONTRAT BACKEND
import permissionsDirectives from './directives/vCan'

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

// Enregistrer les directives de permissions (v-can, v-readonly)
app.use(permissionsDirectives)

console.log('[CRV] Application démarrée - Contrat backend intégré')

app.mount('#app')
