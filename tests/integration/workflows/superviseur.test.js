/**
 * TESTS PROCESSUS COMPLETS - SUPERVISEUR
 *
 * Profil: SUPERVISEUR
 * Permissions: Tout ce que fait l'Agent + Validation CRV, Suppression CRV,
 *              Validation programmes vol, Activation programmes
 * Restrictions: Ne peut pas supprimer programmes, gérer utilisateurs
 *
 * Processus testés:
 * 1. Connexion et permissions
 * 2. Validation des CRV (seuil 80%)
 * 3. Suppression des CRV
 * 4. Validation des programmes vol
 * 5. Supervision des équipes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useCRVStore } from '@/stores/crvStore'
import { ROLES } from '@/config/roles'
import { hasPermission, ACTIONS, canDeleteCRV, canValidateProgramme } from '@/utils/permissions'

// Mock des API
vi.mock('@/services/api', () => ({
  authAPI: {
    login: vi.fn(),
    logout: vi.fn()
  },
  crvAPI: {
    create: vi.fn(),
    getById: vi.fn(),
    getAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addCharge: vi.fn(),
    addEvenement: vi.fn(),
    peutAnnuler: vi.fn(),
    annuler: vi.fn()
  },
  phasesAPI: {
    demarrer: vi.fn(),
    terminer: vi.fn()
  },
  chargesAPI: {},
  validationAPI: {
    valider: vi.fn(),
    getStatus: vi.fn()
  },
  programmesVolAPI: {
    valider: vi.fn(),
    activer: vi.fn()
  }
}))

import { authAPI, crvAPI, validationAPI, programmesVolAPI } from '@/services/api'

describe('PROCESSUS SUPERVISEUR', () => {
  let authStore
  let crvStore

  const superviseurUser = {
    id: 'sup-001',
    nom: 'Ndiaye',
    prenom: 'Fatou',
    email: 'fatou.ndiaye@airport.com',
    fonction: ROLES.SUPERVISEUR,
    matricule: 'SUP-001'
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    crvStore = useCRVStore()
    vi.clearAllMocks()
  })

  // =========================================
  // ÉTAPE 1: CONNEXION ET PERMISSIONS
  // =========================================
  describe('ÉTAPE 1: Connexion et Permissions Superviseur', () => {
    it('devrait se connecter avec le rôle SUPERVISEUR', async () => {
      authAPI.login.mockResolvedValue({
        data: {
          token: 'jwt-superviseur-token',
          utilisateur: superviseurUser
        }
      })

      await authStore.login({ email: 'fatou.ndiaye@airport.com', password: 'password' })

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.getUserRole).toBe(ROLES.SUPERVISEUR)
      expect(authStore.isSuperviseur).toBe(true)
      expect(authStore.canSupervise).toBe(true)
    })

    it('devrait avoir les permissions étendues du Superviseur', () => {
      // Permissions héritées de l'Agent
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.CRV_CREER)).toBe(true)
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.CRV_MODIFIER)).toBe(true)
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.PHASE_DEMARRER)).toBe(true)
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.CHARGE_AJOUTER)).toBe(true)

      // Permissions supplémentaires du Superviseur
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.CRV_SUPPRIMER)).toBe(true)
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.PROGRAMME_VALIDER)).toBe(true)
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.PROGRAMME_ACTIVER)).toBe(true)

      // Permissions refusées
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.PROGRAMME_SUPPRIMER)).toBe(false)
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.USER_CREER)).toBe(false)
    })

    it('devrait confirmer canDeleteCRV et canValidateProgramme', () => {
      expect(canDeleteCRV(ROLES.SUPERVISEUR)).toBe(true)
      expect(canValidateProgramme(ROLES.SUPERVISEUR)).toBe(true)
    })
  })

  // =========================================
  // ÉTAPE 2: VALIDATION DES CRV
  // =========================================
  describe('ÉTAPE 2: Validation des CRV', () => {
    beforeEach(() => {
      authStore.user = superviseurUser
      authStore.token = 'jwt-token'
    })

    it('devrait valider un CRV avec complétude >= 80%', async () => {
      crvStore.currentCRV = {
        id: 'crv-001',
        completude: 85,
        statut: 'EN_COURS'
      }

      validationAPI.valider.mockResolvedValue({
        data: { statut: 'VALIDE', validePar: superviseurUser.id }
      })

      await crvStore.validateCRV()

      expect(validationAPI.valider).toHaveBeenCalledWith('crv-001')
      expect(crvStore.currentCRV.statut).toBe('VALIDE')
    })

    it('devrait refuser de valider un CRV avec complétude < 80%', async () => {
      crvStore.currentCRV = {
        id: 'crv-002',
        completude: 75,
        statut: 'EN_COURS'
      }

      await expect(crvStore.validateCRV())
        .rejects.toThrow('Complétude insuffisante')

      expect(validationAPI.valider).not.toHaveBeenCalled()
    })

    it('devrait vérifier le statut de validation', async () => {
      crvStore.currentCRV = { id: 'crv-001' }

      validationAPI.getStatus.mockResolvedValue({
        data: {
          statut: 'VALIDE',
          validePar: 'sup-001',
          dateValidation: '2024-01-15T14:00:00Z'
        }
      })

      const status = await crvStore.getValidationStatus()

      expect(validationAPI.getStatus).toHaveBeenCalledWith('crv-001')
      expect(status.statut).toBe('VALIDE')
    })

    it('devrait valider un CRV à exactement 80%', async () => {
      crvStore.currentCRV = {
        id: 'crv-003',
        completude: 80,
        statut: 'TERMINE'
      }

      validationAPI.valider.mockResolvedValue({
        data: { statut: 'VALIDE' }
      })

      await crvStore.validateCRV()

      expect(validationAPI.valider).toHaveBeenCalled()
    })
  })

  // =========================================
  // ÉTAPE 3: SUPPRESSION DES CRV
  // =========================================
  describe('ÉTAPE 3: Suppression des CRV', () => {
    beforeEach(() => {
      authStore.user = superviseurUser
      authStore.token = 'jwt-token'
      crvStore.crvList = [
        { id: 'crv-001', numeroCRV: 'CRV-001' },
        { id: 'crv-002', numeroCRV: 'CRV-002' },
        { id: 'crv-003', numeroCRV: 'CRV-003' }
      ]
    })

    it('devrait pouvoir supprimer un CRV', async () => {
      crvAPI.delete.mockResolvedValue({})

      await crvStore.deleteCRV('crv-002')

      expect(crvAPI.delete).toHaveBeenCalledWith('crv-002')
      expect(crvStore.crvList).toHaveLength(2)
      expect(crvStore.crvList.find(c => c.id === 'crv-002')).toBeUndefined()
    })

    it('devrait réinitialiser currentCRV si celui supprimé est actif', async () => {
      crvStore.currentCRV = { id: 'crv-001' }
      crvAPI.delete.mockResolvedValue({})

      await crvStore.deleteCRV('crv-001')

      expect(crvStore.currentCRV).toBeNull()
    })
  })

  // =========================================
  // ÉTAPE 4: VALIDATION PROGRAMMES VOL
  // =========================================
  describe('ÉTAPE 4: Validation Programmes Vol', () => {
    beforeEach(() => {
      authStore.user = superviseurUser
      authStore.token = 'jwt-token'
    })

    it('devrait pouvoir valider un programme vol', async () => {
      programmesVolAPI.valider.mockResolvedValue({
        data: {
          programme: {
            id: 'prog-001',
            statut: 'VALIDE',
            validePar: superviseurUser.id
          }
        }
      })

      const result = await programmesVolAPI.valider('prog-001')

      expect(programmesVolAPI.valider).toHaveBeenCalledWith('prog-001')
      expect(result.data.programme.statut).toBe('VALIDE')
    })

    it('devrait pouvoir activer un programme vol validé', async () => {
      programmesVolAPI.activer.mockResolvedValue({
        data: {
          programme: {
            id: 'prog-001',
            statut: 'ACTIF'
          }
        }
      })

      const result = await programmesVolAPI.activer('prog-001')

      expect(result.data.programme.statut).toBe('ACTIF')
    })

    it('ne devrait PAS pouvoir supprimer un programme vol', () => {
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.PROGRAMME_SUPPRIMER)).toBe(false)
    })
  })

  // =========================================
  // ÉTAPE 5: ANNULATION CRV
  // =========================================
  describe('ÉTAPE 5: Annulation CRV', () => {
    beforeEach(() => {
      authStore.user = superviseurUser
      authStore.token = 'jwt-token'
      crvStore.currentCRV = { _id: 'crv-001', statut: 'EN_COURS' }
    })

    it('devrait vérifier si un CRV peut être annulé', async () => {
      crvAPI.peutAnnuler.mockResolvedValue({
        data: { peutAnnuler: true }
      })

      const result = await crvStore.peutAnnulerCRV()

      expect(result.peutAnnuler).toBe(true)
    })

    it('devrait annuler un CRV avec motif', async () => {
      crvAPI.annuler.mockResolvedValue({
        data: { statut: 'ANNULE' }
      })

      await crvStore.annulerCRV({
        motifAnnulation: 'VOL_ANNULE',
        details: 'Vol annulé par la compagnie'
      })

      expect(crvAPI.annuler).toHaveBeenCalledWith('crv-001', {
        motifAnnulation: 'VOL_ANNULE',
        details: 'Vol annulé par la compagnie'
      })
      expect(crvStore.currentCRV.statut).toBe('ANNULE')
    })
  })

  // =========================================
  // ÉTAPE 6: ACTIONS NON AUTORISÉES
  // =========================================
  describe('ÉTAPE 6: Actions NON autorisées pour Superviseur', () => {
    it('ne devrait PAS pouvoir supprimer un programme vol', () => {
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.PROGRAMME_SUPPRIMER)).toBe(false)
    })

    it('ne devrait PAS pouvoir gérer les utilisateurs', () => {
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.USER_CREER)).toBe(false)
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.USER_MODIFIER)).toBe(false)
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.USER_DESACTIVER)).toBe(false)
    })
  })

  // =========================================
  // SCÉNARIO COMPLET: VALIDATION D'UN CRV
  // =========================================
  describe('SCÉNARIO COMPLET: Workflow de Validation', () => {
    it('devrait valider un CRV complet de bout en bout', async () => {
      // 1. Connexion
      authAPI.login.mockResolvedValue({
        data: { token: 'jwt-token', utilisateur: superviseurUser }
      })
      await authStore.login({ email: 'test@test.com', password: 'pass' })

      // 2. Charger un CRV à valider
      const mockCRV = {
        id: 'crv-001',
        completude: 90,
        statut: 'TERMINE',
        phases: [],
        charges: []
      }
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: mockCRV,
          phases: [{ statut: 'TERMINE' }, { statut: 'TERMINE' }],
          charges: [{ typeCharge: 'PASSAGERS' }],
          evenements: [],
          observations: [{ contenu: 'RAS' }]
        }
      })
      await crvStore.loadCRV('crv-001')
      expect(crvStore.completude).toBe(90)

      // 3. Vérifier éligibilité
      expect(crvStore.isCompleteEnough).toBe(true)
      expect(crvStore.canValidate).toBe(true)

      // 4. Valider
      validationAPI.valider.mockResolvedValue({
        data: { statut: 'VALIDE' }
      })
      await crvStore.validateCRV()
      expect(crvStore.currentCRV.statut).toBe('VALIDE')

      // 5. Vérifier verrouillage
      expect(crvStore.isValidated).toBe(true)
    })
  })
})
