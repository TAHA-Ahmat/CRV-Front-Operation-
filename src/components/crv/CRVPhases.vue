<template>
  <div class="crv-phases-component card">
    <div class="section-header">
      <h3 class="section-title">Phases opérationnelles</h3>
      <!-- MVS-3 #3: Compteur progression phases -->
      <div class="phases-progress">
        <span class="progress-count">{{ phasesCompletes }}/{{ phases.length }} terminées</span>
        <span class="progress-impact">= {{ phasesCompletude }}% complétude phases</span>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Chargement des phases...</p>
    </div>

    <div v-else-if="phases.length === 0" class="empty-state">
      <p>Aucune phase disponible pour ce CRV</p>
    </div>

    <div v-else class="phases-list">
      <div
        v-for="phase in phases"
        :key="phase.id || phase._id"
        class="phase-item"
        :class="{ 'phase-termine': phase.statut === 'TERMINE', 'phase-non-realise': phase.statut === 'NON_REALISE' }"
      >
        <div class="phase-header">
          <div class="phase-title-row">
            <h4>{{ getPhaseNom(phase) }}</h4>
            <!-- MVS-3 #2: Tag type opération -->
            <span
              v-if="getPhaseTypeOperation(phase)"
              class="type-operation-tag"
              :class="'type-' + getPhaseTypeOperation(phase).toLowerCase()"
            >
              {{ getPhaseTypeOperation(phase) }}
            </span>
          </div>
          <span class="phase-status" :class="getStatusClass(phase.statut)">
            {{ getStatusLabel(phase.statut) }}
          </span>
        </div>

        <!-- MVS-3 #1: Affichage des prérequis -->
        <div v-if="phase.phase?.prerequis?.length > 0" class="phase-prerequis">
          <span class="prerequis-label">Prérequis :</span>
          <template v-if="canStartPhase(phase).canStart">
            <span class="prerequis-ok">Tous satisfaits</span>
          </template>
          <template v-else>
            <span class="prerequis-manquants">
              Terminez d'abord : {{ canStartPhase(phase).prerequisManquants.join(', ') }}
            </span>
          </template>
        </div>

        <!-- Phase NON_COMMENCE: permettre de démarrer avec saisie manuelle des heures -->
        <div v-if="phase.statut === 'NON_COMMENCE'" class="phase-actions-block">
          <!-- Mode édition : saisie manuelle des heures -->
          <div v-if="phaseEditId === (phase.id || phase._id)" class="manual-hours-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Heure de début <span class="required">*</span></label>
                <input
                  v-model="editHeureDebut"
                  type="time"
                  class="form-input"
                  :disabled="saving"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Heure de fin (optionnel)</label>
                <input
                  v-model="editHeureFin"
                  type="time"
                  class="form-input"
                  :disabled="saving"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Remarques (optionnel)</label>
              <textarea
                v-model="editRemarques"
                class="form-input"
                rows="2"
                placeholder="Observations sur cette phase..."
                :disabled="saving"
              ></textarea>
            </div>
            <div class="form-actions">
              <button
                @click="handleSavePhaseManuel(phase)"
                class="btn btn-success btn-sm"
                :disabled="!editHeureDebut || saving"
                type="button"
              >
                {{ editHeureFin ? 'Enregistrer (Terminée)' : 'Enregistrer (En cours)' }}
              </button>
              <button
                @click="cancelEdit"
                class="btn btn-secondary btn-sm"
                :disabled="saving"
                type="button"
              >
                Annuler
              </button>
            </div>
          </div>

          <!-- Actions par défaut -->
          <div v-else class="form-row">
            <div class="form-group">
              <label class="form-label">Action</label>
              <div class="action-buttons">
                <!-- MVS-3 #1: Bouton bloqué si prérequis manquants -->
                <button
                  @click="showEditForm(phase)"
                  class="btn btn-primary btn-sm"
                  :disabled="disabled || saving || !canStartPhase(phase).canStart"
                  :title="!canStartPhase(phase).canStart ? 'Terminez d\'abord les phases prérequises' : ''"
                  type="button"
                >
                  Saisir les heures
                </button>
                <button
                  @click="showNonRealiseForm(phase)"
                  class="btn btn-secondary btn-sm"
                  :disabled="disabled || saving"
                  type="button"
                >
                  Non réalisée
                </button>
              </div>
            </div>
          </div>

          <!-- Formulaire pour phase non réalisée - CORRECTION AUDIT: detailMotif OBLIGATOIRE si AUTRE -->
          <div v-if="phaseNonRealiseId === (phase.id || phase._id)" class="non-realise-form">
            <!-- MVS-3 #4 & #5: Notes informationnelles -->
            <div class="non-realise-info-banner">
              <p><strong>Note :</strong> Les heures saisies seront effacées.</p>
              <p>Une phase non réalisée compte comme terminée pour la progression.</p>
            </div>

            <div class="form-group">
              <label class="form-label">
                Motif de non-réalisation <span class="required">*</span>
              </label>
              <select v-model="motifNonRealisation" class="form-input" required>
                <option value="">Sélectionner un motif</option>
                <option v-for="motif in motifsNonRealisation" :key="motif.value" :value="motif.value">
                  {{ motif.label }}
                </option>
              </select>
            </div>
            <!-- CORRECTION AUDIT: detailMotif OBLIGATOIRE si motif = AUTRE -->
            <div class="form-group">
              <label class="form-label">
                Détail du motif
                <span v-if="motifNonRealisation === 'AUTRE'" class="required">*</span>
                <span v-else>(optionnel)</span>
              </label>
              <textarea
                v-model="detailMotif"
                class="form-input"
                rows="2"
                :placeholder="motifNonRealisation === 'AUTRE' ? 'Précisions OBLIGATOIRES sur le motif...' : 'Précisions sur le motif...'"
                :class="{ 'required-field': motifNonRealisation === 'AUTRE' && !detailMotif?.trim() }"
              ></textarea>
              <p v-if="motifNonRealisation === 'AUTRE' && !detailMotif?.trim()" class="field-hint error">
                Le détail est obligatoire pour le motif "Autre"
              </p>
            </div>
            <div class="form-actions">
              <button
                @click="handleMarquerNonRealisee(phase)"
                class="btn btn-warning btn-sm"
                :disabled="!canSubmitNonRealise || saving"
                type="button"
              >
                Confirmer non réalisée
              </button>
              <button
                @click="cancelNonRealise"
                class="btn btn-secondary btn-sm"
                type="button"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>

        <!-- Phase EN_COURS: permettre de terminer avec saisie manuelle -->
        <div v-if="phase.statut === 'EN_COURS'" class="phase-actions-block">
          <!-- Mode édition -->
          <div v-if="phaseEditId === (phase.id || phase._id)" class="manual-hours-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Heure de début</label>
                <input
                  v-model="editHeureDebut"
                  type="time"
                  class="form-input"
                  :disabled="saving"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Heure de fin <span class="required">*</span></label>
                <input
                  v-model="editHeureFin"
                  type="time"
                  class="form-input"
                  :disabled="saving"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Remarques (optionnel)</label>
              <textarea
                v-model="editRemarques"
                class="form-input"
                rows="2"
                placeholder="Observations sur cette phase..."
                :disabled="saving"
              ></textarea>
            </div>
            <div class="form-actions">
              <button
                @click="handleSavePhaseManuel(phase)"
                class="btn btn-success btn-sm"
                :disabled="!editHeureFin || saving"
                type="button"
              >
                Terminer la phase
              </button>
              <button
                @click="cancelEdit"
                class="btn btn-secondary btn-sm"
                :disabled="saving"
                type="button"
              >
                Annuler
              </button>
            </div>
          </div>

          <!-- Vue par défaut -->
          <div v-else class="form-row">
            <div class="form-group">
              <label class="form-label">Heure de début</label>
              <input
                :value="formatTime(phase.heureDebutReelle)"
                type="time"
                class="form-input"
                disabled
              />
            </div>
            <div class="form-group">
              <label class="form-label">Action</label>
              <button
                @click="showEditForm(phase, true)"
                class="btn btn-success btn-sm"
                :disabled="disabled || saving"
                type="button"
              >
                Saisir l'heure de fin
              </button>
            </div>
          </div>
        </div>

        <!-- Phase TERMINE: afficher les infos avec possibilité d'édition -->
        <div v-if="phase.statut === 'TERMINE'" class="phase-info-block">
          <!-- Mode édition -->
          <div v-if="phaseEditId === (phase.id || phase._id)" class="manual-hours-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Heure de début</label>
                <input
                  v-model="editHeureDebut"
                  type="time"
                  class="form-input"
                  :disabled="saving"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Heure de fin</label>
                <input
                  v-model="editHeureFin"
                  type="time"
                  class="form-input"
                  :disabled="saving"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Remarques</label>
              <textarea
                v-model="editRemarques"
                class="form-input"
                rows="2"
                :disabled="saving"
              ></textarea>
            </div>
            <div class="form-actions">
              <button
                @click="handleSavePhaseManuel(phase)"
                class="btn btn-primary btn-sm"
                :disabled="saving"
                type="button"
              >
                Mettre à jour
              </button>
              <button
                @click="cancelEdit"
                class="btn btn-secondary btn-sm"
                :disabled="saving"
                type="button"
              >
                Annuler
              </button>
            </div>
          </div>

          <!-- Vue par défaut -->
          <div v-else>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Heure de début</label>
                <input
                  :value="formatTime(phase.heureDebutReelle)"
                  type="time"
                  class="form-input"
                  disabled
                />
              </div>
              <div class="form-group">
                <label class="form-label">Heure de fin</label>
                <input
                  :value="formatTime(phase.heureFinReelle)"
                  type="time"
                  class="form-input"
                  disabled
                />
              </div>
              <div class="form-group">
                <label class="form-label">Durée</label>
                <input
                  :value="formatDuree(phase.dureeReelleMinutes)"
                  type="text"
                  class="form-input"
                  disabled
                />
              </div>
              <!-- MVS-3 #6: Affichage écart SLA -->
              <div v-if="phase.dureeReelleMinutes && phase.phase?.dureePrevue" class="form-group">
                <label class="form-label">Écart</label>
                <div
                  class="ecart-sla"
                  :class="{
                    'ecart-ok': (phase.dureeReelleMinutes - phase.phase.dureePrevue) <= getPhaseSeuil(phase),
                    'ecart-depassement': (phase.dureeReelleMinutes - phase.phase.dureePrevue) > getPhaseSeuil(phase)
                  }"
                >
                  <span class="ecart-valeur">
                    {{ phase.dureeReelleMinutes - phase.phase.dureePrevue > 0 ? '+' : '' }}{{ phase.dureeReelleMinutes - phase.phase.dureePrevue }} min
                  </span>
                  <span class="ecart-seuil">(tolérance: {{ getPhaseSeuil(phase) }} min)</span>
                </div>
              </div>
              <div v-if="!disabled" class="form-group">
                <label class="form-label">Action</label>
                <button
                  @click="showEditForm(phase, false, true)"
                  class="btn btn-secondary btn-sm"
                  :disabled="saving"
                  type="button"
                >
                  Modifier
                </button>
              </div>
            </div>
            <div v-if="phase.remarques" class="form-group">
              <label class="form-label">Remarques</label>
              <p class="observation-text">{{ phase.remarques }}</p>
            </div>
          </div>
        </div>

        <!-- Phase NON_REALISE: afficher le motif -->
        <div v-if="phase.statut === 'NON_REALISE'" class="phase-info-block non-realise-info">
          <div class="form-group">
            <label class="form-label">Motif de non-réalisation</label>
            <p class="motif-text">{{ formatMotif(phase.motifNonRealisation) }}</p>
          </div>
          <div v-if="phase.detailMotif" class="form-group">
            <label class="form-label">Détail</label>
            <p class="observation-text">{{ phase.detailMotif }}</p>
          </div>
        </div>

        <!-- Message d'erreur -->
        <div v-if="phaseError === (phase.id || phase._id)" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>

    <!-- Message d'erreur global -->
    <div v-if="globalError" class="error-banner">
      {{ globalError }}
    </div>
  </div>
