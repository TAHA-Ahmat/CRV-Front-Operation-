<template>
  <div class="crv-header-component card">
    <h3 class="section-title">{{ title }}</h3>

    <div class="header-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Numéro de vol</label>
          <input
            v-model="localData.numeroVol"
            type="text"
            class="form-input"
            placeholder="ex: AF1234"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Date</label>
          <input
            v-model="localData.date"
            type="date"
            class="form-input"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Type d'appareil</label>
          <input
            v-model="localData.typeAppareil"
            type="text"
            class="form-input"
            placeholder="ex: A320"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Immatriculation</label>
          <input
            v-model="localData.immatriculation"
            type="text"
            class="form-input"
            placeholder="ex: F-HBNA"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Provenance / Destination</label>
          <input
            v-model="localData.route"
            type="text"
            class="form-input"
            placeholder="ex: CDG - ORY"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Poste de stationnement</label>
          <input
            v-model="localData.poste"
            type="text"
            class="form-input"
            placeholder="ex: A12"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Informations du vol'
  },
  modelValue: {
    type: Object,
    default: () => ({
      numeroVol: '',
      date: '',
      typeAppareil: '',
      immatriculation: '',
      route: '',
      poste: ''
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

const emitUpdate = () => {
  emit('update:modelValue', localData.value)
}
</script>

<style scoped>
.crv-header-component {
  margin-bottom: 20px;
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
</style>
