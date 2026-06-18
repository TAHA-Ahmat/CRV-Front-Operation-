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
            list="iata-compagnies-list"
            class="form-input"
            placeholder="ex: Air France"
            :disabled="disabled"
            @input="onCompagnieInput"
          />
          <datalist id="iata-compagnies-list">
            <option v-for="nom in iataOptions" :key="nom" :value="nom" />
          </datalist>
        </div>

        <div class="form-group">
          <label class="form-label">Code IATA *</label>
          <input
            v-model="localData.codeIATA"
            type="text"
            class="form-input"
            maxlength="2"
            placeholder="ex: AF"
            :disabled="disabled"
            @input="onCodeIATAInput"
          />
          <span v-if="iataHint" class="iata-hint">→ {{ iataHint }}</span>
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
import { ref, watch, onMounted, computed } from 'vue'
import { compagnies } from '@/data/seed/compagnies'

// Index IATA bidirectionnel
const byCode = Object.fromEntries(compagnies.filter(c => c.actif).map(c => [c.code.toUpperCase(), c]))
const byNom = Object.fromEntries(compagnies.filter(c => c.actif).map(c => [c.nom.toLowerCase(), c]))

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

// Mémorisation localStorage — rappeler les valeurs fréquentes
const MEM = {
  get: (k) => localStorage.getItem(`crv_mem_${k}`) || '',
  set: (k, v) => { if (v) localStorage.setItem(`crv_mem_${k}`, v) }
}

onMounted(() => {
  let changed = false
  if (!localData.value.aeroportOrigine) {
    const last = MEM.get('aeroport_origine')
    if (last) { localData.value.aeroportOrigine = last; changed = true }
  }
  if (!localData.value.immatriculation) {
    const last = MEM.get('immatriculation')
    if (last) { localData.value.immatriculation = last; changed = true }
  }
  if (!localData.value.typeAvion && localData.value.immatriculation) {
    const cache = JSON.parse(localStorage.getItem('crv_mem_avion_cache') || '{}')
    const t = cache[localData.value.immatriculation]
    if (t) { localData.value.typeAvion = t; changed = true }
  }
  if (changed) emitUpdate()
})

// Lookup IATA bidirectionnel
const iataHint = ref('')

function onCodeIATAInput() {
  const code = (localData.value.codeIATA || '').trim().toUpperCase()
  localData.value.codeIATA = code
  if (code.length === 2 && byCode[code]) {
    const comp = byCode[code]
    if (!localData.value.compagnieAerienne) {
      localData.value.compagnieAerienne = comp.nom
    }
    iataHint.value = comp.nom
  } else {
    iataHint.value = ''
  }
  emitUpdate()
}

function onCompagnieInput() {
  const nom = (localData.value.compagnieAerienne || '').toLowerCase()
  const match = byNom[nom]
  if (match && !localData.value.codeIATA) {
    localData.value.codeIATA = match.code
    iataHint.value = match.code
  }
  emitUpdate()
}

const iataOptions = computed(() =>
  compagnies.filter(c => c.actif).map(c => c.nom)
)

// Sauvegarder en mémoire quand ces champs sont remplis
watch(() => localData.value.aeroportOrigine, (v) => { if (v?.length === 3) MEM.set('aeroport_origine', v) })
watch(() => localData.value.immatriculation, (v) => {
  if (!v) return
  MEM.set('immatriculation', v)
  // Associer l'immatriculation au type avion saisi
  if (localData.value.typeAvion) {
    const cache = JSON.parse(localStorage.getItem('crv_mem_avion_cache') || '{}')
    cache[v] = localData.value.typeAvion
    localStorage.setItem('crv_mem_avion_cache', JSON.stringify(cache))
  }
})
watch(() => localData.value.typeAvion, (v) => {
  if (!v || !localData.value.immatriculation) return
  const cache = JSON.parse(localStorage.getItem('crv_mem_avion_cache') || '{}')
  cache[localData.value.immatriculation] = v
  localStorage.setItem('crv_mem_avion_cache', JSON.stringify(cache))
})
</script>

<style scoped>
.iata-hint {
  font-size: 11px;
  color: #2563eb;
  font-weight: 500;
  margin-top: 2px;
  display: block;
}

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

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .crv-header-component {
    margin-bottom: 14px;
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
    min-height: 44px;
  }
}

/* Tablet (768px - 1023px = md:) : 2 colonnes */
@media (min-width: 768px) and (max-width: 1023px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-input {
    min-height: 42px;
  }
}
</style>
