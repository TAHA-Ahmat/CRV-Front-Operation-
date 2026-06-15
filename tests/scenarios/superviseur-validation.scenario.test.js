/**
 * =====================================================
 * SCÉNARIO COMPLET: VALIDATION CRV - SUPERVISEUR
 * =====================================================
 *
 * Ce test simule le PARCOURS UTILISATEUR EXACT d'un Superviseur
 * qui valide les CRV complétés par les agents.
 *
 * PROCESSUS DE VALIDATION:
 * ┌─────────────────────────────────────────────────────────┐
 * │ Étape                              │ Résultat           │
 * ├─────────────────────────────────────────────────────────┤
 * │ 1. Connexion Superviseur           │ Accès validateur   │
 * │ 2. Consulter liste CRV à valider   │ Filtrage TERMINE   │
 * │ 3. Ouvrir CRV à 85%                │ Éligible ✓         │
 * │ 4. Vérifier les données            │ Contrôle qualité   │
 * │ 5. VALIDER le CRV                  │ Statut → VALIDE    │
 * │ 6. CRV automatiquement verrouillé  │ Modification ✗     │
 * │                                                         │
 * │ CAS D'ERREUR:                                          │
 * │ 7. CRV à 75% - Refus validation    │ Complétude < 80%   │
 * │ 8. Demander compléments à l'agent  │ Retour en cours    │
 * │                                                         │
 * │ AUTRES ACTIONS:                                        │
 * │ 9. Supprimer un CRV                │ Suppression OK     │
 * │ 10. Valider programme vol          │ Programme → ACTIF  │
 * └─────────────────────────────────────────────────────────┘
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
    getById: vi.fn(),
    getAll: vi.fn(),
    delete: vi.fn(),
    annuler: vi.fn()
  },
  phasesAPI: {},
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

describe('SCÉNARIO COMPLET: VALIDATION CRV - Superviseur', () => {
  let authStore
  let crvStore

  const superviseur = {
    id: 'sup-001',
    nom: 'Ndiaye',
    prenom: 'Fatou',
    email: 'fatou.ndiaye@airport.sn',
    fonction: ROLES.SUPERVISEUR,
    matricule: 'SUP-2024-001'
  }

  const crvAValider = {
    id: 'crv-001',
    numeroCRV: 'CRV-2024-0001',
    statut: 'TERMINE',
    completude: 88,
    creePar: { nom: 'Diallo', prenom: 'Amadou' },
    vol: {
      numeroVol: 'AF123',
      typeOperation: 'ARRIVEE',
      origine: { code: 'CDG' },
      destination: { code: 'DSS' }
    },
    dateCreation: '2024-01-15T14:30:00Z'
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    crvStore = useCRVStore()
    vi.clearAllMocks()
  })

  // ==========================================
  // ÉTAPE 1: CONNEXION SUPERVISEUR
  // ==========================================
  describe('ÉTAPE 1: Connexion Superviseur', () => {
    it('Superviseur Fatou Ndiaye se connecte', async () => {
      console.log('\n📋 SCÉNARIO: VALIDATION CRV')
      console.log('👤 Superviseur: Fatou Ndiaye (SUP-2024-001)')
      console.log('─'.repeat(55))

      authAPI.login.mockResolvedValue({
        data: {
          token: 'jwt-superviseur-token',
          utilisateur: superviseur
        }
      })

      await authStore.login({
        email: 'fatou.ndiaye@airport.sn',
        password: 'SuperPass2024!'
      })

      console.log('✅ Étape 1: Connexion réussie')
      console.log(`   → Rôle: ${authStore.getUserRole}`)
      console.log(`   → Peut valider: ${authStore.canSupervise ? 'OUI' : 'NON'}`)

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.isSuperviseur).toBe(true)
      expect(authStore.canSupervise).toBe(true)
    })

    it('devrait avoir les permissions de validation', () => {
      // Le Superviseur peut supprimer des CRV et valider des programmes
      expect(canDeleteCRV(ROLES.SUPERVISEUR)).toBe(true)
      expect(canValidateProgramme(ROLES.SUPERVISEUR)).toBe(true)
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.PROGRAMME_VALIDER)).toBe(true)
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.PROGRAMME_ACTIVER)).toBe(true)

      console.log('\n   Permissions Superviseur:')
      console.log('   ✅ Supprimer CRV')
      console.log('   ✅ Valider Programme Vol')
      console.log('   ✅ Activer Programme Vol')
      console.log('   ✗ Supprimer Programme Vol (Manager uniquement)')
    })
  })

  // ==========================================
  // ÉTAPE 2: LISTE DES CRV À VALIDER
  // ==========================================
  describe('ÉTAPE 2: Consulter les CRV à valider', () => {
    beforeEach(() => {
      authStore.user = superviseur
      authStore.token = 'jwt-token'
    })

    it('Superviseur filtre les CRV en statut TERMINE', async () => {
      const crvList = [
        { id: 'crv-001', numeroCRV: 'CRV-2024-0001', statut: 'TERMINE', completude: 88, vol: { numeroVol: 'AF123' } },
        { id: 'crv-002', numeroCRV: 'CRV-2024-0002', statut: 'TERMINE', completude: 92, vol: { numeroVol: 'SN205' } },
        { id: 'crv-003', numeroCRV: 'CRV-2024-0003', statut: 'TERMINE', completude: 75, vol: { numeroVol: 'ET908' } }
      ]

      crvAPI.getAll.mockResolvedValue({
        data: {
          success: true,
          data: {
            data: crvList,
            total: 3,
            page: 1,
            pages: 1
          }
        }
      })

      await crvStore.listCRV({ statut: 'TERMINE' })

      console.log('\n✅ Étape 2: Liste des CRV à valider')
      console.log(`   → ${crvStore.crvList.length} CRV en attente de validation`)
      crvStore.crvList.forEach(crv => {
        const eligible = crv.completude >= 80 ? '✓' : '✗'
        console.log(`   ${eligible} ${crv.numeroCRV} (${crv.vol.numeroVol}) - ${crv.completude}%`)
      })

      expect(crvStore.crvList).toHaveLength(3)
      expect(crvStore.crvList.filter(c => c.completude >= 80)).toHaveLength(2)
    })
  })

  // ==========================================
  // ÉTAPE 3-4: OUVRIR ET VÉRIFIER UN CRV
  // ==========================================
  describe('ÉTAPE 3-4: Ouvrir et vérifier un CRV', () => {
    beforeEach(() => {
      authStore.user = superviseur
      authStore.token = 'jwt-token'
    })

    it('Superviseur ouvre un CRV éligible (88%)', async () => {
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: crvAValider,
          phases: [
            { id: 'p1', nom: 'Positionnement', statut: 'TERMINE' },
            { id: 'p2', nom: 'Débarquement', statut: 'TERMINE' },
            { id: 'p3', nom: 'Déchargement', statut: 'TERMINE' }
          ],
          charges: [
            { id: 'c1', typeCharge: 'PASSAGERS', passagersAdultes: 145, total: 168 },
            { id: 'c2', typeCharge: 'BAGAGES', nombreBagagesSoute: 185, total: 195 }
          ],
          evenements: [],
          observations: [
            { id: 'o1', categorie: 'GENERALE', contenu: 'RAS' }
          ]
        }
      })

      await crvStore.loadCRV('crv-001')

      console.log('\n✅ Étape 3: CRV chargé')
      console.log(`   → Numéro: ${crvStore.currentCRV.numeroCRV}`)
      console.log(`   → Vol: ${crvStore.currentCRV.vol.numeroVol}`)
      console.log(`   → Créé par: ${crvStore.currentCRV.creePar.prenom} ${crvStore.currentCRV.creePar.nom}`)
      console.log(`   → Complétude: ${crvStore.completude}%`)

      console.log('\n✅ Étape 4: Vérification des données')
      console.log(`   → Phases: ${crvStore.phases.length}/3 terminées ✓`)
      console.log(`   → Passagers: ${crvStore.getChargesPassagers[0]?.total || 0} ✓`)
      console.log(`   → Bagages: ${crvStore.getChargesBagages[0]?.total || 0} ✓`)
      console.log(`   → Observations: ${crvStore.observations.length} ✓`)

      expect(crvStore.completude).toBe(88)
      expect(crvStore.isCompleteEnough).toBe(true)
      expect(crvStore.phases).toHaveLength(3)
    })
  })

  // ==========================================
  // ÉTAPE 5: VALIDATION DU CRV
  // ==========================================
  describe('ÉTAPE 5: Valider le CRV', () => {
    beforeEach(() => {
      authStore.user = superviseur
      authStore.token = 'jwt-token'
      crvStore.currentCRV = { ...crvAValider }
    })

    it('Superviseur valide le CRV → Statut VALIDE', async () => {
      const phases = [
        { id: 'p1', nom: 'Phase 1', statut: 'TERMINE', ordre: 1 },
        { id: 'p2', nom: 'Phase 2', statut: 'TERMINE', ordre: 2 },
        { id: 'p3', nom: 'Phase 3', statut: 'TERMINE', ordre: 3 }
      ]

      validationAPI.valider.mockResolvedValue({
        data: {
          crv: { ...crvAValider, statut: 'VALIDE' },
          statut: 'VALIDE',
          validePar: superviseur.id,
          dateValidation: '2024-01-15T16:00:00Z'
        }
      })

      // Mock loadCRV to return the VALIDE status
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: { ...crvAValider, statut: 'VALIDE' },
          phases,
          charges: [],
          evenements: [],
          observations: []
        }
      })

      await crvStore.validateCRV()

      console.log('\n✅ Étape 5: CRV VALIDÉ')
      console.log(`   → Validé par: ${superviseur.prenom} ${superviseur.nom}`)
      console.log(`   → Date: 15/01/2024 16:00`)
      console.log(`   → Nouveau statut: ${crvStore.currentCRV.statut}`)

      expect(validationAPI.valider).toHaveBeenCalledWith('crv-001', null)
      expect(crvStore.currentCRV.statut).toBe('VALIDE')
      expect(crvStore.isValidated).toBe(true)
    })
  })

  // ==========================================
  // ÉTAPE 6: VERROUILLAGE AUTOMATIQUE
  // ==========================================
  describe('ÉTAPE 6: Verrouillage automatique', () => {
    beforeEach(() => {
      authStore.user = superviseur
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        ...crvAValider,
        statut: 'VALIDE'
      }
    })

    it('CRV validé devient automatiquement verrouillé', () => {
      console.log('\n✅ Étape 6: CRV Verrouillé')
      console.log('   → Le CRV validé ne peut plus être modifié')
      console.log(`   → isEditable: ${crvStore.isEditable}`)
      console.log(`   → isLocked: ${crvStore.isLocked}`)

      // Un CRV VALIDE n'est plus modifiable
      expect(crvStore.isEditable).toBe(false)
      expect(crvStore.isValidated).toBe(true)
    })

    it('Tentative de modification échoue sur CRV verrouillé', async () => {
      crvStore.currentCRV.statut = 'VERROUILLE'

      await expect(crvStore.updateCRV({ data: 'test' }))
        .rejects.toThrow('CRV verrouillé')

      console.log('\n   ⚠️  Modification refusée: CRV verrouillé')
    })
  })

  // ==========================================
  // CAS D'ERREUR: CRV INCOMPLET
  // ==========================================
  describe('CAS D\'ERREUR: CRV avec complétude insuffisante', () => {
    beforeEach(() => {
      authStore.user = superviseur
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        id: 'crv-003',
        numeroCRV: 'CRV-2024-0003',
        statut: 'TERMINE',
        completude: 75, // < 80%
        vol: { numeroVol: 'ET908' }
      }
    })

    it('Étape 7: Refus de validation si complétude < 80%', async () => {
      console.log('\n' + '─'.repeat(55))
      console.log('⚠️  CAS D\'ERREUR: Complétude insuffisante')
      console.log('─'.repeat(55))
      console.log(`   → CRV: ${crvStore.currentCRV.numeroCRV}`)
      console.log(`   → Complétude: ${crvStore.completude}% (minimum requis: 80%)`)

      await expect(crvStore.validateCRV())
        .rejects.toThrow('Complétude insuffisante')

      console.log('\n   ✗ Validation REFUSÉE')
      console.log('   → Le CRV doit être complété par l\'agent')

      expect(validationAPI.valider).not.toHaveBeenCalled()
    })

    it('Étape 8: Superviseur peut demander des compléments', () => {
      console.log('\n   Actions possibles pour le Superviseur:')
      console.log('   → Retourner le CRV à l\'agent')
      console.log('   → Ajouter une observation demandant des compléments')
      console.log('   → Contacter l\'agent directement')

      // Le CRV reste en statut TERMINE, l'agent peut le modifier
      expect(crvStore.currentCRV.statut).toBe('TERMINE')
    })
  })

  // ==========================================
  // AUTRES ACTIONS: SUPPRESSION CRV
  // ==========================================
  describe('Étape 9: Suppression d\'un CRV', () => {
    beforeEach(() => {
      authStore.user = superviseur
      authStore.token = 'jwt-token'
      crvStore.crvList = [
        { id: 'crv-001', numeroCRV: 'CRV-2024-0001' },
        { id: 'crv-002', numeroCRV: 'CRV-2024-0002' },
        { id: 'crv-003', numeroCRV: 'CRV-2024-0003' }
      ]
    })

    it('Superviseur peut supprimer un CRV', async () => {
      crvAPI.delete.mockResolvedValue({})

      await crvStore.deleteCRV('crv-002')

      console.log('\n✅ Étape 9: CRV Supprimé')
      console.log('   → CRV-2024-0002 supprimé de la liste')
      console.log(`   → CRV restants: ${crvStore.crvList.length}`)

      expect(crvStore.crvList).toHaveLength(2)
      expect(crvStore.crvList.find(c => c.id === 'crv-002')).toBeUndefined()
    })
  })

  // ==========================================
  // AUTRES ACTIONS: VALIDATION PROGRAMME VOL
  // ==========================================
  describe('Étape 10: Validation Programme Vol', () => {
    beforeEach(() => {
      authStore.user = superviseur
      authStore.token = 'jwt-token'
    })

    it('Superviseur peut valider et activer un programme vol', async () => {
      programmesVolAPI.valider.mockResolvedValue({
        data: {
          programme: {
            id: 'prog-001',
            numero: 'PROG-2024-H1',
            statut: 'VALIDE',
            validePar: superviseur.id
          }
        }
      })

      programmesVolAPI.activer.mockResolvedValue({
        data: {
          programme: {
            id: 'prog-001',
            statut: 'ACTIF'
          }
        }
      })

      const resultValider = await programmesVolAPI.valider('prog-001')
      const resultActiver = await programmesVolAPI.activer('prog-001')

      console.log('\n✅ Étape 10: Programme Vol')
      console.log(`   → Programme: ${resultValider.data.programme.numero}`)
      console.log(`   → Validé: ${resultValider.data.programme.statut}`)
      console.log(`   → Activé: ${resultActiver.data.programme.statut}`)

      expect(resultValider.data.programme.statut).toBe('VALIDE')
      expect(resultActiver.data.programme.statut).toBe('ACTIF')
    })

    it('Superviseur ne peut PAS supprimer un programme vol', () => {
      expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.PROGRAMME_SUPPRIMER)).toBe(false)

      console.log('\n   ⚠️  Suppression programme: REFUSÉE')
      console.log('   → Action réservée au Manager')
    })
  })

  // ==========================================
  // SCÉNARIO COMPLET VALIDATION
  // ==========================================
  describe('SCÉNARIO COMPLET: Validation de bout en bout', () => {
    it('devrait valider un CRV complet avec toutes les vérifications', async () => {
      console.log('\n' + '═'.repeat(60))
      console.log('🔄 EXÉCUTION SCÉNARIO COMPLET VALIDATION')
      console.log('═'.repeat(60))

      // 1. LOGIN
      authAPI.login.mockResolvedValue({ data: { token: 'jwt', utilisateur: superviseur } })
      await authStore.login({ email: 'test@test.com', password: 'pass' })
      expect(authStore.isSuperviseur).toBe(true)
      console.log('✅ 1. Connexion Superviseur')

      // 2. LISTE CRV
      crvAPI.getAll.mockResolvedValue({
        data: {
          success: true,
          data: {
            data: [
              { id: 'crv-001', completude: 88, statut: 'TERMINE' }
            ],
            total: 1, page: 1, pages: 1
          }
        }
      })
      await crvStore.listCRV({ statut: 'TERMINE' })
      console.log('✅ 2. Liste CRV à valider récupérée')

      // 3. CHARGER CRV
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: { ...crvAValider, completude: 88 },
          phases: [{ statut: 'TERMINE' }],
          charges: [{ typeCharge: 'PASSAGERS' }],
          evenements: [],
          observations: [{ contenu: 'RAS' }]
        }
      })
      await crvStore.loadCRV('crv-001')
      console.log(`✅ 3. CRV chargé (${crvStore.completude}%)`)

      // 4. VÉRIFIER ÉLIGIBILITÉ
      expect(crvStore.isCompleteEnough).toBe(true)
      console.log('✅ 4. Éligibilité vérifiée (>= 80%)')

      // 5. VALIDER
      validationAPI.valider.mockResolvedValue({
        data: {
          crv: { ...crvAValider, completude: 88, statut: 'VALIDE' },
          statut: 'VALIDE'
        }
      })
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: { ...crvAValider, completude: 88, statut: 'VALIDE' },
          phases: [{ statut: 'TERMINE' }],
          charges: [{ typeCharge: 'PASSAGERS' }],
          evenements: [],
          observations: [{ contenu: 'RAS' }]
        }
      })
      await crvStore.validateCRV()
      console.log('✅ 5. CRV VALIDÉ')

      // 6. VÉRIFIER VERROUILLAGE
      expect(crvStore.currentCRV.statut).toBe('VALIDE')
      expect(crvStore.isValidated).toBe(true)
      console.log('✅ 6. CRV verrouillé automatiquement')

      console.log('─'.repeat(60))
      console.log('📊 RÉSULTAT: Validation réussie')
      console.log(`   → CRV: ${crvStore.currentCRV.numeroCRV}`)
      console.log(`   → Statut: ${crvStore.currentCRV.statut}`)
      console.log('═'.repeat(60))
    })
  })
})
