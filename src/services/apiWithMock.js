/**
 * API Mock pour développement sans backend
 *
 * Ce fichier est utilisé quand VITE_USE_MOCK=true
 * Il fournit des données simulées pour permettre le développement frontend
 */

import { mockAPI } from '@/data/mockApi'

console.log('[API] Mode MOCK activé - Données simulées')

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  login: async (credentials) => {
    const response = await mockAPI.auth.login(
      credentials.email,
      credentials.password || credentials.motDePasse
    )
    return response
  },
  logout: () => mockAPI.auth.logout(),
  me: () => mockAPI.auth.getProfile(),
  changerMotDePasse: (data) => mockAPI.auth.changePassword(
    data.ancienMotDePasse,
    data.nouveauMotDePasse
  ),
  register: () => Promise.reject({
    response: { status: 403, data: { message: 'Inscription non autorisée' } }
  })
}

// ============================================
// PERSONNES API
// ============================================

export const personnesAPI = {
  getAll: (params) => mockAPI.users.getAll(params),
  getById: (id) => mockAPI.users.getById(id),
  create: (data) => mockAPI.users.create(data),
  update: (id, data) => mockAPI.users.update(id, data),
  delete: (id) => mockAPI.users.deactivate(id),
  desactiver: (id) => mockAPI.users.deactivate(id),
  reactiver: (id) => mockAPI.users.reactivate(id),
  suspendre: (id) => mockAPI.users.deactivate(id)
}

// ============================================
// CRV API
// ============================================

export const crvAPI = {
  create: (data) => mockAPI.crv.create(data),
  getAll: (params) => mockAPI.crv.getAll(params),
  getById: (id) => mockAPI.crv.getById(id),
  update: (id, data) => Promise.resolve({
    data: { success: true, data: { id, ...data } }
  }),
  delete: (id) => Promise.resolve({ data: { success: true } }),
  addCharge: (id, data) => mockAPI.crv.addCharge(id, data),
  addEvenement: (id, data) => Promise.resolve({
    data: {
      success: true,
      data: {
        evenement: {
          id: `evt-${Date.now()}`,
          ...data,
          dateCreation: new Date().toISOString()
        }
      }
    }
  }),
  addObservation: (id, data) => mockAPI.crv.addObservation(id, data),
  getStats: () => mockAPI.crv.getAll().then(r => ({
    data: { success: true, data: { stats: r.data.statistiques } }
  })),
  search: (params) => mockAPI.crv.getAll(params),
  export: () => Promise.resolve({
    data: new Blob(['CRV Export'], { type: 'text/csv' })
  }),
  getAnnules: () => Promise.resolve({ data: { success: true, data: [] } }),
  archive: (id) => Promise.resolve({ data: { success: true } }),
  peutAnnuler: (id) => Promise.resolve({ data: { peutAnnuler: true } }),
  annuler: (id, data) => Promise.resolve({ data: { success: true } }),
  reactiver: (id, data) => Promise.resolve({ data: { success: true } }),
  getStatistiquesAnnulations: () => Promise.resolve({
    data: { success: true, data: {} }
  }),
  getArchiveStatus: () => Promise.resolve({ data: { status: 'OK' } }),
  testArchive: () => Promise.resolve({ data: { success: true } })
}

// ============================================
// PHASES API
// ============================================

export const phasesAPI = {
  demarrer: (id) => mockAPI.phases.demarrer(id),
  terminer: (id) => mockAPI.phases.terminer(id),
  marquerNonRealise: (id, data) => Promise.resolve({
    data: { success: true, data: { phase: { id, statut: 'NON_REALISE', ...data } } }
  }),
  update: (id, data) => Promise.resolve({
    data: { success: true, data: { phase: { id, ...data } } }
  }),
  getById: (id) => Promise.resolve({
    data: { success: true, data: { phase: { id } } }
  }),
  getByCRV: (crvId) => Promise.resolve({
    data: { success: true, data: { phases: [] } }
  })
}

// ============================================
// VOLS API
// ============================================

export const volsAPI = {
  getAll: (params) => mockAPI.vols.getAll(params),
  getById: (id) => mockAPI.vols.getById(id),
  create: (data) => Promise.resolve({
    data: { success: true, data: { vol: { id: `vol-${Date.now()}`, ...data } } }
  }),
  update: (id, data) => Promise.resolve({
    data: { success: true, data: { vol: { id, ...data } } }
  })
}

// ============================================
// VALIDATION API
// ============================================

export const validationAPI = {
  valider: (id) => mockAPI.validation.valider(id),
  deverrouiller: (id, raison) => mockAPI.validation.deverrouiller(id, raison),
  getStatus: (id) => Promise.resolve({
    data: { success: true, data: { status: 'EN_ATTENTE' } }
  })
}

// ============================================
// CHARGES API
// ============================================

