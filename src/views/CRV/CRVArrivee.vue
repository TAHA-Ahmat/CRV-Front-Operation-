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

        <!-- Bandeau SLA persistant (toutes les étapes) -->
        <CRVSLABanner
          v-if="crvStore.currentCRV"
          :crv="crvStore.currentCRV"
          :phases="crvStore.phases"
          @open-tasks="showTasksDrawer = true"
        />

        <!-- Drawer Tableau de bord tâches SLA -->
        <div v-if="showTasksDrawer" class="tasks-drawer-overlay" @click.self="showTasksDrawer = false">
          <div class="tasks-drawer">
            <CRVTasksBoard
              :phases="crvStore.phases"
              :closable="true"
              :disabled="crvStore.isLocked"
              :code-iata="crvStore.currentCRV?.vol?.codeIATA || null"
              :compagnie-nom="crvStore.currentCRV?.vol?.compagnie || crvStore.currentCRV?.vol?.nomCompagnie || null"
              @close="showTasksDrawer = false"
              @action="handleTaskAction"
            />
          </div>
        </div>

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
            ⚠️ Minimum 80% requis pour la soumission (actuellement {{ crvStore.completude }}%)
          </div>
          <div v-else class="completude-success">
            ✅ CRV prêt pour soumission
          </div>

          <!-- Encart SLA -->
          <div v-if="slaStatus" class="sla-encart" :class="slaStatus.cssClass">
            <span class="sla-icon">⏱</span>
            <span class="sla-text">
              SLA : <strong>{{ slaStatus.label }}</strong>
              <span class="sla-detail">— {{ slaStatus.etape }} · {{ slaStatus.source }}</span>
              <span v-if="slaStatus.turnaround?.categorie" class="sla-detail sla-turnaround">
                · Turnaround {{ slaStatus.turnaround.turnaround }}min ({{ slaStatus.turnaround.source }})
              </span>
            </span>
          </div>

          <!-- SLA Bagages -->
          <div v-if="slaBagages" class="sla-bagages-row">
            <div v-if="slaBagages.premierBagage" class="sla-bagages-item" :class="slaBagages.premierBagage.cssClass">
              <span>1er bag. : </span>
              <strong>{{ slaBagages.premierBagage.label }}</strong>
              <span v-if="slaBagages.premierBagage.enAttente" class="sla-attente"> (en cours)</span>
            </div>
            <div v-if="slaBagages.dernierBagage" class="sla-bagages-item" :class="slaBagages.dernierBagage.cssClass">
              <span>Dern. bag. : </span>
              <strong>{{ slaBagages.dernierBagage.label }}</strong>
              <span v-if="slaBagages.dernierBagage.enAttente" class="sla-attente"> (en cours)</span>
            </div>
          </div>

          <!-- SLA Boarding + Check-in : NON affiché sur Arrivée (opérations Départ uniquement) -->
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
              <div class="step-label">Soumission</div>
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
            <!-- Horaires prévus -->
            <div v-if="crvStore.currentCRV?.horaire" class="horaires-prevus card">
              <h3 class="section-title">Horaires prévus</h3>
              <div class="horaires-row">
                <div class="horaire-item">
                  <label class="horaire-label">Atterrissage prévu</label>
                  <span class="horaire-value">{{ formatHoraire(crvStore.currentCRV.horaire.heureAtterrisagePrevue) }}</span>
                </div>
                <div v-if="crvStore.currentCRV.horaire.heureDecollagePrevue" class="horaire-item">
                  <label class="horaire-label">Décollage prévu</label>
                  <span class="horaire-value">{{ formatHoraire(crvStore.currentCRV.horaire.heureDecollagePrevue) }}</span>
                </div>
              </div>
            </div>
            <!-- Boarding + Check-in : NON affiché sur CRV Arrivée (opérations Départ uniquement) -->
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
            <CRVPersonnes v-model="formData.personnes" :disabled="crvStore.isLocked" />
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
                <span>{{ phasesNonTraitees.length }} phase(s) restante(s) non traitée(s)</span>
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
              :sla-terrain="slaTerrain"
              :code-i-a-t-a="crvStore.currentCRV?.vol?.codeIATA"
              @phase-update="handlePhaseUpdate"
            />

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
                type="button"
              >
                Continuer
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

          <!-- Étape 7: Soumission -->
          <div v-show="currentStep === 7">
            <CRVValidation
              v-model="formData.validation"
              :validated="isValidated"
              :loading="isLoading"
              :crv-id="crvStore.currentCRV?.id || crvStore.currentCRV?._id"
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
import { useSLA } from '@/composables/useSLA'
import { crvAPI } from '@/services/api'

