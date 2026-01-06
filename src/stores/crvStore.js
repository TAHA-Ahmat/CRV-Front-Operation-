/**
 * STORE CRV - GESTION DES COMPTES RENDUS DE VOL
 *
 * CONFORME AU CONTRAT BACKEND v1.0
 *
 * Utilise les APIs conformes au backend :
 * - crvAPI (19 routes) - inclut Extension 6
 * - phasesAPI (6 routes)
 * - chargesAPI (16 routes) - inclut Extensions 4 & 5
 * - validationAPI (3 routes)
 *
 * Format réponse backend:
 * - Success: { success: true, data: {...} }
 * - Error: { success: false, message: "...", code: "...", errors: [...] }
 */

import { defineStore } from 'pinia'
import { crvAPI, phasesAPI, chargesAPI, validationAPI } from '@/services/api'

// Codes erreur métier
export const ERROR_CODES = {
  CRV_VERROUILLE: 'CRV_VERROUILLE',
  COMPLETUDE_INSUFFISANTE: 'COMPLETUDE_INSUFFISANTE',
  MOTIF_NON_REALISATION_REQUIS: 'MOTIF_NON_REALISATION_REQUIS',
  INCOHERENCE_TYPE_OPERATION: 'INCOHERENCE_TYPE_OPERATION',
  VALEURS_EXPLICITES_REQUISES: 'VALEURS_EXPLICITES_REQUISES'
}

