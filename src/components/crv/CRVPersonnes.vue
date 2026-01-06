<template>
  <div class="crv-personnes-component card">
    <h3 class="section-title">Personnel</h3>

    <div class="personnes-list">
      <div
        v-for="(personne, index) in localData"
        :key="index"
        class="personne-item"
      >
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nom</label>
            <input
              v-model="personne.nom"
              type="text"
              class="form-input"
              placeholder="Nom complet"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Fonction</label>
            <select
              v-model="personne.fonction"
              class="form-input"
              :disabled="disabled"
              @change="emitUpdate"
            >
              <option value="">Sélectionner</option>
              <option value="chef_escale">Chef d'escale</option>
              <option value="agent_ops">Agent OPS</option>
              <option value="agent_piste">Agent piste</option>
              <option value="responsable_bagages">Responsable bagages</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Heures présence</label>
            <div class="time-range">
              <input
                v-model="personne.heureDebut"
                type="time"
                class="form-input"
                :disabled="disabled"
                @input="emitUpdate"
              />
              <span>→</span>
              <input
                v-model="personne.heureFin"
                type="time"
                class="form-input"
                :disabled="disabled"
                @input="emitUpdate"
              />
            </div>
          </div>

          <div class="form-actions">
            <button
              v-if="!disabled"
              @click="removePersonne(index)"
              class="btn btn-danger btn-sm"
              type="button"
            >
              Supprimer
            </button>
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

const addPersonne = () => {
  localData.value.push({
    nom: '',
    fonction: '',
    heureDebut: '',
    heureFin: ''
  })
  emitUpdate()
}

const removePersonne = (index) => {
  localData.value.splice(index, 1)
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', localData.value)
}
</script>

<style scoped>
.crv-personnes-component {
  margin-bottom: 20px;
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

.form-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr auto;
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
