/**
 * TESTS PROCESSUS COMPLETS - MANAGER
 *
 * Profil: MANAGER
 * Permissions: TOUTES les permissions opérationnelles
 *              - Tout ce que fait le Superviseur
 *              - Suppression programmes vol
 *              - Déverrouillage CRV
 *              - Réactivation CRV annulés
 *              - Statistiques avancées
 * Restrictions: Ne peut pas gérer les utilisateurs (ADMIN uniquement)
 *
 * Processus testés:
 * 1. Connexion et permissions complètes
 * 2. Déverrouillage CRV validés
 * 3. Réactivation CRV annulés
 * 4. Suppression programmes vol
 * 5. Statistiques et rapports
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useCRVStore } from '@/stores/crvStore'
import { ROLES } from '@/config/roles'
import { hasPermission, ACTIONS, canDeleteProgramme } from '@/utils/permissions'

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
    delete: vi.fn(),
    peutAnnuler: vi.fn(),
    annuler: vi.fn(),
    reactiver: vi.fn(),
    getStats: vi.fn(),
    getStatistiquesAnnulations: vi.fn(),
    getAnnules: vi.fn()
  },
  phasesAPI: {},
  chargesAPI: {},
  validationAPI: {
    valider: vi.fn(),
    deverrouiller: vi.fn(),
    getStatus: vi.fn()
  },
  programmesVolAPI: {
    valider: vi.fn(),
    activer: vi.fn(),
    suspendre: vi.fn(),
    delete: vi.fn()
  },
  slaAPI: {
    getRapport: vi.fn()
  }
}))

import { authAPI, crvAPI, validationAPI, programmesVolAPI, slaAPI } from '@/services/api'

describe('PROCESSUS MANAGER', () => {
  let authStore
  let crvStore

  const managerUser = {
    id: 'mgr-001',
    nom: 'Sow',
    prenom: 'Moussa',
    email: 'moussa.sow@airport.com',
    fonction: ROLES.MANAGER,
    matricule: 'MGR-001'
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    crvStore = useCRVStore()
    vi.clearAllMocks()
  })

  // =========================================
  // ÉTAPE 1: CONNEXION ET PERMISSIONS COMPLÈTES
  // =========================================
  describe('ÉTAPE 1: Connexion et Permissions Manager', () => {
    it('devrait se connecter avec le rôle MANAGER', async () => {
      authAPI.login.mockResolvedValue({
        data: {
          token: 'jwt-manager-token',
          utilisateur: managerUser
        }
      })

      await authStore.login({ email: 'moussa.sow@airport.com', password: 'password' })

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.getUserRole).toBe(ROLES.MANAGER)
      expect(authStore.isManager).toBe(true)
      expect(authStore.canManage).toBe(true)
      expect(authStore.canSupervise).toBe(true)
    })

    it('devrait avoir TOUTES les permissions opérationnelles', () => {
      // Permissions CRV
      expect(hasPermission(ROLES.MANAGER, ACTIONS.CRV_CREER)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.CRV_MODIFIER)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.CRV_SUPPRIMER)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.CRV_ARCHIVER)).toBe(true)

      // Permissions Phases
      expect(hasPermission(ROLES.MANAGER, ACTIONS.PHASE_DEMARRER)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.PHASE_TERMINER)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.PHASE_MODIFIER)).toBe(true)

      // Permissions Programmes (TOUTES)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.PROGRAMME_CREER)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.PROGRAMME_VALIDER)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.PROGRAMME_ACTIVER)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.PROGRAMME_SUSPENDRE)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.PROGRAMME_SUPPRIMER)).toBe(true)

      // Statistiques
      expect(hasPermission(ROLES.MANAGER, ACTIONS.STATS_LIRE)).toBe(true)
    })

    it('ne devrait PAS pouvoir gérer les utilisateurs', () => {
      expect(hasPermission(ROLES.MANAGER, ACTIONS.USER_CREER)).toBe(false)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.USER_MODIFIER)).toBe(false)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.USER_SUPPRIMER)).toBe(false)
    })

    it('devrait confirmer canDeleteProgramme', () => {
      expect(canDeleteProgramme(ROLES.MANAGER)).toBe(true)
    })
  })

  // =========================================
  // ÉTAPE 2: DÉVERROUILLAGE CRV
  // =========================================
  describe('ÉTAPE 2: Déverrouillage CRV Validés', () => {
    beforeEach(() => {
      authStore.user = managerUser
      authStore.token = 'jwt-token'
    })

    it('devrait déverrouiller un CRV validé avec raison', async () => {
      crvStore.currentCRV = {
        id: 'crv-001',
        statut: 'VERROUILLE',
        completude: 95
      }

      validationAPI.deverrouiller.mockResolvedValue({
        data: {
          statut: 'EN_COURS',
          deverrouillePar: managerUser.id,
          raisonDeverrouillage: 'Correction données passagers'
        }
      })

      await crvStore.deverrouillerCRV('Correction données passagers')

      expect(validationAPI.deverrouiller).toHaveBeenCalledWith('crv-001', 'Correction données passagers')
      expect(crvStore.currentCRV.statut).toBe('EN_COURS')
    })

    it('devrait pouvoir modifier un CRV après déverrouillage', async () => {
      crvStore.currentCRV = { id: 'crv-001', statut: 'EN_COURS' }

      // Le CRV est maintenant modifiable
      expect(crvStore.isEditable).toBe(true)
      expect(crvStore.isLocked).toBe(false)
    })

    it('devrait pouvoir re-valider après modification', async () => {
      crvStore.currentCRV = {
        id: 'crv-001',
        statut: 'EN_COURS',
        completude: 92
      }

      validationAPI.valider.mockResolvedValue({
        data: { statut: 'VALIDE' }
      })

      await crvStore.validateCRV()

      expect(crvStore.currentCRV.statut).toBe('VALIDE')
    })
  })

  // =========================================
  // ÉTAPE 3: RÉACTIVATION CRV ANNULÉS
  // =========================================
  describe('ÉTAPE 3: Réactivation CRV Annulés', () => {
    beforeEach(() => {
      authStore.user = managerUser
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        _id: 'crv-001',
        statut: 'ANNULE'
      }
    })

    it('devrait réactiver un CRV annulé', async () => {
      crvAPI.reactiver.mockResolvedValue({
        data: {
          statut: 'EN_COURS',
          reactivePar: managerUser.id
        }
      })

      await crvStore.reactiverCRV({
        motifReactivation: 'Erreur d\'annulation - vol reprogrammé'
      })

      expect(crvAPI.reactiver).toHaveBeenCalledWith('crv-001', {
        motifReactivation: 'Erreur d\'annulation - vol reprogrammé'
      })
      expect(crvStore.currentCRV.statut).toBe('EN_COURS')
    })

    it('devrait charger la liste des CRV annulés', async () => {
      crvAPI.getAnnules.mockResolvedValue({
        data: {
          data: [
            { id: 'crv-a1', statut: 'ANNULE', motifAnnulation: 'VOL_ANNULE' },
            { id: 'crv-a2', statut: 'ANNULE', motifAnnulation: 'DOUBLON' }
          ],
          total: 2
        }
      })

      const result = await crvStore.loadCRVAnnules({ dateDebut: '2024-01-01' })

      expect(crvAPI.getAnnules).toHaveBeenCalled()
      expect(result.data).toHaveLength(2)
    })

    it('devrait obtenir les statistiques d\'annulations', async () => {
      crvAPI.getStatistiquesAnnulations.mockResolvedValue({
        data: {
          totalAnnulations: 15,
          parMotif: {
            VOL_ANNULE: 8,
            DOUBLON: 4,
            ERREUR: 3
          }
        }
      })

      const result = await crvStore.getStatistiquesAnnulations({
        dateDebut: '2024-01-01',
        dateFin: '2024-01-31'
      })

      expect(result.totalAnnulations).toBe(15)
    })
  })

  // =========================================
  // ÉTAPE 4: SUPPRESSION PROGRAMMES VOL
  // =========================================
  describe('ÉTAPE 4: Suppression Programmes Vol', () => {
    beforeEach(() => {
      authStore.user = managerUser
      authStore.token = 'jwt-token'
    })

    it('devrait pouvoir supprimer un programme vol', async () => {
      programmesVolAPI.delete.mockResolvedValue({
        data: { message: 'Programme supprimé' }
      })

      await programmesVolAPI.delete('prog-001')

      expect(programmesVolAPI.delete).toHaveBeenCalledWith('prog-001')
    })

    it('devrait pouvoir suspendre un programme vol', async () => {
      programmesVolAPI.suspendre.mockResolvedValue({
        data: {
          programme: {
            id: 'prog-001',
            statut: 'SUSPENDU'
          }
        }
      })

      const result = await programmesVolAPI.suspendre('prog-001', 'Maintenance système')

      expect(result.data.programme.statut).toBe('SUSPENDU')
    })

    it('SEUL le Manager peut supprimer un programme', () => {
      expect(canDeleteProgramme(ROLES.MANAGER)).toBe(true)
      expect(canDeleteProgramme(ROLES.SUPERVISEUR)).toBe(false)
      expect(canDeleteProgramme(ROLES.AGENT_ESCALE)).toBe(false)
    })
  })

  // =========================================
  // ÉTAPE 5: STATISTIQUES ET RAPPORTS
  // =========================================
  describe('ÉTAPE 5: Statistiques et Rapports', () => {
    beforeEach(() => {
      authStore.user = managerUser
      authStore.token = 'jwt-token'
    })

    it('devrait obtenir les statistiques CRV', async () => {
      crvAPI.getStats.mockResolvedValue({
        data: {
          stats: {
            totalCRV: 150,
            enCours: 25,
            termines: 100,
            valides: 80,
            annules: 5,
            completudeMoyenne: 87
          }
        }
      })

      await crvStore.getStats({ dateDebut: '2024-01-01', dateFin: '2024-01-31' })

      expect(crvStore.stats.totalCRV).toBe(150)
      expect(crvStore.stats.completudeMoyenne).toBe(87)
    })

    it('devrait obtenir le rapport SLA', async () => {
      slaAPI.getRapport.mockResolvedValue({
        data: {
          tauxConformite: 94.5,
          depassements: 12,
          tempsTraitementMoyen: 45
        }
      })

      const result = await slaAPI.getRapport({ dateDebut: '2024-01-01' })

      expect(result.data.tauxConformite).toBe(94.5)
    })
  })

  // =========================================
  // ÉTAPE 6: GESTION AVANCÉE
  // =========================================
  describe('ÉTAPE 6: Gestion Avancée Manager', () => {
    beforeEach(() => {
      authStore.user = managerUser
      authStore.token = 'jwt-token'
    })

    it('devrait pouvoir lister tous les CRV avec filtres avancés', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          success: true,
          data: {
            data: [
              { id: 'crv-1', statut: 'EN_COURS' },
              { id: 'crv-2', statut: 'VALIDE' }
            ],
            total: 50,
            page: 1,
            pages: 5
          }
        }
      })

      await crvStore.listCRV({
        statut: 'EN_COURS',
        compagnie: 'AF',
        dateDebut: '2024-01-01',
        dateFin: '2024-01-31',
        page: 1,
        limit: 10
      })

      expect(crvStore.crvList).toHaveLength(2)
    })
  })

  // =========================================
  // SCÉNARIO COMPLET: WORKFLOW MANAGER
  // =========================================
  describe('SCÉNARIO COMPLET: Workflow Correction CRV', () => {
    it('devrait corriger un CRV validé de bout en bout', async () => {
      // 1. Connexion Manager
      authAPI.login.mockResolvedValue({
        data: { token: 'jwt-token', utilisateur: managerUser }
      })
      await authStore.login({ email: 'test@test.com', password: 'pass' })
      expect(authStore.isManager).toBe(true)

      // 2. Charger un CRV verrouillé
      crvStore.currentCRV = {
        id: 'crv-001',
        statut: 'VERROUILLE',
        completude: 90
      }
      expect(crvStore.isLocked).toBe(true)

      // 3. Déverrouiller
      validationAPI.deverrouiller.mockResolvedValue({
        data: { statut: 'EN_COURS' }
      })
      await crvStore.deverrouillerCRV('Correction urgente')
      expect(crvStore.currentCRV.statut).toBe('EN_COURS')
      expect(crvStore.isEditable).toBe(true)

      // 4. (Modifications effectuées par l'équipe...)

      // 5. Re-valider
      crvStore.currentCRV.completude = 95
      validationAPI.valider.mockResolvedValue({
        data: { statut: 'VALIDE' }
      })
      await crvStore.validateCRV()
      expect(crvStore.currentCRV.statut).toBe('VALIDE')
    })
  })
})
