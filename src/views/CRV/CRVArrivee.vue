<template>
  <div class="crv-arrivee-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="btn-back">← Retour</button>
          <h1>CRV Arrivée</h1>
          <span v-if="crvStore.crvStatus" class="status-badge" :class="`status-${crvStore.crvStatus}`">
            {{ crvStore.crvStatusLabel }}
          </span>
        </div>
        <div class="user-info">
          <span>{{ authStore.currentUser?.email }}</span>
          <button @click="handleLogout" class="btn btn-secondary">
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <main class="crv-main">
      <div class="container">
        <!-- Bannière CRV verrouillé/validé/annulé -->
        <CRVLockedBanner />

        <!-- Indicateur de complétude -->
        <div v-if="crvStore.currentCRV" class="completude-section">
          <div class="completude-header">
            <span class="completude-label">Complétude du CRV</span>
            <span class="completude-value">{{ crvStore.completude }}%</span>
          </div>
          <div class="completude-bar">
            <div
              class="completude-fill"
              :class="{
                'low': crvStore.completude < 50,
                'medium': crvStore.completude >= 50 && crvStore.completude < 80,
                'high': crvStore.completude >= 80
              }"
              :style="{ width: crvStore.completude + '%' }"
            ></div>
          </div>
          <div v-if="crvStore.completude < 80" class="completude-warning">
            ⚠️ Minimum 80% requis pour la validation (actuellement {{ crvStore.completude }}%)
          </div>
          <div v-else class="completude-success">
            ✅ CRV prêt pour validation
          </div>
        </div>

        <div class="crv-progress">
          <div class="progress-steps">
            <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
              <div class="step-number">1</div>
              <div class="step-label">Informations vol</div>
            </div>
            <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
              <div class="step-number">2</div>
              <div class="step-label">Personnel</div>
            </div>
            <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
              <div class="step-number">3</div>
              <div class="step-label">Engins</div>
            </div>
            <div class="step" :class="{ active: currentStep >= 4, completed: currentStep > 4 }">
              <div class="step-number">4</div>
              <div class="step-label">Phases</div>
            </div>
            <div class="step" :class="{ active: currentStep >= 5, completed: currentStep > 5 }">
              <div class="step-number">5</div>
              <div class="step-label">Charges</div>
            </div>
            <div class="step" :class="{ active: currentStep >= 6, completed: currentStep > 6 }">
              <div class="step-number">6</div>
              <div class="step-label">Événements</div>
            </div>
            <div class="step" :class="{ active: currentStep >= 7 }">
              <div class="step-number">7</div>
              <div class="step-label">Validation</div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="crv-form">
          <!-- Étape 1: Informations vol -->
          <div v-show="currentStep === 1">
            <CRVHeader
              v-model="formData.header"
              title="Informations du vol - Arrivée"
              :disabled="crvStore.isLocked"
            />
            <div class="step-actions">
              <button
                v-if="!crvStore.isLocked"
                @click="genererDonneesEtape1"
                class="btn btn-test"
                type="button"
              >
                Générer données test
              </button>
              <button v-if="!crvStore.isLocked" @click="nextStep" class="btn btn-primary" type="button">
                Continuer
              </button>
            </div>
          </div>

          <!-- Étape 2: Personnel -->
          <div v-show="currentStep === 2">
            <CRVPersonnes
              v-model="formData.personnes"
              :disabled="crvStore.isLocked"
            />
            <div class="step-actions">
              <button @click="prevStep" class="btn btn-secondary" type="button">
                Retour
              </button>
              <button
                v-if="!crvStore.isLocked"
                @click="genererDonneesEtape2"
                class="btn btn-test"
                type="button"
              >
                Générer données test
              </button>
              <button v-if="!crvStore.isLocked" @click="nextStep" class="btn btn-primary" type="button">
                Continuer
              </button>
            </div>
          </div>

          <!-- Étape 3: Engins -->
          <div v-show="currentStep === 3">
            <CRVEngins
              v-model="formData.engins"
              :disabled="crvStore.isLocked"
            />
            <div class="step-actions">
              <button @click="prevStep" class="btn btn-secondary" type="button">
                Retour
              </button>
              <button
                v-if="!crvStore.isLocked"
                @click="genererDonneesEtape3"
                class="btn btn-test"
                type="button"
              >
                Générer données test
              </button>
              <button v-if="!crvStore.isLocked" @click="nextStep" class="btn btn-primary" type="button">
                Continuer
              </button>
            </div>
          </div>

          <!-- Étape 4: Phases -->
          <div v-show="currentStep === 4">
            <!-- Indicateur de progression des phases -->
            <div class="phases-progress-indicator">
              <div class="phases-progress-header">
                <span class="phases-progress-label">Progression des phases</span>
                <span class="phases-progress-count" :class="{
                  'complete': toutesPhaseTraitees,
                  'incomplete': !toutesPhaseTraitees
                }">
                  {{ crvStore.phases.length - phasesNonTraitees.length }} / {{ crvStore.phases.length }} traitées
                </span>
              </div>
              <div class="phases-progress-bar">
                <div
                  class="phases-progress-fill"
                  :class="{ 'complete': toutesPhaseTraitees }"
                  :style="{ width: crvStore.phases.length > 0 ? ((crvStore.phases.length - phasesNonTraitees.length) / crvStore.phases.length * 100) + '%' : '0%' }"
                ></div>
              </div>
              <div v-if="!toutesPhaseTraitees" class="phases-warning-message">
                <span class="warning-icon">⚠️</span>
                <span>{{ phasesNonTraitees.length }} phase(s) restante(s) à traiter avant de continuer</span>
              </div>
              <div v-else class="phases-success-message">
                <span class="success-icon">✅</span>
                <span>Toutes les phases sont traitées - Vous pouvez continuer</span>
              </div>
            </div>

            <CRVPhases
              :phases="crvStore.phases"
              crv-type="arrivee"
              :disabled="crvStore.isLocked"
              @phase-update="handlePhaseUpdate"
            />

            <!-- Message d'erreur si tentative de continuer sans traiter les phases -->
            <div v-if="stepValidationError && currentStep === 4" class="step-validation-error">
              <strong>⛔ Validation impossible</strong>
              <pre>{{ stepValidationError }}</pre>
            </div>

            <div class="step-actions">
              <button @click="prevStep" class="btn btn-secondary" type="button">
                Retour
              </button>
              <button
                v-if="!crvStore.isLocked"
                @click="genererDonneesEtape4"
                class="btn btn-test"
                type="button"
                :disabled="generatingPhases"
              >
                {{ generatingPhases ? 'Génération...' : 'Générer toutes les phases' }}
              </button>
              <button
                v-if="!crvStore.isLocked"
                @click="nextStep"
                class="btn btn-primary"
                :class="{ 'btn-disabled': !toutesPhaseTraitees }"
                type="button"
              >
                {{ toutesPhaseTraitees ? 'Continuer' : `Traiter ${phasesNonTraitees.length} phase(s)` }}
              </button>
            </div>
          </div>

          <!-- Étape 5: Charges -->
          <div v-show="currentStep === 5">
            <CRVCharges
              :charges="crvStore.charges"
              :crv-id="crvStore.getCRVId"
              :disabled="crvStore.isLocked"
              @charge-added="handleChargeAdded"
            />
            <div class="step-actions">
              <button @click="prevStep" class="btn btn-secondary" type="button">
                Retour
              </button>
              <button
                v-if="!crvStore.isLocked"
                @click="genererDonneesEtape5"
                class="btn btn-test"
                type="button"
              >
                Générer données test
              </button>
              <button v-if="!crvStore.isLocked" @click="nextStep" class="btn btn-primary" type="button">
                Continuer
              </button>
            </div>
          </div>

          <!-- Étape 6: Événements -->
          <div v-show="currentStep === 6">
            <CRVEvenements
              :evenements="crvStore.evenements"
              :crv-id="crvStore.getCRVId"
              :disabled="crvStore.isLocked"
              @evenement-added="handleEvenementAdded"
            />
            <div class="step-actions">
              <button @click="prevStep" class="btn btn-secondary" type="button">
                Retour
              </button>
              <button
                v-if="!crvStore.isLocked"
                @click="genererDonneesEtape6"
                class="btn btn-test"
                type="button"
              >
                Confirmer aucun événement
              </button>
              <button v-if="!crvStore.isLocked" @click="nextStep" class="btn btn-primary" type="button">
                Continuer
              </button>
            </div>
          </div>

          <!-- Étape 7: Validation -->
          <div v-show="currentStep === 7">
            <CRVValidation
              v-model="formData.validation"
              :validated="isValidated"
              @validate="handleValidation"
            />
            <div v-if="!isValidated" class="step-actions">
              <button @click="prevStep" class="btn btn-secondary" type="button">
                Retour
              </button>
            </div>
            <div v-else class="step-actions">
              <button @click="goBack" class="btn btn-primary" type="button">
                Terminer
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCRVStore, SEUILS_COMPLETUDE } from '@/stores/crvStore'

