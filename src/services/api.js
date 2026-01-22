/**
 * SERVICE API COMPLET - CONFORME AU BACKEND
 *
 * Source de vérité : API_COMPLETE_FRONTEND.md + RAPPORT_COMPARAISON
 * Couverture : 100% des endpoints backend (97 routes)
 */

import axios from 'axios'

// ============================================
// 1. CONFIGURATION AXIOS
// ============================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

// ============================================
// 2. INTERCEPTEURS
// ============================================

// Intercepteur REQUEST - Ajout token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur RESPONSE - Gestion erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const errorCode = error.response?.data?.code

    // 401 - Session expirée / Token invalide
    if (status === 401) {
      console.warn('[API] Session expirée - Redirection login')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('userData')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true'
      }
      return Promise.reject(error)
    }

    // 403 - Compte désactivé
    if (status === 403 && errorCode === 'ACCOUNT_DISABLED') {
      console.warn('[API] Compte désactivé - Déconnexion forcée')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('userData')
      window.location.href = '/login?disabled=true'
      return Promise.reject(error)
    }

    // Log enrichi pour debug
    if (error.response) {
      console.error('[API Error]', {
        status,
        code: errorCode,
        message: error.response.data?.message,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase()
      })
    }

    return Promise.reject(error)
  }
)

// ============================================
// 3. AUTH API (3 routes)
// ============================================

export const authAPI = {
  /**
   * Connexion utilisateur
   * POST /api/auth/connexion
   * Body: { email, motDePasse }
   */
  login: (credentials) => api.post('/auth/connexion', {
    email: credentials.email,
    motDePasse: credentials.password || credentials.mot_de_passe || credentials.motDePasse
  }),

  /**
   * Inscription (si autorisée - système fermé normalement)
   * POST /api/auth/inscription
   */
  register: (data) => api.post('/auth/inscription', data),

  /**
   * Profil utilisateur connecté
   * GET /api/auth/me
   */
  me: () => api.get('/auth/me'),

  /**
   * Déconnexion
   * POST /api/auth/deconnexion
   */
  logout: () => api.post('/auth/deconnexion'),

  /**
   * Changement de mot de passe
   * POST /api/auth/changer-mot-de-passe
   * Body: { ancienMotDePasse, nouveauMotDePasse }
   */
  changerMotDePasse: (data) => api.post('/auth/changer-mot-de-passe', data)
}

// ============================================
// 4. PERSONNES API (5 routes) - ADMIN
// ============================================

export const personnesAPI = {
  /**
   * Lister tous les utilisateurs
   * GET /api/personnes
   * Query: { page, limit, fonction, statut, search }
   */
  getAll: (params) => api.get('/personnes', { params }),

  /**
   * Obtenir un utilisateur
   * GET /api/personnes/:id
   */
  getById: (id) => api.get(`/personnes/${id}`),

  /**
   * Créer un utilisateur
   * POST /api/personnes
   * Body: { nom, prenom, email, password, fonction, matricule?, telephone?, specialites? }
   */
  create: (data) => api.post('/personnes', data),

  /**
   * Modifier un utilisateur
   * PATCH /api/personnes/:id
   * Body: { nom?, prenom?, email?, fonction?, statut?, statutCompte? }
   */
  update: (id, data) => api.patch(`/personnes/${id}`, data),

  /**
   * Supprimer un utilisateur
   * DELETE /api/personnes/:id
   * Note: Échoue si compte utilisé (ACCOUNT_IN_USE)
   */
  delete: (id) => api.delete(`/personnes/${id}`),

  // Helpers
  desactiver: (id, raison = '') => api.patch(`/personnes/${id}`, {
    statutCompte: 'DESACTIVE',
    raisonDesactivation: raison
  }),

  reactiver: (id) => api.patch(`/personnes/${id}`, {
    statutCompte: 'VALIDE'
  }),

  suspendre: (id, raison = '') => api.patch(`/personnes/${id}`, {
    statutCompte: 'SUSPENDU',
    raisonSuspension: raison
  })
}

// ============================================
// 5. CRV API (26 routes) - inclut Extension 6 Annulation + Workflow complet
// ============================================

