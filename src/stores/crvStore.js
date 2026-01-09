/**
 * STORE CRV - GESTION DES COMPTES RENDUS DE VOL
 *
 * CONFORME À : DOCUMENTATION_FRONTEND_CRV.md (GELÉE)
 * Date de conformité : 2026-01-08
 *
 * RÈGLES ABSOLUES APPLIQUÉES :
 * - Backend = source de vérité (complétude calculée UNIQUEMENT par le backend)
 * - Absence = Non documenté (AUCUNE confirmation d'absence)
 * - null ≠ 0 (distinction stricte)
 * - Enums = valeurs backend uniquement
 *
 * SUPPRESSIONS CONFORMITÉ :
 * - _calculateCompletudeDetails() : SUPPRIMÉ (backend source de vérité)
 * - confirmerAbsence() : SUPPRIMÉ (doctrine absence = non documenté)
 * - annulerConfirmationAbsence() : SUPPRIMÉ (doctrine absence = non documenté)
 * - hasConfirmationAucunEvenement : SUPPRIMÉ
 * - hasConfirmationAucuneObservation : SUPPRIMÉ
 * - hasConfirmationAucuneCharge : SUPPRIMÉ
 *
 * WORKFLOW CRV:
 * BROUILLON → EN_COURS → TERMINE (≥50%) → VALIDE (≥80%) → VERROUILLE
 */

import { defineStore } from 'pinia'
import { crvAPI, phasesAPI, chargesAPI, validationAPI, enginsAPI } from '@/services/api'
import {
  STATUT_CRV,
  SEUILS_COMPLETUDE,
  ERROR_CODES,
  validateEnumValue,
  TYPE_EVENEMENT,
  GRAVITE_EVENEMENT,
  TYPE_FRET
} from '@/config/crvEnums'

// Re-export pour compatibilité
export { ERROR_CODES, SEUILS_COMPLETUDE }