</template>

<script setup>
/**
 * CRVPhases.vue - CORRIGÉ AUDIT 2025-01
 *
 * CORRECTIONS APPLIQUÉES:
 * - CORRIGÉ: detailMotif OBLIGATOIRE quand motifNonRealisation = AUTRE
 * - AJOUTÉ: Computed canSubmitNonRealise avec validation
 * - AJOUTÉ: Import des enums centralisés (MOTIF_NON_REALISATION)
 * - AJOUTÉ: Console.log format [CRV][PHASE_*]
 * - AJOUTÉ: Indicateur visuel pour champ obligatoire
 */
import { ref, computed } from 'vue'
import { useCRVStore } from '@/stores/crvStore'
import { MOTIF_NON_REALISATION, getEnumOptions } from '@/config/crvEnums'

const props = defineProps({
  phases: {
    type: Array,
    default: () => []
  },
  crvType: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['phase-update'])

const crvStore = useCRVStore()

// États locaux
const loading = ref(false)
const saving = ref(false)
const phaseNonRealiseId = ref(null)
const motifNonRealisation = ref('')
const detailMotif = ref('')
const phaseError = ref(null)
const errorMessage = ref('')
const globalError = ref('')

// États pour l'édition manuelle des heures
const phaseEditId = ref(null)
const editHeureDebut = ref('')
const editHeureFin = ref('')
const editRemarques = ref('')
const editStatutOriginal = ref('')

// CORRECTION AUDIT: Utilisation des enums centralisés
const motifsNonRealisation = getEnumOptions(MOTIF_NON_REALISATION)

console.log('[CRV][PHASE_INIT] Enums motifs chargés:', motifsNonRealisation.length)

// CORRECTION AUDIT: Computed pour validation detailMotif OBLIGATOIRE si AUTRE
const canSubmitNonRealise = computed(() => {
  if (!motifNonRealisation.value) {
    console.log('[CRV][PHASE_VALIDATION] canSubmitNonRealise: false (motif manquant)')
    return false
  }

  // Si motif = AUTRE, detailMotif est OBLIGATOIRE
  if (motifNonRealisation.value === MOTIF_NON_REALISATION.AUTRE) {
    const hasDetail = detailMotif.value?.trim()?.length > 0
    console.log('[CRV][PHASE_VALIDATION] canSubmitNonRealise: motif=AUTRE, detailMotif requis:', hasDetail)
    return hasDetail
  }

  console.log('[CRV][PHASE_VALIDATION] canSubmitNonRealise: true')
  return true
})

// MVS-3 #3: Computed pour compteur phases terminées
const phasesCompletes = computed(() => {
  return props.phases.filter(p => p.statut === 'TERMINE' || p.statut === 'NON_REALISE').length
})

// MVS-3 #3: Computed pour % complétude phases (phases = 40% du total)
const phasesCompletude = computed(() => {
  if (props.phases.length === 0) return 0
  const ratio = phasesCompletes.value / props.phases.length
  return Math.round(ratio * 40) // phases = 40% de la complétude totale
})

// MVS-3 #1: Vérifier si une phase peut être démarrée (prérequis satisfaits)
const canStartPhase = (phase) => {
  if (!phase.phase?.prerequis || phase.phase.prerequis.length === 0) {
    return { canStart: true, prerequisManquants: [] }
  }

  const prerequisManquants = []
  for (const prereqId of phase.phase.prerequis) {
    const prereqPhase = props.phases.find(p =>
      (p.phase?.id || p.phase?._id) === prereqId ||
      (p.phaseId) === prereqId
    )
    if (prereqPhase && prereqPhase.statut !== 'TERMINE' && prereqPhase.statut !== 'NON_REALISE') {
      prerequisManquants.push(getPhaseNom(prereqPhase))
    }
  }

  return {
    canStart: prerequisManquants.length === 0,
    prerequisManquants
  }
}

// MVS-3 #2: Obtenir le type d'opération de la phase
const getPhaseTypeOperation = (phase) => {
  return phase.phase?.typeOperation || phase.typeOperation || null
}

// MVS-3 #6: Obtenir le seuil SLA de la phase (en minutes)
const getPhaseSeuil = (phase) => {
  return phase.phase?.seuilSLA || phase.seuilSLA || 15 // 15 min par défaut
}

// Formatters
const formatTime = (datetime) => {
  if (!datetime) return ''
  if (datetime.includes('T')) {
    return datetime.split('T')[1]?.substring(0, 5) || ''
  }
  return datetime.substring(0, 5)
}

const formatDuree = (minutes) => {
  if (!minutes) return '-'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) {
    return `${h}h ${m}min`
  }
  return `${m} min`
}

