<template>
  <div class="crv-personnes-component card">
    <h3 class="section-title">Personnel affecté</h3>

    <div v-if="localData.length === 0" class="empty-state">
      <p>Aucun personnel affecté. Cliquez sur "Ajouter une personne" pour commencer.</p>
    </div>

    <div class="personnes-list">
      <div
        v-for="(personne, index) in localData"
        :key="index"
        class="personne-item"
      >
        <div class="personne-header">
          <span class="personne-number">#{{ index + 1 }}</span>
          <button
            v-if="!disabled"
            @click="removePersonne(index)"
            class="btn btn-danger btn-sm"
            type="button"
          >
            Supprimer
          </button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nom <span class="required">*</span></label>
            <input
              v-model="personne.nom"
              type="text"
              class="form-input"
              placeholder="ex: IBRAHIM"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Prénom <span class="required">*</span></label>
            <input
              v-model="personne.prenom"
              type="text"
              class="form-input"
              placeholder="ex: Ahmed"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>

          <!-- MVS-9 #1: Select avec enum ROLE_PERSONNEL -->
          <div class="form-group">
            <label class="form-label">Rôle <span class="required">*</span></label>
            <select
              v-model="personne.role"
              class="form-input"
              :disabled="disabled"
              @change="emitUpdate"
            >
              <option value="">Sélectionner un rôle</option>
              <option v-for="role in rolesPersonnel" :key="role.value" :value="role.value">
                {{ role.label }}
              </option>
            </select>
            <span v-if="personne.role && roleDescriptions[personne.role]" class="role-description">
              {{ roleDescriptions[personne.role] }}
            </span>
          </div>

          <!-- MVS-9: Champ libre si rôle = AUTRE -->
          <div v-if="personne.role === 'AUTRE'" class="form-group">
            <label class="form-label">Précision du rôle <span class="required">*</span></label>
            <input
              v-model="personne.fonctionAutre"
              type="text"
              class="form-input"
              placeholder="Précisez le rôle..."
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Matricule</label>
            <input
              v-model="personne.matricule"
              type="text"
              class="form-input"
              placeholder="ex: CE-001"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>
        </div>

        <!-- CORRECTION AUDIT: Champs manquants telephone et remarques -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Téléphone</label>
            <input
              v-model="personne.telephone"
              type="tel"
              class="form-input"
              placeholder="ex: +253 77 XX XX XX"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>

          <div class="form-group form-group-wide">
            <label class="form-label">Remarques</label>
            <input
              v-model="personne.remarques"
              type="text"
              class="form-input"
              placeholder="Observations sur cette personne..."
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>
        </div>
      </div>
    </div>

    <button v-if="!disabled" @click="addPersonne" class="btn btn-primary" type="button">
      + Ajouter une personne
    </button>
  </div>
</template>

<script setup>
/**
 * CRVPersonnes.vue - CORRIGÉ AUDIT 2025-01
 *
 * CORRECTIONS APPLIQUÉES:
 * - AJOUTÉ: Champ telephone (manquant selon doctrine)
 * - AJOUTÉ: Champ remarques (manquant selon doctrine)
 * - AJOUTÉ: Console.log format [CRV][PERSONNE_*]
 * - MVS-9: Utilisation enum ROLE_PERSONNEL au lieu de champ libre fonction
 */
import { ref, watch } from 'vue'
import {
  ROLE_PERSONNEL,
  ROLE_PERSONNEL_LABELS,
  ROLE_PERSONNEL_DESCRIPTIONS,
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

// MVS-9: Utilisation des enums centralisés pour les rôles
const rolesPersonnel = getEnumOptions(ROLE_PERSONNEL)
const roleDescriptions = ROLE_PERSONNEL_DESCRIPTIONS

const localData = ref([...props.modelValue])
let isUpdating = false // Flag pour éviter boucle infinie

console.log('[CRV][PERSONNE_INIT] Composant personnel initialisé, rôles:', rolesPersonnel.length)

watch(() => props.modelValue, (newValue) => {
  if (isUpdating) return // Éviter boucle infinie
  if (newValue && Array.isArray(newValue)) {
    // Vérifier si les données ont réellement changé
    const newJson = JSON.stringify(newValue)
    const localJson = JSON.stringify(localData.value)
    if (newJson !== localJson) {
      localData.value = newValue.map(item => ({ ...item }))
      console.log('[CRV][PERSONNE_WATCH] Données mises à jour:', localData.value.length, 'personnes')
    }
  }
}, { deep: true, immediate: true })

const addPersonne = () => {
  console.log('[CRV][PERSONNE_ADD] Ajout d\'une personne')
  localData.value.push({
    nom: '',
    prenom: '',
    role: '',        // MVS-9: Utilisation enum ROLE_PERSONNEL
    fonctionAutre: '', // MVS-9: Champ libre si role = AUTRE
    matricule: '',
    telephone: '',   // CORRECTION AUDIT: Champ manquant
    remarques: ''    // CORRECTION AUDIT: Champ manquant
  })
  emitUpdate()
}

const removePersonne = (index) => {
  console.log('[CRV][PERSONNE_REMOVE] Suppression personne index:', index)
  localData.value.splice(index, 1)
  emitUpdate()
}

const emitUpdate = () => {
  isUpdating = true
  console.log('[CRV][PERSONNE_UPDATE] Émission mise à jour:', localData.value.length, 'personnes')
  emit('update:modelValue', [...localData.value])
  setTimeout(() => { isUpdating = false }, 0)
}
</script>

<style scoped>
.crv-personnes-component {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.empty-state {
  padding: 30px;
  text-align: center;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
  color: #6b7280;
  margin-bottom: 15px;
}

.personnes-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 15px;
}

.personne-item {
  background: #f9fafb;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.personne-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.personne-number {
  font-weight: 600;
  color: #2563eb;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  align-items: end;
  margin-bottom: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group-wide {
  grid-column: span 2;
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

/* MVS-9: Style description rôle */
.role-description {
  font-size: 11px;
  color: #6b7280;
  font-style: italic;
  margin-top: 4px;
}

/* ============================================ */
/* RESPONSIVE DESIGN                            */
/* ============================================ */

/* Mobile (jusqu'à 640px) */
@media (max-width: 640px) {
  .crv-personnes-component {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .empty-state {
    padding: 20px;
  }

  .personnes-list {
    gap: 12px;
  }

  .personne-item {
    padding: 12px;
  }

  .personne-header {
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

  .form-group-wide {
    grid-column: span 1;
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

  .role-description {
    font-size: 10px;
  }
}

/* Tablet (641px - 1024px) */
@media (min-width: 641px) and (max-width: 1024px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-group-wide {
    grid-column: span 2;
  }
}

/* Desktop (1025px+) */
@media (min-width: 1025px) {
  .form-row {
    grid-template-columns: repeat(4, 1fr);
  }

  .form-group-wide {
    grid-column: span 2;
  }
}
</style>