import CRVHeader from '@/components/crv/CRVHeader.vue'
import CRVPersonnes from '@/components/crv/CRVPersonnes.vue'
import CRVEngins from '@/components/crv/CRVEngins.vue'
import CRVPhases from '@/components/crv/CRVPhases.vue'
import CRVCharges from '@/components/crv/CRVCharges.vue'
import CRVEvenements from '@/components/crv/CRVEvenements.vue'
import CRVValidation from '@/components/crv/CRVValidation.vue'
import CRVLockedBanner from '@/components/CRV/CRVLockedBanner.vue'

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

// Données locales pour l'affichage du header (infos vol)
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

// Statut du CRV
const crvStatut = computed(() => crvStore.crvStatus)
const canEdit = computed(() => crvStore.isEditable)

// Validation des phases - toutes les phases doivent être TERMINE ou NON_REALISE
// Note: Le backend renvoie NON_COMMENCE (aligné sur le contrat backend v2)
const phasesNonTraitees = computed(() => {
  return crvStore.phases.filter(p => {
    const statut = p.statut?.toUpperCase() || ''
    // Phase traitée = TERMINE ou NON_REALISE (ou variantes)
    const estTraitee = statut === 'TERMINE' ||
                       statut === 'NON_REALISE' ||
                       statut === 'NON_REALISEE'
    return !estTraitee
  })
})