export const crvAPI = {
  /**
   * Créer un CRV
   * POST /api/crv
   * Body: { volId?, type?, date?, responsableVolId? }
   * Middlewares: protect, excludeQualite, verifierPhasesAutoriseesCreationCRV, auditLog
   */
  create: (data) => {
    console.log('[CRV API] create() - Création CRV avec:', data)
    return api.post('/crv', data)
  },

  /**
   * Lister les CRV
   * GET /api/crv
   * Query: { statut, compagnie, dateDebut, dateFin, page, limit, sort }
   */
  getAll: (params) => {
    console.log('[CRV API] getAll() - Paramètres:', params)
    return api.get('/crv', { params })
  },

  /**
   * Obtenir un CRV complet
   * GET /api/crv/:id
   * Retourne: { crv, phases, charges, evenements, observations }
   */
  getById: (id) => {
    console.log('[CRV API] getById() - ID:', id)
    return api.get(`/crv/${id}`)
  },

  /**
   * Modifier un CRV
   * PATCH /api/crv/:id
   * Body: { responsableVol?, vol?, confirmations?, ... }
   * Middlewares: protect, excludeQualite, verifierCRVNonVerrouille
   * NOTE: Ne pas utiliser pour changer statut - utiliser demarrer/terminer
   */
  update: (id, data) => {
    console.log('[CRV API] update() - ID:', id, '- Data:', data)
    return api.patch(`/crv/${id}`, data)
  },

  /**
   * Supprimer un CRV
   * DELETE /api/crv/:id
   * Rôles: SUPERVISEUR, MANAGER
   */
  delete: (id) => {
    console.log('[CRV API] delete() - ID:', id)
    return api.delete(`/crv/${id}`)
  },

  // ============================================
  // WORKFLOW CRV - Routes de transition d'état
  // ============================================

  /**
   * 🆕 Démarrer un CRV (BROUILLON → EN_COURS)
   * POST /api/crv/:id/demarrer
   */
  demarrer: (id) => {
    console.log('[CRV API] demarrer() - Démarrage CRV ID:', id)
    return api.post(`/crv/${id}/demarrer`)
  },

  /**
   * 🆕 Terminer un CRV (EN_COURS → TERMINE)
   * POST /api/crv/:id/terminer
   * Prérequis: complétude >= 50%, phases obligatoires traitées
   */
  terminer: (id) => {
    console.log('[CRV API] terminer() - Terminaison CRV ID:', id)
    return api.post(`/crv/${id}/terminer`)
  },

  /**
   * 🆕 Obtenir les transitions possibles
   * GET /api/crv/:id/transitions
   * Retourne: { statutActuel, transitionsPossibles: [...], completude }
   */
  getTransitions: (id) => {
    console.log('[CRV API] getTransitions() - ID:', id)
    return api.get(`/crv/${id}/transitions`)
  },

  /**
   * 🆕 Confirmer absence (événement/observation/charge)
   * POST /api/crv/:id/confirmer-absence
   * Body: { type: 'evenement' | 'observation' | 'charge' }
   * Impact complétude: événement +20%, observation +10%, charge +30%
   */
  confirmerAbsence: (id, type) => {
    console.log('[CRV API] confirmerAbsence() - ID:', id, '- Type:', type)
    return api.post(`/crv/${id}/confirmer-absence`, { type })
  },

  /**
   * 🆕 Annuler confirmation absence
   * DELETE /api/crv/:id/confirmer-absence
   * Body: { type: 'evenement' | 'observation' | 'charge' }
   */
  annulerConfirmationAbsence: (id, type) => {
    console.log('[CRV API] annulerConfirmationAbsence() - ID:', id, '- Type:', type)
    return api.delete(`/crv/${id}/confirmer-absence`, { data: { type } })
  },

  /**
   * 🆕 Mettre à jour les horaires du CRV
   * PUT /api/crv/:id/horaire
   * Body: { heureAtterrissageReelle?, heureArriveeAuParcReelle?,
   *         heureDepartDuParcReelle?, heureDecollageReelle?, remarques? }
   * Alias frontend acceptés: touchdownTime, onBlockTime, offBlockTime, takeoffTime
   */
  updateHoraire: (id, data) => {
    console.log('[CRV API] updateHoraire() - ID:', id, '- Horaires:', data)
    return api.put(`/crv/${id}/horaire`, data)
  },

  /**
   * 🆕 Mettre à jour le personnel affecté (remplace tout)
   * PUT /api/crv/:id/personnel
   * Body: { personnelAffecte: [{ nom, prenom, fonction, matricule?, telephone?, remarques? }] }
   */
  updatePersonnel: (id, data) => {
    console.log('[CRV API] updatePersonnel() - ID:', id, '- Personnel:', data)
    return api.put(`/crv/${id}/personnel`, data)
  },

  /**
   * 🆕 Ajouter une personne au personnel
   * POST /api/crv/:id/personnel
   * Body: { nom, prenom, fonction, matricule?, telephone?, remarques? }
   */
  addPersonne: (id, data) => {
    console.log('[CRV API] addPersonne() - ID:', id, '- Personne:', data)
    return api.post(`/crv/${id}/personnel`, data)
  },

  /**
   * 🆕 Supprimer une personne du personnel
   * DELETE /api/crv/:id/personnel/:personneId
   */
  removePersonne: (id, personneId) => {
    console.log('[CRV API] removePersonne() - CRV ID:', id, '- Personne ID:', personneId)
    return api.delete(`/crv/${id}/personnel/${personneId}`)
  },

  /**
   * Ajouter une charge opérationnelle
   * POST /api/crv/:id/charges
   * Body: { typeCharge: 'PASSAGERS'|'BAGAGES'|'FRET', sensOperation: 'EMBARQUEMENT'|'DEBARQUEMENT', ... }
   * Règles: PASSAGERS requiert passagersAdultes explicite, BAGAGES requiert poids si nombre>0
   */
  addCharge: (id, data) => {
    console.log('[CRV API] addCharge() - CRV ID:', id, '- Charge:', data)
    return api.post(`/crv/${id}/charges`, data)
  },

  /**
   * Ajouter un événement
   * POST /api/crv/:id/evenements
   * Body: { typeEvenement, gravite: 'MINEURE'|'MODEREE'|'MAJEURE'|'CRITIQUE', description, dateHeureDebut?, dateHeureFin? }
   */
  addEvenement: (id, data) => {
    console.log('[CRV API] addEvenement() - CRV ID:', id, '- Événement:', data)
    return api.post(`/crv/${id}/evenements`, data)
  },

  /**
   * Ajouter une observation
   * POST /api/crv/:id/observations
   * Body: { categorie: 'GENERALE'|'TECHNIQUE'|'OPERATIONNELLE'|'SECURITE'|'QUALITE'|'SLA', contenu, phaseConcernee? }
   */
  addObservation: (id, data) => {
    console.log('[CRV API] addObservation() - CRV ID:', id, '- Observation:', data)
    return api.post(`/crv/${id}/observations`, data)
  },

  /**
   * Recherche full-text
   * GET /api/crv/search
   * Query: { q, dateDebut, dateFin, statut }
   */
  search: (params) => api.get('/crv/search', { params }),

  /**
   * Statistiques CRV
   * GET /api/crv/stats
   * Query: { dateDebut, dateFin }
   */
  getStats: (params) => api.get('/crv/stats', { params }),

  /**
   * Export Excel/CSV
   * GET /api/crv/export
   * Query: { format: 'excel'|'csv', dateDebut, dateFin, statut }
   */
  export: (params) => api.get('/crv/export', {
    params,
    responseType: 'blob'
  }),

  /**
   * CRV annulés
   * GET /api/crv/annules
   * Query: { dateDebut, dateFin, page, limit }
   */
  getAnnules: (params) => api.get('/crv/annules', { params }),

  // ============================================
  // ARCHIVAGE GOOGLE DRIVE
  // ============================================

  /**
   * Archiver un CRV dans Google Drive
   * POST /api/crv/:id/archive
   * @returns {Object} { crv, archivage: { fileId, webViewLink, filename, folderPath, size, archivedAt, version } }
   */
  archive: (id) => {
    console.log('[CRV API] archive() - Archivage CRV ID:', id)
    return api.post(`/crv/${id}/archive`)
  },

  /**
   * Vérifier si un CRV peut être archivé
   * GET /api/crv/:id/archive/status
   * @returns {Object} { canArchive, crv: { isAlreadyArchived, statut }, messages }
   */
  getArchivageStatus: (id) => {
    console.log('[CRV API] getArchivageStatus() - CRV ID:', id)
    return api.get(`/crv/${id}/archive/status`)
  },

  /**
   * Obtenir le PDF d'un CRV en base64 (pour preview)
   * GET /api/crv/:id/pdf-base64
   * @returns {Object} { base64, mimeType }
   */
  getPDFBase64: (id) => {
    console.log('[CRV API] getPDFBase64() - CRV ID:', id)
    return api.get(`/crv/${id}/pdf-base64`)
  },

  /**
   * Télécharger le PDF d'un CRV
   * GET /api/crv/:id/telecharger-pdf
   * @returns {Blob} Fichier PDF
   */
  telechargerPDF: (id) => {
    console.log('[CRV API] telechargerPDF() - CRV ID:', id)
    return api.get(`/crv/${id}/telecharger-pdf`, {
      responseType: 'blob'
    })
  },

  // ============================================
  // Extension 6 - Annulation CRV
  // ============================================

  /**
   * Vérifier si un CRV peut être annulé
   * GET /api/crv/:id/peut-annuler
   * Retourne: { peutAnnuler: boolean, raisons?: string[] }
   */
  peutAnnuler: (id) => api.get(`/crv/${id}/peut-annuler`),

  /**
   * Annuler un CRV
   * POST /api/crv/:id/annuler
   * Body: { motifAnnulation: string, details?: string }
   * Rôles: SUPERVISEUR, MANAGER
   */
  annuler: (id, data) => api.post(`/crv/${id}/annuler`, data),

  /**
   * Réactiver un CRV annulé
   * POST /api/crv/:id/reactiver
   * Body: { motifReactivation: string }
   * Rôles: MANAGER uniquement
   */
  reactiver: (id, data) => api.post(`/crv/${id}/reactiver`, data),

  /**
   * Statistiques des annulations (MANAGER)
   * GET /api/crv/statistiques/annulations
   * Query: { dateDebut, dateFin, compagnie? }
   */
  getStatistiquesAnnulations: (params) => api.get('/crv/statistiques/annulations', { params }),

  /**
   * Statut du service d'archivage
   * GET /api/crv/archive/status
   */
  getArchiveStatus: () => api.get('/crv/archive/status'),

  /**
   * Test du service d'archivage
   * POST /api/crv/archive/test
   */
  testArchive: () => api.post('/crv/archive/test')
}

