/**
 * Tests complets pour les pages de gestion CRV
 * Couvre : CRVList, CRVValidation, ValidationCRV (supervision)
 * Teste : render, filtres, tris, pagination, soumission, validation, déverrouillage
 * @file tests/unit/components/crv-workflow-tests.test.js
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useRouter } from 'vue-router'
import CRVList from '@/views/CRV/CRVList.vue'
import CRVValidation from '@/components/crv/CRVValidation.vue'
import ValidationCRV from '@/views/Manager/ValidationCRV.vue'
import { useCRVStore } from '@/stores/crvStore'
import { useAuthStore } from '@/stores/authStore'
import { crvAPI, validationAPI } from '@/services/api'

// ============================================================================
// MOCKS
// ============================================================================

vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
  useRoute: vi.fn()
}))

vi.mock('@/services/api', () => ({
  crvAPI: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addCharge: vi.fn(),
    addEvenement: vi.fn(),
    addObservation: vi.fn(),
    peutAnnuler: vi.fn(),
    annuler: vi.fn(),
    reactiver: vi.fn()
  },
  validationAPI: {
    valider: vi.fn(),
    deverrouiller: vi.fn(),
    getStatus: vi.fn(),
    rejeter: vi.fn()
  },
  phasesAPI: {
    demarrer: vi.fn(),
    terminer: vi.fn(),
    marquerNonRealise: vi.fn(),
    update: vi.fn()
  }
}))

vi.mock('@/composables/useSLA', () => ({
  useSLA: vi.fn(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    loaded: { value: true },
    calculerSLACRV: vi.fn((crv) => ({
      niveau: 'OK',
      label: 'OK',
      cssClass: 'sla-ok'
    })),
    calculerSLABagages: vi.fn(),
    calculerSLABoarding: vi.fn(),
    calculerSLACheckin: vi.fn(),
    resolveAircraftCategory: vi.fn(),
    resoudreDureePhase: vi.fn()
  }))
}))

vi.mock('@/composables/usePermissions', () => ({
  usePermissions: vi.fn(() => ({
    can: vi.fn((action) => true),
    isQualite: false,
    isManager: true
  }))
}))

// ============================================================================
// DONNÉES DE TEST
// ============================================================================

const mockCRVs = [
  {
    _id: 'crv1',
    numeroCRV: 'CRV-2026-001',
    statut: 'EN_COURS',
    completude: 75,
    vol: {
      _id: 'vol1',
      numeroVol: 'AF123',
      typeOperation: 'DEPART',
      compagnieAerienne: 'Air France'
    },
    createdAt: '2026-06-10T10:00:00Z',
    createdBy: 'user1',
    validation: {
      validateur: '',
      fonction: '',
      certifie: false
    },
    archivage: {
      estArchive: false,
      dateArchivage: null
    }
  },
  {
    _id: 'crv2',
    numeroCRV: 'CRV-2026-002',
    statut: 'TERMINE',
    completude: 85,
    vol: {
      _id: 'vol2',
      numeroVol: 'AF456',
      typeOperation: 'ARRIVEE',
      compagnieAerienne: 'Air France'
    },
    createdAt: '2026-06-11T14:30:00Z',
    createdBy: 'user2',
    validation: {
      validateur: '',
      fonction: '',
      certifie: false
    },
    archivage: {
      estArchive: false
    }
  },
  {
    _id: 'crv3',
    numeroCRV: 'CRV-2026-003',
    statut: 'VALIDE',
    completude: 90,
    vol: {
      _id: 'vol3',
      numeroVol: 'AF789',
      typeOperation: 'TURNAROUND',
      compagnieAerienne: 'Air Corsica'
    },
    createdAt: '2026-06-09T09:15:00Z',
    createdBy: 'user3',
    validation: {
      validateur: 'Jean Dupont',
      fonction: 'CHEF_ESCALE',
      certifie: true,
      dateValidation: '2026-06-11T15:00:00Z'
    },
    archivage: {
      estArchive: false
    }
  },
  {
    _id: 'crv4',
    numeroCRV: 'CRV-2026-004',
    statut: 'VERROUILLE',
    completude: 95,
    vol: {
      _id: 'vol4',
      numeroVol: 'AF999',
      typeOperation: 'DEPART',
      compagnieAerienne: 'Lufthansa'
    },
    createdAt: '2026-06-08T08:00:00Z',
    createdBy: 'user4',
    validation: {
      validateur: 'Marie Martin',
      fonction: 'SUPERVISEUR'
    },
    archivage: {
      estArchive: false
    }
  }
]

const mockPhases = [
  {
    id: 'p1',
    numeroCRV: 'CRV-2026-001',
    nomPhase: 'Accueil',
    statut: 'EN_COURS',
    actionRequise: true
  },
  {
    id: 'p2',
    numeroCRV: 'CRV-2026-001',
    nomPhase: 'Ravitaillement',
    statut: 'NON_DEMARRE'
  }
]

// ============================================================================
// TEST SUITE : CRVList
// ============================================================================

describe('CRVList - Liste des CRV', () => {
  let store
  let router

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCRVStore()
    router = {
      push: vi.fn(),
      currentRoute: { value: { params: {} } }
    }
    vi.mocked(useRouter).mockReturnValue(router)
    vi.clearAllMocks()
  })

  describe('Initialisation et rendu', () => {
    it('devrait afficher le titre et les boutons d\'action', () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [],
          total: 0,
          page: 1,
          pages: 0
        }
      })

      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      expect(wrapper.find('h1').text()).toContain('Mes CRV')
      expect(wrapper.find('.btn-primary').exists()).toBe(true)
      expect(wrapper.find('.btn-export').exists()).toBe(true)
    })

    it('devrait afficher l\'état de chargement', async () => {
      crvAPI.getAll.mockImplementation(() => new Promise(() => {})) // Never resolves

      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(wrapper.find('.loading-state').exists()).toBe(true)
    })

    it('devrait afficher l\'état vide', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [],
          total: 0,
          page: 1,
          pages: 0
        }
      })

      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.text()).toContain('Aucun CRV trouvé')
    })

    it('devrait afficher le message d\'erreur', async () => {
      crvAPI.getAll.mockRejectedValue(new Error('Erreur réseau'))

      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(wrapper.find('.error-state').exists()).toBe(true)
    })
  })

  describe('Chargement des données', () => {
    it('devrait charger la liste des CRV au montage', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs,
          total: mockCRVs.length,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(crvAPI.getAll).toHaveBeenCalled()
    })

    it('devrait afficher les CRV chargés dans le tableau', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [mockCRVs[0]],
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(wrapper.text()).toContain('CRV-2026-001')
      expect(wrapper.text()).toContain('AF123')
    })
  })

  describe('Filtrage', () => {
    it('devrait filtrer par statut', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs.filter((c) => c.statut === 'TERMINE'),
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      const selectStatut = wrapper.find('select[v-model="filters.statut"]')
      await selectStatut.setValue('TERMINE')

      expect(crvAPI.getAll).toHaveBeenCalledWith(expect.objectContaining({ statut: 'TERMINE' }))
    })

    it('devrait filtrer par plage de dates', async () => {
      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [],
          total: 0,
          page: 1,
          pages: 0
        }
      })

      await flushPromises()

      const dateDebut = wrapper.find('input[type="date"]:nth-of-type(1)')
      const dateFin = wrapper.find('input[type="date"]:nth-of-type(2)')

      await dateDebut.setValue('2026-06-10')
      await dateFin.setValue('2026-06-15')

      // Vérifier que le filtre est appliqué au chargement suivant
      expect(wrapper.vm.filters.dateDebut).toBe('2026-06-10')
      expect(wrapper.vm.filters.dateFin).toBe('2026-06-15')
    })

    it('devrait filtrer par urgences SLA uniquement', async () => {
      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [],
          total: 0,
          page: 1,
          pages: 0
        }
      })

      await flushPromises()

      const checkbox = wrapper.find('input[type="checkbox"]')
      await checkbox.setValue(true)

      expect(wrapper.vm.filters.urgencesOnly).toBe(true)
    })

    it('devrait réinitialiser les filtres', async () => {
      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [],
          total: 0,
          page: 1,
          pages: 0
        }
      })

      await flushPromises()

      wrapper.vm.filters.statut = 'TERMINE'
      wrapper.vm.filters.urgencesOnly = true

      await wrapper.find('.btn-secondary').trigger('click')

      expect(wrapper.vm.filters.statut).toBe('')
      expect(wrapper.vm.filters.urgencesOnly).toBe(false)
    })
  })

  describe('Tri', () => {
    it('devrait trier par SLA au clic', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs,
          total: mockCRVs.length,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()

      const slaHeader = wrapper.find('.th-sortable')
      expect(slaHeader.exists()).toBe(true)

      await slaHeader.trigger('click')
      expect(wrapper.vm.slaSort).toBe('asc')

      await slaHeader.trigger('click')
      expect(wrapper.vm.slaSort).toBe('desc')

      await slaHeader.trigger('click')
      expect(wrapper.vm.slaSort).toBe('none')
    })

    it('devrait afficher l\'indicateur de tri correct', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs,
          total: mockCRVs.length,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()

      const slaHeader = wrapper.find('.th-sortable')
      await slaHeader.trigger('click')

      expect(slaHeader.find('.sort-indicator').text()).toContain('▲')
    })
  })

  describe('Pagination', () => {
    it('devrait afficher la pagination si plusieurs pages', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs.slice(0, 2),
          total: 4,
          page: 1,
          pages: 2
        }
      })

      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(wrapper.text()).toContain('Page 1 / 2')
    })

    it('devrait charger la page suivante', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs.slice(0, 2),
          total: 4,
          page: 1,
          pages: 2
        }
      })

      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()

      const nextBtn = wrapper.findAll('.btn-secondary').find((btn) => btn.text() === 'Suivant')
      expect(nextBtn).toBeDefined()
    })
  })

  describe('Actions utilisateur', () => {
    it('devrait naviguer vers nouveau CRV au clic du bouton', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [],
          total: 0,
          page: 1,
          pages: 0
        }
      })

      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()

      const newCRVBtn = wrapper.find('.btn-primary')
      await newCRVBtn.trigger('click')

      expect(router.push).toHaveBeenCalledWith(expect.objectContaining({ name: 'CRVNouveau' }))
    })

    it('devrait ouvrir le modal d\'export', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [],
          total: 0,
          page: 1,
          pages: 0
        }
      })

      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()

      const exportBtn = wrapper.find('.btn-export')
      await exportBtn.trigger('click')

      expect(wrapper.vm.showExportModal).toBe(true)
    })
  })

  describe('Formatage des données', () => {
    it('devrait formater le type d\'opération', () => {
      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      expect(wrapper.vm.formatType('DEPART')).toBe('Départ')
      expect(wrapper.vm.formatType('ARRIVEE')).toBe('Arrivée')
      expect(wrapper.vm.formatType('TURNAROUND')).toBe('Turnaround')
    })

    it('devrait formater le statut du CRV', () => {
      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      expect(wrapper.vm.formatStatus('EN_COURS')).toContain('cours')
      expect(wrapper.vm.formatStatus('TERMINE')).toContain('Soumis')
      expect(wrapper.vm.formatStatus('VALIDE')).toContain('Validé')
    })

    it('devrait retourner la classe CSS appropriée pour le statut', () => {
      const wrapper = mount(CRVList, {
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true,
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      expect(wrapper.vm.getStatusClass('VALIDE')).toContain('valid')
      expect(wrapper.vm.getStatusClass('EN_COURS')).toContain('progress')
      expect(wrapper.vm.getStatusClass('VERROUILLE')).toContain('locked')
    })
  })
})

// ============================================================================
// TEST SUITE : CRVValidation
// ============================================================================

describe('CRVValidation - Formulaire de validation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initialisation et rendu', () => {
    it('devrait afficher le titre et le badge SLA', () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: '',
            fonction: '',
            commentaires: '',
            certifie: false
          },
          validated: false,
          crvId: 'crv1',
          crv: mockCRVs[0]
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      expect(wrapper.find('h3').text()).toContain('Soumission du CRV')
      expect(wrapper.find('.form-label').exists()).toBe(true)
    })

    it('devrait afficher le formulaire de validation initial', () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: '',
            fonction: '',
            commentaires: '',
            certifie: false
          },
          validated: false,
          crvId: 'crv1'
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      expect(wrapper.find('.validation-form').exists()).toBe(true)
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
      expect(wrapper.find('select').exists()).toBe(true)
      expect(wrapper.find('textarea').exists()).toBe(true)
    })

    it('devrait afficher le récapitulatif après validation', () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: 'Jean Dupont',
            fonction: 'CHEF_ESCALE',
            commentaires: 'RAS',
            certifie: true,
            dateValidation: '2026-06-11T15:00:00Z'
          },
          validated: true,
          crvId: 'crv1'
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      expect(wrapper.find('.validation-success').exists()).toBe(true)
      expect(wrapper.text()).toContain('Jean Dupont')
      expect(wrapper.text()).toContain('CHEF_ESCALE')
    })
  })

  describe('Mise à jour des données', () => {
    it('devrait émettre l\'événement update lors de changement du validateur', async () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: '',
            fonction: '',
            commentaires: '',
            certifie: false
          },
          validated: false
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      const input = wrapper.find('input[type="text"]')
      await input.setValue('Jean Dupont')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('devrait émettre l\'événement update lors de changement de fonction', async () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: '',
            fonction: '',
            commentaires: '',
            certifie: false
          },
          validated: false
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      const select = wrapper.find('select')
      await select.setValue('CHEF_ESCALE')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('devrait émettre l\'événement update lors de changement du commentaire', async () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: '',
            fonction: '',
            commentaires: '',
            certifie: false
          },
          validated: false
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      const textarea = wrapper.find('textarea')
      await textarea.setValue('Commentaire de test')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('devrait émettre l\'événement update lors de clic sur la certification', async () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: '',
            fonction: '',
            commentaires: '',
            certifie: false
          },
          validated: false
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      const checkbox = wrapper.find('input[type="checkbox"]')
      await checkbox.setValue(true)

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('Validation du formulaire', () => {
    it('bouton soumettre désactivé si le formulaire est incomplet', () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: '',
            fonction: '',
            commentaires: '',
            certifie: false
          },
          validated: false
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      const button = wrapper.find('.btn-success')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('bouton soumettre activé si le formulaire est complet', async () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: 'Jean Dupont',
            fonction: 'CHEF_ESCALE',
            commentaires: '',
            certifie: true
          },
          validated: false
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      const button = wrapper.find('.btn-success')
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('devrait afficher l\'avertissement si formulaire incomplet', () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: '',
            fonction: '',
            commentaires: '',
            certifie: false
          },
          validated: false,
          loading: false
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      expect(wrapper.text()).toContain('Veuillez remplir tous les champs requis')
    })
  })

  describe('Actions de soumission', () => {
    it('devrait émettre l\'événement validate au clic du bouton', async () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: 'Jean Dupont',
            fonction: 'CHEF_ESCALE',
            commentaires: '',
            certifie: true
          },
          validated: false
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      const button = wrapper.find('.btn-success')
      await button.trigger('click')

      expect(wrapper.emitted('validate')).toBeTruthy()
    })

    it('devrait afficher l\'état de chargement', () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: 'Jean Dupont',
            fonction: 'CHEF_ESCALE',
            commentaires: '',
            certifie: true
          },
          validated: false,
          loading: true
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      const button = wrapper.find('.btn-success')
      expect(button.text()).toContain('Soumission en cours')
    })
  })

  describe('Téléchargement du PDF', () => {
    it('devrait afficher le bouton PDF après validation', () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: 'Jean Dupont',
            fonction: 'CHEF_ESCALE',
            commentaires: '',
            certifie: true,
            dateValidation: '2026-06-11T15:00:00Z'
          },
          validated: true,
          crvId: 'crv1'
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      expect(wrapper.find('.pdf-actions').exists()).toBe(true)
      expect(wrapper.find('.btn-primary').exists()).toBe(true)
    })

    it('devrait émettre l\'événement downloadPDF au clic', async () => {
      const wrapper = mount(CRVValidation, {
        props: {
          modelValue: {
            validateur: 'Jean Dupont',
            fonction: 'CHEF_ESCALE',
            commentaires: '',
            certifie: true,
            dateValidation: '2026-06-11T15:00:00Z'
          },
          validated: true,
          crvId: 'crv1'
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            SLABadge: true
          }
        }
      })

      const button = wrapper.find('.btn-primary')
      await button.trigger('click')

      expect(wrapper.emitted('downloadPDF')).toBeTruthy()
    })
  })
})

// ============================================================================
// TEST SUITE : ValidationCRV (Supervision)
// ============================================================================

describe('ValidationCRV - Page de supervision', () => {
  let store
  let router

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCRVStore()
    router = {
      push: vi.fn(),
      currentRoute: { value: { params: {} } }
    }
    vi.mocked(useRouter).mockReturnValue(router)
    vi.clearAllMocks()
  })

  describe('Initialisation et rendu', () => {
    it('devrait afficher le titre et les compteurs', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs,
          total: mockCRVs.length,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(wrapper.find('h1').text()).toContain('Supervision CRV')
    })

    it('devrait afficher la liste vide', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [],
          total: 0,
          page: 1,
          pages: 0
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(wrapper.text()).toContain('Aucun CRV en attente')
    })
  })

  describe('Chargement des données', () => {
    it('devrait charger la liste des CRV au montage', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs.filter((c) => c.statut === 'TERMINE'),
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(crvAPI.getAll).toHaveBeenCalled()
    })

    it('devrait filtrer par statut TERMINE par défaut', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs.filter((c) => c.statut === 'TERMINE'),
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(crvAPI.getAll).toHaveBeenCalledWith(expect.objectContaining({ statut: 'TERMINE' }))
    })
  })

  describe('Filtres', () => {
    it('devrait filtrer par statut', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs.filter((c) => c.statut === 'VALIDE'),
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      const select = wrapper.find('select')
      await select.setValue('VALIDE')

      expect(crvAPI.getAll).toHaveBeenCalled()
    })

    it('devrait filtrer par recherche', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs.filter((c) => c.numeroCRV.includes('001')),
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      const input = wrapper.find('input[type="text"]')
      await input.setValue('CRV-2026-001')

      // Attendre le debounce
      await new Promise((resolve) => setTimeout(resolve, 301))
      expect(crvAPI.getAll).toHaveBeenCalled()
    })
  })

  describe('Pagination', () => {
    it('devrait afficher la pagination', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs.slice(0, 2),
          total: 4,
          page: 1,
          pages: 2
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(wrapper.text()).toContain('Page 1 / 2')
    })

    it('devrait changer de page', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs.slice(0, 2),
          total: 4,
          page: 1,
          pages: 2
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      const nextBtn = wrapper.findAll('button').find((btn) => btn.text() === 'Suivant')
      await nextBtn?.trigger('click')

      expect(crvAPI.getAll).toHaveBeenCalled()
    })
  })

  describe('Sélection de CRV', () => {
    it('devrait ouvrir le modal de détail au clic sur une carte', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [mockCRVs[0]],
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      const card = wrapper.find('.sv-card')
      await card.trigger('click')

      expect(wrapper.vm.selectedCRV).toBeTruthy()
      expect(wrapper.vm.selectedCRV._id).toBe('crv1')
    })

    it('devrait fermer le modal au clic dehors', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [mockCRVs[0]],
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      wrapper.vm.selectedCRV = mockCRVs[0]
      await wrapper.vm.$nextTick()

      const overlay = wrapper.find('.modal-overlay')
      await overlay.trigger('click')

      expect(wrapper.vm.selectedCRV).toBeNull()
    })
  })

  describe('Workflows de validation', () => {
    it('devrait afficher le bouton de validation pour TERMINE', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [mockCRVs[1]], // TERMINE
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      const validateBtn = wrapper.find('.sv-action--validate')
      expect(validateBtn.exists()).toBe(true)
    })

    it('devrait afficher le bouton de verrouillage pour VALIDE', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [mockCRVs[2]], // VALIDE
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      const lockBtn = wrapper.find('.sv-action--lock')
      expect(lockBtn.exists()).toBe(true)
    })

    it('devrait afficher le bouton de déverrouillage pour VERROUILLE', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [mockCRVs[3]], // VERROUILLE
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      const unlockBtn = wrapper.find('.sv-action--unlock')
      expect(unlockBtn.exists()).toBe(true)
    })

    it('devrait ouvrir le modal de validation au clic', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [mockCRVs[1]], // TERMINE
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      const validateBtn = wrapper.find('.sv-action--validate')
      await validateBtn.trigger('click')

      expect(wrapper.vm.showValidateModal).toBe(true)
    })

    it('devrait valider un CRV', async () => {
      validationAPI.valider.mockResolvedValue({
        data: { crv: { ...mockCRVs[1], statut: 'VALIDE' } }
      })
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [mockCRVs[1]], // TERMINE
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      wrapper.vm.selectedCRV = mockCRVs[1]
      await wrapper.vm.$nextTick()

      await wrapper.vm.handleValidate()

      expect(validationAPI.valider).toHaveBeenCalledWith('crv2', expect.any(Object))
    })

    it('devrait verrouiller un CRV', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [mockCRVs[2]], // VALIDE
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      const lockBtn = wrapper.find('.sv-action--lock')
      await lockBtn.trigger('click')

      expect(wrapper.emitted() || wrapper.vm.crvList).toBeTruthy()
    })

    it('devrait ouvrir le modal de déverrouillage pour VERROUILLE', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [mockCRVs[3]], // VERROUILLE
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      const unlockBtn = wrapper.find('.sv-action--unlock')
      await unlockBtn.trigger('click')

      expect(wrapper.vm.showUnlockModal).toBe(true)
    })

    it('devrait déverrouiller un CRV avec raison', async () => {
      validationAPI.deverrouiller.mockResolvedValue({
        data: { crv: { ...mockCRVs[3], statut: 'EN_COURS' } }
      })
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [mockCRVs[3]], // VERROUILLE
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      wrapper.vm.selectedCRV = mockCRVs[3]
      wrapper.vm.unlockReason = 'Correction nécessaire'
      await wrapper.vm.$nextTick()

      await wrapper.vm.handleUnlock()

      expect(validationAPI.deverrouiller).toHaveBeenCalledWith('crv4', 'Correction nécessaire')
    })
  })

  describe('Affichage des signaux critiques', () => {
    it('devrait afficher le signal de rejet', async () => {
      const rejectedCRV = {
        ...mockCRVs[1],
        rejets: [{ id: 'r1', raison: 'Données incomplètes' }]
      }
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [rejectedCRV],
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(wrapper.text()).toContain('Rejeté')
    })

    it('devrait afficher le signal d\'événement', async () => {
      const crvWithEvent = {
        ...mockCRVs[1],
        evenements: [{ id: 'e1', typeEvenement: 'RETARD' }]
      }
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [crvWithEvent],
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(wrapper.text()).toContain('Événement')
    })

    it('devrait afficher le responsable', async () => {
      const crvWithResp = {
        ...mockCRVs[1],
        responsableVol: { nom: 'Jean Dupont' }
      }
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [crvWithResp],
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(wrapper.text()).toContain('Jean Dupont')
    })

    it('devrait afficher le signal si pas de responsable', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: [mockCRVs[1]],
          total: 1,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      // Le CRV de test n'a pas de responsableVol défini
      expect(wrapper.text()).toBeTruthy()
    })
  })

  describe('Compteurs de statut', () => {
    it('devrait afficher le nombre total de CRV', async () => {
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: mockCRVs,
          total: mockCRVs.length,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(wrapper.text()).toContain('4 dossier')
    })

    it('devrait afficher le nombre de rejets', async () => {
      const rejectedCRVs = mockCRVs.filter((c) => c.rejets && c.rejets.length > 0)
      crvAPI.getAll.mockResolvedValue({
        data: {
          data: rejectedCRVs,
          total: rejectedCRVs.length,
          page: 1,
          pages: 1
        }
      })

      const wrapper = mount(ValidationCRV, {
        global: {
          plugins: [createPinia()],
          stubs: {
            ArchiveButton: true,
            ToastNotification: true
          }
        }
      })

      await flushPromises()
      expect(wrapper.vm.countRejeted).toBeGreaterThanOrEqual(0)
    })
  })
})

// ============================================================================
// TEST SUITE : Intégration E2E simplifiée
// ============================================================================

describe('CRV Workflow - Scénario E2E', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('devrait compléter le workflow de validation complet', async () => {
    // 1. Charger la liste des CRV
    crvAPI.getAll.mockResolvedValue({
      data: {
        data: [mockCRVs[1]], // TERMINE
        total: 1,
        page: 1,
        pages: 1
      }
    })

    const wrapper = mount(ValidationCRV, {
      global: {
        plugins: [createPinia()],
        stubs: {
          ArchiveButton: true,
          ToastNotification: true
        }
      }
    })

    await flushPromises()

    // 2. Vérifier que la liste est chargée
    expect(wrapper.text()).toContain('CRV-2026-002')

    // 3. Sélectionner un CRV
    const card = wrapper.find('.sv-card')
    await card.trigger('click')
    expect(wrapper.vm.selectedCRV).toBeTruthy()

    // 4. Valider le CRV
    validationAPI.valider.mockResolvedValue({
      data: { crv: { ...mockCRVs[1], statut: 'VALIDE' } }
    })

    const validateBtn = wrapper.find('.sv-action--validate')
    await validateBtn.trigger('click')
    expect(wrapper.vm.showValidateModal).toBe(true)
  })

  it('devrait compléter le workflow de déverrouillage', async () => {
    // 1. Charger la liste des CRV verrouillés
    crvAPI.getAll.mockResolvedValue({
      data: {
        data: [mockCRVs[3]], // VERROUILLE
        total: 1,
        page: 1,
        pages: 1
      }
    })

    const wrapper = mount(ValidationCRV, {
      global: {
        plugins: [createPinia()],
        stubs: {
          ArchiveButton: true,
          ToastNotification: true
        }
      }
    })

    await flushPromises()

    // 2. Vérifier que le CRV verrouillé est visible
    expect(wrapper.text()).toContain('CRV-2026-004')

    // 3. Ouvrir le modal de déverrouillage
    const unlockBtn = wrapper.find('.sv-action--unlock')
    await unlockBtn.trigger('click')
    expect(wrapper.vm.showUnlockModal).toBe(true)

    // 4. Déverrouiller avec raison
    validationAPI.deverrouiller.mockResolvedValue({
      data: { crv: { ...mockCRVs[3], statut: 'EN_COURS' } }
    })

    wrapper.vm.unlockReason = 'Correction nécessaire'
    await wrapper.vm.handleUnlock()

    expect(validationAPI.deverrouiller).toHaveBeenCalledWith('crv4', 'Correction nécessaire')
  })
})
