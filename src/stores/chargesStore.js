/**
 * STORE CHARGES - GESTION DES CHARGES OPÉRATIONNELLES
 *
 * Utilise chargesAPI (12 routes)
 * Fonctionnalités : passagers, fret, bagages, marchandises dangereuses
 */

import { defineStore } from 'pinia'
import { chargesAPI } from '@/services/api'

export const useChargesStore = defineStore('charges', {
  state: () => ({
    // Charge courante
    currentCharge: null,

    // Statistiques
    statistiquesPassagers: null,
    statistiquesFret: null,

    // États
    loading: false,
    error: null,
    saving: false
  }),

  getters: {
    getCurrentCharge: (state) => state.currentCharge,
    getStatistiquesPassagers: (state) => state.statistiquesPassagers,
    getStatistiquesFret: (state) => state.statistiquesFret,

    // Totaux passagers
    getTotalPassagers: (state) => {
      if (!state.currentCharge) return 0
      const categories = state.currentCharge.categoriesDetaillees
      if (!categories) return state.currentCharge.nombreTotal || 0

      return (
        (categories.bebes || 0) +
        (categories.enfants || 0) +
        (categories.adolescents || 0) +
        (categories.adultes || 0) +
        (categories.seniors || 0)
      )
    },

    // Total PMR
    getTotalPMR: (state) => {
      if (!state.currentCharge?.categoriesDetaillees) return 0
      const cat = state.currentCharge.categoriesDetaillees
      return (
        (cat.pmrFauteuilRoulant || 0) +
        (cat.pmrMarcheAssistee || 0) +
        (cat.pmrAutre || 0)
      )
    },

    // A des marchandises dangereuses
    hasMarchandisesDangereuses: (state) => {
      return state.currentCharge?.marchandisesDangereuses?.length > 0
    }
  },

  actions: {
    /**
     * Charger une charge par ID
     * @param {string} id - ID de la charge
     */
    async loadCharge(id) {
      this.loading = true
      this.error = null

      try {
        const response = await chargesAPI.getById(id)
        this.currentCharge = response.data.charge || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Modifier une charge (générique)
     * @param {string} id - ID de la charge
     * @param {Object} data - Données à modifier
     */
    async updateCharge(id, data) {
      this.saving = true
      this.error = null

      try {
        const response = await chargesAPI.update(id, data)
        this.currentCharge = response.data.charge || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la modification'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Modifier les catégories détaillées passagers
     * @param {string} id - ID de la charge
     * @param {Object} categoriesDetaillees - Catégories détaillées
     */
    async updateCategoriesDetaillees(id, categoriesDetaillees) {
      this.saving = true
      this.error = null

      try {
        const response = await chargesAPI.updateCategoriesDetaillees(id, { categoriesDetaillees })
        this.currentCharge = response.data.charge || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la modification'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Modifier les classes passagers
     * @param {string} id - ID de la charge
     * @param {Object} classes - { premiere, affaires, economique }
     */
    async updateClasses(id, classes) {
      this.saving = true
      this.error = null

      try {
        const response = await chargesAPI.updateClasses(id, { classes })
        this.currentCharge = response.data.charge || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la modification'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Modifier les besoins médicaux
     * @param {string} id - ID de la charge
     * @param {Object} besoinsMedicaux - { oxygeneBord, brancardier, accompagnementMedical }
     */
    async updateBesoinsMedicaux(id, besoinsMedicaux) {
      this.saving = true
      this.error = null

      try {
        const response = await chargesAPI.updateBesoinsMedicaux(id, { besoinsMedicaux })
        this.currentCharge = response.data.charge || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la modification'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Modifier les mineurs
     * @param {string} id - ID de la charge
     * @param {Object} mineurs - { mineurNonAccompagne, bebeNonAccompagne }
     */
    async updateMineurs(id, mineurs) {
      this.saving = true
      this.error = null

      try {
        const response = await chargesAPI.updateMineurs(id, { mineurs })
        this.currentCharge = response.data.charge || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la modification'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Convertir vers catégories détaillées
     * @param {string} id - ID de la charge
     */
    async convertirCategoriesDetaillees(id) {
      this.saving = true
      this.error = null

      try {
        const response = await chargesAPI.convertirCategoriesDetaillees(id)
        this.currentCharge = response.data.charge || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la conversion'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Modifier le fret détaillé
     * @param {string} id - ID de la charge
     * @param {Object} fretDetaille - Données fret détaillées
     */
    async updateFretDetaille(id, fretDetaille) {
      this.saving = true
      this.error = null

      try {
        const response = await chargesAPI.updateFretDetaille(id, { fretDetaille })
        this.currentCharge = response.data.charge || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la modification'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Ajouter une marchandise dangereuse
     * @param {string} id - ID de la charge
     * @param {Object} data - Données marchandise dangereuse
     */
    async addMarchandiseDangereuse(id, data) {
      this.saving = true
      this.error = null

      try {
        const response = await chargesAPI.addMarchandiseDangereuse(id, data)
        this.currentCharge = response.data.charge || response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'ajout'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Supprimer une marchandise dangereuse
     * @param {string} id - ID de la charge
     * @param {string} mdId - ID de la marchandise dangereuse
     */
    async deleteMarchandiseDangereuse(id, mdId) {
      this.saving = true
      this.error = null

      try {
        const response = await chargesAPI.deleteMarchandiseDangereuse(id, mdId)
        // Mettre à jour localement
        if (this.currentCharge?.marchandisesDangereuses) {
          this.currentCharge.marchandisesDangereuses =
            this.currentCharge.marchandisesDangereuses.filter(md => md._id !== mdId)
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la suppression'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Charger les statistiques passagers
     * @param {Object} params - { dateDebut, dateFin, compagnie? }
     */
    async loadStatistiquesPassagers(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await chargesAPI.getStatistiquesPassagers(params)
        this.statistiquesPassagers = response.data.statistiques || response.data
        return this.statistiquesPassagers
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger les statistiques fret
     * @param {Object} params - { dateDebut, dateFin, compagnie? }
     */
    async loadStatistiquesFret(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await chargesAPI.getStatistiquesFret(params)
        this.statistiquesFret = response.data.statistiques || response.data
        return this.statistiquesFret
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger toutes les statistiques
     * @param {Object} params - Paramètres de filtrage
     */
    async loadAllStatistiques(params = {}) {
      await Promise.all([
        this.loadStatistiquesPassagers(params),
        this.loadStatistiquesFret(params)
      ])
    },

    // ============================================
    // EXTENSION 5 - VALIDATION DGR (CRITIQUE)
    // ============================================

    /**
     * Valider une marchandise dangereuse avant ajout (réglementaire)
     * @param {Object} data - Données de la marchandise à valider
     * @returns {Object} { valide: boolean, erreurs?: string[], avertissements?: string[] }
     */
    async validerMarchandiseDangereuse(data) {
      this.loading = true
      this.error = null

      try {
        const response = await chargesAPI.validerMarchandiseDangereuse(data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la validation'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Lister toutes les marchandises dangereuses
     * @param {Object} params - { dateDebut, dateFin, codeONU?, classeONU?, page, limit }
     */
    async loadMarchandisesDangereuses(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await chargesAPI.getMarchandisesDangereuses(params)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ============================================
    // STATISTIQUES PAR CRV
    // ============================================

    /**
     * Charger les statistiques passagers d'un CRV spécifique
     * @param {string} crvId - ID du CRV
     */
    async loadStatistiquesPassagersByCRV(crvId) {
      this.loading = true
      this.error = null

      try {
        const response = await chargesAPI.getStatistiquesPassagersByCRV(crvId)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger les statistiques fret d'un CRV spécifique
     * @param {string} crvId - ID du CRV
     */
    async loadStatistiquesFretByCRV(crvId) {
      this.loading = true
      this.error = null

      try {
        const response = await chargesAPI.getStatistiquesFretByCRV(crvId)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger toutes les statistiques d'un CRV
     * @param {string} crvId - ID du CRV
     */
    async loadStatistiquesByCRV(crvId) {
      const [passagers, fret] = await Promise.all([
        this.loadStatistiquesPassagersByCRV(crvId),
        this.loadStatistiquesFretByCRV(crvId)
      ])
      return { passagers, fret }
    },

    /**
     * Définir la charge courante (depuis crvStore)
     * @param {Object} charge - Données de la charge
     */
    setCurrentCharge(charge) {
      this.currentCharge = charge
    },

    resetCurrentCharge() {
      this.currentCharge = null
    },

    clearError() {
      this.error = null
    }
  }
})