// ============================================
// 6. PHASES API (4 routes)
// ============================================

export const phasesAPI = {
  /**
   * Démarrer une phase
   * POST /api/phases/:id/demarrer
   * Middlewares: protect, excludeQualite, verifierCoherencePhaseTypeOperation, auditLog
   */
  demarrer: (id) => api.post(`/phases/${id}/demarrer`),

  /**
   * Terminer une phase
   * POST /api/phases/:id/terminer
   * Middlewares: protect, excludeQualite, verifierCoherencePhaseTypeOperation, auditLog
   */
  terminer: (id) => api.post(`/phases/${id}/terminer`),

  /**
   * Marquer une phase comme non réalisée
   * POST /api/phases/:id/non-realise
   * Body: {
   *   motifNonRealisation: 'NON_NECESSAIRE'|'EQUIPEMENT_INDISPONIBLE'|'PERSONNEL_ABSENT'|'CONDITIONS_METEO'|'AUTRE',
   *   detailMotif?: string (requis si motif = 'AUTRE')
   * }
   */
  marquerNonRealise: (id, data) => api.post(`/phases/${id}/non-realise`, data),

  /**
   * Modifier une phase
   * PATCH /api/phases/:id
   * Body: { personnelAffecte?, equipementsUtilises?, dureePrevue?, ... }
   */
  update: (id, data) => api.patch(`/phases/${id}`, data),

  /**
   * Obtenir une phase
   * GET /api/phases/:id
   */
  getById: (id) => api.get(`/phases/${id}`),

  /**
   * Lister les phases d'un CRV
   * GET /api/phases?crvId=xxx
   */
  getByCRV: (crvId) => api.get('/phases', { params: { crvId } }),

  /**
   * Mise à jour manuelle d'une phase (heures saisies par l'utilisateur)
   * PUT /api/crv/:crvId/phases/:phaseId
   * Body: {
   *   statut?: 'NON_COMMENCE' | 'EN_COURS' | 'TERMINE' | 'NON_REALISE',
   *   heureDebutReelle?: 'HH:mm',
   *   heureFinReelle?: 'HH:mm',
   *   motifNonRealisation?: 'NON_NECESSAIRE' | 'EQUIPEMENT_INDISPONIBLE' | 'PERSONNEL_ABSENT' | 'CONDITIONS_METEO' | 'AUTRE',
   *   detailMotif?: string,
   *   remarques?: string
   * }
   */
  updateManuel: (crvId, phaseId, data) => {
    console.log('[PHASES API] updateManuel() - CRV:', crvId, '- Phase:', phaseId, '- Data:', data)
    return api.put(`/crv/${crvId}/phases/${phaseId}`, data)
  }
}

