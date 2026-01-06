/**
 * STORE PROGRAMMES VOL - GESTION DES PROGRAMMES SAISONNIERS
 *
 * Utilise programmesVolAPI (9 routes)
 */

import { defineStore } from 'pinia'
import { programmesVolAPI } from '@/services/api'

export const useProgrammesStore = defineStore('programmes', {
  state: () => ({
    // Programme courant
    currentProgramme: null,

    // Liste des programmes
    programmesList: [],
    programmesTotal: 0,
    programmesPage: 1,
    programmesPages: 1,

    // États
    loading: false,
    error: null,
    saving: false,
    importing: false
  }),

  getters: {
    getCurrentProgramme: (state) => state.currentProgramme,
    getProgrammesList: (state) => state.programmesList,
    getProgrammesActifs: (state) => state.programmesList.filter(p => p.statut === 'ACTIF'),
    getProgrammesEnAttente: (state) => state.programmesList.filter(p => p.statut === 'EN_ATTENTE'),
    getProgrammesSuspendus: (state) => state.programmesList.filter(p => p.statut === 'SUSPENDU'),

    getPagination: (state) => ({
      page: state.programmesPage,
      pages: state.programmesPages,
      total: state.programmesTotal
    })
  },

  actions: {
    /**
     * Créer un programme vol
     * @param {Object} data - { nom, dateDebut, dateFin, saison, compagnies?, vols? }
     */
    async createProgramme(data) {
      this.saving = true
      this.error = null

      try {
        const response = await programmesVolAPI.create(data)
        this.programmesList.unshift(response.data.programme)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la création'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Lister les programmes vol
     * @param {Object} params - { statut, saison, dateDebut, dateFin, page, limit }
     */
    async listProgrammes(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await programmesVolAPI.getAll(params)
        const result = response.data

        this.programmesList = result.data || []
        this.programmesTotal = result.total || 0
        this.programmesPage = result.page || 1
        this.programmesPages = result.pages || 1

        return result
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger un programme par ID
     * @param {string} id - ID du programme
     */
    async loadProgramme(id) {
      this.loading = true
      this.error = null

      try {
        const response = await programmesVolAPI.getById(id)
        this.currentProgramme = response.data.programme || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Modifier un programme
     * @param {string} id - ID du programme
     * @param {Object} data - Données à modifier
     */
    async updateProgramme(id, data) {
      this.saving = true
      this.error = null

      try {
        const response = await programmesVolAPI.update(id, data)
        const index = this.programmesList.findIndex(p => p._id === id)
        if (index !== -1) {
          this.programmesList[index] = response.data.programme
        }
        if (this.currentProgramme?._id === id) {
          this.currentProgramme = response.data.programme
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
     * Supprimer un programme (MANAGER)
     * @param {string} id - ID du programme
     */
    async deleteProgramme(id) {
      this.loading = true
      this.error = null

      try {
        await programmesVolAPI.delete(id)
        this.programmesList = this.programmesList.filter(p => p._id !== id)
        if (this.currentProgramme?._id === id) {
          this.currentProgramme = null
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la suppression'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Valider un programme (SUPERVISEUR, MANAGER)
     * @param {string} id - ID du programme
     */
    async validerProgramme(id) {
      this.saving = true
      this.error = null

      try {
        const response = await programmesVolAPI.valider(id)
        const index = this.programmesList.findIndex(p => p._id === id)
        if (index !== -1) {
          this.programmesList[index] = { ...this.programmesList[index], statut: 'VALIDE' }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la validation'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Activer un programme (SUPERVISEUR, MANAGER)
     * @param {string} id - ID du programme
     */
    async activerProgramme(id) {
      this.saving = true
      this.error = null

      try {
        const response = await programmesVolAPI.activer(id)
        const index = this.programmesList.findIndex(p => p._id === id)
        if (index !== -1) {
          this.programmesList[index] = { ...this.programmesList[index], statut: 'ACTIF' }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'activation'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Suspendre un programme
     * @param {string} id - ID du programme
     * @param {string} raison - Raison de la suspension
     */
    async suspendreProgramme(id, raison = '') {
      this.saving = true
      this.error = null

      try {
        const response = await programmesVolAPI.suspendre(id, raison)
        const index = this.programmesList.findIndex(p => p._id === id)
        if (index !== -1) {
          this.programmesList[index] = { ...this.programmesList[index], statut: 'SUSPENDU' }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la suspension'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Importer un programme depuis Excel
     * @param {File} file - Fichier Excel
     */
    async importerProgramme(file) {
      this.importing = true
      this.error = null

      try {
        const response = await programmesVolAPI.import(file)
        // Recharger la liste après import
        await this.listProgrammes()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'import'
        throw error
      } finally {
        this.importing = false
      }
    },

    /**
     * Obtenir les programmes applicables à une date (Extension 1)
     * @param {string} date - Date au format YYYY-MM-DD
     */
    async getProgrammesApplicables(date) {
      this.loading = true
      this.error = null

      try {
        const response = await programmesVolAPI.getApplicables(date)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la recherche'
        throw error
      } finally {
        this.loading = false
      }
    },

    resetCurrentProgramme() {
      this.currentProgramme = null
    },

    clearError() {
      this.error = null
    }
  }
})
