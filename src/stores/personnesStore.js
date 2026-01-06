/**
 * STORE PERSONNES - GESTION DES UTILISATEURS
 *
 * Utilise personnesAPI (8 routes/helpers)
 * Réservé aux rôles ADMIN
 */

import { defineStore } from 'pinia'
import { personnesAPI } from '@/services/api'

export const usePersonnesStore = defineStore('personnes', {
  state: () => ({
    // Utilisateur courant (en édition)
    currentPersonne: null,

    // Liste des utilisateurs
    personnesList: [],
    personnesTotal: 0,
    personnesPage: 1,
    personnesPages: 1,

    // Filtres appliqués
    filtres: {
      fonction: null,
      statut: null,
      search: ''
    },

    // États
    loading: false,
    error: null,
    saving: false
  }),

  getters: {
    getCurrentPersonne: (state) => state.currentPersonne,
    getPersonnesList: (state) => state.personnesList,
    getFiltres: (state) => state.filtres,

    // Par fonction/rôle
    getAgentsEscale: (state) => state.personnesList.filter(p => p.fonction === 'AGENT_ESCALE'),
    getChefsEquipe: (state) => state.personnesList.filter(p => p.fonction === 'CHEF_EQUIPE'),
    getSuperviseurs: (state) => state.personnesList.filter(p => p.fonction === 'SUPERVISEUR'),
    getManagers: (state) => state.personnesList.filter(p => p.fonction === 'MANAGER'),
    getQualite: (state) => state.personnesList.filter(p => p.fonction === 'QUALITE'),
    getAdmins: (state) => state.personnesList.filter(p => p.fonction === 'ADMIN'),

    // Par statut compte
    getPersonnesActives: (state) => state.personnesList.filter(p => p.statutCompte === 'VALIDE'),
    getPersonnesDesactivees: (state) => state.personnesList.filter(p => p.statutCompte === 'DESACTIVE'),
    getPersonnesSuspendues: (state) => state.personnesList.filter(p => p.statutCompte === 'SUSPENDU'),

    // Pagination
    getPagination: (state) => ({
      page: state.personnesPage,
      pages: state.personnesPages,
      total: state.personnesTotal
    }),

    // Statistiques rapides
    getStatistiques: (state) => ({
      total: state.personnesTotal,
      actifs: state.personnesList.filter(p => p.statutCompte === 'VALIDE').length,
      desactives: state.personnesList.filter(p => p.statutCompte === 'DESACTIVE').length,
      suspendus: state.personnesList.filter(p => p.statutCompte === 'SUSPENDU').length
    })
  },

  actions: {
    /**
     * Lister les utilisateurs
     * @param {Object} params - { page, limit, fonction, statut, search }
     */
    async listPersonnes(params = {}) {
      this.loading = true
      this.error = null

      // Fusionner avec les filtres actuels
      const queryParams = {
        ...this.filtres,
        ...params
      }

      try {
        const response = await personnesAPI.getAll(queryParams)
        const result = response.data

        this.personnesList = result.data || result.personnes || []
        this.personnesTotal = result.total || 0
        this.personnesPage = result.page || 1
        this.personnesPages = result.pages || 1

        return result
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des utilisateurs'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger un utilisateur par ID
     * @param {string} id - ID de l'utilisateur
     */
    async loadPersonne(id) {
      this.loading = true
      this.error = null

      try {
        const response = await personnesAPI.getById(id)
        this.currentPersonne = response.data.personne || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Créer un utilisateur
     * @param {Object} data - { nom, prenom, email, password, fonction, matricule?, telephone?, specialites? }
     */
    async createPersonne(data) {
      this.saving = true
      this.error = null

      try {
        const response = await personnesAPI.create(data)
        this.personnesList.unshift(response.data.personne)
        this.personnesTotal++
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la création'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Modifier un utilisateur
     * @param {string} id - ID de l'utilisateur
     * @param {Object} data - Données à modifier
     */
    async updatePersonne(id, data) {
      this.saving = true
      this.error = null

      try {
        const response = await personnesAPI.update(id, data)
        // Mettre à jour localement
        const index = this.personnesList.findIndex(p => p._id === id)
        if (index !== -1) {
          this.personnesList[index] = response.data.personne
        }
        if (this.currentPersonne?._id === id) {
          this.currentPersonne = response.data.personne
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
     * Supprimer un utilisateur
     * @param {string} id - ID de l'utilisateur
     */
    async deletePersonne(id) {
      this.loading = true
      this.error = null

      try {
        await personnesAPI.delete(id)
        this.personnesList = this.personnesList.filter(p => p._id !== id)
        this.personnesTotal--
        if (this.currentPersonne?._id === id) {
          this.currentPersonne = null
        }
      } catch (error) {
        // Gérer l'erreur ACCOUNT_IN_USE
        if (error.response?.data?.code === 'ACCOUNT_IN_USE') {
          this.error = 'Impossible de supprimer : ce compte a des CRV associés'
        } else {
          this.error = error.response?.data?.message || 'Erreur lors de la suppression'
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Désactiver un utilisateur
     * @param {string} id - ID de l'utilisateur
     * @param {string} raison - Raison de désactivation
     */
    async desactiverPersonne(id, raison = '') {
      this.saving = true
      this.error = null

      try {
        const response = await personnesAPI.desactiver(id, raison)
        // Mettre à jour localement
        const index = this.personnesList.findIndex(p => p._id === id)
        if (index !== -1) {
          this.personnesList[index] = {
            ...this.personnesList[index],
            statutCompte: 'DESACTIVE',
            raisonDesactivation: raison
          }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la désactivation'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Réactiver un utilisateur
     * @param {string} id - ID de l'utilisateur
     */
    async reactiverPersonne(id) {
      this.saving = true
      this.error = null

      try {
        const response = await personnesAPI.reactiver(id)
        // Mettre à jour localement
        const index = this.personnesList.findIndex(p => p._id === id)
        if (index !== -1) {
          this.personnesList[index] = {
            ...this.personnesList[index],
            statutCompte: 'VALIDE',
            raisonDesactivation: null
          }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la réactivation'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Suspendre un utilisateur
     * @param {string} id - ID de l'utilisateur
     * @param {string} raison - Raison de suspension
     */
    async suspendrePersonne(id, raison = '') {
      this.saving = true
      this.error = null

      try {
        const response = await personnesAPI.suspendre(id, raison)
        // Mettre à jour localement
        const index = this.personnesList.findIndex(p => p._id === id)
        if (index !== -1) {
          this.personnesList[index] = {
            ...this.personnesList[index],
            statutCompte: 'SUSPENDU',
            raisonSuspension: raison
          }
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
     * Mettre à jour les filtres
     * @param {Object} filtres - Nouveaux filtres
     */
    setFiltres(filtres) {
      this.filtres = { ...this.filtres, ...filtres }
    },

    /**
     * Réinitialiser les filtres
     */
    resetFiltres() {
      this.filtres = {
        fonction: null,
        statut: null,
        search: ''
      }
    },

    resetCurrentPersonne() {
      this.currentPersonne = null
    },

    clearError() {
      this.error = null
    }
  }
})