// ============================================
// 7. VOLS API (12 routes) - inclut Extension 2
// ============================================

export const volsAPI = {
  /**
   * Créer un vol
   * POST /api/vols
   * Body: {
   *   numeroVol, typeOperation: 'ARRIVEE'|'DEPART'|'TURN_AROUND',
   *   compagnieAerienne, codeIATA, dateVol, avion?
   * }
   */
  create: (data) => api.post('/vols', data),

  /**
   * Lister les vols
   * GET /api/vols
   * Query: { dateDebut, dateFin, typeOperation, compagnie, page, limit, sort }
   */
  getAll: (params) => api.get('/vols', { params }),

  /**
   * Obtenir un vol
   * GET /api/vols/:id
   */
  getById: (id) => api.get(`/vols/${id}`),

  /**
   * Modifier un vol
   * PATCH /api/vols/:id
   */
  update: (id, data) => api.patch(`/vols/${id}`, data),

  /**
   * Supprimer un vol
   * DELETE /api/vols/:id
   */
  delete: (id) => api.delete(`/vols/${id}`),

  /**
   * Lier un vol à un programme
   * POST /api/vols/:id/lier-programme
   * Body: { programmeId }
   */
  lierProgramme: (id, programmeId) => api.post(`/vols/${id}/lier-programme`, { programmeId }),

  /**
   * Marquer un vol comme hors programme
   * POST /api/vols/:id/marquer-hors-programme
   * Body: { typeVolHorsProgramme: 'CHARTER'|'VOL_FERRY'|'MEDICAL'|'TECHNIQUE'|'AUTRE', raisonHorsProgramme? }
   */
  marquerHorsProgramme: (id, data) => api.post(`/vols/${id}/marquer-hors-programme`, data),

  /**
   * Détacher un vol d'un programme
   * POST /api/vols/:id/detacher-programme
   */
  detacherProgramme: (id) => api.post(`/vols/${id}/detacher-programme`),

  // ============================================
  // Extension 2 - Vols programmés
  // ============================================

  /**
   * Suggérer des programmes pour un vol
   * GET /api/vols/:id/suggerer-programmes
   * Retourne: { suggestions: Programme[] }
   */
  suggererProgrammes: (id) => api.get(`/vols/${id}/suggerer-programmes`),

  /**
   * Lister les vols d'un programme
   * GET /api/vols/programme/:programmeVolId
   * Query: { page, limit }
   */
  getByProgramme: (programmeId, params) => api.get(`/vols/programme/${programmeId}`, { params }),

  /**
   * Lister les vols hors programme
   * GET /api/vols/hors-programme
   * Query: { dateDebut, dateFin, typeVol, page, limit }
   */
  getHorsProgramme: (params) => api.get('/vols/hors-programme', { params }),

  /**
   * Statistiques des programmes de vols
   * GET /api/vols/statistiques/programmes
   * Query: { dateDebut, dateFin }
   */
  getStatistiquesProgrammes: (params) => api.get('/vols/statistiques/programmes', { params })
}

// ============================================
// 8. PROGRAMMES VOL API (10 routes) - inclut Extension 1
// ============================================