// CORRECTION AUDIT: Labels motifs conformes
const formatMotif = (motif) => {
  const motifs = {
    [MOTIF_NON_REALISATION.NON_NECESSAIRE]: 'Non nécessaire',
    [MOTIF_NON_REALISATION.EQUIPEMENT_INDISPONIBLE]: 'Équipement indisponible',
    [MOTIF_NON_REALISATION.PERSONNEL_ABSENT]: 'Personnel absent',
    [MOTIF_NON_REALISATION.CONDITIONS_METEO]: 'Conditions météo',
    [MOTIF_NON_REALISATION.AUTRE]: 'Autre'
  }
  return motifs[motif] || motif || 'Non spécifié'
}

// Obtenir le nom de la phase (structure imbriquée du backend)
const getPhaseNom = (phase) => {
  return phase.phase?.libelle || phase.nomPhase || phase.nom || 'Phase sans nom'
}

const getStatusClass = (statut) => {
  return {
    'status-non-commence': statut === 'NON_COMMENCE',
    'status-en-cours': statut === 'EN_COURS',
    'status-termine': statut === 'TERMINE',
    'status-non-realise': statut === 'NON_REALISE',
    'status-annule': statut === 'ANNULE'
  }
}

const getStatusLabel = (statut) => {
  const labels = {
    'NON_COMMENCE': 'Non démarrée',
    'EN_COURS': 'En cours',
    'TERMINE': 'Terminée',
    'NON_REALISE': 'Non réalisée',
    'ANNULE': 'Annulée'
  }
  return labels[statut] || statut
}