const toutesPhaseTraitees = computed(() => {
  if (crvStore.phases.length === 0) return true // Pas de phases = OK
  return phasesNonTraitees.value.length === 0
})

onMounted(async () => {
  console.log('[CRVArrivee] onMounted - Initialisation...')
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Vérifier si un ID de CRV est passé en paramètre (édition d'un CRV existant)
    const crvId = route.query.id

    if (crvId) {
      // Charger le CRV existant
      console.log('[CRVArrivee] Chargement CRV existant:', crvId)
      await crvStore.loadCRV(crvId)
      console.log('[CRVArrivee] CRV chargé:', crvStore.currentCRV?.numeroCRV)
    } else if (!crvStore.currentCRV) {
      // Créer un nouveau CRV
      console.log('[CRVArrivee] Création du CRV...')
      await crvStore.createCRV({
        type: 'arrivee',
        date: formData.value.header.date
      })
      console.log('[CRVArrivee] CRV créé:', crvStore.currentCRV?.numeroCRV)
    }

    // Démarrer automatiquement le CRV si en BROUILLON
    if (crvStore.currentCRV?.statut === 'BROUILLON') {
      console.log('[CRVArrivee] Démarrage du CRV (BROUILLON → EN_COURS)...')
      try {
        await crvStore.demarrerCRV()
        console.log('[CRVArrivee] CRV démarré, nouveau statut:', crvStore.currentCRV?.statut)
      } catch (e) {
        console.warn('[CRVArrivee] Impossible de démarrer le CRV:', e.message)
        // Continuer quand même - le backend n'a peut-être pas cette route
      }
    }

    // Synchroniser les données du formulaire avec le CRV chargé
    if (crvStore.currentCRV) {
      // Synchroniser les infos du vol
      if (crvStore.currentCRV.vol) {
        const vol = crvStore.currentCRV.vol
        formData.value.header = {
          numeroVol: vol.numeroVol || '',
          compagnieAerienne: vol.compagnieAerienne || '',
          codeIATA: vol.codeIATA || '',
          aeroportOrigine: vol.aeroportOrigine || '',
          aeroportDestination: vol.aeroportDestination || '',
          dateVol: vol.dateVol ? vol.dateVol.split('T')[0] : formData.value.header.dateVol,
          immatriculation: vol.avion?.immatriculation || '',
          typeAvion: vol.avion?.typeAvion || '',
          poste: vol.poste || ''
        }
      }

      // Synchroniser le personnel
      if (crvStore.currentCRV.personnelAffecte?.length > 0) {
        formData.value.personnes = [...crvStore.currentCRV.personnelAffecte]
      }

      // Synchroniser les engins
      if (crvStore.engins?.length > 0) {
        formData.value.engins = [...crvStore.engins]
      }
    }

    console.log('[CRVArrivee] Initialisation terminée:', {
      numeroCRV: crvStore.currentCRV?.numeroCRV,
      statut: crvStore.currentCRV?.statut,
      completude: crvStore.completude,
      nbPhases: crvStore.phases.length,
      nbCharges: crvStore.charges.length
    })
  } catch (error) {
    console.error('[CRVArrivee] Erreur initialisation:', error)
    errorMessage.value = error.message || 'Erreur lors du chargement du CRV'
  } finally {
    isLoading.value = false
  }
})

