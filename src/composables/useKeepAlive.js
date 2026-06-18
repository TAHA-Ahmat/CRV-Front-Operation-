import { onMounted, onUnmounted } from 'vue'

export function useKeepAlive() {
  const INTERVAL_MS = 13 * 60 * 1000
  const HEALTH_URL = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://crv-back-operation.onrender.com'}/health`
  let timer = null

  function ping() {
    fetch(HEALTH_URL, { method: 'GET', mode: 'no-cors' }).catch(() => {})
  }

  onMounted(() => {
    ping()
    timer = setInterval(ping, INTERVAL_MS)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })
}
