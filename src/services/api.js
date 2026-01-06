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
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
// 5. CRV API (19 routes) - inclut Extension 6 Annulation
// ============================================

export const crvAPI = {
  /**
   * Créer un CRV
   * POST /api/crv
   * Body: { volId }
   * Middlewares: protect, excludeQualite, verifierPhasesAutoriseesCreationCRV, auditLog
   */
  create: (data) => api.post('/crv', data),

  /**
   * Lister les CRV
   * GET /api/crv
   * Query: { statut, compagnie, dateDebut, dateFin, page, limit, sort }
   */
  getAll: (params) => api.get('/crv', { params }),

  /**
   * Obtenir un CRV complet
   * GET /api/crv/:id
   * Retourne: { crv, phases, charges, evenements, observations }
   */
  getById: (id) => api.get(`/crv/${id}`),

  /**
   * Modifier un CRV
   * PATCH /api/crv/:id
   * Body: { responsableVol?, statut?, ... }
   * Middlewares: protect, excludeQualite, verifierCRVNonVerrouille
   */
  update: (id, data) => api.patch(`/crv/${id}`, data),

  /**
   * Supprimer un CRV
   * DELETE /api/crv/:id
   * Rôles: SUPERVISEUR, MANAGER
   */
  delete: (id) => api.delete(`/crv/${id}`),

  /**
   * Ajouter une charge opérationnelle
   * POST /api/crv/:id/charges
   * Body: { typeCharge: 'PASSAGERS'|'BAGAGES'|'FRET', sensOperation: 'EMBARQUEMENT'|'DEBARQUEMENT', ... }
   */
  addCharge: (id, data) => api.post(`/crv/${id}/charges`, data),

  /**
   * Ajouter un événement
   * POST /api/crv/:id/evenements
   * Body: { typeEvenement, gravite: 'MINEURE'|'MODEREE'|'MAJEURE'|'CRITIQUE', description }
   */
  addEvenement: (id, data) => api.post(`/crv/${id}/evenements`, data),

  /**
   * Ajouter une observation
   * POST /api/crv/:id/observations
   * Body: { categorie: 'GENERALE'|'TECHNIQUE'|'OPERATIONNELLE'|'SECURITE'|'QUALITE'|'SLA', contenu }
   */
  addObservation: (id, data) => api.post(`/crv/${id}/observations`, data),

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

  /**
   * Archiver un CRV
   * POST /api/crv/:id/archive
   */
  archive: (id) => api.post(`/crv/${id}/archive`),

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
  getByCRV: (crvId) => api.get('/phases', { params: { crvId } })
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
   * Importer un programme depuis Excel
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
   * Programmes applicables à une date (Extension 1)
   * GET /api/programmes-vol/applicables/:date
   * Retourne: { programmes: Programme[] }
   */
  getApplicables: (date) => api.get(`/programmes-vol/applicables/${date}`)
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
// 13. VALIDATION API (3 routes)
// ============================================

export const validationAPI = {
  /**
   * Valider un CRV (SUPERVISEUR, MANAGER)
   * POST /api/validation/:id/valider
   * Prérequis: completude >= 80%
   */
  valider: (id) => api.post(`/validation/${id}/valider`),

  /**
   * Déverrouiller un CRV (MANAGER uniquement)
   * POST /api/validation/:id/deverrouiller
   * Body: { raison }
   */
  deverrouiller: (id, raison) => api.post(`/validation/${id}/deverrouiller`, { raison }),

  /**
   * Statut de validation d'un CRV
   * GET /api/validation/:id
   */
  getStatus: (id) => api.get(`/validation/${id}`)
}

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default api
