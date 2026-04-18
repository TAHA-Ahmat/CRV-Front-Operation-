<template>
  <div class="crv-turnaround-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="btn-back">← Retour</button>
          <h1>CRV Turn Around</h1>
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
              @cause-retard="handleCauseRetard"
            />
          </div>
        </div>

        <!-- UX-5 : modal saisie cause retard -->
        <SLACauseRetardModal
          v-if="causeRetardPhase"
          :phase="causeRetardPhase"
          :crv-id="crvStore.currentCRV?._id || crvStore.currentCRV?.id"
          @close="causeRetardPhase = null"
          @saved="onCauseRetardSaved"
        />

        <!-- UX-3 : Onboarding SLA (première connexion) -->
        <OnboardingTour
          v-if="showOnboarding"
          storage-key="crv-onboarding-sla-vu"
          @close="onboardingClosed = true"
        />

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
                'low': crvStore.completude < SEUILS_COMPLETUDE.TERMINER,
                'medium': crvStore.completude >= SEUILS_COMPLETUDE.TERMINER && crvStore.completude < SEUILS_COMPLETUDE.VALIDER,
                'high': crvStore.completude >= SEUILS_COMPLETUDE.VALIDER
              }"
              :style="{ width: crvStore.completude + '%' }"
            ></div>
          </div>
          <div v-if="crvStore.completude < SEUILS_COMPLETUDE.VALIDER" class="completude-warning">
            ⚠️ Minimum {{ SEUILS_COMPLETUDE.VALIDER }}% requis pour la soumission (actuellement {{ crvStore.completude }}%)
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

          <!-- SLA Boarding -->
          <div v-if="slaBoarding" class="sla-bagages-row">
            <div v-if="slaBoarding.debut" class="sla-bagages-item" :class="slaBoarding.debut.cssClass">
              <span>Boarding : </span>
              <strong>{{ slaBoarding.debut.label }}</strong>
              <span v-if="slaBoarding.debut.enAttente" class="sla-attente"> (en attente)</span>
            </div>
            <div v-if="slaBoarding.fermetureGate" class="sla-bagages-item" :class="slaBoarding.fermetureGate.cssClass">
              <span>Gate : </span>
              <strong>{{ slaBoarding.fermetureGate.label }}</strong>
              <span v-if="slaBoarding.fermetureGate.enAttente" class="sla-attente"> (en attente)</span>
            </div>
          </div>
          <!-- SLA Check-in -->
          <div v-if="slaCheckin" class="sla-bagages-row">
            <div v-if="slaCheckin.ouverture" class="sla-bagages-item" :class="slaCheckin.ouverture.cssClass">
              <span>Check-in ouv. : </span>
              <strong>{{ slaCheckin.ouverture.label }}</strong>
              <span v-if="slaCheckin.ouverture.enAttente" class="sla-attente"> (en attente)</span>
            </div>
            <div v-if="slaCheckin.fermeture" class="sla-bagages-item" :class="slaCheckin.fermeture.cssClass">
              <span>Check-in ferm. : </span>
              <strong>{{ slaCheckin.fermeture.label }}</strong>
              <span v-if="slaCheckin.fermeture.enAttente" class="sla-attente"> (en attente)</span>
            </div>
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
              <div class="step-label">Soumission</div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="crv-form">
          <!-- Étape 1: Informations vol -->
          <div v-show="currentStep === 1">
            <CRVHeader
              v-model="formData.header"
              title="Informations du vol - Turn Around"
              :disabled="crvStore.isLocked"
            />

            <!-- Horaires prévus (depuis le bulletin) -->
            <div v-if="crvStore.currentCRV?.horaire" class="horaires-prevus card">
              <h3 class="section-title">Horaires prévus</h3>
              <div class="horaires-row">
                <div v-if="crvStore.currentCRV.horaire.heureAtterrisagePrevue" class="horaire-item">
                  <label class="horaire-label">Atterrissage prévu</label>
                  <span class="horaire-value">{{ formatHoraire(crvStore.currentCRV.horaire.heureAtterrisagePrevue) }}</span>
                </div>
                <div v-if="crvStore.currentCRV.horaire.heureDecollagePrevue" class="horaire-item">
                  <label class="horaire-label">Décollage prévu</label>
                  <span class="horaire-value">{{ formatHoraire(crvStore.currentCRV.horaire.heureDecollagePrevue) }}</span>
                </div>
              </div>
            </div>

            <!-- Boarding + Check-in : déplacés vers Step 4 (phases TA_BOARDING + TA_CHECKIN) -->

            <div class="step-actions">
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
              <button v-if="!crvStore.isLocked" @click="nextStep" class="btn btn-primary" type="button">
                Continuer
              </button>
            </div>
          </div>

          <!-- Étape 3: Engins -->
          <div v-show="currentStep === 3">
            <CRVEngins v-model="formData.engins" :disabled="crvStore.isLocked" />
            <div class="step-actions">
              <button @click="prevStep" class="btn btn-secondary" type="button">
                Retour
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
                <span class="phases-progress-label">Progression des phases (Turn Around)</span>
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
                {{ phasesNonTraitees.length }} phase(s) restante(s) non traitée(s)
              </div>
              <div v-else class="phases-success-message">
                Toutes les phases sont traitées - Vous pouvez continuer
              </div>
            </div>

            <CRVPhases
              :phases="crvStore.phases"
              crv-type="turnaround"
              :disabled="crvStore.isLocked"
              :sla-terrain="slaTerrain"
              :code-i-a-t-a="crvStore.currentCRV?.vol?.codeIATA"
            />

            <div class="step-actions">
              <button @click="prevStep" class="btn btn-secondary" type="button">
                Retour
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
import OnboardingTour from '@/components/Common/OnboardingTour.vue'
import SLACauseRetardModal from '@/components/crv/SLACauseRetardModal.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const crvStore = useCRVStore()

