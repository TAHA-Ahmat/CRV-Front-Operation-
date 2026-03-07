/**
 * Tests pour le store CRV
 * @file tests/unit/stores/crvStore.test.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCRVStore, ERROR_CODES } from '@/stores/crvStore'

// Mock des API
vi.mock('@/services/api', () => ({
  crvAPI: {
    create: vi.fn(),
    getAll: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addCharge: vi.fn(),
    addEvenement: vi.fn(),
    addObservation: vi.fn(),
    peutAnnuler: vi.fn(),
    annuler: vi.fn(),
    reactiver: vi.fn()
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
    updateFretDetaille: vi.fn(),
    addMarchandiseDangereuse: vi.fn(),
    deleteMarchandiseDangereuse: vi.fn()
  },
  validationAPI: {
    valider: vi.fn(),
    deverrouiller: vi.fn(),
    getStatus: vi.fn()
  }
}))

import { crvAPI, phasesAPI, chargesAPI, validationAPI } from '@/services/api'

describe('CRV Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCRVStore()
    vi.clearAllMocks()
  })

  describe('State initial', () => {
    it('devrait avoir un état initial correct', () => {
      expect(store.currentCRV).toBeNull()
      expect(store.phases).toEqual([])
      expect(store.charges).toEqual([])
      expect(store.evenements).toEqual([])
      expect(store.observations).toEqual([])
      expect(store.crvList).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('devrait avoir une complétude détaillée à 0', () => {
      expect(store.completudeDetails).toEqual({
        phases: 0,
        charges: 0,
        evenements: 0,
        observations: 0
      })
    })
  })

  describe('Getters', () => {
    describe('Statuts CRV', () => {
      it('isValidated devrait être true pour statut VALIDE', () => {
        store.currentCRV = { statut: 'VALIDE' }
        expect(store.isValidated).toBe(true)
      })

      it('isValidated devrait être true pour statut VERROUILLE', () => {
        store.currentCRV = { statut: 'VERROUILLE' }
        expect(store.isValidated).toBe(true)
      })

      it('isLocked devrait être true uniquement pour VERROUILLE', () => {
        store.currentCRV = { statut: 'VERROUILLE' }
        expect(store.isLocked).toBe(true)

        store.currentCRV = { statut: 'VALIDE' }
        expect(store.isLocked).toBe(false)
      })

      it('isCancelled devrait être true pour ANNULE', () => {
        store.currentCRV = { statut: 'ANNULE' }
        expect(store.isCancelled).toBe(true)
      })

      it('isEditable devrait être false pour les statuts finaux', () => {
        store.currentCRV = { statut: 'VALIDE' }
        expect(store.isEditable).toBe(false)

        store.currentCRV = { statut: 'VERROUILLE' }
        expect(store.isEditable).toBe(false)

        store.currentCRV = { statut: 'ANNULE' }
        expect(store.isEditable).toBe(false)
      })

      it('isEditable devrait être true pour EN_COURS', () => {
        store.currentCRV = { statut: 'EN_COURS' }
        expect(store.isEditable).toBe(true)
      })
    })

    describe('Complétude', () => {
      it('completude devrait retourner 0 si non défini', () => {
        store.currentCRV = {}
        expect(store.completude).toBe(0)
      })

      it('completude devrait retourner la valeur du CRV', () => {
        store.currentCRV = { completude: 85 }
        expect(store.completude).toBe(85)
      })

      it('isCompleteEnough devrait être true pour >= 80%', () => {
        store.currentCRV = { completude: 80 }
        expect(store.isCompleteEnough).toBe(true)

        store.currentCRV = { completude: 79 }
        expect(store.isCompleteEnough).toBe(false)
      })
    })

    describe('canValidate', () => {
      it('devrait être false sans CRV', () => {
        expect(store.canValidate).toBe(false)
      })

      it('devrait être false si complétude < 80', () => {
        store.currentCRV = { completude: 75, statut: 'EN_COURS' }
        expect(store.canValidate).toBe(false)
      })

      it('devrait être false si déjà validé', () => {
        store.currentCRV = { completude: 85, statut: 'VALIDE' }
        expect(store.canValidate).toBe(false)
      })

      it('devrait être true si >= 80% et statut modifiable', () => {
        store.currentCRV = { completude: 80, statut: 'EN_COURS' }
        expect(store.canValidate).toBe(true)
      })
    })

    describe('Phases filtrées', () => {
      beforeEach(() => {
        store.phases = [
          { id: 1, statut: 'EN_COURS' },
          { id: 2, statut: 'TERMINE' },
          { id: 3, statut: 'NON_DEMARRE' },
          { id: 4, statut: 'TERMINE' }
        ]
      })

      it('getPhasesEnCours devrait filtrer correctement', () => {
        expect(store.getPhasesEnCours).toHaveLength(1)
        expect(store.getPhasesEnCours[0].id).toBe(1)
      })

      it('getPhasesTerminees devrait filtrer correctement', () => {
        expect(store.getPhasesTerminees).toHaveLength(2)
      })

      it('getPhasesNonDemarrees devrait filtrer correctement', () => {
        expect(store.getPhasesNonDemarrees).toHaveLength(1)
        expect(store.getPhasesNonDemarrees[0].id).toBe(3)
      })
    })

    describe('Charges filtrées', () => {
      beforeEach(() => {
        store.charges = [
          { id: 1, typeCharge: 'PASSAGERS' },
          { id: 2, typeCharge: 'BAGAGES' },
          { id: 3, typeCharge: 'FRET' },
          { id: 4, typeCharge: 'PASSAGERS' }
        ]
      })

      it('getChargesPassagers devrait filtrer correctement', () => {
        expect(store.getChargesPassagers).toHaveLength(2)
      })

      it('getChargesBagages devrait filtrer correctement', () => {
        expect(store.getChargesBagages).toHaveLength(1)
      })

      it('getChargesFret devrait filtrer correctement', () => {
        expect(store.getChargesFret).toHaveLength(1)
      })
    })
  })

  describe('Actions', () => {
    describe('createCRV()', () => {
      it('devrait créer un CRV avec succès', async () => {
        const mockCRV = { id: 'crv123', statut: 'BROUILLON' }
        crvAPI.create.mockResolvedValue({ data: mockCRV })
        crvAPI.getById.mockResolvedValue({
          data: {
            crv: mockCRV,
            phases: [],
            charges: [],
            evenements: [],
            observations: []
          }
        })

        const result = await store.createCRV({ volId: 'vol123' })

        expect(crvAPI.create).toHaveBeenCalledWith({ volId: 'vol123' })
        expect(store.currentCRV).toBeDefined()
      })

      it('devrait gérer les erreurs', async () => {
        const mockError = { response: { data: { message: 'Vol non trouvé' } } }
        crvAPI.create.mockRejectedValue(mockError)

        await expect(store.createCRV({ volId: 'invalid' })).rejects.toEqual(mockError)
        expect(store.error).toBe('Vol non trouvé')
      })
    })

    describe('loadCRV()', () => {
      it('devrait charger un CRV complet', async () => {
        const mockData = {
          crv: { id: 'crv123', completude: 75 },
          phases: [{ id: 'p1', statut: 'EN_COURS' }],
          charges: [{ id: 'c1', typeCharge: 'PASSAGERS' }],
          evenements: [{ id: 'e1' }],
          observations: [{ id: 'o1' }]
        }
        crvAPI.getById.mockResolvedValue({ data: mockData })

        await store.loadCRV('crv123')

        expect(store.currentCRV.id).toBe('crv123')
        expect(store.phases).toHaveLength(1)
        expect(store.charges).toHaveLength(1)
        expect(store.evenements).toHaveLength(1)
        expect(store.observations).toHaveLength(1)
      })
    })

    describe('listCRV()', () => {
      it('devrait charger la liste des CRV avec pagination', async () => {
        // Le store utilise result.data || result, donc on simule la structure
        const mockResponse = {
          success: true,
          data: {
            data: [{ id: 'crv1' }, { id: 'crv2' }],
            total: 50,
            page: 1,
            pages: 5
          }
        }
        crvAPI.getAll.mockResolvedValue({ data: mockResponse })

        await store.listCRV({ statut: 'EN_COURS', page: 1 })

        expect(store.crvList).toHaveLength(2)
        expect(store.crvTotal).toBe(50)
        expect(store.crvPage).toBe(1)
        expect(store.crvPages).toBe(5)
      })
    })

    describe('updateCRV()', () => {
      beforeEach(() => {
        store.currentCRV = { id: 'crv123', statut: 'EN_COURS' }
      })

      it('devrait mettre à jour le CRV', async () => {
        crvAPI.update.mockResolvedValue({ data: { responsableVol: 'user123' } })

        await store.updateCRV({ responsableVol: 'user123' })

        expect(crvAPI.update).toHaveBeenCalledWith('crv123', { responsableVol: 'user123' })
      })

      it('devrait refuser si verrouillé', async () => {
        store.currentCRV = { id: 'crv123', statut: 'VERROUILLE' }

        await expect(store.updateCRV({ data: 'test' }))
          .rejects.toThrow('CRV verrouillé')
      })

      it('devrait échouer sans CRV actif', async () => {
        store.currentCRV = null

        await expect(store.updateCRV({ data: 'test' }))
          .rejects.toThrow('Aucun CRV actif')
      })
    })

    describe('deleteCRV()', () => {
      it('devrait supprimer un CRV de la liste', async () => {
        store.crvList = [{ id: 'crv1' }, { id: 'crv2' }]
        crvAPI.delete.mockResolvedValue({})

        await store.deleteCRV('crv1')

        expect(store.crvList).toHaveLength(1)
        expect(store.crvList[0].id).toBe('crv2')
      })

      it('devrait réinitialiser currentCRV si c\'est celui supprimé', async () => {
        store.currentCRV = { id: 'crv1' }
        store.crvList = [{ id: 'crv1' }]
        crvAPI.delete.mockResolvedValue({})

        await store.deleteCRV('crv1')

        expect(store.currentCRV).toBeNull()
      })
    })

    describe('Gestion des phases', () => {
      beforeEach(() => {
        store.currentCRV = { id: 'crv123', statut: 'EN_COURS' }
        store.phases = [{ id: 'p1', statut: 'NON_DEMARRE' }]
      })

      describe('demarrerPhase()', () => {
        it('devrait démarrer une phase', async () => {
          phasesAPI.demarrer.mockResolvedValue({
            data: { phase: { id: 'p1', statut: 'EN_COURS' } }
          })
          crvAPI.getById.mockResolvedValue({
            data: {
              crv: store.currentCRV,
              phases: [{ id: 'p1', statut: 'EN_COURS' }],
              charges: [], evenements: [], observations: []
            }
          })

          await store.demarrerPhase('p1')

          expect(phasesAPI.demarrer).toHaveBeenCalledWith('p1')
        })
      })

      describe('terminerPhase()', () => {
        it('devrait terminer une phase', async () => {
          phasesAPI.terminer.mockResolvedValue({
            data: { phase: { id: 'p1', statut: 'TERMINE' } }
          })
          crvAPI.getById.mockResolvedValue({
            data: {
              crv: store.currentCRV,
              phases: [{ id: 'p1', statut: 'TERMINE' }],
              charges: [], evenements: [], observations: []
            }
          })

          await store.terminerPhase('p1')

          expect(phasesAPI.terminer).toHaveBeenCalledWith('p1')
        })
      })

      describe('marquerPhaseNonRealisee()', () => {
        it('devrait exiger un motif', async () => {
          await expect(store.marquerPhaseNonRealisee('p1', {}))
            .rejects.toThrow('Le motif de non-réalisation est obligatoire')

          expect(store.errorCode).toBe(ERROR_CODES.MOTIF_NON_REALISATION_REQUIS)
        })

        it('devrait marquer la phase avec un motif', async () => {
          phasesAPI.marquerNonRealise.mockResolvedValue({
            data: { phase: { id: 'p1', statut: 'NON_REALISE' } }
          })
          crvAPI.getById.mockResolvedValue({
            data: {
              crv: store.currentCRV,
              phases: [{ id: 'p1', statut: 'NON_REALISE' }],
              charges: [], evenements: [], observations: []
            }
          })

          await store.marquerPhaseNonRealisee('p1', {
            motifNonRealisation: 'EQUIPEMENT_INDISPONIBLE'
          })

          expect(phasesAPI.marquerNonRealise).toHaveBeenCalledWith('p1', {
            motifNonRealisation: 'EQUIPEMENT_INDISPONIBLE'
          })
        })
      })
    })

    describe('Gestion des charges', () => {
      beforeEach(() => {
        store.currentCRV = { id: 'crv123', statut: 'EN_COURS' }
        store.charges = []
      })

      describe('addCharge()', () => {
        it('devrait ajouter une charge', async () => {
          const chargeData = { typeCharge: 'PASSAGERS', sensOperation: 'EMBARQUEMENT' }
          crvAPI.addCharge.mockResolvedValue({
            data: { charge: { id: 'c1', ...chargeData } }
          })

          await store.addCharge(chargeData)

          expect(crvAPI.addCharge).toHaveBeenCalledWith('crv123', chargeData)
          expect(store.charges).toHaveLength(1)
        })
      })
    })

    describe('Événements et observations', () => {
      beforeEach(() => {
        store.currentCRV = { id: 'crv123', statut: 'EN_COURS' }
      })

      describe('addEvenement()', () => {
        it('devrait ajouter un événement', async () => {
          const eventData = { typeEvenement: 'RETARD', gravite: 'MINEURE' }
          crvAPI.addEvenement.mockResolvedValue({
            data: { evenement: { id: 'e1', ...eventData } }
          })

          await store.addEvenement(eventData)

          expect(crvAPI.addEvenement).toHaveBeenCalledWith('crv123', eventData)
          expect(store.evenements).toHaveLength(1)
        })
      })

      describe('addObservation()', () => {
        it('devrait ajouter une observation', async () => {
          const obsData = { categorie: 'GENERALE', contenu: 'Test' }
          crvAPI.addObservation.mockResolvedValue({
            data: { observation: { id: 'o1', ...obsData } }
          })

          await store.addObservation(obsData)

          expect(crvAPI.addObservation).toHaveBeenCalledWith('crv123', obsData)
          expect(store.observations).toHaveLength(1)
        })
      })
    })

    describe('Validation', () => {
      beforeEach(() => {
        store.currentCRV = { id: 'crv123', completude: 85, statut: 'EN_COURS' }
      })

      describe('validateCRV()', () => {
        it('devrait valider si complétude >= 80%', async () => {
          validationAPI.valider.mockResolvedValue({
            data: { statut: 'VALIDE' }
          })

          await store.validateCRV()

          expect(validationAPI.valider).toHaveBeenCalledWith('crv123')
          expect(store.currentCRV.statut).toBe('VALIDE')
        })

        it('devrait refuser si complétude < 80%', async () => {
          store.currentCRV.completude = 75

          await expect(store.validateCRV())
            .rejects.toThrow('Complétude insuffisante')

          expect(store.errorCode).toBe(ERROR_CODES.COMPLETUDE_INSUFFISANTE)
        })
      })

      describe('deverrouillerCRV()', () => {
        it('devrait déverrouiller avec raison', async () => {
          store.currentCRV.statut = 'VERROUILLE'
          validationAPI.deverrouiller.mockResolvedValue({ data: {} })

          await store.deverrouillerCRV('Correction nécessaire')

          expect(validationAPI.deverrouiller).toHaveBeenCalledWith('crv123', 'Correction nécessaire')
          expect(store.currentCRV.statut).toBe('EN_COURS')
        })
      })
    })

    describe('Extension 6 - Annulation', () => {
      beforeEach(() => {
        store.currentCRV = { _id: 'crv123', statut: 'EN_COURS' }
      })

      describe('peutAnnulerCRV()', () => {
        it('devrait vérifier si annulation possible', async () => {
          crvAPI.peutAnnuler.mockResolvedValue({
            data: { peutAnnuler: true }
          })

          const result = await store.peutAnnulerCRV()

          expect(crvAPI.peutAnnuler).toHaveBeenCalledWith('crv123')
          expect(result.peutAnnuler).toBe(true)
        })
      })

      describe('annulerCRV()', () => {
        it('devrait annuler un CRV', async () => {
          crvAPI.annuler.mockResolvedValue({ data: {} })

          await store.annulerCRV({ motifAnnulation: 'Vol annulé' })

          expect(crvAPI.annuler).toHaveBeenCalledWith('crv123', { motifAnnulation: 'Vol annulé' })
          expect(store.currentCRV.statut).toBe('ANNULE')
        })
      })

      describe('reactiverCRV()', () => {
        it('devrait réactiver un CRV annulé', async () => {
          store.currentCRV.statut = 'ANNULE'
          crvAPI.reactiver.mockResolvedValue({ data: {} })

          await store.reactiverCRV({ motifReactivation: 'Erreur' })

          expect(crvAPI.reactiver).toHaveBeenCalledWith('crv123', { motifReactivation: 'Erreur' })
          expect(store.currentCRV.statut).toBe('EN_COURS')
        })
      })
    })

    describe('Utilitaires', () => {
      describe('resetCurrentCRV()', () => {
        it('devrait réinitialiser l\'état', () => {
          store.currentCRV = { id: 'crv123' }
          store.phases = [{ id: 'p1' }]
          store.charges = [{ id: 'c1' }]
          store.error = 'Une erreur'

          store.resetCurrentCRV()

          expect(store.currentCRV).toBeNull()
          expect(store.phases).toEqual([])
          expect(store.charges).toEqual([])
          expect(store.error).toBeNull()
        })
      })

      describe('clearError()', () => {
        it('devrait effacer l\'erreur et le code', () => {
          store.error = 'Erreur'
          store.errorCode = 'CODE'
          store.errorFields = ['field1']

          store.clearError()

          expect(store.error).toBeNull()
          expect(store.errorCode).toBeNull()
          expect(store.errorFields).toEqual([])
        })
      })
    })

    describe('_calculateCompletudeDetails', () => {
      it('devrait calculer la complétude des phases', () => {
        store.phases = [
          { statut: 'TERMINE' },
          { statut: 'NON_REALISE' },
          { statut: 'EN_COURS' },
          { statut: 'NON_DEMARRE' }
        ]

        store._calculateCompletudeDetails()

        expect(store.completudeDetails.phases).toBe(50) // 2/4 = 50%
      })

      it('devrait calculer la complétude des événements', () => {
        store.evenements = [{ id: 'e1' }]
        store._calculateCompletudeDetails()
        expect(store.completudeDetails.evenements).toBe(100)

        store.evenements = []
        store._calculateCompletudeDetails()
        expect(store.completudeDetails.evenements).toBe(0)
      })

      it('devrait calculer la complétude des observations', () => {
        store.observations = [{ id: 'o1' }]
        store._calculateCompletudeDetails()
        expect(store.completudeDetails.observations).toBe(100)

        store.observations = []
        store._calculateCompletudeDetails()
        expect(store.completudeDetails.observations).toBe(0)
      })
    })
  })

  describe('Codes d\'erreur', () => {
    it('devrait avoir les codes d\'erreur définis', () => {
      expect(ERROR_CODES.CRV_VERROUILLE).toBe('CRV_VERROUILLE')
      expect(ERROR_CODES.COMPLETUDE_INSUFFISANTE).toBe('COMPLETUDE_INSUFFISANTE')
      expect(ERROR_CODES.MOTIF_NON_REALISATION_REQUIS).toBe('MOTIF_NON_REALISATION_REQUIS')
      expect(ERROR_CODES.INCOHERENCE_TYPE_OPERATION).toBe('INCOHERENCE_TYPE_OPERATION')
    })
  })
})
