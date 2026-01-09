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

          <div class="form-group">
            <label class="form-label">Fonction <span class="required">*</span></label>
            <input
              v-model="personne.fonction"
              type="text"
              class="form-input"
              placeholder="ex: Chef d'escale"
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
 */
import { ref, watch } from 'vue'

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

const localData = ref([...props.modelValue])

console.log('[CRV][PERSONNE_INIT] Composant personnel initialisé')

watch(() => props.modelValue, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    // Recréer le tableau pour que Vue détecte les changements
    localData.value = newValue.map(item => ({ ...item }))
    console.log('[CRV][PERSONNE_WATCH] Données mises à jour:', localData.value.length, 'personnes')
  }
}, { deep: true, immediate: true })

const addPersonne = () => {
  console.log('[CRV][PERSONNE_ADD] Ajout d\'une personne')
  localData.value.push({
    nom: '',
    prenom: '',
    fonction: '',
    matricule: '',
    telephone: '',  // CORRECTION AUDIT: Champ manquant
    remarques: ''   // CORRECTION AUDIT: Champ manquant
  })
  emitUpdate()
}

const removePersonne = (index) => {
  console.log('[CRV][PERSONNE_REMOVE] Suppression personne index:', index)
  localData.value.splice(index, 1)
  emitUpdate()
}

const emitUpdate = () => {
  console.log('[CRV][PERSONNE_UPDATE] Émission mise à jour:', localData.value.length, 'personnes')
  emit('update:modelValue', localData.value)
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }

  .form-group-wide {
    grid-column: span 2;
  }
}
</style>
