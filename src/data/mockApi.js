/**
 * =====================================================
 * API MOCK POUR DÉVELOPPEMENT
 * =====================================================
 *
 * Simule les réponses du backend avec les données de test.
 * Utiliser en mode développement quand le backend n'est pas disponible.
 *
 * Usage:
 * import { mockAPI, enableMockAPI, disableMockAPI } from '@/data/mockApi'
 */

import {
  utilisateurs,
  comptesTest,
  MOT_DE_PASSE_TEST
} from './seed/utilisateurs'
import { vols, getVolsByType, getVolsSansCRV } from './seed/vols'
import {
  crv,
  getCRVByStatut,
  getCRVByAgent,
  getCRVEnAttenteValidation,
  getStatistiquesCRV,
  STATUTS_CRV,
  PHASES_ARRIVEE,
  PHASES_DEPART,
  PHASES_TURN_AROUND
} from './seed/crv'
import { compagnies } from './seed/compagnies'
import { aeroports } from './seed/aeroports'
import { avions, typesAvions } from './seed/avions'

/**
 * Délai simulé pour les requêtes (en ms)
 */
const MOCK_DELAY = 300

/**
 * Helper pour simuler un délai réseau
 */
const delay = (ms = MOCK_DELAY) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Helper pour générer un ID unique
 */
