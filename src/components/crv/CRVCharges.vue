<template>
  <div class="crv-charges-component card">
    <h3 class="section-title">Charges (Bagages, Fret, Courrier)</h3>

    <div class="charges-sections">
      <!-- Passagers -->
      <div class="charge-section">
        <h4>Passagers</h4>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nombre adultes</label>
            <input
              v-model.number="localData.passagers.adultes"
              type="number"
              class="form-input"
              min="0"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Nombre enfants</label>
            <input
              v-model.number="localData.passagers.enfants"
              type="number"
              class="form-input"
              min="0"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Nombre bébés</label>
            <input
              v-model.number="localData.passagers.bebes"
              type="number"
              class="form-input"
              min="0"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Total</label>
            <input
              :value="totalPassagers"
              type="number"
              class="form-input"
              disabled
            />
          </div>
        </div>
      </div>

      <!-- Bagages -->
      <div class="charge-section">
        <h4>Bagages</h4>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nombre de pièces</label>
            <input
              v-model.number="localData.bagages.nombre"
              type="number"
              class="form-input"
              min="0"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Poids total (kg)</label>
            <input
              v-model.number="localData.bagages.poids"
              type="number"
              class="form-input"
              min="0"
              step="0.1"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Bagages spéciaux</label>
            <input
              v-model.number="localData.bagages.speciaux"
              type="number"
              class="form-input"
              min="0"
              placeholder="PMR, animaux, etc."
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>
        </div>
      </div>

      <!-- Fret -->
      <div class="charge-section">
        <h4>Fret</h4>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nombre de pièces</label>
            <input
              v-model.number="localData.fret.nombre"
              type="number"
              class="form-input"
              min="0"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Poids total (kg)</label>
            <input
              v-model.number="localData.fret.poids"
              type="number"
              class="form-input"
              min="0"
              step="0.1"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Marchandises dangereuses</label>
            <select
              v-model="localData.fret.dangereux"
              class="form-input"
              :disabled="disabled"
              @change="emitUpdate"
            >
              <option :value="false">Non</option>
              <option :value="true">Oui</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Courrier -->
      <div class="charge-section">
        <h4>Courrier / Poste</h4>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nombre de sacs</label>
            <input
              v-model.number="localData.courrier.nombre"
              type="number"
              class="form-input"
              min="0"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Poids total (kg)</label>
            <input
              v-model.number="localData.courrier.poids"
              type="number"
              class="form-input"
              min="0"
              step="0.1"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="total-section">
      <div class="total-item">
        <span>Poids total chargement:</span>
        <strong>{{ poidsTotal }} kg</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      passagers: { adultes: 0, enfants: 0, bebes: 0 },
      bagages: { nombre: 0, poids: 0, speciaux: 0 },
      fret: { nombre: 0, poids: 0, dangereux: false },
      courrier: { nombre: 0, poids: 0 }
    })
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const localData = ref({ ...props.modelValue })

watch(() => props.modelValue, (newValue) => {
  localData.value = { ...newValue }
}, { deep: true })

const totalPassagers = computed(() => {
  return (localData.value.passagers.adultes || 0) +
         (localData.value.passagers.enfants || 0) +
         (localData.value.passagers.bebes || 0)
})

const poidsTotal = computed(() => {
  return (localData.value.bagages.poids || 0) +
         (localData.value.fret.poids || 0) +
         (localData.value.courrier.poids || 0)
})

const emitUpdate = () => {
  emit('update:modelValue', localData.value)
}
</script>

<style scoped>
.crv-charges-component {
  margin-bottom: 20px;
}

.charges-sections {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.charge-section {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.charge-section h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.total-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e5e7eb;
}

.total-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
}

.total-item strong {
  font-size: 18px;
  color: #2563eb;
}
</style>
