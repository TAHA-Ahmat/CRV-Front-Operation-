<template>
  <div class="crv-header-component card">
    <div class="section-header">
      <h3 class="section-title">{{ title }}</h3>
    </div>

    <div class="header-form">
      <!-- Ligne 1: Vol et Compagnie -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Numéro de vol *</label>
          <input
            v-model="localData.numeroVol"
            type="text"
            class="form-input"
            placeholder="ex: THS001"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Compagnie aérienne *</label>
          <input
            v-model="localData.compagnieAerienne"
            type="text"
            class="form-input"
            placeholder="ex: THS Airways"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Code IATA *</label>
          <input
            v-model="localData.codeIATA"
            type="text"
            class="form-input"
            maxlength="2"
            placeholder="ex: TH"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Date du vol *</label>
          <input
            v-model="localData.dateVol"
            type="date"
            class="form-input"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>
      </div>

      <!-- Ligne 2: Aéroports -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Aéroport origine</label>
          <input
            v-model="localData.aeroportOrigine"
            type="text"
            class="form-input"
            maxlength="3"
            placeholder="ex: CDG"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Aéroport destination</label>
          <input
            v-model="localData.aeroportDestination"
            type="text"
            class="form-input"
            maxlength="3"
            placeholder="ex: NDJ"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Type avion</label>
          <input
            v-model="localData.typeAvion"
            type="text"
            class="form-input"
            placeholder="ex: B737-800"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Immatriculation avion</label>
          <input
            v-model="localData.immatriculation"
            type="text"
            class="form-input"
            placeholder="ex: 5H-THS"
            :disabled="disabled"
            @input="emitUpdate"
          />
        </div>
      </div>

      <!-- Ligne 3: Poste -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Poste de stationnement</label>
          <input
            v-model="localData.poste"
            type="text"
            class="form-input"
            placeholder="ex: P42"
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
      compagnieAerienne: '',
      codeIATA: '',
      aeroportOrigine: '',
      aeroportDestination: '',
      dateVol: new Date().toISOString().split('T')[0],
      immatriculation: '',
      typeAvion: '',
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
  if (newValue) {
    // Mettre à jour chaque propriété pour que Vue détecte les changements
    Object.keys(newValue).forEach(key => {
      localData.value[key] = newValue[key]
    })
  }
}, { deep: true, immediate: true })

const emitUpdate = () => {
  emit('update:modelValue', localData.value)
}
</script>

<style scoped>
.crv-header-component {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  margin: 0;
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

/* ============================================ */
/* RESPONSIVE DESIGN                            */
/* ============================================ */

/* Mobile (jusqu'à 640px) */
@media (max-width: 640px) {
  .crv-header-component {
    margin-bottom: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 16px;
  }

  .header-form {
    gap: 12px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .form-input {
    font-size: 16px; /* Évite le zoom iOS */
    padding: 12px;
  }
}

/* Tablet (641px - 1024px) */
@media (min-width: 641px) and (max-width: 1024px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
