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
                'low': crvStore.completude < SEUILS_COMPLETUDE.TERMINER,
                'medium': crvStore.completude >= SEUILS_COMPLETUDE.TERMINER && crvStore.completude < SEUILS_COMPLETUDE.VALIDER,
                'high': crvStore.completude >= SEUILS_COMPLETUDE.VALIDER
              }"
              :style="{ width: crvStore.completude + '%' }"
            ></div>
          </div>
          <div v-if="crvStore.completude < SEUILS_COMPLETUDE.VALIDER" class="completude-warning">
            ⚠️ Minimum {{ SEUILS_COMPLETUDE.VALIDER }}% requis pour la validation (actuellement {{ crvStore.completude }}%)
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
            <!-- Horaires prévus -->
            <div v-if="crvStore.currentCRV?.horaire" class="horaires-prevus card">
              <h3 class="section-title">Horaires prévus</h3>
              <div class="horaires-row">
                <div v-if="crvStore.currentCRV.horaire.heureAtterrisagePrevue" class="horaire-item">
                  <label class="horaire-label">Atterrissage prévu</label>
                  <span class="horaire-value">{{ formatHoraire(crvStore.currentCRV.horaire.heureAtterrisagePrevue) }}</span>
                </div>
                <div class="horaire-item">
                  <label class="horaire-label">Décollage prévu</label>
                  <span class="horaire-value">{{ formatHoraire(crvStore.currentCRV.horaire.heureDecollagePrevue) }}</span>
                </div>
              </div>
            </div>
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
                {{ phasesNonTraitees.length }} phase(s) restante(s) à traiter avant de continuer
              </div>
              <div v-else class="phases-success-message">
                Toutes les phases sont traitées - Vous pouvez continuer
              </div>
            </div>

            <CRVPhases
              :phases="crvStore.phases"
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

          <!-- Étape 7: Validation -->
          <div v-show="currentStep === 7">
            <CRVValidation
              v-model="formData.validation"
              :validated="isValidated"
              :loading="isLoading"
              :crv-id="crvStore.currentCRV?.id || crvStore.currentCRV?._id"
              @validate="handleValidation"
            />

            <!-- Bouton Verrouiller — visible quand CRV est VALIDE (Bug #7 Mission 027) -->
            <div v-if="crvStore.crvStatus === 'VALIDE' && canLockCRV(userRole)" class="verrouiller-section">
              <div class="verrouiller-info">
                <span class="verrouiller-icon">&#128274;</span>
                <div>
                  <strong>CRV validé — Prêt pour verrouillage</strong>
                  <p class="verrouiller-desc">Le verrouillage rend le CRV définitif. Aucune modification ne sera possible après.</p>
                </div>
              </div>
              <button
                @click="handleVerrouiller"
                class="btn btn-lock"
                :disabled="lockingCRV"
                type="button"
              >
                {{ lockingCRV ? 'Verrouillage...' : 'Verrouiller le CRV' }}
              </button>
            </div>

            <div v-if="!isValidated && crvStore.crvStatus !== 'VALIDE'" class="step-actions">
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
import CRVLockedBanner from '@/components/crv/CRVLockedBanner.vue'
import { validationAPI } from '@/services/api'
import { canLockCRV } from '@/utils/permissions'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const crvStore = useCRVStore()

const currentStep = ref(1)
const isValidated = ref(false)
const isLoading = ref(false)
const lockingCRV = ref(false)
const stepValidationError = ref('')

// Rôle utilisateur pour vérification permissions verrouillage (Bug #7)
const userRole = computed(() => authStore.currentUser?.fonction || authStore.currentUser?.role)

const formatHoraire = (datetime) => {
  if (!datetime) return '-'
  return new Date(datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Validation des phases - toutes les phases doivent être TERMINE ou NON_REALISE
// Aligné sur CRVArrivee et CRVTurnAround : utilise crvStore.phases (données backend)
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
  console.log('[CRVDepart] onMounted - Initialisation...')

  try {
    // Charger le CRV existant si ID en paramètre
    const crvId = route.query.id

    if (crvId) {
      const storeId = crvStore.currentCRV?.id || crvStore.currentCRV?._id
      if (storeId !== crvId) {
        console.log('[CRVDepart] Chargement CRV existant:', crvId)
        await crvStore.loadCRV(crvId)
      }
    } else if (!crvStore.currentCRV) {
      console.log('[CRVDepart] Création du CRV...')
      await crvStore.createCRV({
        type: 'depart',
        date: formData.value.header.date
      })
    }

    // Démarrer automatiquement si BROUILLON
    if (crvStore.currentCRV?.statut === 'BROUILLON') {
      try {
        await crvStore.demarrerCRV()
        console.log('[CRVDepart] CRV démarré:', crvStore.currentCRV?.statut)
      } catch (e) {
        console.warn('[CRVDepart] Impossible de démarrer le CRV:', e.message)
      }
    }

    // Pré-remplir le formulaire avec les données du CRV
    if (crvStore.currentCRV) {
      // Synchroniser les infos du vol
      if (crvStore.currentCRV.vol) {
        const vol = crvStore.currentCRV.vol
        formData.value.header = {
          numeroVol: vol.numeroVol || '',
          date: vol.dateVol ? vol.dateVol.split('T')[0] : formData.value.header.date,
          typeAppareil: vol.typeAvion || vol.avion?.typeAvion || '',
          immatriculation: vol.avion?.immatriculation || vol.immatriculation || '',
          route: [vol.aeroportOrigine, vol.aeroportDestination].filter(Boolean).join(' - '),
          poste: vol.posteStationnement || ''
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

    // Si le CRV est déjà validé/verrouillé, marquer comme validé pour afficher "Terminer" à l'étape 7
    if (['VALIDE', 'VERROUILLE'].includes(crvStore.currentCRV?.statut)) {
      isValidated.value = true
    }

    console.log('[CRVDepart] Initialisation terminée:', {
      numeroCRV: crvStore.currentCRV?.numeroCRV,
      statut: crvStore.currentCRV?.statut,
      completude: crvStore.completude
    })
  } catch (error) {
    console.error('[CRVDepart] Erreur initialisation:', error)
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
        // Étape 1: Sauvegarder les infos du vol (aligné sur CRVArrivee)
        const h = formData.value.header
        const routeParts = h.route ? h.route.split(' - ') : []
        await crvStore.updateCRV({
          vol: {
            numeroVol: h.numeroVol,
            dateVol: h.date,
            typeAvion: h.typeAppareil,
            immatriculation: h.immatriculation,
            aeroportOrigine: routeParts[0] || '',
            aeroportDestination: routeParts[1] || '',
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

    // Recharger pour mettre à jour la complétude
    await crvStore.loadCRV(crvId)
    console.log(`[CRVDepart] Sauvegarde étape ${currentStep.value} OK — Complétude: ${crvStore.completude}%`)
  } catch (error) {
    console.error('[CRVDepart] Erreur sauvegarde étape:', error)
    alert('Attention : la sauvegarde a échoué. Vos données pourraient ne pas être enregistrées.')
  }
}

const nextStep = async () => {
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
          message += `  - ${p.phase?.libelle || p.nomPhase || p.nom || 'Phase sans nom'}\n`
        })
        message += '\nPour chaque phase, vous devez :\n'
        message += '• Soit la démarrer puis la terminer\n'
        message += '• Soit la marquer comme "Non réalisée" avec un motif'

        stepValidationError.value = message
        alert(message)
        console.warn('[CRVDepart] Blocage étape 4 - Phases non traitées:', phasesNonTraitees.value)
        return
      }
    }

    // Sauvegarder les données de l'étape courante
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

const handleChargeAdded = (chargeData) => {
  console.log('[CRVDepart] handleChargeAdded:', chargeData)
}

const handleEvenementAdded = (evenementData) => {
  console.log('[CRVDepart] handleEvenementAdded:', evenementData)
}

const handleValidation = async (validationData) => {
  if (isLoading.value) return // Guard re-entry — empêche les double-clics

  try {
    isLoading.value = true

    const statut = crvStore.crvStatus
    const completude = crvStore.completude
    const crvId = crvStore.currentCRV?.id || crvStore.currentCRV?._id

    console.log('[CRVDepart] handleValidation - État actuel:', { completude, statut })

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
        alert(`Complétude insuffisante pour terminer : ${completude}% (minimum ${SEUILS_COMPLETUDE.TERMINER}% requis)`)
        return
      }

      console.log('[CRVDepart] Terminaison du CRV...')
      try {
        await crvStore.terminerCRV()
        console.log('[CRVDepart] CRV terminé')
      } catch (e) {
        console.error('[CRVDepart] Erreur terminaison:', e)
        if (crvStore.anomalies.length > 0) {
          alert(`Impossible de terminer :\n${crvStore.anomalies.join('\n')}`)
        } else {
          alert(e.message || 'Erreur lors de la terminaison')
        }
        return
      }
    }

    // Recharger pour avoir le nouveau statut et la complétude à jour
    await crvStore.loadCRV(crvId)

    // Étape 2 : Si TERMINÉ, valider (seuil 80%)
    if (crvStore.crvStatus === 'TERMINE') {
      const newCompletude = crvStore.completude

      if (newCompletude < SEUILS_COMPLETUDE.VALIDER) {
        alert(`Complétude insuffisante pour valider : ${newCompletude}% (minimum ${SEUILS_COMPLETUDE.VALIDER}% requis)`)
        return
      }

      console.log('[CRVDepart] Validation du CRV...')
      try {
        await crvStore.validateCRV(validationData?.commentaires)
        console.log('[CRVDepart] CRV validé')
        isValidated.value = true
      } catch (e) {
        console.error('[CRVDepart] Erreur validation:', e)
        if (crvStore.anomalies.length > 0) {
          alert(`Impossible de valider :\n${crvStore.anomalies.join('\n')}`)
        } else {
          alert(e.message || 'Erreur lors de la validation')
        }
        return
      }
    }

    // Succès
    console.log('[CRVDepart] Validation complète, statut final:', crvStore.crvStatus)

  } catch (error) {
    console.error('[CRVDepart] Erreur validation:', error)
    alert(error.message || 'Erreur lors de la validation du CRV')
  } finally {
    isLoading.value = false
  }
}

// Bug #7 Mission 027 — Verrouillage CRV depuis le detail (SUPERVISEUR/MANAGER)
const handleVerrouiller = async () => {
  const crvId = crvStore.currentCRV?.id || crvStore.currentCRV?._id
  if (!crvId) return

  if (!confirm('Le CRV sera définitif. Aucune modification possible après. Continuer ?')) {
    return
  }

  lockingCRV.value = true
  try {
    await validationAPI.verrouiller(crvId)
    console.log('[CRVDepart] CRV verrouillé avec succès')
    await crvStore.loadCRV(crvId)
    alert('CRV verrouillé définitivement.')
  } catch (error) {
    console.error('[CRVDepart] Erreur verrouillage:', error)
    alert(error.response?.data?.message || 'Erreur lors du verrouillage')
  } finally {
    lockingCRV.value = false
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

/* Bug #7 Mission 027 — Section verrouillage CRV */
.verrouiller-section {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border: 2px solid #6366f1;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.verrouiller-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.verrouiller-icon {
  font-size: 28px;
}

.verrouiller-desc {
  font-size: 13px;
  color: #4338ca;
  margin: 4px 0 0;
}

.btn-lock {
  background: #6366f1;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-lock:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-lock:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Horaires prévus */
.horaires-prevus {
  background: #f0f4ff;
  border: 1px solid #3b82f6;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.horaires-prevus .section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
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
  color: #3b82f6;
}

.horaire-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e40af;
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

/* ============================================ */
/* RESPONSIVE DESIGN                            */
/* ============================================ */

/* Mobile (jusqu'à 640px) */
@media (max-width: 640px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
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
    padding: 16px 12px;
  }

  .crv-progress {
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 8px;
  }

  .progress-steps {
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }

  .progress-steps::before {
    display: none;
  }

  .step {
    flex: 0 0 calc(33.33% - 10px);
    min-width: 70px;
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
    flex-direction: column;
    gap: 10px;
    padding-top: 20px;
    margin-top: 20px;
  }

  .step-actions .btn {
    width: 100%;
    min-width: unset;
    padding: 12px;
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

/* Tablet (641px - 1024px) */
@media (min-width: 641px) and (max-width: 1024px) {
  .header-content {
    padding: 16px 20px;
  }

  .header-left h1 {
    font-size: 20px;
  }

  .crv-main {
    padding: 24px 16px;
  }

  .crv-progress {
    padding: 24px;
  }

  .step-number {
    width: 36px;
    height: 36px;
  }

  .step-label {
    font-size: 11px;
    max-width: 70px;
  }

  .progress-steps::before {
    left: 30px;
    right: 30px;
    top: 18px;
  }

  .step-actions {
    gap: 12px;
  }

  .step-actions .btn {
    min-width: 100px;
  }
}

/* Desktop (1025px+) */
@media (min-width: 1025px) {
  .crv-main {
    padding: 30px 20px;
  }

  .crv-progress {
    padding: 30px;
  }
}
</style>
