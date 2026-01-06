<template>
  <div class="crv-nouveau-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="btn-back">← Retour</button>
          <h1>Nouveau CRV</h1>
        </div>
        <div class="user-info">
          <span>{{ authStore.currentUser?.email }}</span>
          <button @click="handleLogout" class="btn btn-secondary">
            Deconnexion
          </button>
        </div>
      </div>
    </header>

    <main class="crv-main">
      <div class="container">
        <!-- Sélection du mode -->
        <div class="mode-selector">
          <button
            :class="['mode-btn', { active: mode === 'simple' }]"
            @click="mode = 'simple'"
          >
            <span class="mode-icon">&#9889;</span>
            <span class="mode-label">Mode Rapide</span>
            <span class="mode-desc">Creation automatique</span>
          </button>
          <button
            :class="['mode-btn', { active: mode === 'vol' }]"
            @click="mode = 'vol'"
          >
            <span class="mode-icon">&#9992;</span>
            <span class="mode-label">Vol Existant</span>
            <span class="mode-desc">Selectionner un vol</span>
          </button>
        </div>

        <!-- MODE SIMPLE: Type + Date -->
        <div v-if="mode === 'simple'" class="creation-card">
          <h2>Creation Rapide</h2>
          <p class="subtitle">Le systeme cree automatiquement le vol associe</p>

          <div class="simple-form">
            <div class="form-group">
              <label>Type d'operation *</label>
              <div class="type-buttons">
                <button
                  v-for="t in typeOptions"
                  :key="t.value"
                  :class="['type-btn', { selected: simpleForm.type === t.value }]"
                  @click="simpleForm.type = t.value"
                >
                  <span class="type-icon">{{ t.icon }}</span>
                  <span class="type-name">{{ t.label }}</span>
                  <span class="type-phases">{{ t.phases }}</span>
                </button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Date du vol</label>
                <input
                  type="datetime-local"
                  v-model="simpleForm.date"
                />
              </div>
            </div>

            <button
              @click="createCRVSimple"
              :disabled="creating || !simpleForm.type"
              class="btn btn-primary btn-create"
            >
              <span v-if="creating">Creation en cours...</span>
              <span v-else>Creer le CRV</span>
            </button>
          </div>
        </div>

        <!-- MODE VOL: Sélection d'un vol existant -->
        <div v-else class="selection-card">
          <h2>Selectionnez un vol</h2>
          <p class="subtitle">Choisissez le vol pour lequel creer un CRV</p>

          <!-- Filtres -->
          <div class="filters-section">
            <div class="filter-row">
              <div class="filter-group">
                <label>Date</label>
                <input
                  type="date"
                  v-model="filters.date"
                  @change="loadVols"
                />
              </div>
              <div class="filter-group">
                <label>Type d'operation</label>
                <select v-model="filters.typeOperation" @change="loadVols">
                  <option value="">Tous</option>
                  <option value="ARRIVEE">Arrivee</option>
                  <option value="DEPART">Depart</option>
                  <option value="TURN_AROUND">Turn Around</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Compagnie</label>
                <input
                  type="text"
                  v-model="filters.compagnie"
                  placeholder="Code IATA..."
                  @input="debouncedLoadVols"
                />
              </div>
            </div>
          </div>

          <!-- Liste des vols -->
          <div class="vols-list" v-if="!loading">
            <div
              v-for="vol in volsList"
              :key="vol.id || vol._id"
              class="vol-card"
              :class="{ selected: (selectedVol?.id || selectedVol?._id) === (vol.id || vol._id) }"
              @click="selectVol(vol)"
            >
              <div class="vol-header">
                <span class="vol-numero">{{ vol.numeroVol }}</span>
                <span class="vol-type" :class="vol.typeOperation.toLowerCase()">
                  {{ formatTypeOperation(vol.typeOperation) }}
                </span>
              </div>
              <div class="vol-details">
                <div class="vol-info">
                  <span class="label">Compagnie</span>
                  <span class="value">{{ vol.compagnieAerienne }} ({{ vol.codeIATA }})</span>
                </div>
                <div class="vol-info">
                  <span class="label">Date</span>
                  <span class="value">{{ formatDate(vol.dateVol) }}</span>
                </div>
                <div class="vol-info" v-if="vol.avion">
                  <span class="label">Avion</span>
                  <span class="value">{{ vol.avion.immatriculation }}</span>
                </div>
              </div>
              <div class="vol-status" v-if="vol.crv">
                <span class="status-badge has-crv">CRV existant</span>
              </div>
            </div>

            <div v-if="volsList.length === 0" class="no-results">
              <p>Aucun vol trouve pour ces criteres</p>
              <button @click="mode = 'simple'" class="btn btn-secondary">
                Utiliser le mode rapide
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div v-else class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des vols...</p>
          </div>

          <!-- Pagination -->
          <div class="pagination" v-if="pagination.pages > 1">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="btn-page"
            >
              ← Precedent
            </button>
            <span class="page-info">
              Page {{ pagination.page }} / {{ pagination.pages }}
            </span>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.pages"
              class="btn-page"
            >
              Suivant →
            </button>
          </div>
        </div>

        <!-- Actions pour mode vol -->
        <div class="actions-section" v-if="mode === 'vol' && selectedVol">
          <div class="selected-vol-summary">
            <h3>Vol selectionne</h3>
            <p>
              <strong>{{ selectedVol.numeroVol }}</strong> -
              {{ selectedVol.compagnieAerienne }} -
              {{ formatDate(selectedVol.dateVol) }}
            </p>
          </div>
          <button
            @click="createCRVFromVol"
            :disabled="creating || selectedVol.crv"
            class="btn btn-primary btn-create"
          >
            <span v-if="creating">Creation en cours...</span>
            <span v-else-if="selectedVol.crv">CRV deja existant</span>
            <span v-else>Creer le CRV</span>
          </button>
        </div>

        <!-- Message d'erreur -->
        <div v-if="error" class="error-message">
          <strong v-if="errorCode">{{ errorCode }}:</strong>
          {{ error }}
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useVolsStore } from '@/stores/volsStore'
import { useCRVStore } from '@/stores/crvStore'