export const useCRVStore = defineStore('crv', {
  state: () => ({
    // CRV courant
    currentCRV: null,
    phases: [],
    charges: [],
    evenements: [],
    observations: [],
    engins: [],

    // SUPPRIMÉ : completudeDetails local - utiliser currentCRV.completudeDetails (backend)

    // Transitions possibles (depuis GET /crv/:id/transitions)
    transitionsPossibles: [],

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
    anomalies: [],
    saving: false
  }),

  getters: {
    // CRV courant
    getCurrentCRV: (state) => state.currentCRV,
    getCRVId: (state) => state.currentCRV?.id || state.currentCRV?._id,
    getCRVType: (state) => state.currentCRV?.vol?.typeOperation,
    getNumeroCRV: (state) => state.currentCRV?.numeroCRV,

    // Statuts
    isValidated: (state) => state.currentCRV?.statut === STATUT_CRV.VALIDE || state.currentCRV?.statut === STATUT_CRV.VERROUILLE,
    isLocked: (state) => state.currentCRV?.statut === STATUT_CRV.VERROUILLE,
    isCancelled: (state) => state.currentCRV?.statut === STATUT_CRV.ANNULE,
    isDraft: (state) => state.currentCRV?.statut === STATUT_CRV.BROUILLON,
    isInProgress: (state) => state.currentCRV?.statut === STATUT_CRV.EN_COURS,
    isTerminated: (state) => state.currentCRV?.statut === STATUT_CRV.TERMINE,
    isEditable: (state) => {
      const statut = state.currentCRV?.statut
      const editable = statut && ![STATUT_CRV.VALIDE, STATUT_CRV.VERROUILLE, STATUT_CRV.ANNULE].includes(statut)
      console.log('[CRV][READ_ONLY]', { statut, editable })
      return editable
    },

    crvStatus: (state) => state.currentCRV?.statut ?? null,

    crvStatusLabel: (state) => {
      const statuts = {
        [STATUT_CRV.BROUILLON]: 'Brouillon',
        [STATUT_CRV.EN_COURS]: 'En cours',
        [STATUT_CRV.TERMINE]: 'Terminé',
        [STATUT_CRV.VALIDE]: 'Validé',
        [STATUT_CRV.VERROUILLE]: 'Verrouillé',
        [STATUT_CRV.ANNULE]: 'Annulé'
      }
      return statuts[state.currentCRV?.statut] || ''
    },

    /**
     * COMPLÉTUDE - BACKEND SOURCE DE VÉRITÉ
     * Le frontend ne calcule JAMAIS, il affiche uniquement
     */
    completude: (state) => {
      const value = state.currentCRV?.completude ?? 0
      console.log('[CRV][COMPLETUDE_BACKEND]', value)
      return value
    },

    isCompleteEnoughToTerminate: (state) => (state.currentCRV?.completude ?? 0) >= SEUILS_COMPLETUDE.TERMINER,
    isCompleteEnoughToValidate: (state) => (state.currentCRV?.completude ?? 0) >= SEUILS_COMPLETUDE.VALIDER,
    isCompleteEnough: (state) => (state.currentCRV?.completude ?? 0) >= SEUILS_COMPLETUDE.VALIDER,

    /**
     * COMPLÉTUDE DÉTAILLÉE - LECTURE DEPUIS BACKEND UNIQUEMENT
     */
    getCompletudeDetails: (state) => {
      const details = state.currentCRV?.completudeDetails || { phases: 0, charges: 0, evenements: 0, observations: 0 }
      console.log('[CRV][COMPLETUDE_BACKEND]', details)
      return details
    },
    getCompletudePhases: (state) => state.currentCRV?.completudeDetails?.phases ?? 0,
    getCompletudeCharges: (state) => state.currentCRV?.completudeDetails?.charges ?? 0,
    getCompletudeEvenements: (state) => state.currentCRV?.completudeDetails?.evenements ?? 0,
    getCompletudeObservations: (state) => state.currentCRV?.completudeDetails?.observations ?? 0,

    /**
     * SUPPRIMÉ : hasConfirmationAucunEvenement
     * SUPPRIMÉ : hasConfirmationAucuneObservation
     * SUPPRIMÉ : hasConfirmationAucuneCharge
     * RAISON : Doctrine "Absence = Non documenté" (DOCUMENTATION_FRONTEND_CRV.md Section 1.2.5)
     */

    // Workflow - basé sur transitions API (backend source de vérité)
    canStart: (state) => {
      const crv = state.currentCRV
      if (!crv) return false
      const canStart = state.transitionsPossibles.includes('EN_COURS') || crv.statut === STATUT_CRV.BROUILLON
      console.log('[CRV][TRANSITIONS]', { action: 'canStart', statut: crv.statut, transitions: state.transitionsPossibles, result: canStart })
      return canStart
    },

    canTerminate: (state) => {
      const crv = state.currentCRV
      if (!crv) return false
      const canTerminate = state.transitionsPossibles.includes('TERMINE')
      console.log('[CRV][TRANSITIONS]', { action: 'canTerminate', statut: crv.statut, transitions: state.transitionsPossibles, result: canTerminate })
      return canTerminate
    },

    canValidate: (state) => {
      const crv = state.currentCRV
      if (!crv) return false
      const canValidate = state.transitionsPossibles.includes('VALIDE')
      console.log('[CRV][TRANSITIONS]', { action: 'canValidate', statut: crv.statut, transitions: state.transitionsPossibles, result: canValidate })
      return canValidate
    },

    getTransitionsPossibles: (state) => state.transitionsPossibles,
    getAnomalies: (state) => state.anomalies,
    hasAnomalies: (state) => state.anomalies.length > 0,
    getError: (state) => state.error,
    getErrorCode: (state) => state.errorCode,
    getErrorFields: (state) => state.errorFields,
    hasError: (state) => !!state.error,

    // Phases
    getPhases: (state) => state.phases,
    getPhasesEnCours: (state) => state.phases.filter(p => p.statut === 'EN_COURS'),
    getPhasesTerminees: (state) => state.phases.filter(p => p.statut === 'TERMINE'),
    getPhasesNonCommencees: (state) => state.phases.filter(p => p.statut === 'NON_COMMENCE'),

    // Charges
    getCharges: (state) => state.charges,
    getChargesPassagers: (state) => state.charges.filter(c => c.typeCharge === 'PASSAGERS'),
    getChargesBagages: (state) => state.charges.filter(c => c.typeCharge === 'BAGAGES'),
    getChargesFret: (state) => state.charges.filter(c => c.typeCharge === 'FRET'),

    // Événements & Observations
    getEvenements: (state) => state.evenements,
    getObservations: (state) => state.observations,
    getEngins: (state) => state.engins,

    // Liste
    getCRVList: (state) => state.crvList,
    getPagination: (state) => ({ page: state.crvPage, pages: state.crvPages, total: state.crvTotal })
  },

  actions: {
    // ============================================
    // HELPERS
    // ============================================

    _extractData(response) {
      const result = response.data
      if (result.success === false) {
        const error = new Error(result.message || 'Erreur inconnue')
        error.code = result.code
        error.fields = result.errors || []
        console.log('[CRV][API_ERROR]', { code: error.code, message: error.message, fields: error.fields })
        throw error
      }
      return result.data || result
    },

    _handleError(error, defaultMessage) {
      const responseData = error.response?.data
      this.error = responseData?.message || error.message || defaultMessage
      this.errorCode = responseData?.code || error.code || null
      this.errorFields = responseData?.errors || error.fields || []
      console.log('[CRV][API_ERROR]', { code: this.errorCode, message: this.error, fields: this.errorFields })
    },

    _checkEditable() {
      if (this.isLocked) {
        const error = new Error('CRV verrouillé - aucune modification possible')
        error.code = ERROR_CODES.CRV_VERROUILLE
        console.log('[CRV][READ_ONLY]', { blocked: true, reason: 'CRV_VERROUILLE' })
        throw error
      }
    },

    /**
     * SUPPRIMÉ : _calculateCompletudeDetails
     * RAISON : Backend est source de vérité pour la complétude
     * REF : DOCUMENTATION_FRONTEND_CRV.md Section 1.2.1
     */

    // ============================================
    // CRUD CRV
    // ============================================

    async createCRV(data) {
      console.log('[CRV][LOAD]', { action: 'createCRV', data })
      this.loading = true
      this.clearError()

      try {
        const response = await crvAPI.create(data)
        const result = this._extractData(response)
        console.log('[CRV][LOAD]', { action: 'createCRV', result: 'success', crv: result })

        this.currentCRV = result
        this.phases = []
        this.charges = []
        this.evenements = []
        this.observations = []
        this.transitionsPossibles = []

        if (result.id || result._id) {
          await this.loadCRV(result.id || result._id)
        }

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'createCRV', error: error.message })
        this._handleError(error, 'Erreur lors de la création du CRV')
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadCRV(id) {
      console.log('[CRV][LOAD]', { action: 'loadCRV', id })
      this.loading = true
      this.clearError()

      try {
        const response = await crvAPI.getById(id)
        const result = this._extractData(response)

        this.currentCRV = result.crv || result
        this.phases = result.phases || []
        this.charges = result.charges || []
        this.evenements = result.evenements || []
        this.observations = result.observations || []

        console.log('[CRV][LOAD]', {
          action: 'loadCRV',
          result: 'success',
          numeroCRV: this.currentCRV?.numeroCRV,
          statut: this.currentCRV?.statut,
          completude: this.currentCRV?.completude,
          nbPhases: this.phases.length,
          nbCharges: this.charges.length,
          nbEvenements: this.evenements.length,
          nbObservations: this.observations.length
        })

        console.log('[CRV][COMPLETUDE_BACKEND]', this.currentCRV?.completude)

        try {
          await this.fetchTransitionsPossibles()
        } catch (e) {
          console.warn('[CRV][TRANSITIONS]', { warning: 'fetch failed', error: e.message })
        }

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'loadCRV', error: error.message })
        this._handleError(error, 'Erreur lors du chargement du CRV')
        throw error
      } finally {
        this.loading = false
      }
    },

    async listCRV(params = {}) {
      console.log('[CRV][LOAD]', { action: 'listCRV', params })
      this.loading = true
      this.clearError()

      try {
        const response = await crvAPI.getAll(params)
        const result = this._extractData(response)

        this.crvList = result.data || result || []
        this.crvTotal = result.total || result.pagination?.total || 0
        this.crvPage = result.page || result.pagination?.page || 1
        this.crvPages = result.pages || result.pagination?.pages || 1

        console.log('[CRV][LOAD]', { action: 'listCRV', result: 'success', count: this.crvList.length })
        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'listCRV', error: error.message })
        this._handleError(error, 'Erreur lors du chargement des CRV')
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateCRV(data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')
      this._checkEditable()

      console.log('[CRV][LOAD]', { action: 'updateCRV', data })
      this.saving = true
      this.clearError()

      try {
        const crvId = this.currentCRV.id || this.currentCRV._id
        const response = await crvAPI.update(crvId, data)
        const result = this._extractData(response)

        this.currentCRV = { ...this.currentCRV, ...result }
        console.log('[CRV][LOAD]', { action: 'updateCRV', result: 'success' })
        console.log('[CRV][COMPLETUDE_BACKEND]', this.currentCRV?.completude)

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'updateCRV', error: error.message })
        this._handleError(error, 'Erreur lors de la mise à jour')
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteCRV(id) {
      console.log('[CRV][LOAD]', { action: 'deleteCRV', id })
      this.loading = true
      this.clearError()

      try {
        await crvAPI.delete(id)
        console.log('[CRV][LOAD]', { action: 'deleteCRV', result: 'success' })
        this.crvList = this.crvList.filter(c => (c.id || c._id) !== id)
        if ((this.currentCRV?.id || this.currentCRV?._id) === id) {
          this.resetCurrentCRV()
        }
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'deleteCRV', error: error.message })
        this._handleError(error, 'Erreur lors de la suppression')
        throw error
      } finally {
        this.loading = false
      }
    },

    // ============================================
    // WORKFLOW CRV
    // ============================================

    async demarrerCRV() {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      const crvId = this.currentCRV.id || this.currentCRV._id
      const statut = this.currentCRV.statut

      console.log('[CRV][TRANSITION]', { action: 'demarrer', crvId, statutActuel: statut, statutCible: 'EN_COURS' })

      if (statut !== STATUT_CRV.BROUILLON) {
        const error = new Error(`Impossible de démarrer: statut actuel = ${statut} (attendu: BROUILLON)`)
        error.code = ERROR_CODES.TRANSITION_STATUT_INVALIDE
        console.log('[CRV][API_ERROR]', { action: 'demarrer', error: error.message })
        throw error
      }

      this.saving = true
      this.clearError()

      try {
        const response = await crvAPI.demarrer(crvId)
        const result = this._extractData(response)

        console.log('[CRV][TRANSITION]', { action: 'demarrer', result: 'success', nouveauStatut: 'EN_COURS' })
        this.currentCRV = { ...this.currentCRV, ...result, statut: STATUT_CRV.EN_COURS }

        await this.loadCRV(crvId)
        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'demarrer', error: error.message })
        this._handleError(error, 'Erreur lors du démarrage du CRV')
        throw error
      } finally {
        this.saving = false
      }
    },

    async terminerCRV() {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      const crvId = this.currentCRV.id || this.currentCRV._id
      const statut = this.currentCRV.statut
      const completude = this.currentCRV.completude ?? 0

      console.log('[CRV][TRANSITION]', { action: 'terminer', crvId, statutActuel: statut, statutCible: 'TERMINE', completude })

      if (statut !== STATUT_CRV.EN_COURS) {
        const error = new Error(`Impossible de terminer: statut actuel = ${statut} (attendu: EN_COURS)`)
        error.code = ERROR_CODES.TRANSITION_STATUT_INVALIDE
        console.log('[CRV][API_ERROR]', { action: 'terminer', error: error.message })
        throw error
      }

      this.saving = true
      this.clearError()
      this.anomalies = []

      try {
        const response = await crvAPI.terminer(crvId)
        const result = this._extractData(response)

        console.log('[CRV][TRANSITION]', { action: 'terminer', result: 'success', nouveauStatut: 'TERMINE' })
        this.currentCRV = { ...this.currentCRV, ...result, statut: STATUT_CRV.TERMINE }

        await this.loadCRV(crvId)
        return result
      } catch (error) {
        const responseData = error.response?.data
        if (responseData?.anomalies) {
          this.anomalies = responseData.anomalies
          console.log('[CRV][VALIDATION_ATTEMPT]', { action: 'terminer', anomalies: this.anomalies })
        }
        console.log('[CRV][API_ERROR]', { action: 'terminer', error: error.message })
        this._handleError(error, 'Impossible de terminer le CRV')
        throw error
      } finally {
        this.saving = false
      }
    },

    async fetchTransitionsPossibles() {
      if (!this.currentCRV) {
        console.warn('[CRV][TRANSITIONS]', { warning: 'no current CRV' })
        return null
      }

      const crvId = this.currentCRV.id || this.currentCRV._id
      console.log('[CRV][TRANSITIONS]', { action: 'fetch', crvId })

      try {
        const response = await crvAPI.getTransitions(crvId)
        const result = this._extractData(response)

        this.transitionsPossibles = result.transitionsPossibles || []
        console.log('[CRV][TRANSITIONS]', { action: 'fetch', result: 'success', transitions: this.transitionsPossibles })

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'fetchTransitions', error: error.message })
        this.transitionsPossibles = []
        return null
      }
    },

    /**
     * SUPPRIMÉ : confirmerAbsence(type)
     * RAISON : Doctrine "Absence = Non documenté"
     * REF : DOCUMENTATION_FRONTEND_CRV.md Section 1.2.5
     * Le backend attribue automatiquement les points pour absence (vol nominal)
     */

    /**
     * SUPPRIMÉ : annulerConfirmationAbsence(type)
     * RAISON : Doctrine "Absence = Non documenté"
     * REF : DOCUMENTATION_FRONTEND_CRV.md Section 1.2.5
     */

    async updateHoraire(data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')
      this._checkEditable()

      const crvId = this.currentCRV.id || this.currentCRV._id
      console.log('[CRV][LOAD]', { action: 'updateHoraire', crvId, data })

      this.saving = true
      this.clearError()

      try {
        const response = await crvAPI.updateHoraire(crvId, data)
        const result = this._extractData(response)

        console.log('[CRV][LOAD]', { action: 'updateHoraire', result: 'success' })

        if (this.currentCRV.horaire) {
          this.currentCRV.horaire = { ...this.currentCRV.horaire, ...result }
        } else {
          this.currentCRV.horaire = result
        }

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'updateHoraire', error: error.message })
        this._handleError(error, 'Erreur lors de la mise à jour des horaires')
        throw error
      } finally {
        this.saving = false
      }
    },

    async updatePersonnel(personnelAffecte) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')
      this._checkEditable()

      const crvId = this.currentCRV.id || this.currentCRV._id
      console.log('[CRV][LOAD]', { action: 'updatePersonnel', crvId, count: personnelAffecte?.length })

      this.saving = true
      this.clearError()

      try {
        const response = await crvAPI.updatePersonnel(crvId, { personnelAffecte })
        const result = this._extractData(response)

        console.log('[CRV][LOAD]', { action: 'updatePersonnel', result: 'success' })

        if (result.personnelAffecte) {
          this.currentCRV.personnelAffecte = result.personnelAffecte
        }

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'updatePersonnel', error: error.message })
        this._handleError(error, 'Erreur lors de la mise à jour du personnel')
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateEngins(engins) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')
      this._checkEditable()

      const crvId = this.currentCRV.id || this.currentCRV._id
      console.log('[CRV][LOAD]', { action: 'updateEngins', crvId, count: engins?.length })

      this.saving = true
      this.clearError()

      try {
        const response = await enginsAPI.updateCRVEngins(crvId, engins)
        const result = this._extractData(response)

        console.log('[CRV][LOAD]', { action: 'updateEngins', result: 'success' })
        this.engins = result.engins || []

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'updateEngins', error: error.message })
        this._handleError(error, 'Erreur lors de la mise à jour des engins')
        throw error
      } finally {
        this.saving = false
      }
    },

    // ============================================
    // PHASES
    // ============================================

    async demarrerPhase(phaseId) {
      this._checkEditable()
      console.log('[CRV][PHASE_VALIDATE]', { action: 'demarrer', phaseId })
      this.saving = true
      this.clearError()

      try {
        const response = await phasesAPI.demarrer(phaseId)
        const result = this._extractData(response)
        const phase = result.phase || result

        console.log('[CRV][PHASE_VALIDATE]', { action: 'demarrer', result: 'success', phase })

        const index = this.phases.findIndex(p => (p.id || p._id) === phaseId)
        if (index !== -1) {
          this.phases[index] = phase
        }

        if (this.currentCRV) {
          await this.loadCRV(this.currentCRV.id || this.currentCRV._id)
        }
        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'demarrerPhase', error: error.message })
        this._handleError(error, 'Erreur lors du démarrage de la phase')
        throw error
      } finally {
        this.saving = false
      }
    },

    async terminerPhase(phaseId) {
      this._checkEditable()
      console.log('[CRV][PHASE_VALIDATE]', { action: 'terminer', phaseId })
      this.saving = true
      this.clearError()

      try {
        const response = await phasesAPI.terminer(phaseId)
        const result = this._extractData(response)
        const phase = result.phase || result

        console.log('[CRV][PHASE_VALIDATE]', { action: 'terminer', result: 'success', phase })

        const index = this.phases.findIndex(p => (p.id || p._id) === phaseId)
        if (index !== -1) {
          this.phases[index] = phase
        }

        if (this.currentCRV) {
          await this.loadCRV(this.currentCRV.id || this.currentCRV._id)
        }
        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'terminerPhase', error: error.message })
        this._handleError(error, 'Erreur lors de la terminaison de la phase')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Marquer une phase comme non réalisée
     * CONFORME : motifNonRealisation ET detailMotif OBLIGATOIRES
     * REF : DOCUMENTATION_FRONTEND_CRV.md Bloc 4.e
     */
    async marquerPhaseNonRealisee(phaseId, data) {
      this._checkEditable()

      // Validation motifNonRealisation
      if (!data.motifNonRealisation) {
        this.error = 'Le motif de non-réalisation est obligatoire'
        this.errorCode = ERROR_CODES.MOTIF_NON_REALISATION_REQUIS
        console.log('[CRV][PHASE_VALIDATE]', { action: 'nonRealise', error: 'motifNonRealisation manquant' })
        throw new Error(this.error)
      }

      // CORRECTION CONFORMITÉ : detailMotif OBLIGATOIRE
      if (!data.detailMotif || data.detailMotif.trim() === '') {
        this.error = 'Le détail du motif est obligatoire'
        this.errorCode = ERROR_CODES.DETAIL_MOTIF_REQUIS
        console.log('[CRV][PHASE_VALIDATE]', { action: 'nonRealise', error: 'detailMotif manquant' })
        throw new Error(this.error)
      }

      console.log('[CRV][PHASE_VALIDATE]', { action: 'nonRealise', phaseId, data })
      this.saving = true
      this.clearError()

      try {
        const response = await phasesAPI.marquerNonRealise(phaseId, data)
        const result = this._extractData(response)
        const phase = result.phase || result

        console.log('[CRV][PHASE_VALIDATE]', { action: 'nonRealise', result: 'success', phase })

        const index = this.phases.findIndex(p => (p.id || p._id) === phaseId)
        if (index !== -1) {
          this.phases[index] = phase
        }

        if (this.currentCRV) {
          await this.loadCRV(this.currentCRV.id || this.currentCRV._id)
        }
        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'marquerPhaseNonRealisee', error: error.message })
        this._handleError(error, 'Erreur lors du marquage de la phase')
        throw error
      } finally {
        this.saving = false
      }
    },

    async updatePhase(phaseId, data) {
      this._checkEditable()
      console.log('[CRV][PHASE_VALIDATE]', { action: 'update', phaseId, data })
      this.saving = true
      this.clearError()

      try {
        const response = await phasesAPI.update(phaseId, data)
        const result = this._extractData(response)
        const phase = result.phase || result

        console.log('[CRV][PHASE_VALIDATE]', { action: 'update', result: 'success', phase })

        const index = this.phases.findIndex(p => (p.id || p._id) === phaseId)
        if (index !== -1) {
          this.phases[index] = phase
        }

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'updatePhase', error: error.message })
        this._handleError(error, 'Erreur lors de la modification de la phase')
        throw error
      } finally {
        this.saving = false
      }
    },

    async updatePhaseManuel(phaseId, data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')
      this._checkEditable()

      const crvId = this.currentCRV.id || this.currentCRV._id
      console.log('[CRV][PHASE_VALIDATE]', { action: 'updateManuel', crvId, phaseId, data })

      this.saving = true
      this.clearError()

      try {
        const response = await phasesAPI.updateManuel(crvId, phaseId, data)
        const result = this._extractData(response)
        const phase = result

        console.log('[CRV][PHASE_VALIDATE]', { action: 'updateManuel', result: 'success', phase })

        const index = this.phases.findIndex(p => (p.id || p._id) === phaseId)
        if (index !== -1) {
          this.phases[index] = phase
        }

        await this.loadCRV(crvId)
        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'updatePhaseManuel', error: error.message })
        this._handleError(error, 'Erreur lors de la mise à jour manuelle de la phase')
        throw error
      } finally {
        this.saving = false
      }
    },

    // ============================================
    // CHARGES
    // ============================================

    /**
     * Ajouter une charge
     * Validation enum typeFret selon DOCUMENTATION_FRONTEND_CRV.md Bloc 5.d
     */
    async addCharge(data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')
      this._checkEditable()

      // Validation enum typeFret
      if (data.typeFret) {
        const isValid = validateEnumValue(data.typeFret, TYPE_FRET, 'typeFret')
        if (!isValid) {
          const error = new Error(`Type de fret invalide: ${data.typeFret}`)
          error.code = 'ENUM_INVALID'
          throw error
        }
      }

      console.log('[CRV][ENUM_CHECK]', { field: 'typeCharge', value: data.typeCharge, context: 'addCharge' })
      console.log('[CRV][LOAD]', { action: 'addCharge', data })

      this.saving = true
      this.clearError()

      try {
        const crvId = this.currentCRV.id || this.currentCRV._id
        const response = await crvAPI.addCharge(crvId, data)
        const result = this._extractData(response)
        const charge = result.charge || result

        console.log('[CRV][LOAD]', { action: 'addCharge', result: 'success' })

        this.charges.push(charge)
        await this.loadCRV(crvId)

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'addCharge', error: error.message })
        this._handleError(error, 'Erreur lors de l\'ajout de la charge')
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateCategoriesDetaillees(chargeId, data) {
      this._checkEditable()
      console.log('[CRV][LOAD]', { action: 'updateCategoriesDetaillees', chargeId })
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

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'updateCategoriesDetaillees', error: error.message })
        this._handleError(error, 'Erreur lors de la mise à jour')
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateFretDetaille(chargeId, data) {
      this._checkEditable()
      console.log('[CRV][LOAD]', { action: 'updateFretDetaille', chargeId })
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

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'updateFretDetaille', error: error.message })
        this._handleError(error, 'Erreur lors de la mise à jour')
        throw error
      } finally {
        this.saving = false
      }
    },

    async addMarchandiseDangereuse(chargeId, data) {
      this._checkEditable()
      console.log('[CRV][LOAD]', { action: 'addMarchandiseDangereuse', chargeId })
      this.saving = true
      this.clearError()

      try {
        const response = await chargesAPI.addMarchandiseDangereuse(chargeId, data)
        const result = this._extractData(response)

        const chargeResponse = await chargesAPI.getById(chargeId)
        const chargeResult = this._extractData(chargeResponse)
        const charge = chargeResult.charge || chargeResult

        const index = this.charges.findIndex(c => (c.id || c._id) === chargeId)
        if (index !== -1) {
          this.charges[index] = charge
        }
        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'addMarchandiseDangereuse', error: error.message })
        this._handleError(error, 'Erreur lors de l\'ajout DGR')
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteMarchandiseDangereuse(chargeId, mdId) {
      this._checkEditable()
      console.log('[CRV][LOAD]', { action: 'deleteMarchandiseDangereuse', chargeId, mdId })
      this.saving = true
      this.clearError()

      try {
        await chargesAPI.deleteMarchandiseDangereuse(chargeId, mdId)

        const chargeResponse = await chargesAPI.getById(chargeId)
        const chargeResult = this._extractData(chargeResponse)
        const charge = chargeResult.charge || chargeResult

        const index = this.charges.findIndex(c => (c.id || c._id) === chargeId)
        if (index !== -1) {
          this.charges[index] = charge
        }
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'deleteMarchandiseDangereuse', error: error.message })
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
     * Validation enum selon DOCUMENTATION_FRONTEND_CRV.md Bloc 6.c
     */
    async addEvenement(data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')
      this._checkEditable()

      // Validation enum typeEvenement
      const isTypeValid = validateEnumValue(data.typeEvenement, TYPE_EVENEMENT, 'typeEvenement')
      if (!isTypeValid) {
        const error = new Error(`Type d'événement invalide: ${data.typeEvenement}`)
        error.code = 'ENUM_INVALID'
        throw error
      }

      // Validation enum gravite
      const isGraviteValid = validateEnumValue(data.gravite, GRAVITE_EVENEMENT, 'gravite')
      if (!isGraviteValid) {
        const error = new Error(`Gravité invalide: ${data.gravite}`)
        error.code = 'ENUM_INVALID'
        throw error
      }

      console.log('[CRV][ENUM_CHECK]', { field: 'typeEvenement', value: data.typeEvenement, allowed: Object.values(TYPE_EVENEMENT), valid: isTypeValid })
      console.log('[CRV][ENUM_CHECK]', { field: 'gravite', value: data.gravite, allowed: Object.values(GRAVITE_EVENEMENT), valid: isGraviteValid })
      console.log('[CRV][LOAD]', { action: 'addEvenement', data })

      this.saving = true
      this.clearError()

      try {
        const crvId = this.currentCRV.id || this.currentCRV._id
        const response = await crvAPI.addEvenement(crvId, data)
        const result = this._extractData(response)
        const evenement = result.evenement || result

        console.log('[CRV][LOAD]', { action: 'addEvenement', result: 'success' })

        this.evenements.push(evenement)
        await this.loadCRV(crvId)

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'addEvenement', error: error.message })
        this._handleError(error, 'Erreur lors de l\'ajout de l\'événement')
        throw error
      } finally {
        this.saving = false
      }
    },

    async addObservation(data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')
      this._checkEditable()

      console.log('[CRV][LOAD]', { action: 'addObservation', data })

      this.saving = true
      this.clearError()

      try {
        const crvId = this.currentCRV.id || this.currentCRV._id
        const response = await crvAPI.addObservation(crvId, data)
        const result = this._extractData(response)
        const observation = result.observation || result

        console.log('[CRV][LOAD]', { action: 'addObservation', result: 'success' })

        this.observations.push(observation)
        await this.loadCRV(crvId)

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'addObservation', error: error.message })
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
     * Valider un CRV
     * CONFORME : Permissions CHEF_EQUIPE, SUPERVISEUR, MANAGER (Section 5.2)
     */
    async validateCRV(commentaires = null) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      const crvId = this.currentCRV.id || this.currentCRV._id
      const statut = this.currentCRV.statut
      const completude = this.currentCRV.completude ?? 0

      console.log('[CRV][VALIDATION_ATTEMPT]', { crvId, statutActuel: statut, completude })

      if (statut !== STATUT_CRV.TERMINE) {
        const error = new Error(`Impossible de valider: statut actuel = ${statut} (attendu: TERMINE)`)
        error.code = ERROR_CODES.TRANSITION_STATUT_INVALIDE
        console.log('[CRV][API_ERROR]', { action: 'validateCRV', error: error.message })
        this.error = error.message
        this.errorCode = error.code
        throw error
      }

      if (completude < SEUILS_COMPLETUDE.VALIDER) {
        const error = new Error(`Complétude insuffisante: ${completude}% (minimum ${SEUILS_COMPLETUDE.VALIDER}% requis)`)
        error.code = ERROR_CODES.COMPLETUDE_INSUFFISANTE
        console.log('[CRV][API_ERROR]', { action: 'validateCRV', error: error.message })
        this.error = error.message
        this.errorCode = error.code
        throw error
      }

      this.saving = true
      this.clearError()
      this.anomalies = []

      try {
        const response = await validationAPI.valider(crvId, commentaires)
        const result = this._extractData(response)

        console.log('[CRV][TRANSITION]', { action: 'valider', result: 'success' })

        if (result.anomaliesDetectees && result.anomaliesDetectees.length > 0) {
          this.anomalies = result.anomaliesDetectees
          console.log('[CRV][VALIDATION_ATTEMPT]', { anomalies: this.anomalies })
        }

        const nouveauStatut = result.crv?.statut || result.statut || STATUT_CRV.VALIDE
        this.currentCRV = { ...this.currentCRV, statut: nouveauStatut }

        await this.loadCRV(crvId)
        return result
      } catch (error) {
        const responseData = error.response?.data
        if (responseData?.anomaliesDetectees) {
          this.anomalies = responseData.anomaliesDetectees
          console.log('[CRV][VALIDATION_ATTEMPT]', { anomalies: this.anomalies })
        }
        console.log('[CRV][API_ERROR]', { action: 'validateCRV', error: error.message })
        this._handleError(error, 'Erreur lors de la validation')
        throw error
      } finally {
        this.saving = false
      }
    },

    async verrouillerCRV() {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      const crvId = this.currentCRV.id || this.currentCRV._id
      const statut = this.currentCRV.statut

      console.log('[CRV][TRANSITION]', { action: 'verrouiller', crvId, statutActuel: statut })

      if (statut !== STATUT_CRV.VALIDE) {
        const error = new Error(`Impossible de verrouiller: statut actuel = ${statut} (attendu: VALIDE)`)
        error.code = ERROR_CODES.TRANSITION_STATUT_INVALIDE
        console.log('[CRV][API_ERROR]', { action: 'verrouillerCRV', error: error.message })
        throw error
      }

      this.saving = true
      this.clearError()

      try {
        const response = await validationAPI.verrouiller(crvId)
        const result = this._extractData(response)

        console.log('[CRV][TRANSITION]', { action: 'verrouiller', result: 'success' })
        this.currentCRV = { ...this.currentCRV, statut: STATUT_CRV.VERROUILLE }

        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'verrouillerCRV', error: error.message })
        this._handleError(error, 'Erreur lors du verrouillage')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Déverrouiller un CRV
     * CONFORME : Permissions SUPERVISEUR, MANAGER (Section 5.2)
     */
    async deverrouillerCRV(raison) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      if (!raison || raison.trim() === '') {
        const error = new Error('La raison du déverrouillage est obligatoire')
        console.log('[CRV][API_ERROR]', { action: 'deverrouillerCRV', error: error.message })
        throw error
      }

      const crvId = this.currentCRV.id || this.currentCRV._id
      console.log('[CRV][TRANSITION]', { action: 'deverrouiller', crvId, raison })

      this.saving = true
      this.clearError()

      try {
        const response = await validationAPI.deverrouiller(crvId, raison)
        const result = this._extractData(response)

        console.log('[CRV][TRANSITION]', { action: 'deverrouiller', result: 'success' })
        this.currentCRV = { ...this.currentCRV, statut: STATUT_CRV.EN_COURS }

        await this.loadCRV(crvId)
        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'deverrouillerCRV', error: error.message })
        this._handleError(error, 'Erreur lors du déverrouillage')
        throw error
      } finally {
        this.saving = false
      }
    },

    async getValidationStatus() {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      const crvId = this.currentCRV.id || this.currentCRV._id
      console.log('[CRV][LOAD]', { action: 'getValidationStatus', crvId })

      try {
        const response = await validationAPI.getStatus(crvId)
        const result = this._extractData(response)
        console.log('[CRV][LOAD]', { action: 'getValidationStatus', result: 'success' })
        return result
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'getValidationStatus', error: error.message })
        this._handleError(error, 'Erreur lors de la récupération du statut')
        throw error
      }
    },

    // ============================================
    // RECHERCHE & STATISTIQUES
    // ============================================

    async searchCRV(params) {
      console.log('[CRV][LOAD]', { action: 'searchCRV', params })
      this.loading = true
      this.error = null

      try {
        const response = await crvAPI.search(params)
        this.crvList = response.data.data || []
        return response.data
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'searchCRV', error: error.message })
        this.error = error.response?.data?.message || 'Erreur lors de la recherche'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getStats(params = {}) {
      console.log('[CRV][LOAD]', { action: 'getStats', params })
      this.loading = true
      this.error = null

      try {
        const response = await crvAPI.getStats(params)
        this.stats = response.data.stats
        return response.data
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'getStats', error: error.message })
        this.error = error.response?.data?.message || 'Erreur lors du chargement des statistiques'
        throw error
      } finally {
        this.loading = false
      }
    },

    async exportCRV(params) {
      console.log('[CRV][LOAD]', { action: 'exportCRV', params })
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
        console.log('[CRV][API_ERROR]', { action: 'exportCRV', error: error.message })
        this.error = error.response?.data?.message || 'Erreur lors de l\'export'
        throw error
      }
    },

    async archiveCRV() {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      console.log('[CRV][LOAD]', { action: 'archiveCRV' })
      this.saving = true
      this.error = null

      try {
        const response = await crvAPI.archive(this.currentCRV._id)
        this.currentCRV = { ...this.currentCRV, ...response.data.crv }
        return response.data
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'archiveCRV', error: error.message })
        this.error = error.response?.data?.message || 'Erreur lors de l\'archivage'
        throw error
      } finally {
        this.saving = false
      }
    },

    // ============================================
    // ANNULATION CRV
    // ============================================

    async peutAnnulerCRV(id = null) {
      const crvId = id || this.currentCRV?._id
      if (!crvId) throw new Error('Aucun CRV spécifié')

      console.log('[CRV][LOAD]', { action: 'peutAnnulerCRV', crvId })

      try {
        const response = await crvAPI.peutAnnuler(crvId)
        return response.data
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'peutAnnulerCRV', error: error.message })
        this.error = error.response?.data?.message || 'Erreur lors de la vérification'
        throw error
      }
    },

    async annulerCRV(data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      console.log('[CRV][TRANSITION]', { action: 'annuler', data })
      this.saving = true
      this.error = null

      try {
        const response = await crvAPI.annuler(this.currentCRV._id, data)
        console.log('[CRV][TRANSITION]', { action: 'annuler', result: 'success' })
        this.currentCRV = { ...this.currentCRV, statut: STATUT_CRV.ANNULE }
        return response.data
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'annulerCRV', error: error.message })
        this.error = error.response?.data?.message || 'Erreur lors de l\'annulation'
        throw error
      } finally {
        this.saving = false
      }
    },

    async reactiverCRV(data) {
      if (!this.currentCRV) throw new Error('Aucun CRV actif')

      console.log('[CRV][TRANSITION]', { action: 'reactiver', data })
      this.saving = true
      this.error = null

      try {
        const response = await crvAPI.reactiver(this.currentCRV._id, data)
        console.log('[CRV][TRANSITION]', { action: 'reactiver', result: 'success' })
        this.currentCRV = { ...this.currentCRV, statut: STATUT_CRV.EN_COURS }
        return response.data
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'reactiverCRV', error: error.message })
        this.error = error.response?.data?.message || 'Erreur lors de la réactivation'
        throw error
      } finally {
        this.saving = false
      }
    },

    async loadCRVAnnules(params = {}) {
      console.log('[CRV][LOAD]', { action: 'loadCRVAnnules', params })
      this.loading = true
      this.error = null

      try {
        const response = await crvAPI.getAnnules(params)
        return response.data
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'loadCRVAnnules', error: error.message })
        this.error = error.response?.data?.message || 'Erreur lors du chargement'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getStatistiquesAnnulations(params = {}) {
      console.log('[CRV][LOAD]', { action: 'getStatistiquesAnnulations', params })
      this.loading = true
      this.error = null

      try {
        const response = await crvAPI.getStatistiquesAnnulations(params)
        return response.data
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'getStatistiquesAnnulations', error: error.message })
        this.error = error.response?.data?.message || 'Erreur lors du chargement des statistiques'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getArchiveStatus() {
      console.log('[CRV][LOAD]', { action: 'getArchiveStatus' })
      try {
        const response = await crvAPI.getArchiveStatus()
        return response.data
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'getArchiveStatus', error: error.message })
        this.error = error.response?.data?.message || 'Erreur lors de la vérification'
        throw error
      }
    },

    async testArchive() {
      console.log('[CRV][LOAD]', { action: 'testArchive' })
      try {
        const response = await crvAPI.testArchive()
        return response.data
      } catch (error) {
        console.log('[CRV][API_ERROR]', { action: 'testArchive', error: error.message })
        this.error = error.response?.data?.message || 'Erreur lors du test'
        throw error
      }
    },

    // ============================================
    // UTILITAIRES
    // ============================================

    resetCurrentCRV() {
      console.log('[CRV][LOAD]', { action: 'resetCurrentCRV' })
      this.currentCRV = null
      this.phases = []
      this.charges = []
      this.evenements = []
      this.observations = []
      this.engins = []
      this.transitionsPossibles = []
      this.anomalies = []
      this.clearError()
    },

    clearError() {
      this.error = null
      this.errorCode = null
      this.errorFields = []
      this.anomalies = []
    },

    clearAnomalies() {
      this.anomalies = []
    }
  }
})
