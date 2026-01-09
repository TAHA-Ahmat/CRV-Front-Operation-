<template>
  <div class="crv-depart-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="btn-back">← Retour</button>
          <h1>CRV Départ</h1>
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
              title="Informations du vol - Départ"
              :disabled="crvStore.isLocked"
            />
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
                <span class="phases-progress-label">Progression des phases</span>
                <span class="phases-progress-count" :class="{
                  'complete': toutesPhaseTraitees,
                  'incomplete': !toutesPhaseTraitees
                }">
                  {{ formData.phases.length - phasesNonTraitees.length }} / {{ formData.phases.length }} traitées
                </span>
              </div>
              <div class="phases-progress-bar">
                <div
                  class="phases-progress-fill"
                  :class="{ 'complete': toutesPhaseTraitees }"
                  :style="{ width: formData.phases.length > 0 ? ((formData.phases.length - phasesNonTraitees.length) / formData.phases.length * 100) + '%' : '0%' }"
                ></div>
              </div>
              <div v-if="!toutesPhaseTraitees" class="phases-warning-message">
                {{ phasesNonTraitees.length }} phase(s) restante(s) à traiter avant de continuer
              </div>
              <div v-else class="phases-success-message">
                Toutes les phases sont traitées - Vous pouvez continuer
              </div>
            </div>

            <CRVPhases
              v-model="formData.phases"
              crv-type="depart"
              :disabled="crvStore.isLocked"
            />

            <!-- Message d'erreur si tentative de continuer sans traiter les phases -->
            <div v-if="stepValidationError && currentStep === 4" class="step-validation-error">
              <strong>Validation impossible</strong>
              <pre>{{ stepValidationError }}</pre>
            </div>

            <div class="step-actions">
              <button @click="prevStep" class="btn btn-secondary" type="button">
                Retour
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
            <CRVCharges v-model="formData.charges" :disabled="crvStore.isLocked" />
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
            <CRVEvenements v-model="formData.evenements" :disabled="crvStore.isLocked" />
            <div class="step-actions">
              <button @click="prevStep" class="btn btn-secondary" type="button">
                Retour
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCRVStore } from '@/stores/crvStore'

import CRVHeader from '@/components/crv/CRVHeader.vue'
import CRVPersonnes from '@/components/crv/CRVPersonnes.vue'
import CRVEngins from '@/components/crv/CRVEngins.vue'
import CRVPhases from '@/components/crv/CRVPhases.vue'
import CRVCharges from '@/components/crv/CRVCharges.vue'
import CRVEvenements from '@/components/crv/CRVEvenements.vue'
import CRVValidation from '@/components/crv/CRVValidation.vue'
import CRVLockedBanner from '@/components/CRV/CRVLockedBanner.vue'

const router = useRouter()
const authStore = useAuthStore()
const crvStore = useCRVStore()

const currentStep = ref(1)
const isValidated = ref(false)
const stepValidationError = ref('')

// Validation des phases - toutes les phases doivent être traitées
const phasesNonTraitees = computed(() => {
  // Pour les données locales, vérifier si realisee ou raisonNonRealisation
  return formData.value.phases.filter(p => !p.realisee && !p.raisonNonRealisation)
})

const toutesPhaseTraitees = computed(() => {
  if (formData.value.phases.length === 0) return true
  return phasesNonTraitees.value.length === 0
})

const formData = ref({
  header: {
    numeroVol: '',
    date: new Date().toISOString().split('T')[0],
    typeAppareil: '',
    immatriculation: '',
    route: '',
    poste: ''
  },
  personnes: [],
  engins: [],
  phases: [
    { nom: 'Enregistrement passagers', realisee: false, heureDebut: '', heureFin: '', observations: '', raisonNonRealisation: '' },
    { nom: 'Chargement bagages', realisee: false, heureDebut: '', heureFin: '', observations: '', raisonNonRealisation: '' },
    { nom: 'Chargement fret', realisee: false, heureDebut: '', heureFin: '', observations: '', raisonNonRealisation: '' },
    { nom: 'Embarquement passagers', realisee: false, heureDebut: '', heureFin: '', observations: '', raisonNonRealisation: '' },
    { nom: 'Nettoyage cabine', realisee: false, heureDebut: '', heureFin: '', observations: '', raisonNonRealisation: '' },
    { nom: 'Repoussage', realisee: false, heureDebut: '', heureFin: '', observations: '', raisonNonRealisation: '' }
  ],
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

onMounted(async () => {
  // Créer le CRV s'il n'existe pas
  if (!crvStore.currentCRV) {
    try {
      await crvStore.createCRV({
        type: 'depart',
        date: formData.value.header.date
      })
    } catch (error) {
      console.error('Erreur lors de la création du CRV:', error)
    }
  }
})

const nextStep = () => {
  if (currentStep.value < 7) {
    // Réinitialiser l'erreur de validation
    stepValidationError.value = ''

    // VALIDATION ÉTAPE 4 (Phases) : Toutes les phases doivent être traitées
    if (currentStep.value === 4) {
      if (!toutesPhaseTraitees.value) {
        const nbNonTraitees = phasesNonTraitees.value.length

        let message = `Impossible de continuer : ${nbNonTraitees} phase(s) non traitée(s).\n\n`
        message += `Phase(s) non traitées :\n`
        phasesNonTraitees.value.forEach(p => {
          message += `  - ${p.nom}\n`
        })
        message += '\nPour chaque phase, vous devez :\n'
        message += '• Soit la réaliser (remplir heures début/fin)\n'
        message += '• Soit indiquer la raison de non-réalisation'

        stepValidationError.value = message
        alert(message)
        console.warn('[CRVDepart] Blocage étape 4 - Phases non traitées:', phasesNonTraitees.value)
        return
      }
    }

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

const handleValidation = async (validationData) => {
  try {
    // Vérifier la complétude minimale
    if (crvStore.completude < 80) {
      alert(`La complétude du CRV est insuffisante (${crvStore.completude}%). Minimum requis : 80%`)
      return
    }

    // Sauvegarder toutes les données
    if (crvStore.currentCRV) {
      await crvStore.updatePersonnes(formData.value.personnes)
      await crvStore.updateEngins(formData.value.engins)
      await crvStore.updatePhases(formData.value.phases)
      await crvStore.updateCharges(formData.value.charges)
      await crvStore.updateEvenements(formData.value.evenements)
      await crvStore.validateCRV()
    }
    isValidated.value = true
  } catch (error) {
    console.error('Erreur lors de la validation:', error)
    alert('Erreur lors de la validation du CRV')
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
.crv-depart-container {
  min-height: 100vh;
  background: #f9fafb;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
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
  background: #f3f4f6;
  color: #374151;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #e5e7eb;
}

.app-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info span {
  color: #6b7280;
  font-size: 14px;
}

.crv-main {
  padding: 30px 20px;
}

.crv-progress {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  background: #e5e7eb;
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
  background: #e5e7eb;
  color: #6b7280;
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
  color: #6b7280;
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
  border-top: 2px solid #e5e7eb;
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
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  color: #92400e;
  font-size: 14px;
  font-weight: 500;
}

.phases-success-message {
  padding: 12px 16px;
  background: #d1fae5;
  border: 1px solid #10b981;
  border-radius: 8px;
  color: #065f46;
  font-size: 14px;
  font-weight: 600;
}

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

.btn-disabled {
  opacity: 0.7;
  background: #9ca3af !important;
}
</style>
