<template>
  <div class="crv-phases-component card">
    <h3 class="section-title">Phases opérationnelles</h3>

    <div class="phases-list">
      <div
        v-for="(phase, index) in localData"
        :key="index"
        class="phase-item"
      >
        <div class="phase-header">
          <h4>{{ phase.nom }}</h4>
          <span class="phase-status" :class="{ active: phase.realisee }">
            {{ phase.realisee ? 'Réalisée' : 'Non réalisée' }}
          </span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Réalisée</label>
            <select
              v-model="phase.realisee"
              class="form-input"
              :disabled="disabled"
              @change="handlePhaseChange(phase)"
            >
              <option :value="true">Oui</option>
              <option :value="false">Non</option>
            </select>
          </div>

          <div class="form-group" v-if="phase.realisee">
            <label class="form-label">Heure de début</label>
            <input
              v-model="phase.heureDebut"
              type="time"
              class="form-input"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>

          <div class="form-group" v-if="phase.realisee">
            <label class="form-label">Heure de fin</label>
            <input
              v-model="phase.heureFin"
              type="time"
              class="form-input"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>

          <div class="form-group full-width" v-if="!phase.realisee">
            <label class="form-label">
              Raison de non-réalisation <span class="required">*</span>
            </label>
            <input
              v-model="phase.raisonNonRealisation"
              type="text"
              class="form-input"
              :class="{ 'input-error': !phase.realisee && !phase.raisonNonRealisation }"
              placeholder="Obligatoire : expliquer pourquoi cette phase n'a pas été réalisée"
              :disabled="disabled"
              required
              @input="emitUpdate"
            />
            <span v-if="!phase.realisee && !phase.raisonNonRealisation" class="error-text">
              La raison de non-réalisation est obligatoire
            </span>
          </div>
        </div>

        <div class="form-group" v-if="phase.realisee">
          <label class="form-label">Observations</label>
          <textarea
            v-model="phase.observations"
            class="form-input"
            rows="2"
            placeholder="Observations sur cette phase (optionnel)"
            :disabled="disabled"
            @input="emitUpdate"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
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

const emit = defineEmits(['update:modelValue'])

const localData = ref([...props.modelValue])

watch(() => props.modelValue, (newValue) => {
  localData.value = [...newValue]
}, { deep: true })

const handlePhaseChange = (phase) => {
  // Si la phase passe à "non réalisée", réinitialiser les heures
  if (!phase.realisee) {
    phase.heureDebut = ''
    phase.heureFin = ''
    phase.observations = ''
  } else {
    // Si la phase passe à "réalisée", réinitialiser la raison
    phase.raisonNonRealisation = ''
  }
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', localData.value)
}
</script>

<style scoped>
.crv-phases-component {
  margin-bottom: 20px;
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
  background: #fee2e2;
  color: #991b1b;
}

.phase-status.active {
  background: #dcfce7;
  color: #166534;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.full-width {
  grid-column: 1 / -1;
}

textarea.form-input {
  resize: vertical;
  min-height: 60px;
}

.required {
  color: #dc2626;
  font-weight: 700;
}

.input-error {
  border-color: #dc2626 !important;
  background: #fef2f2;
}

.error-text {
  display: block;
  color: #dc2626;
  font-size: 12px;
  margin-top: 5px;
  font-weight: 500;
}
</style>