const router = useRouter()
const authStore = useAuthStore()
const volsStore = useVolsStore()
const crvStore = useCRVStore()

// Mode: 'simple' ou 'vol'
const mode = ref('simple')

// Etat
const loading = ref(false)
const creating = ref(false)
const error = ref(null)
const errorCode = ref(null)
const selectedVol = ref(null)

// Options de type pour mode simple
const typeOptions = [
  { value: 'arrivee', label: 'Arrivee', icon: '&#9992;&#65039;', phases: '6 phases' },
  { value: 'depart', label: 'Depart', icon: '&#128747;', phases: '9 phases' },
  { value: 'turnaround', label: 'Turn Around', icon: '&#128260;', phases: '15 phases' }
]

// Formulaire mode simple
const simpleForm = reactive({
  type: '',
  date: new Date().toISOString().slice(0, 16)
})

// Filtres mode vol
const filters = reactive({
  date: new Date().toISOString().split('T')[0],
  typeOperation: '',
  compagnie: ''
})

// Computed
const volsList = computed(() => volsStore.getVolsList)
const pagination = computed(() => volsStore.getPagination)

// Charger les vols quand on passe en mode vol
watch(mode, (newMode) => {
  if (newMode === 'vol') {
    loadVols()
  }
})

// Debounce pour la recherche
let debounceTimer = null
const debouncedLoadVols = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(loadVols, 300)
}

// Charger les vols
const loadVols = async () => {
  loading.value = true
  clearError()

  try {
    const params = {
      dateDebut: filters.date,
      dateFin: filters.date,
      limit: 10
    }

    if (filters.typeOperation) {
      params.typeOperation = filters.typeOperation
    }
    if (filters.compagnie) {
      params.compagnie = filters.compagnie
    }

    await volsStore.listVols(params)
  } catch (err) {
    handleError(err, 'Erreur lors du chargement des vols')
  } finally {
    loading.value = false
  }
}

// Changer de page
const changePage = async (page) => {
  if (page < 1 || page > pagination.value.pages) return

  loading.value = true
  try {
    await volsStore.listVols({
      dateDebut: filters.date,
      dateFin: filters.date,
      typeOperation: filters.typeOperation || undefined,
      compagnie: filters.compagnie || undefined,
      page,
      limit: 10
    })
  } catch (err) {
    handleError(err, 'Erreur lors du chargement')
  } finally {
    loading.value = false
  }
}

// Selectionner un vol
const selectVol = (vol) => {
  selectedVol.value = vol
}

// Creer CRV - Mode Simple (type + date)
const createCRVSimple = async () => {
  if (!simpleForm.type) return

  creating.value = true
  clearError()

  try {
    // Mode simple selon contrat: { type, date }
    const result = await crvStore.createCRV({
      type: simpleForm.type,
      date: new Date(simpleForm.date).toISOString()
    })

    // Rediriger vers la page appropriee
    redirectToCRV(simpleForm.type.toUpperCase(), result)
  } catch (err) {
    handleError(err, 'Erreur lors de la creation du CRV')
  } finally {
    creating.value = false
  }
}

