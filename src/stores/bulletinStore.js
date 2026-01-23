/**
 * STORE BULLETIN DE MOUVEMENT
 *
 * Hiérarchie métier : Programme (6 mois) → Bulletin (3-4 jours) → CRV (réel)
 * Règle : En cas de contradiction → CRV > Bulletin > Programme
 *
 * Statuts: BROUILLON → PUBLIE → ARCHIVE
 */

import { defineStore } from 'pinia'
import { bulletinsAPI } from '@/services/api'

// ============================================
// CONSTANTES
// ============================================

export const STATUT_BULLETIN = Object.freeze({
  BROUILLON: 'BROUILLON',
  PUBLIE: 'PUBLIE',
  ARCHIVE: 'ARCHIVE'
})

export const ORIGINE_MOUVEMENT = Object.freeze({
  PROGRAMME: 'PROGRAMME',
  HORS_PROGRAMME: 'HORS_PROGRAMME',
  AJUSTEMENT: 'AJUSTEMENT'
})

export const STATUT_MOUVEMENT = Object.freeze({
  PREVU: 'PREVU',
  CONFIRME: 'CONFIRME',
  MODIFIE: 'MODIFIE',
  ANNULE: 'ANNULE'
})

export const TYPE_HORS_PROGRAMME = Object.freeze({
  CHARTER: 'CHARTER',
  MEDICAL: 'MEDICAL',
  TECHNIQUE: 'TECHNIQUE',
  COMMERCIAL: 'COMMERCIAL',
  CARGO: 'CARGO',
  AUTRE: 'AUTRE'
})

export const TYPE_OPERATION = Object.freeze({
  ARRIVEE: 'ARRIVEE',
  DEPART: 'DEPART',
  TURN_AROUND: 'TURN_AROUND'
})

// ============================================
// COULEURS UI
// ============================================

export const STATUT_COLORS = Object.freeze({
  BROUILLON: { bg: '#F3F4F6', text: '#6B7280', label: 'Brouillon' },
  PUBLIE: { bg: '#D1FAE5', text: '#065F46', label: 'Publié' },
  ARCHIVE: { bg: '#DBEAFE', text: '#1E40AF', label: 'Archivé' }
})

export const ORIGINE_COLORS = Object.freeze({
  PROGRAMME: { color: '#000000', label: '', badge: '' },
  HORS_PROGRAMME: { color: '#DC2626', label: 'HP', badge: 'red' },
  AJUSTEMENT: { color: '#D97706', label: 'AJ', badge: 'orange' }
})

export const STATUT_MVT_COLORS = Object.freeze({
  PREVU: { color: '#000000', icon: 'clock' },
  CONFIRME: { color: '#059669', icon: 'check-circle' },
  MODIFIE: { color: '#D97706', icon: 'pencil' },
  ANNULE: { color: '#DC2626', icon: 'x-circle', strikethrough: true }
})

export const TYPES_HORS_PROGRAMME_OPTIONS = [
  { value: 'CHARTER', label: 'Charter', icon: 'plane' },
  { value: 'MEDICAL', label: 'Médical/Évacuation', icon: 'heart' },
  { value: 'TECHNIQUE', label: 'Vol technique', icon: 'wrench' },
  { value: 'COMMERCIAL', label: 'Commercial ponctuel', icon: 'briefcase' },
  { value: 'CARGO', label: 'Cargo spécial', icon: 'package' },
  { value: 'AUTRE', label: 'Autre', icon: 'dots-horizontal' }
]

// ============================================
// STORE
// ============================================