export const chargesAPI = {
  getById: (id) => Promise.resolve({
    data: { success: true, data: { charge: { id } } }
  }),
  update: (id, data) => Promise.resolve({
    data: { success: true, data: { charge: { id, ...data } } }
  }),
  updateCategoriesDetaillees: (id, data) => Promise.resolve({
    data: { success: true, data: { charge: { id, ...data } } }
  }),
  updateClasses: (id, data) => Promise.resolve({
    data: { success: true, data: { charge: { id, ...data } } }
  }),
  updateBesoinsMedicaux: (id, data) => Promise.resolve({
    data: { success: true, data: { charge: { id, ...data } } }
  }),
  updateMineurs: (id, data) => Promise.resolve({
    data: { success: true, data: { charge: { id, ...data } } }
  }),
  convertirCategoriesDetaillees: (id) => Promise.resolve({
    data: { success: true }
  }),
  updateFretDetaille: (id, data) => Promise.resolve({
    data: { success: true, data: { charge: { id, ...data } } }
  }),
  addMarchandiseDangereuse: (id, data) => Promise.resolve({
    data: { success: true, data: { md: { id: `md-${Date.now()}`, ...data } } }
  }),
  deleteMarchandiseDangereuse: () => Promise.resolve({ data: { success: true } }),
  getStatistiquesPassagers: () => Promise.resolve({
    data: { success: true, data: {} }
  }),
  getStatistiquesFret: () => Promise.resolve({
    data: { success: true, data: {} }
  }),
  validerMarchandiseDangereuse: () => Promise.resolve({ data: { valide: true } }),
  getMarchandisesDangereuses: () => Promise.resolve({
    data: { success: true, data: [] }
  }),
  getStatistiquesPassagersByCRV: () => Promise.resolve({
    data: { success: true, data: {} }
  }),
  getStatistiquesFretByCRV: () => Promise.resolve({
    data: { success: true, data: {} }
  })
}

// ============================================
// NOTIFICATIONS API
// ============================================

export const notificationsAPI = {
  getAll: () => Promise.resolve({
    data: { success: true, data: { notifications: [] } }
  }),
  getCountNonLues: () => Promise.resolve({
    data: { success: true, data: { count: 0 } }
  }),
  marquerToutesLues: () => Promise.resolve({ data: { success: true } }),
  getStatistiques: () => Promise.resolve({ data: { success: true, data: {} } }),
  create: () => Promise.resolve({ data: { success: true } }),
  marquerLue: () => Promise.resolve({ data: { success: true } }),
  archiver: () => Promise.resolve({ data: { success: true } }),
  delete: () => Promise.resolve({ data: { success: true } })
}

// ============================================
// PROGRAMMES VOL API
// ============================================

export const programmesVolAPI = {
  getAll: () => Promise.resolve({
    data: { success: true, data: { programmes: [] } }
  }),
  getById: (id) => Promise.resolve({
    data: { success: true, data: { programme: { id } } }
  }),
  create: () => Promise.resolve({ data: { success: true } }),
  update: () => Promise.resolve({ data: { success: true } }),
  delete: () => Promise.resolve({ data: { success: true } }),
  valider: () => Promise.resolve({ data: { success: true } }),
  activer: () => Promise.resolve({ data: { success: true } }),
  suspendre: () => Promise.resolve({ data: { success: true } }),
  getActif: () => Promise.resolve({ data: { success: true, data: null } }),
  dupliquer: () => Promise.resolve({ data: { success: true } }),
  getStatistiques: (id) => Promise.resolve({ data: { success: true, data: {} } }),
  getResumeById: (id) => Promise.resolve({ data: { success: true, data: {} } })
}

// ============================================
// AVIONS API
// ============================================

export const avionsAPI = {
  getAll: () => Promise.resolve({
    data: { success: true, data: { avions: mockAPI.avions } }
  }),
  getById: (id) => {
    const avion = mockAPI.avions.find(a => a.id === id)
    return Promise.resolve({ data: { success: true, data: { avion } } })
  },
  create: () => Promise.resolve({ data: { success: true } }),
  updateConfiguration: () => Promise.resolve({ data: { success: true } }),
  createVersion: () => Promise.resolve({ data: { success: true } }),
  getVersions: () => Promise.resolve({
    data: { success: true, data: { versions: [] } }
  }),
  getVersion: () => Promise.resolve({ data: { success: true } }),
  restaurerVersion: () => Promise.resolve({ data: { success: true } }),
  comparerVersions: () => Promise.resolve({ data: { success: true, data: {} } }),
  planifierRevision: () => Promise.resolve({ data: { success: true } }),
  getRevisionsProchaines: () => Promise.resolve({
    data: { success: true, data: [] }
  }),
  getStatistiquesConfigurations: () => Promise.resolve({
    data: { success: true, data: {} }
  })
}

// ============================================
// SLA API
// ============================================

export const slaAPI = {
  getRapport: () => Promise.resolve({
    data: { success: true, data: { rapport: {} } }
  }),
  getConfiguration: () => Promise.resolve({
    data: { success: true, data: { configuration: {} } }
  }),
  updateConfiguration: () => Promise.resolve({ data: { success: true } }),
  surveillerCRV: () => Promise.resolve({ data: { success: true } }),
  surveillerPhases: () => Promise.resolve({ data: { success: true } }),
  getCRVSla: () => Promise.resolve({ data: { success: true, data: {} } }),
  getPhaseSla: () => Promise.resolve({ data: { success: true, data: {} } })
}

// ============================================
// EXPORT PAR DÉFAUT (compatibilité axios)
// ============================================

const mockAxios = {
  get: (url) => Promise.resolve({ data: {} }),
  post: (url, data) => Promise.resolve({ data: {} }),
  patch: (url, data) => Promise.resolve({ data: {} }),
  put: (url, data) => Promise.resolve({ data: {} }),
  delete: (url) => Promise.resolve({ data: {} }),
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  }
}

export default mockAxios
