/**
 * useGlobalToast — Singleton toast global (reactive store)
 *
 * Contrairement a useToast (composable local par instance),
 * ce composable est un singleton partage par toute l'app.
 *
 * Usage dans n'importe quel composant :
 *   import { useGlobalToast } from '@/composables/useGlobalToast'
 *   const { success, error, warning, info } = useGlobalToast()
 *   success('Donnees sauvegardees')
 *   error('Echec de la requete')
 */

import { reactive } from 'vue'

let counter = 0

const state = reactive({
  toasts: []
})

function addToast(message, type = 'info', duration = 5000) {
  const id = ++counter
  state.toasts.push({ id, message, type })

  if (duration > 0) {
    setTimeout(() => {
      dismiss(id)
    }, duration)
  }

  // Max 5 toasts visibles
  if (state.toasts.length > 5) {
    state.toasts.shift()
  }

  return id
}

function dismiss(id) {
  const idx = state.toasts.findIndex(t => t.id === id)
  if (idx !== -1) state.toasts.splice(idx, 1)
}

function dismissAll() {
  state.toasts.splice(0)
}

export function useGlobalToast() {
  return {
    toasts: state.toasts,
    dismiss,
    dismissAll,
    show: addToast,
    success: (msg, duration) => addToast(msg, 'success', duration ?? 3000),
    error: (msg, duration) => addToast(msg, 'error', duration ?? 6000),
    warning: (msg, duration) => addToast(msg, 'warning', duration ?? 5000),
    info: (msg, duration) => addToast(msg, 'info', duration ?? 4000)
  }
}
