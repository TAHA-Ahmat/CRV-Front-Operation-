/**
 * =====================================================
 * SCÉNARIO COMPLET: CRV DÉPART - AGENT D'ESCALE
 * =====================================================
 *
 * Ce test simule le PARCOURS UTILISATEUR EXACT d'un Agent d'Escale
 * qui traite un vol au départ du début à la fin.
 *
 * VOL: SN205 Dakar DSS → Bruxelles BRU
 * AVION: Airbus A330-300 (290 passagers max)
 *
 * PROGRESSION COMPLÉTUDE:
 * ┌─────────────────────────────────────────────────────┐
 * │ Étape                              │ Complétude     │
 * ├─────────────────────────────────────────────────────┤
 * │ 1. Création CRV                    │  0%            │
 * │ 2. Phase Préparation cabine        │ 10%            │
 * │ 3. Phase Embarquement passagers    │ 25%            │
 * │ 4. Phase Chargement bagages        │ 35%            │
 * │ 5. Phase Chargement fret           │ 45%            │
 * │ 6. Passagers renseignés            │ 60%            │
 * │ 7. Bagages renseignés              │ 72%            │
 * │ 8. Fret renseigné                  │ 82%            │
 * │ 9. Phase Push-back                 │ 88%            │
 * │ 10. Observation ajoutée            │ 95%            │
 * └─────────────────────────────────────────────────────┘
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useCRVStore } from '@/stores/crvStore'
import { ROLES } from '@/config/roles'

// Mock des API
vi.mock('@/services/api', () => ({
  authAPI: {
    login: vi.fn(),
    logout: vi.fn()
  },
  crvAPI: {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    addCharge: vi.fn(),
    addEvenement: vi.fn(),
    addObservation: vi.fn()
  },
  phasesAPI: {
    demarrer: vi.fn(),
    terminer: vi.fn(),
    marquerNonRealise: vi.fn()
  },
  chargesAPI: {
    updateCategoriesDetaillees: vi.fn()
  },
  validationAPI: {
    valider: vi.fn()
  }
}))

import { authAPI, crvAPI, phasesAPI } from '@/services/api'

describe('SCÉNARIO COMPLET: CRV DÉPART - Agent d\'Escale', () => {
  let authStore
  let crvStore

  // ==========================================
  // DONNÉES DU SCÉNARIO
  // ==========================================
  const agent = {
    id: 'agent-002',
    nom: 'Faye',
    prenom: 'Mariama',
    email: 'mariama.faye@airport.sn',
    fonction: ROLES.AGENT_ESCALE,
    matricule: 'AGT-2024-002'
  }

  const volDepart = {
    id: 'vol-sn205',
    numeroVol: 'SN205',
    compagnie: { code: 'SN', nom: 'Brussels Airlines' },
    typeOperation: 'DEPART',
    origine: { code: 'DSS', nom: 'Dakar Blaise Diagne' },
    destination: { code: 'BRU', nom: 'Bruxelles National' },
    avion: { immatriculation: 'OO-SFC', type: 'A333' },
    heuresPrevues: {
      depart: '2024-01-15T23:45:00Z'
    }
  }

  const mockCRVReload = (completude, phases, charges = [], observations = []) => {
    crvAPI.getById.mockResolvedValue({
      data: {
        crv: {
          id: 'crv-dep-001',
          numeroCRV: 'CRV-2024-0025',
          statut: completude >= 80 ? 'TERMINE' : 'EN_COURS',
          completude,
          vol: volDepart
        },
        phases,
        charges,
        evenements: [],
        observations
      }
    })
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    crvStore = useCRVStore()
    vi.clearAllMocks()
  })

  // ==========================================
  // ÉTAPE 1: CONNEXION AGENT
  // ==========================================
  describe('ÉTAPE 1: Connexion Agent de nuit', () => {
    it('Agent Mariama Faye se connecte à 22h00', async () => {
      console.log('\n📋 SCÉNARIO: CRV Départ SN205 DSS→BRU')
      console.log('👤 Agent: Mariama Faye (AGT-2024-002)')
      console.log('✈️  Vol: SN205 - Départ prévu 23h45')
      console.log('─'.repeat(50))

      authAPI.login.mockResolvedValue({
        data: {
          token: 'jwt-agent-token',
          utilisateur: agent
        }
      })

      await authStore.login({
        email: 'mariama.faye@airport.sn',
        password: 'MotDePasse2024!'
      })

      console.log('✅ Étape 1: Connexion réussie')
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.isAgentEscale).toBe(true)
    })
  })

  // ==========================================
  // ÉTAPE 2: CRÉATION CRV DÉPART
  // Complétude: 0%
  // ==========================================
  describe('ÉTAPE 2: Création du CRV Départ', () => {
    beforeEach(() => {
      authStore.user = agent
      authStore.token = 'jwt-token'
    })

    it('Agent crée le CRV pour le vol SN205 → Complétude 0%', async () => {
      const phases = [
        { id: 'p1', nom: 'Préparation cabine', statut: 'NON_DEMARRE', ordre: 1 },
        { id: 'p2', nom: 'Embarquement passagers', statut: 'NON_DEMARRE', ordre: 2 },
        { id: 'p3', nom: 'Chargement bagages', statut: 'NON_DEMARRE', ordre: 3 },
        { id: 'p4', nom: 'Chargement fret', statut: 'NON_DEMARRE', ordre: 4 },
        { id: 'p5', nom: 'Fermeture soutes', statut: 'NON_DEMARRE', ordre: 5 },
        { id: 'p6', nom: 'Push-back', statut: 'NON_DEMARRE', ordre: 6 }
      ]

      crvAPI.create.mockResolvedValue({
        data: {
          id: 'crv-dep-001',
          numeroCRV: 'CRV-2024-0025',
          statut: 'BROUILLON',
          completude: 0,
          vol: volDepart
        }
      })

      mockCRVReload(0, phases)

      await crvStore.createCRV({ volId: 'vol-sn205' })

      console.log('\n✅ Étape 2: CRV Créé')
      console.log(`   → Numéro: ${crvStore.currentCRV.numeroCRV}`)
      console.log(`   → Type: DÉPART`)
      console.log(`   → Phases à traiter: ${crvStore.phases.length}`)
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.currentCRV).toBeDefined()
      expect(crvStore.currentCRV.vol.typeOperation).toBe('DEPART')
      expect(crvStore.completude).toBe(0)
      expect(crvStore.phases).toHaveLength(6)
    })
  })

  // ==========================================
  // ÉTAPES 3-5: PHASES PRÉPARATION
  // Complétude: 0% → 45%
  // ==========================================
  describe('ÉTAPES 3-5: Phases de Préparation', () => {
    beforeEach(() => {
      authStore.user = agent
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        id: 'crv-dep-001',
        statut: 'EN_COURS',
        completude: 0,
        vol: volDepart
      }
      crvStore.phases = [
        { id: 'p1', nom: 'Préparation cabine', statut: 'NON_DEMARRE', ordre: 1 },
        { id: 'p2', nom: 'Embarquement passagers', statut: 'NON_DEMARRE', ordre: 2 },
        { id: 'p3', nom: 'Chargement bagages', statut: 'NON_DEMARRE', ordre: 3 },
        { id: 'p4', nom: 'Chargement fret', statut: 'NON_DEMARRE', ordre: 4 },
        { id: 'p5', nom: 'Fermeture soutes', statut: 'NON_DEMARRE', ordre: 5 },
        { id: 'p6', nom: 'Push-back', statut: 'NON_DEMARRE', ordre: 6 }
      ]
    })

    it('3. Phase Préparation cabine terminée → Complétude 10%', async () => {
      phasesAPI.demarrer.mockResolvedValue({ data: { phase: { id: 'p1', statut: 'EN_COURS' } } })
      phasesAPI.terminer.mockResolvedValue({ data: { phase: { id: 'p1', statut: 'TERMINE' } } })

      mockCRVReload(10, [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'NON_DEMARRE' },
        { id: 'p3', statut: 'NON_DEMARRE' },
        { id: 'p4', statut: 'NON_DEMARRE' },
        { id: 'p5', statut: 'NON_DEMARRE' },
        { id: 'p6', statut: 'NON_DEMARRE' }
      ])

      await crvStore.demarrerPhase('p1')
      await crvStore.terminerPhase('p1')

      console.log('\n✅ Étape 3: Préparation Cabine TERMINÉE')
      console.log('   → Nettoyage, check équipements de sécurité')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.completude).toBe(10)
    })

    it('4. Phase Embarquement terminée → Complétude 25%', async () => {
      crvStore.phases[0].statut = 'TERMINE'
      crvStore.currentCRV.completude = 10

      phasesAPI.demarrer.mockResolvedValue({ data: { phase: { id: 'p2', statut: 'EN_COURS' } } })
      phasesAPI.terminer.mockResolvedValue({
        data: {
          phase: {
            id: 'p2',
            statut: 'TERMINE',
            heureDebut: '2024-01-15T22:45:00Z',
            heureFin: '2024-01-15T23:15:00Z',
            dureeMinutes: 30
          }
        }
      })

      mockCRVReload(25, [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'NON_DEMARRE' },
        { id: 'p4', statut: 'NON_DEMARRE' },
        { id: 'p5', statut: 'NON_DEMARRE' },
        { id: 'p6', statut: 'NON_DEMARRE' }
      ])

      await crvStore.demarrerPhase('p2')
      await crvStore.terminerPhase('p2')

      console.log('\n✅ Étape 4: Embarquement Passagers TERMINÉ')
      console.log('   → Durée: 30 minutes')
      console.log('   → 265 passagers embarqués')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.completude).toBe(25)
    })

    it('5. Phases Chargement bagages + fret terminées → Complétude 45%', async () => {
      crvStore.phases[0].statut = 'TERMINE'
      crvStore.phases[1].statut = 'TERMINE'
      crvStore.currentCRV.completude = 25

      // Chargement bagages
      phasesAPI.demarrer.mockResolvedValueOnce({ data: { phase: { id: 'p3', statut: 'EN_COURS' } } })
      phasesAPI.terminer.mockResolvedValueOnce({ data: { phase: { id: 'p3', statut: 'TERMINE' } } })

      // Chargement fret
      phasesAPI.demarrer.mockResolvedValueOnce({ data: { phase: { id: 'p4', statut: 'EN_COURS' } } })
      phasesAPI.terminer.mockResolvedValueOnce({ data: { phase: { id: 'p4', statut: 'TERMINE' } } })

      mockCRVReload(45, [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' },
        { id: 'p4', statut: 'TERMINE' },
        { id: 'p5', statut: 'NON_DEMARRE' },
        { id: 'p6', statut: 'NON_DEMARRE' }
      ])

      await crvStore.demarrerPhase('p3')
      await crvStore.terminerPhase('p3')
      await crvStore.demarrerPhase('p4')
      await crvStore.terminerPhase('p4')

      console.log('\n✅ Étape 5: Chargement Bagages + Fret TERMINÉ')
      console.log('   → Bagages: 320 pièces chargées')
      console.log('   → Fret: 1.2 tonnes chargées')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.completude).toBe(45)
    })
  })

  // ==========================================
  // ÉTAPES 6-8: SAISIE CHARGES
  // Complétude: 45% → 82%
  // ==========================================
  describe('ÉTAPES 6-8: Saisie des Charges', () => {
    beforeEach(() => {
      authStore.user = agent
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        id: 'crv-dep-001',
        statut: 'EN_COURS',
        completude: 45,
        vol: volDepart
      }
      crvStore.charges = []
    })

    it('6. Agent saisit 265 passagers embarqués → Complétude 60%', async () => {
      const chargePassagers = {
        id: 'charge-pax-001',
        typeCharge: 'PASSAGERS',
        sensOperation: 'EMBARQUEMENT',
        passagersAdultes: 230,
        passagersEnfants: 28,
        passagersBebes: 7,
        total: 265
      }

      crvAPI.addCharge.mockResolvedValue({ data: { charge: chargePassagers } })

      mockCRVReload(60, [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' },
        { id: 'p4', statut: 'TERMINE' },
        { id: 'p5', statut: 'NON_DEMARRE' },
        { id: 'p6', statut: 'NON_DEMARRE' }
      ], [chargePassagers])

      await crvStore.addCharge({
        typeCharge: 'PASSAGERS',
        sensOperation: 'EMBARQUEMENT',
        passagersAdultes: 230,
        passagersEnfants: 28,
        passagersBebes: 7
      })
      // Recharger pour obtenir la complétude calculée par le backend
      await crvStore.loadCRV('crv-dep-001')

      console.log('\n✅ Étape 6: Passagers Saisis')
      console.log('   → Adultes: 230')
      console.log('   → Enfants: 28')
      console.log('   → Bébés: 7')
      console.log('   → TOTAL: 265 passagers')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.completude).toBe(60)
    })

    it('7. Agent saisit 320 bagages embarqués → Complétude 72%', async () => {
      crvStore.charges = [{ id: 'charge-pax-001', typeCharge: 'PASSAGERS' }]
      crvStore.currentCRV.completude = 60

      const chargeBagages = {
        id: 'charge-bag-001',
        typeCharge: 'BAGAGES',
        sensOperation: 'EMBARQUEMENT',
        nombreBagagesSoute: 295,
        poidsBagagesSouteKg: 4720,
        nombreBagagesCabine: 25,
        total: 320
      }

      crvAPI.addCharge.mockResolvedValue({ data: { charge: chargeBagages } })

      mockCRVReload(72, [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' },
        { id: 'p4', statut: 'TERMINE' },
        { id: 'p5', statut: 'NON_DEMARRE' },
        { id: 'p6', statut: 'NON_DEMARRE' }
      ], [
        { id: 'charge-pax-001', typeCharge: 'PASSAGERS' },
        chargeBagages
      ])

      await crvStore.addCharge({
        typeCharge: 'BAGAGES',
        sensOperation: 'EMBARQUEMENT',
        nombreBagagesSoute: 295,
        poidsBagagesSouteKg: 4720,
        nombreBagagesCabine: 25
      })
      // Recharger pour obtenir la complétude calculée par le backend
      await crvStore.loadCRV('crv-dep-001')

      console.log('\n✅ Étape 7: Bagages Saisis')
      console.log('   → Bagages soute: 295 (4720 kg)')
      console.log('   → Bagages cabine: 25')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.completude).toBe(72)
    })

    it('8. Agent saisit 1.2 tonnes de fret → Complétude 82%', async () => {
      crvStore.charges = [
        { id: 'charge-pax-001', typeCharge: 'PASSAGERS' },
        { id: 'charge-bag-001', typeCharge: 'BAGAGES' }
      ]
      crvStore.currentCRV.completude = 72

      const chargeFret = {
        id: 'charge-fret-001',
        typeCharge: 'FRET',
        sensOperation: 'EMBARQUEMENT',
        nombreFret: 45,
        poidsFretKg: 1200
      }

      crvAPI.addCharge.mockResolvedValue({ data: { charge: chargeFret } })

      mockCRVReload(82, [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' },
        { id: 'p4', statut: 'TERMINE' },
        { id: 'p5', statut: 'NON_DEMARRE' },
        { id: 'p6', statut: 'NON_DEMARRE' }
      ], [
        { id: 'charge-pax-001', typeCharge: 'PASSAGERS' },
        { id: 'charge-bag-001', typeCharge: 'BAGAGES' },
        chargeFret
      ])

      await crvStore.addCharge({
        typeCharge: 'FRET',
        sensOperation: 'EMBARQUEMENT',
        nombreFret: 45,
        poidsFretKg: 1200
      })
      // Recharger pour obtenir la complétude calculée par le backend
      await crvStore.loadCRV('crv-dep-001')

      console.log('\n✅ Étape 8: Fret Saisi')
      console.log('   → Colis: 45')
      console.log('   → Poids: 1200 kg (1.2 tonnes)')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)
      console.log('   🎯 SEUIL 80% ATTEINT!')

      expect(crvStore.completude).toBe(82)
      expect(crvStore.isCompleteEnough).toBe(true)
    })
  })

  // ==========================================
  // ÉTAPES 9-10: FINALISATION
  // Complétude: 82% → 95%
  // ==========================================
  describe('ÉTAPES 9-10: Finalisation', () => {
    beforeEach(() => {
      authStore.user = agent
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        id: 'crv-dep-001',
        statut: 'EN_COURS',
        completude: 82,
        vol: volDepart
      }
      crvStore.phases = [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' },
        { id: 'p4', statut: 'TERMINE' },
        { id: 'p5', nom: 'Fermeture soutes', statut: 'NON_DEMARRE' },
        { id: 'p6', nom: 'Push-back', statut: 'NON_DEMARRE' }
      ]
      crvStore.observations = []
    })

    it('9. Fermeture soutes + Push-back → Complétude 88%', async () => {
      phasesAPI.demarrer.mockResolvedValue({ data: { phase: { statut: 'EN_COURS' } } })
      phasesAPI.terminer.mockResolvedValue({ data: { phase: { statut: 'TERMINE' } } })

      mockCRVReload(88, [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' },
        { id: 'p4', statut: 'TERMINE' },
        { id: 'p5', statut: 'TERMINE' },
        { id: 'p6', statut: 'TERMINE' }
      ], [
        { typeCharge: 'PASSAGERS' },
        { typeCharge: 'BAGAGES' },
        { typeCharge: 'FRET' }
      ])

      await crvStore.demarrerPhase('p5')
      await crvStore.terminerPhase('p5')
      await crvStore.demarrerPhase('p6')
      await crvStore.terminerPhase('p6')

      console.log('\n✅ Étape 9: Push-back TERMINÉ')
      console.log('   → Portes fermées')
      console.log('   → Avion repoussé à 23h42')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.completude).toBe(88)
    })

    it('10. Observation de clôture → Complétude 95%', async () => {
      crvStore.phases.forEach(p => p.statut = 'TERMINE')
      crvStore.currentCRV.completude = 88

      const observation = {
        id: 'obs-001',
        categorie: 'GENERALE',
        contenu: 'Vol SN205 parti à l\'heure. Embarquement fluide. Fret complet chargé.',
        auteur: agent
      }

      crvAPI.addObservation.mockResolvedValue({ data: { observation } })

      mockCRVReload(95, [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' },
        { id: 'p4', statut: 'TERMINE' },
        { id: 'p5', statut: 'TERMINE' },
        { id: 'p6', statut: 'TERMINE' }
      ], [
        { typeCharge: 'PASSAGERS' },
        { typeCharge: 'BAGAGES' },
        { typeCharge: 'FRET' }
      ], [observation])

      await crvStore.addObservation({
        categorie: 'GENERALE',
        contenu: 'Vol SN205 parti à l\'heure. Embarquement fluide. Fret complet chargé.'
      })
      // Recharger pour obtenir la complétude calculée par le backend
      await crvStore.loadCRV('crv-dep-001')

      console.log('\n✅ Étape 10: Observation Ajoutée')
      console.log(`   📊 COMPLÉTUDE FINALE: ${crvStore.completude}%`)

      expect(crvStore.completude).toBe(95)
    })
  })

  // ==========================================
  // RÉCAPITULATIF FINAL
  // ==========================================
  describe('RÉCAPITULATIF: CRV Départ Terminé', () => {
    beforeEach(() => {
      authStore.user = agent
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        id: 'crv-dep-001',
        numeroCRV: 'CRV-2024-0025',
        statut: 'TERMINE',
        completude: 95,
        vol: volDepart
      }
    })

    it('CRV DÉPART complet - Prêt pour validation', () => {
      console.log('\n' + '═'.repeat(55))
      console.log('📋 RÉCAPITULATIF CRV DÉPART SN205')
      console.log('═'.repeat(55))
      console.log(`Numéro: ${crvStore.currentCRV.numeroCRV}`)
      console.log(`Vol: SN205 (DSS → BRU)`)
      console.log(`Type: DÉPART`)
      console.log(`Heure départ effective: 23h42`)
      console.log('─'.repeat(55))
      console.log('CHARGES:')
      console.log('   ✅ Passagers: 265 (230 adultes, 28 enfants, 7 bébés)')
      console.log('   ✅ Bagages: 320 pièces (4720 kg)')
      console.log('   ✅ Fret: 45 colis (1200 kg)')
      console.log('─'.repeat(55))
      console.log('PHASES: 6/6 terminées')
      console.log('─'.repeat(55))
      console.log(`📊 COMPLÉTUDE: ${crvStore.completude}%`)
      console.log(`🎯 ÉLIGIBLE VALIDATION: ${crvStore.isCompleteEnough ? 'OUI ✓' : 'NON ✗'}`)
      console.log('═'.repeat(55))

      expect(crvStore.completude).toBe(95)
      expect(crvStore.isCompleteEnough).toBe(true)
    })
  })

  // ==========================================
  // SCÉNARIO COMPLET
  // ==========================================
  describe('SCÉNARIO COMPLET: Du Login au Push-back', () => {
    it('devrait exécuter le workflow DÉPART complet', async () => {
      console.log('\n' + '═'.repeat(60))
      console.log('🔄 EXÉCUTION SCÉNARIO COMPLET CRV DÉPART')
      console.log('═'.repeat(60))

      // 1. LOGIN
      authAPI.login.mockResolvedValue({ data: { token: 'jwt', utilisateur: agent } })
      await authStore.login({ email: 'test@test.com', password: 'pass' })
      expect(authStore.isAuthenticated).toBe(true)
      console.log('✅ 1. Connexion Agent')

      // 2. CRÉATION (0%)
      crvAPI.create.mockResolvedValue({
        data: { id: 'crv-001', completude: 0, vol: volDepart }
      })
      mockCRVReload(0, [
        { id: 'p1', statut: 'NON_DEMARRE' },
        { id: 'p2', statut: 'NON_DEMARRE' },
        { id: 'p3', statut: 'NON_DEMARRE' },
        { id: 'p4', statut: 'NON_DEMARRE' }
      ])
      await crvStore.createCRV({ volId: 'vol-001' })
      console.log('✅ 2. CRV Créé → 0%')

      // 3-5. PHASES (→ 40%)
      phasesAPI.demarrer.mockResolvedValue({ data: { phase: { statut: 'EN_COURS' } } })
      phasesAPI.terminer.mockResolvedValue({ data: { phase: { statut: 'TERMINE' } } })
      mockCRVReload(40, [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' },
        { id: 'p4', statut: 'TERMINE' }
      ])
      for (let i = 1; i <= 4; i++) {
        await crvStore.demarrerPhase(`p${i}`)
        await crvStore.terminerPhase(`p${i}`)
      }
      console.log('✅ 3-5. Phases terminées → 40%')

      // 6. PASSAGERS (→ 55%)
      crvAPI.addCharge.mockResolvedValue({ data: { charge: { typeCharge: 'PASSAGERS' } } })
      mockCRVReload(55, [], [{ typeCharge: 'PASSAGERS' }])
      await crvStore.addCharge({ typeCharge: 'PASSAGERS', passagersAdultes: 230 })
      await crvStore.loadCRV('crv-001')
      console.log('✅ 6. Passagers → 55%')

      // 7. BAGAGES (→ 70%)
      crvAPI.addCharge.mockResolvedValue({ data: { charge: { typeCharge: 'BAGAGES' } } })
      mockCRVReload(70, [], [{ typeCharge: 'PASSAGERS' }, { typeCharge: 'BAGAGES' }])
      await crvStore.addCharge({ typeCharge: 'BAGAGES', nombreBagagesSoute: 295 })
      await crvStore.loadCRV('crv-001')
      console.log('✅ 7. Bagages → 70%')

      // 8. FRET (→ 82%)
      crvAPI.addCharge.mockResolvedValue({ data: { charge: { typeCharge: 'FRET' } } })
      mockCRVReload(82, [], [
        { typeCharge: 'PASSAGERS' },
        { typeCharge: 'BAGAGES' },
        { typeCharge: 'FRET' }
      ])
      await crvStore.addCharge({ typeCharge: 'FRET', poidsFretKg: 1200 })
      await crvStore.loadCRV('crv-001')
      console.log('✅ 8. Fret → 82% (SEUIL ATTEINT)')

      // 9. OBSERVATION (→ 90%)
      crvAPI.addObservation.mockResolvedValue({ data: { observation: { id: 'o1' } } })
      mockCRVReload(90, [], [], [{ id: 'o1' }])
      await crvStore.addObservation({ categorie: 'GENERALE', contenu: 'RAS' })
      await crvStore.loadCRV('crv-001')
      console.log('✅ 9. Observation → 90%')

      console.log('─'.repeat(60))
      console.log(`📊 COMPLÉTUDE FINALE: ${crvStore.completude}%`)
      console.log(`🎯 ÉLIGIBLE VALIDATION: ${crvStore.isCompleteEnough ? 'OUI ✓' : 'NON ✗'}`)
      console.log('═'.repeat(60))

      expect(crvStore.isCompleteEnough).toBe(true)
    })
  })
})
