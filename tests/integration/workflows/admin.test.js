/**
 * TESTS PROCESSUS COMPLETS - ADMINISTRATEUR
 *
 * Profil: ADMIN
 * Permissions: Gestion EXCLUSIVE des utilisateurs
 *              - Créer, modifier, supprimer utilisateurs
 *              - Désactiver/réactiver comptes
 *              - Changer les rôles
 * Restrictions: PAS d'accès aux opérations CRV
 *
 * Processus testés:
 * 1. Connexion et permissions admin
 * 2. Création d'utilisateurs
 * 3. Modification d'utilisateurs
 * 4. Désactivation/Réactivation comptes
 * 5. Suppression d'utilisateurs
 * 6. Refus d'accès aux CRV
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { ROLES } from '@/config/roles'
import {
  hasPermission,
  ACTIONS,
  isAdminRole,
  canManageUsers,
  canOperateCRV,
  canViewCRV,
  getPermissionDeniedMessage,
  PERMISSION_MESSAGES
} from '@/utils/permissions'

// Mock des API
vi.mock('@/services/api', () => ({
  authAPI: {
    login: vi.fn(),
    logout: vi.fn()
  },
  personnesAPI: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    desactiver: vi.fn(),
    reactiver: vi.fn()
  },
  crvAPI: {},
  phasesAPI: {},
  chargesAPI: {},
  validationAPI: {}
}))

import { authAPI, personnesAPI } from '@/services/api'

describe('PROCESSUS ADMINISTRATEUR', () => {
  let authStore

  const adminUser = {
    id: 'adm-001',
    nom: 'Diop',
    prenom: 'Ibrahima',
    email: 'ibrahima.diop@airport.com',
    fonction: ROLES.ADMIN,
    matricule: 'ADM-001'
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    vi.clearAllMocks()
  })

  // =========================================
  // ÉTAPE 1: CONNEXION ET PERMISSIONS ADMIN
  // =========================================
  describe('ÉTAPE 1: Connexion et Permissions Admin', () => {
    it('devrait se connecter avec le rôle ADMIN', async () => {
      authAPI.login.mockResolvedValue({
        data: {
          token: 'jwt-admin-token',
          utilisateur: adminUser
        }
      })

      await authStore.login({ email: 'ibrahima.diop@airport.com', password: 'password' })

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.getUserRole).toBe(ROLES.ADMIN)
      expect(authStore.isAdmin).toBe(true)
    })

    it('devrait être identifié comme rôle Admin', () => {
      expect(isAdminRole(ROLES.ADMIN)).toBe(true)
      expect(isAdminRole(ROLES.MANAGER)).toBe(false)
    })

    it('devrait pouvoir gérer les utilisateurs', () => {
      expect(canManageUsers(ROLES.ADMIN)).toBe(true)
    })

    it('devrait avoir TOUTES les permissions utilisateur', () => {
      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_CREER)).toBe(true)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_LIRE)).toBe(true)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_MODIFIER)).toBe(true)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_DESACTIVER)).toBe(true)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_REACTIVER)).toBe(true)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_SUPPRIMER)).toBe(true)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_CHANGER_ROLE)).toBe(true)
    })

    it('ne devrait PAS avoir accès aux opérations CRV', () => {
      expect(canOperateCRV(ROLES.ADMIN)).toBe(false)
      expect(canViewCRV(ROLES.ADMIN)).toBe(false)
    })
  })

  // =========================================
  // ÉTAPE 2: CRÉATION D'UTILISATEURS
  // =========================================
  describe('ÉTAPE 2: Création d\'Utilisateurs', () => {
    beforeEach(() => {
      authStore.user = adminUser
      authStore.token = 'jwt-token'
    })

    it('devrait créer un nouvel Agent d\'Escale', async () => {
      const newUser = {
        nom: 'Fall',
        prenom: 'Ousmane',
        email: 'ousmane.fall@airport.com',
        password: 'TempPass123!',
        fonction: ROLES.AGENT_ESCALE,
        matricule: 'AGT-002',
        telephone: '+221 77 123 45 67'
      }

      personnesAPI.create.mockResolvedValue({
        data: {
          id: 'user-new-001',
          ...newUser,
          doitChangerMotDePasse: true,
          statutCompte: 'VALIDE',
          dateCreation: '2024-01-15T10:00:00Z'
        }
      })

      const result = await personnesAPI.create(newUser)

      expect(personnesAPI.create).toHaveBeenCalledWith(newUser)
      expect(result.data.fonction).toBe(ROLES.AGENT_ESCALE)
      expect(result.data.doitChangerMotDePasse).toBe(true)
    })

    it('devrait créer un Superviseur', async () => {
      const newSuperviseur = {
        nom: 'Mbaye',
        prenom: 'Aissatou',
        email: 'aissatou.mbaye@airport.com',
        password: 'TempPass123!',
        fonction: ROLES.SUPERVISEUR,
        matricule: 'SUP-002'
      }

      personnesAPI.create.mockResolvedValue({
        data: { id: 'user-sup-001', ...newSuperviseur }
      })

      const result = await personnesAPI.create(newSuperviseur)

      expect(result.data.fonction).toBe(ROLES.SUPERVISEUR)
    })

    it('devrait créer un Manager', async () => {
      const newManager = {
        nom: 'Gueye',
        prenom: 'Mamadou',
        email: 'mamadou.gueye@airport.com',
        password: 'TempPass123!',
        fonction: ROLES.MANAGER,
        matricule: 'MGR-002'
      }

      personnesAPI.create.mockResolvedValue({
        data: { id: 'user-mgr-001', ...newManager }
      })

      const result = await personnesAPI.create(newManager)

      expect(result.data.fonction).toBe(ROLES.MANAGER)
    })

    it('devrait créer un compte Qualité', async () => {
      const newQualite = {
        nom: 'Sarr',
        prenom: 'Fatou',
        email: 'fatou.sarr@airport.com',
        password: 'TempPass123!',
        fonction: ROLES.QUALITE,
        matricule: 'QUA-002'
      }

      personnesAPI.create.mockResolvedValue({
        data: { id: 'user-qua-001', ...newQualite }
      })

      const result = await personnesAPI.create(newQualite)

      expect(result.data.fonction).toBe(ROLES.QUALITE)
    })

    it('devrait pouvoir créer tous les 6 types de rôles', () => {
      const allRoles = [
        ROLES.AGENT_ESCALE,
        ROLES.CHEF_EQUIPE,
        ROLES.SUPERVISEUR,
        ROLES.MANAGER,
        ROLES.QUALITE,
        ROLES.ADMIN
      ]

      allRoles.forEach(role => {
        expect(Object.values(ROLES)).toContain(role)
      })
      expect(allRoles).toHaveLength(6)
    })
  })

  // =========================================
  // ÉTAPE 3: MODIFICATION D'UTILISATEURS
  // =========================================
  describe('ÉTAPE 3: Modification d\'Utilisateurs', () => {
    beforeEach(() => {
      authStore.user = adminUser
      authStore.token = 'jwt-token'
    })

    it('devrait modifier les informations d\'un utilisateur', async () => {
      const updateData = {
        telephone: '+221 77 999 88 77',
        email: 'nouveau.email@airport.com'
      }

      personnesAPI.update.mockResolvedValue({
        data: {
          id: 'user-001',
          ...updateData
        }
      })

      const result = await personnesAPI.update('user-001', updateData)

      expect(personnesAPI.update).toHaveBeenCalledWith('user-001', updateData)
      expect(result.data.telephone).toBe('+221 77 999 88 77')
    })

    it('devrait changer le rôle d\'un utilisateur', async () => {
      const updateRole = {
        fonction: ROLES.CHEF_EQUIPE
      }

      personnesAPI.update.mockResolvedValue({
        data: {
          id: 'user-001',
          fonction: ROLES.CHEF_EQUIPE
        }
      })

      const result = await personnesAPI.update('user-001', updateRole)

      expect(result.data.fonction).toBe(ROLES.CHEF_EQUIPE)
    })

    it('devrait promouvoir un Agent en Superviseur', async () => {
      personnesAPI.update.mockResolvedValue({
        data: {
          id: 'user-001',
          fonction: ROLES.SUPERVISEUR
        }
      })

      const result = await personnesAPI.update('user-001', { fonction: ROLES.SUPERVISEUR })

      expect(result.data.fonction).toBe(ROLES.SUPERVISEUR)
    })
  })

  // =========================================
  // ÉTAPE 4: DÉSACTIVATION/RÉACTIVATION
  // =========================================
  describe('ÉTAPE 4: Désactivation et Réactivation Comptes', () => {
    beforeEach(() => {
      authStore.user = adminUser
      authStore.token = 'jwt-token'
    })

    it('devrait désactiver un compte utilisateur', async () => {
      personnesAPI.desactiver.mockResolvedValue({
        data: {
          id: 'user-001',
          statutCompte: 'DESACTIVE',
          raisonDesactivation: 'Départ de l\'entreprise'
        }
      })

      const result = await personnesAPI.desactiver('user-001', 'Départ de l\'entreprise')

      expect(personnesAPI.desactiver).toHaveBeenCalledWith('user-001', 'Départ de l\'entreprise')
      expect(result.data.statutCompte).toBe('DESACTIVE')
    })

    it('devrait réactiver un compte désactivé', async () => {
      personnesAPI.reactiver.mockResolvedValue({
        data: {
          id: 'user-001',
          statutCompte: 'VALIDE'
        }
      })

      const result = await personnesAPI.reactiver('user-001')

      expect(personnesAPI.reactiver).toHaveBeenCalledWith('user-001')
      expect(result.data.statutCompte).toBe('VALIDE')
    })

    it('devrait suspendre temporairement un compte', async () => {
      personnesAPI.update.mockResolvedValue({
        data: {
          id: 'user-001',
          statutCompte: 'SUSPENDU',
          raisonSuspension: 'Enquête en cours'
        }
      })

      const result = await personnesAPI.update('user-001', {
        statutCompte: 'SUSPENDU',
        raisonSuspension: 'Enquête en cours'
      })

      expect(result.data.statutCompte).toBe('SUSPENDU')
    })
  })

  // =========================================
  // ÉTAPE 5: SUPPRESSION D'UTILISATEURS
  // =========================================
  describe('ÉTAPE 5: Suppression d\'Utilisateurs', () => {
    beforeEach(() => {
      authStore.user = adminUser
      authStore.token = 'jwt-token'
    })

    it('devrait supprimer un utilisateur', async () => {
      personnesAPI.delete.mockResolvedValue({
        data: { message: 'Utilisateur supprimé' }
      })

      await personnesAPI.delete('user-001')

      expect(personnesAPI.delete).toHaveBeenCalledWith('user-001')
    })

    it('devrait échouer si le compte est utilisé', async () => {
      personnesAPI.delete.mockRejectedValue({
        response: {
          status: 400,
          data: {
            code: 'ACCOUNT_IN_USE',
            message: 'Ce compte a créé des CRV et ne peut pas être supprimé'
          }
        }
      })

      await expect(personnesAPI.delete('user-active')).rejects.toBeDefined()
    })
  })

  // =========================================
  // ÉTAPE 6: REFUS D'ACCÈS AUX CRV
  // =========================================
  describe('ÉTAPE 6: Refus d\'Accès aux Opérations CRV', () => {
    it('ne devrait PAS pouvoir créer un CRV', () => {
      expect(hasPermission(ROLES.ADMIN, ACTIONS.CRV_CREER)).toBe(false)
    })

    it('ne devrait PAS pouvoir modifier un CRV', () => {
      expect(hasPermission(ROLES.ADMIN, ACTIONS.CRV_MODIFIER)).toBe(false)
    })

    it('ne devrait PAS pouvoir lire les CRV', () => {
      expect(hasPermission(ROLES.ADMIN, ACTIONS.CRV_LIRE)).toBe(false)
    })

    it('ne devrait PAS pouvoir gérer les phases', () => {
      expect(hasPermission(ROLES.ADMIN, ACTIONS.PHASE_DEMARRER)).toBe(false)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.PHASE_TERMINER)).toBe(false)
    })

    it('ne devrait PAS pouvoir gérer les charges', () => {
      expect(hasPermission(ROLES.ADMIN, ACTIONS.CHARGE_AJOUTER)).toBe(false)
    })

    it('ne devrait PAS pouvoir gérer les programmes vol', () => {
      expect(hasPermission(ROLES.ADMIN, ACTIONS.PROGRAMME_CREER)).toBe(false)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.PROGRAMME_VALIDER)).toBe(false)
    })

    it('ne devrait PAS pouvoir voir les statistiques CRV', () => {
      expect(hasPermission(ROLES.ADMIN, ACTIONS.STATS_LIRE)).toBe(false)
    })

    it('devrait retourner le bon message d\'erreur pour CRV', () => {
      const message = getPermissionDeniedMessage(ROLES.ADMIN, ACTIONS.CRV_CREER)
      expect(message).toBe(PERMISSION_MESSAGES.ADMIN_NO_CRV)
    })
  })

  // =========================================
  // ÉTAPE 7: LISTE DES UTILISATEURS
  // =========================================
  describe('ÉTAPE 7: Liste et Recherche Utilisateurs', () => {
    beforeEach(() => {
      authStore.user = adminUser
      authStore.token = 'jwt-token'
    })

    it('devrait lister tous les utilisateurs', async () => {
      personnesAPI.getAll.mockResolvedValue({
        data: {
          data: [
            { id: 'u1', nom: 'Diallo', fonction: ROLES.AGENT_ESCALE, statutCompte: 'VALIDE' },
            { id: 'u2', nom: 'Ndiaye', fonction: ROLES.SUPERVISEUR, statutCompte: 'VALIDE' },
            { id: 'u3', nom: 'Fall', fonction: ROLES.MANAGER, statutCompte: 'DESACTIVE' }
          ],
          total: 50,
          page: 1,
          pages: 5
        }
      })

      const result = await personnesAPI.getAll({ page: 1, limit: 10 })

      expect(result.data.data).toHaveLength(3)
      expect(result.data.total).toBe(50)
    })

    it('devrait filtrer par fonction', async () => {
      personnesAPI.getAll.mockResolvedValue({
        data: {
          data: [
            { id: 'u1', fonction: ROLES.AGENT_ESCALE },
            { id: 'u2', fonction: ROLES.AGENT_ESCALE }
          ],
          total: 20
        }
      })

      const result = await personnesAPI.getAll({ fonction: ROLES.AGENT_ESCALE })

      expect(result.data.data.every(u => u.fonction === ROLES.AGENT_ESCALE)).toBe(true)
    })

    it('devrait filtrer par statut compte', async () => {
      personnesAPI.getAll.mockResolvedValue({
        data: {
          data: [
            { id: 'u1', statutCompte: 'DESACTIVE' }
          ],
          total: 5
        }
      })

      const result = await personnesAPI.getAll({ statut: 'DESACTIVE' })

      expect(result.data.data[0].statutCompte).toBe('DESACTIVE')
    })

    it('devrait obtenir un utilisateur par ID', async () => {
      personnesAPI.getById.mockResolvedValue({
        data: {
          id: 'user-001',
          nom: 'Diallo',
          prenom: 'Amadou',
          email: 'amadou.diallo@airport.com',
          fonction: ROLES.AGENT_ESCALE,
          statutCompte: 'VALIDE',
          dateCreation: '2024-01-01T00:00:00Z',
          derniereConnexion: '2024-01-15T08:30:00Z'
        }
      })

      const result = await personnesAPI.getById('user-001')

      expect(result.data.nom).toBe('Diallo')
      expect(result.data.fonction).toBe(ROLES.AGENT_ESCALE)
    })
  })

  // =========================================
  // SCÉNARIO COMPLET: ONBOARDING UTILISATEUR
  // =========================================
  describe('SCÉNARIO COMPLET: Onboarding Nouvel Employé', () => {
    it('devrait effectuer le processus complet d\'onboarding', async () => {
      // 1. Connexion Admin
      authAPI.login.mockResolvedValue({
        data: { token: 'jwt-token', utilisateur: adminUser }
      })
      await authStore.login({ email: 'admin@test.com', password: 'pass' })
      expect(authStore.isAdmin).toBe(true)

      // 2. Créer le nouveau compte
      const newEmployee = {
        nom: 'Toure',
        prenom: 'Seydou',
        email: 'seydou.toure@airport.com',
        password: 'Welcome2024!',
        fonction: ROLES.AGENT_ESCALE,
        matricule: 'AGT-NEW-001'
      }

      personnesAPI.create.mockResolvedValue({
        data: {
          id: 'new-user-001',
          ...newEmployee,
          doitChangerMotDePasse: true,
          statutCompte: 'VALIDE'
        }
      })

      const createResult = await personnesAPI.create(newEmployee)
      expect(createResult.data.id).toBeDefined()
      expect(createResult.data.doitChangerMotDePasse).toBe(true)

      // 3. Vérifier la création
      personnesAPI.getById.mockResolvedValue({
        data: createResult.data
      })

      const verifyResult = await personnesAPI.getById('new-user-001')
      expect(verifyResult.data.fonction).toBe(ROLES.AGENT_ESCALE)

      // 4. (Plus tard) Promouvoir en Chef d'équipe
      personnesAPI.update.mockResolvedValue({
        data: { ...createResult.data, fonction: ROLES.CHEF_EQUIPE }
      })

      const promoteResult = await personnesAPI.update('new-user-001', {
        fonction: ROLES.CHEF_EQUIPE
      })
      expect(promoteResult.data.fonction).toBe(ROLES.CHEF_EQUIPE)

      // 5. Déconnexion
      authAPI.logout.mockResolvedValue({})
      await authStore.logout()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })
})
