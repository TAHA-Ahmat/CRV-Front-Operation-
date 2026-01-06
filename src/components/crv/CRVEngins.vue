<template>
  <div class="crv-engins-component card">
    <h3 class="section-title">Engins utilisés</h3>

    <div class="engins-list">
      <div
        v-for="(engin, index) in localData"
        :key="index"
        class="engin-item"
      >
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Type d'engin</label>
            <select
              v-model="engin.type"
              class="form-input"
              :disabled="disabled"
              @change="emitUpdate"
            >
              <option value="">Sélectionner</option>
              <option value="tracteur">Tracteur</option>
              <option value="chariot_bagages">Chariot bagages</option>
              <option value="camion_fret">Camion fret</option>
              <option value="passerelle">Passerelle</option>
              <option value="gpu">GPU (Groupe de parc)</option>
              <option value="asu">ASU (Air Start Unit)</option>
              <option value="camion_avitaillement">Camion avitaillement</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Immatriculation</label>
            <input
              v-model="engin.immatriculation"
              type="text"
              class="form-input"
              placeholder="ex: ENG123"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Durée d'utilisation</label>
            <div class="time-range">
              <input
                v-model="engin.heureDebut"
                type="time"
                class="form-input"
                :disabled="disabled"
                @input="emitUpdate"
              />
              <span>→</span>
              <input
                v-model="engin.heureFin"
                type="time"
                class="form-input"
                :disabled="disabled"
                @input="emitUpdate"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Utilisé</label>
            <select
              v-model="engin.utilise"
              class="form-input"
              :disabled="disabled"
              @change="emitUpdate"
            >
              <option :value="true">Oui</option>
              <option :value="false">Non (prévu mais non utilisé)</option>
            </select>
          </div>

          <div class="form-actions">
            <button
              v-if="!disabled"
              @click="removeEngin(index)"
              class="btn btn-danger btn-sm"
              type="button"
            >
              Supprimer
            </button>
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

watch(() => props.modelValue, (newValue) => {
  localData.value = [...newValue]
}, { deep: true })

const addEngin = () => {
  localData.value.push({
    type: '',
    immatriculation: '',
    heureDebut: '',
    heureFin: '',
    utilise: true
  })
  emitUpdate()
}

const removeEngin = (index) => {
  localData.value.splice(index, 1)
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', localData.value)
}
</script>

<style scoped>
.crv-engins-component {
  margin-bottom: 20px;
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

.form-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 2fr 1fr auto;
  gap: 15px;
  align-items: end;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-range input {
  flex: 1;
}

.time-range span {
  color: #6b7280;
}

.form-actions {
  display: flex;
  align-items: flex-end;
}

.btn-sm {
  padding: 8px 12px;
  font-size: 13px;
}
</style>
