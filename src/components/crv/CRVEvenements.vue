<template>
  <div class="crv-evenements-component card">
    <h3 class="section-title">Événements et Incidents</h3>

    <!-- Événements existants -->
    <div v-if="evenements.length > 0" class="existing-evenements">
      <h4 class="subsection-title">Événements enregistrés ({{ evenements.length }})</h4>
      <div class="evenements-list">
        <div
          v-for="evenement in evenements"
          :key="evenement.id || evenement._id"
          class="evenement-card"
          :class="`gravite-${evenement.gravite?.toLowerCase()}`"
        >
          <div class="evenement-header">
            <span class="evenement-type">{{ getTypeLabel(evenement.typeEvenement) }}</span>
            <span class="evenement-gravite" :class="`badge-${evenement.gravite?.toLowerCase()}`">
              {{ getGraviteLabel(evenement.gravite) }}
            </span>
          </div>
          <div class="evenement-details">
            <div v-if="evenement.heureEvenement" class="detail-row">
              <span>Heure:</span>
              <strong>{{ formatTime(evenement.heureEvenement) }}</strong>
            </div>
            <div v-if="evenement.statut" class="detail-row">
              <span>Statut:</span>
              <strong :class="`status-${evenement.statut?.toLowerCase()}`">
                {{ getStatutLabel(evenement.statut) }}
              </strong>
            </div>
            <div class="detail-row description">
              <p>{{ evenement.description || 'Pas de description' }}</p>
            </div>
            <div v-if="evenement.actionsEntreprises" class="detail-row actions">
              <span>Actions:</span>
              <p>{{ evenement.actionsEntreprises }}</p>
            </div>
            <div v-if="evenement.responsableSuivi" class="detail-row">
              <span>Responsable:</span>
              <strong>{{ evenement.responsableSuivi }}</strong>
            </div>
            <div v-if="evenement.dateResolution" class="detail-row">
              <span>Résolu le:</span>
              <strong>{{ formatDate(evenement.dateResolution) }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Aucun événement - DOCTRINE: pas de confirmation, juste informatif -->
    <div v-else class="empty-state">
      <p>Aucun événement signalé pour ce vol</p>
    </div>

    <!-- Formulaire d'ajout -->
    <div v-if="!disabled" class="add-evenement-section">
      <h4 class="subsection-title">Signaler un événement</h4>

      <div class="form-row">
        <!-- CORRECTION AUDIT: Types d'événement conformes à la doctrine -->
        <div class="form-group">
          <label class="form-label">Type d'événement <span class="required">*</span></label>
          <select v-model="newEvenement.typeEvenement" class="form-input">
            <option value="">Sélectionner</option>
            <option v-for="type in typesEvenement" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Heure</label>
          <input
            v-model="newEvenement.heureEvenement"
            type="time"
            class="form-input"
          />
        </div>

        <!-- CORRECTION AUDIT: Gravités conformes à la doctrine -->
        <div class="form-group">
          <label class="form-label">Gravité <span class="required">*</span></label>
          <select v-model="newEvenement.gravite" class="form-input">
            <option v-for="gravite in gravites" :key="gravite.value" :value="gravite.value">
              {{ gravite.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <!-- CORRECTION AUDIT: Statut événement -->
        <div class="form-group">
          <label class="form-label">Statut</label>
          <select v-model="newEvenement.statut" class="form-input">
            <option v-for="statut in statutsEvenement" :key="statut.value" :value="statut.value">
              {{ statut.label }}
            </option>
          </select>
        </div>

        <!-- CORRECTION AUDIT: Responsable suivi -->
        <div class="form-group">
          <label class="form-label">Responsable suivi</label>
          <input
            v-model="newEvenement.responsableSuivi"
            type="text"
            class="form-input"
            placeholder="Nom du responsable"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Description <span class="required">*</span></label>
        <textarea
          v-model="newEvenement.description"
          class="form-input"
          rows="3"
          placeholder="Décrire l'événement en détail..."
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Actions entreprises</label>
        <textarea
          v-model="newEvenement.actionsEntreprises"
          class="form-input"
          rows="2"
          placeholder="Quelles actions ont été prises suite à cet événement ?"
        ></textarea>
      </div>

      <div class="form-actions">
        <button
          @click="handleAddEvenement"
          class="btn btn-warning"
          :disabled="!canAddEvenement || saving"
          type="button"
        >
          {{ saving ? 'Ajout en cours...' : 'Signaler l\'événement' }}
        </button>
        <button
          @click="resetNewEvenement"
          class="btn btn-secondary"
          :disabled="saving"
          type="button"
        >
          Annuler
        </button>
      </div>

      <!-- Message d'erreur -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>

    <!-- SUPPRIMÉ AUDIT: Pas de checkbox "confirmer aucun événement"
         DOCTRINE: "Absence = Non documenté" - pas de confirmation -->
  </div>
</template>

<script setup>
/**
 * CRVEvenements.vue - CORRIGÉ AUDIT 2025-01
 *
 * CORRECTIONS APPLIQUÉES:
 * - SUPPRIMÉ: Checkbox "confirmer aucun événement" (doctrine: absence = non documenté)
 * - SUPPRIMÉ: confirmNoEvent, handleConfirmNoEvent, watcher hasConfirmationAucunEvenement
 * - CORRIGÉ: Types d'événement selon doctrine (PANNE_EQUIPEMENT, ABSENCE_PERSONNEL, etc.)
 * - CORRIGÉ: Gravités selon doctrine (MINEURE, MODEREE, MAJEURE, CRITIQUE)
 * - AJOUTÉ: Statut événement (OUVERT, EN_COURS, RESOLU, CLOTURE)
 * - AJOUTÉ: Champ responsableSuivi
 * - AJOUTÉ: Console.log format [CRV][EVENEMENT_*]
 */
import { ref, computed } from 'vue'
import { useCRVStore } from '@/stores/crvStore'
import {
  TYPE_EVENEMENT,
  GRAVITE_EVENEMENT,
  STATUT_EVENEMENT,
  getEnumOptions
} from '@/config/crvEnums'

const props = defineProps({
  evenements: {
    type: Array,
    default: () => []
  },
  crvId: {
    type: String,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['evenement-added'])

const crvStore = useCRVStore()

// États locaux
const saving = ref(false)
const errorMessage = ref('')

// CORRECTION AUDIT: Utilisation des enums centralisés
const typesEvenement = getEnumOptions(TYPE_EVENEMENT)
const gravites = getEnumOptions(GRAVITE_EVENEMENT)
const statutsEvenement = getEnumOptions(STATUT_EVENEMENT)

console.log('[CRV][EVENEMENT_INIT] Enums chargés:', {
  typesEvenement: typesEvenement.length,
  gravites: gravites.length,
  statutsEvenement: statutsEvenement.length
})

// Nouveau événement form - CORRECTION: gravité par défaut MINEURE
const newEvenement = ref({
  typeEvenement: '',
  heureEvenement: '',
  gravite: GRAVITE_EVENEMENT.MINEURE,
  statut: STATUT_EVENEMENT.OUVERT,
  description: '',
  actionsEntreprises: '',
  responsableSuivi: ''
})

// Computed
const canAddEvenement = computed(() => {
  const isValid = newEvenement.value.typeEvenement &&
         newEvenement.value.gravite &&
         newEvenement.value.description?.trim()
  console.log('[CRV][EVENEMENT_VALIDATION] canAddEvenement:', isValid)
  return isValid
})

// Formatters
const formatTime = (datetime) => {
  if (!datetime) return ''
  if (datetime.includes('T')) {
    return datetime.split('T')[1]?.substring(0, 5) || ''
  }
  return datetime.substring(0, 5)
}

const formatDate = (date) => {
  if (!date) return ''
  try {
    return new Date(date).toLocaleDateString('fr-FR')
  } catch {
    return date
  }
}

// CORRECTION AUDIT: Labels conformes à la doctrine
const getTypeLabel = (type) => {
  const labels = {
    [TYPE_EVENEMENT.PANNE_EQUIPEMENT]: 'Panne équipement',
    [TYPE_EVENEMENT.ABSENCE_PERSONNEL]: 'Absence personnel',
    [TYPE_EVENEMENT.RETARD]: 'Retard',
    [TYPE_EVENEMENT.INCIDENT_SECURITE]: 'Incident sécurité',
    [TYPE_EVENEMENT.PROBLEME_TECHNIQUE]: 'Problème technique',
    [TYPE_EVENEMENT.METEO]: 'Météo',
    [TYPE_EVENEMENT.AUTRE]: 'Autre'
  }
  return labels[type] || type
}

// CORRECTION AUDIT: Gravités conformes à la doctrine
const getGraviteLabel = (gravite) => {
  const labels = {
    [GRAVITE_EVENEMENT.MINEURE]: 'Mineure',
    [GRAVITE_EVENEMENT.MODEREE]: 'Modérée',
    [GRAVITE_EVENEMENT.MAJEURE]: 'Majeure',
    [GRAVITE_EVENEMENT.CRITIQUE]: 'Critique'
  }
  return labels[gravite] || gravite
}

// CORRECTION AUDIT: Statuts événement
const getStatutLabel = (statut) => {
  const labels = {
    [STATUT_EVENEMENT.OUVERT]: 'Ouvert',
    [STATUT_EVENEMENT.EN_COURS]: 'En cours',
    [STATUT_EVENEMENT.RESOLU]: 'Résolu',
    [STATUT_EVENEMENT.CLOTURE]: 'Clôturé'
  }
  return labels[statut] || statut
}

// Actions
const resetNewEvenement = () => {
  console.log('[CRV][EVENEMENT_RESET] Réinitialisation formulaire')
  newEvenement.value = {
    typeEvenement: '',
    heureEvenement: '',
    gravite: GRAVITE_EVENEMENT.MINEURE,
    statut: STATUT_EVENEMENT.OUVERT,
    description: '',
    actionsEntreprises: '',
    responsableSuivi: ''
  }
  errorMessage.value = ''
}

const handleAddEvenement = async () => {
  console.log('[CRV][EVENEMENT_ADD] Début ajout événement:', newEvenement.value)

  if (!canAddEvenement.value) {
    console.warn('[CRV][EVENEMENT_ADD] Validation échouée - champs obligatoires manquants')
    errorMessage.value = 'Veuillez remplir tous les champs obligatoires (type, gravité, description)'
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    const evenementData = {
      typeEvenement: newEvenement.value.typeEvenement,
      gravite: newEvenement.value.gravite,
      statut: newEvenement.value.statut,
      description: newEvenement.value.description.trim()
    }

    if (newEvenement.value.heureEvenement) {
      evenementData.heureEvenement = newEvenement.value.heureEvenement
    }

    if (newEvenement.value.actionsEntreprises?.trim()) {
      evenementData.actionsEntreprises = newEvenement.value.actionsEntreprises.trim()
    }

    if (newEvenement.value.responsableSuivi?.trim()) {
      evenementData.responsableSuivi = newEvenement.value.responsableSuivi.trim()
    }

    console.log('[CRV][EVENEMENT_API] Envoi au backend:', evenementData)

    await crvStore.addEvenement(evenementData)

    console.log('[CRV][EVENEMENT_SUCCESS] Événement ajouté avec succès')
    resetNewEvenement()
    emit('evenement-added', evenementData)

  } catch (error) {
    console.error('[CRV][EVENEMENT_ERROR] Erreur ajout événement:', error)
    errorMessage.value = error.message || 'Erreur lors de l\'ajout de l\'événement'
  } finally {
    saving.value = false
  }
}

// SUPPRIMÉ AUDIT: handleConfirmNoEvent et watcher hasConfirmationAucunEvenement
// DOCTRINE: "Absence = Non documenté" - pas de confirmation d'absence
</script>

<style scoped>
.crv-evenements-component {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.subsection-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.existing-evenements {
  margin-bottom: 25px;
}

.evenements-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.evenement-card {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 15px;
}

/* CORRECTION AUDIT: Classes gravité conformes */
.evenement-card.gravite-mineure {
  background: #f0f9ff;
  border-color: #0ea5e9;
}

.evenement-card.gravite-moderee {
  background: #fef3c7;
  border-color: #fbbf24;
}

.evenement-card.gravite-majeure {
  background: #ffedd5;
  border-color: #f97316;
}

.evenement-card.gravite-critique {
  background: #fef2f2;
  border-color: #ef4444;
}

.evenement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.evenement-type {
  font-weight: 600;
  color: #1f2937;
}

.evenement-gravite {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;
}

/* CORRECTION AUDIT: Badges gravité conformes */
.badge-mineure {
  background: #0ea5e9;
  color: white;
}

.badge-moderee {
  background: #fbbf24;
  color: #1f2937;
}

.badge-majeure {
  background: #f97316;
  color: white;
}

.badge-critique {
  background: #ef4444;
  color: white;
}

/* Statuts événement */
.status-ouvert {
  color: #2563eb;
}

.status-en_cours {
  color: #f59e0b;
}

.status-resolu {
  color: #10b981;
}

.status-cloture {
  color: #6b7280;
}

.evenement-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  gap: 10px;
  font-size: 14px;
}

.detail-row span {
  color: #6b7280;
  min-width: 80px;
}

.detail-row strong {
  color: #1f2937;
}

.detail-row.description p,
.detail-row.actions p {
  margin: 0;
  color: #374151;
  line-height: 1.5;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
  margin-bottom: 20px;
}

.add-evenement-section {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 15px;
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
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

textarea.form-input {
  resize: vertical;
  min-height: 60px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
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

.required {
  color: #dc2626;
  font-weight: 700;
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
}
</style>