export const programmesVolAPI = {
  /**
   * Créer un programme vol
   * POST /api/programmes-vol
   * Body: { nom, dateDebut, dateFin, saison, compagnies?, vols? }
   */
  create: (data) => api.post('/programmes-vol', data),

  /**
   * Lister les programmes vol
   * GET /api/programmes-vol
   * Query: { statut, saison, dateDebut, dateFin, page, limit }
   */
  getAll: (params) => api.get('/programmes-vol', { params }),

  /**
   * Obtenir un programme vol
   * GET /api/programmes-vol/:id
   */
  getById: (id) => api.get(`/programmes-vol/${id}`),

  /**
   * Modifier un programme vol
   * PATCH /api/programmes-vol/:id
   */
  update: (id, data) => api.patch(`/programmes-vol/${id}`, data),

  /**
   * Supprimer un programme vol
   * DELETE /api/programmes-vol/:id
   * Rôles: MANAGER uniquement
   */
  delete: (id) => api.delete(`/programmes-vol/${id}`),

  /**
   * Valider un programme vol
   * POST /api/programmes-vol/:id/valider
   * Rôles: SUPERVISEUR, MANAGER
   */
  valider: (id) => api.post(`/programmes-vol/${id}/valider`),

  /**
   * Activer un programme vol
   * POST /api/programmes-vol/:id/activer
   * Rôles: SUPERVISEUR, MANAGER
   */
  activer: (id) => api.post(`/programmes-vol/${id}/activer`),

  /**
   * Suspendre un programme vol
   * POST /api/programmes-vol/:id/suspendre
   * Body: { raison? }
   */
  suspendre: (id, raison = '') => api.post(`/programmes-vol/${id}/suspendre`, { raison }),

  /**
   * Importer un programme depuis Excel (legacy - FormData)
   * POST /api/programmes-vol/import
   * Body: FormData avec fichier
   */
  import: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/programmes-vol/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  /**
   * Import en masse de programmes (JSON)
   * POST /api/programmes-vol/import
   * Body: { programmes: ProgrammeVolSaisonnier[] }
   * @param {Array} programmes - Tableau de programmes à importer
   */
  importBulk: (programmes) => api.post('/programmes-vol/import', { programmes }),

  /**
   * Programmes applicables à une date (Extension 1)
   * GET /api/programmes-vol/applicables/:date
   * Query: { compagnieAerienne?, categorieVol? }
   */
  getApplicables: (date, params = {}) => api.get(`/programmes-vol/applicables/${date}`, { params }),

  /**
   * Recherche par route
   * GET /api/programmes-vol/par-route
   * Query: { provenance?, destination?, categorieVol? }
   */
  getParRoute: (params) => api.get('/programmes-vol/par-route', { params }),

  /**
   * Résumé global des programmes
   * GET /api/programmes-vol/resume
   * Retourne: { totalProgrammesActifs, totalVolsHebdomadaires, parCategorie, parJour }
   */
  getResume: () => api.get('/programmes-vol/resume'),

  /**
   * Statistiques par catégorie
   * GET /api/programmes-vol/statistiques/categories
   * Retourne: [{ _id: 'PASSAGER', count, compagnies }]
   */
  getStatistiquesCategories: () => api.get('/programmes-vol/statistiques/categories'),

  /**
   * Statistiques par jour de la semaine
   * GET /api/programmes-vol/statistiques/jours
   * Retourne: { Lundi: { total, passagers, cargo, domestiques }, ... }
   */
  getStatistiquesJours: () => api.get('/programmes-vol/statistiques/jours'),

  /**
   * Obtenir le programme actif
   * GET /api/programmes-vol/actif
   */
  getActif: () => api.get('/programmes-vol/actif'),

  /**
   * Dupliquer un programme
   * POST /api/programmes-vol/:id/dupliquer
   */
  dupliquer: (id) => api.post(`/programmes-vol/${id}/dupliquer`),

  /**
   * Obtenir les statistiques d'un programme
   * GET /api/programmes-vol/:id/statistiques
   */
  getStatistiques: (id) => api.get(`/programmes-vol/${id}/statistiques`),

  // ============================================
  // VOLS D'UN PROGRAMME (architecture 2 niveaux)
  // ============================================

  /**
   * Lister les vols d'un programme
   * GET /api/programmes-vol/:programmeId/vols
   */
  getVols: (programmeId, params = {}) => api.get(`/programmes-vol/${programmeId}/vols`, { params }),

  /**
   * Obtenir les vols d'un jour spécifique
   * GET /api/programmes-vol/:programmeId/vols/jour/:jour
   * @param jour - 0=Dimanche, 1=Lundi, ..., 6=Samedi
   */
  getVolsParJour: (programmeId, jour) => api.get(`/programmes-vol/${programmeId}/vols/jour/${jour}`),

  /**
   * Rechercher des vols par numéro
   * GET /api/programmes-vol/:programmeId/vols/recherche
   * Query: { q: "ET939" }
   */
  rechercherVols: (programmeId, query) => api.get(`/programmes-vol/${programmeId}/vols/recherche`, { params: { q: query } }),

  /**
   * Obtenir les vols d'une compagnie
   * GET /api/programmes-vol/:programmeId/vols/compagnie/:code
   */
  getVolsParCompagnie: (programmeId, codeCompagnie) => api.get(`/programmes-vol/${programmeId}/vols/compagnie/${codeCompagnie}`),

  /**
   * Ajouter un vol à un programme
   * POST /api/programmes-vol/:programmeId/vols
   * Body: { joursSemaine, numeroVol, typeAvion, provenance, heureArrivee, destination, heureDepart, ... }
   */
  addVol: (programmeId, data) => api.post(`/programmes-vol/${programmeId}/vols`, data),

  /**
   * Importer plusieurs vols
   * POST /api/programmes-vol/:programmeId/vols/import
   * Body: { vols: [...] }
   */
  importVols: (programmeId, vols) => api.post(`/programmes-vol/${programmeId}/vols/import`, { vols }),

  /**
   * Réorganiser l'ordre des vols
   * PATCH /api/programmes-vol/:programmeId/vols/reorganiser
   * Body: { volsOrdre: [{ id, ordre }] }
   */
  reorganiserVols: (programmeId, volsOrdre) => api.patch(`/programmes-vol/${programmeId}/vols/reorganiser`, { volsOrdre }),

  /**
   * Obtenir un vol spécifique
   * GET /api/programmes-vol/:programmeId/vols/:volId
   */
  getVol: (programmeId, volId) => api.get(`/programmes-vol/${programmeId}/vols/${volId}`),

  /**
   * Modifier un vol
   * PATCH /api/programmes-vol/:programmeId/vols/:volId
   */
  updateVol: (programmeId, volId, data) => api.patch(`/programmes-vol/${programmeId}/vols/${volId}`, data),

  /**
   * Supprimer un vol
   * DELETE /api/programmes-vol/:programmeId/vols/:volId
   */
  deleteVol: (programmeId, volId) => api.delete(`/programmes-vol/${programmeId}/vols/${volId}`),

  /**
   * Exporter les données pour PDF (aperçu JSON)
   * GET /api/programmes-vol/:programmeId/export-pdf
   * @returns {Object} Données structurées pour affichage
   */
  exportPDF: (programmeId) => api.get(`/programmes-vol/${programmeId}/export-pdf`),

  /**
   * Télécharger le PDF du programme de vols
   * GET /api/programmes-vol/:programmeId/telecharger-pdf
   * @returns {Blob} Fichier PDF
   */
  telechargerPDF: (programmeId) => api.get(`/programmes-vol/${programmeId}/telecharger-pdf`, {
    responseType: 'blob'
  }),

  /**
   * Obtenir le PDF en base64 (pour preview dans modal)
   * GET /api/programmes-vol/:programmeId/pdf-base64
   * @returns {Object} { base64: string, mimeType: string }
   */
  getPDFBase64: (programmeId) => api.get(`/programmes-vol/${programmeId}/pdf-base64`),

  // ============================================
  // ARCHIVAGE GOOGLE DRIVE
  // ============================================

  /**
   * Archiver un programme de vols dans Google Drive
   * POST /api/programmes-vol/:programmeId/archiver
   * @returns {Object} { programme, archivage: { fileId, webViewLink, filename, folderPath, size, archivedAt, version } }
   */
  archiver: (programmeId) => {
    console.log('[PROGRAMMES VOL API] archiver() - Programme ID:', programmeId)
    return api.post(`/programmes-vol/${programmeId}/archiver`)
  },

  /**
   * Vérifier si un programme peut être archivé
   * GET /api/programmes-vol/:programmeId/archivage/status
   * @returns {Object} { canArchive, programme: { isAlreadyArchived, statut }, messages }
   */
  getArchivageStatus: (programmeId) => {
    console.log('[PROGRAMMES VOL API] getArchivageStatus() - Programme ID:', programmeId)
    return api.get(`/programmes-vol/${programmeId}/archivage/status`)
  }
}