import CRVHeader from '@/components/crv/CRVHeader.vue'
import CRVPersonnes from '@/components/crv/CRVPersonnes.vue'
import CRVEngins from '@/components/crv/CRVEngins.vue'
import CRVPhases from '@/components/crv/CRVPhases.vue'
import CRVCharges from '@/components/crv/CRVCharges.vue'
import CRVEvenements from '@/components/crv/CRVEvenements.vue'
import CRVValidation from '@/components/crv/CRVValidation.vue'
import CRVLockedBanner from '@/components/crv/CRVLockedBanner.vue'
import CRVSLABanner from '@/components/crv/CRVSLABanner.vue'
import CRVTasksBoard from '@/components/crv/CRVTasksBoard.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const crvStore = useCRVStore()
const { init: initSLA, calculerSLACRV, calculerSLABagages, calculerSLABoarding, calculerSLACheckin } = useSLA()
const slaStatus = computed(() => crvStore.currentCRV ? calculerSLACRV(crvStore.currentCRV) : null)
const slaBagages = computed(() => crvStore.currentCRV ? calculerSLABagages(crvStore.currentCRV) : null)
// SLA terrain agrégé pour CRVPhases
const slaTerrain = computed(() => {
  const result = {}
  const b = slaBagages.value
  if (b) {
    const worst = b.premierBagage?.niveau || b.dernierBagage?.niveau || null
    const detail = b.premierBagage?.label || b.dernierBagage?.label || null
    result.bagages = { niveau: worst, detail }
  }
  return result
})
const slaBoarding = computed(() => crvStore.currentCRV ? calculerSLABoarding(crvStore.currentCRV) : null)
const slaCheckin = computed(() => crvStore.currentCRV ? calculerSLACheckin(crvStore.currentCRV) : null)

const currentStep = ref(1)
const isValidated = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const stepValidationError = ref('')
const generatingPhases = ref(false)
const showTasksDrawer = ref(false)

// Actions des cartes CRVTasksBoard
const handleTaskAction = async ({ type, phase }) => {
  if (!phase) return
  const phaseId = phase.id || phase._id
  try {
    if (type === 'start') {
      await crvStore.demarrerPhase(phaseId)
    } else if (type === 'end') {
      await crvStore.terminerPhase(phaseId)
    }
  } catch (err) {
    console.error('[CRVArrivee] handleTaskAction erreur:', err.message)
  }
}

const formatHoraire = (datetime) => {
  if (!datetime) return '-'
  return new Date(datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// ── Horodatages terrain boarding ──
const formatDatetimeLocal = (isoString) => {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const updateCheckinHorodatage = async (champ, valeur) => {
  try {
    const crvId = crvStore.currentCRV?._id
    if (!crvId) return
    const horaire = crvStore.currentCRV.horaire || {}
    const payload = {
      ouvertureComptoirAt: horaire.ouvertureComptoirAt || null,
      fermetureComptoirAt: horaire.fermetureComptoirAt || null
    }
    payload[champ] = valeur ? new Date(valeur).toISOString() : null
    const { data } = await crvAPI.updateHorodatagesCheckin(crvId, payload)
    if (data.data) {
      crvStore.currentCRV.horaire.ouvertureComptoirAt = data.data.ouvertureComptoirAt
      crvStore.currentCRV.horaire.fermetureComptoirAt = data.data.fermetureComptoirAt
    }
  } catch (err) {
    console.error('[Checkin] Erreur mise à jour:', err.response?.data?.message || err.message)
  }
}

const updateBoardingHorodatage = async (champ, valeur) => {
  try {
    const crvId = crvStore.currentCRV?._id
    if (!crvId) return
    const horaire = crvStore.currentCRV.horaire || {}
    const payload = {
      debutBoardingAt: horaire.debutBoardingAt || null,
      fermetureGateAt: horaire.fermetureGateAt || null
    }
    payload[champ] = valeur ? new Date(valeur).toISOString() : null
    const { data } = await crvAPI.updateHorodatagesBoarding(crvId, payload)
    if (data.data) {
      crvStore.currentCRV.horaire.debutBoardingAt = data.data.debutBoardingAt
      crvStore.currentCRV.horaire.fermetureGateAt = data.data.fermetureGateAt
    }
  } catch (err) {
    console.error('[Boarding] Erreur mise à jour:', err.response?.data?.message || err.message)
  }
}

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
    // Phase traitée = TERMINE ou NON_REALISE (enum backend)
    const estTraitee = statut === 'TERMINE' ||
                       statut === 'NON_REALISE'
    return !estTraitee
  })
})

const toutesPhaseTraitees = computed(() => {
  if (crvStore.phases.length === 0) return true // Pas de phases = OK
  return phasesNonTraitees.value.length === 0
})