// Ouvrir le formulaire d'édition manuelle
const showEditForm = (phase, prefillFromPhase = false, isTerminee = false) => {
  const phaseId = phase.id || phase._id
  console.log('[CRV][PHASE_EDIT] showEditForm:', phaseId, { prefillFromPhase, isTerminee })

  phaseEditId.value = phaseId
  editStatutOriginal.value = phase.statut

  if (prefillFromPhase || isTerminee) {
    editHeureDebut.value = formatTime(phase.heureDebutReelle)
    editHeureFin.value = formatTime(phase.heureFinReelle) || ''
    editRemarques.value = phase.remarques || ''
  } else {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    editHeureDebut.value = currentTime
    editHeureFin.value = ''
    editRemarques.value = ''
  }

  phaseNonRealiseId.value = null
  phaseError.value = null
}

const cancelEdit = () => {
  console.log('[CRV][PHASE_EDIT] cancelEdit')
  phaseEditId.value = null
  editHeureDebut.value = ''
  editHeureFin.value = ''
  editRemarques.value = ''
  editStatutOriginal.value = ''
}

const handleSavePhaseManuel = async (phase) => {
  const phaseId = phase.id || phase._id
  console.log('[CRV][PHASE_SAVE] handleSavePhaseManuel:', phaseId, {
    heureDebut: editHeureDebut.value,
    heureFin: editHeureFin.value,
    remarques: editRemarques.value,
    statutOriginal: editStatutOriginal.value
  })

  saving.value = true
  phaseError.value = null
  globalError.value = ''

  try {
    const data = {}

    if (editHeureFin.value) {
      data.statut = 'TERMINE'
    } else if (editStatutOriginal.value === 'NON_COMMENCE') {
      data.statut = 'EN_COURS'
    }

    if (editHeureDebut.value) {
      data.heureDebutReelle = editHeureDebut.value
    }
    if (editHeureFin.value) {
      data.heureFinReelle = editHeureFin.value
    }

    if (editRemarques.value) {
      data.remarques = editRemarques.value
    }

    console.log('[CRV][PHASE_API] Envoi données:', data)

    await crvStore.updatePhaseManuel(phaseId, data)
    console.log('[CRV][PHASE_SUCCESS] Phase mise à jour avec succès')

    cancelEdit()
    emit('phase-update', { action: 'update-manuel', phaseId, data })
  } catch (error) {
    console.error('[CRV][PHASE_ERROR] Erreur mise à jour phase:', error)
    phaseError.value = phaseId
    errorMessage.value = error.message || 'Erreur lors de la mise à jour'
  } finally {
    saving.value = false
  }
}

