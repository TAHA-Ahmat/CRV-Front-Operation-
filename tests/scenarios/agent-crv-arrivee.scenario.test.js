/**
 * =====================================================
 * SCÉNARIO COMPLET: CRV ARRIVÉE - AGENT D'ESCALE
 * =====================================================
 *
 * Ce test simule le PARCOURS UTILISATEUR EXACT d'un Agent d'Escale
 * qui traite un vol en arrivée du début à la fin.
 *
 * VOL: AF123 Paris CDG → Dakar DSS
 * AVION: Boeing 737-800 (180 passagers max)
 *
 * PROGRESSION COMPLÉTUDE:
 * ┌─────────────────────────────────────────────────────┐
 * │ Étape                              │ Complétude     │
 * ├─────────────────────────────────────────────────────┤
 * │ 1. Création CRV                    │  0%            │
 * │ 2. Phase Positionnement terminée   │ 10%            │
 * │ 3. Phase Débarquement terminée     │ 25%            │
 * │ 4. Phase Déchargement terminée     │ 40%            │
 * │ 5. Passagers renseignés            │ 55%            │
 * │ 6. Bagages renseignés              │ 70%            │
 * │ 7. Fret renseigné (ou N/A)         │ 80%            │
 * │ 8. Observation ajoutée             │ 90%            │
 * │ 9. CRV terminé prêt validation     │ 90%            │
 * └─────────────────────────────────────────────────────┘
 */

import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useCRVStore } from '@/stores/crvStore'
import { ROLES } from '@/config/roles'
import { canValidateProgramme } from '@/utils/permissions'

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
    addCharge: vi.fn(),
    addEvenement: vi.fn(),
    addObservation: vi.fn()
  },
  phasesAPI: {
    demarrer: vi.fn(),
    terminer: vi.fn()
  },
  chargesAPI: {
    updateCategoriesDetaillees: vi.fn()
  },
  validationAPI: {
    valider: vi.fn()
  }
}))

import { authAPI, crvAPI, phasesAPI, validationAPI } from '@/services/api'