onMounted(async () => {
  initSLA()
  console.log('[CRVArrivee] onMounted - Initialisation...')
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Vérifier si un ID de CRV est passé en paramètre (édition d'un CRV existant)
    const crvId = route.query.id

    if (crvId) {
      // Charger le CRV seulement si le store n'a pas déjà le bon
      const storeId = crvStore.currentCRV?.id || crvStore.currentCRV?._id
      if (storeId !== crvId) {
        console.log('[CRVArrivee] Chargement CRV existant:', crvId)
        await crvStore.loadCRV(crvId)
        console.log('[CRVArrivee] CRV chargé:', crvStore.currentCRV?.numeroCRV)
      } else {
        console.log('[CRVArrivee] CRV déjà en store, skip loadCRV:', crvStore.currentCRV?.numeroCRV)
        // Charger les transitions en parallèle si pas encore faites
        if (crvStore.transitionsPossibles.length === 0) {
          crvStore.fetchTransitionsPossibles()
        }
      }
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
          immatriculation: vol.avion?.immatriculation || vol.immatriculation || '',
          typeAvion: vol.typeAvion || vol.avion?.typeAvion || '',
          poste: vol.posteStationnement || ''
        }
      }

      // Synchroniser le personnel
      if (crvStore.currentCRV.personnelAffecte?.length > 0) {
        formData.value.personnes = [...crvStore.currentCRV.personnelAffecte]
      }

      // Synchroniser les engins (mapper AffectationEnginVol → format CRVEngins)
      if (crvStore.engins?.length > 0) {
        formData.value.engins = crvStore.engins.map(a => ({
          type: a.engin?.typeEngin?.toLowerCase() || a.type || '',
          immatriculation: a.engin?.numeroEngin || a.immatriculation || '',
          heureDebut: a.heureDebut ? new Date(a.heureDebut).toTimeString().slice(0, 5) : '',
          heureFin: a.heureFin ? new Date(a.heureFin).toTimeString().slice(0, 5) : '',
          usage: a.usage || '',
          remarques: a.remarques || ''
        }))
      }
    }

    // Si le CRV est déjà validé/verrouillé, marquer comme validé pour afficher "Terminer" à l'étape 7
    if (['VALIDE', 'VERROUILLE'].includes(crvStore.currentCRV?.statut)) {
      isValidated.value = true
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

const isNavigating = ref(false)
const nextStep = async () => {
  if (isNavigating.value) return // anti-double-clic
  if (currentStep.value < 7) {
    // Réinitialiser l'erreur de validation
    stepValidationError.value = ''

    // Sauvegarder les données de l'étape courante si nécessaire
    isNavigating.value = true
    try {
      await saveCurrentStepData()
      currentStep.value++
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      isNavigating.value = false
    }
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
            typeAvion: formData.value.header.typeAvion,
            posteStationnement: formData.value.header.poste
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

    // La complétude est déjà mise à jour par updateCRV() — pas besoin de recharger

  } catch (error) {
    console.error('[CRVArrivee] Erreur sauvegarde:', error)
  }
}

/**
 * Handler pour les mises à jour de phases depuis CRVPhases
 */
const handlePhaseUpdate = (phaseData) => {
  console.log('[CRVArrivee] handlePhaseUpdate:', phaseData)
  // Le store (demarrerPhase, terminerPhase, etc.) recharge déjà le CRV après l'action
}

/**
 * Handler pour l'ajout de charges depuis CRVCharges
 */
const handleChargeAdded = (chargeData) => {
  console.log('[CRVArrivee] handleChargeAdded:', chargeData)
  // Le store (addCharge) recharge déjà le CRV après l'action
}

/**
 * Handler pour l'ajout d'événements depuis CRVEvenements
 */
const handleEvenementAdded = (evenementData) => {
  console.log('[CRVArrivee] handleEvenementAdded:', evenementData)
  // Le store (addEvenement) recharge déjà le CRV après l'action
}

/**
 * Validation finale du CRV
 */
const handleValidation = async (validationData) => {
  if (isLoading.value) return // Guard re-entry — empêche les double-clics
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
        return
      }
    }

    // Recharger pour avoir le nouveau statut
    await crvStore.loadCRV(crvStore.currentCRV.id || crvStore.currentCRV._id)

    // Soumission terminée — la validation TERMINÉ→VALIDÉ est du ressort du superviseur
    isValidated.value = true
    console.log('[CRVArrivee] Soumission complète, statut final:', crvStore.crvStatus)

  } catch (error) {
    console.error('[CRVArrivee] Erreur validation:', error)
    errorMessage.value = error.message || 'Erreur lors de la validation du CRV'
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
      if (statut === 'TERMINE' || statut === 'NON_REALISE') {
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
    errorMessage.value = 'Erreur lors de la génération des phases: ' + error.message
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
    errorMessage.value = 'Erreur: ' + error.message
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
    errorMessage.value = 'Erreur: ' + error.message
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
  background: var(--color-primary);
  color: var(--text-inverse);
}

.step.completed .step-number {
  background: var(--color-success);
  color: var(--text-inverse);
}

.step-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  max-width: 80px;
}