// ============================================
// 9. CHARGES API (16 routes) - inclut Extensions 4 & 5
// ============================================

export const chargesAPI = {
  /**
   * Obtenir une charge
   * GET /api/charges/:id
   */
  getById: (id) => api.get(`/charges/${id}`),

  /**
   * Modifier catégories détaillées passagers
   * PUT /api/charges/:id/categories-detaillees
   * Body: {
   *   categoriesDetaillees: {
   *     bebes, enfants, adolescents, adultes, seniors,
   *     pmrFauteuilRoulant, pmrMarcheAssistee, pmrAutre,
   *     transitDirect, transitAvecChangement, vip, equipage, deportes
   *   }
   * }
   */
  updateCategoriesDetaillees: (id, data) => api.put(`/charges/${id}/categories-detaillees`, data),

  /**
   * Modifier classes passagers
   * PUT /api/charges/:id/classes
   * Body: { classes: { premiere, affaires, economique } }
   */
  updateClasses: (id, data) => api.put(`/charges/${id}/classes`, data),

  /**
   * Modifier besoins médicaux
   * PUT /api/charges/:id/besoins-medicaux
   * Body: { besoinsMedicaux: { oxygeneBord, brancardier, accompagnementMedical } }
   */
  updateBesoinsMedicaux: (id, data) => api.put(`/charges/${id}/besoins-medicaux`, data),

  /**
   * Modifier mineurs
   * PUT /api/charges/:id/mineurs
   * Body: { mineurs: { mineurNonAccompagne, bebeNonAccompagne } }
   */
  updateMineurs: (id, data) => api.put(`/charges/${id}/mineurs`, data),

  /**
   * Convertir vers catégories détaillées
   * POST /api/charges/:id/convertir-categories-detaillees
   */
  convertirCategoriesDetaillees: (id) => api.post(`/charges/${id}/convertir-categories-detaillees`),

  /**
   * Modifier fret détaillé
   * PUT /api/charges/:id/fret-detaille
   * Body: {
   *   fretDetaille: {
   *     categoriesFret: { general, perissable, fragile, valeurElevee, volumineux, animal },
   *     logistique: { nombreColis, nombrePalettes, numeroLTA, numeroAWB },
   *     douanes: { declarationDouane, valeurDeclaree, devise },
   *     conditionsTransport: { temperatureMin, temperatureMax, humidite, instructionsSpeciales }
   *   }
   * }
   */
  updateFretDetaille: (id, data) => api.put(`/charges/${id}/fret-detaille`, data),

  /**
   * Ajouter une marchandise dangereuse
   * POST /api/charges/:id/marchandises-dangereuses
   * Body: {
   *   codeONU, classeONU, designationOfficielle,
   *   quantite, unite, groupeEmballage?, instructions?
   * }
   */
  addMarchandiseDangereuse: (id, data) => api.post(`/charges/${id}/marchandises-dangereuses`, data),

  /**
   * Supprimer une marchandise dangereuse
   * DELETE /api/charges/:id/marchandises-dangereuses/:mdId
   */
  deleteMarchandiseDangereuse: (id, mdId) => api.delete(`/charges/${id}/marchandises-dangereuses/${mdId}`),

  /**
   * Statistiques passagers globales
   * GET /api/charges/statistiques/passagers
   * Query: { dateDebut, dateFin, compagnie? }
   */
  getStatistiquesPassagers: (params) => api.get('/charges/statistiques/passagers', { params }),

  /**
   * Statistiques fret globales
   * GET /api/charges/statistiques/fret
   * Query: { dateDebut, dateFin, compagnie? }
   */
  getStatistiquesFret: (params) => api.get('/charges/statistiques/fret', { params }),

  /**
   * Modifier une charge (générique)
   * PATCH /api/charges/:id
   */
  update: (id, data) => api.patch(`/charges/${id}`, data),

  // ============================================
  // Extension 5 - Validation DGR (Marchandises Dangereuses)
  // ============================================

  /**
   * Valider une marchandise dangereuse (CRITIQUE - réglementaire)
   * POST /api/charges/valider-marchandise-dangereuse
   * Body: { codeONU, classeONU, quantite, unite, ... }
   * Retourne: { valide: boolean, erreurs?: string[], avertissements?: string[] }
   */
  validerMarchandiseDangereuse: (data) => api.post('/charges/valider-marchandise-dangereuse', data),

  /**
   * Lister toutes les marchandises dangereuses
   * GET /api/charges/marchandises-dangereuses
   * Query: { dateDebut, dateFin, codeONU?, classeONU?, page, limit }
   */
  getMarchandisesDangereuses: (params) => api.get('/charges/marchandises-dangereuses', { params }),

  // ============================================
  // Statistiques par CRV
  // ============================================

  /**
   * Statistiques passagers d'un CRV spécifique
   * GET /api/charges/crv/:crvId/statistiques-passagers
   */
  getStatistiquesPassagersByCRV: (crvId) => api.get(`/charges/crv/${crvId}/statistiques-passagers`),

  /**
   * Statistiques fret d'un CRV spécifique
   * GET /api/charges/crv/:crvId/statistiques-fret
   */
  getStatistiquesFretByCRV: (crvId) => api.get(`/charges/crv/${crvId}/statistiques-fret`)
}

