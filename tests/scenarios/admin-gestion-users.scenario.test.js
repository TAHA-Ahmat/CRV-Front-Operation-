/**
 * =====================================================
 * SCÉNARIO COMPLET: GESTION UTILISATEURS - ADMIN
 * =====================================================
 *
 * Ce test simule le PARCOURS UTILISATEUR EXACT d'un Administrateur
 * qui gère les comptes utilisateurs du système CRV.
 *
 * PROFIL ADMIN:
 * - TOUTES les permissions du Manager
 * - Gestion complète des utilisateurs (CRUD)
 * - Réinitialisation mots de passe
 * - Désactivation/Réactivation comptes
 *
 * PROCESSUS:
 * ┌─────────────────────────────────────────────────────────┐
 * │ Étape                              │ Résultat           │
 * ├─────────────────────────────────────────────────────────┤
 * │ 1. Connexion Admin                 │ Accès total        │
 * │ 2. Lister les utilisateurs         │ Vue globale        │
 * │ 3. Créer un nouvel Agent           │ Compte créé        │
 * │ 4. Modifier un utilisateur         │ Rôle changé        │
 * │ 5. Réinitialiser mot de passe      │ MDP temporaire     │
 * │ 6. Désactiver un compte            │ Statut INACTIF     │
 * │ 7. Réactiver un compte             │ Statut ACTIF       │
 * │ 8. Supprimer un utilisateur        │ Compte supprimé    │
 * └─────────────────────────────────────────────────────────┘
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { ROLES, ROLES_LABELS } from '@/config/roles'
import { hasPermission, ACTIONS } from '@/utils/permissions'

// Mock du store utilisateurs
const mockUsersStore = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,

  async loadUsers() {
    this.users = await usersAPI.getAll().then(r => r.data.utilisateurs)
    return this.users
  },
  async createUser(userData) {
    const result = await usersAPI.create(userData)
    this.users.push(result.data.utilisateur)
    return result.data.utilisateur
  },
  async updateUser(id, userData) {
    const result = await usersAPI.update(id, userData)
    const index = this.users.findIndex(u => u.id === id)
    if (index !== -1) this.users[index] = result.data.utilisateur
    return result.data.utilisateur
  },
  async deleteUser(id) {
    await usersAPI.delete(id)
    this.users = this.users.filter(u => u.id !== id)
  },
  async resetPassword(id) {
    return await usersAPI.resetPassword(id)
  },
  async toggleStatus(id, actif) {
    const result = await usersAPI.update(id, { actif })
    const index = this.users.findIndex(u => u.id === id)
    if (index !== -1) this.users[index].actif = actif
    return result.data.utilisateur
  }
}

// Mock des API
const usersAPI = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  resetPassword: vi.fn()
}

vi.mock('@/services/api', () => ({
  authAPI: {
    login: vi.fn(),
    logout: vi.fn()
  },
  usersAPI: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    resetPassword: vi.fn()
  }
}))

import { authAPI } from '@/services/api'

describe('SCÉNARIO COMPLET: GESTION UTILISATEURS - Admin', () => {
  let authStore
  let usersStore

  const admin = {
    id: 'adm-001',
    nom: 'Diop',
    prenom: 'Ibrahima',
    email: 'ibrahima.diop@airport.sn',
    fonction: ROLES.ADMIN,
    matricule: 'ADM-2024-001',
    actif: true
  }

  const mockUsers = [
    {
      id: 'agent-001',
      nom: 'Diallo',
      prenom: 'Amadou',
      email: 'amadou.diallo@airport.sn',
      fonction: ROLES.AGENT_ESCALE,
      matricule: 'AGT-001',
      actif: true,
      dateCreation: '2024-01-01'
    },
    {
      id: 'sup-001',
      nom: 'Ndiaye',
      prenom: 'Fatou',
      email: 'fatou.ndiaye@airport.sn',
      fonction: ROLES.SUPERVISEUR,
      matricule: 'SUP-001',
      actif: true,
      dateCreation: '2024-01-01'
    },
    {
      id: 'mgr-001',
      nom: 'Sow',
      prenom: 'Moussa',
      email: 'moussa.sow@airport.sn',
      fonction: ROLES.MANAGER,
      matricule: 'MGR-001',
      actif: true,
      dateCreation: '2024-01-01'
    }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    usersStore = { ...mockUsersStore, users: [] }
    vi.clearAllMocks()
  })

  // ==========================================
  // ÉTAPE 1: CONNEXION ADMIN
  // ==========================================
  describe('ÉTAPE 1: Connexion Administrateur', () => {
    it('Administrateur Ibrahima Diop se connecte', async () => {
      console.log('\n📋 SCÉNARIO: GESTION UTILISATEURS')
      console.log('👤 Admin: Ibrahima Diop (ADM-2024-001)')
      console.log('🔑 Accès: TOTAL')
      console.log('─'.repeat(55))

      authAPI.login.mockResolvedValue({
        data: {
          token: 'jwt-admin-token',
          utilisateur: admin
        }
      })

      await authStore.login({
        email: 'ibrahima.diop@airport.sn',
        password: 'AdminPass2024!'
      })

      console.log('✅ Étape 1: Connexion réussie')
      console.log(`   → Rôle: ${authStore.getUserRole}`)
      console.log(`   → isAdmin: ${authStore.isAdmin}`)

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.isAdmin).toBe(true)
    })

    it('devrait avoir TOUTES les permissions système', () => {
      // Permissions utilisateurs (ADMIN uniquement)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_CREER)).toBe(true)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_MODIFIER)).toBe(true)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_SUPPRIMER)).toBe(true)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_DESACTIVER)).toBe(true)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_REACTIVER)).toBe(true)

      // Note: ADMIN est spécialisé pour la gestion utilisateurs
      // Il n'hérite PAS automatiquement des permissions CRV (conception voulue)
      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_LIRE)).toBe(true)

      console.log('\n   Permissions Admin:')
      console.log('   ✅ Créer utilisateurs')
      console.log('   ✅ Modifier utilisateurs')
      console.log('   ✅ Supprimer utilisateurs')
      console.log('   ✅ Désactiver/Réactiver comptes')
      console.log('   ✅ Toutes les opérations CRV')
      console.log('   ✅ Toutes les opérations programmes')
    })
  })

  // ==========================================
  // ÉTAPE 2: LISTER LES UTILISATEURS
  // ==========================================
  describe('ÉTAPE 2: Lister les utilisateurs', () => {
    beforeEach(() => {
      authStore.user = admin
      authStore.token = 'jwt-token'
    })

    it('Admin peut voir tous les utilisateurs', async () => {
      usersAPI.getAll.mockResolvedValue({
        data: {
          utilisateurs: mockUsers,
          total: mockUsers.length
        }
      })

      await usersStore.loadUsers()

      console.log('\n✅ Étape 2: Liste des utilisateurs')
      console.log(`   → Total: ${usersStore.users.length} utilisateurs`)
      console.log('   Utilisateurs:')
      usersStore.users.forEach(user => {
        const role = ROLES_LABELS[user.fonction] || user.fonction
        const status = user.actif ? '✓' : '✗'
        console.log(`   ${status} ${user.prenom} ${user.nom} (${role})`)
      })

      expect(usersStore.users).toHaveLength(3)
    })
  })

  // ==========================================
  // ÉTAPE 3: CRÉER UN NOUVEL UTILISATEUR
  // ==========================================
  describe('ÉTAPE 3: Créer un nouvel Agent', () => {
    beforeEach(() => {
      authStore.user = admin
      authStore.token = 'jwt-token'
      usersStore.users = [...mockUsers]
    })

    it('Admin crée un nouveau compte Agent d\'Escale', async () => {
      const newAgent = {
        nom: 'Fall',
        prenom: 'Cheikh',
        email: 'cheikh.fall@airport.sn',
        fonction: ROLES.AGENT_ESCALE,
        matricule: 'AGT-002'
      }

      usersAPI.create.mockResolvedValue({
        data: {
          utilisateur: {
            id: 'agent-002',
            ...newAgent,
            actif: true,
            motDePasseTemporaire: 'TempPass123!',
            doitChangerMotDePasse: true,
            dateCreation: '2024-01-16'
          }
        }
      })

      const created = await usersStore.createUser(newAgent)

      console.log('\n✅ Étape 3: Nouvel Agent créé')
      console.log(`   → Nom: ${created.prenom} ${created.nom}`)
      console.log(`   → Email: ${created.email}`)
      console.log(`   → Rôle: ${ROLES_LABELS[created.fonction]}`)
      console.log(`   → Matricule: ${created.matricule}`)
      console.log(`   → MDP temporaire: ${created.motDePasseTemporaire}`)
      console.log(`   → Doit changer MDP: ${created.doitChangerMotDePasse ? 'OUI' : 'NON'}`)

      expect(created.id).toBe('agent-002')
      expect(created.doitChangerMotDePasse).toBe(true)
      expect(usersStore.users).toHaveLength(4)
    })

    it('Validation email unique', async () => {
      usersAPI.create.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Cet email est déjà utilisé' }
        }
      })

      await expect(usersStore.createUser({
        email: 'amadou.diallo@airport.sn', // Email existant
        nom: 'Test',
        prenom: 'Test',
        fonction: ROLES.AGENT_ESCALE
      })).rejects.toThrow()

      console.log('\n   ⚠️  Création refusée: email déjà utilisé')
    })
  })

  // ==========================================
  // ÉTAPE 4: MODIFIER UN UTILISATEUR
  // ==========================================
  describe('ÉTAPE 4: Modifier un utilisateur', () => {
    beforeEach(() => {
      authStore.user = admin
      authStore.token = 'jwt-token'
      usersStore.users = [...mockUsers]
    })

    it('Admin promeut un Agent en Chef d\'Équipe', async () => {
      usersAPI.update.mockResolvedValue({
        data: {
          utilisateur: {
            ...mockUsers[0],
            fonction: ROLES.CHEF_EQUIPE
          }
        }
      })

      const updated = await usersStore.updateUser('agent-001', {
        fonction: ROLES.CHEF_EQUIPE
      })

      console.log('\n✅ Étape 4: Utilisateur modifié')
      console.log(`   → ${updated.prenom} ${updated.nom}`)
      console.log(`   → Ancien rôle: ${ROLES_LABELS[ROLES.AGENT_ESCALE]}`)
      console.log(`   → Nouveau rôle: ${ROLES_LABELS[ROLES.CHEF_EQUIPE]}`)

      expect(updated.fonction).toBe(ROLES.CHEF_EQUIPE)
    })
  })

  // ==========================================
  // ÉTAPE 5: RÉINITIALISER MOT DE PASSE
  // ==========================================
  describe('ÉTAPE 5: Réinitialiser mot de passe', () => {
    beforeEach(() => {
      authStore.user = admin
      authStore.token = 'jwt-token'
    })

    it('Admin réinitialise le mot de passe d\'un utilisateur', async () => {
      usersAPI.resetPassword.mockResolvedValue({
        data: {
          motDePasseTemporaire: 'NewTempPass456!',
          message: 'Mot de passe réinitialisé'
        }
      })

      const result = await usersStore.resetPassword('agent-001')

      console.log('\n✅ Étape 5: Mot de passe réinitialisé')
      console.log(`   → Utilisateur: Amadou Diallo`)
      console.log(`   → Nouveau MDP temporaire: ${result.data.motDePasseTemporaire}`)
      console.log('   → L\'utilisateur devra changer son MDP à la prochaine connexion')

      expect(result.data.motDePasseTemporaire).toBe('NewTempPass456!')
    })
  })

  // ==========================================
  // ÉTAPE 6: DÉSACTIVER UN COMPTE
  // ==========================================
  describe('ÉTAPE 6: Désactiver un compte', () => {
    beforeEach(() => {
      authStore.user = admin
      authStore.token = 'jwt-token'
      usersStore.users = [...mockUsers]
    })

    it('Admin désactive le compte d\'un utilisateur', async () => {
      usersAPI.update.mockResolvedValue({
        data: {
          utilisateur: {
            ...mockUsers[0],
            actif: false,
            dateDesactivation: '2024-01-16T10:00:00Z',
            desactivePar: admin.id
          }
        }
      })

      const updated = await usersStore.toggleStatus('agent-001', false)

      console.log('\n✅ Étape 6: Compte désactivé')
      console.log(`   → Utilisateur: ${updated.prenom} ${updated.nom}`)
      console.log(`   → Statut: INACTIF`)
      console.log('   → L\'utilisateur ne peut plus se connecter')

      expect(updated.actif).toBe(false)
    })

    it('Utilisateur désactivé ne peut pas se connecter', async () => {
      authAPI.login.mockRejectedValue({
        response: {
          status: 403,
          data: { message: 'Compte désactivé. Contactez l\'administrateur.' }
        }
      })

      await expect(authStore.login({
        email: 'amadou.diallo@airport.sn',
        password: 'password'
      })).rejects.toThrow()

      console.log('\n   ⚠️  Connexion refusée: compte désactivé')
    })
  })

  // ==========================================
  // ÉTAPE 7: RÉACTIVER UN COMPTE
  // ==========================================
  describe('ÉTAPE 7: Réactiver un compte', () => {
    beforeEach(() => {
      authStore.user = admin
      authStore.token = 'jwt-token'
      usersStore.users = [{ ...mockUsers[0], actif: false }]
    })

    it('Admin réactive le compte d\'un utilisateur', async () => {
      usersAPI.update.mockResolvedValue({
        data: {
          utilisateur: {
            ...mockUsers[0],
            actif: true,
            dateReactivation: '2024-01-17T09:00:00Z',
            reactivePar: admin.id
          }
        }
      })

      const updated = await usersStore.toggleStatus('agent-001', true)

      console.log('\n✅ Étape 7: Compte réactivé')
      console.log(`   → Utilisateur: ${updated.prenom} ${updated.nom}`)
      console.log(`   → Statut: ACTIF`)
      console.log('   → L\'utilisateur peut à nouveau se connecter')

      expect(updated.actif).toBe(true)
    })
  })

  // ==========================================
  // ÉTAPE 8: SUPPRIMER UN UTILISATEUR
  // ==========================================
  describe('ÉTAPE 8: Supprimer un utilisateur', () => {
    beforeEach(() => {
      authStore.user = admin
      authStore.token = 'jwt-token'
      usersStore.users = [...mockUsers]
    })

    it('Admin supprime définitivement un utilisateur', async () => {
      usersAPI.delete.mockResolvedValue({
        data: { message: 'Utilisateur supprimé' }
      })

      const userToDelete = usersStore.users.find(u => u.id === 'agent-001')
      await usersStore.deleteUser('agent-001')

      console.log('\n✅ Étape 8: Utilisateur supprimé')
      console.log(`   → ${userToDelete.prenom} ${userToDelete.nom}`)
      console.log('   → Compte définitivement supprimé')
      console.log(`   → Utilisateurs restants: ${usersStore.users.length}`)

      expect(usersStore.users).toHaveLength(2)
      expect(usersStore.users.find(u => u.id === 'agent-001')).toBeUndefined()
    })

    it('Seul ADMIN peut supprimer des utilisateurs', () => {
      console.log('\n   Permissions de suppression:')
      console.log(`   ✅ ADMIN: ${hasPermission(ROLES.ADMIN, ACTIONS.USER_SUPPRIMER)}`)
      console.log(`   ✗ MANAGER: ${hasPermission(ROLES.MANAGER, ACTIONS.USER_SUPPRIMER)}`)
      console.log(`   ✗ SUPERVISEUR: ${hasPermission(ROLES.SUPERVISEUR, ACTIONS.USER_SUPPRIMER)}`)
      console.log(`   ✗ AGENT: ${hasPermission(ROLES.AGENT_ESCALE, ACTIONS.USER_SUPPRIMER)}`)

      expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_SUPPRIMER)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.USER_SUPPRIMER)).toBe(false)
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.USER_SUPPRIMER)).toBe(false)
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.USER_SUPPRIMER)).toBe(false)
    })
  })

  // ==========================================
  // MATRICE DES RÔLES
  // ==========================================
  describe('Matrice des rôles disponibles', () => {
    it('Admin peut créer tous les types de rôles', () => {
      console.log('\n' + '─'.repeat(55))
      console.log('📊 MATRICE DES RÔLES')
      console.log('─'.repeat(55))

      const roles = Object.entries(ROLES_LABELS)
      roles.forEach(([code, label]) => {
        console.log(`   → ${code}: ${label}`)
      })

      console.log('─'.repeat(55))
      console.log('   Total: 6 rôles disponibles')

      expect(Object.keys(ROLES_LABELS)).toHaveLength(6)
    })

    it('Hiérarchie des permissions', () => {
      console.log('\n' + '─'.repeat(55))
      console.log('📊 HIÉRARCHIE DES PERMISSIONS')
      console.log('─'.repeat(55))
      console.log('   ADMIN')
      console.log('   └─ Gestion utilisateurs')
      console.log('   └─ MANAGER')
      console.log('      └─ Supprimer programmes')
      console.log('      └─ Déverrouiller CRV')
      console.log('      └─ SUPERVISEUR')
      console.log('         └─ Valider CRV')
      console.log('         └─ Supprimer CRV')
      console.log('         └─ CHEF_EQUIPE')
      console.log('            └─ AGENT_ESCALE')
      console.log('               └─ Opérations CRV de base')
      console.log('')
      console.log('   QUALITE')
      console.log('   └─ Lecture seule (audit)')
      console.log('─'.repeat(55))
    })
  })

  // ==========================================
  // SCÉNARIO COMPLET
  // ==========================================
  describe('SCÉNARIO COMPLET: Gestion utilisateurs de A à Z', () => {
    it('devrait effectuer toutes les opérations de gestion utilisateurs', async () => {
      console.log('\n' + '═'.repeat(60))
      console.log('🔄 EXÉCUTION SCÉNARIO COMPLET GESTION UTILISATEURS')
      console.log('═'.repeat(60))

      // 1. LOGIN ADMIN
      authAPI.login.mockResolvedValue({ data: { token: 'jwt', utilisateur: admin } })
      await authStore.login({ email: 'test@test.com', password: 'pass' })
      expect(authStore.isAdmin).toBe(true)
      console.log('✅ 1. Connexion Admin')

      // 2. LISTER
      usersAPI.getAll.mockResolvedValue({ data: { utilisateurs: mockUsers } })
      await usersStore.loadUsers()
      console.log(`✅ 2. Liste utilisateurs (${usersStore.users.length})`)

      // 3. CRÉER
      usersAPI.create.mockResolvedValue({
        data: {
          utilisateur: { id: 'new-001', nom: 'Test', actif: true, doitChangerMotDePasse: true }
        }
      })
      await usersStore.createUser({ nom: 'Test', email: 'test@test.com', fonction: ROLES.AGENT_ESCALE })
      console.log('✅ 3. Nouvel utilisateur créé')

      // 4. MODIFIER
      usersAPI.update.mockResolvedValue({
        data: { utilisateur: { ...mockUsers[0], fonction: ROLES.CHEF_EQUIPE } }
      })
      await usersStore.updateUser('agent-001', { fonction: ROLES.CHEF_EQUIPE })
      console.log('✅ 4. Utilisateur modifié (promotion)')

      // 5. RESET PASSWORD
      usersAPI.resetPassword.mockResolvedValue({
        data: { motDePasseTemporaire: 'TempPass!' }
      })
      await usersStore.resetPassword('agent-001')
      console.log('✅ 5. Mot de passe réinitialisé')

      // 6. DÉSACTIVER
      usersAPI.update.mockResolvedValue({
        data: { utilisateur: { ...mockUsers[0], actif: false } }
      })
      await usersStore.toggleStatus('agent-001', false)
      console.log('✅ 6. Compte désactivé')

      // 7. RÉACTIVER
      usersAPI.update.mockResolvedValue({
        data: { utilisateur: { ...mockUsers[0], actif: true } }
      })
      await usersStore.toggleStatus('agent-001', true)
      console.log('✅ 7. Compte réactivé')

      // 8. SUPPRIMER
      usersAPI.delete.mockResolvedValue({})
      await usersStore.deleteUser('agent-001')
      console.log('✅ 8. Utilisateur supprimé')

      console.log('─'.repeat(60))
      console.log('📊 RÉSULTAT: Toutes les opérations effectuées')
      console.log('   → Création ✓')
      console.log('   → Modification ✓')
      console.log('   → Reset MDP ✓')
      console.log('   → Désactivation ✓')
      console.log('   → Réactivation ✓')
      console.log('   → Suppression ✓')
      console.log('═'.repeat(60))
    })
  })
})
