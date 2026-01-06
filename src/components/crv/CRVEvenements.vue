<template>
  <div class="crv-evenements-component card">
    <h3 class="section-title">Événements et Incidents</h3>

    <div class="evenements-list">
      <div
        v-for="(evenement, index) in localData"
        :key="index"
        class="evenement-item"
      >
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Type d'événement</label>
            <select
              v-model="evenement.type"
              class="form-input"
              :disabled="disabled"
              @change="emitUpdate"
            >
              <option value="">Sélectionner</option>
              <option value="retard">Retard</option>
              <option value="incident_technique">Incident technique</option>
              <option value="incident_bagages">Incident bagages</option>
              <option value="incident_passagers">Incident passagers</option>
              <option value="incident_securite">Incident sécurité</option>
              <option value="conditions_meteo">Conditions météo</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Heure</label>
            <input
              v-model="evenement.heure"
              type="time"
              class="form-input"
              :disabled="disabled"
              @input="emitUpdate"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Gravité</label>
            <select
              v-model="evenement.gravite"
              class="form-input"
              :disabled="disabled"
              @change="emitUpdate"
            >
              <option value="info">Information</option>
              <option value="mineur">Mineur</option>
              <option value="moyen">Moyen</option>
              <option value="majeur">Majeur</option>
            </select>
          </div>

          <div class="form-actions">
            <button
              v-if="!disabled"
              @click="removeEvenement(index)"
              class="btn btn-danger btn-sm"
              type="button"
            >
              Supprimer
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea
            v-model="evenement.description"
            class="form-input"
            rows="3"
            placeholder="Décrire l'événement en détail"
            :disabled="disabled"
            @input="emitUpdate"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Actions entreprises</label>
          <textarea
            v-model="evenement.actions"
            class="form-input"
            rows="2"
            placeholder="Quelles actions ont été prises suite à cet événement ?"
            :disabled="disabled"
            @input="emitUpdate"
          ></textarea>
        </div>
      </div>

      <div v-if="localData.length === 0" class="empty-state">
        <p>Aucun événement signalé</p>
      </div>
    </div>

    <button v-if="!disabled" @click="addEvenement" class="btn btn-primary" type="button">
      + Signaler un événement
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

const addEvenement = () => {
  localData.value.push({
    type: '',
    heure: '',
    gravite: 'info',
    description: '',
    actions: ''
  })
  emitUpdate()
}

const removeEvenement = (index) => {
  localData.value.splice(index, 1)
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', localData.value)
}
</script>

<style scoped>
.crv-evenements-component {
  margin-bottom: 20px;
}

.evenements-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 15px;
}

.evenement-item {
  background: #fef3c7;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #fbbf24;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 15px;
  align-items: end;
  margin-bottom: 15px;
}

.form-actions {
  display: flex;
  align-items: flex-end;
}

.btn-sm {
  padding: 8px 12px;
  font-size: 13px;
}

textarea.form-input {
  resize: vertical;
  min-height: 60px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}
</style>