// ============================================
// 10. AVIONS API (9 routes)
// ============================================

export const avionsAPI = {
  /**
   * Lister les avions
   * GET /api/avions
   */
  getAll: (params) => api.get('/avions', { params }),

  /**
   * Obtenir un avion
   * GET /api/avions/:id
   */
  getById: (id) => api.get(`/avions/${id}`),

  /**
   * Créer un avion
   * POST /api/avions
   */
  create: (data) => api.post('/avions', data),

  /**
   * Modifier la configuration d'un avion
   * PUT /api/avions/:id/configuration
   * Body: { configuration }
   */
  updateConfiguration: (id, data) => api.put(`/avions/${id}/configuration`, data),

  /**
   * Créer une version de configuration
   * POST /api/avions/:id/versions
   * Body: { description?, configuration }
   */
  createVersion: (id, data) => api.post(`/avions/${id}/versions`, data),

  /**
   * Lister les versions de configuration
   * GET /api/avions/:id/versions
   */
  getVersions: (id) => api.get(`/avions/${id}/versions`),

  /**
   * Obtenir une version spécifique
   * GET /api/avions/:id/versions/:numero
   */
  getVersion: (id, numero) => api.get(`/avions/${id}/versions/${numero}`),

  /**
   * Restaurer une version de configuration
   * POST /api/avions/:id/versions/:numero/restaurer
   */
  restaurerVersion: (id, numero) => api.post(`/avions/${id}/versions/${numero}/restaurer`),

  /**
   * Comparer deux versions
   * GET /api/avions/:id/versions/comparer
   * Query: { v1, v2 }
   */
  comparerVersions: (id, v1, v2) => api.get(`/avions/${id}/versions/comparer`, {
    params: { v1, v2 }
  }),

  /**
   * Planifier une révision
   * PUT /api/avions/:id/revision
   * Body: { dateRevision, typeRevision, description? }
   */
  planifierRevision: (id, data) => api.put(`/avions/${id}/revision`, data),

  /**
   * Révisions à venir
   * GET /api/avions/revisions/prochaines
   */
  getRevisionsProchaines: () => api.get('/avions/revisions/prochaines'),

  /**
   * Statistiques configurations
   * GET /api/avions/statistiques/configurations
   */
  getStatistiquesConfigurations: () => api.get('/avions/statistiques/configurations')
}

// ============================================
// 11. NOTIFICATIONS API (8 routes)
// ============================================

export const notificationsAPI = {
  /**
   * Mes notifications
   * GET /api/notifications
   * Query: { lu?, type?, page, limit }
   */
  getAll: (params) => api.get('/notifications', { params }),

  /**
   * Compteur notifications non lues
   * GET /api/notifications/count-non-lues
   */
  getCountNonLues: () => api.get('/notifications/count-non-lues'),

  /**
   * Marquer toutes comme lues
   * PATCH /api/notifications/lire-toutes
   */
  marquerToutesLues: () => api.patch('/notifications/lire-toutes'),

  /**
   * Statistiques notifications
   * GET /api/notifications/statistiques
   */
  getStatistiques: () => api.get('/notifications/statistiques'),

  /**
   * Créer une notification (MANAGER uniquement)
   * POST /api/notifications
   * Body: { destinataire, type: 'INFO'|'WARNING'|'URGENT'|'SYSTEME', titre, message, reference? }
   */
  create: (data) => api.post('/notifications', data),

  /**
   * Marquer une notification comme lue
   * PATCH /api/notifications/:id/lire
   */
  marquerLue: (id) => api.patch(`/notifications/${id}/lire`),

  /**
   * Archiver une notification
   * PATCH /api/notifications/:id/archiver
   */
  archiver: (id) => api.patch(`/notifications/${id}/archiver`),

  /**
   * Supprimer une notification
   * DELETE /api/notifications/:id
   */
  delete: (id) => api.delete(`/notifications/${id}`)
}

// ============================================
// 12. SLA API (7 routes)
// ============================================

export const slaAPI = {
  /**
   * Rapport SLA global (MANAGER)
   * GET /api/sla/rapport
   * Query: { dateDebut, dateFin }
   */
  getRapport: (params) => api.get('/sla/rapport', { params }),

  /**
   * Configuration SLA actuelle
   * GET /api/sla/configuration
   */
  getConfiguration: () => api.get('/sla/configuration'),

  /**
   * Modifier configuration SLA (MANAGER)
   * PUT /api/sla/configuration
   * Body: { seuils, alertes, ... }
   */
  updateConfiguration: (data) => api.put('/sla/configuration', data),

  /**
   * Surveiller un CRV (MANAGER)
   * POST /api/sla/surveiller/crv
   * Body: { crvId }
   */
  surveillerCRV: (crvId) => api.post('/sla/surveiller/crv', { crvId }),

  /**
   * Surveiller des phases (MANAGER)
   * POST /api/sla/surveiller/phases
   * Body: { phaseIds: [] }
   */
  surveillerPhases: (phaseIds) => api.post('/sla/surveiller/phases', { phaseIds }),

  /**
   * SLA d'un CRV spécifique
   * GET /api/sla/crv/:id
   */
  getCRVSla: (id) => api.get(`/sla/crv/${id}`),

  /**
   * SLA d'une phase spécifique
   * GET /api/sla/phase/:id
   */
  getPhaseSla: (id) => api.get(`/sla/phase/${id}`)
}

// ============================================
// 13. VALIDATION API (4 routes)
// ============================================

