/**
 * useToast — Composable de notifications toast
 * Remplace les alert() natifs par des toasts non-bloquants.
 *
 * Usage:
 *   const { toast, showToast } = useToast()
 *   showToast('Message', 'error')   // types: success, error, warning, info
 *
 * Template:
 *   <div v-if="toast.show" class="toast-notification" :class="'toast-' + toast.type">
 *     <span class="toast-message">{{ toast.message }}</span>
 *     <button @click="toast.show = false" class="toast-close">&times;</button>
 *   </div>
 */

import { reactive } from 'vue'

export function useToast(duration = 5000) {
  const toast = reactive({
    show: false,
    message: '',
    type: 'info'  // success, error, warning, info
  })

  let timeoutId = null

  function showToast(message, type = 'info') {
    if (timeoutId) clearTimeout(timeoutId)
    toast.message = message
    toast.type = type
    toast.show = true
    timeoutId = setTimeout(() => {
      toast.show = false
    }, duration)
  }

  function hideToast() {
    if (timeoutId) clearTimeout(timeoutId)
    toast.show = false
  }

  return { toast, showToast, hideToast }
}