// Surveiller les changements de complétude
watch(() => crvStore.completude, (newVal, oldVal) => {
  console.log(`[CRVArrivee] Complétude: ${oldVal}% → ${newVal}%`)
})

const nextStep = async () => {
  if (currentStep.value < 7) {
    // Réinitialiser l'erreur de validation
    stepValidationError.value = ''

    // VALIDATION ÉTAPE 4 (Phases) : Toutes les phases doivent être traitées
    if (currentStep.value === 4) {
      if (!toutesPhaseTraitees.value) {
        const nbNonTraitees = phasesNonTraitees.value.length
        const phasesEnCours = crvStore.phases.filter(p => p.statut === 'EN_COURS')

        let message = `Impossible de continuer : ${nbNonTraitees} phase(s) non traitée(s).\n\n`

        if (phasesEnCours.length > 0) {
          message += `Phase(s) en cours (à terminer) :\n`
          phasesEnCours.forEach(p => {
            message += `  - ${p.phase?.libelle || p.nomPhase || p.nom}\n`
          })
          message += '\n'
        }

        const phasesNonCommencees = crvStore.phases.filter(p => p.statut === 'NON_COMMENCE')
        if (phasesNonCommencees.length > 0) {
          message += `Phase(s) non démarrées :\n`
          phasesNonCommencees.forEach(p => {
            message += `  - ${p.phase?.libelle || p.nomPhase || p.nom}\n`
          })
        }

        message += '\nPour chaque phase, vous devez :\n'
        message += '• Soit la démarrer puis la terminer\n'
        message += '• Soit la marquer comme "Non réalisée" avec un motif'

        stepValidationError.value = message
        alert(message)
        console.warn('[CRVArrivee] Blocage étape 4 - Phases non traitées:', phasesNonTraitees.value)
        return
      }
    }

    // Sauvegarder les données de l'étape courante si nécessaire
    await saveCurrentStepData()
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/**
 * Sauvegarder les données de l'étape courante
 */
const saveCurrentStepData = async () => {
  if (!canEdit.value) return

  console.log(`[CRVArrivee] Sauvegarde étape ${currentStep.value}...`)

  try {
    const crvId = crvStore.currentCRV?.id || crvStore.currentCRV?._id
    if (!crvId) {
      console.warn('[CRVArrivee] Pas de CRV actif pour sauvegarder')
      return
    }

    // Sauvegarder selon l'étape
    switch (currentStep.value) {
      case 1:
        // Étape 1: Sauvegarder les infos du vol
        console.log('[CRVArrivee] Sauvegarde infos vol:', formData.value.header)
        await crvStore.updateCRV({
          vol: {
            numeroVol: formData.value.header.numeroVol,
            compagnieAerienne: formData.value.header.compagnieAerienne,
            codeIATA: formData.value.header.codeIATA,
            aeroportOrigine: formData.value.header.aeroportOrigine,
            aeroportDestination: formData.value.header.aeroportDestination,
            dateVol: formData.value.header.dateVol,
            immatriculation: formData.value.header.immatriculation,
            typeAvion: formData.value.header.typeAvion
          }
        })
        console.log('[CRVArrivee] Infos vol sauvegardées')
        break

      case 2:
        // Étape 2: Sauvegarder le personnel affecté
        console.log('[CRVArrivee] Sauvegarde personnel:', formData.value.personnes)
        if (formData.value.personnes.length > 0) {
          await crvStore.updatePersonnel(formData.value.personnes)
          console.log('[CRVArrivee] Personnel sauvegardé')
        }
        break

      case 3:
        // Étape 3: Engins - Sauvegarde vers backend
        if (formData.value.engins.length > 0) {
          console.log('[CRVArrivee] Sauvegarde engins:', formData.value.engins)
          await crvStore.updateEngins(formData.value.engins)
          console.log('[CRVArrivee] Engins sauvegardés')
        } else {
          console.log('[CRVArrivee] Aucun engin à sauvegarder')
        }
        break

      // Étapes 4, 5, 6: gérées par leurs composants respectifs
      default:
        break
    }

    // Recharger le CRV pour avoir la complétude à jour
    await crvStore.loadCRV(crvId)
    console.log(`[CRVArrivee] CRV rechargé - Complétude: ${crvStore.completude}%`)

  } catch (error) {
    console.error('[CRVArrivee] Erreur sauvegarde:', error)
    // Ne pas bloquer la navigation en cas d'erreur
  }
}

/**
 * Handler pour les mises à jour de phases depuis CRVPhases
 */
const handlePhaseUpdate = async (phaseData) => {
  console.log('[CRVArrivee] handlePhaseUpdate:', phaseData)
  // Le composant CRVPhases appelle directement le store
  // On recharge juste le CRV pour avoir la complétude à jour
  if (crvStore.currentCRV) {
    await crvStore.loadCRV(crvStore.currentCRV.id || crvStore.currentCRV._id)
    console.log(`[CRVArrivee] Après phase update - Complétude: ${crvStore.completude}%`)
  }
}

/**
 * Handler pour l'ajout de charges depuis CRVCharges
 */
const handleChargeAdded = async (chargeData) => {
  console.log('[CRVArrivee] handleChargeAdded:', chargeData)
  // Le composant CRVCharges appelle directement le store
  if (crvStore.currentCRV) {
    await crvStore.loadCRV(crvStore.currentCRV.id || crvStore.currentCRV._id)
    console.log(`[CRVArrivee] Après charge ajoutée - Complétude: ${crvStore.completude}%`)
  }
}

/**
 * Handler pour l'ajout d'événements depuis CRVEvenements
 */
const handleEvenementAdded = async (evenementData) => {
  console.log('[CRVArrivee] handleEvenementAdded:', evenementData)
  // Le composant CRVEvenements appelle directement le store
  if (crvStore.currentCRV) {
    await crvStore.loadCRV(crvStore.currentCRV.id || crvStore.currentCRV._id)
    console.log(`[CRVArrivee] Après événement ajouté - Complétude: ${crvStore.completude}%`)
  }
}

/**
 * Validation finale du CRV
 */
const handleValidation = async (validationData) => {
  console.log('[CRVArrivee] handleValidation - Début validation...')
  isLoading.value = true
  errorMessage.value = ''

  try {
    const completude = crvStore.completude
    const statut = crvStore.crvStatus

    console.log('[CRVArrivee] État actuel:', { completude, statut })

    // Étape 1: Si EN_COURS, essayer de terminer (seuil 50%)
    if (statut === 'EN_COURS') {
      if (completude < SEUILS_COMPLETUDE.TERMINER) {
        errorMessage.value = `Complétude insuffisante pour terminer: ${completude}% (minimum ${SEUILS_COMPLETUDE.TERMINER}% requis)`
        alert(errorMessage.value)
        return
      }

      console.log('[CRVArrivee] Terminaison du CRV...')
      try {
        await crvStore.terminerCRV()
        console.log('[CRVArrivee] CRV terminé')
      } catch (e) {
        console.error('[CRVArrivee] Erreur terminaison:', e)
        if (crvStore.anomalies.length > 0) {
          errorMessage.value = `Impossible de terminer:\n${crvStore.anomalies.join('\n')}`
        } else {
          errorMessage.value = e.message || 'Erreur lors de la terminaison'
        }
        alert(errorMessage.value)
        return
      }
    }

    // Recharger pour avoir le nouveau statut
    await crvStore.loadCRV(crvStore.currentCRV.id || crvStore.currentCRV._id)

    // Étape 2: Si TERMINE, essayer de valider (seuil 80%)
    if (crvStore.crvStatus === 'TERMINE') {
      const newCompletude = crvStore.completude

      if (newCompletude < SEUILS_COMPLETUDE.VALIDER) {
        errorMessage.value = `Complétude insuffisante pour valider: ${newCompletude}% (minimum ${SEUILS_COMPLETUDE.VALIDER}% requis)`
        alert(errorMessage.value)
        return
      }

      console.log('[CRVArrivee] Validation du CRV...')
      try {
        await crvStore.validateCRV(validationData?.commentaires)
        console.log('[CRVArrivee] CRV validé')
        isValidated.value = true
      } catch (e) {
        console.error('[CRVArrivee] Erreur validation:', e)
        if (crvStore.anomalies.length > 0) {
          errorMessage.value = `Impossible de valider:\n${crvStore.anomalies.join('\n')}`
        } else {
          errorMessage.value = e.message || 'Erreur lors de la validation'
        }
        alert(errorMessage.value)
        return
      }
    }

    // Succès
    console.log('[CRVArrivee] Validation complète, statut final:', crvStore.crvStatus)

  } catch (error) {
    console.error('[CRVArrivee] Erreur validation:', error)
    errorMessage.value = error.message || 'Erreur lors de la validation du CRV'
    alert(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = () => {
  // Soumission gérée par la validation
}

// ============================================
// FONCTIONS DE GÉNÉRATION DE DONNÉES DE TEST
// ============================================

/**
 * Étape 1 : Générer données Header (infos vol)
 * Champs attendus par le backend:
 * - numeroVol, compagnieAerienne, codeIATA (obligatoires)
 * - aeroportOrigine, aeroportDestination, dateVol, immatriculation, typeAvion (optionnels)
 */
const genererDonneesEtape1 = () => {
  console.log('[CRVArrivee] Génération données étape 1 (Header)...')
  // Mettre à jour chaque propriété individuellement pour que Vue détecte les changements
  formData.value.header.numeroVol = 'THS001'
  formData.value.header.compagnieAerienne = 'THS Airways'
  formData.value.header.codeIATA = 'TH'
  formData.value.header.aeroportOrigine = 'CDG'
  formData.value.header.aeroportDestination = 'NDJ'
  formData.value.header.dateVol = new Date().toISOString().split('T')[0]
  formData.value.header.immatriculation = '5H-THS'
  formData.value.header.typeAvion = 'B737-800'
  formData.value.header.poste = 'P42'
  console.log('[CRVArrivee] Données étape 1 générées:', formData.value.header)
}

/**
 * Étape 2 : Générer données Personnel
 * Structure backend: { nom, prenom, fonction, matricule?, telephone?, remarques? }
 */
const genererDonneesEtape2 = () => {
  console.log('[CRVArrivee] Génération données étape 2 (Personnel)...')
  // Vider et remplir le tableau pour que Vue détecte les changements
  formData.value.personnes.length = 0
  formData.value.personnes.push(
    { nom: 'IBRAHIM', prenom: 'Ahmed', fonction: 'Chef d\'escale', matricule: 'CE-001' },
    { nom: 'DIALLO', prenom: 'Mamadou', fonction: 'Agent de piste', matricule: 'AP-015' },
    { nom: 'BARRY', prenom: 'Fatoumata', fonction: 'Responsable bagages', matricule: 'RB-023' }
  )
  console.log('[CRVArrivee] Données étape 2 générées:', formData.value.personnes)
}

/**
 * Étape 3 : Générer données Engins
 * Structure attendue: { type, immatriculation, heureDebut, heureFin, utilise }
 * Types valides: tracteur, chariot_bagages, camion_fret, passerelle, gpu, asu, camion_avitaillement, autre
 */
const genererDonneesEtape3 = () => {
  console.log('[CRVArrivee] Génération données étape 3 (Engins)...')
  // Vider et remplir le tableau pour que Vue détecte les changements
  formData.value.engins.length = 0
  formData.value.engins.push(
    { type: 'tracteur', immatriculation: 'TPB-001', heureDebut: '08:00', heureFin: '08:30', utilise: true },
    { type: 'passerelle', immatriculation: 'ESP-012', heureDebut: '08:05', heureFin: '08:45', utilise: true },
    { type: 'chariot_bagages', immatriculation: 'CVB-008', heureDebut: '08:10', heureFin: '08:40', utilise: true },
    { type: 'gpu', immatriculation: 'GPU-003', heureDebut: '08:00', heureFin: '09:00', utilise: true }
  )
  console.log('[CRVArrivee] Données étape 3 générées:', formData.value.engins)
}

/**
 * Étape 4 : Générer toutes les phases (démarrer + terminer)
 */
const genererDonneesEtape4 = async () => {
  console.log('[CRVArrivee] Génération données étape 4 (Phases)...')
  generatingPhases.value = true

  try {
    const phases = crvStore.phases
    console.log(`[CRVArrivee] ${phases.length} phases à traiter`)

    for (const phase of phases) {
      const phaseId = phase.id || phase._id
      const statut = phase.statut?.toUpperCase() || ''

      // Obtenir le nom de la phase (structure backend imbriquée)
      const phaseNom = phase.phase?.libelle || phase.nomPhase || phase.nom || 'Phase'

      // Si la phase est déjà traitée, on passe
      if (statut === 'TERMINE' || statut === 'NON_REALISE' || statut === 'NON_REALISEE') {
        console.log(`[CRVArrivee] Phase ${phaseNom} déjà traitée (${statut})`)
        continue
      }

      // Si NON_COMMENCE, on démarre puis termine
      if (statut === 'NON_COMMENCE') {
        console.log(`[CRVArrivee] Démarrage phase: ${phaseNom}`)
        await crvStore.demarrerPhase(phaseId)
        // Petit délai pour éviter les conflits
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Maintenant on termine la phase
      console.log(`[CRVArrivee] Terminaison phase: ${phaseNom}`)
      await crvStore.terminerPhase(phaseId)
      // Petit délai entre chaque phase
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    // Recharger le CRV pour avoir la complétude à jour
    if (crvStore.currentCRV) {
      await crvStore.loadCRV(crvStore.currentCRV.id || crvStore.currentCRV._id)
    }

    console.log('[CRVArrivee] Toutes les phases générées! Complétude:', crvStore.completude + '%')
  } catch (error) {
    console.error('[CRVArrivee] Erreur génération phases:', error)
    alert('Erreur lors de la génération des phases: ' + error.message)
  } finally {
    generatingPhases.value = false
  }
}

/**
 * Étape 5 : Générer données Charges (confirmer aucune charge ou ajouter données)
 */
const genererDonneesEtape5 = async () => {
  console.log('[CRVArrivee] Génération données étape 5 (Charges)...')

  try {
    // Option 1: Confirmer aucune charge
    await crvStore.confirmerAbsence('charge')
    console.log('[CRVArrivee] Confirmation "aucune charge" envoyée')

    // Recharger le CRV
    if (crvStore.currentCRV) {
      await crvStore.loadCRV(crvStore.currentCRV.id || crvStore.currentCRV._id)
    }

    console.log('[CRVArrivee] Complétude après charges:', crvStore.completude + '%')
  } catch (error) {
    console.error('[CRVArrivee] Erreur génération charges:', error)
    alert('Erreur: ' + error.message)
  }
}

/**
 * Étape 6 : Confirmer aucun événement
 */
const genererDonneesEtape6 = async () => {
  console.log('[CRVArrivee] Génération données étape 6 (Événements)...')

  try {
    await crvStore.confirmerAbsence('evenement')
    console.log('[CRVArrivee] Confirmation "aucun événement" envoyée')

    // Recharger le CRV
    if (crvStore.currentCRV) {
      await crvStore.loadCRV(crvStore.currentCRV.id || crvStore.currentCRV._id)
    }

    console.log('[CRVArrivee] Complétude après événements:', crvStore.completude + '%')
  } catch (error) {
    console.error('[CRVArrivee] Erreur génération événements:', error)
    alert('Erreur: ' + error.message)
  }
}

const goBack = () => {
  crvStore.resetCurrentCRV()
  router.push('/crv')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.crv-arrivee-container {
  min-height: 100vh;
  background: var(--bg-body);
}

.app-header {
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-back {
  background: var(--bg-badge);
  color: var(--text-primary);
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-back:hover {
  background: var(--bg-card-hover);
}

.app-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info span {
  color: var(--text-secondary);
  font-size: 14px;
}

.crv-main {
  padding: 30px 20px;
}

.crv-progress {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 40px;
  right: 40px;
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-badge);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s;
}

.step.active .step-number {
  background: #2563eb;
  color: white;
}

.step.completed .step-number {
  background: #16a34a;
  color: white;
}

.step-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  max-width: 80px;
}

.step.active .step-label {
  color: #2563eb;
  font-weight: 600;
}

.crv-form {
  min-height: 400px;
}

.step-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid var(--border-color);
}

.step-actions .btn {
  min-width: 120px;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* États selon le contrat backend */
.status-BROUILLON {
  background: #f3f4f6;
  color: #6b7280;
}

.status-EN_COURS {
  background: #dbeafe;
  color: #1e40af;
}

.status-TERMINE {
  background: #fef3c7;
  color: #92400e;
}

.status-VALIDE {
  background: #dcfce7;
  color: #166534;
  border: 2px solid #10b981;
}

.status-VERROUILLE {
  background: #fee2e2;
  color: #b91c1c;
  border: 2px solid #ef4444;
}

.status-ANNULE {
  background: #e5e7eb;
  color: #374151;
  text-decoration: line-through;
}

.completude-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.completude-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.completude-label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.completude-value {
  font-size: 24px;
  font-weight: 700;
  color: #2563eb;
}

.completude-bar {
  width: 100%;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.completude-fill {
  height: 100%;
  transition: all 0.4s ease;
  border-radius: 12px;
  position: relative;
}

.completude-fill.low {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.completude-fill.medium {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.completude-fill.high {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.completude-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  color: #92400e;
  font-size: 14px;
  font-weight: 500;
}

.completude-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #d1fae5;
  border: 1px solid #10b981;
  border-radius: 8px;
  color: #065f46;
  font-size: 14px;
  font-weight: 600;
}

/* Indicateur de progression des phases */
.phases-progress-indicator {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 2px solid #e5e7eb;
}

.phases-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.phases-progress-label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.phases-progress-count {
  font-size: 18px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}

.phases-progress-count.complete {
  background: #dcfce7;
  color: #166534;
}

.phases-progress-count.incomplete {
  background: #fef3c7;
  color: #92400e;
}

.phases-progress-bar {
  width: 100%;
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.phases-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
  transition: all 0.4s ease;
  border-radius: 6px;
}

.phases-progress-fill.complete {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.phases-warning-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  color: #92400e;
  font-size: 14px;
  font-weight: 500;
}

.phases-success-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #d1fae5;
  border: 1px solid #10b981;
  border-radius: 8px;
  color: #065f46;
  font-size: 14px;
  font-weight: 600;
}

.warning-icon,
.success-icon {
  font-size: 18px;
}

/* Erreur de validation d'étape */
.step-validation-error {
  margin-top: 20px;
  padding: 20px;
  background: #fef2f2;
  border: 2px solid #ef4444;
  border-radius: 12px;
  color: #b91c1c;
}

.step-validation-error strong {
  display: block;
  font-size: 16px;
  margin-bottom: 10px;
}

.step-validation-error pre {
  font-family: inherit;
  font-size: 14px;
  white-space: pre-wrap;
  margin: 0;
  line-height: 1.6;
}

/* Bouton désactivé visuellement */
.btn-disabled {
  opacity: 0.7;
  background: #9ca3af !important;
  cursor: pointer;
}

.btn-disabled:hover {
  background: #9ca3af !important;
}

/* Bouton de test/génération */
.btn-test {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-test:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.btn-test:disabled {
  opacity: 0.6;
  cursor: wait;
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

/* Mobile (jusqu'à 640px) */
@media (max-width: 640px) {
  .header-content {
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
  }

  .app-header h1 {
    font-size: 18px;
  }

  .btn-back {
    padding: 6px 12px;
    font-size: 13px;
  }

  .user-info {
    display: none;
  }

  .crv-main {
    padding: 16px 12px;
  }

  .crv-progress {
    padding: 16px;
    margin-bottom: 16px;
  }

  .progress-steps {
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .progress-steps::before {
    display: none;
  }

  .step {
    flex: 0 0 calc(33.33% - 8px);
    margin-bottom: 8px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .step-label {
    font-size: 10px;
    max-width: 60px;
  }

  .step-actions {
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
    padding-top: 20px;
  }

  .step-actions .btn {
    width: 100%;
    min-width: auto;
  }

  .completude-section,
  .phases-progress-indicator {
    padding: 16px;
    margin-bottom: 16px;
  }

  .completude-value {
    font-size: 20px;
  }

  .completude-bar {
    height: 16px;
  }

  .status-badge {
    padding: 4px 10px;
    font-size: 11px;
  }
}

/* Tablet (641px - 1024px) */
@media (min-width: 641px) and (max-width: 1024px) {
  .header-content {
    padding: 16px 20px;
  }

  .app-header h1 {
    font-size: 20px;
  }

  .crv-main {
    padding: 20px 16px;
  }

  .crv-progress {
    padding: 20px;
  }

  .step-number {
    width: 36px;
    height: 36px;
  }

  .step-label {
    font-size: 11px;
  }

  .step-actions {
    gap: 12px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1025px) {
  .crv-main {
    padding: 30px 20px;
  }

  .crv-progress {
    padding: 30px;
    margin-bottom: 30px;
  }
}
</style>