export const validationAPI = {
  /**
   * Valider un CRV (QUALITE, ADMIN uniquement - MVS-10)
   * POST /api/validation/:id/valider
   * Body: { commentaires? }
   * Prérequis: statut=TERMINE, completude >= 80%
   * Résultat: statut passe à VALIDE
   */
  valider: (id, commentaires = null) => {
    console.log('[VALIDATION API] valider() - CRV ID:', id, '- Commentaires:', commentaires)
    const body = commentaires ? { commentaires } : {}
    return api.post(`/validation/${id}/valider`, body)
  },

  /**
   * MVS-10: Rejeter un CRV (QUALITE, ADMIN uniquement)
   * POST /api/validation/:id/rejeter
   * Body: { commentaires } (obligatoire)
   * Résultat: CRV retourne à EN_COURS pour correction
   */
  rejeter: (id, commentaires) => {
    console.log('[VALIDATION API] rejeter() - CRV ID:', id, '- Commentaires:', commentaires)
    return api.post(`/validation/${id}/rejeter`, { commentaires })
  },

  /**
   * Verrouiller un CRV (QUALITE, ADMIN uniquement - MVS-10)
   * POST /api/validation/:id/verrouiller
   * Prérequis: statut=VALIDE
   * Résultat: CRV définitif, aucune modification possible
   */
  verrouiller: (id) => {
    console.log('[VALIDATION API] verrouiller() - CRV ID:', id)
    return api.post(`/validation/${id}/verrouiller`)
  },

  /**
   * Déverrouiller un CRV (ADMIN uniquement - MVS-10)
   * POST /api/validation/:id/deverrouiller
   * Body: { raison } (obligatoire)
   * Résultat: CRV retourne à VALIDE
   */
  deverrouiller: (id, raison) => {
    console.log('[VALIDATION API] deverrouiller() - CRV ID:', id, '- Raison:', raison)
    return api.post(`/validation/${id}/deverrouiller`, { raison })
  },

  /**
   * Statut de validation d'un CRV
   * GET /api/validation/:id
   * Retourne: statut validation, historique actions
   */
  getStatus: (id) => {
    console.log('[VALIDATION API] getStatus() - CRV ID:', id)
    return api.get(`/validation/${id}`)
  }
}

// ============================================
// 14. ENGINS API (Référentiel + Affectation CRV)
// ============================================

export const enginsAPI = {
  // --- Référentiel Engins (Parc matériel) ---

  /**
   * Lister tous les engins du parc
   * GET /api/engins
   * Query: ?typeEngin=TRACTEUR&statut=DISPONIBLE&page=1&limit=50
   */
  getAll: (params = {}) => {
    console.log('[ENGINS API] getAll() - Params:', params)
    return api.get('/engins', { params })
  },

  /**
   * Obtenir les types d'engins disponibles
   * GET /api/engins/types
   */
  getTypes: () => {
    console.log('[ENGINS API] getTypes()')
    return api.get('/engins/types')
  },

  /**
   * Obtenir les engins disponibles (pour sélection)
   * GET /api/engins/disponibles
   * Query: ?typeEngin=GPU
   */
  getDisponibles: (typeEngin = null) => {
    console.log('[ENGINS API] getDisponibles() - Type:', typeEngin)
    const params = typeEngin ? { typeEngin } : {}
    return api.get('/engins/disponibles', { params })
  },

  /**
   * Créer un engin (MANAGER, ADMIN)
   * POST /api/engins
   * Body: { numeroEngin, typeEngin, marque?, modele? }
   */
  create: (data) => {
    console.log('[ENGINS API] create() - Data:', data)
    return api.post('/engins', data)
  },

  /**
   * Obtenir un engin par ID
   * GET /api/engins/:id
   */
  getById: (id) => {
    console.log('[ENGINS API] getById() - ID:', id)
    return api.get(`/engins/${id}`)
  },

  /**
   * Modifier un engin
   * PUT /api/engins/:id
   */
  update: (id, data) => {
    console.log('[ENGINS API] update() - ID:', id, '- Data:', data)
    return api.put(`/engins/${id}`, data)
  },

  /**
   * Supprimer un engin
   * DELETE /api/engins/:id
   */
  delete: (id) => {
    console.log('[ENGINS API] delete() - ID:', id)
    return api.delete(`/engins/${id}`)
  },

  // --- Engins affectés à un CRV ---

  /**
   * Obtenir les engins affectés à un CRV
   * GET /api/crv/:crvId/engins
   */
  getByCRV: (crvId) => {
    console.log('[ENGINS API] getByCRV() - CRV ID:', crvId)
    return api.get(`/crv/${crvId}/engins`)
  },

  /**
   * Mettre à jour (remplacer) tous les engins d'un CRV
   * PUT /api/crv/:crvId/engins
   * Body: { engins: [{ type, immatriculation, heureDebut, heureFin, utilise }] }
   */
  updateCRVEngins: (crvId, engins) => {
    console.log('[ENGINS API] updateCRVEngins() - CRV ID:', crvId, '- Engins:', engins)
    return api.put(`/crv/${crvId}/engins`, { engins })
  },

  /**
   * Ajouter un engin à un CRV
   * POST /api/crv/:crvId/engins
   * Body: { enginId, heureDebut, heureFin?, usage, remarques? }
   */
  addToCRV: (crvId, data) => {
    console.log('[ENGINS API] addToCRV() - CRV ID:', crvId, '- Data:', data)
    return api.post(`/crv/${crvId}/engins`, data)
  },

  /**
   * Retirer un engin d'un CRV
   * DELETE /api/crv/:crvId/engins/:affectationId
   */
  removeFromCRV: (crvId, affectationId) => {
    console.log('[ENGINS API] removeFromCRV() - CRV ID:', crvId, '- Affectation ID:', affectationId)
    return api.delete(`/crv/${crvId}/engins/${affectationId}`)
  }
}

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default api
