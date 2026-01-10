<template>
  <div class="crv-header-component card">
    <div class="section-header">
      <h3 class="section-title">{{ title }}</h3>
      <!-- MVS-5 #1: Badge statut programme -->
      <div class="programme-status" v-if="volInfo">
        <span
          v-if="volInfo.programmeVol"
          class="badge badge-programme"
          :title="'Programme: ' + volInfo.programmeVol.nom"
        >
          PROGRAMME
        </span>
        <span
          v-else-if="volInfo.estHorsProgramme"
          class="badge badge-hors-programme"
          :title="'Type: ' + (volInfo.typeVolHorsProgramme || 'Non spécifié')"
        >
          HORS PROGRAMME
        </span>
        <span v-else class="badge badge-non-affecte">
          NON AFFECTÉ
        </span>
      </div>
    </div>

    <div class="header-form">
      <!-- MVS-5 #5 & #6: Liaison programme -->
      <div v-if="showProgrammeSection && !disabled" class="programme-section">
        <div class="programme-row">
          <div class="form-group programme-select-group">
            <label class="form-label">Programme de vol</label>
            <select
              v-model="selectedProgramme"
              class="form-input"
              :disabled="disabled || loadingProgrammes"
              @change="handleProgrammeChange"
            >
              <option value="">-- Aucun programme --</option>
              <option
                v-for="prog in programmesDisponibles"
                :key="prog.id || prog._id"
                :value="prog.id || prog._id"
              >
                {{ prog.nom }} ({{ prog.saison }} {{ formatDate(prog.dateDebut) }} - {{ formatDate(prog.dateFin) }})
              </option>
            </select>
          </div>
          <button
            type="button"
            class="btn btn-outline btn-hors-programme"
            @click="showHorsProgrammeModal = true"
            :disabled="disabled"
          >
            Marquer hors programme
          </button>
        </div>
      </div>

      <!-- Ligne 1: Vol et Compagnie -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Numéro de vol *</label>
          <input
            v-model="localData.numeroVol"
            type="text"
            class="form-input"
            placeholder="ex: THS001"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Compagnie aérienne *</label>
          <input
            v-model="localData.compagnieAerienne"
            type="text"
            class="form-input"
            placeholder="ex: THS Airways"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Code IATA *</label>
          <input
            v-model="localData.codeIATA"
            type="text"
            class="form-input"
            maxlength="2"
            placeholder="ex: TH"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Date du vol *</label>
          <input
            v-model="localData.dateVol"
            type="date"
            class="form-input"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>
      </div>

      <!-- Ligne 2: Aéroports -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Aéroport origine</label>
          <input
            v-model="localData.aeroportOrigine"
            type="text"
            class="form-input"
            maxlength="3"
            placeholder="ex: CDG"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Aéroport destination</label>
          <input
            v-model="localData.aeroportDestination"
            type="text"
            class="form-input"
            maxlength="3"
            placeholder="ex: NDJ"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Type avion</label>
          <input
            v-model="localData.typeAvion"
            type="text"
            class="form-input"
            placeholder="ex: B737-800"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Immatriculation avion</label>
          <input
            v-model="localData.immatriculation"
            type="text"
            class="form-input"
            placeholder="ex: 5H-THS"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>
      </div>

      <!-- Ligne 3: Poste -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Poste de stationnement</label>
          <input
            v-model="localData.poste"
            type="text"
            class="form-input"
            placeholder="ex: P42"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>
      </div>
    </div>

    <!-- MVS-5 #6: Modal Hors Programme -->
    <div v-if="showHorsProgrammeModal" class="modal-overlay" @click.self="showHorsProgrammeModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Marquer comme vol hors programme</h3>
          <button class="btn-close" @click="showHorsProgrammeModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-description">
            Ce vol sera marqué comme hors programme saisonnier (charter, ferry, médical, etc.)
          </p>
          <div class="form-group">
            <label class="form-label">Type de vol hors programme *</label>
            <select v-model="horsProgrammeData.typeVolHorsProgramme" class="form-input" required>
              <option value="">-- Sélectionner --</option>
              <option value="CHARTER">Charter</option>
              <option value="VOL_FERRY">Vol Ferry</option>
              <option value="MEDICAL">Vol Médical / Évacuation</option>
              <option value="TECHNIQUE">Vol Technique</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Raison / Description</label>
            <textarea
              v-model="horsProgrammeData.raisonHorsProgramme"
              class="form-input"
              rows="3"
              placeholder="Précisez la raison ou le contexte..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showHorsProgrammeModal = false">Annuler</button>
          <button
            class="btn btn-primary"
            @click="marquerHorsProgramme"
            :disabled="!horsProgrammeData.typeVolHorsProgramme"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { volsAPI, programmesVolAPI } from '@/services/api'

