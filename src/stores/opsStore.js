/**
 * OPS STORE — Store Pinia pour le Centre de Contrôle Opérationnel
 *
 * MODULE OPS CONTROL CENTER v1.0.0
 *
 * Gère :
 * - Connexion SSE (EventSource) pour le flux temps réel
 * - Dashboard snapshot via API REST
 * - Buffer d'événements (max 50)
 *
 * Architecture :
 * - connectSSE() ouvre un EventSource vers /api/ops/stream?token=xxx
 * - fetchDashboard() appelle GET /api/ops/dashboard (refresh toutes les 60s)
 * - Les événements SSE sont ajoutés au buffer en temps réel
 */

import { defineStore } from 'pinia'
import { opsAPI } from '@/services/api'

const MAX_EVENTS = 50

export const useOpsStore = defineStore('ops', {
  state: () => ({
    // ─── SSE ───
    connected: false,
    eventSource: null,
    events: [],

    // ─── Dashboard snapshot ───
    dashboard: {
      crvByStatus: {},
      totalCRV: 0,
      crvActifs: 0,
      alertes: 0,
      alertesDetail: [],
      recentEvents: [],
      clients: 0
    },

    // ─── UI ───
    loading: false,
    error: null,
    lastRefresh: null,
    refreshInterval: null
  }),

  getters: {
    /**
     * Événements récents (les 50 derniers, du plus récent au plus ancien)
     */
    recentEvents: (state) => {
      return [...state.events].reverse()
    },

    /**
     * Alertes actives (priorité CRITIQUE ou HAUTE)
     */
    activeAlerts: (state) => {
      return state.events
        .filter(e => e.priority === 'CRITIQUE' || e.priority === 'HAUTE')
        .reverse()
    },

    /**
     * CRV par statut depuis le dashboard
     */
    crvByStatus: (state) => {
      return state.dashboard.crvByStatus || {}
    },

    /**
     * Nombre total de CRV
     */
    totalCRV: (state) => {
      return state.dashboard.totalCRV || 0
    },

    /**
     * Indicateur de connexion SSE
     */
    isConnected: (state) => state.connected,

    /**
     * Nombre d'alertes actives
     */
    alertCount: (state) => {
      return state.events.filter(e =>
        e.priority === 'CRITIQUE' || e.priority === 'HAUTE'
      ).length
    }
  },

  actions: {
    // ─── SSE CONNECTION ─────────────────────────────────────────
    /**
     * Ouvre une connexion SSE vers le backend.
     * EventSource gère automatiquement la reconnexion.
     */
    connectSSE() {
      // Fermer une connexion existante
      this.disconnectSSE()

      try {
        const url = opsAPI.getStreamUrl()
        const eventSource = new EventSource(url)

        // Événement de connexion établie
        eventSource.addEventListener('connected', (e) => {
          const data = JSON.parse(e.data)
          this.connected = true
          this.error = null
          console.log('[OPS Store] SSE connecté:', data.user, `(${data.role})`)
        })

        // Buffer initial
        eventSource.addEventListener('init', (e) => {
          const buffer = JSON.parse(e.data)
          this.events = buffer
          console.log(`[OPS Store] Buffer initial: ${buffer.length} événements`)
        })

        // Événements temps réel (type par défaut = 'message')
        eventSource.onmessage = (e) => {
          try {
            const event = JSON.parse(e.data)
            this.events.push(event)

            // Limiter à MAX_EVENTS
            if (this.events.length > MAX_EVENTS) {
              this.events.shift()
            }
          } catch (err) {
            // Ignorer les données non-JSON (heartbeat, etc.)
          }
        }

        // Gestion des erreurs SSE
        eventSource.onerror = () => {
          this.connected = false
          console.warn('[OPS Store] SSE erreur — reconnexion automatique...')
        }

        // Quand la connexion s'ouvre
        eventSource.onopen = () => {
          this.connected = true
          this.error = null
        }

        this.eventSource = eventSource
      } catch (err) {
        this.error = 'Impossible de se connecter au flux temps réel'
        console.error('[OPS Store] Erreur connexion SSE:', err.message)
      }
    },

    /**
     * Ferme la connexion SSE.
     */
    disconnectSSE() {
      if (this.eventSource) {
        this.eventSource.close()
        this.eventSource = null
        this.connected = false
        console.log('[OPS Store] SSE déconnecté')
      }

      // Arrêter le refresh dashboard
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
        this.refreshInterval = null
      }
    },

    // ─── DASHBOARD API ──────────────────────────────────────────
    /**
     * Charge le snapshot du dashboard depuis l'API.
     */
    async fetchDashboard() {
      this.loading = true
      try {
        const response = await opsAPI.getDashboard()
        if (response.data?.success) {
          this.dashboard = response.data.data
          this.lastRefresh = new Date().toISOString()
          this.error = null
        }
      } catch (err) {
        console.error('[OPS Store] Erreur fetch dashboard:', err.message)
        this.error = 'Impossible de charger le dashboard'
      } finally {
        this.loading = false
      }
    },

    /**
     * Démarre le refresh automatique du dashboard (toutes les 60 secondes).
     */
    startAutoRefresh() {
      // Charger immédiatement
      this.fetchDashboard()

      // Puis toutes les 60 secondes
      this.refreshInterval = setInterval(() => {
        this.fetchDashboard()
      }, 60000)
    },

    /**
     * Initialise le module OPS : connexion SSE + auto-refresh dashboard.
     */
    initialize() {
      this.connectSSE()
      this.startAutoRefresh()
    },

    /**
     * Nettoie tout (à appeler dans onUnmounted).
     */
    cleanup() {
      this.disconnectSSE()
    },

    /**
     * Réinitialise le buffer d'événements.
     */
    clearEvents() {
      this.events = []
    }
  }
})