const { init: initSLA, calculerSLACRV, calculerSLABagages, calculerSLABoarding, calculerSLACheckin } = useSLA()
const slaStatus = computed(() => crvStore.currentCRV ? calculerSLACRV(crvStore.currentCRV) : null)
const slaBagages = computed(() => crvStore.currentCRV ? calculerSLABagages(crvStore.currentCRV) : null)
const slaBoarding = computed(() => crvStore.currentCRV ? calculerSLABoarding(crvStore.currentCRV) : null)
const slaCheckin = computed(() => crvStore.currentCRV ? calculerSLACheckin(crvStore.currentCRV) : null)

// SLA terrain agrégé pour CRVPhases
const slaTerrain = computed(() => {
  const result = {}
  const b = slaBagages.value
  if (b) {
    const worst = b.premierBagage?.niveau || b.dernierBagage?.niveau || null
    const detail = b.premierBagage?.label || b.dernierBagage?.label || null
    result.bagages = { niveau: worst, detail }
  }
  const bd = slaBoarding.value
  if (bd) {
    const worst = bd.debut?.niveau || bd.fermetureGate?.niveau || null
    const detail = bd.debut?.label || bd.fermetureGate?.label || null
    result.boarding = { niveau: worst, detail }
  }
  return result
})

const currentStep = ref(1)
const isValidated = ref(false)
const isLoading = ref(false)
const stepValidationError = ref('')
const showTasksDrawer = ref(false)

// UX-3 : onboarding SLA première connexion
const onboardingClosed = ref(false)
const showOnboarding = computed(() => {
  if (onboardingClosed.value) return false
  const r = authStore.currentUser?.fonction || authStore.currentUser?.role
  return ['AGENT_ESCALE', 'CHEF_EQUIPE', 'SUPERVISEUR'].includes(r)
})

// UX-5 : modal saisie cause retard
const causeRetardPhase = ref(null)
const exceededAutoPrompted = ref(new Set())

function handleCauseRetard(phase) {
  causeRetardPhase.value = phase
}

function onCauseRetardSaved() {
  causeRetardPhase.value = null
}

function detectExceededPhase(phases) {
  if (!phases) return null
  const SLA_CODE_PREFIXES = ['CHECKIN_', 'BRIEFING_', 'BOARDING_', 'BAGAGES_', 'RAMP_', 'MSG_']
  const now = new Date()
  for (const p of phases) {
    const code = p?.phase?.code || p?.code || ''
    if (!SLA_CODE_PREFIXES.some(pref => code.startsWith(pref))) continue
    if (p.statut === 'TERMINE' || p.statut === 'NON_REALISE') continue
    const id = p.id || p._id
    if (!id || exceededAutoPrompted.value.has(id)) continue
    const slaMode = p?.phase?.slaMode || 'DUREE'
    if (slaMode === 'DEADLINE') {
      const ref = p.statut === 'EN_COURS' ? p.heureFinPrevue : p.heureDebutPrevue
      if (ref && new Date(ref) <= now) return p
    } else if (p.statut === 'EN_COURS' && p.heureDebutReelle && p?.phase?.dureeStandardMinutes) {
      const elapsed = (now - new Date(p.heureDebutReelle)) / 60000
      if (elapsed >= p.phase.dureeStandardMinutes) return p
    }
  }
  return null
}

