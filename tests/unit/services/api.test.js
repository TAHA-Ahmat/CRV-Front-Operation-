/**
 * Tests pour le service API
 * @file tests/unit/services/api.test.js
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import axios from 'axios'

// Mock axios avant l'import du module
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    },
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
  return { default: mockAxios }
})

// Import après le mock
import api, {
  authAPI,
  personnesAPI,
  crvAPI,
  phasesAPI,
  volsAPI,
  programmesVolAPI,
  chargesAPI,
  avionsAPI,
  notificationsAPI,
  slaAPI,
  validationAPI
} from '@/services/api'

describe('Service API', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Configuration Axios', () => {
    it('devrait exporter une instance axios par défaut', () => {
      expect(api).toBeDefined()
    })

    it('devrait avoir les méthodes HTTP disponibles', () => {
      expect(typeof axios.get).toBe('function')
      expect(typeof axios.post).toBe('function')
      expect(typeof axios.patch).toBe('function')
      expect(typeof axios.delete).toBe('function')
    })
  })

  describe('authAPI', () => {
    describe('login()', () => {
      it('devrait appeler POST /auth/connexion avec les bonnes données', async () => {
        const credentials = { email: 'test@test.com', password: 'password123' }

        axios.post.mockResolvedValue({ data: { token: 'abc' } })

        await authAPI.login(credentials)

        expect(axios.post).toHaveBeenCalledWith('/auth/connexion', {
          email: 'test@test.com',
          motDePasse: 'password123'
        })
      })

      it('devrait gérer motDePasse en français', async () => {
        const credentials = { email: 'test@test.com', motDePasse: 'password123' }

        axios.post.mockResolvedValue({ data: { token: 'abc' } })

        await authAPI.login(credentials)

        expect(axios.post).toHaveBeenCalledWith('/auth/connexion', {
          email: 'test@test.com',
          motDePasse: 'password123'
        })
      })
    })

    describe('me()', () => {
      it('devrait appeler GET /auth/me', async () => {
        axios.get.mockResolvedValue({ data: { utilisateur: {} } })

        await authAPI.me()

        expect(axios.get).toHaveBeenCalledWith('/auth/me')
      })
    })

    describe('logout()', () => {
      it('devrait appeler POST /auth/deconnexion', async () => {
        axios.post.mockResolvedValue({})

        await authAPI.logout()

        expect(axios.post).toHaveBeenCalledWith('/auth/deconnexion')
      })
    })

    describe('changerMotDePasse()', () => {
      it('devrait appeler POST /auth/changer-mot-de-passe', async () => {
        const data = { ancienMotDePasse: 'old', nouveauMotDePasse: 'new' }
        axios.post.mockResolvedValue({})

        await authAPI.changerMotDePasse(data)

        expect(axios.post).toHaveBeenCalledWith('/auth/changer-mot-de-passe', data)
      })
    })
  })

  describe('personnesAPI', () => {
    describe('getAll()', () => {
      it('devrait appeler GET /personnes avec les paramètres', async () => {
        const params = { page: 1, limit: 10, fonction: 'MANAGER' }
        axios.get.mockResolvedValue({ data: [] })

        await personnesAPI.getAll(params)

        expect(axios.get).toHaveBeenCalledWith('/personnes', { params })
      })
    })

    describe('getById()', () => {
      it('devrait appeler GET /personnes/:id', async () => {
        axios.get.mockResolvedValue({ data: {} })

        await personnesAPI.getById('123')

        expect(axios.get).toHaveBeenCalledWith('/personnes/123')
      })
    })

    describe('create()', () => {
      it('devrait appeler POST /personnes', async () => {
        const userData = { nom: 'Dupont', email: 'dupont@test.com', fonction: 'AGENT_ESCALE' }
        axios.post.mockResolvedValue({ data: {} })

        await personnesAPI.create(userData)

        expect(axios.post).toHaveBeenCalledWith('/personnes', userData)
      })
    })

    describe('update()', () => {
      it('devrait appeler PATCH /personnes/:id', async () => {
        const updateData = { nom: 'Martin' }
        axios.patch.mockResolvedValue({ data: {} })

        await personnesAPI.update('123', updateData)

        expect(axios.patch).toHaveBeenCalledWith('/personnes/123', updateData)
      })
    })

    describe('delete()', () => {
      it('devrait appeler DELETE /personnes/:id', async () => {
        axios.delete.mockResolvedValue({})

        await personnesAPI.delete('123')

        expect(axios.delete).toHaveBeenCalledWith('/personnes/123')
      })
    })

    describe('Helpers', () => {
      it('desactiver devrait appeler update avec le bon statut', async () => {
        axios.patch.mockResolvedValue({})

        await personnesAPI.desactiver('123', 'Inactif')

        expect(axios.patch).toHaveBeenCalledWith('/personnes/123', {
          statutCompte: 'DESACTIVE',
          raisonDesactivation: 'Inactif'
        })
      })

      it('reactiver devrait appeler update avec statutCompte VALIDE', async () => {
        axios.patch.mockResolvedValue({})

        await personnesAPI.reactiver('123')

        expect(axios.patch).toHaveBeenCalledWith('/personnes/123', {
          statutCompte: 'VALIDE'
        })
      })
    })
  })

  describe('crvAPI', () => {
    describe('create()', () => {
      it('devrait appeler POST /crv', async () => {
        const data = { volId: 'vol123' }
        axios.post.mockResolvedValue({ data: {} })

        await crvAPI.create(data)

        expect(axios.post).toHaveBeenCalledWith('/crv', data)
      })
    })

    describe('getAll()', () => {
      it('devrait appeler GET /crv avec paramètres', async () => {
        const params = { statut: 'EN_COURS', page: 1 }
        axios.get.mockResolvedValue({ data: [] })

        await crvAPI.getAll(params)

        expect(axios.get).toHaveBeenCalledWith('/crv', { params })
      })
    })

    describe('getById()', () => {
      it('devrait appeler GET /crv/:id', async () => {
        axios.get.mockResolvedValue({ data: {} })

        await crvAPI.getById('crv123')

        expect(axios.get).toHaveBeenCalledWith('/crv/crv123')
      })
    })

    describe('update()', () => {
      it('devrait appeler PATCH /crv/:id', async () => {
        axios.patch.mockResolvedValue({ data: {} })

        await crvAPI.update('crv123', { statut: 'TERMINE' })

        expect(axios.patch).toHaveBeenCalledWith('/crv/crv123', { statut: 'TERMINE' })
      })
    })

    describe('delete()', () => {
      it('devrait appeler DELETE /crv/:id', async () => {
        axios.delete.mockResolvedValue({})

        await crvAPI.delete('crv123')

        expect(axios.delete).toHaveBeenCalledWith('/crv/crv123')
      })
    })

    describe('addCharge()', () => {
      it('devrait appeler POST /crv/:id/charges', async () => {
        const chargeData = { typeCharge: 'PASSAGERS', sensOperation: 'EMBARQUEMENT' }
        axios.post.mockResolvedValue({ data: {} })

        await crvAPI.addCharge('crv123', chargeData)

        expect(axios.post).toHaveBeenCalledWith('/crv/crv123/charges', chargeData)
      })
    })

    describe('addEvenement()', () => {
      it('devrait appeler POST /crv/:id/evenements', async () => {
        const eventData = { typeEvenement: 'RETARD', gravite: 'MINEURE' }
        axios.post.mockResolvedValue({ data: {} })

        await crvAPI.addEvenement('crv123', eventData)

        expect(axios.post).toHaveBeenCalledWith('/crv/crv123/evenements', eventData)
      })
    })

    describe('Extension 6 - Annulation', () => {
      it('peutAnnuler devrait appeler GET /crv/:id/peut-annuler', async () => {
        axios.get.mockResolvedValue({ data: { peutAnnuler: true } })

        await crvAPI.peutAnnuler('crv123')

        expect(axios.get).toHaveBeenCalledWith('/crv/crv123/peut-annuler')
      })

      it('annuler devrait appeler POST /crv/:id/annuler', async () => {
        axios.post.mockResolvedValue({ data: {} })

        await crvAPI.annuler('crv123', { motifAnnulation: 'Vol annulé' })

        expect(axios.post).toHaveBeenCalledWith('/crv/crv123/annuler', { motifAnnulation: 'Vol annulé' })
      })

      it('reactiver devrait appeler POST /crv/:id/reactiver', async () => {
        axios.post.mockResolvedValue({ data: {} })

        await crvAPI.reactiver('crv123', { motifReactivation: 'Erreur' })

        expect(axios.post).toHaveBeenCalledWith('/crv/crv123/reactiver', { motifReactivation: 'Erreur' })
      })
    })

    describe('export()', () => {
      it('devrait appeler GET /crv/export avec responseType blob', async () => {
        axios.get.mockResolvedValue({ data: new Blob() })

        await crvAPI.export({ format: 'excel' })

        expect(axios.get).toHaveBeenCalledWith('/crv/export', {
          params: { format: 'excel' },
          responseType: 'blob'
        })
      })
    })
  })

  describe('phasesAPI', () => {
    describe('demarrer()', () => {
      it('devrait appeler POST /phases/:id/demarrer', async () => {
        axios.post.mockResolvedValue({ data: {} })

        await phasesAPI.demarrer('phase123')

        expect(axios.post).toHaveBeenCalledWith('/phases/phase123/demarrer')
      })
    })

    describe('terminer()', () => {
      it('devrait appeler POST /phases/:id/terminer', async () => {
        axios.post.mockResolvedValue({ data: {} })

        await phasesAPI.terminer('phase123')

        expect(axios.post).toHaveBeenCalledWith('/phases/phase123/terminer')
      })
    })

    describe('marquerNonRealise()', () => {
      it('devrait appeler POST /phases/:id/non-realise', async () => {
        const data = { motifNonRealisation: 'EQUIPEMENT_INDISPONIBLE' }
        axios.post.mockResolvedValue({ data: {} })

        await phasesAPI.marquerNonRealise('phase123', data)

        expect(axios.post).toHaveBeenCalledWith('/phases/phase123/non-realise', data)
      })
    })

    describe('update()', () => {
      it('devrait appeler PATCH /phases/:id', async () => {
        axios.patch.mockResolvedValue({ data: {} })

        await phasesAPI.update('phase123', { personnelAffecte: ['user1'] })

        expect(axios.patch).toHaveBeenCalledWith('/phases/phase123', { personnelAffecte: ['user1'] })
      })
    })
  })

  describe('volsAPI', () => {
    describe('create()', () => {
      it('devrait appeler POST /vols', async () => {
        const volData = { numeroVol: 'AF123', typeOperation: 'ARRIVEE' }
        axios.post.mockResolvedValue({ data: {} })

        await volsAPI.create(volData)

        expect(axios.post).toHaveBeenCalledWith('/vols', volData)
      })
    })

    describe('lierProgramme()', () => {
      it('devrait appeler POST /vols/:id/lier-programme', async () => {
        axios.post.mockResolvedValue({ data: {} })

        await volsAPI.lierProgramme('vol123', 'prog456')

        expect(axios.post).toHaveBeenCalledWith('/vols/vol123/lier-programme', { programmeId: 'prog456' })
      })
    })

    describe('marquerHorsProgramme()', () => {
      it('devrait appeler POST /vols/:id/marquer-hors-programme', async () => {
        const data = { typeVolHorsProgramme: 'CHARTER' }
        axios.post.mockResolvedValue({ data: {} })

        await volsAPI.marquerHorsProgramme('vol123', data)

        expect(axios.post).toHaveBeenCalledWith('/vols/vol123/marquer-hors-programme', data)
      })
    })

    describe('getHorsProgramme()', () => {
      it('devrait appeler GET /vols/hors-programme', async () => {
        axios.get.mockResolvedValue({ data: [] })

        await volsAPI.getHorsProgramme({ page: 1 })

        expect(axios.get).toHaveBeenCalledWith('/vols/hors-programme', { params: { page: 1 } })
      })
    })
  })

  describe('programmesVolAPI', () => {
    describe('valider()', () => {
      it('devrait appeler POST /programmes-vol/:id/valider', async () => {
        axios.post.mockResolvedValue({ data: {} })

        await programmesVolAPI.valider('prog123')

        expect(axios.post).toHaveBeenCalledWith('/programmes-vol/prog123/valider')
      })
    })

    describe('activer()', () => {
      it('devrait appeler POST /programmes-vol/:id/activer', async () => {
        axios.post.mockResolvedValue({ data: {} })

        await programmesVolAPI.activer('prog123')

        expect(axios.post).toHaveBeenCalledWith('/programmes-vol/prog123/activer')
      })
    })

    describe('suspendre()', () => {
      it('devrait appeler POST /programmes-vol/:id/suspendre avec raison', async () => {
        axios.post.mockResolvedValue({ data: {} })

        await programmesVolAPI.suspendre('prog123', 'Maintenance')

        expect(axios.post).toHaveBeenCalledWith('/programmes-vol/prog123/suspendre', { raison: 'Maintenance' })
      })
    })

    describe('getApplicables()', () => {
      it('devrait appeler GET /programmes-vol/applicables/:date', async () => {
        axios.get.mockResolvedValue({ data: [] })

        await programmesVolAPI.getApplicables('2024-01-15')

        expect(axios.get).toHaveBeenCalledWith('/programmes-vol/applicables/2024-01-15')
      })
    })
  })

  describe('chargesAPI', () => {
    describe('updateCategoriesDetaillees()', () => {
      it('devrait appeler PUT /charges/:id/categories-detaillees', async () => {
        const data = { categoriesDetaillees: { adultes: 100 } }
        axios.put.mockResolvedValue({ data: {} })

        await chargesAPI.updateCategoriesDetaillees('charge123', data)

        expect(axios.put).toHaveBeenCalledWith('/charges/charge123/categories-detaillees', data)
      })
    })

    describe('addMarchandiseDangereuse()', () => {
      it('devrait appeler POST /charges/:id/marchandises-dangereuses', async () => {
        const dgr = { codeONU: 'UN1234', classeONU: '3' }
        axios.post.mockResolvedValue({ data: {} })

        await chargesAPI.addMarchandiseDangereuse('charge123', dgr)

        expect(axios.post).toHaveBeenCalledWith('/charges/charge123/marchandises-dangereuses', dgr)
      })
    })

    describe('validerMarchandiseDangereuse()', () => {
      it('devrait appeler POST /charges/valider-marchandise-dangereuse', async () => {
        const dgr = { codeONU: 'UN1234' }
        axios.post.mockResolvedValue({ data: { valide: true } })

        await chargesAPI.validerMarchandiseDangereuse(dgr)

        expect(axios.post).toHaveBeenCalledWith('/charges/valider-marchandise-dangereuse', dgr)
      })
    })
  })

  describe('notificationsAPI', () => {
    describe('getCountNonLues()', () => {
      it('devrait appeler GET /notifications/count-non-lues', async () => {
        axios.get.mockResolvedValue({ data: { count: 5 } })

        await notificationsAPI.getCountNonLues()

        expect(axios.get).toHaveBeenCalledWith('/notifications/count-non-lues')
      })
    })

    describe('marquerToutesLues()', () => {
      it('devrait appeler PATCH /notifications/lire-toutes', async () => {
        axios.patch.mockResolvedValue({})

        await notificationsAPI.marquerToutesLues()

        expect(axios.patch).toHaveBeenCalledWith('/notifications/lire-toutes')
      })
    })

    describe('marquerLue()', () => {
      it('devrait appeler PATCH /notifications/:id/lire', async () => {
        axios.patch.mockResolvedValue({})

        await notificationsAPI.marquerLue('notif123')

        expect(axios.patch).toHaveBeenCalledWith('/notifications/notif123/lire')
      })
    })
  })

  describe('slaAPI', () => {
    describe('getRapport()', () => {
      it('devrait appeler GET /sla/rapport', async () => {
        axios.get.mockResolvedValue({ data: {} })

        await slaAPI.getRapport({ dateDebut: '2024-01-01' })

        expect(axios.get).toHaveBeenCalledWith('/sla/rapport', { params: { dateDebut: '2024-01-01' } })
      })
    })

    describe('surveillerCRV()', () => {
      it('devrait appeler POST /sla/surveiller/crv', async () => {
        axios.post.mockResolvedValue({})

        await slaAPI.surveillerCRV('crv123')

        expect(axios.post).toHaveBeenCalledWith('/sla/surveiller/crv', { crvId: 'crv123' })
      })
    })
  })

  describe('validationAPI', () => {
    describe('valider()', () => {
      it('devrait appeler POST /validation/:id/valider', async () => {
        axios.post.mockResolvedValue({ data: {} })

        await validationAPI.valider('crv123')

        expect(axios.post).toHaveBeenCalledWith('/validation/crv123/valider')
      })
    })

    describe('deverrouiller()', () => {
      it('devrait appeler POST /validation/:id/deverrouiller avec raison', async () => {
        axios.post.mockResolvedValue({ data: {} })

        await validationAPI.deverrouiller('crv123', 'Correction nécessaire')

        expect(axios.post).toHaveBeenCalledWith('/validation/crv123/deverrouiller', { raison: 'Correction nécessaire' })
      })
    })

    describe('getStatus()', () => {
      it('devrait appeler GET /validation/:id', async () => {
        axios.get.mockResolvedValue({ data: {} })

        await validationAPI.getStatus('crv123')

        expect(axios.get).toHaveBeenCalledWith('/validation/crv123')
      })
    })
  })
})
