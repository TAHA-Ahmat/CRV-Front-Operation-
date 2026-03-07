/**
 * STORE SLA - GESTION DES ALERTES ET INDICATEURS SLA
 *
 * Utilise slaAPI (7 routes)
 * Fonctionnalités : rapports, configuration, surveillance, alertes
 */

import { defineStore } from 'pinia'
import { slaAPI } from '@/services/api'

export const useSlaStore = defineStore('sla', {
  state: () => ({
    // Rapport SLA global
    rapport: null,

    // Configuration SLA actuelle
    configuration: null,

    // SLA par CRV
    crvSla: null,

    // SLA par phase
    phaseSla: null,

    // Alertes actives
    alertes: [],

    // États
    loading: false,
    error: null,
    saving: false
  }),

  getters: {
    getRapport: (state) => state.rapport,
    getConfiguration: (state) => state.configuration,
    getCRVSla: (state) => state.crvSla,
    getPhaseSla: (state) => state.phaseSla,
    getAlertes: (state) => state.alertes,

    // Niveau de conformité global
    getConformiteGlobale: (state) => {
      if (!state.rapport) return null
      return state.rapport.conformiteGlobale || state.rapport.tauxConformite || 0
    },

    // Alertes critiques
    getAlertesCritiques: (state) => {
      return state.alertes.filter(a => a.niveau === 'CRITIQUE')
    },

    // Alertes actives (non résolues)
    getAlertesActives: (state) => {
      return state.alertes.filter(a => !a.resolu)
    },

    // Indicateurs par type de phase
    getIndicateursParPhase: (state) => {
      if (!state.rapport || !state.rapport.indicateurs) return {}
      return state.rapport.indicateurs
    }
  },

  actions: {
    /**
     * Charger le rapport SLA global
     * @param {Object} params - { dateDebut, dateFin }
     */
    async loadRapport(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await slaAPI.getRapport(params)
        this.rapport = response.data.rapport || response.data
        return this.rapport
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement du rapport'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger la configuration SLA
     */
    async loadConfiguration() {
      this.loading = true
      this.error = null

      try {
        const response = await slaAPI.getConfiguration()
        this.configuration = response.data.configuration || response.data
        return this.configuration
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement de la configuration'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Modifier la configuration SLA (MANAGER)
     * @param {Object} data - { seuils, alertes, ... }
     */
    async updateConfiguration(data) {
      this.saving = true
      this.error = null

      try {
        const response = await slaAPI.updateConfiguration(data)
        this.configuration = response.data.configuration || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la modification'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Mettre un CRV sous surveillance SLA (MANAGER)
     * @param {string} crvId - ID du CRV
     */
    async surveillerCRV(crvId) {
      this.saving = true
      this.error = null

      try {
        const response = await slaAPI.surveillerCRV(crvId)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la mise sous surveillance'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Mettre des phases sous surveillance SLA (MANAGER)
     * @param {Array} phaseIds - IDs des phases
     */
    async surveillerPhases(phaseIds) {
      this.saving = true
      this.error = null

      try {
        const response = await slaAPI.surveillerPhases(phaseIds)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la mise sous surveillance'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Charger le SLA d'un CRV spécifique
     * @param {string} id - ID du CRV
     */
    async loadCRVSla(id) {
      this.loading = true
      this.error = null

      try {
        const response = await slaAPI.getCRVSla(id)
        this.crvSla = response.data.sla || response.data
        return this.crvSla
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement du SLA'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger le SLA d'une phase spécifique
     * @param {string} id - ID de la phase
     */
    async loadPhaseSla(id) {
      this.loading = true
      this.error = null

      try {
        const response = await slaAPI.getPhaseSla(id)
        this.phaseSla = response.data.sla || response.data
        return this.phaseSla
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement du SLA'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Vérifier les alertes SLA (polling)
     */
    async checkAlertes() {
      try {
        // Recharger le rapport pour obtenir les alertes à jour
        await this.loadRapport({
          dateDebut: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          dateFin: new Date().toISOString()
        })

        if (this.rapport?.alertes) {
          this.alertes = this.rapport.alertes
        }

        return this.alertes
      } catch (error) {
        console.error('[SLA] Erreur lors de la vérification des alertes:', error)
        return []
      }
    },

    /**
     * Rafraîchir toutes les données SLA
     */
    async refresh() {
      await Promise.all([
        this.loadConfiguration(),
        this.loadRapport()
      ])
    },

    resetCRVSla() {
      this.crvSla = null
    },

    resetPhaseSla() {
      this.phaseSla = null
    },

    clearError() {
      this.error = null
    }
  }
})