export const useBulletinStore = defineStore('bulletin', {
  state: () => ({
    // Bulletin actuel
    bulletinActuel: null,

    // Liste des bulletins
    bulletins: [],
    total: 0,
    page: 1,
    pages: 1,

    // Filtres
    filtres: {
      escale: '',
      statut: '',
      dateDebut: '',
      dateFin: ''
    },

    // États
    loading: false,
    saving: false,
    error: null,
    errorCode: null
  }),

  getters: {
    // ============================================
    // BULLETIN ACTUEL
    // ============================================

    getBulletinActuel: (state) => state.bulletinActuel,
    getBulletinId: (state) => state.bulletinActuel?._id || state.bulletinActuel?.id,

    getStatut: (state) => state.bulletinActuel?.statut,
    getStatutLabel: (state) => STATUT_COLORS[state.bulletinActuel?.statut]?.label || '',
    getStatutColor: (state) => STATUT_COLORS[state.bulletinActuel?.statut] || STATUT_COLORS.BROUILLON,

    // ============================================
    // MOUVEMENTS
    // ============================================

    getMouvements: (state) => state.bulletinActuel?.mouvements || [],

    getMouvementsActifs: (state) => {
      const mouvements = state.bulletinActuel?.mouvements || []
      return mouvements.filter(m => m.statutMouvement !== STATUT_MOUVEMENT.ANNULE)
    },

    getMouvementsAnnules: (state) => {
      const mouvements = state.bulletinActuel?.mouvements || []
      return mouvements.filter(m => m.statutMouvement === STATUT_MOUVEMENT.ANNULE)
    },

    /**
     * Mouvements groupés par jour
     */
    getMouvementsParJour: (state) => {
      const mouvements = state.bulletinActuel?.mouvements || []
      const grouped = {}

      mouvements.forEach(mvt => {
        const date = mvt.dateMouvement?.split('T')[0] || 'Sans date'
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(mvt)
      })

      // Trier par ordre dans chaque jour
      Object.keys(grouped).forEach(date => {
        grouped[date].sort((a, b) => {
          const heureA = a.heureArriveePrevue || a.heureDepartPrevue || ''
          const heureB = b.heureArriveePrevue || b.heureDepartPrevue || ''
          return heureA.localeCompare(heureB)
        })
      })

      return grouped
    },

    // ============================================
    // STATISTIQUES
    // ============================================

    getStatistiques: (state) => {
      const bulletin = state.bulletinActuel
      if (!bulletin) return { total: 0, programme: 0, horsProgramme: 0, ajustements: 0, annules: 0 }

      const mouvements = bulletin.mouvements || []
      return {
        total: mouvements.length,
        programme: mouvements.filter(m => m.origine === ORIGINE_MOUVEMENT.PROGRAMME).length,
        horsProgramme: mouvements.filter(m => m.origine === ORIGINE_MOUVEMENT.HORS_PROGRAMME).length,
        ajustements: mouvements.filter(m => m.origine === ORIGINE_MOUVEMENT.AJUSTEMENT).length,
        annules: mouvements.filter(m => m.statutMouvement === STATUT_MOUVEMENT.ANNULE).length,
        compagnies: [...new Set(mouvements.map(m => m.codeCompagnie).filter(Boolean))]
      }
    },

    // ============================================
    // PERMISSIONS / WORKFLOW
    // ============================================

    peutModifier: (state) => state.bulletinActuel?.statut === STATUT_BULLETIN.BROUILLON,

    peutPublier: (state) => {
      const bulletin = state.bulletinActuel
      if (!bulletin) return false
      const mouvementsActifs = (bulletin.mouvements || []).filter(m => m.statutMouvement !== STATUT_MOUVEMENT.ANNULE)
      return bulletin.statut === STATUT_BULLETIN.BROUILLON && mouvementsActifs.length > 0
    },

    peutArchiver: (state) => state.bulletinActuel?.statut === STATUT_BULLETIN.PUBLIE,

    peutSupprimer: (state) => state.bulletinActuel?.statut === STATUT_BULLETIN.BROUILLON,

    // ============================================
    // LISTE
    // ============================================

    getBulletins: (state) => state.bulletins,
    getPagination: (state) => ({ page: state.page, pages: state.pages, total: state.total }),
    getFiltres: (state) => state.filtres,

    // ============================================
    // ÉTATS
    // ============================================

    isLoading: (state) => state.loading,
    isSaving: (state) => state.saving,
    getError: (state) => state.error,
    hasError: (state) => !!state.error
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
        console.log('[BULLETIN][API_ERROR]', { code: error.code, message: error.message })
        throw error
      }
      return result.data || result
    },

    _handleError(error, defaultMessage) {
      const responseData = error.response?.data
      this.error = responseData?.message || error.message || defaultMessage
      this.errorCode = responseData?.code || error.code || null
      console.log('[BULLETIN][API_ERROR]', { code: this.errorCode, message: this.error })
    },

    clearError() {
      this.error = null
      this.errorCode = null
    },

    // ============================================
    // CRUD BULLETINS
    // ============================================

    /**
     * Lister les bulletins avec filtres
     */
    async fetchBulletins(params = {}) {
      console.log('[BULLETIN][LOAD]', { action: 'fetchBulletins', params })
      this.loading = true
      this.clearError()

      try {
        const queryParams = { ...this.filtres, ...params }
        // Nettoyer les params vides
        Object.keys(queryParams).forEach(key => {
          if (!queryParams[key]) delete queryParams[key]
        })

        const response = await bulletinsAPI.getAll(queryParams)
        const result = this._extractData(response)

        this.bulletins = result.data || result.bulletins || []
        this.total = result.total || result.pagination?.total || 0
        this.page = result.page || result.pagination?.page || 1
        this.pages = result.pages || result.pagination?.pages || 1

        console.log('[BULLETIN][LOAD]', { action: 'fetchBulletins', count: this.bulletins.length })
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors du chargement des bulletins')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger un bulletin par ID
     */
    async fetchBulletinById(id) {
      console.log('[BULLETIN][LOAD]', { action: 'fetchBulletinById', id })
      this.loading = true
      this.clearError()

      try {
        const response = await bulletinsAPI.getById(id)
        const result = this._extractData(response)

        this.bulletinActuel = result.bulletin || result
        console.log('[BULLETIN][LOAD]', {
          action: 'fetchBulletinById',
          statut: this.bulletinActuel?.statut,
          nbMouvements: this.bulletinActuel?.mouvements?.length || 0
        })

        return this.bulletinActuel
      } catch (error) {
        this._handleError(error, 'Erreur lors du chargement du bulletin')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger le bulletin en cours pour une escale
     */
    async fetchBulletinEnCours(escale) {
      console.log('[BULLETIN][LOAD]', { action: 'fetchBulletinEnCours', escale })
      this.loading = true
      this.clearError()

      try {
        const response = await bulletinsAPI.getEnCours(escale)
        const result = this._extractData(response)

        this.bulletinActuel = result.bulletin || result
        return this.bulletinActuel
      } catch (error) {
        // 404 = pas de bulletin en cours, ce n'est pas une erreur
        if (error.response?.status === 404) {
          this.bulletinActuel = null
          return null
        }
        this._handleError(error, 'Erreur lors du chargement du bulletin en cours')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Créer un bulletin vide
     */
    async creerBulletin(data) {
      console.log('[BULLETIN][CREATE]', { action: 'creerBulletin', data })
      this.saving = true
      this.clearError()

      try {
        const response = await bulletinsAPI.create(data)
        const result = this._extractData(response)

        this.bulletinActuel = result.bulletin || result
        console.log('[BULLETIN][CREATE]', { result: 'success', id: this.bulletinActuel?._id })

        return this.bulletinActuel
      } catch (error) {
        this._handleError(error, 'Erreur lors de la création du bulletin')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Créer un bulletin pré-rempli depuis un programme
     */
    async creerBulletinDepuisProgramme(data) {
      console.log('[BULLETIN][CREATE]', { action: 'creerBulletinDepuisProgramme', data })
      this.saving = true
      this.clearError()

      try {
        const response = await bulletinsAPI.createFromProgramme(data)
        const result = this._extractData(response)

        this.bulletinActuel = result.bulletin || result
        console.log('[BULLETIN][CREATE]', {
          result: 'success',
          id: this.bulletinActuel?._id,
          nbMouvements: this.bulletinActuel?.mouvements?.length || 0
        })

        return this.bulletinActuel
      } catch (error) {
        this._handleError(error, 'Erreur lors de la création du bulletin depuis le programme')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Supprimer un bulletin (BROUILLON uniquement)
     */
    async supprimerBulletin(id) {
      console.log('[BULLETIN][DELETE]', { action: 'supprimerBulletin', id })
      this.saving = true
      this.clearError()

      try {
        await bulletinsAPI.delete(id)
        console.log('[BULLETIN][DELETE]', { result: 'success' })

        // Retirer de la liste
        this.bulletins = this.bulletins.filter(b => (b._id || b.id) !== id)

        // Reset si c'est le bulletin actuel
        if ((this.bulletinActuel?._id || this.bulletinActuel?.id) === id) {
          this.bulletinActuel = null
        }
      } catch (error) {
        this._handleError(error, 'Erreur lors de la suppression du bulletin')
        throw error
      } finally {
        this.saving = false
      }
    },

    // ============================================
    // MOUVEMENTS
    // ============================================

    /**
     * Ajouter un mouvement
     */
    async ajouterMouvement(data) {
      if (!this.bulletinActuel) throw new Error('Aucun bulletin actif')
      if (!this.peutModifier) throw new Error('Bulletin non modifiable')

      const bulletinId = this.bulletinActuel._id || this.bulletinActuel.id
      console.log('[BULLETIN][MOUVEMENT]', { action: 'ajouter', bulletinId, data })
      this.saving = true
      this.clearError()

      try {
        const response = await bulletinsAPI.addMouvement(bulletinId, data)
        const result = this._extractData(response)

        // Recharger le bulletin pour avoir les données à jour
        await this.fetchBulletinById(bulletinId)

        console.log('[BULLETIN][MOUVEMENT]', { action: 'ajouter', result: 'success' })
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de l\'ajout du mouvement')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Ajouter un vol hors programme
     */
    async ajouterVolHorsProgramme(data) {
      if (!this.bulletinActuel) throw new Error('Aucun bulletin actif')
      if (!this.peutModifier) throw new Error('Bulletin non modifiable')

      const bulletinId = this.bulletinActuel._id || this.bulletinActuel.id
      console.log('[BULLETIN][MOUVEMENT]', { action: 'ajouterHorsProgramme', bulletinId, data })
      this.saving = true
      this.clearError()

      try {
        const response = await bulletinsAPI.addVolHorsProgramme(bulletinId, data)
        const result = this._extractData(response)

        await this.fetchBulletinById(bulletinId)

        console.log('[BULLETIN][MOUVEMENT]', { action: 'ajouterHorsProgramme', result: 'success' })
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de l\'ajout du vol hors programme')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Modifier un mouvement
     */
    async modifierMouvement(mouvementId, data) {
      if (!this.bulletinActuel) throw new Error('Aucun bulletin actif')
      if (!this.peutModifier) throw new Error('Bulletin non modifiable')

      const bulletinId = this.bulletinActuel._id || this.bulletinActuel.id
      console.log('[BULLETIN][MOUVEMENT]', { action: 'modifier', bulletinId, mouvementId, data })
      this.saving = true
      this.clearError()

      try {
        const response = await bulletinsAPI.updateMouvement(bulletinId, mouvementId, data)
        const result = this._extractData(response)

        await this.fetchBulletinById(bulletinId)

        console.log('[BULLETIN][MOUVEMENT]', { action: 'modifier', result: 'success' })
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de la modification du mouvement')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Supprimer un mouvement (BROUILLON uniquement)
     */
    async supprimerMouvement(mouvementId) {
      if (!this.bulletinActuel) throw new Error('Aucun bulletin actif')
      if (!this.peutModifier) throw new Error('Bulletin non modifiable')

      const bulletinId = this.bulletinActuel._id || this.bulletinActuel.id
      console.log('[BULLETIN][MOUVEMENT]', { action: 'supprimer', bulletinId, mouvementId })
      this.saving = true
      this.clearError()

      try {
        await bulletinsAPI.deleteMouvement(bulletinId, mouvementId)
        await this.fetchBulletinById(bulletinId)

        console.log('[BULLETIN][MOUVEMENT]', { action: 'supprimer', result: 'success' })
      } catch (error) {
        this._handleError(error, 'Erreur lors de la suppression du mouvement')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Annuler un mouvement (garde trace)
     */
    async annulerMouvement(mouvementId, raison) {
      if (!this.bulletinActuel) throw new Error('Aucun bulletin actif')

      if (!raison || raison.trim() === '') {
        throw new Error('La raison d\'annulation est obligatoire')
      }

      const bulletinId = this.bulletinActuel._id || this.bulletinActuel.id
      console.log('[BULLETIN][MOUVEMENT]', { action: 'annuler', bulletinId, mouvementId, raison })
      this.saving = true
      this.clearError()

      try {
        const response = await bulletinsAPI.cancelMouvement(bulletinId, mouvementId, raison)
        const result = this._extractData(response)

        await this.fetchBulletinById(bulletinId)

        console.log('[BULLETIN][MOUVEMENT]', { action: 'annuler', result: 'success' })
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de l\'annulation du mouvement')
        throw error
      } finally {
        this.saving = false
      }
    },

    // ============================================
    // WORKFLOW
    // ============================================

    /**
     * Publier un bulletin (BROUILLON → PUBLIE)
     */
    async publierBulletin() {
      if (!this.bulletinActuel) throw new Error('Aucun bulletin actif')
      if (!this.peutPublier) throw new Error('Impossible de publier ce bulletin')

      const bulletinId = this.bulletinActuel._id || this.bulletinActuel.id
      console.log('[BULLETIN][WORKFLOW]', { action: 'publier', bulletinId })
      this.saving = true
      this.clearError()

      try {
        const response = await bulletinsAPI.publish(bulletinId)
        const result = this._extractData(response)

        this.bulletinActuel = result.bulletin || result
        console.log('[BULLETIN][WORKFLOW]', { action: 'publier', result: 'success' })

        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de la publication du bulletin')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Archiver un bulletin (PUBLIE → ARCHIVE)
     */
    async archiverBulletin() {
      if (!this.bulletinActuel) throw new Error('Aucun bulletin actif')
      if (!this.peutArchiver) throw new Error('Impossible d\'archiver ce bulletin')

      const bulletinId = this.bulletinActuel._id || this.bulletinActuel.id
      console.log('[BULLETIN][WORKFLOW]', { action: 'archiver', bulletinId })
      this.saving = true
      this.clearError()

      try {
        const response = await bulletinsAPI.archive(bulletinId)
        const result = this._extractData(response)

        this.bulletinActuel = result.bulletin || result
        console.log('[BULLETIN][WORKFLOW]', { action: 'archiver', result: 'success' })

        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de l\'archivage du bulletin')
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Créer les instances Vol depuis les mouvements
     */
    async creerVols() {
      if (!this.bulletinActuel) throw new Error('Aucun bulletin actif')

      const bulletinId = this.bulletinActuel._id || this.bulletinActuel.id
      console.log('[BULLETIN][WORKFLOW]', { action: 'creerVols', bulletinId })
      this.saving = true
      this.clearError()

      try {
        const response = await bulletinsAPI.createVols(bulletinId)
        const result = this._extractData(response)

        await this.fetchBulletinById(bulletinId)

        console.log('[BULLETIN][WORKFLOW]', { action: 'creerVols', result: 'success' })
        return result
      } catch (error) {
        this._handleError(error, 'Erreur lors de la création des vols')
        throw error
      } finally {
        this.saving = false
      }
    },

    // ============================================
    // FILTRES
    // ============================================

    setFiltre(key, value) {
      if (key in this.filtres) {
        this.filtres[key] = value
      }
    },

    setFiltres(filtres) {
      this.filtres = { ...this.filtres, ...filtres }
    },

    resetFiltres() {
      this.filtres = {
        escale: '',
        statut: '',
        dateDebut: '',
        dateFin: ''
      }
    },

    // ============================================
    // RESET
    // ============================================

    resetBulletinActuel() {
      console.log('[BULLETIN]', { action: 'resetBulletinActuel' })
      this.bulletinActuel = null
      this.clearError()
    },

    resetStore() {
      console.log('[BULLETIN]', { action: 'resetStore' })
      this.bulletinActuel = null
      this.bulletins = []
      this.total = 0
      this.page = 1
      this.pages = 1
      this.resetFiltres()
      this.clearError()
    }
  }
})
