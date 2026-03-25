import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCRVStore, SEUILS_COMPLETUDE } from '@/stores/crvStore'

/**
 * Composable unifié pour le wizard CRV.
 * Factorise la logique commune entre CRVArrivee, CRVDepart, CRVTurnAround.
 *
 * @param {string} typeOperation - 'ARRIVEE' | 'DEPART' | 'TURN_AROUND'
 * @returns {Object} État et méthodes du wizard
 */
export function useCRVWizard(typeOperation) {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const crvStore = useCRVStore()

  const currentStep = ref(1)
  const isValidated = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref('')
  const stepValidationError = ref('')
  const generatingPhases = ref(false)

  const TOTAL_STEPS = 7

  const formData = ref({
    header: {
      numeroVol: '',
      compagnieAerienne: '',
      codeIATA: '',
      aeroportOrigine: '',
      aeroportDestination: '',
      dateVol: new Date().toISOString().split('T')[0],
      immatriculation: '',
      typeAvion: '',
      poste: ''
    },
    personnes: [],
    engins: [],
    validation: {
      validateur: '',
      fonction: '',
      commentaires: '',
      certifie: false,
      dateValidation: null
    }
  })

  // Computed
  const crvStatut = computed(() => crvStore.crvStatus)
  const canEdit = computed(() => crvStore.isEditable)

  const phasesNonTraitees = computed(() => {
    return crvStore.phases.filter(p => {
      const statut = p.statut?.toUpperCase() || ''
      const estTraitee = statut === 'TERMINE' || statut === 'NON_REALISE'
      return !estTraitee
    })
  })

  const toutesPhaseTraitees = computed(() => {
    if (crvStore.phases.length === 0) return true
    return phasesNonTraitees.value.length === 0
  })

  const typeLabel = computed(() => {
    switch (typeOperation) {
      case 'ARRIVEE': return 'Arrivée'
      case 'DEPART': return 'Départ'
      case 'TURN_AROUND': return 'Turn Around'
      default: return typeOperation
    }
  })

  // Navigation
  function nextStep() {
    stepValidationError.value = ''
    if (currentStep.value < TOTAL_STEPS) {
      // Sauvegarde automatique avant changement d'étape
      saveCurrentStep()
      currentStep.value++
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  function goBack() {
    router.push('/crv/liste')
  }

  async function handleLogout() {
    await authStore.logout()
    router.push('/login')
  }

  // Sauvegarde
  async function saveCurrentStep() {
    console.log(`[CRVWizard][${typeOperation}] Sauvegarde étape ${currentStep.value}...`)
    try {
      switch (currentStep.value) {
        case 2:
          if (formData.value.personnes.length > 0) {
            await crvStore.updatePersonnel(formData.value.personnes)
          }
          break
        case 3:
          if (formData.value.engins.length > 0) {
            await crvStore.updateEngins(formData.value.engins)
          }
          break
      }
    } catch (error) {
      console.error(`[CRVWizard][${typeOperation}] Erreur sauvegarde:`, error)
    }
  }

  // Formatage
  function formatHoraire(datetime) {
    if (!datetime) return '-'
    return new Date(datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  // Initialisation
  async function initCRV() {
    console.log(`[CRVWizard][${typeOperation}] Initialisation...`)
    isLoading.value = true
    errorMessage.value = ''

    try {
      const crvId = route.query.id
      if (crvId) {
        const storeId = crvStore.currentCRV?.id || crvStore.currentCRV?._id
        if (storeId !== crvId) {
          await crvStore.loadCRV(crvId)
        } else {
          if (crvStore.transitionsPossibles.length === 0) {
            crvStore.fetchTransitionsPossibles()
          }
        }

        // Remplir formData depuis le CRV chargé
        if (crvStore.currentCRV) {
          const crv = crvStore.currentCRV
          const vol = crv.vol || {}

          formData.value.header = {
            numeroVol: vol.numeroVol || '',
            compagnieAerienne: vol.compagnieAerienne || '',
            codeIATA: vol.codeIATA || '',
            aeroportOrigine: vol.aeroportOrigine || '',
            aeroportDestination: vol.aeroportDestination || '',
            dateVol: vol.dateVol ? new Date(vol.dateVol).toISOString().split('T')[0] : '',
            immatriculation: vol.avion?.immatriculation || '',
            typeAvion: vol.typeAvion || '',
            poste: vol.posteStationnement || ''
          }

          formData.value.personnes = crv.personnelAffecte || []
          formData.value.engins = crv.materielUtilise || []
        }
      }
    } catch (error) {
      errorMessage.value = error.message
      console.error(`[CRVWizard][${typeOperation}] Erreur init:`, error)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(initCRV)

  return {
    // Stores
    authStore,
    crvStore,
    // State
    currentStep,
    isValidated,
    isLoading,
    errorMessage,
    stepValidationError,
    generatingPhases,
    formData,
    TOTAL_STEPS,
    SEUILS_COMPLETUDE,
    typeOperation,
    typeLabel,
    // Computed
    crvStatut,
    canEdit,
    phasesNonTraitees,
    toutesPhaseTraitees,
    // Methods
    nextStep,
    prevStep,
    goBack,
    handleLogout,
    saveCurrentStep,
    formatHoraire,
    initCRV,
  }
}