// Creer CRV - Mode Vol existant
const createCRVFromVol = async () => {
  if (!selectedVol.value || selectedVol.value.crv) return

  creating.value = true
  clearError()

  try {
    // Mode production selon contrat: { volId, responsableVolId? }
    const volId = selectedVol.value.id || selectedVol.value._id
    const result = await crvStore.createCRV({ volId })

    // Rediriger vers la page appropriee
    redirectToCRV(selectedVol.value.typeOperation, result)
  } catch (err) {
    handleError(err, 'Erreur lors de la creation du CRV')
  } finally {
    creating.value = false
  }
}

// Redirection apres creation
const redirectToCRV = (typeOperation, result) => {
  let route = '/crv'

  // Normaliser le type
  const type = typeOperation.toUpperCase().replace('_', '')

  switch (type) {
    case 'ARRIVEE':
      route = '/crv/arrivee'
      break
    case 'DEPART':
      route = '/crv/depart'
      break
    case 'TURNAROUND':
    case 'TURN_AROUND':
      route = '/crv/turnaround'
      break
  }

  // Utiliser .id selon le contrat
  const crvId = result.id || result._id || result.crv?.id || result.crv?._id
  router.push({
    path: route,
    query: { id: crvId }
  })
}

// Gestion des erreurs selon contrat
const handleError = (err, defaultMessage) => {
  const responseData = err.response?.data
  error.value = responseData?.message || err.message || defaultMessage
  errorCode.value = responseData?.code || null
}

const clearError = () => {
  error.value = null
  errorCode.value = null
}

// Formatage
const formatTypeOperation = (type) => {
  const types = {
    ARRIVEE: 'Arrivee',
    DEPART: 'Depart',
    TURN_AROUND: 'Turn Around'
  }
  return types[type] || type
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Navigation
const goBack = () => {
  router.push('/crv')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Charger au montage (mode vol uniquement)
onMounted(() => {
  if (mode.value === 'vol') {
    loadVols()
  }
})
</script>

<style scoped>
.crv-nouveau-container {
  min-height: 100vh;
  background: #f9fafb;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-back {
  background: #f3f4f6;
  color: #374151;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-back:hover {
  background: #e5e7eb;
}

.app-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info span {
  color: #6b7280;
  font-size: 14px;
}

.crv-main {
  padding: 40px 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

/* Mode Selector */
.mode-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: #93c5fd;
  background: #f8fafc;
}

.mode-btn.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.mode-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.mode-label {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.mode-desc {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

/* Creation Card */
.creation-card,
.selection-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.creation-card h2,
.selection-card h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 24px 0;
}

/* Simple Form */
.simple-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-group input,
.form-group select {
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  color: #1f2937;
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Type Buttons */
.type-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn:hover {
  border-color: #93c5fd;
  background: white;
}

.type-btn.selected {
  border-color: #2563eb;
  background: #eff6ff;
}

.type-btn .type-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.type-btn .type-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.type-btn .type-phases {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* Filtres */
.filters-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.filter-group input,
.filter-group select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background: white;
}

/* Liste des vols */
.vols-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vol-card {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.vol-card:hover {
  border-color: #93c5fd;
  background: #f8fafc;
}

.vol-card.selected {
  border-color: #2563eb;
  background: #eff6ff;
}

.vol-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.vol-numero {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.vol-type {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.vol-type.arrivee {
  background: #dcfce7;
  color: #166534;
}

.vol-type.depart {
  background: #dbeafe;
  color: #1e40af;
}

.vol-type.turn_around {
  background: #fef3c7;
  color: #92400e;
}

.vol-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.vol-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vol-info .label {
  font-size: 12px;
  color: #6b7280;
}

.vol-info .value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.vol-status {
  margin-top: 12px;
}

.status-badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
}

.status-badge.has-crv {
  background: #fee2e2;
  color: #991b1b;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* No results */
.no-results {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.no-results .btn {
  margin-top: 16px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-page {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
}

/* Actions */
.actions-section {
  margin-top: 24px;
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.selected-vol-summary h3 {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.selected-vol-summary p {
  font-size: 16px;
  color: #1f2937;
  margin: 0;
}

.btn-create {
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Error */
.error-message {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
}

.error-message strong {
  font-weight: 600;
}
</style>