let exceededInterval = null
onMounted(() => {
  exceededInterval = setInterval(() => {
    if (causeRetardPhase.value) return
    if (crvStore.isLocked) return
    const p = detectExceededPhase(crvStore.phases)
    if (p) {
      exceededAutoPrompted.value.add(p.id || p._id)
      causeRetardPhase.value = p
    }
  }, 30_000)
})
onUnmounted(() => {
  if (exceededInterval) clearInterval(exceededInterval)
})

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
    console.error('[CRVTurnAround] handleTaskAction erreur:', err.message)
  }
}

const formData = ref({
  header: {
    numeroVol: '',
    compagnieAerienne: '',
    codeIATA: '',
    dateVol: new Date().toISOString().split('T')[0],
    aeroportOrigine: '',
    aeroportDestination: '',
    typeAvion: '',
    immatriculation: '',
    poste: ''
  },
  personnes: [],
  engins: [],
  charges: {
    passagers: { adultes: 0, enfants: 0, bebes: 0 },
    bagages: { nombre: 0, poids: 0, speciaux: 0 },
    fret: { nombre: 0, poids: 0, dangereux: false },
    courrier: { nombre: 0, poids: 0 }
  },
  evenements: [],
  validation: {
    validateur: '',
    fonction: '',
    commentaires: '',
    certifie: false,
    dateValidation: null
  }
})

// Validation des phases - toutes les phases doivent être TERMINE ou NON_REALISE
// Aligné sur CRVArrivee : utilise crvStore.phases (données backend)
const phasesNonTraitees = computed(() => {
  return crvStore.phases.filter(p => {
    const statut = p.statut?.toUpperCase() || ''
    const estTraitee = statut === 'TERMINE' ||
                       statut === 'NON_REALISE'
    return !estTraitee
  })
})

const toutesPhaseTraitees = computed(() => {
  if (crvStore.phases.length === 0) return true
  return phasesNonTraitees.value.length === 0
})