describe('SCÉNARIO COMPLET: CRV ARRIVÉE - Agent d\'Escale', () => {
  let authStore
  let crvStore

  // ==========================================
  // DONNÉES DU SCÉNARIO
  // ==========================================
  const agent = {
    id: 'agent-001',
    nom: 'Diallo',
    prenom: 'Amadou',
    email: 'amadou.diallo@airport.sn',
    fonction: ROLES.AGENT_ESCALE,
    matricule: 'AGT-2024-001'
  }

  const volArrivee = {
    id: 'vol-af123',
    numeroVol: 'AF123',
    compagnie: { code: 'AF', nom: 'Air France' },
    typeOperation: 'ARRIVEE',
    origine: { code: 'CDG', nom: 'Paris Charles de Gaulle' },
    destination: { code: 'DSS', nom: 'Dakar Blaise Diagne' },
    avion: { immatriculation: 'F-GZHA', type: 'B738' },
    heuresPrevues: {
      arrivee: '2024-01-15T14:30:00Z'
    }
  }

  // Helper pour simuler le rechargement du CRV avec nouvelle complétude
  const mockCRVReload = (completude, phases, charges = [], observations = []) => {
    crvAPI.getById.mockResolvedValue({
      data: {
        crv: {
          id: 'crv-arr-001',
          numeroCRV: 'CRV-2024-0001',
          statut: completude >= 80 ? 'TERMINE' : 'EN_COURS',
          completude,
          vol: volArrivee
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
  // Complétude: N/A (pas encore de CRV)
  // ==========================================
  describe('ÉTAPE 1: Connexion de l\'Agent d\'Escale', () => {
    it('Agent Amadou Diallo se connecte à 14h00', async () => {
      console.log('\n📋 SCÉNARIO: CRV Arrivée AF123 CDG→DSS')
      console.log('👤 Agent: Amadou Diallo (AGT-2024-001)')
      console.log('✈️  Vol: AF123 - Arrivée prévue 14h30')
      console.log('─'.repeat(50))

      authAPI.login.mockResolvedValue({
        data: {
          token: 'jwt-agent-token-12345',
          utilisateur: agent,
          doitChangerMotDePasse: false
        }
      })

      await authStore.login({
        email: 'amadou.diallo@airport.sn',
        password: 'MonMotDePasse2024!'
      })

      console.log('✅ Étape 1: Connexion réussie')
      console.log(`   → Utilisateur: ${authStore.getUserFullName}`)
      console.log(`   → Rôle: ${authStore.getUserRole}`)

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.getUserRole).toBe(ROLES.AGENT_ESCALE)
      expect(authStore.isAgentEscale).toBe(true)
      expect(authStore.getUserFullName).toBe('Amadou Diallo')
    })
  })

  // ==========================================
  // ÉTAPE 2: CRÉATION DU CRV
  // Complétude: 0%
  // ==========================================
  describe('ÉTAPE 2: Création du CRV Arrivée', () => {
    beforeEach(async () => {
      authStore.user = agent
      authStore.token = 'jwt-token'
    })

    it('Agent crée le CRV pour le vol AF123 → Complétude 0%', async () => {
      const phases = [
        { id: 'p1', nom: 'Positionnement passerelle', statut: 'NON_DEMARRE', ordre: 1 },
        { id: 'p2', nom: 'Calage avion', statut: 'NON_DEMARRE', ordre: 2 },
        { id: 'p3', nom: 'Débarquement passagers', statut: 'NON_DEMARRE', ordre: 3 },
        { id: 'p4', nom: 'Déchargement bagages', statut: 'NON_DEMARRE', ordre: 4 },
        { id: 'p5', nom: 'Déchargement fret', statut: 'NON_DEMARRE', ordre: 5 }
      ]

      crvAPI.create.mockResolvedValue({
        data: {
          id: 'crv-arr-001',
          numeroCRV: 'CRV-2024-0001',
          statut: 'BROUILLON',
          completude: 0,
          vol: volArrivee
        }
      })

      mockCRVReload(0, phases)

      await crvStore.createCRV({ volId: 'vol-af123' })

      console.log('\n✅ Étape 2: CRV Créé')
      console.log(`   → Numéro: ${crvStore.currentCRV.numeroCRV}`)
      console.log(`   → Type: ${crvStore.currentCRV.vol.typeOperation}`)
      console.log(`   → Phases à traiter: ${crvStore.phases.length}`)
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.currentCRV).toBeDefined()
      expect(crvStore.currentCRV.numeroCRV).toBe('CRV-2024-0001')
      expect(crvStore.completude).toBe(0)
      expect(crvStore.phases).toHaveLength(5)
    })
  })

  // ==========================================
  // ÉTAPE 3: PHASE POSITIONNEMENT PASSERELLE
  // Complétude: 0% → 10%
  // ==========================================
  describe('ÉTAPE 3: Phase Positionnement Passerelle', () => {
    beforeEach(() => {
      authStore.user = agent
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        id: 'crv-arr-001',
        numeroCRV: 'CRV-2024-0001',
        statut: 'EN_COURS',
        completude: 0,
        vol: volArrivee
      }
      crvStore.phases = [
        { id: 'p1', nom: 'Positionnement passerelle', statut: 'NON_DEMARRE', ordre: 1 },
        { id: 'p2', nom: 'Calage avion', statut: 'NON_DEMARRE', ordre: 2 },
        { id: 'p3', nom: 'Débarquement passagers', statut: 'NON_DEMARRE', ordre: 3 },
        { id: 'p4', nom: 'Déchargement bagages', statut: 'NON_DEMARRE', ordre: 4 },
        { id: 'p5', nom: 'Déchargement fret', statut: 'NON_DEMARRE', ordre: 5 }
      ]
    })

    it('3a. Agent démarre la phase à 14h32 (avion positionné)', async () => {
      phasesAPI.demarrer.mockResolvedValue({
        data: {
          phase: {
            id: 'p1',
            nom: 'Positionnement passerelle',
            statut: 'EN_COURS',
            heureDebut: '2024-01-15T14:32:00Z'
          }
        }
      })

      const phases = [
        { id: 'p1', nom: 'Positionnement passerelle', statut: 'EN_COURS', ordre: 1 },
        { id: 'p2', nom: 'Calage avion', statut: 'NON_DEMARRE', ordre: 2 },
        { id: 'p3', nom: 'Débarquement passagers', statut: 'NON_DEMARRE', ordre: 3 },
        { id: 'p4', nom: 'Déchargement bagages', statut: 'NON_DEMARRE', ordre: 4 },
        { id: 'p5', nom: 'Déchargement fret', statut: 'NON_DEMARRE', ordre: 5 }
      ]
      mockCRVReload(5, phases)

      await crvStore.demarrerPhase('p1')

      console.log('\n⏱️  Étape 3a: Phase Positionnement DÉMARRÉE')
      console.log('   → Heure: 14h32')
      expect(phasesAPI.demarrer).toHaveBeenCalledWith('p1')
    })

    it('3b. Agent termine la phase à 14h35 → Complétude 10%', async () => {
      crvStore.phases[0].statut = 'EN_COURS'

      phasesAPI.terminer.mockResolvedValue({
        data: {
          phase: {
            id: 'p1',
            statut: 'TERMINE',
            heureDebut: '2024-01-15T14:32:00Z',
            heureFin: '2024-01-15T14:35:00Z',
            dureeMinutes: 3
          }
        }
      })

      const phases = [
        { id: 'p1', nom: 'Positionnement passerelle', statut: 'TERMINE', ordre: 1 },
        { id: 'p2', nom: 'Calage avion', statut: 'NON_DEMARRE', ordre: 2 },
        { id: 'p3', nom: 'Débarquement passagers', statut: 'NON_DEMARRE', ordre: 3 },
        { id: 'p4', nom: 'Déchargement bagages', statut: 'NON_DEMARRE', ordre: 4 },
        { id: 'p5', nom: 'Déchargement fret', statut: 'NON_DEMARRE', ordre: 5 }
      ]
      mockCRVReload(10, phases)

      await crvStore.terminerPhase('p1')

      console.log('\n✅ Étape 3b: Phase Positionnement TERMINÉE')
      console.log('   → Durée: 3 minutes')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.completude).toBe(10)
    })
  })

  // ==========================================
  // ÉTAPE 4: PHASE CALAGE + DÉBARQUEMENT
  // Complétude: 10% → 25%
  // ==========================================
  describe('ÉTAPE 4: Phases Calage et Débarquement', () => {
    beforeEach(() => {
      authStore.user = agent
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        id: 'crv-arr-001',
        statut: 'EN_COURS',
        completude: 10,
        vol: volArrivee
      }
      crvStore.phases = [
        { id: 'p1', nom: 'Positionnement passerelle', statut: 'TERMINE', ordre: 1 },
        { id: 'p2', nom: 'Calage avion', statut: 'NON_DEMARRE', ordre: 2 },
        { id: 'p3', nom: 'Débarquement passagers', statut: 'NON_DEMARRE', ordre: 3 },
        { id: 'p4', nom: 'Déchargement bagages', statut: 'NON_DEMARRE', ordre: 4 },
        { id: 'p5', nom: 'Déchargement fret', statut: 'NON_DEMARRE', ordre: 5 }
      ]
    })

    it('4a. Phase Calage terminée → Complétude 15%', async () => {
      phasesAPI.demarrer.mockResolvedValue({ data: { phase: { id: 'p2', statut: 'EN_COURS' } } })
      phasesAPI.terminer.mockResolvedValue({ data: { phase: { id: 'p2', statut: 'TERMINE' } } })

      const phases = [
        { id: 'p1', statut: 'TERMINE', ordre: 1 },
        { id: 'p2', statut: 'TERMINE', ordre: 2 },
        { id: 'p3', statut: 'NON_DEMARRE', ordre: 3 },
        { id: 'p4', statut: 'NON_DEMARRE', ordre: 4 },
        { id: 'p5', statut: 'NON_DEMARRE', ordre: 5 }
      ]
      mockCRVReload(15, phases)

      await crvStore.demarrerPhase('p2')
      await crvStore.terminerPhase('p2')

      console.log('\n✅ Étape 4a: Phase Calage TERMINÉE')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.completude).toBe(15)
    })

    it('4b. Phase Débarquement passagers terminée → Complétude 25%', async () => {
      crvStore.phases[1].statut = 'TERMINE'
      crvStore.currentCRV.completude = 15

      phasesAPI.demarrer.mockResolvedValue({ data: { phase: { id: 'p3', statut: 'EN_COURS' } } })
      phasesAPI.terminer.mockResolvedValue({
        data: {
          phase: {
            id: 'p3',
            statut: 'TERMINE',
            heureDebut: '2024-01-15T14:36:00Z',
            heureFin: '2024-01-15T14:52:00Z',
            dureeMinutes: 16
          }
        }
      })

      const phases = [
        { id: 'p1', statut: 'TERMINE', ordre: 1 },
        { id: 'p2', statut: 'TERMINE', ordre: 2 },
        { id: 'p3', statut: 'TERMINE', ordre: 3 },
        { id: 'p4', statut: 'NON_DEMARRE', ordre: 4 },
        { id: 'p5', statut: 'NON_DEMARRE', ordre: 5 }
      ]
      mockCRVReload(25, phases)

      await crvStore.demarrerPhase('p3')
      await crvStore.terminerPhase('p3')

      console.log('\n✅ Étape 4b: Phase Débarquement TERMINÉE')
      console.log('   → 168 passagers débarqués en 16 minutes')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.completude).toBe(25)
    })
  })

  // ==========================================
  // ÉTAPE 5: PHASE DÉCHARGEMENT BAGAGES
  // Complétude: 25% → 40%
  // ==========================================
  describe('ÉTAPE 5: Phase Déchargement Bagages', () => {
    beforeEach(() => {
      authStore.user = agent
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        id: 'crv-arr-001',
        statut: 'EN_COURS',
        completude: 25,
        vol: volArrivee
      }
      crvStore.phases = [
        { id: 'p1', statut: 'TERMINE', ordre: 1 },
        { id: 'p2', statut: 'TERMINE', ordre: 2 },
        { id: 'p3', statut: 'TERMINE', ordre: 3 },
        { id: 'p4', nom: 'Déchargement bagages', statut: 'NON_DEMARRE', ordre: 4 },
        { id: 'p5', nom: 'Déchargement fret', statut: 'NON_DEMARRE', ordre: 5 }
      ]
    })

    it('Phase Déchargement bagages terminée → Complétude 40%', async () => {
      phasesAPI.demarrer.mockResolvedValue({ data: { phase: { id: 'p4', statut: 'EN_COURS' } } })
      phasesAPI.terminer.mockResolvedValue({
        data: {
          phase: {
            id: 'p4',
            statut: 'TERMINE',
            dureeMinutes: 22
          }
        }
      })

      const phases = [
        { id: 'p1', statut: 'TERMINE', ordre: 1 },
        { id: 'p2', statut: 'TERMINE', ordre: 2 },
        { id: 'p3', statut: 'TERMINE', ordre: 3 },
        { id: 'p4', statut: 'TERMINE', ordre: 4 },
        { id: 'p5', statut: 'NON_DEMARRE', ordre: 5 }
      ]
      mockCRVReload(40, phases)

      await crvStore.demarrerPhase('p4')
      await crvStore.terminerPhase('p4')

      console.log('\n✅ Étape 5: Phase Déchargement Bagages TERMINÉE')
      console.log('   → Durée: 22 minutes')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.completude).toBe(40)
    })
  })

  // ==========================================
  // ÉTAPE 6: SAISIE PASSAGERS
  // Complétude: 40% → 55%
  // ==========================================
  describe('ÉTAPE 6: Saisie des Passagers Débarqués', () => {
    beforeEach(() => {
      authStore.user = agent
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        id: 'crv-arr-001',
        statut: 'EN_COURS',
        completude: 40,
        vol: volArrivee
      }
      crvStore.charges = []
    })

    it('Agent saisit 168 passagers débarqués → Complétude 55%', async () => {
      const chargePassagers = {
        id: 'charge-pax-001',
        typeCharge: 'PASSAGERS',
        sensOperation: 'DEBARQUEMENT',
        passagersAdultes: 145,
        passagersEnfants: 18,
        passagersBebes: 5,
        total: 168
      }

      crvAPI.addCharge.mockResolvedValue({
        data: { charge: chargePassagers }
      })

      const phases = [
        { id: 'p1', statut: 'TERMINE', ordre: 1 },
        { id: 'p2', statut: 'TERMINE', ordre: 2 },
        { id: 'p3', statut: 'TERMINE', ordre: 3 },
        { id: 'p4', statut: 'TERMINE', ordre: 4 },
        { id: 'p5', statut: 'NON_DEMARRE', ordre: 5 }
      ]
      mockCRVReload(55, phases, [chargePassagers])

      await crvStore.addCharge({
        typeCharge: 'PASSAGERS',
        sensOperation: 'DEBARQUEMENT',
        passagersAdultes: 145,
        passagersEnfants: 18,
        passagersBebes: 5
      })
      // Recharger pour obtenir la complétude calculée par le backend
      await crvStore.loadCRV('crv-arr-001')

      console.log('\n✅ Étape 6: Passagers Saisis')
      console.log('   → Adultes: 145')
      console.log('   → Enfants: 18')
      console.log('   → Bébés: 5')
      console.log('   → TOTAL: 168 passagers')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.getChargesPassagers).toHaveLength(1)
      expect(crvStore.completude).toBe(55)
    })
  })

  // ==========================================
  // ÉTAPE 7: SAISIE BAGAGES
  // Complétude: 55% → 70%
  // ==========================================
  describe('ÉTAPE 7: Saisie des Bagages Déchargés', () => {
    beforeEach(() => {
      authStore.user = agent
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        id: 'crv-arr-001',
        statut: 'EN_COURS',
        completude: 55,
        vol: volArrivee
      }
      crvStore.charges = [
        { id: 'charge-pax-001', typeCharge: 'PASSAGERS', total: 168 }
      ]
    })

    it('Agent saisit 195 bagages déchargés → Complétude 70%', async () => {
      const chargeBagages = {
        id: 'charge-bag-001',
        typeCharge: 'BAGAGES',
        sensOperation: 'DEBARQUEMENT',
        nombreBagagesSoute: 185,
        poidsBagagesSouteKg: 2775,
        nombreBagagesCabine: 10,
        total: 195
      }

      crvAPI.addCharge.mockResolvedValue({
        data: { charge: chargeBagages }
      })

      const phases = [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' },
        { id: 'p4', statut: 'TERMINE' },
        { id: 'p5', statut: 'NON_DEMARRE' }
      ]
      mockCRVReload(70, phases, [
        { id: 'charge-pax-001', typeCharge: 'PASSAGERS' },
        chargeBagages
      ])

      await crvStore.addCharge({
        typeCharge: 'BAGAGES',
        sensOperation: 'DEBARQUEMENT',
        nombreBagagesSoute: 185,
        poidsBagagesSouteKg: 2775,
        nombreBagagesCabine: 10
      })
      // Recharger pour obtenir la complétude calculée par le backend
      await crvStore.loadCRV('crv-arr-001')

      console.log('\n✅ Étape 7: Bagages Saisis')
      console.log('   → Bagages soute: 185 (2775 kg)')
      console.log('   → Bagages cabine: 10')
      console.log('   → TOTAL: 195 bagages')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.charges).toHaveLength(2)
      expect(crvStore.getChargesBagages).toHaveLength(1)
      expect(crvStore.completude).toBe(70)
    })
  })

  // ==========================================
  // ÉTAPE 8: FRET (Pas de fret sur ce vol)
  // Complétude: 70% → 80%
  // ==========================================
  describe('ÉTAPE 8: Fret (Non applicable sur ce vol)', () => {
    beforeEach(() => {
      authStore.user = agent
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        id: 'crv-arr-001',
        statut: 'EN_COURS',
        completude: 70,
        vol: volArrivee
      }
      crvStore.phases = [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' },
        { id: 'p4', statut: 'TERMINE' },
        { id: 'p5', nom: 'Déchargement fret', statut: 'NON_DEMARRE', ordre: 5 }
      ]
    })

    it('Agent marque "Pas de fret" → Phase N/A → Complétude 80%', async () => {
      // Marquer la phase fret comme non réalisée (pas de fret)
      phasesAPI.terminer.mockResolvedValue({
        data: {
          phase: {
            id: 'p5',
            statut: 'NON_REALISE',
            motifNonRealisation: 'PAS_DE_FRET'
          }
        }
      })

      const phases = [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' },
        { id: 'p4', statut: 'TERMINE' },
        { id: 'p5', statut: 'NON_REALISE' }
      ]
      mockCRVReload(80, phases, [
        { id: 'charge-pax-001', typeCharge: 'PASSAGERS' },
        { id: 'charge-bag-001', typeCharge: 'BAGAGES' }
      ])

      // Simuler le marquage comme non applicable
      await crvStore.terminerPhase('p5')

      console.log('\n✅ Étape 8: Fret - Non Applicable')
      console.log('   → Vol passagers sans fret')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.completude).toBe(80)
      // 80% = seuil minimum pour validation!
    })
  })

  // ==========================================
  // ÉTAPE 9: OBSERVATION
  // Complétude: 80% → 90%
  // ==========================================
  describe('ÉTAPE 9: Ajout Observation', () => {
    beforeEach(() => {
      authStore.user = agent
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        id: 'crv-arr-001',
        statut: 'EN_COURS',
        completude: 80,
        vol: volArrivee
      }
      crvStore.observations = []
    })

    it('Agent ajoute observation "RAS" → Complétude 90%', async () => {
      const observation = {
        id: 'obs-001',
        categorie: 'GENERALE',
        contenu: 'Vol arrivé à l\'heure. Débarquement et déchargement effectués sans incident.',
        auteur: agent,
        dateCreation: '2024-01-15T15:30:00Z'
      }

      crvAPI.addObservation.mockResolvedValue({
        data: { observation }
      })

      const phases = [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' },
        { id: 'p4', statut: 'TERMINE' },
        { id: 'p5', statut: 'NON_REALISE' }
      ]
      mockCRVReload(90, phases, [
        { id: 'charge-pax-001', typeCharge: 'PASSAGERS' },
        { id: 'charge-bag-001', typeCharge: 'BAGAGES' }
      ], [observation])

      await crvStore.addObservation({
        categorie: 'GENERALE',
        contenu: 'Vol arrivé à l\'heure. Débarquement et déchargement effectués sans incident.'
      })
      // Recharger pour obtenir la complétude calculée par le backend
      await crvStore.loadCRV('crv-arr-001')

      console.log('\n✅ Étape 9: Observation Ajoutée')
      console.log('   → Catégorie: GENERALE')
      console.log('   → Contenu: "Vol arrivé à l\'heure..."')
      console.log(`   📊 COMPLÉTUDE: ${crvStore.completude}%`)

      expect(crvStore.observations).toHaveLength(1)
      expect(crvStore.completude).toBe(90)
    })
  })

  // ==========================================
  // ÉTAPE 10: CRV PRÊT POUR VALIDATION
  // Complétude: 90% (>= 80% requis)
  // ==========================================
  describe('ÉTAPE 10: CRV Terminé - Prêt pour Validation', () => {
    beforeEach(() => {
      authStore.user = agent
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        id: 'crv-arr-001',
        numeroCRV: 'CRV-2024-0001',
        statut: 'TERMINE',
        completude: 90,
        vol: volArrivee
      }
    })

    it('CRV atteint 90% - Éligible à la validation', () => {
      console.log('\n' + '═'.repeat(50))
      console.log('📋 RÉCAPITULATIF CRV ARRIVÉE AF123')
      console.log('═'.repeat(50))
      console.log(`Numéro: ${crvStore.currentCRV.numeroCRV}`)
      console.log(`Vol: ${volArrivee.numeroVol} (${volArrivee.origine.code} → ${volArrivee.destination.code})`)
      console.log(`Statut: ${crvStore.currentCRV.statut}`)
      console.log(`Complétude: ${crvStore.completude}%`)
      console.log('─'.repeat(50))
      console.log('✅ Toutes les phases traitées')
      console.log('✅ Passagers renseignés: 168')
      console.log('✅ Bagages renseignés: 195')
      console.log('✅ Observation ajoutée')
      console.log('─'.repeat(50))
      console.log(`🎯 ÉLIGIBLE VALIDATION: ${crvStore.isCompleteEnough ? 'OUI' : 'NON'}`)
      console.log('═'.repeat(50))

      expect(crvStore.completude).toBeGreaterThanOrEqual(80)
      expect(crvStore.isCompleteEnough).toBe(true)
      expect(crvStore.currentCRV.statut).toBe('TERMINE')
    })

    it('Agent ne peut PAS valider lui-même (permission refusée)', () => {
      // L'agent n'a pas la permission de valider
      // Note: canValidate vérifie seulement la complétude >= 80%
      // La permission PROGRAMME_VALIDER est vérifiée séparément
      expect(crvStore.isCompleteEnough).toBe(true)
      // L'agent n'a pas la permission PROGRAMME_VALIDER
      expect(canValidateProgramme(ROLES.AGENT_ESCALE)).toBe(false)

      console.log('\n⚠️  Agent ne peut pas valider')
      console.log('   → Action réservée au Superviseur/Manager')
    })
  })

  // ==========================================
  // SCÉNARIO COMPLET DE BOUT EN BOUT
  // ==========================================
  describe('SCÉNARIO COMPLET: Du Login à la Fin', () => {
    it('devrait exécuter le workflow ARRIVÉE complet avec progression de complétude', async () => {
      console.log('\n' + '═'.repeat(60))
      console.log('🔄 EXÉCUTION SCÉNARIO COMPLET CRV ARRIVÉE')
      console.log('═'.repeat(60))

      // 1. LOGIN
      authAPI.login.mockResolvedValue({
        data: { token: 'jwt', utilisateur: agent }
      })
      await authStore.login({ email: 'test@test.com', password: 'pass' })
      expect(authStore.isAuthenticated).toBe(true)
      console.log('✅ 1. Connexion Agent')

      // 2. CRÉATION CRV (0%)
      crvAPI.create.mockResolvedValue({
        data: { id: 'crv-001', statut: 'BROUILLON', completude: 0, vol: volArrivee }
      })
      mockCRVReload(0, [
        { id: 'p1', statut: 'NON_DEMARRE' },
        { id: 'p2', statut: 'NON_DEMARRE' },
        { id: 'p3', statut: 'NON_DEMARRE' }
      ])
      await crvStore.createCRV({ volId: 'vol-001' })
      expect(crvStore.completude).toBe(0)
      console.log('✅ 2. CRV Créé → 0%')

      // 3. PHASES (0% → 40%)
      const completudesPhases = [15, 25, 40]
      for (let i = 0; i < 3; i++) {
        phasesAPI.demarrer.mockResolvedValue({ data: { phase: { id: `p${i+1}`, statut: 'EN_COURS' } } })
        phasesAPI.terminer.mockResolvedValue({ data: { phase: { id: `p${i+1}`, statut: 'TERMINE' } } })

        const phases = [
          { id: 'p1', statut: i >= 0 ? 'TERMINE' : 'NON_DEMARRE' },
          { id: 'p2', statut: i >= 1 ? 'TERMINE' : 'NON_DEMARRE' },
          { id: 'p3', statut: i >= 2 ? 'TERMINE' : 'NON_DEMARRE' }
        ]
        mockCRVReload(completudesPhases[i], phases)

        await crvStore.demarrerPhase(`p${i+1}`)
        await crvStore.terminerPhase(`p${i+1}`)
      }
      expect(crvStore.completude).toBe(40)
      console.log('✅ 3. Phases terminées → 40%')

      // 4. PASSAGERS (40% → 55%)
      crvAPI.addCharge.mockResolvedValue({
        data: { charge: { id: 'c1', typeCharge: 'PASSAGERS' } }
      })
      mockCRVReload(55, [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' }
      ], [{ id: 'c1', typeCharge: 'PASSAGERS' }])
      await crvStore.addCharge({ typeCharge: 'PASSAGERS', passagersAdultes: 150 })
      await crvStore.loadCRV('crv-001')
      expect(crvStore.completude).toBe(55)
      console.log('✅ 4. Passagers saisis → 55%')

      // 5. BAGAGES (55% → 70%)
      crvAPI.addCharge.mockResolvedValue({
        data: { charge: { id: 'c2', typeCharge: 'BAGAGES' } }
      })
      mockCRVReload(70, [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' }
      ], [
        { id: 'c1', typeCharge: 'PASSAGERS' },
        { id: 'c2', typeCharge: 'BAGAGES' }
      ])
      await crvStore.addCharge({ typeCharge: 'BAGAGES', nombreBagagesSoute: 180 })
      await crvStore.loadCRV('crv-001')
      expect(crvStore.completude).toBe(70)
      console.log('✅ 5. Bagages saisis → 70%')

      // 6. OBSERVATION (70% → 85%)
      crvAPI.addObservation.mockResolvedValue({
        data: { observation: { id: 'o1', contenu: 'RAS' } }
      })
      mockCRVReload(85, [
        { id: 'p1', statut: 'TERMINE' },
        { id: 'p2', statut: 'TERMINE' },
        { id: 'p3', statut: 'TERMINE' }
      ], [
        { id: 'c1', typeCharge: 'PASSAGERS' },
        { id: 'c2', typeCharge: 'BAGAGES' }
      ], [{ id: 'o1', contenu: 'RAS' }])
      await crvStore.addObservation({ categorie: 'GENERALE', contenu: 'RAS' })
      await crvStore.loadCRV('crv-001')
      expect(crvStore.completude).toBe(85)
      console.log('✅ 6. Observation ajoutée → 85%')

      // RÉSULTAT FINAL
      console.log('─'.repeat(60))
      console.log(`📊 COMPLÉTUDE FINALE: ${crvStore.completude}%`)
      console.log(`🎯 ÉLIGIBLE VALIDATION: ${crvStore.isCompleteEnough ? 'OUI ✓' : 'NON ✗'}`)
      console.log('═'.repeat(60))

      expect(crvStore.isCompleteEnough).toBe(true)
    })
  })
})
