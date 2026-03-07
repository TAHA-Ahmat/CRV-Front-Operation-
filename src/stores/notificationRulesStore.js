/**
 * STORE NOTIFICATION RULES — Gestion admin de la matrice de notifications
 *
 * MODULE NOTIFICATION ENGINE v0.9.0
 * Utilise notificationRulesAPI (8 routes)
 */

import { defineStore } from 'pinia'
import { notificationRulesAPI } from '@/services/api'

export const useNotificationRulesStore = defineStore('notificationRules', {
  state: () => ({
    // Matrice complète des règles
    rules: [],

    // Métadonnées (domaines, priorités, rôles)
    metadata: null,

    // Statistiques
    stats: null,

    // Filtres actifs
    filters: {
      domain: '',
      priority: '',
      role: '',
      enabled: ''
    },

    // États
    loading: false,
    saving: false,
    error: null,
    lastUpdate: null
  }),

  getters: {
    /**
     * Règles groupées par domaine puis par événement.
     * Structure: { CRV: { CRV_CREE: [rule1, rule2...], ... }, ... }
     */
    rulesGrouped: (state) => {
      const grouped = {}
      for (const rule of state.rules) {
        const domain = rule.eventDomain
        if (!grouped[domain]) grouped[domain] = {}
        if (!grouped[domain][rule.event]) grouped[domain][rule.event] = []
        grouped[domain][rule.event].push(rule)
      }
      return grouped
    },

    /**
     * Liste des domaines ayant des règles
     */
    domains: (state) => {
      return [...new Set(state.rules.map(r => r.eventDomain))].sort()
    },

    /**
     * Événements uniques
     */
    events: (state) => {
      return [...new Set(state.rules.map(r => r.event))]
    },

    /**
     * Nombre de règles actives
     */
    activeCount: (state) => {
      return state.rules.filter(r => r.enabled).length
    },

    /**
     * Règles filtrées selon les filtres actifs
     */
    filteredRules: (state) => {
      let result = state.rules
      if (state.filters.domain) result = result.filter(r => r.eventDomain === state.filters.domain)
      if (state.filters.priority) result = result.filter(r => r.eventPriority === state.filters.priority)
      if (state.filters.role) result = result.filter(r => r.role === state.filters.role)
      if (state.filters.enabled !== '') {
        const enabled = state.filters.enabled === 'true'
        result = result.filter(r => r.enabled === enabled)
      }
      return result
    },

    /**
     * Règles filtrées groupées par domaine/événement
     */
    filteredGrouped() {
      const grouped = {}
      for (const rule of this.filteredRules) {
        const domain = rule.eventDomain
        if (!grouped[domain]) grouped[domain] = {}
        if (!grouped[domain][rule.event]) grouped[domain][rule.event] = []
        grouped[domain][rule.event].push(rule)
      }
      return grouped
    }
  },

  actions: {
    /**
     * Charge la matrice complète
     */
    async fetchMatrix() {
      this.loading = true
      this.error = null
      try {
        const response = await notificationRulesAPI.getMatrix()
        this.rules = response.data.data
        this.lastUpdate = new Date()
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur chargement matrice'
        console.error('[NotifRulesStore] fetchMatrix:', this.error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Charge les métadonnées (domaines, priorités, rôles)
     */
    async fetchMetadata() {
      try {
        const response = await notificationRulesAPI.getMetadata()
        this.metadata = response.data.data
      } catch (error) {
        console.error('[NotifRulesStore] fetchMetadata:', error.response?.data?.message)
      }
    },

    /**
     * Charge les statistiques
     */
    async fetchStats() {
      try {
        const response = await notificationRulesAPI.getStats()
        this.stats = response.data.data
      } catch (error) {
        console.error('[NotifRulesStore] fetchStats:', error.response?.data?.message)
      }
    },

    /**
     * Met à jour une règle individuelle
     */
    async updateRule(ruleId, updates) {
      this.saving = true
      try {
        const response = await notificationRulesAPI.updateRule(ruleId, updates)
        // Mettre à jour localement
        const idx = this.rules.findIndex(r => r._id === ruleId)
        if (idx !== -1) {
          this.rules[idx] = response.data.data
        }
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur mise à jour'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Met à jour en masse les règles d'un événement
     */
    async bulkUpdateEvent(eventName, rulesUpdates) {
      this.saving = true
      try {
        const response = await notificationRulesAPI.bulkUpdateEvent(eventName, rulesUpdates)
        // Recharger après mise à jour en masse
        await this.fetchMatrix()
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur mise à jour en masse'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Active/Désactive un domaine complet
     */
    async toggleDomain(domain, enabled) {
      this.saving = true
      try {
        await notificationRulesAPI.toggleDomain(domain, enabled)
        // Recharger après toggle
        await this.fetchMatrix()
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur toggle domaine'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Réinitialise aux valeurs par défaut
     */
    async resetToDefaults() {
      this.saving = true
      try {
        await notificationRulesAPI.resetToDefaults()
        await this.fetchMatrix()
        await this.fetchStats()
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur réinitialisation'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Met à jour les filtres
     */
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    /**
     * Réinitialise les filtres
     */
    clearFilters() {
      this.filters = { domain: '', priority: '', role: '', enabled: '' }
    }
  }
})
