/**
 * STORE AVIONS - GESTION DES CONFIGURATIONS AVIONS
 *
 * Utilise avionsAPI (12 routes)
 * Fonctionnalités : CRUD, versioning, révisions, statistiques
 */

import { defineStore } from 'pinia'
import { avionsAPI } from '@/services/api'

export const useAvionsStore = defineStore('avions', {
  state: () => ({
    // Avion courant
    currentAvion: null,

    // Liste des avions
    avionsList: [],
    avionsTotal: 0,
    avionsPage: 1,
    avionsPages: 1,

    // Versions de configuration
    versions: [],
    versionCourante: null,
    comparaisonVersions: null,

    // Révisions planifiées
    revisionsProchaines: [],

    // Statistiques
    statistiques: null,

    // États
    loading: false,
    error: null,
    saving: false
  }),

  getters: {
    getCurrentAvion: (state) => state.currentAvion,
    getAvionsList: (state) => state.avionsList,
    getVersions: (state) => state.versions,
    getVersionCourante: (state) => state.versionCourante,
    getRevisionsProchaines: (state) => state.revisionsProchaines,
    getStatistiques: (state) => state.statistiques,

    // Avions par type
    getAvionsByType: (state) => (type) => {
      return state.avionsList.filter(a => a.type === type)
    },

    // Avions actifs
    getAvionsActifs: (state) => state.avionsList.filter(a => a.statut === 'ACTIF'),

    // Avions en maintenance
    getAvionsEnMaintenance: (state) => state.avionsList.filter(a => a.statut === 'MAINTENANCE'),

    getPagination: (state) => ({
      page: state.avionsPage,
      pages: state.avionsPages,
      total: state.avionsTotal
    })
  },

  actions: {
    /**
     * Lister les avions
     * @param {Object} params - Paramètres de filtrage
     */
    async listAvions(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await avionsAPI.getAll(params)
        const result = response.data

        this.avionsList = result.data || result.avions || []
        this.avionsTotal = result.total || 0
        this.avionsPage = result.page || 1
        this.avionsPages = result.pages || 1

        return result
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des avions'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger un avion par ID
     * @param {string} id - ID de l'avion
     */
    async loadAvion(id) {
      this.loading = true
      this.error = null

      try {
        const response = await avionsAPI.getById(id)
        this.currentAvion = response.data.avion || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Créer un avion
     * @param {Object} data - Données de l'avion
     */
    async createAvion(data) {
      this.saving = true
      this.error = null

      try {
        const response = await avionsAPI.create(data)
        this.avionsList.unshift(response.data.avion)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la création'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Modifier la configuration d'un avion
     * @param {string} id - ID de l'avion
     * @param {Object} configuration - Nouvelle configuration
     */
    async updateConfiguration(id, configuration) {
      this.saving = true
      this.error = null

      try {
        const response = await avionsAPI.updateConfiguration(id, { configuration })
        // Mettre à jour localement
        const index = this.avionsList.findIndex(a => a._id === id)
        if (index !== -1) {
          this.avionsList[index] = response.data.avion
        }
        if (this.currentAvion?._id === id) {
          this.currentAvion = response.data.avion
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
     * Créer une version de configuration
     * @param {string} id - ID de l'avion
     * @param {Object} data - { description?, configuration }
     */
    async createVersion(id, data) {
      this.saving = true
      this.error = null

      try {
        const response = await avionsAPI.createVersion(id, data)
        // Ajouter à la liste des versions
        this.versions.unshift(response.data.version)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la création de version'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Lister les versions de configuration d'un avion
     * @param {string} id - ID de l'avion
     */
    async loadVersions(id) {
      this.loading = true
      this.error = null

      try {
        const response = await avionsAPI.getVersions(id)
        this.versions = response.data.versions || response.data || []
        return this.versions
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des versions'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger une version spécifique
     * @param {string} id - ID de l'avion
     * @param {number} numero - Numéro de version
     */
    async loadVersion(id, numero) {
      this.loading = true
      this.error = null

      try {
        const response = await avionsAPI.getVersion(id, numero)
        this.versionCourante = response.data.version || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement de la version'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Restaurer une version de configuration
     * @param {string} id - ID de l'avion
     * @param {number} numero - Numéro de version à restaurer
     */
    async restaurerVersion(id, numero) {
      this.saving = true
      this.error = null

      try {
        const response = await avionsAPI.restaurerVersion(id, numero)
        // Mettre à jour l'avion courant
        if (this.currentAvion?._id === id) {
          this.currentAvion = response.data.avion
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la restauration'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Comparer deux versions
     * @param {string} id - ID de l'avion
     * @param {number} v1 - Première version
     * @param {number} v2 - Deuxième version
     */
    async comparerVersions(id, v1, v2) {
      this.loading = true
      this.error = null

      try {
        const response = await avionsAPI.comparerVersions(id, v1, v2)
        this.comparaisonVersions = response.data.comparaison || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la comparaison'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Planifier une révision
     * @param {string} id - ID de l'avion
     * @param {Object} data - { dateRevision, typeRevision, description? }
     */
    async planifierRevision(id, data) {
      this.saving = true
      this.error = null

      try {
        const response = await avionsAPI.planifierRevision(id, data)
        // Mettre à jour l'avion
        const index = this.avionsList.findIndex(a => a._id === id)
        if (index !== -1) {
          this.avionsList[index] = { ...this.avionsList[index], revision: data }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la planification'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Charger les révisions à venir
     */
    async loadRevisionsProchaines() {
      this.loading = true
      this.error = null

      try {
        const response = await avionsAPI.getRevisionsProchaines()
        this.revisionsProchaines = response.data.revisions || response.data || []
        return this.revisionsProchaines
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des révisions'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger les statistiques de configurations
     */
    async loadStatistiques() {
      this.loading = true
      this.error = null

      try {
        const response = await avionsAPI.getStatistiquesConfigurations()
        this.statistiques = response.data.statistiques || response.data
        return this.statistiques
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des statistiques'
        throw error
      } finally {
        this.loading = false
      }
    },

    resetCurrentAvion() {
      this.currentAvion = null
      this.versions = []
      this.versionCourante = null
      this.comparaisonVersions = null
    },

    clearError() {
      this.error = null
    }
  }
})
