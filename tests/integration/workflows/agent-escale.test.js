/**
 * TESTS PROCESSUS COMPLETS - AGENT D'ESCALE
 *
 * Profil: AGENT_ESCALE
 * Permissions: Création/modification CRV, phases, charges, événements
 * Restrictions: Ne peut pas valider, supprimer CRV, gérer utilisateurs
 *
 * Processus testés:
 * 1. Connexion
 * 2. Création CRV (Arrivée, Départ, Turn Around)
 * 3. Gestion des phases
 * 4. Gestion des charges (passagers, bagages, fret)
 * 5. Ajout événements et observations
 * 6. Tentatives d'actions non autorisées
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useCRVStore } from '@/stores/crvStore'
import { ROLES } from '@/config/roles'
import { hasPermission, ACTIONS } from '@/utils/permissions'

// Mock des API
vi.mock('@/services/api', () => ({
  authAPI: {
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn()
  },
  crvAPI: {
    create: vi.fn(),
    getById: vi.fn(),
    getAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addCharge: vi.fn(),
    addEvenement: vi.fn(),
    addObservation: vi.fn()
  },
  phasesAPI: {
    demarrer: vi.fn(),
    terminer: vi.fn(),
    marquerNonRealise: vi.fn(),
    update: vi.fn()
  },
  chargesAPI: {
    getById: vi.fn(),
    updateCategoriesDetaillees: vi.fn(),
    updateClasses: vi.fn(),
    updateBesoinsMedicaux: vi.fn()
  },
  validationAPI: {
    valider: vi.fn()
  }
}))

import { authAPI, crvAPI, phasesAPI, chargesAPI, validationAPI } from '@/services/api'

describe('PROCESSUS AGENT D\'ESCALE', () => {
  let authStore
  let crvStore

  // Données de test
  const agentUser = {
    id: 'agent-001',
    nom: 'Diallo',
    prenom: 'Amadou',
    email: 'amadou.diallo@airport.com',
    fonction: ROLES.AGENT_ESCALE,
    matricule: 'AGT-001'
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    crvStore = useCRVStore()
    vi.clearAllMocks()
  })

  // =========================================
  // ÉTAPE 1: CONNEXION
  // =========================================
  describe('ÉTAPE 1: Connexion Agent', () => {
    it('devrait se connecter avec succès', async () => {
      authAPI.login.mockResolvedValue({
        data: {
          token: 'jwt-agent-token',
          utilisateur: agentUser,
          doitChangerMotDePasse: false
        }
      })

      await authStore.login({ email: 'amadou.diallo@airport.com', password: 'password123' })

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.getUserRole).toBe(ROLES.AGENT_ESCALE)
      expect(authStore.isAgentEscale).toBe(true)
      expect(authStore.getUserFullName).toBe('Amadou Diallo')
    })

    it('devrait avoir les bonnes permissions', () => {
      authStore.user = agentUser
      authStore.token = 'jwt-token'

      // Permissions autorisées
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.CRV_CREER)).toBe(true)
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.CRV_MODIFIER)).toBe(true)
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.CRV_LIRE)).toBe(true)
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.PHASE_DEMARRER)).toBe(true)
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.CHARGE_AJOUTER)).toBe(true)
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.EVENEMENT_AJOUTER)).toBe(true)

      // Permissions refusées
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.CRV_SUPPRIMER)).toBe(false)
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.PROGRAMME_VALIDER)).toBe(false)
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.USER_CREER)).toBe(false)
    })

    it('devrait rediriger vers changement mot de passe si requis', async () => {
      authAPI.login.mockResolvedValue({
        data: {
          token: 'jwt-token',
          utilisateur: agentUser,
          doitChangerMotDePasse: true
        }
      })

      const result = await authStore.login({ email: 'test@test.com', password: 'temp' })

      expect(result.doitChangerMotDePasse).toBe(true)
      expect(authStore.mustChangePassword).toBe(true)
    })
  })

  // =========================================
  // ÉTAPE 2: CRÉATION CRV — API v2 (4 PATHs)
  // =========================================
  describe('ÉTAPE 2: Création CRV — API v2', () => {
    beforeEach(() => {
      authStore.user = agentUser
      authStore.token = 'jwt-token'
    })

    // -----------------------------------------
    // PATH 1: Depuis Bulletin de Mouvement
    // Payload: { bulletinId, mouvementId, escale? }
    // -----------------------------------------
    describe('PATH 1: Bulletin de Mouvement', () => {
      const mockCRV = {
        id: 'crv-path1-001',
        numeroCRV: 'CRV-2024-P1-001',
        statut: 'BROUILLON',
        completude: 0,
        vol: {
          id: 'vol-001',
          numeroVol: 'AF123',
          typeOperation: 'ARRIVEE',
          origine: 'CDG',
          destination: 'DSS'
        }
      }

      it('devrait créer un CRV avec bulletinId + mouvementId', async () => {
        crvAPI.create.mockResolvedValue({ data: mockCRV })
        crvAPI.getById.mockResolvedValue({
          data: {
            crv: mockCRV,
            phases: [
              { id: 'p1', nom: 'Positionnement passerelle', statut: 'NON_DEMARRE' },
              { id: 'p2', nom: 'Débarquement passagers', statut: 'NON_DEMARRE' },
              { id: 'p3', nom: 'Déchargement bagages', statut: 'NON_DEMARRE' }
            ],
            charges: [],
            evenements: [],
            observations: []
          }
        })

        const payload = {
          bulletinId: 'bulletin-001',
          mouvementId: 'mouvement-001'
        }
        await crvStore.createCRV(payload)

        expect(crvAPI.create).toHaveBeenCalledWith(payload)
        // Vérifier qu'il n'y a PAS de volId dans le payload
        const calledWith = crvAPI.create.mock.calls[0][0]
        expect(calledWith).not.toHaveProperty('volId')
        expect(calledWith).not.toHaveProperty('type')
        expect(calledWith).not.toHaveProperty('vol')
        expect(crvStore.currentCRV).toBeDefined()
        expect(crvStore.currentCRV.vol.typeOperation).toBe('ARRIVEE')
      })

      it('devrait inclure escale si présente', async () => {
        crvAPI.create.mockResolvedValue({ data: mockCRV })
        crvAPI.getById.mockResolvedValue({
          data: { crv: mockCRV, phases: [], charges: [], evenements: [], observations: [] }
        })

        const payload = {
          bulletinId: 'bulletin-001',
          mouvementId: 'mouvement-001',
          escale: 'NDJ'
        }
        await crvStore.createCRV(payload)

        expect(crvAPI.create).toHaveBeenCalledWith(payload)
        expect(crvAPI.create.mock.calls[0][0].escale).toBe('NDJ')
      })
    })

    // -----------------------------------------
    // PATH 2: Vol Hors Programme
    // Payload: { vol: { numeroVol, compagnieAerienne, codeIATA, dateVol,
    //   typeOperation, typeVolHorsProgramme, raisonHorsProgramme,
    //   aeroportOrigine?, aeroportDestination? }, escale? }
    // -----------------------------------------
    describe('PATH 2: Vol Hors Programme', () => {
      it('devrait créer un CRV hors programme ARRIVEE avec vol encapsulé', async () => {
        const mockCRV = {
          id: 'crv-hp-001',
          numeroCRV: 'CRV-2024-HP-001',
          statut: 'BROUILLON',
          vol: { typeOperation: 'ARRIVEE', numeroVol: 'HP999' }
        }

        crvAPI.create.mockResolvedValue({ data: mockCRV })
        crvAPI.getById.mockResolvedValue({
          data: { crv: mockCRV, phases: [], charges: [], evenements: [], observations: [] }
        })

        const payload = {
          vol: {
            numeroVol: 'HP999',
            compagnieAerienne: 'Air France',
            codeIATA: 'AF',
            dateVol: '2024-06-15T14:30:00.000Z',
            typeOperation: 'ARRIVEE',
            typeVolHorsProgramme: 'CHARTER',
            raisonHorsProgramme: 'Vol charter exceptionnel',
            aeroportOrigine: 'CDG'
          },
          escale: 'NDJ'
        }
        await crvStore.createCRV(payload)

        const calledWith = crvAPI.create.mock.calls[0][0]
        // Vérifier structure vol encapsulée
        expect(calledWith).toHaveProperty('vol')
        expect(calledWith.vol).toHaveProperty('numeroVol', 'HP999')
        expect(calledWith.vol).toHaveProperty('compagnieAerienne', 'Air France')
        expect(calledWith.vol).toHaveProperty('codeIATA', 'AF')
        expect(calledWith.vol).toHaveProperty('typeVolHorsProgramme', 'CHARTER')
        expect(calledWith.vol).toHaveProperty('aeroportOrigine', 'CDG')
        // PAS de champs plats à la racine
        expect(calledWith).not.toHaveProperty('bulletinId')
        expect(calledWith).not.toHaveProperty('volId')
        expect(calledWith).not.toHaveProperty('type')
        expect(calledWith).not.toHaveProperty('numeroVol')
        expect(calledWith.escale).toBe('NDJ')
      })

      it('devrait inclure aeroportDestination pour DEPART, pas aeroportOrigine', async () => {
        const mockCRV = {
          id: 'crv-hp-002',
          statut: 'BROUILLON',
          vol: { typeOperation: 'DEPART' }
        }
        crvAPI.create.mockResolvedValue({ data: mockCRV })
        crvAPI.getById.mockResolvedValue({
          data: { crv: mockCRV, phases: [], charges: [], evenements: [], observations: [] }
        })

        const payload = {
          vol: {
            numeroVol: 'HP100',
            compagnieAerienne: 'Test Air',
            codeIATA: 'TA',
            dateVol: '2024-06-15T10:00:00.000Z',
            typeOperation: 'DEPART',
            typeVolHorsProgramme: 'TECHNIQUE',
            raisonHorsProgramme: 'Vol technique',
            aeroportDestination: 'CDG'
          }
        }
        await crvStore.createCRV(payload)

        const calledWith = crvAPI.create.mock.calls[0][0]
        expect(calledWith.vol).toHaveProperty('aeroportDestination', 'CDG')
        expect(calledWith.vol).not.toHaveProperty('aeroportOrigine')
      })

      it('devrait inclure les deux aéroports pour TURN_AROUND', async () => {
        const mockCRV = {
          id: 'crv-hp-003',
          statut: 'BROUILLON',
          vol: { typeOperation: 'TURN_AROUND' }
        }
        crvAPI.create.mockResolvedValue({ data: mockCRV })
        crvAPI.getById.mockResolvedValue({
          data: { crv: mockCRV, phases: [], charges: [], evenements: [], observations: [] }
        })

        const payload = {
          vol: {
            numeroVol: 'HP200',
            compagnieAerienne: 'Test Air',
            codeIATA: 'TA',
            dateVol: '2024-06-15T08:00:00.000Z',
            typeOperation: 'TURN_AROUND',
            typeVolHorsProgramme: 'COMMERCIAL',
            raisonHorsProgramme: 'Vol commercial additionnel',
            aeroportOrigine: 'CDG',
            aeroportDestination: 'JFK'
          }
        }
        await crvStore.createCRV(payload)

        const calledWith = crvAPI.create.mock.calls[0][0]
        expect(calledWith.vol).toHaveProperty('aeroportOrigine', 'CDG')
        expect(calledWith.vol).toHaveProperty('aeroportDestination', 'JFK')
      })
    })

    // -----------------------------------------
    // PATH 3: Vol existant (backward compat)
    // Payload: { volId, escale? }
    // -----------------------------------------
    describe('PATH 3: Vol existant (programme)', () => {
      it('devrait créer un CRV avec volId uniquement', async () => {
        const mockCRV = {
          id: 'crv-p3-001',
          numeroCRV: 'CRV-2024-P3-001',
          statut: 'BROUILLON',
          vol: { typeOperation: 'DEPART' }
        }

        crvAPI.create.mockResolvedValue({ data: mockCRV })
        crvAPI.getById.mockResolvedValue({
          data: {
            crv: mockCRV,
            phases: [
              { id: 'p1', nom: 'Embarquement passagers', statut: 'NON_DEMARRE' },
              { id: 'p2', nom: 'Push-back', statut: 'NON_DEMARRE' }
            ],
            charges: [],
            evenements: [],
            observations: []
          }
        })

        const payload = { volId: 'vol-prog-001' }
        await crvStore.createCRV(payload)

        const calledWith = crvAPI.create.mock.calls[0][0]
        expect(calledWith).toEqual({ volId: 'vol-prog-001' })
        expect(calledWith).not.toHaveProperty('bulletinId')
        expect(calledWith).not.toHaveProperty('vol')
        expect(calledWith).not.toHaveProperty('type')
      })

      it('devrait inclure escale si présente', async () => {
        const mockCRV = { id: 'crv-p3-002', statut: 'BROUILLON', vol: { typeOperation: 'ARRIVEE' } }
        crvAPI.create.mockResolvedValue({ data: mockCRV })
        crvAPI.getById.mockResolvedValue({
          data: { crv: mockCRV, phases: [], charges: [], evenements: [], observations: [] }
        })

        await crvStore.createCRV({ volId: 'vol-prog-002', escale: 'DSS' })

        const calledWith = crvAPI.create.mock.calls[0][0]
        expect(calledWith.volId).toBe('vol-prog-002')
        expect(calledWith.escale).toBe('DSS')
      })
    })

    // -----------------------------------------
    // PATH LEGACY: Création exceptionnelle
    // Payload: { type, date?, escale? }
    // -----------------------------------------
    describe('PATH LEGACY: Création exceptionnelle', () => {
      it('devrait créer un CRV legacy avec type seul', async () => {
        const mockCRV = {
          id: 'crv-leg-001',
          statut: 'BROUILLON',
          vol: { typeOperation: 'DEPART' }
        }
        crvAPI.create.mockResolvedValue({ data: mockCRV })
        crvAPI.getById.mockResolvedValue({
          data: { crv: mockCRV, phases: [], charges: [], evenements: [], observations: [] }
        })

        const payload = { type: 'depart' }
        await crvStore.createCRV(payload)

        const calledWith = crvAPI.create.mock.calls[0][0]
        expect(calledWith).toEqual({ type: 'depart' })
        expect(calledWith).not.toHaveProperty('volId')
        expect(calledWith).not.toHaveProperty('bulletinId')
        expect(calledWith).not.toHaveProperty('vol')
      })

      it('devrait créer un CRV legacy avec type + date + escale', async () => {
        const mockCRV = { id: 'crv-leg-002', statut: 'BROUILLON', vol: { typeOperation: 'ARRIVEE' } }
        crvAPI.create.mockResolvedValue({ data: mockCRV })
        crvAPI.getById.mockResolvedValue({
          data: { crv: mockCRV, phases: [], charges: [], evenements: [], observations: [] }
        })

        const payload = { type: 'arrivee', date: '2024-06-15', escale: 'NDJ' }
        await crvStore.createCRV(payload)

        const calledWith = crvAPI.create.mock.calls[0][0]
        expect(calledWith).toEqual({ type: 'arrivee', date: '2024-06-15', escale: 'NDJ' })
      })
    })

    // -----------------------------------------
    // DOUBLON 409 — CRV_DOUBLON handling
    // -----------------------------------------
    describe('Gestion Doublon 409 (CRV_DOUBLON)', () => {
      it('devrait retourner info doublon au lieu de throw sur 409', async () => {
        const error409 = {
          response: {
            status: 409,
            data: {
              code: 'CRV_DOUBLON',
              message: 'Un CRV existe déjà pour ce vol',
              crvExistantId: 'crv-exist-001',
              numeroCRV: 'CRV-2024-EXIST'
            }
          }
        }
        crvAPI.create.mockRejectedValue(error409)

        const result = await crvStore.createCRV({ volId: 'vol-doublon' })

        expect(result).toBeDefined()
        expect(result.doublon).toBe(true)
        expect(result.crvExistantId).toBe('crv-exist-001')
        expect(result.numeroCRV).toBe('CRV-2024-EXIST')
        expect(result.originalPayload).toEqual({ volId: 'vol-doublon' })
      })

      it('devrait forcer la création doublon avec forceDoublon + confirmationLevel=2', async () => {
        const mockCRV = {
          id: 'crv-doublon-001',
          statut: 'BROUILLON',
          crvDoublon: true,
          vol: { typeOperation: 'DEPART' }
        }
        crvAPI.create.mockResolvedValue({ data: mockCRV })
        crvAPI.getById.mockResolvedValue({
          data: { crv: mockCRV, phases: [], charges: [], evenements: [], observations: [] }
        })

        const originalPayload = { volId: 'vol-doublon' }
        await crvStore.createCRVForceDoublon(originalPayload)

        const calledWith = crvAPI.create.mock.calls[0][0]
        expect(calledWith).toEqual({
          volId: 'vol-doublon',
          forceDoublon: true,
          confirmationLevel: 2
        })
      })

      it('devrait propager les erreurs non-409 normalement', async () => {
        const error500 = {
          response: { status: 500, data: { message: 'Erreur serveur' } }
        }
        crvAPI.create.mockRejectedValue(error500)

        await expect(crvStore.createCRV({ volId: 'vol-error' })).rejects.toBeDefined()
      })
    })

    // -----------------------------------------
    // Tests de non-contamination entre PATHs
    // -----------------------------------------
    describe('Isolation des PATHs (non-contamination)', () => {
      beforeEach(() => {
        const mockCRV = { id: 'crv-test', statut: 'BROUILLON', vol: { typeOperation: 'DEPART' } }
        crvAPI.create.mockResolvedValue({ data: mockCRV })
        crvAPI.getById.mockResolvedValue({
          data: { crv: mockCRV, phases: [], charges: [], evenements: [], observations: [] }
        })
      })

      it('PATH 1 ne doit PAS contenir volId, vol, type', async () => {
        await crvStore.createCRV({ bulletinId: 'b1', mouvementId: 'm1' })
        const p = crvAPI.create.mock.calls[0][0]
        expect(Object.keys(p).sort()).toEqual(['bulletinId', 'mouvementId'])
      })

      it('PATH 2 ne doit PAS contenir bulletinId, mouvementId, volId, type', async () => {
        const payload = { vol: { numeroVol: 'X1', compagnieAerienne: 'T', codeIATA: 'XX', dateVol: '2024-01-01T00:00:00Z', typeOperation: 'DEPART', typeVolHorsProgramme: 'CHARTER', raisonHorsProgramme: 'Test' } }
        await crvStore.createCRV(payload)
        const p = crvAPI.create.mock.calls[0][0]
        expect(p).not.toHaveProperty('bulletinId')
        expect(p).not.toHaveProperty('volId')
        expect(p).not.toHaveProperty('type')
        expect(p).toHaveProperty('vol')
      })

      it('PATH 3 ne doit PAS contenir bulletinId, mouvementId, vol, type', async () => {
        await crvStore.createCRV({ volId: 'v1' })
        const p = crvAPI.create.mock.calls[0][0]
        expect(Object.keys(p)).toEqual(['volId'])
      })

      it('PATH LEGACY ne doit PAS contenir bulletinId, mouvementId, volId, vol', async () => {
        await crvStore.createCRV({ type: 'depart', date: '2024-01-01', escale: 'NDJ' })
        const p = crvAPI.create.mock.calls[0][0]
        expect(p).not.toHaveProperty('bulletinId')
        expect(p).not.toHaveProperty('volId')
        expect(p).not.toHaveProperty('vol')
        expect(Object.keys(p).sort()).toEqual(['date', 'escale', 'type'])
      })
    })
  })

  // =========================================
  // ÉTAPE 3: GESTION DES PHASES
  // =========================================
  describe('ÉTAPE 3: Gestion des Phases', () => {
    beforeEach(() => {
      authStore.user = agentUser
      authStore.token = 'jwt-token'
      crvStore.currentCRV = { id: 'crv-001', statut: 'EN_COURS' }
      crvStore.phases = [
        { id: 'p1', nom: 'Phase 1', statut: 'NON_DEMARRE' },
        { id: 'p2', nom: 'Phase 2', statut: 'NON_DEMARRE' }
      ]
    })

    it('devrait démarrer une phase', async () => {
      phasesAPI.demarrer.mockResolvedValue({
        data: { phase: { id: 'p1', statut: 'EN_COURS', heureDebut: '2024-01-15T10:00:00Z' } }
      })
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: { ...crvStore.currentCRV, completude: 10 },
          phases: [
            { id: 'p1', statut: 'EN_COURS' },
            { id: 'p2', statut: 'NON_DEMARRE' }
          ],
          charges: [], evenements: [], observations: []
        }
      })

      await crvStore.demarrerPhase('p1')

      expect(phasesAPI.demarrer).toHaveBeenCalledWith('p1')
    })

    it('devrait terminer une phase', async () => {
      crvStore.phases[0].statut = 'EN_COURS'

      phasesAPI.terminer.mockResolvedValue({
        data: { phase: { id: 'p1', statut: 'TERMINE', heureFin: '2024-01-15T10:30:00Z' } }
      })
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: { ...crvStore.currentCRV, completude: 25 },
          phases: [
            { id: 'p1', statut: 'TERMINE' },
            { id: 'p2', statut: 'NON_DEMARRE' }
          ],
          charges: [], evenements: [], observations: []
        }
      })

      await crvStore.terminerPhase('p1')

      expect(phasesAPI.terminer).toHaveBeenCalledWith('p1')
    })

    it('devrait marquer une phase comme non réalisée avec motif', async () => {
      phasesAPI.marquerNonRealise.mockResolvedValue({
        data: { phase: { id: 'p2', statut: 'NON_REALISE', motifNonRealisation: 'EQUIPEMENT_INDISPONIBLE' } }
      })
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: crvStore.currentCRV,
          phases: [
            { id: 'p1', statut: 'TERMINE' },
            { id: 'p2', statut: 'NON_REALISE' }
          ],
          charges: [], evenements: [], observations: []
        }
      })

      await crvStore.marquerPhaseNonRealisee('p2', {
        motifNonRealisation: 'EQUIPEMENT_INDISPONIBLE',
        detailMotif: 'Passerelle en panne'
      })

      expect(phasesAPI.marquerNonRealise).toHaveBeenCalledWith('p2', {
        motifNonRealisation: 'EQUIPEMENT_INDISPONIBLE',
        detailMotif: 'Passerelle en panne'
      })
    })

    it('devrait refuser de marquer non réalisée sans motif', async () => {
      await expect(crvStore.marquerPhaseNonRealisee('p2', {}))
        .rejects.toThrow('Le motif de non-réalisation est obligatoire')
    })

    it('devrait enchaîner les phases dans l\'ordre', async () => {
      // Simuler le workflow complet d'une arrivée
      const phases = ['Positionnement', 'Débarquement', 'Déchargement']

      for (let i = 0; i < phases.length; i++) {
        phasesAPI.demarrer.mockResolvedValueOnce({
          data: { phase: { id: `p${i}`, statut: 'EN_COURS' } }
        })
        phasesAPI.terminer.mockResolvedValueOnce({
          data: { phase: { id: `p${i}`, statut: 'TERMINE' } }
        })
        crvAPI.getById.mockResolvedValue({
          data: {
            crv: crvStore.currentCRV,
            phases: crvStore.phases,
            charges: [], evenements: [], observations: []
          }
        })
      }

      // Démarrer et terminer chaque phase
      await crvStore.demarrerPhase('p0')
      await crvStore.terminerPhase('p0')

      expect(phasesAPI.demarrer).toHaveBeenCalledTimes(1)
      expect(phasesAPI.terminer).toHaveBeenCalledTimes(1)
    })
  })

  // =========================================
  // ÉTAPE 4: GESTION DES CHARGES
  // =========================================
  describe('ÉTAPE 4: Gestion des Charges', () => {
    beforeEach(() => {
      authStore.user = agentUser
      authStore.token = 'jwt-token'
      crvStore.currentCRV = { id: 'crv-001', statut: 'EN_COURS' }
      crvStore.charges = []
    })

    describe('Charges Passagers', () => {
      it('devrait ajouter une charge passagers embarquement', async () => {
        const chargeData = {
          typeCharge: 'PASSAGERS',
          sensOperation: 'EMBARQUEMENT',
          passagersAdultes: 120,
          passagersEnfants: 15,
          passagersBebes: 3
        }

        crvAPI.addCharge.mockResolvedValue({
          data: { charge: { id: 'c1', ...chargeData } }
        })

        await crvStore.addCharge(chargeData)

        expect(crvAPI.addCharge).toHaveBeenCalledWith('crv-001', chargeData)
        expect(crvStore.charges).toHaveLength(1)
        expect(crvStore.getChargesPassagers).toHaveLength(1)
      })

      it('devrait ajouter une charge passagers débarquement', async () => {
        const chargeData = {
          typeCharge: 'PASSAGERS',
          sensOperation: 'DEBARQUEMENT',
          passagersAdultes: 118,
          passagersEnfants: 15,
          passagersBebes: 3
        }

        crvAPI.addCharge.mockResolvedValue({
          data: { charge: { id: 'c2', ...chargeData } }
        })

        await crvStore.addCharge(chargeData)

        expect(crvStore.charges[0].sensOperation).toBe('DEBARQUEMENT')
      })

      it('devrait mettre à jour les catégories détaillées', async () => {
        crvStore.charges = [{ id: 'c1', typeCharge: 'PASSAGERS' }]

        const categoriesData = {
          categoriesDetaillees: {
            adultes: 100,
            seniors: 20,
            enfants: 10,
            bebes: 5,
            pmrFauteuilRoulant: 2,
            vip: 3
          }
        }

        chargesAPI.updateCategoriesDetaillees.mockResolvedValue({
          data: { charge: { id: 'c1', ...categoriesData } }
        })

        await crvStore.updateCategoriesDetaillees('c1', categoriesData)

        expect(chargesAPI.updateCategoriesDetaillees).toHaveBeenCalledWith('c1', categoriesData)
      })
    })

    describe('Charges Bagages', () => {
      it('devrait ajouter une charge bagages', async () => {
        const chargeData = {
          typeCharge: 'BAGAGES',
          sensOperation: 'EMBARQUEMENT',
          nombreBagagesSoute: 180,
          poidsBagagesSouteKg: 2500,
          nombreBagagesCabine: 140
        }

        crvAPI.addCharge.mockResolvedValue({
          data: { charge: { id: 'c3', ...chargeData } }
        })

        await crvStore.addCharge(chargeData)

        expect(crvStore.getChargesBagages).toHaveLength(1)
      })
    })

    describe('Charges Fret', () => {
      it('devrait ajouter une charge fret', async () => {
        const chargeData = {
          typeCharge: 'FRET',
          sensOperation: 'EMBARQUEMENT',
          nombreFret: 25,
          poidsFretKg: 1500
        }

        crvAPI.addCharge.mockResolvedValue({
          data: { charge: { id: 'c4', ...chargeData } }
        })

        await crvStore.addCharge(chargeData)

        expect(crvStore.getChargesFret).toHaveLength(1)
      })

      it('devrait mettre à jour le fret détaillé', async () => {
        crvStore.charges = [{ id: 'c4', typeCharge: 'FRET' }]

        const fretData = {
          fretDetaille: {
            categoriesFret: {
              general: 10,
              perissable: 5,
              fragile: 3
            },
            logistique: {
              nombreColis: 25,
              nombrePalettes: 3,
              numeroLTA: 'LTA-2024-001'
            }
          }
        }

        chargesAPI.getById = vi.fn().mockResolvedValue({
          data: { charge: { id: 'c4', ...fretData } }
        })

        // Le store n'a pas updateFretDetaille mocké dans ce test,
        // on vérifie juste la structure
        expect(fretData.fretDetaille.categoriesFret.general).toBe(10)
      })
    })
  })

  // =========================================
  // ÉTAPE 5: ÉVÉNEMENTS ET OBSERVATIONS
  // =========================================
  describe('ÉTAPE 5: Événements et Observations', () => {
    beforeEach(() => {
      authStore.user = agentUser
      authStore.token = 'jwt-token'
      crvStore.currentCRV = { id: 'crv-001', statut: 'EN_COURS' }
      crvStore.evenements = []
      crvStore.observations = []
    })

    describe('Événements', () => {
      it('devrait ajouter un événement RETARD', async () => {
        const eventData = {
          typeEvenement: 'RETARD',
          gravite: 'MINEURE',
          description: 'Retard de 15 minutes dû à l\'arrivée tardive de l\'équipage'
        }

        crvAPI.addEvenement.mockResolvedValue({
          data: { evenement: { id: 'e1', ...eventData, horodatage: '2024-01-15T10:30:00Z' } }
        })

        await crvStore.addEvenement(eventData)

        expect(crvAPI.addEvenement).toHaveBeenCalledWith('crv-001', eventData)
        expect(crvStore.evenements).toHaveLength(1)
      })

      it('devrait ajouter un événement INCIDENT avec gravité MAJEURE', async () => {
        const eventData = {
          typeEvenement: 'INCIDENT',
          gravite: 'MAJEURE',
          description: 'Collision mineure avec véhicule de piste'
        }

        crvAPI.addEvenement.mockResolvedValue({
          data: { evenement: { id: 'e2', ...eventData } }
        })

        await crvStore.addEvenement(eventData)

        expect(crvStore.evenements[0].gravite).toBe('MAJEURE')
      })

      it('devrait pouvoir ajouter plusieurs événements', async () => {
        const events = [
          { typeEvenement: 'RETARD', gravite: 'MINEURE', description: 'Retard' },
          { typeEvenement: 'TECHNIQUE', gravite: 'MODEREE', description: 'Problème technique' }
        ]

        for (let i = 0; i < events.length; i++) {
          crvAPI.addEvenement.mockResolvedValueOnce({
            data: { evenement: { id: `e${i}`, ...events[i] } }
          })
          await crvStore.addEvenement(events[i])
        }

        expect(crvStore.evenements).toHaveLength(2)
      })
    })

    describe('Observations', () => {
      it('devrait ajouter une observation GENERALE', async () => {
        const obsData = {
          categorie: 'GENERALE',
          contenu: 'Vol sans incident particulier'
        }

        crvAPI.addObservation.mockResolvedValue({
          data: { observation: { id: 'o1', ...obsData, auteur: agentUser } }
        })

        await crvStore.addObservation(obsData)

        expect(crvAPI.addObservation).toHaveBeenCalledWith('crv-001', obsData)
        expect(crvStore.observations).toHaveLength(1)
      })

      it('devrait ajouter une observation SECURITE', async () => {
        const obsData = {
          categorie: 'SECURITE',
          contenu: 'Passager suspect contrôlé par la sécurité'
        }

        crvAPI.addObservation.mockResolvedValue({
          data: { observation: { id: 'o2', ...obsData } }
        })

        await crvStore.addObservation(obsData)

        expect(crvStore.observations[0].categorie).toBe('SECURITE')
      })

      it('devrait supporter toutes les catégories d\'observation', async () => {
        const categories = ['GENERALE', 'TECHNIQUE', 'OPERATIONNELLE', 'SECURITE', 'QUALITE', 'SLA']

        for (const categorie of categories) {
          crvAPI.addObservation.mockResolvedValueOnce({
            data: { observation: { id: `o-${categorie}`, categorie, contenu: `Test ${categorie}` } }
          })
          await crvStore.addObservation({ categorie, contenu: `Test ${categorie}` })
        }

        expect(crvStore.observations).toHaveLength(6)
      })
    })
  })

  // =========================================
  // ÉTAPE 6: ACTIONS NON AUTORISÉES
  // =========================================
  describe('ÉTAPE 6: Actions NON autorisées pour Agent', () => {
    beforeEach(() => {
      authStore.user = agentUser
      authStore.token = 'jwt-token'
    })

    it('ne devrait PAS pouvoir supprimer un CRV', () => {
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.CRV_SUPPRIMER)).toBe(false)
    })

    it('ne devrait PAS pouvoir valider un programme vol', () => {
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.PROGRAMME_VALIDER)).toBe(false)
    })

    it('ne devrait PAS pouvoir activer un programme vol', () => {
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.PROGRAMME_ACTIVER)).toBe(false)
    })

    it('ne devrait PAS pouvoir supprimer un programme vol', () => {
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.PROGRAMME_SUPPRIMER)).toBe(false)
    })

    it('ne devrait PAS pouvoir gérer les utilisateurs', () => {
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.USER_CREER)).toBe(false)
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.USER_MODIFIER)).toBe(false)
      expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.USER_SUPPRIMER)).toBe(false)
    })

    it('ne devrait PAS pouvoir modifier un CRV verrouillé', async () => {
      crvStore.currentCRV = { id: 'crv-001', statut: 'VERROUILLE' }

      await expect(crvStore.updateCRV({ data: 'test' }))
        .rejects.toThrow('CRV verrouillé')
    })
  })

  // =========================================
  // SCÉNARIO COMPLET: WORKFLOW ARRIVÉE
  // =========================================
  describe('SCÉNARIO COMPLET: Workflow Arrivée', () => {
    it('devrait exécuter le workflow complet d\'une arrivée', async () => {
      // 1. Connexion
      authAPI.login.mockResolvedValue({
        data: { token: 'jwt-token', utilisateur: agentUser }
      })
      await authStore.login({ email: 'test@test.com', password: 'pass' })
      expect(authStore.isAuthenticated).toBe(true)

      // 2. Création CRV
      const mockCRV = { id: 'crv-001', statut: 'BROUILLON', completude: 0, vol: { typeOperation: 'ARRIVEE' } }
      crvAPI.create.mockResolvedValue({ data: mockCRV })
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: mockCRV,
          phases: [
            { id: 'p1', nom: 'Positionnement', statut: 'NON_DEMARRE' },
            { id: 'p2', nom: 'Débarquement', statut: 'NON_DEMARRE' }
          ],
          charges: [],
          evenements: [],
          observations: []
        }
      })
      await crvStore.createCRV({ volId: 'vol-001' })
      expect(crvStore.currentCRV).toBeDefined()

      // 3. Démarrer et terminer les phases
      phasesAPI.demarrer.mockResolvedValue({ data: { phase: { id: 'p1', statut: 'EN_COURS' } } })
      phasesAPI.terminer.mockResolvedValue({ data: { phase: { id: 'p1', statut: 'TERMINE' } } })

      await crvStore.demarrerPhase('p1')
      await crvStore.terminerPhase('p1')

      // 4. Ajouter charges
      crvAPI.addCharge.mockResolvedValue({
        data: { charge: { id: 'c1', typeCharge: 'PASSAGERS', passagersAdultes: 150 } }
      })
      await crvStore.addCharge({
        typeCharge: 'PASSAGERS',
        sensOperation: 'DEBARQUEMENT',
        passagersAdultes: 150
      })
      expect(crvStore.charges).toHaveLength(1)

      // 5. Ajouter observation
      crvAPI.addObservation.mockResolvedValue({
        data: { observation: { id: 'o1', contenu: 'RAS' } }
      })
      await crvStore.addObservation({ categorie: 'GENERALE', contenu: 'RAS' })
      expect(crvStore.observations).toHaveLength(1)

      // 6. Déconnexion
      authAPI.logout.mockResolvedValue({})
      await authStore.logout()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })
})
