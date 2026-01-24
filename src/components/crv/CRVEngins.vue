<template>
  <div class="crv-engins-component card">
    <h3 class="section-title">Engins utilisés</h3>

    <!-- MVS-6 #1: Note comportement remplacement -->
    <div v-if="!disabled" class="replacement-warning">
      <p>
        <strong>Attention :</strong> Cette liste remplacera complètement les engins existants.
        Assurez-vous que tous les engins sont inclus avant d'enregistrer.
      </p>
    </div>

    <!-- Aucun engin - DOCTRINE: pas de confirmation, juste informatif -->
    <div v-if="localData.length === 0" class="empty-state">
      <p>Aucun engin enregistré pour ce vol</p>
    </div>

    <div class="engins-list">
      <div
        v-for="(engin, index) in localData"
        :key="index"
        class="engin-item"
      >
        <div class="engin-header">
          <span class="engin-number">#{{ index + 1 }}</span>
          <button
            v-if="!disabled"
            @click="removeEngin(index)"
            class="btn btn-danger btn-sm"
            type="button"
          >
            Supprimer
          </button>
        </div>
        <div class="form-row">
          <!-- CORRECTION AUDIT: 15 types d'engins conformes à la doctrine -->
          <div class="form-group">
            <label class="form-label">Type d'engin <span class="required">*</span></label>
            <select
              v-model="engin.type"
              class="form-input"
              :disabled="disabled"
              @change="emitUpdate"
            >
              <option value="">Sélectionner</option>
              <option v-for="type in typesEngin" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>

          <!-- MVS-6 #2: Uppercase automatique sur immatriculation -->
          <div class="form-group">
            <label class="form-label">Immatriculation</label>
            <input
              v-model="engin.immatriculation"
              type="text"
              class="form-input immatriculation-input"
              placeholder="ex: ENG123"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>

          <!-- CORRECTION AUDIT: Champ usage avec enum conforme -->
          <div class="form-group">
            <label class="form-label">Statut d'usage</label>
            <select
              v-model="engin.usage"
              class="form-input"
              :disabled="disabled"
              @change="emitUpdate"
            >
              <option v-for="usage in usagesEngin" :key="usage.value" :value="usage.value">
                {{ usage.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Heure de début</label>
            <input
              v-model="engin.heureDebut"
              type="time"
              class="form-input"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Heure de fin</label>
            <input
              v-model="engin.heureFin"
              type="time"
              class="form-input"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Remarques</label>
            <input
              v-model="engin.remarques"
              type="text"
              class="form-input"
              placeholder="Observations..."
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>
        </div>
      </div>
    </div>

    <button v-if="!disabled" @click="addEngin" class="btn btn-primary" type="button">
      + Ajouter un engin
    </button>
  </div>
</template>

<script setup>
/**
 * CRVEngins.vue - CORRIGÉ AUDIT 2025-01
 *
 * CORRECTIONS APPLIQUÉES:
 * - CORRIGÉ: 15 types d'engins conformes à la doctrine (TRACTEUR, CHARIOT_BAGAGES, etc.)
 * - AJOUTÉ: Champ usage avec enum USAGE_ENGIN (EN_SERVICE, DISPONIBLE, etc.)
 * - AJOUTÉ: Import des enums centralisés
 * - AJOUTÉ: Console.log format [CRV][ENGIN_*]
 * - AJOUTÉ: Champ remarques
 */
import { ref, watch } from 'vue'
import {
  TYPE_ENGIN,
  USAGE_ENGIN,
  getEnumOptions
} from '@/config/crvEnums'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// CORRECTION AUDIT: Utilisation des enums centralisés
const typesEngin = getEnumOptions(TYPE_ENGIN)
const usagesEngin = getEnumOptions(USAGE_ENGIN)

console.log('[CRV][ENGIN_INIT] Enums chargés:', {
  typesEngin: typesEngin.length,
  usagesEngin: usagesEngin.length
})

const localData = ref([...props.modelValue])
let isUpdating = false // Flag pour éviter boucle infinie

watch(() => props.modelValue, (newValue) => {
  if (isUpdating) return // Éviter boucle infinie
  if (newValue && Array.isArray(newValue)) {
    // Vérifier si les données ont réellement changé
    const newJson = JSON.stringify(newValue)
    const localJson = JSON.stringify(localData.value)
    if (newJson !== localJson) {
      localData.value = newValue.map(item => ({ ...item }))
      console.log('[CRV][ENGIN_WATCH] Données mises à jour:', localData.value.length, 'engins')
    }
  }
}, { deep: true, immediate: true })

const addEngin = () => {
  console.log('[CRV][ENGIN_ADD] Ajout d\'un engin')
  localData.value.push({
    type: '',
    immatriculation: '',
    heureDebut: '',
    heureFin: '',
    usage: USAGE_ENGIN.EN_SERVICE, // Valeur par défaut conforme
    remarques: ''
  })
  emitUpdate()
}

const removeEngin = (index) => {
  console.log('[CRV][ENGIN_REMOVE] Suppression engin index:', index)
  localData.value.splice(index, 1)
  emitUpdate()
}

const emitUpdate = () => {
  isUpdating = true
  console.log('[CRV][ENGIN_UPDATE] Émission mise à jour:', localData.value.length, 'engins')
  emit('update:modelValue', [...localData.value])
  setTimeout(() => { isUpdating = false }, 0)
}
</script>

<style scoped>
.crv-engins-component {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
  margin-bottom: 15px;
}

.engins-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 15px;
}

.engin-item {
  background: #f9fafb;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.engin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.engin-number {
  font-weight: 600;
  color: #2563eb;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 10px;
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

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.required {
  color: #dc2626;
  font-weight: 700;
}

/* MVS-6 #1: Style note remplacement */
.replacement-warning {
  margin-bottom: 15px;
  padding: 10px 15px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
}

.replacement-warning p {
  margin: 0;
  font-size: 13px;
  color: #92400e;
  line-height: 1.5;
}

/* MVS-6 #2: Uppercase sur immatriculation */
.immatriculation-input {
  text-transform: uppercase;
}

.immatriculation-input::placeholder {
  text-transform: none;
}

/* ============================================ */
/* RESPONSIVE DESIGN                            */
/* ============================================ */

/* Mobile (jusqu'à 640px) */
@media (max-width: 640px) {
  .crv-engins-component {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .replacement-warning {
    padding: 10px 12px;
  }

  .replacement-warning p {
    font-size: 12px;
  }

  .empty-state {
    padding: 20px;
  }

  .engin-item {
    padding: 12px;
  }

  .engin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 10px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 8px;
  }

  .form-input {
    font-size: 16px; /* Évite le zoom iOS */
    padding: 12px;
  }

  .btn {
    width: 100%;
    padding: 12px 16px;
  }

  .btn-sm {
    width: auto;
    padding: 8px 12px;
  }
}

/* Tablet (641px - 1024px) */
@media (min-width: 641px) and (max-width: 1024px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop (1025px+) */
@media (min-width: 1025px) {
  .form-row {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