.step.active .step-label {
  color: var(--color-primary);
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
  background: var(--status-brouillon-bg);
  color: var(--status-brouillon-text);
}

.status-EN_COURS {
  background: var(--status-en-cours-bg);
  color: var(--status-en-cours-text);
}

.status-TERMINE {
  background: var(--status-termine-bg);
  color: var(--status-termine-text);
}

.status-VALIDE {
  background: var(--status-valide-bg);
  color: var(--status-valide-text);
  border: 2px solid var(--status-valide-border);
}

.status-VERROUILLE {
  background: var(--status-verrouille-bg);
  color: var(--status-verrouille-text);
  border: 2px solid var(--status-verrouille-border);
}

.status-ANNULE {
  background: var(--status-annule-bg);
  color: var(--status-annule-text);
  text-decoration: line-through;
}

/* Horaires prévus */
.horaires-prevus {
  background: var(--color-info-bg);
  border: 1px solid var(--color-info);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.horaires-prevus .section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 12px;
}

.horaires-row {
  display: flex;
  gap: 30px;
}

.horaire-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.horaire-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-info);
}

.horaire-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
}

.completude-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: var(--shadow-md);
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
  color: var(--text-primary);
}

.completude-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
}

.completude-bar {
  width: 100%;
  height: 24px;
  background: var(--border-color);
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
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning);
  border-radius: 8px;
  color: var(--status-termine-text);
  font-size: 14px;
  font-weight: 500;
}

.completude-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-success-bg);
  border: 1px solid var(--color-success);
  border-radius: 8px;
  color: var(--status-valide-text);
  font-size: 14px;
  font-weight: 600;
}

/* Encart SLA */
.sla-encart {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 8px;
}
.sla-encart .sla-icon { font-size: 16px; }
.sla-encart .sla-detail { opacity: 0.8; font-size: 12px; }
.sla-encart.sla-ok { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #22c55e; }
.sla-encart.sla-warning { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); color: #f59e0b; }
.sla-encart.sla-critical { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; }
.sla-encart.sla-exceeded { background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.5); color: #fca5a5; font-weight: 700; }
.sla-bagages-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 4px; }
.sla-bagages-item { font-size: 12px; padding: 3px 8px; border-radius: 4px; }
.sla-bagages-item.sla-ok { color: #22c55e; }
.sla-bagages-item.sla-warning { color: #f59e0b; }
.sla-bagages-item.sla-critical { color: #ef4444; }
.sla-bagages-item.sla-exceeded { color: #fca5a5; font-weight: 700; }
.sla-attente { font-style: italic; opacity: 0.7; }
.boarding-horodatages { margin-top: 8px; }
.boarding-horodatages .section-title { font-size: 14px; margin-bottom: 8px; }
.horaire-editable { display: flex; flex-direction: column; gap: 4px; }
.horaire-input { padding: 4px 8px; border: 1px solid var(--border-color, #ddd); border-radius: 4px; font-size: 13px; background: var(--bg-secondary, #f9fafb); color: var(--text-primary, #1f2937); }

/* Indicateur de progression des phases */
.phases-progress-indicator {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-md);
  border: 2px solid var(--border-color);
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
  color: var(--text-primary);
}

.phases-progress-count {
  font-size: 18px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}

.phases-progress-count.complete {
  background: var(--color-success-bg);
  color: var(--status-valide-text);
}

.phases-progress-count.incomplete {
  background: var(--color-warning-bg);
  color: var(--status-termine-text);
}

.phases-progress-bar {
  width: 100%;
  height: 12px;
  background: var(--border-color);
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
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning);
  border-radius: 8px;
  color: var(--status-termine-text);
  font-size: 14px;
  font-weight: 500;
}

.phases-success-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--color-success-bg);
  border: 1px solid var(--color-success);
  border-radius: 8px;
  color: var(--status-valide-text);
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
  background: var(--color-error-bg);
  border: 2px solid var(--color-error);
  border-radius: 12px;
  color: var(--status-verrouille-text);
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
  background: var(--text-tertiary) !important;
  cursor: pointer;
}

.btn-disabled:hover {
  background: var(--text-tertiary) !important;
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

/* Drawer Tableau tâches */
.tasks-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1100;
  display: flex;
  justify-content: flex-end;
  animation: drawer-fade 0.2s ease;
}

.tasks-drawer {
  width: 100%;
  max-width: 720px;
  height: 100%;
  background: var(--bg-body);
  overflow-y: auto;
  padding: 20px;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  animation: drawer-slide 0.25s ease;
}

@keyframes drawer-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes drawer-slide {
  from { transform: translateX(30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@media (max-width: 640px) {
  .tasks-drawer {
    padding: 12px;
  }
}
</style>