const showNonRealiseForm = (phase) => {
  const phaseId = phase.id || phase._id
  console.log('[CRV][PHASE_NON_REALISE] showNonRealiseForm:', phaseId)
  phaseNonRealiseId.value = phaseId
  motifNonRealisation.value = ''
  detailMotif.value = ''
  phaseError.value = null
  phaseEditId.value = null
}

const cancelNonRealise = () => {
  console.log('[CRV][PHASE_NON_REALISE] cancelNonRealise')
  phaseNonRealiseId.value = null
  motifNonRealisation.value = ''
  detailMotif.value = ''
}

const handleMarquerNonRealisee = async (phase) => {
  const phaseId = phase.id || phase._id
  console.log('[CRV][PHASE_NON_REALISE] handleMarquerNonRealisee:', phaseId, {
    motif: motifNonRealisation.value,
    detail: detailMotif.value
  })

  // CORRECTION AUDIT: Validation detailMotif OBLIGATOIRE si AUTRE
  if (!canSubmitNonRealise.value) {
    phaseError.value = phaseId
    if (motifNonRealisation.value === MOTIF_NON_REALISATION.AUTRE) {
      errorMessage.value = 'Le détail du motif est obligatoire pour "Autre"'
      console.warn('[CRV][PHASE_VALIDATE] Rejet: detailMotif obligatoire pour AUTRE')
    } else {
      errorMessage.value = 'Le motif de non-réalisation est obligatoire'
    }
    return
  }

  saving.value = true
  phaseError.value = null
  globalError.value = ''

  try {
    const data = {
      motifNonRealisation: motifNonRealisation.value
    }

    // Inclure detailMotif si présent
    if (detailMotif.value?.trim()) {
      data.detailMotif = detailMotif.value.trim()
    }

    console.log('[CRV][PHASE_API] Envoi non réalisée:', data)

    await crvStore.marquerPhaseNonRealisee(phaseId, data)
    console.log('[CRV][PHASE_SUCCESS] Phase marquée non réalisée avec succès')
    cancelNonRealise()
    emit('phase-update', { action: 'non-realise', phaseId })
  } catch (error) {
    console.error('[CRV][PHASE_ERROR] Erreur marquage non réalisée:', error)
    phaseError.value = phaseId
    errorMessage.value = error.message || 'Erreur lors du marquage'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.crv-phases-component {
  margin-bottom: 20px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}

.phases-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.phase-item {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.phase-item.phase-termine {
  background: #ecfdf5;
  border-color: #10b981;
}

.phase-item.phase-non-realise {
  background: #fef3c7;
  border-color: #f59e0b;
}

.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e7eb;
}

.phase-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.phase-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.status-non-commence {
  background: #e5e7eb;
  color: #4b5563;
}

.status-en-cours {
  background: #dbeafe;
  color: #1e40af;
}

.status-termine {
  background: #dcfce7;
  color: #166534;
}

.status-non-realise {
  background: #fef3c7;
  color: #92400e;
}

.phase-actions-block,
.phase-info-block {
  margin-top: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input:disabled {
  background: #f3f4f6;
  color: #6b7280;
}

/* CORRECTION AUDIT: Style pour champ obligatoire non rempli */
.form-input.required-field {
  border-color: #dc2626;
  background: #fef2f2;
}

.field-hint {
  font-size: 12px;
  margin-top: 4px;
}

.field-hint.error {
  color: #dc2626;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-sm {
  padding: 8px 12px;
  font-size: 13px;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.non-realise-form {
  margin-top: 15px;
  padding: 15px;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
}

.non-realise-form .form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.non-realise-info {
  background: #fffbeb;
  padding: 15px;
  border-radius: 8px;
}

.observation-text,
.motif-text {
  padding: 10px;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
}

.required {
  color: #dc2626;
  font-weight: 700;
}

.error-message {
  margin-top: 10px;
  padding: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 13px;
}

.error-banner {
  margin-top: 15px;
  padding: 15px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-weight: 500;
}

textarea.form-input {
  resize: vertical;
  min-height: 60px;
}

.manual-hours-form {
  margin-top: 15px;
  padding: 15px;
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 8px;
}

.manual-hours-form .form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

/* MVS-3: Styles section-header avec progression */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.phases-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-count {
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  padding: 4px 10px;
  border-radius: 6px;
}

.progress-impact {
  font-size: 13px;
  color: #6b7280;
}

/* MVS-3 #1: Styles prérequis */
.phase-prerequis {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 13px;
}

.prerequis-label {
  font-weight: 500;
  color: #4b5563;
}

.prerequis-ok {
  color: #059669;
  font-weight: 500;
}

.prerequis-manquants {
  color: #dc2626;
  font-weight: 500;
}

/* MVS-3 #2: Styles tags type opération */
.phase-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-operation-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.type-arrivee {
  background: #dbeafe;
  color: #1e40af;
}

.type-depart {
  background: #fef3c7;
  color: #92400e;
}

.type-turn_around {
  background: #e0e7ff;
  color: #4338ca;
}

/* MVS-3 #4 & #5: Banner info non réalisé */
.non-realise-info-banner {
  margin-bottom: 15px;
  padding: 10px 12px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
}

.non-realise-info-banner p {
  margin: 0;
  font-size: 13px;
  color: #92400e;
  line-height: 1.5;
}

.non-realise-info-banner p:first-child {
  margin-bottom: 4px;
}

/* MVS-3 #6: Styles écart SLA */
.ecart-sla {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 6px;
}

.ecart-ok {
  background: #dcfce7;
}

.ecart-ok .ecart-valeur {
  color: #166534;
  font-weight: 600;
}

.ecart-depassement {
  background: #fee2e2;
}

.ecart-depassement .ecart-valeur {
  color: #dc2626;
  font-weight: 600;
}

.ecart-seuil {
  font-size: 11px;
  color: #6b7280;
}
</style>