const generateId = (prefix = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

/**
 * État local mutable (simule la base de données)
 */
let mockState = {
  utilisateurs: [...utilisateurs],
  vols: [...vols],
  crv: [...crv],
  currentUser: null,
  token: null
}

/**
 * Réinitialiser l'état mock
 */
export function resetMockState() {
  mockState = {
    utilisateurs: [...utilisateurs],
    vols: [...vols],
    crv: [...crv],
    currentUser: null,
    token: null
  }
}

/**
 * API Mock - Authentification
 */
export const mockAuthAPI = {
  async login(email, password) {
    await delay()

    const user = mockState.utilisateurs.find(u => u.email === email)

    if (!user) {
      throw { response: { status: 401, data: { message: 'Email ou mot de passe incorrect' } } }
    }

    if (!user.actif) {
      throw { response: { status: 403, data: { message: 'Compte désactivé. Contactez l\'administrateur.' } } }
    }

    // En mode test, accepter le mot de passe test ou le mot de passe réel
    if (password !== MOT_DE_PASSE_TEST && password !== 'password') {
      throw { response: { status: 401, data: { message: 'Email ou mot de passe incorrect' } } }
    }

    const token = `mock-jwt-${generateId()}`
    mockState.currentUser = user
    mockState.token = token

    return {
      data: {
        token,
        utilisateur: user,
        doitChangerMotDePasse: user.doitChangerMotDePasse
      }
    }
  },

  async logout() {
    await delay(100)
    mockState.currentUser = null
    mockState.token = null
    return { data: { success: true } }
  },

  async getProfile() {
    await delay()
    if (!mockState.currentUser) {
      throw { response: { status: 401, data: { message: 'Non authentifié' } } }
    }
    return { data: { utilisateur: mockState.currentUser } }
  },

  async changePassword(oldPassword, newPassword) {
    await delay()
    if (!mockState.currentUser) {
      throw { response: { status: 401 } }
    }

    // Mettre à jour l'utilisateur
    const index = mockState.utilisateurs.findIndex(u => u.id === mockState.currentUser.id)
    if (index !== -1) {
      mockState.utilisateurs[index].doitChangerMotDePasse = false
      mockState.currentUser = mockState.utilisateurs[index]
    }

    return { data: { success: true, message: 'Mot de passe modifié' } }
  }
}

/**
 * API Mock - Utilisateurs
 */
export const mockUsersAPI = {
  async getAll(params = {}) {
    await delay()

    let result = [...mockState.utilisateurs]

    // Filtres
    if (params.fonction) {
      result = result.filter(u => u.fonction === params.fonction)
    }
    if (params.actif !== undefined) {
      result = result.filter(u => u.actif === params.actif)
    }
    if (params.search) {
      const search = params.search.toLowerCase()
      result = result.filter(u =>
        u.nom.toLowerCase().includes(search) ||
        u.prenom.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      )
    }

    return {
      data: {
        utilisateurs: result,
        total: result.length,
        page: 1,
        limit: 50
      }
    }
  },

  async getById(id) {
    await delay()
    const user = mockState.utilisateurs.find(u => u.id === id)
    if (!user) {
      throw { response: { status: 404, data: { message: 'Utilisateur non trouvé' } } }
    }
    return { data: { utilisateur: user } }
  },

  async create(userData) {
    await delay()

    // Vérifier unicité email
    if (mockState.utilisateurs.some(u => u.email === userData.email)) {
      throw { response: { status: 400, data: { message: 'Email déjà utilisé' } } }
    }

    const newUser = {
      id: generateId('user'),
      ...userData,
      actif: true,
      dateCreation: new Date().toISOString(),
      doitChangerMotDePasse: true
    }

    const tempPassword = `Temp${Math.random().toString(36).substr(2, 8)}!`
    mockState.utilisateurs.push(newUser)

    return {
      data: {
        utilisateur: newUser,
        motDePasseTemporaire: tempPassword
      }
    }
  },

  async update(id, userData) {
    await delay()
    const index = mockState.utilisateurs.findIndex(u => u.id === id)
    if (index === -1) {
      throw { response: { status: 404, data: { message: 'Utilisateur non trouvé' } } }
    }

    mockState.utilisateurs[index] = {
      ...mockState.utilisateurs[index],
      ...userData,
      dateModification: new Date().toISOString()
    }

    return { data: { utilisateur: mockState.utilisateurs[index] } }
  },

  async deactivate(id) {
    await delay()
    const index = mockState.utilisateurs.findIndex(u => u.id === id)
    if (index === -1) {
      throw { response: { status: 404 } }
    }

    mockState.utilisateurs[index].actif = false
    return { data: { success: true } }
  },

  async reactivate(id) {
    await delay()
    const index = mockState.utilisateurs.findIndex(u => u.id === id)
    if (index === -1) {
      throw { response: { status: 404 } }
    }

    mockState.utilisateurs[index].actif = true
    return { data: { success: true } }
  }
}

/**
 * API Mock - Vols
 */
export const mockVolsAPI = {
  async getAll(params = {}) {
    await delay()

    let result = [...mockState.vols]

    if (params.type) {
      result = result.filter(v => v.typeOperation === params.type)
    }
    if (params.compagnie) {
      result = result.filter(v => v.compagnie.code === params.compagnie)
    }
    if (params.date) {
      result = result.filter(v => {
        const volDate = (v.heuresPrevues.arrivee || v.heuresPrevues.depart).split('T')[0]
        return volDate === params.date
      })
    }

    return { data: { vols: result, total: result.length } }
  },

  async getById(id) {
    await delay()
    const vol = mockState.vols.find(v => v.id === id)
    if (!vol) {
      throw { response: { status: 404, data: { message: 'Vol non trouvé' } } }
    }
    return { data: { vol } }
  },

  async getSansCRV() {
    await delay()
    const volsAvecCRV = mockState.crv.map(c => c.volId)
    const result = mockState.vols.filter(v => !volsAvecCRV.includes(v.id))
    return { data: { vols: result } }
  }
}

/**
 * API Mock - CRV
 */
export const mockCRVAPI = {
  async getAll(params = {}) {
    await delay()

    let result = [...mockState.crv]

    if (params.statut) {
      result = result.filter(c => c.statut === params.statut)
    }
    if (params.agentId) {
      result = result.filter(c => c.agentId === params.agentId)
    }
    if (params.completudeMin) {
      result = result.filter(c => c.completude >= params.completudeMin)
    }

    return {
      data: {
        crvList: result,
        total: result.length,
        statistiques: getStatistiquesCRV()
      }
    }
  },

  async getById(id) {
    await delay()
    const crvItem = mockState.crv.find(c => c.id === id)
    if (!crvItem) {
      throw { response: { status: 404, data: { message: 'CRV non trouvé' } } }
    }
    return {
      data: {
        crv: crvItem,
        phases: crvItem.phases,
        charges: crvItem.charges,
        evenements: crvItem.evenements || [],
        observations: crvItem.observations
      }
    }
  },

  async create(data) {
    await delay()

    const vol = mockState.vols.find(v => v.id === data.volId)
    if (!vol) {
      throw { response: { status: 400, data: { message: 'Vol non trouvé' } } }
    }

    // Déterminer les phases selon le type de vol
    let phases
    switch (vol.typeOperation) {
      case 'ARRIVEE':
        phases = PHASES_ARRIVEE.map(p => ({ ...p, statut: 'NON_DEMARRE' }))
        break
      case 'DEPART':
        phases = PHASES_DEPART.map(p => ({ ...p, statut: 'NON_DEMARRE' }))
        break
      case 'TURN_AROUND':
        phases = PHASES_TURN_AROUND.map(p => ({ ...p, statut: 'NON_DEMARRE' }))
        break
      default:
        phases = []
    }

    const newCRV = {
      id: generateId('crv'),
      numeroCRV: `CRV-${new Date().getFullYear()}-${String(mockState.crv.length + 1).padStart(4, '0')}`,
      volId: data.volId,
      vol: {
        numeroVol: vol.numeroVol,
        compagnie: vol.compagnie,
        typeOperation: vol.typeOperation,
        origine: vol.origine,
        destination: vol.destination,
        escale: vol.escale
      },
      agentId: mockState.currentUser?.id,
      agent: mockState.currentUser ? {
        nom: mockState.currentUser.nom,
        prenom: mockState.currentUser.prenom,
        matricule: mockState.currentUser.matricule
      } : null,
      statut: STATUTS_CRV.BROUILLON,
      completude: 0,
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString(),
      phases,
      charges: [],
      evenements: [],
      observations: []
    }

    mockState.crv.push(newCRV)

    return { data: newCRV }
  },

  async addCharge(crvId, chargeData) {
    await delay()

    const index = mockState.crv.findIndex(c => c.id === crvId)
    if (index === -1) {
      throw { response: { status: 404 } }
    }

    const charge = {
      id: generateId('charge'),
      ...chargeData,
      dateCreation: new Date().toISOString()
    }

    mockState.crv[index].charges.push(charge)

    // Recalculer complétude
    mockState.crv[index].completude = calculateCompletude(mockState.crv[index])
    mockState.crv[index].dateModification = new Date().toISOString()

    return { data: { charge } }
  },

  async addObservation(crvId, obsData) {
    await delay()

    const index = mockState.crv.findIndex(c => c.id === crvId)
    if (index === -1) {
      throw { response: { status: 404 } }
    }

    const observation = {
      id: generateId('obs'),
      ...obsData,
      auteurId: mockState.currentUser?.id,
      auteur: mockState.currentUser ? {
        nom: mockState.currentUser.nom,
        prenom: mockState.currentUser.prenom
      } : null,
      dateCreation: new Date().toISOString()
    }

    mockState.crv[index].observations.push(observation)

    // Recalculer complétude
    mockState.crv[index].completude = calculateCompletude(mockState.crv[index])
    mockState.crv[index].dateModification = new Date().toISOString()

    return { data: { observation } }
  }
}

/**
 * API Mock - Phases
 */
export const mockPhasesAPI = {
  async demarrer(phaseId) {
    await delay()

    for (const crvItem of mockState.crv) {
      const phaseIndex = crvItem.phases.findIndex(p => p.id === phaseId)
      if (phaseIndex !== -1) {
        crvItem.phases[phaseIndex].statut = 'EN_COURS'
        crvItem.phases[phaseIndex].heureDebut = new Date().toISOString()
        crvItem.dateModification = new Date().toISOString()
        crvItem.statut = STATUTS_CRV.EN_COURS
        return { data: { phase: crvItem.phases[phaseIndex] } }
      }
    }

    throw { response: { status: 404, data: { message: 'Phase non trouvée' } } }
  },

  async terminer(phaseId) {
    await delay()

    for (const crvItem of mockState.crv) {
      const phaseIndex = crvItem.phases.findIndex(p => p.id === phaseId)
      if (phaseIndex !== -1) {
        const phase = crvItem.phases[phaseIndex]
        phase.statut = 'TERMINE'
        phase.heureFin = new Date().toISOString()

        if (phase.heureDebut) {
          const debut = new Date(phase.heureDebut)
          const fin = new Date(phase.heureFin)
          phase.dureeMinutes = Math.round((fin - debut) / 60000)
        }

        crvItem.completude = calculateCompletude(crvItem)
        crvItem.dateModification = new Date().toISOString()

        return { data: { phase } }
      }
    }

    throw { response: { status: 404 } }
  }
}

/**
 * API Mock - Validation
 */
export const mockValidationAPI = {
  async valider(crvId, commentaire) {
    await delay()

    const index = mockState.crv.findIndex(c => c.id === crvId)
    if (index === -1) {
      throw { response: { status: 404 } }
    }

    mockState.crv[index].statut = STATUTS_CRV.VALIDE
    mockState.crv[index].dateValidation = new Date().toISOString()
    mockState.crv[index].validateurId = mockState.currentUser?.id
    mockState.crv[index].validateur = mockState.currentUser ? {
      nom: mockState.currentUser.nom,
      prenom: mockState.currentUser.prenom
    } : null
    mockState.crv[index].commentaireValidation = commentaire

    return { data: { success: true } }
  },

  async rejeter(crvId, motif) {
    await delay()

    const index = mockState.crv.findIndex(c => c.id === crvId)
    if (index === -1) {
      throw { response: { status: 404 } }
    }

    mockState.crv[index].statut = STATUTS_CRV.REJETE
    mockState.crv[index].dateRejet = new Date().toISOString()
    mockState.crv[index].motifRejet = motif

    return { data: { success: true } }
  },

  async deverrouiller(crvId, motif) {
    await delay()

    const index = mockState.crv.findIndex(c => c.id === crvId)
    if (index === -1) {
      throw { response: { status: 404 } }
    }

    mockState.crv[index].statut = STATUTS_CRV.DEVERROUILLE
    mockState.crv[index].dateDeverrouillage = new Date().toISOString()
    mockState.crv[index].motifDeverrouillage = motif
    mockState.crv[index].deverrouilleurId = mockState.currentUser?.id

    return { data: { success: true } }
  }
}

/**
 * Calculer la complétude d'un CRV
 */
function calculateCompletude(crvItem) {
  let completude = 0
  const totalPhases = crvItem.phases.length
  const phasesTerminees = crvItem.phases.filter(p => p.statut === 'TERMINE' || p.statut === 'NON_REALISE').length

  // Phases = 50% de la complétude
  completude += (phasesTerminees / totalPhases) * 50

  // Charges = 35% de la complétude
  const hasPassagers = crvItem.charges.some(c => c.typeCharge === 'PASSAGERS')
  const hasBagages = crvItem.charges.some(c => c.typeCharge === 'BAGAGES')
  if (hasPassagers) completude += 20
  if (hasBagages) completude += 15

  // Observation = 15% de la complétude
  if (crvItem.observations.length > 0) completude += 15

  return Math.min(Math.round(completude), 100)
}

/**
 * API Mock globale
 */
export const mockAPI = {
  auth: mockAuthAPI,
  users: mockUsersAPI,
  vols: mockVolsAPI,
  crv: mockCRVAPI,
  phases: mockPhasesAPI,
  validation: mockValidationAPI,
  reset: resetMockState,

  // Données de référence
  compagnies,
  aeroports,
  avions,
  typesAvions,
  comptesTest
}

export default mockAPI