const props = defineProps({
  title: {
    type: String,
    default: 'Informations du vol'
  },
  modelValue: {
    type: Object,
    default: () => ({
      numeroVol: '',
      compagnieAerienne: '',
      codeIATA: '',
      aeroportOrigine: '',
      aeroportDestination: '',
      dateVol: new Date().toISOString().split('T')[0],
      immatriculation: '',
      typeAvion: '',
      poste: ''
    })
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // MVS-5: Infos du vol pour afficher le statut programme
  volInfo: {
    type: Object,
    default: null
  },
  // MVS-5: ID du vol pour les opérations de liaison
  volId: {
    type: String,
    default: null
  },
  // MVS-5: Afficher la section programme
  showProgrammeSection: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'programme-changed', 'hors-programme'])

const localData = ref({ ...props.modelValue })

// MVS-5: États pour la gestion des programmes
const programmesDisponibles = ref([])
const selectedProgramme = ref('')
const loadingProgrammes = ref(false)
const showHorsProgrammeModal = ref(false)
const horsProgrammeData = ref({
  typeVolHorsProgramme: '',
  raisonHorsProgramme: ''
})

// Charger les programmes disponibles
onMounted(async () => {
  if (props.showProgrammeSection && !props.disabled) {
    await loadProgrammes()
  }
})

const loadProgrammes = async () => {
  loadingProgrammes.value = true
  try {
    // Charger les programmes applicables à la date du vol
    const date = props.modelValue?.dateVol || new Date().toISOString().split('T')[0]
    const response = await programmesVolAPI.getApplicables(date)
    programmesDisponibles.value = response.data?.programmes || response.data || []

    // Si le vol a déjà un programme, le présélectionner
    if (props.volInfo?.programmeVol) {
      selectedProgramme.value = props.volInfo.programmeVol.id || props.volInfo.programmeVol._id
    }
  } catch (error) {
    console.warn('[CRVHeader] Erreur chargement programmes:', error.message)
    programmesDisponibles.value = []
  } finally {
    loadingProgrammes.value = false
  }
}

// Gérer le changement de programme
const handleProgrammeChange = async () => {
  if (!props.volId) {
    console.warn('[CRVHeader] Pas de volId, émission événement seulement')
    emit('programme-changed', selectedProgramme.value)
    return
  }

  try {
    if (selectedProgramme.value) {
      // Lier au programme
      await volsAPI.lierProgramme(props.volId, selectedProgramme.value)
      console.log('[CRVHeader] Vol lié au programme:', selectedProgramme.value)
    } else {
      // Détacher du programme
      await volsAPI.detacherProgramme(props.volId)
      console.log('[CRVHeader] Vol détaché du programme')
    }
    emit('programme-changed', selectedProgramme.value)
  } catch (error) {
    console.error('[CRVHeader] Erreur liaison programme:', error)
    alert('Erreur lors de la liaison au programme: ' + (error.response?.data?.message || error.message))
  }
}

// Marquer comme hors programme
const marquerHorsProgramme = async () => {
  if (!horsProgrammeData.value.typeVolHorsProgramme) {
    alert('Veuillez sélectionner un type de vol hors programme')
    return
  }

  if (!props.volId) {
    console.warn('[CRVHeader] Pas de volId, émission événement seulement')
    emit('hors-programme', horsProgrammeData.value)
    showHorsProgrammeModal.value = false
    return
  }

  try {
    await volsAPI.marquerHorsProgramme(props.volId, horsProgrammeData.value)
    console.log('[CRVHeader] Vol marqué hors programme:', horsProgrammeData.value)
    emit('hors-programme', horsProgrammeData.value)
    showHorsProgrammeModal.value = false
    selectedProgramme.value = ''
    // Reset le formulaire
    horsProgrammeData.value = { typeVolHorsProgramme: '', raisonHorsProgramme: '' }
  } catch (error) {
    console.error('[CRVHeader] Erreur marquage hors programme:', error)
    alert('Erreur: ' + (error.response?.data?.message || error.message))
  }
}

// Formater une date
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Mettre à jour chaque propriété pour que Vue détecte les changements
    Object.keys(newValue).forEach(key => {
      localData.value[key] = newValue[key]
    })
  }
}, { deep: true, immediate: true })

// Recharger les programmes si la date change
watch(() => props.modelValue?.dateVol, async (newDate) => {
  if (newDate && props.showProgrammeSection && !props.disabled) {
    await loadProgrammes()
  }
})

const emitUpdate = () => {
  emit('update:modelValue', localData.value)
}
</script>

<style scoped>
.crv-header-component {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  margin: 0;
}

/* MVS-5: Badges programme */
.programme-status {
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-programme {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #3b82f6;
}

.badge-hors-programme {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
}

.badge-non-affecte {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

/* MVS-5: Section programme */
.programme-section {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 15px;
}

.programme-row {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.programme-select-group {
  flex: 1;
}

.btn-hors-programme {
  white-space: nowrap;
  height: 42px;
}

.header-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.btn-close:hover {
  color: #1f2937;
}

.modal-body {
  padding: 20px;
}

.modal-description {
  margin: 0 0 15px 0;
  color: #6b7280;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}
</style>