const formatHoraire = (datetime) => {
  if (!datetime) return '—'
  const d = new Date(datetime)
  return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// ── Horodatages terrain boarding ──
const formatDatetimeLocal = (isoString) => {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
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

onMounted(async () => {
  initSLA()
  console.log('[CRVTurnAround] onMounted - Initialisation...')

  try {
    // Charger le CRV existant si ID en paramètre
    const crvId = route.query.id

    if (crvId) {
      const storeId = crvStore.currentCRV?.id || crvStore.currentCRV?._id
      if (storeId !== crvId) {
        console.log('[CRVTurnAround] Chargement CRV existant:', crvId)
        await crvStore.loadCRV(crvId)
      }
    } else if (!crvStore.currentCRV) {
      console.log('[CRVTurnAround] Création du CRV...')
      await crvStore.createCRV({
        type: 'turnaround',
        date: formData.value.header.date
      })
    }

    // Démarrer automatiquement si BROUILLON
    if (crvStore.currentCRV?.statut === 'BROUILLON') {
      try {
        await crvStore.demarrerCRV()
        console.log('[CRVTurnAround] CRV démarré:', crvStore.currentCRV?.statut)
      } catch (e) {
        console.warn('[CRVTurnAround] Impossible de démarrer le CRV:', e.message)
      }
    }

    // Pré-remplir le formulaire avec les données du CRV
    if (crvStore.currentCRV) {
      // Synchroniser les infos du vol
      if (crvStore.currentCRV.vol) {
        const vol = crvStore.currentCRV.vol
        formData.value.header = {
          numeroVol: vol.numeroVol || '',
          compagnieAerienne: vol.compagnieAerienne || '',
          codeIATA: vol.codeIATA || '',
          dateVol: vol.dateVol ? vol.dateVol.split('T')[0] : formData.value.header.dateVol,
          aeroportOrigine: vol.aeroportOrigine || '',
          aeroportDestination: vol.aeroportDestination || '',
          typeAvion: vol.typeAvion || vol.avion?.typeAvion || '',
          immatriculation: vol.avion?.immatriculation || vol.immatriculation || '',
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

    console.log('[CRVTurnAround] Initialisation terminée:', {
      numeroCRV: crvStore.currentCRV?.numeroCRV,
      statut: crvStore.currentCRV?.statut,
      completude: crvStore.completude
    })
  } catch (error) {
    console.error('[CRVTurnAround] Erreur initialisation:', error)
  }
})

/**
 * Sauvegarder les données de l'étape courante vers le backend
 * Steps 4 (phases), 5 (charges), 6 (événements) : gérés directement par leurs composants via le store
 * Steps 2 (personnel), 3 (engins) : sauvegardés ici depuis formData
 */
const saveCurrentStepData = async () => {
  if (crvStore.isLocked) return

  const crvId = crvStore.currentCRV?.id || crvStore.currentCRV?._id
  if (!crvId) return

  try {
    switch (currentStep.value) {
      case 1: {
        // Étape 1: Sauvegarder les infos du vol (aligné sur CRVHeader)
        const h = formData.value.header
        await crvStore.updateCRV({
          vol: {
            numeroVol: h.numeroVol,
            compagnieAerienne: h.compagnieAerienne,
            codeIATA: h.codeIATA,
            dateVol: h.dateVol,
            aeroportOrigine: h.aeroportOrigine,
            aeroportDestination: h.aeroportDestination,
            typeAvion: h.typeAvion,
            immatriculation: h.immatriculation,
            posteStationnement: h.poste
          }
        })
        break
      }
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
      // Steps 4, 5, 6 : composants CRVPhases, CRVCharges, CRVEvenements
      // gèrent la sauvegarde directement via le store
    }

    // La complétude est déjà mise à jour par updateCRV() — pas besoin de recharger
  } catch (error) {
    console.error('[CRVTurnAround] Erreur sauvegarde étape:', error)
    stepValidationError.value = 'Attention : la sauvegarde a échoué. Vos données pourraient ne pas être enregistrées.'
  }
}

const isNavigating = ref(false)
const nextStep = async () => {
  if (isNavigating.value) return // anti-double-clic
  if (currentStep.value < 7) {
    // Réinitialiser l'erreur de validation
    stepValidationError.value = ''

    // Sauvegarder les données de l'étape courante
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

const handleChargeAdded = (chargeData) => {
  console.log('[CRVTurnAround] handleChargeAdded:', chargeData)
}

const handleEvenementAdded = (evenementData) => {
  console.log('[CRVTurnAround] handleEvenementAdded:', evenementData)
}

const handleValidation = async (validationData) => {
  if (isLoading.value) return // Guard re-entry — empêche les double-clics

  try {
    isLoading.value = true

    const statut = crvStore.crvStatus
    const completude = crvStore.completude
    const crvId = crvStore.currentCRV?.id || crvStore.currentCRV?._id

    console.log('[CRVTurnAround] handleValidation - État actuel:', { completude, statut })

    // Sauvegarder personnel et engins avant la transition
    if (crvStore.currentCRV) {
      if (formData.value.personnes.length > 0) {
        await crvStore.updatePersonnel(formData.value.personnes)
      }
      if (formData.value.engins.length > 0) {
        await crvStore.updateEngins(formData.value.engins)
      }
    }

    // Étape 1 : Si EN_COURS, terminer d'abord (seuil 50%)
    if (statut === 'EN_COURS') {
      if (completude < SEUILS_COMPLETUDE.TERMINER) {
        stepValidationError.value = `Complétude insuffisante pour terminer : ${completude}% (minimum ${SEUILS_COMPLETUDE.TERMINER}% requis)`
        return
      }

      console.log('[CRVTurnAround] Terminaison du CRV...')
      try {
        await crvStore.terminerCRV()
        console.log('[CRVTurnAround] CRV terminé')
      } catch (e) {
        console.error('[CRVTurnAround] Erreur terminaison:', e)
        if (crvStore.anomalies.length > 0) {
          stepValidationError.value = `Impossible de terminer :\n${crvStore.anomalies.join('\n')}`
        } else {
          stepValidationError.value = e.message || 'Erreur lors de la terminaison'
        }
        return
      }
    }

    // Recharger pour avoir le nouveau statut
    await crvStore.loadCRV(crvId)

    // Soumission terminée — la validation TERMINÉ→VALIDÉ est du ressort du superviseur
    isValidated.value = true
    console.log('[CRVTurnAround] Soumission complète, statut final:', crvStore.crvStatus)

  } catch (error) {
    console.error('[CRVTurnAround] Erreur validation:', error)
    stepValidationError.value = error.message || 'Erreur lors de la validation du CRV'
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = () => {
  // Soumission gérée par la validation
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
.crv-turnaround-container {
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
  padding: 12px 16px;
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning);
  border-radius: 8px;
  color: var(--status-termine-text);
  font-size: 14px;
  font-weight: 500;
}

.phases-success-message {
  padding: 12px 16px;
  background: var(--color-success-bg);
  border: 1px solid var(--color-success);
  border-radius: 8px;
  color: var(--status-valide-text);
  font-size: 14px;
  font-weight: 600;
}

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

.btn-disabled {
  opacity: 0.7;
  background: var(--text-tertiary) !important;
}

.boarding-horodatages { margin-top: 8px; }
.boarding-horodatages .section-title { font-size: 14px; margin-bottom: 8px; }
.horaire-editable { display: flex; flex-direction: column; gap: 4px; }
.horaire-input { padding: 4px 8px; border: 1px solid var(--border-color, #ddd); border-radius: 4px; font-size: 13px; background: var(--bg-secondary, #f9fafb); color: var(--text-primary, #1f2937); }

/* ============================================ */
/* RESPONSIVE DESIGN                            */
/* ============================================ */

/* Mobile (< 768px = Tailwind md) */
@media (max-width: 767px) {
  .header-content {
    flex-direction: column;
    gap: 10px;
    padding: 10px 12px;
    align-items: flex-start;
  }

  .header-left {
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
  }

  .header-left h1 {
    font-size: 18px;
    order: 1;
    width: 100%;
  }

  .btn-back {
    padding: 6px 12px;
    font-size: 13px;
    order: 0;
  }

  .status-badge {
    font-size: 11px;
    padding: 4px 10px;
    order: 2;
  }

  .user-info {
    width: 100%;
    justify-content: space-between;
    gap: 10px;
  }

  .user-info span {
    font-size: 12px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-info .btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .crv-main {
    padding: 12px 10px 80px;
  }

  .crv-progress {
    padding: 14px;
    margin-bottom: 14px;
    border-radius: 10px;
  }

  .progress-steps {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    justify-content: flex-start;
    gap: 10px;
    padding-bottom: 6px;
    scrollbar-width: thin;
  }

  .progress-steps::before {
    display: none;
  }

  .step {
    flex: 0 0 auto;
    min-width: 64px;
  }

  .step-number {
    width: 30px;
    height: 30px;
    font-size: 13px;
  }

  .step-label {
    font-size: 10px;
    max-width: 64px;
    line-height: 1.15;
  }

  .completude-section {
    padding: 16px;
    margin-bottom: 16px;
  }

  .completude-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .completude-label {
    font-size: 14px;
  }

  .completude-value {
    font-size: 20px;
  }

  .completude-bar {
    height: 16px;
  }

  .completude-warning,
  .completude-success {
    font-size: 12px;
    padding: 10px 12px;
    flex-wrap: wrap;
  }

  .phases-progress-indicator {
    padding: 14px;
  }

  .phases-progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .phases-progress-label {
    font-size: 13px;
  }

  .phases-progress-count {
    font-size: 14px;
  }

  .phases-warning-message,
  .phases-success-message {
    font-size: 12px;
    padding: 10px 12px;
  }

  .step-actions {
    flex-direction: column-reverse;
    gap: 8px;
    padding: 12px;
    margin-top: 20px;
    position: sticky;
    bottom: 0;
    background: var(--bg-card);
    border-top: 1px solid var(--border-color);
    z-index: 40;
    border-radius: 10px 10px 0 0;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
  }

  .step-actions .btn {
    width: 100%;
    min-width: unset;
    padding: 12px;
    min-height: 44px;
  }

  .step-validation-error {
    padding: 14px;
  }

  .step-validation-error strong {
    font-size: 14px;
  }

  .step-validation-error pre {
    font-size: 12px;
  }
}

/* Tablet portrait (768px - 1023px = md:) */
@media (min-width: 768px) and (max-width: 1023px) {
  .header-content {
    padding: 14px 18px;
  }

  .header-left h1 {
    font-size: 20px;
  }

  .crv-main {
    padding: 20px 16px;
  }

  .crv-progress {
    padding: 20px;
  }

  .progress-steps {
    gap: 4px;
  }

  .step-number {
    width: 36px;
    height: 36px;
  }

  .step-label {
    font-size: 11px;
    max-width: 72px;
  }

  .progress-steps::before {
    left: 28px;
    right: 28px;
    top: 18px;
  }

  .step-actions {
    gap: 12px;
  }

  .step-actions .btn {
    min-width: 100px;
    min-height: 44px;
  }

  .tasks-drawer {
    max-width: 85%;
  }
}

/* Desktop (≥ 1024px) */
@media (min-width: 1024px) {
  .crv-main {
    padding: 30px 20px;
  }

  .crv-progress {
    padding: 30px;
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

@media (max-width: 767px) {
  .tasks-drawer {
    padding: 12px;
    max-width: 100%;
  }
}
</style>
