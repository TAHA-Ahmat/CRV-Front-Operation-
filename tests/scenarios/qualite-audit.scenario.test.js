/**
 * =====================================================
 * SCÉNARIO COMPLET: AUDIT LECTURE SEULE - QUALITÉ
 * =====================================================
 *
 * Ce test simule le PARCOURS UTILISATEUR EXACT d'un agent Qualité
 * qui audite les CRV sans pouvoir les modifier.
 *
 * PROFIL QUALITÉ:
 * - LECTURE SEULE sur TOUT le système
 * - Accès aux statistiques et rapports
 * - AUCUNE action de création/modification/suppression
 *
 * PROCESSUS D'AUDIT:
 * ┌─────────────────────────────────────────────────────────┐
 * │ Étape                              │ Résultat           │
 * ├─────────────────────────────────────────────────────────┤
 * │ 1. Connexion Qualité               │ Mode lecture seule │
 * │ 2. Consulter liste des CRV         │ ✓ Autorisé         │
 * │ 3. Ouvrir un CRV en détail         │ ✓ Autorisé         │
 * │ 4. Consulter les phases            │ ✓ Autorisé         │
 * │ 5. Consulter les charges           │ ✓ Autorisé         │
 * │ 6. Consulter les statistiques      │ ✓ Autorisé         │
 * │                                                         │
 * │ ACTIONS REFUSÉES:                                      │
 * │ 7. Créer un CRV                    │ ✗ REFUSÉ           │
 * │ 8. Modifier un CRV                 │ ✗ REFUSÉ           │
 * │ 9. Valider un CRV                  │ ✗ REFUSÉ           │
 * │ 10. Supprimer un CRV               │ ✗ REFUSÉ           │
 * └─────────────────────────────────────────────────────────┘
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useCRVStore } from '@/stores/crvStore'
import { ROLES } from '@/config/roles'
import {
  hasPermission,
  ACTIONS,
  isReadOnlyRole,
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
  crvAPI: {
    getById: vi.fn(),
    getAll: vi.fn(),
    search: vi.fn(),
    getStats: vi.fn()
  },
  phasesAPI: {},
  chargesAPI: {},
  validationAPI: {}
}))

import { authAPI, crvAPI } from '@/services/api'

describe('SCÉNARIO COMPLET: AUDIT LECTURE SEULE - Qualité', () => {
  let authStore
  let crvStore

  const qualite = {
    id: 'qua-001',
    nom: 'Ba',
    prenom: 'Aminata',
    email: 'aminata.ba@airport.sn',
    fonction: ROLES.QUALITE,
    matricule: 'QUA-2024-001'
  }

  const mockCRVList = [
    {
      id: 'crv-001',
      numeroCRV: 'CRV-2024-0001',
      statut: 'VALIDE',
      completude: 92,
      vol: { numeroVol: 'AF123', typeOperation: 'ARRIVEE' }
    },
    {
      id: 'crv-002',
      numeroCRV: 'CRV-2024-0002',
      statut: 'VALIDE',
      completude: 88,
      vol: { numeroVol: 'SN205', typeOperation: 'DEPART' }
    },
    {
      id: 'crv-003',
      numeroCRV: 'CRV-2024-0003',
      statut: 'EN_COURS',
      completude: 65,
      vol: { numeroVol: 'ET908', typeOperation: 'TURN_AROUND' }
    }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    crvStore = useCRVStore()
    vi.clearAllMocks()
  })

  // ==========================================
  // ÉTAPE 1: CONNEXION QUALITÉ (LECTURE SEULE)
  // ==========================================
  describe('ÉTAPE 1: Connexion Qualité - Mode Lecture Seule', () => {
    it('Agent Qualité Aminata Ba se connecte', async () => {
      console.log('\n📋 SCÉNARIO: AUDIT QUALITÉ')
      console.log('👤 Qualité: Aminata Ba (QUA-2024-001)')
      console.log('🔒 Mode: LECTURE SEULE')
      console.log('─'.repeat(55))

      authAPI.login.mockResolvedValue({
        data: {
          token: 'jwt-qualite-token',
          utilisateur: qualite
        }
      })

      await authStore.login({
        email: 'aminata.ba@airport.sn',
        password: 'QualitePass2024!'
      })

      console.log('✅ Étape 1: Connexion réussie')
      console.log(`   → Rôle: ${authStore.getUserRole}`)
      console.log(`   → isQualite: ${authStore.isQualite}`)
      console.log(`   → Mode lecture seule: ${isReadOnlyRole(ROLES.QUALITE) ? 'OUI' : 'NON'}`)

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.isQualite).toBe(true)
      expect(isReadOnlyRole(ROLES.QUALITE)).toBe(true)
    })

    it('devrait avoir UNIQUEMENT les permissions de lecture', () => {
      // Permissions AUTORISÉES (lecture)
      expect(hasPermission(ROLES.QUALITE, ACTIONS.CRV_LIRE)).toBe(true)
      expect(hasPermission(ROLES.QUALITE, ACTIONS.VOL_LIRE)).toBe(true)
      expect(hasPermission(ROLES.QUALITE, ACTIONS.PROGRAMME_LIRE)).toBe(true)
      expect(hasPermission(ROLES.QUALITE, ACTIONS.STATS_LIRE)).toBe(true)

      // Permissions REFUSÉES (écriture)
      expect(hasPermission(ROLES.QUALITE, ACTIONS.CRV_CREER)).toBe(false)
      expect(hasPermission(ROLES.QUALITE, ACTIONS.CRV_MODIFIER)).toBe(false)
      expect(hasPermission(ROLES.QUALITE, ACTIONS.CRV_SUPPRIMER)).toBe(false)
      expect(hasPermission(ROLES.QUALITE, ACTIONS.CRV_VALIDER)).toBe(false)

      console.log('\n   Permissions Qualité:')
      console.log('   ✅ Lire CRV')
      console.log('   ✅ Lire Vols')
      console.log('   ✅ Lire Programmes')
      console.log('   ✅ Lire Statistiques')
      console.log('   ✗ Créer/Modifier/Supprimer CRV')
      console.log('   ✗ Valider CRV')
      console.log('   ✗ Gérer programmes')
      console.log('   ✗ Gérer utilisateurs')
    })

    it('devrait être identifié comme rôle lecture seule', () => {
      expect(isReadOnlyRole(ROLES.QUALITE)).toBe(true)
      expect(canOperateCRV(ROLES.QUALITE)).toBe(false)
      expect(canViewCRV(ROLES.QUALITE)).toBe(true)
    })
  })

  // ==========================================
  // ÉTAPE 2: CONSULTER LA LISTE DES CRV
  // ==========================================
  describe('ÉTAPE 2: Consulter la liste des CRV', () => {
    beforeEach(() => {
      authStore.user = qualite
      authStore.token = 'jwt-token'
    })

    it('Qualité peut lister tous les CRV', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          success: true,
          data: {
            data: mockCRVList,
            total: 100,
            page: 1,
            pages: 10
          }
        }
      })

      await crvStore.listCRV({ page: 1 })

      console.log('\n✅ Étape 2: Liste des CRV consultée')
      console.log(`   → Total: ${crvStore.crvTotal} CRV`)
      console.log(`   → Affichés: ${crvStore.crvList.length}`)
      console.log('   CRV dans la page:')
      crvStore.crvList.forEach(crv => {
        console.log(`   → ${crv.numeroCRV} (${crv.vol.typeOperation}) - ${crv.statut}`)
      })

      expect(crvStore.crvList).toHaveLength(3)
      expect(crvAPI.getAll).toHaveBeenCalled()
    })

    it('Qualité peut rechercher des CRV', async () => {
      crvAPI.search.mockResolvedValue({
        data: {
          data: [mockCRVList[0]]
        }
      })

      await crvStore.searchCRV({ q: 'AF123' })

      console.log('\n   Recherche "AF123":')
      console.log('   → 1 résultat trouvé')

      expect(crvAPI.search).toHaveBeenCalledWith({ q: 'AF123' })
    })
  })

  // ==========================================
  // ÉTAPE 3: OUVRIR UN CRV EN DÉTAIL
  // ==========================================
  describe('ÉTAPE 3: Ouvrir un CRV en détail', () => {
    beforeEach(() => {
      authStore.user = qualite
      authStore.token = 'jwt-token'
    })

    it('Qualité peut consulter tous les détails d\'un CRV', async () => {
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: {
            id: 'crv-001',
            numeroCRV: 'CRV-2024-0001',
            statut: 'VALIDE',
            completude: 92,
            creePar: { nom: 'Diallo', prenom: 'Amadou' },
            validePar: { nom: 'Ndiaye', prenom: 'Fatou' },
            vol: {
              numeroVol: 'AF123',
              typeOperation: 'ARRIVEE',
              compagnie: { nom: 'Air France' }
            },
            dateCreation: '2024-01-15T14:30:00Z',
            dateValidation: '2024-01-15T16:00:00Z'
          },
          phases: [
            { id: 'p1', nom: 'Positionnement', statut: 'TERMINE', dureeMinutes: 3 },
            { id: 'p2', nom: 'Débarquement', statut: 'TERMINE', dureeMinutes: 18 },
            { id: 'p3', nom: 'Déchargement', statut: 'TERMINE', dureeMinutes: 22 }
          ],
          charges: [
            { id: 'c1', typeCharge: 'PASSAGERS', passagersAdultes: 168, total: 186 },
            { id: 'c2', typeCharge: 'BAGAGES', nombreBagagesSoute: 195, total: 205 }
          ],
          evenements: [
            { id: 'e1', typeEvenement: 'RETARD', gravite: 'MINEURE', description: 'Retard 10 min' }
          ],
          observations: [
            { id: 'o1', categorie: 'GENERALE', contenu: 'RAS' }
          ]
        }
      })

      await crvStore.loadCRV('crv-001')

      console.log('\n✅ Étape 3: CRV consulté en détail')
      console.log(`   → Numéro: ${crvStore.currentCRV.numeroCRV}`)
      console.log(`   → Vol: ${crvStore.currentCRV.vol.numeroVol}`)
      console.log(`   → Créé par: ${crvStore.currentCRV.creePar.prenom} ${crvStore.currentCRV.creePar.nom}`)
      console.log(`   → Validé par: ${crvStore.currentCRV.validePar.prenom} ${crvStore.currentCRV.validePar.nom}`)
      console.log(`   → Complétude: ${crvStore.completude}%`)

      expect(crvStore.currentCRV).toBeDefined()
      expect(crvStore.phases).toHaveLength(3)
      expect(crvStore.charges).toHaveLength(2)
    })
  })

  // ==========================================
  // ÉTAPE 4: CONSULTER LES PHASES
  // ==========================================
  describe('ÉTAPE 4: Consulter les phases', () => {
    beforeEach(() => {
      authStore.user = qualite
      authStore.token = 'jwt-token'
      crvStore.phases = [
        { id: 'p1', nom: 'Positionnement', statut: 'TERMINE', dureeMinutes: 3 },
        { id: 'p2', nom: 'Débarquement', statut: 'TERMINE', dureeMinutes: 18 },
        { id: 'p3', nom: 'Déchargement', statut: 'TERMINE', dureeMinutes: 22 }
      ]
    })

    it('Qualité peut voir toutes les phases', () => {
      console.log('\n✅ Étape 4: Phases consultées')
      console.log('   Détail des phases:')
      crvStore.phases.forEach(phase => {
        console.log(`   → ${phase.nom}: ${phase.statut} (${phase.dureeMinutes} min)`)
      })

      expect(crvStore.phases).toHaveLength(3)
      expect(crvStore.getPhasesTerminees).toHaveLength(3)
    })
  })

  // ==========================================
  // ÉTAPE 5: CONSULTER LES CHARGES
  // ==========================================
  describe('ÉTAPE 5: Consulter les charges', () => {
    beforeEach(() => {
      authStore.user = qualite
      authStore.token = 'jwt-token'
      crvStore.charges = [
        { id: 'c1', typeCharge: 'PASSAGERS', passagersAdultes: 168, total: 186 },
        { id: 'c2', typeCharge: 'BAGAGES', nombreBagagesSoute: 195, total: 205 }
      ]
    })

    it('Qualité peut voir toutes les charges', () => {
      console.log('\n✅ Étape 5: Charges consultées')
      console.log('   Passagers:')
      console.log(`   → Total: ${crvStore.getChargesPassagers[0]?.total}`)
      console.log('   Bagages:')
      console.log(`   → Total: ${crvStore.getChargesBagages[0]?.total}`)

      expect(crvStore.getChargesPassagers).toHaveLength(1)
      expect(crvStore.getChargesBagages).toHaveLength(1)
    })
  })

  // ==========================================
  // ÉTAPE 6: CONSULTER LES STATISTIQUES
  // ==========================================
  describe('ÉTAPE 6: Consulter les statistiques', () => {
    beforeEach(() => {
      authStore.user = qualite
      authStore.token = 'jwt-token'
    })

    it('Qualité peut consulter les statistiques globales', async () => {
      crvAPI.getStats.mockResolvedValue({
        data: {
          stats: {
            totalCRV: 500,
            enCours: 45,
            termines: 155,
            valides: 280,
            annules: 20,
            completudeMoyenne: 88.5,
            tauxValidation: 85.7
          }
        }
      })

      await crvStore.getStats({ dateDebut: '2024-01-01', dateFin: '2024-12-31' })

      console.log('\n✅ Étape 6: Statistiques consultées')
      console.log(`   → Total CRV: ${crvStore.stats.totalCRV}`)
      console.log(`   → En cours: ${crvStore.stats.enCours}`)
      console.log(`   → Validés: ${crvStore.stats.valides}`)
      console.log(`   → Annulés: ${crvStore.stats.annules}`)
      console.log(`   → Complétude moyenne: ${crvStore.stats.completudeMoyenne}%`)
      console.log(`   → Taux validation: ${crvStore.stats.tauxValidation}%`)

      expect(crvStore.stats.totalCRV).toBe(500)
      expect(hasPermission(ROLES.QUALITE, ACTIONS.STATS_LIRE)).toBe(true)
    })
  })

  // ==========================================
  // ACTIONS REFUSÉES: TESTS D'ÉCRITURE
  // ==========================================
  describe('ACTIONS REFUSÉES: Toute écriture est bloquée', () => {
    beforeEach(() => {
      authStore.user = qualite
      authStore.token = 'jwt-token'
    })

    it('Étape 7: Création CRV REFUSÉE', () => {
      console.log('\n' + '─'.repeat(55))
      console.log('🚫 ACTIONS REFUSÉES - MODE LECTURE SEULE')
      console.log('─'.repeat(55))

      const canCreate = hasPermission(ROLES.QUALITE, ACTIONS.CRV_CREER)
      const message = getPermissionDeniedMessage(ROLES.QUALITE, ACTIONS.CRV_CREER)

      console.log('\n   ✗ Créer un CRV: REFUSÉ')
      console.log(`   → Message: "${message}"`)

      expect(canCreate).toBe(false)
      expect(message).toBe(PERMISSION_MESSAGES.QUALITE_READ_ONLY)
    })

    it('Étape 8: Modification CRV REFUSÉE', () => {
      const canModify = hasPermission(ROLES.QUALITE, ACTIONS.CRV_MODIFIER)
      const message = getPermissionDeniedMessage(ROLES.QUALITE, ACTIONS.CRV_MODIFIER)

      console.log('\n   ✗ Modifier un CRV: REFUSÉ')
      console.log(`   → Message: "${message}"`)

      expect(canModify).toBe(false)
    })

    it('Étape 9: Validation CRV REFUSÉE', () => {
      const canValidate = hasPermission(ROLES.QUALITE, ACTIONS.CRV_VALIDER)

      console.log('\n   ✗ Valider un CRV: REFUSÉ')

      expect(canValidate).toBe(false)
    })

    it('Étape 10: Suppression CRV REFUSÉE', () => {
      const canDelete = hasPermission(ROLES.QUALITE, ACTIONS.CRV_SUPPRIMER)

      console.log('\n   ✗ Supprimer un CRV: REFUSÉ')

      expect(canDelete).toBe(false)
    })

    it('Toutes les actions phases REFUSÉES', () => {
      console.log('\n   Actions Phases:')
      console.log(`   ✗ Démarrer phase: ${hasPermission(ROLES.QUALITE, ACTIONS.PHASE_DEMARRER) ? 'Autorisé' : 'REFUSÉ'}`)
      console.log(`   ✗ Terminer phase: ${hasPermission(ROLES.QUALITE, ACTIONS.PHASE_TERMINER) ? 'Autorisé' : 'REFUSÉ'}`)

      expect(hasPermission(ROLES.QUALITE, ACTIONS.PHASE_DEMARRER)).toBe(false)
      expect(hasPermission(ROLES.QUALITE, ACTIONS.PHASE_TERMINER)).toBe(false)
    })

    it('Toutes les actions charges REFUSÉES', () => {
      console.log('\n   Actions Charges:')
      console.log(`   ✗ Ajouter charge: ${hasPermission(ROLES.QUALITE, ACTIONS.CHARGE_AJOUTER) ? 'Autorisé' : 'REFUSÉ'}`)

      expect(hasPermission(ROLES.QUALITE, ACTIONS.CHARGE_AJOUTER)).toBe(false)
    })

    it('Toutes les actions programmes REFUSÉES', () => {
      console.log('\n   Actions Programmes:')
      console.log(`   ✗ Créer: ${hasPermission(ROLES.QUALITE, ACTIONS.PROGRAMME_CREER) ? 'Autorisé' : 'REFUSÉ'}`)
      console.log(`   ✗ Valider: ${hasPermission(ROLES.QUALITE, ACTIONS.PROGRAMME_VALIDER) ? 'Autorisé' : 'REFUSÉ'}`)
      console.log(`   ✗ Supprimer: ${hasPermission(ROLES.QUALITE, ACTIONS.PROGRAMME_SUPPRIMER) ? 'Autorisé' : 'REFUSÉ'}`)

      expect(hasPermission(ROLES.QUALITE, ACTIONS.PROGRAMME_CREER)).toBe(false)
      expect(hasPermission(ROLES.QUALITE, ACTIONS.PROGRAMME_VALIDER)).toBe(false)
      expect(hasPermission(ROLES.QUALITE, ACTIONS.PROGRAMME_SUPPRIMER)).toBe(false)
    })

    it('Message d\'erreur approprié pour le rôle Qualité', () => {
      const message = PERMISSION_MESSAGES.QUALITE_READ_ONLY

      console.log('\n   Message d\'erreur standard:')
      console.log(`   → "${message}"`)

      expect(message).toContain('lecture seule')
    })
  })

  // ==========================================
  // SCÉNARIO COMPLET: AUDIT
  // ==========================================
  describe('SCÉNARIO COMPLET: Audit de bout en bout', () => {
    it('devrait effectuer un audit complet en lecture seule', async () => {
      console.log('\n' + '═'.repeat(60))
      console.log('🔄 EXÉCUTION SCÉNARIO COMPLET AUDIT QUALITÉ')
      console.log('═'.repeat(60))

      // 1. LOGIN
      authAPI.login.mockResolvedValue({ data: { token: 'jwt', utilisateur: qualite } })
      await authStore.login({ email: 'test@test.com', password: 'pass' })
      expect(authStore.isQualite).toBe(true)
      console.log('✅ 1. Connexion Qualité (lecture seule)')

      // 2. LISTE CRV
      crvAPI.getAll.mockResolvedValue({
        data: {
          success: true,
          data: { data: mockCRVList, total: 100, page: 1, pages: 10 }
        }
      })
      await crvStore.listCRV({})
      console.log(`✅ 2. Liste CRV consultée (${crvStore.crvList.length} affichés)`)

      // 3. CHARGER CRV
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: mockCRVList[0],
          phases: [{ statut: 'TERMINE' }],
          charges: [{ typeCharge: 'PASSAGERS' }],
          evenements: [],
          observations: [{ contenu: 'RAS' }]
        }
      })
      await crvStore.loadCRV('crv-001')
      console.log(`✅ 3. Détail CRV consulté (${crvStore.currentCRV.numeroCRV})`)

      // 4. STATISTIQUES
      crvAPI.getStats.mockResolvedValue({
        data: { stats: { totalCRV: 500, completudeMoyenne: 88 } }
      })
      await crvStore.getStats({})
      console.log(`✅ 4. Statistiques consultées (${crvStore.stats.totalCRV} CRV)`)

      // 5. VÉRIFIER RESTRICTIONS
      expect(canOperateCRV(ROLES.QUALITE)).toBe(false)
      console.log('✅ 5. Mode lecture seule confirmé')

      console.log('─'.repeat(60))
      console.log('📊 RÉSULTAT: Audit terminé')
      console.log('   → Toutes les données consultées')
      console.log('   → Aucune modification effectuée')
      console.log('═'.repeat(60))
    })
  })
})
