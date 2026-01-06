/**
 * STORE VOLS - GESTION DES VOLS
 *
 * Utilise volsAPI (7 routes)
 */

import { defineStore } from 'pinia'
import { volsAPI } from '@/services/api'

export const useVolsStore = defineStore('vols', {
  state: () => ({
    // Vol courant
    currentVol: null,

    // Liste des vols
    volsList: [],
    volsTotal: 0,
    volsPage: 1,
    volsPages: 1,

    // États
    loading: false,
    error: null,
    saving: false
  }),

  getters: {
    getCurrentVol: (state) => state.currentVol,
    getVolsList: (state) => state.volsList,
    getVolsArrivee: (state) => state.volsList.filter(v => v.typeOperation === 'ARRIVEE'),
    getVolsDepart: (state) => state.volsList.filter(v => v.typeOperation === 'DEPART'),
    getVolsTurnAround: (state) => state.volsList.filter(v => v.typeOperation === 'TURN_AROUND'),
    getVolsProgrammes: (state) => state.volsList.filter(v => v.programmation?.estProgramme),
    getVolsHorsProgramme: (state) => state.volsList.filter(v => !v.programmation?.estProgramme),

    getPagination: (state) => ({
      page: state.volsPage,
      pages: state.volsPages,
      total: state.volsTotal
    })
  },

  actions: {
    /**
     * Créer un vol
     * @param {Object} data - { numeroVol, typeOperation, compagnieAerienne, codeIATA, dateVol, avion? }
     */
    async createVol(data) {
      this.saving = true
      this.error = null

      try {
        const response = await volsAPI.create(data)
        this.volsList.unshift(response.data.vol)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la création du vol'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Lister les vols
     * @param {Object} params - { dateDebut, dateFin, typeOperation, compagnie, page, limit, sort }
     */
    async listVols(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await volsAPI.getAll(params)
        const result = response.data

        this.volsList = result.data || []
        this.volsTotal = result.total || 0
        this.volsPage = result.page || 1
        this.volsPages = result.pages || 1

        return result
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des vols'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger un vol par ID
     * @param {string} id - ID du vol
     */
    async loadVol(id) {
      this.loading = true
      this.error = null

      try {
        const response = await volsAPI.getById(id)
        this.currentVol = response.data.vol || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement du vol'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Modifier un vol
     * @param {string} id - ID du vol
     * @param {Object} data - Données à modifier
     */
    async updateVol(id, data) {
      this.saving = true
      this.error = null

      try {
        const response = await volsAPI.update(id, data)
        const index = this.volsList.findIndex(v => v._id === id)
        if (index !== -1) {
          this.volsList[index] = response.data.vol
        }
        if (this.currentVol?._id === id) {
          this.currentVol = response.data.vol
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
     * Supprimer un vol
     * @param {string} id - ID du vol
     */
    async deleteVol(id) {
      this.loading = true
      this.error = null

      try {
        await volsAPI.delete(id)
        this.volsList = this.volsList.filter(v => v._id !== id)
        if (this.currentVol?._id === id) {
          this.currentVol = null
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la suppression'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Lier un vol à un programme
     * @param {string} volId - ID du vol
     * @param {string} programmeId - ID du programme
     */
    async lierProgramme(volId, programmeId) {
      this.saving = true
      this.error = null

      try {
        const response = await volsAPI.lierProgramme(volId, programmeId)
        const index = this.volsList.findIndex(v => v._id === volId)
        if (index !== -1) {
          this.volsList[index] = response.data.vol
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la liaison'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Marquer un vol comme hors programme
     * @param {string} volId - ID du vol
     * @param {Object} data - { typeVolHorsProgramme, raisonHorsProgramme? }
     */
    async marquerHorsProgramme(volId, data) {
      this.saving = true
      this.error = null

      try {
        const response = await volsAPI.marquerHorsProgramme(volId, data)
        const index = this.volsList.findIndex(v => v._id === volId)
        if (index !== -1) {
          this.volsList[index] = response.data.vol
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du marquage'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Détacher un vol d'un programme
     * @param {string} volId - ID du vol
     */
    async detacherProgramme(volId) {
      this.saving = true
      this.error = null

      try {
        const response = await volsAPI.detacherProgramme(volId)
        const index = this.volsList.findIndex(v => v._id === volId)
        if (index !== -1) {
          this.volsList[index] = response.data.vol
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du détachement'
        throw error
      } finally {
        this.saving = false
      }
    },

    // ============================================
    // EXTENSION 2 - VOLS PROGRAMMÉS
    // ============================================

    /**
     * Suggérer des programmes pour un vol
     * @param {string} volId - ID du vol
     */
    async suggererProgrammes(volId) {
      this.loading = true
      this.error = null

      try {
        const response = await volsAPI.suggererProgrammes(volId)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la suggestion'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger les vols d'un programme spécifique
     * @param {string} programmeId - ID du programme
     * @param {Object} params - { page, limit }
     */
    async loadVolsByProgramme(programmeId, params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await volsAPI.getByProgramme(programmeId, params)
        const result = response.data

        this.volsList = result.data || result.vols || []
        this.volsTotal = result.total || 0
        this.volsPage = result.page || 1
        this.volsPages = result.pages || 1

        return result
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger les vols hors programme
     * @param {Object} params - { dateDebut, dateFin, typeVol, page, limit }
     */
    async loadVolsHorsProgramme(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await volsAPI.getHorsProgramme(params)
        const result = response.data

        this.volsList = result.data || result.vols || []
        this.volsTotal = result.total || 0
        this.volsPage = result.page || 1
        this.volsPages = result.pages || 1

        return result
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtenir les statistiques des programmes de vols
     * @param {Object} params - { dateDebut, dateFin }
     */
    async getStatistiquesProgrammes(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await volsAPI.getStatistiquesProgrammes(params)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des statistiques'
        throw error
      } finally {
        this.loading = false
      }
    },

    resetCurrentVol() {
      this.currentVol = null
    },

    clearError() {
      this.error = null
    }
  }
})