export const useCRVStore = defineStore('crv', {
  state: () => ({
    // CRV courant
    currentCRV: null,
    phases: [],
    charges: [],
    evenements: [],
    observations: [],

    // Scores de complétude détaillés
    completudeDetails: {
      phases: 0,
      charges: 0,
      evenements: 0,
      observations: 0
    },

    // Liste des CRV
    crvList: [],
    crvTotal: 0,
    crvPage: 1,
    crvPages: 1,

    // Statistiques
    stats: null,

    // États
    loading: false,
    error: null,
    errorCode: null,
    errorFields: [],
    saving: false
  }),

  getters: {
    // CRV courant - utiliser .id (normalisé par backend)
    getCurrentCRV: (state) => state.currentCRV,
    getCRVId: (state) => state.currentCRV?.id || state.currentCRV?._id,
    getCRVType: (state) => state.currentCRV?.vol?.typeOperation,
    getNumeroCRV: (state) => state.currentCRV?.numeroCRV,

    // Statuts
    isValidated: (state) => state.currentCRV?.statut === 'VALIDE' || state.currentCRV?.statut === 'VERROUILLE',
    isLocked: (state) => state.currentCRV?.statut === 'VERROUILLE',
    isCancelled: (state) => state.currentCRV?.statut === 'ANNULE',
    isEditable: (state) => {
      const statut = state.currentCRV?.statut
      return statut && !['VALIDE', 'VERROUILLE', 'ANNULE'].includes(statut)
    },

    crvStatus: (state) => {
      if (!state.currentCRV) return null
      return state.currentCRV.statut
    },

    crvStatusLabel: (state) => {
      const statuts = {
        'BROUILLON': 'Brouillon',
        'EN_COURS': 'En cours',
        'TERMINE': 'Terminé',
        'VALIDE': 'Validé',
        'VERROUILLE': 'Verrouillé',
        'ANNULE': 'Annulé'
      }
      return statuts[state.currentCRV?.statut] || ''
    },

    // Complétude globale
    completude: (state) => state.currentCRV?.completude ?? 0,
    isCompleteEnough: (state) => (state.currentCRV?.completude ?? 0) >= 80,

    // Complétude détaillée (pour affichage barres de progression)
    getCompletudeDetails: (state) => state.completudeDetails,
    getCompletudePhases: (state) => state.completudeDetails.phases,
    getCompletudeCharges: (state) => state.completudeDetails.charges,
    getCompletudeEvenements: (state) => state.completudeDetails.evenements,
    getCompletudeObservations: (state) => state.completudeDetails.observations,

    // Peut valider (seuil 80% + statut modifiable)
    canValidate: (state) => {
      const crv = state.currentCRV
      if (!crv) return false
      return crv.completude >= 80 && !['VALIDE', 'VERROUILLE', 'ANNULE'].includes(crv.statut)
    },

    // Erreur avec code métier
    getError: (state) => state.error,
    getErrorCode: (state) => state.errorCode,
    getErrorFields: (state) => state.errorFields,
    hasError: (state) => !!state.error,

    // Phases
    getPhases: (state) => state.phases,
    getPhasesEnCours: (state) => state.phases.filter(p => p.statut === 'EN_COURS'),
    getPhasesTerminees: (state) => state.phases.filter(p => p.statut === 'TERMINE'),
    getPhasesNonDemarrees: (state) => state.phases.filter(p => p.statut === 'NON_DEMARRE'),

    // Charges
    getCharges: (state) => state.charges,
    getChargesPassagers: (state) => state.charges.filter(c => c.typeCharge === 'PASSAGERS'),
    getChargesBagages: (state) => state.charges.filter(c => c.typeCharge === 'BAGAGES'),
    getChargesFret: (state) => state.charges.filter(c => c.typeCharge === 'FRET'),

    // Événements & Observations
    getEvenements: (state) => state.evenements,
    getObservations: (state) => state.observations,

    // Liste
    getCRVList: (state) => state.crvList,
    getPagination: (state) => ({
      page: state.crvPage,
      pages: state.crvPages,
      total: state.crvTotal
    })
  },

  actions: {
    // ============================================
    // HELPERS - Gestion erreurs selon contrat
    // ============================================

    /**
     * Extraire les données de la réponse (vérifie success)
     * @param {Object} response - Réponse Axios
     * @returns {Object} Les données extraites
     */
    _extractData(response) {
      const result = response.data
      if (result.success === false) {
        const error = new Error(result.message || 'Erreur inconnue')
        error.code = result.code
        error.fields = result.errors || []
        throw error
      }
      return result.data || result
    },

    /**
     * Gérer une erreur API
     * @param {Error} error - L'erreur capturée
     * @param {string} defaultMessage - Message par défaut
     */
    _handleError(error, defaultMessage) {
      const responseData = error.response?.data
      this.error = responseData?.message || error.message || defaultMessage
      this.errorCode = responseData?.code || error.code || null
      this.errorFields = responseData?.errors || error.fields || []
    },

    /**
     * Vérifier si le CRV est modifiable (non verrouillé)
     * @throws Error si verrouillé
     */
    _checkEditable() {
      if (this.isLocked) {
        const error = new Error('CRV verrouillé - aucune modification possible')
        error.code = ERROR_CODES.CRV_VERROUILLE
        throw error
      }
    },

    /**
     * Calculer la complétude détaillée localement
     */
    _calculateCompletudeDetails() {
      // Score phases (40%)
      const totalPhases = this.phases.length
      const phasesCompletes = this.phases.filter(p =>
        p.statut === 'TERMINE' || p.statut === 'NON_REALISE'
      ).length
      const scorePhases = totalPhases > 0 ? (phasesCompletes / totalPhases) * 100 : 0

      // Score charges (30%)
      const chargesCompletes = this.charges.filter(c => {
        if (c.typeCharge === 'PASSAGERS') {
          return c.passagersAdultes !== undefined || c.passagersEnfants !== undefined
        }
        if (c.typeCharge === 'BAGAGES') {
          return c.nombreBagagesSoute !== undefined && c.poidsBagagesSouteKg !== undefined
        }
        if (c.typeCharge === 'FRET') {
          return c.nombreFret !== undefined && c.poidsFretKg !== undefined
        }
        return true
      }).length
      const scoreCharges = this.charges.length > 0 ? (chargesCompletes / this.charges.length) * 100 : 0

      // Score événements (20%) - 1+ = 100%
      const scoreEvenements = this.evenements.length > 0 ? 100 : 0

      // Score observations (10%) - 1+ = 100%
      const scoreObservations = this.observations.length > 0 ? 100 : 0

      this.completudeDetails = {
        phases: Math.round(scorePhases),
        charges: Math.round(scoreCharges),
        evenements: scoreEvenements,
        observations: scoreObservations
      }
    },

    // ============================================
    // CRUD CRV
    // ============================================

    /**
     * Créer un nouveau CRV
     *
     * Mode 1 (Simple/Prototype): { type: 'arrivee'|'depart'|'turnaround', date?: ISO }
     * Mode 2 (Production): { volId: '...', responsableVolId?: '...' }
     *
     * @param {Object} data - Données de création
     */
    async createCRV(data) {
      this.loading = true
      this.clearError()

      try {
        const response = await crvAPI.create(data)
        const result = this._extractData(response)

        // Le backend retourne directement l'objet CRV dans data
        this.currentCRV = result
        this.phases = []
        this.charges = []
        this.evenements = []
        this.observations = []

        // Charger le CRV complet pour avoir les phases
        if (result.id || result._id) {
          await this.loadCRV(result.id || result._id)
        }

        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de la création du CRV')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger un CRV complet par ID
     * @param {string} id - ID du CRV
     */
    async loadCRV(id) {
      this.loading = true
      this.clearError()

      try {
        const response = await crvAPI.getById(id)
        const result = this._extractData(response)

        // Format: { crv, phases, charges, evenements, observations }
        this.currentCRV = result.crv || result
        this.phases = result.phases || []
        this.charges = result.charges || []
        this.evenements = result.evenements || []
        this.observations = result.observations || []

        // Calculer complétude détaillée
        this._calculateCompletudeDetails()

        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors du chargement du CRV')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Lister les CRV avec filtres
     * @param {Object} params - { statut, compagnie, dateDebut, dateFin, page, limit, sort }
     */
    async listCRV(params = {}) {
      this.loading = true
      this.clearError()

      try {
        const response = await crvAPI.getAll(params)
        const result = this._extractData(response)

        // Pagination dans data ou directement
        this.crvList = result.data || result || []
        this.crvTotal = result.total || result.pagination?.total || 0
        this.crvPage = result.page || result.pagination?.page || 1
        this.crvPages = result.pages || result.pagination?.pages || 1

        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors du chargement des CRV')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Mettre à jour un CRV
     * @param {Object} data - Données à mettre à jour
     */
    async updateCRV(data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')
      this._checkEditable()

      this.saving = true
      this.clearError()

      try {
        const crvId = this.currentCRV.id || this.currentCRV._id
        const response = await crvAPI.update(crvId, data)
        const result = this._extractData(response)

        this.currentCRV = { ...this.currentCRV, ...result }
        this._calculateCompletudeDetails()

        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de la mise à jour')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Supprimer un CRV
     * @param {string} id - ID du CRV
     */
    async deleteCRV(id) {
      this.loading = true
      this.clearError()

      try {
        await crvAPI.delete(id)
        this.crvList = this.crvList.filter(c => (c.id || c._id) !== id)
        if ((this.currentCRV?.id || this.currentCRV?._id) === id) {
          this.resetCurrentCRV()
        }
      } catch (error) {
        this._handleError(error, 'Erreur lors de la suppression')
        throw error
      } finally {
        this.loading = false
      }
    },

    // ============================================
    // PHASES
    // ============================================

    /**
     * Démarrer une phase
     * @param {string} phaseId - ID de la phase
     */
    async demarrerPhase(phaseId) {
      this._checkEditable()
      this.saving = true
      this.clearError()

      try {
        const response = await phasesAPI.demarrer(phaseId)
        const result = this._extractData(response)
        const phase = result.phase || result

        const index = this.phases.findIndex(p => (p.id || p._id) === phaseId)
        if (index !== -1) {
          this.phases[index] = phase
        }

        // Recharger pour mise à jour complétude
        if (this.currentCRV) {
          await this.loadCRV(this.currentCRV.id || this.currentCRV._id)
        }
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors du démarrage de la phase')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Terminer une phase
     * @param {string} phaseId - ID de la phase
     */
    async terminerPhase(phaseId) {
      this._checkEditable()
      this.saving = true
      this.clearError()

      try {
        const response = await phasesAPI.terminer(phaseId)
        const result = this._extractData(response)
        const phase = result.phase || result

        const index = this.phases.findIndex(p => (p.id || p._id) === phaseId)
        if (index !== -1) {
          this.phases[index] = phase
        }

        // Recharger pour mise à jour complétude
        if (this.currentCRV) {
          await this.loadCRV(this.currentCRV.id || this.currentCRV._id)
        }
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de la terminaison de la phase')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Marquer une phase comme non réalisée
     * Requiert motifNonRealisation obligatoire selon contrat
     * @param {string} phaseId - ID de la phase
     * @param {Object} data - { motifNonRealisation, detailMotif? }
     */
    async marquerPhaseNonRealisee(phaseId, data) {
      this._checkEditable()

      // Validation selon contrat: motif obligatoire
      if (!data.motifNonRealisation) {
        this.error = 'Le motif de non-réalisation est obligatoire'
        this.errorCode = ERROR_CODES.MOTIF_NON_REALISATION_REQUIS
        throw new Error(this.error)
      }

      this.saving = true
      this.clearError()

      try {
        const response = await phasesAPI.marquerNonRealise(phaseId, data)
        const result = this._extractData(response)
        const phase = result.phase || result

        const index = this.phases.findIndex(p => (p.id || p._id) === phaseId)
        if (index !== -1) {
          this.phases[index] = phase
        }

        // Recharger pour mise à jour complétude
        if (this.currentCRV) {
          await this.loadCRV(this.currentCRV.id || this.currentCRV._id)
        }
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors du marquage de la phase')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Modifier une phase
     * @param {string} phaseId - ID de la phase
     * @param {Object} data - Données à modifier
     */
    async updatePhase(phaseId, data) {
      this._checkEditable()
      this.saving = true
      this.clearError()

      try {
        const response = await phasesAPI.update(phaseId, data)
        const result = this._extractData(response)
        const phase = result.phase || result

        const index = this.phases.findIndex(p => (p.id || p._id) === phaseId)
        if (index !== -1) {
          this.phases[index] = phase
        }

        this._calculateCompletudeDetails()
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de la modification de la phase')
        throw error
      } finally {
        this.saving = false
      }
    },

    // ============================================
    // CHARGES
    // ============================================

    /**
     * Ajouter une charge au CRV
     * Selon contrat: valeurs explicites requises (0 vs undefined)
     * @param {Object} data - { typeCharge, sensOperation, ... }
     */
    async addCharge(data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')
      this._checkEditable()

      this.saving = true
      this.clearError()

      try {
        const crvId = this.currentCRV.id || this.currentCRV._id
        const response = await crvAPI.addCharge(crvId, data)
        const result = this._extractData(response)
        const charge = result.charge || result

        this.charges.push(charge)
        this._calculateCompletudeDetails()

        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de l\'ajout de la charge')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Modifier les catégories détaillées passagers
     * @param {string} chargeId - ID de la charge
     * @param {Object} data - { categoriesDetaillees: {...} }
     */
    async updateCategoriesDetaillees(chargeId, data) {
      this._checkEditable()
      this.saving = true
      this.clearError()

      try {
        const response = await chargesAPI.updateCategoriesDetaillees(chargeId, data)
        const result = this._extractData(response)
        const charge = result.charge || result

        const index = this.charges.findIndex(c => (c.id || c._id) === chargeId)
        if (index !== -1) {
          this.charges[index] = charge
        }

        this._calculateCompletudeDetails()
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de la mise à jour')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Modifier le fret détaillé
     * @param {string} chargeId - ID de la charge
     * @param {Object} data - { fretDetaille: {...} }
     */
    async updateFretDetaille(chargeId, data) {
      this._checkEditable()
      this.saving = true
      this.clearError()

      try {
        const response = await chargesAPI.updateFretDetaille(chargeId, data)
        const result = this._extractData(response)
        const charge = result.charge || result

        const index = this.charges.findIndex(c => (c.id || c._id) === chargeId)
        if (index !== -1) {
          this.charges[index] = charge
        }

        this._calculateCompletudeDetails()
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de la mise à jour')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Ajouter une marchandise dangereuse (Extension 5 - DGR)
     * @param {string} chargeId - ID de la charge
     * @param {Object} data - { codeONU, classeONU, ... }
     */
    async addMarchandiseDangereuse(chargeId, data) {
      this._checkEditable()
      this.saving = true
      this.clearError()

      try {
        const response = await chargesAPI.addMarchandiseDangereuse(chargeId, data)
        const result = this._extractData(response)

        // Recharger la charge pour avoir la liste mise à jour
        const chargeResponse = await chargesAPI.getById(chargeId)
        const chargeResult = this._extractData(chargeResponse)
        const charge = chargeResult.charge || chargeResult

        const index = this.charges.findIndex(c => (c.id || c._id) === chargeId)
        if (index !== -1) {
          this.charges[index] = charge
        }
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de l\'ajout DGR')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Supprimer une marchandise dangereuse
     * @param {string} chargeId - ID de la charge
     * @param {string} mdId - ID de la marchandise dangereuse
     */
    async deleteMarchandiseDangereuse(chargeId, mdId) {
      this._checkEditable()
      this.saving = true
      this.clearError()

      try {
        await chargesAPI.deleteMarchandiseDangereuse(chargeId, mdId)

        // Recharger la charge pour avoir la liste mise à jour
        const chargeResponse = await chargesAPI.getById(chargeId)
        const chargeResult = this._extractData(chargeResponse)
        const charge = chargeResult.charge || chargeResult

        const index = this.charges.findIndex(c => (c.id || c._id) === chargeId)
        if (index !== -1) {
          this.charges[index] = charge
        }
      } catch (error) {
        this._handleError(error, 'Erreur lors de la suppression DGR')
        throw error
      } finally {
        this.saving = false
      }
    },

    // ============================================
    // ÉVÉNEMENTS & OBSERVATIONS
    // ============================================

    /**
     * Ajouter un événement
     * @param {Object} data - { typeEvenement, gravite, description }
     */
    async addEvenement(data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')
      this._checkEditable()

      this.saving = true
      this.clearError()

      try {
        const crvId = this.currentCRV.id || this.currentCRV._id
        const response = await crvAPI.addEvenement(crvId, data)
        const result = this._extractData(response)
        const evenement = result.evenement || result

        this.evenements.push(evenement)
        this._calculateCompletudeDetails()

        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de l\'ajout de l\'événement')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Ajouter une observation
     * @param {Object} data - { categorie, contenu }
     */
    async addObservation(data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')
      this._checkEditable()

      this.saving = true
      this.clearError()

      try {
        const crvId = this.currentCRV.id || this.currentCRV._id
        const response = await crvAPI.addObservation(crvId, data)
        const result = this._extractData(response)
        const observation = result.observation || result

        this.observations.push(observation)
        this._calculateCompletudeDetails()

        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de l\'ajout de l\'observation')
        throw error
      } finally {
        this.saving = false
      }
    },

    // ============================================
    // VALIDATION
    // ============================================

    /**
     * Valider un CRV (SUPERVISEUR, MANAGER)
     * Requiert complétude >= 80% selon contrat
     */
    async validateCRV() {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      // Vérification complétude selon contrat
      if (!this.isCompleteEnough) {
        this.error = 'Complétude insuffisante (minimum 80% requis)'
        this.errorCode = ERROR_CODES.COMPLETUDE_INSUFFISANTE
        throw new Error(this.error)
      }

      this.saving = true
      this.clearError()

      try {
        const crvId = this.currentCRV.id || this.currentCRV._id
        const response = await validationAPI.valider(crvId)
        const result = this._extractData(response)

        // Après validation, le CRV passe à VERROUILLE automatiquement
        this.currentCRV = { ...this.currentCRV, statut: result.statut || 'VALIDE' }
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de la validation')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Déverrouiller un CRV (MANAGER uniquement)
     * @param {string} raison - Raison du déverrouillage
     */
    async deverrouillerCRV(raison) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      this.saving = true
      this.clearError()

      try {
        const crvId = this.currentCRV.id || this.currentCRV._id
        const response = await validationAPI.deverrouiller(crvId, raison)
        const result = this._extractData(response)

        this.currentCRV = { ...this.currentCRV, statut: 'EN_COURS' }
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors du déverrouillage')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Obtenir le statut de validation
     */
    async getValidationStatus() {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      try {
        const crvId = this.currentCRV.id || this.currentCRV._id
        const response = await validationAPI.getStatus(crvId)
        return this._extractData(response)
      } catch (error) {
        this._handleError(error, 'Erreur lors de la récupération du statut')
        throw error
      }
    },

    // ============================================
    // RECHERCHE & STATISTIQUES
    // ============================================

    /**
     * Rechercher des CRV
     * @param {Object} params - { q, dateDebut, dateFin, statut }
     */
    async searchCRV(params) {
      this.loading = true
      this.error = null

      try {
        const response = await crvAPI.search(params)
        this.crvList = response.data.data || []
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la recherche'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtenir les statistiques
     * @param {Object} params - { dateDebut, dateFin }
     */
    async getStats(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await crvAPI.getStats(params)
        this.stats = response.data.stats
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des statistiques'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Exporter les CRV
     * @param {Object} params - { format, dateDebut, dateFin, statut }
     */
    async exportCRV(params) {
      try {
        const response = await crvAPI.export(params)

        const blob = new Blob([response.data], {
          type: params.format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `crv_export_${new Date().toISOString().split('T')[0]}.${params.format === 'excel' ? 'xlsx' : 'csv'}`
        link.click()
        window.URL.revokeObjectURL(url)

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'export'
        throw error
      }
    },

    /**
     * Archiver un CRV
     */
    async archiveCRV() {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      this.saving = true
      this.error = null

      try {
        const response = await crvAPI.archive(this.currentCRV._id)
        this.currentCRV = { ...this.currentCRV, ...response.data.crv }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'archivage'
        throw error
      } finally {
        this.saving = false
      }
    },

    // ============================================
    // EXTENSION 6 - ANNULATION CRV
    // ============================================

    /**
     * Vérifier si un CRV peut être annulé
     * @param {string} id - ID du CRV (optionnel, utilise currentCRV par défaut)
     */
    async peutAnnulerCRV(id = null) {
      const crvId = id || this.currentCRV?._id
      if (!crvId) throw new Error('Aucun CRV spécifié')

      try {
        const response = await crvAPI.peutAnnuler(crvId)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la vérification'
        throw error
      }
    },

    /**
     * Annuler un CRV
     * @param {Object} data - { motifAnnulation, details? }
     */
    async annulerCRV(data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      this.saving = true
      this.error = null

      try {
        const response = await crvAPI.annuler(this.currentCRV._id, data)
        this.currentCRV = { ...this.currentCRV, statut: 'ANNULE' }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'annulation'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Réactiver un CRV annulé (MANAGER uniquement)
     * @param {Object} data - { motifReactivation }
     */
    async reactiverCRV(data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      this.saving = true
      this.error = null

      try {
        const response = await crvAPI.reactiver(this.currentCRV._id, data)
        this.currentCRV = { ...this.currentCRV, statut: 'EN_COURS' }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la réactivation'
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Charger les CRV annulés
     * @param {Object} params - { dateDebut, dateFin, page, limit }
     */
    async loadCRVAnnules(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await crvAPI.getAnnules(params)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtenir les statistiques des annulations (MANAGER)
     * @param {Object} params - { dateDebut, dateFin, compagnie? }
     */
    async getStatistiquesAnnulations(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await crvAPI.getStatistiquesAnnulations(params)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des statistiques'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Vérifier le statut du service d'archivage
     */
    async getArchiveStatus() {
      try {
        const response = await crvAPI.getArchiveStatus()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la vérification'
        throw error
      }
    },

    /**
     * Tester le service d'archivage
     */
    async testArchive() {
      try {
        const response = await crvAPI.testArchive()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du test'
        throw error
      }
    },

    // ============================================
    // UTILITAIRES
    // ============================================

    resetCurrentCRV() {
      this.currentCRV = null
      this.phases = []
      this.charges = []
      this.evenements = []
      this.observations = []
      this.completudeDetails = {
        phases: 0,
        charges: 0,
        evenements: 0,
        observations: 0
      }
      this.clearError()
    },

    clearError() {
      this.error = null
      this.errorCode = null
      this.errorFields = []
    }
  }
})
