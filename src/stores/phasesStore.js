/**
 * STORE PHASES - GESTION DES PHASES CRV
 *
 * Utilise phasesAPI (6 routes)
 */

import { defineStore } from 'pinia'
import { phasesAPI } from '@/services/api'

export const usePhasesStore = defineStore('phases', {
  state: () => ({
    // Phase courante
    currentPhase: null,

    // Liste des phases d'un CRV
    phasesList: [],

    // États
    loading: false,
    error: null,
    saving: false
  }),

  getters: {
    getCurrentPhase: (state) => state.currentPhase,
    getPhasesList: (state) => state.phasesList,

    // Phases par statut
    getPhasesEnAttente: (state) => state.phasesList.filter(p => p.statut === 'EN_ATTENTE'),
    getPhasesEnCours: (state) => state.phasesList.filter(p => p.statut === 'EN_COURS'),
    getPhasesTerminees: (state) => state.phasesList.filter(p => p.statut === 'TERMINEE'),
    getPhasesNonRealisees: (state) => state.phasesList.filter(p => p.statut === 'NON_REALISE'),

    // Progression
    getProgression: (state) => {
      const total = state.phasesList.length
      if (total === 0) return 0
      const terminees = state.phasesList.filter(p =>
        p.statut === 'TERMINEE' || p.statut === 'NON_REALISE'
      ).length
      return Math.round((terminees / total) * 100)
    },

    // Phase active (en cours)
    getPhaseActive: (state) => state.phasesList.find(p => p.statut === 'EN_COURS'),

    // Prochaine phase à démarrer
    getProchainePhase: (state) => {
      const ordrePhases = [
        'ACCUEIL', 'DEBARQUEMENT', 'NETTOYAGE', 'CATERING',
        'AVITAILLEMENT', 'INSPECTION', 'CHARGEMENT', 'EMBARQUEMENT', 'DEPART'
      ]

      return state.phasesList
        .filter(p => p.statut === 'EN_ATTENTE')
        .sort((a, b) => ordrePhases.indexOf(a.type) - ordrePhases.indexOf(b.type))[0]
    }
  },

  actions: {
    /**
     * Charger les phases d'un CRV
     * @param {string} crvId - ID du CRV
     */
    async loadPhasesByCRV(crvId) {
      this.loading = true
      this.error = null

      try {
        const response = await phasesAPI.getByCRV(crvId)
        this.phasesList = response.data.phases || response.data || []
        return this.phasesList
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des phases'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger une phase par ID
     * @param {string} id - ID de la phase
     */
    async loadPhase(id) {
      this.loading = true
      this.error = null

      try {
        const response = await phasesAPI.getById(id)
        this.currentPhase = response.data.phase || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement de la phase'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Démarrer une phase
     * @param {string} id - ID de la phase
     */
    async demarrerPhase(id) {
      this.saving = true
      this.error = null

      try {
        const response = await phasesAPI.demarrer(id)
        // Mettre à jour localement
        const index = this.phasesList.findIndex(p => p._id === id)
        if (index !== -1) {
          this.phasesList[index] = {
            ...this.phasesList[index],
            statut: 'EN_COURS',
            heureDebut: new Date().toISOString()
          }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du démarrage de la phase'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Terminer une phase
     * @param {string} id - ID de la phase
     */
    async terminerPhase(id) {
      this.saving = true
      this.error = null

      try {
        const response = await phasesAPI.terminer(id)
        // Mettre à jour localement
        const index = this.phasesList.findIndex(p => p._id === id)
        if (index !== -1) {
          this.phasesList[index] = {
            ...this.phasesList[index],
            statut: 'TERMINEE',
            heureFin: new Date().toISOString()
          }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la terminaison de la phase'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Marquer une phase comme non réalisée
     * @param {string} id - ID de la phase
     * @param {Object} data - { motifNonRealisation, detailMotif? }
     */
    async marquerNonRealise(id, data) {
      this.saving = true
      this.error = null

      try {
        const response = await phasesAPI.marquerNonRealise(id, data)
        // Mettre à jour localement
        const index = this.phasesList.findIndex(p => p._id === id)
        if (index !== -1) {
          this.phasesList[index] = {
            ...this.phasesList[index],
            statut: 'NON_REALISE',
            motifNonRealisation: data.motifNonRealisation,
            detailMotif: data.detailMotif
          }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du marquage non réalisé'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Modifier une phase
     * @param {string} id - ID de la phase
     * @param {Object} data - { personnelAffecte?, equipementsUtilises?, dureePrevue?, ... }
     */
    async updatePhase(id, data) {
      this.saving = true
      this.error = null

      try {
        const response = await phasesAPI.update(id, data)
        // Mettre à jour localement
        const index = this.phasesList.findIndex(p => p._id === id)
        if (index !== -1) {
          this.phasesList[index] = { ...this.phasesList[index], ...response.data.phase }
        }
        if (this.currentPhase?._id === id) {
          this.currentPhase = { ...this.currentPhase, ...response.data.phase }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la modification'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Définir les phases localement (depuis crvStore)
     * @param {Array} phases - Liste des phases
     */
    setPhases(phases) {
      this.phasesList = phases || []
    },

    resetCurrentPhase() {
      this.currentPhase = null
    },

    resetPhases() {
      this.phasesList = []
      this.currentPhase = null
    },

    clearError() {
      this.error = null
    }
  }
})
