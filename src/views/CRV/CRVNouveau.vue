<template>
  <div class="crv-nouveau-container">
    <!-- Pas de header local - AppHeader global dans App.vue -->

    <main class="crv-main">
      <div class="page-header-bar">
        <h1>Nouveau CRV</h1>
        <p class="subtitle">Choisissez le mode de creation</p>
      </div>

      <div class="container">
        <!-- Selection du mode -->
        <div class="mode-selector">
          <button
            :class="['mode-btn', { active: mode === 'planifie' }]"
            @click="mode = 'planifie'"
          >
            <span class="mode-icon">📅</span>
            <span class="mode-label">Vol Planifie</span>
            <span class="mode-desc">Programme ou Bulletin de Mouvement</span>
          </button>
          <button
            :class="['mode-btn', { active: mode === 'hors_programme' }]"
            @click="mode = 'hors_programme'"
          >
            <span class="mode-icon">✈️</span>
            <span class="mode-label">Vol Hors Programme</span>
            <span class="mode-desc">Vol non prevu (charter, deroutement...)</span>
          </button>
        </div>

        <!-- ============================================ -->
        <!-- MODE 1: VOL PLANIFIE (Programme / Bulletin) -->
        <!-- ============================================ -->
        <div v-if="mode === 'planifie'" class="selection-card">
          <h2>Selectionner un vol planifie</h2>
          <p class="card-subtitle">Choisissez un vol depuis le Programme ou le Bulletin de Mouvement</p>

          <!-- Tabs: Programme / Bulletin -->
          <div class="source-tabs">
            <button
              :class="['tab-btn', { active: sourceType === 'bulletin' }]"
              @click="sourceType = 'bulletin'; loadBulletinMouvements()"
            >
              Bulletin de Mouvement
            </button>
            <button
              :class="['tab-btn', { active: sourceType === 'programme' }]"
              @click="sourceType = 'programme'; loadProgrammeVols()"
            >
              Programme de Vol
            </button>
          </div>

          <!-- Filtres -->
          <div class="filters-section">
            <div class="filter-row">
              <div class="filter-group">
                <label>Date</label>
                <input
                  type="date"
                  v-model="filters.date"
                  @change="sourceType === 'bulletin' ? loadBulletinMouvements() : loadProgrammeVols()"
                />
              </div>
              <div class="filter-group">
                <label>Type d'operation</label>
                <select v-model="filters.typeOperation" @change="filterVols">
                  <option value="">Tous</option>
                  <option value="ARRIVEE">Arrivee</option>
                  <option value="DEPART">Depart</option>
                  <option value="TURN_AROUND">Turn Around</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Statut CRV</label>
                <select v-model="filters.statutCRV" @change="filterVols">
                  <option value="">Tous</option>
                  <option value="sans_crv">Sans CRV</option>
                  <option value="avec_crv">Avec CRV</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des vols...</p>
          </div>

          <!-- Liste des vols -->
          <div v-else-if="filteredVols.length > 0" class="vols-list">
            <div
              v-for="vol in filteredVols"
              :key="vol.id || vol._id"
              class="vol-card"
              :class="{
                selected: selectedVol?.id === vol.id || selectedVol?._id === vol._id,
                'has-crv': vol.hasCRV || vol.crv
              }"
              @click="selectVol(vol)"
            >
              <div class="vol-header">
                <span class="vol-numero">{{ vol.numeroVol }}</span>
                <div class="vol-badges">
                  <span class="vol-type" :class="getTypeClass(vol.typeOperation)">
                    {{ formatTypeOperation(vol.typeOperation) }}
                  </span>
                  <span v-if="vol.hasCRV || vol.crv" class="crv-badge">CRV existe</span>
                  <span v-else class="crv-badge available">Disponible</span>
                </div>
              </div>
              <div class="vol-details">
                <div class="vol-info">
                  <span class="label">Compagnie</span>
                  <span class="value">{{ vol.compagnie || vol.compagnieAerienne || '-' }}</span>
                </div>
                <div class="vol-info">
                  <span class="label">Date/Heure</span>
                  <span class="value">{{ formatDateTime(vol.dateVol || vol.date) }}</span>
                </div>
                <div class="vol-info" v-if="vol.escale">
                  <span class="label">Escale</span>
                  <span class="value">{{ vol.escale }}</span>
                </div>
                <div class="vol-info" v-if="sourceType === 'bulletin'">
                  <span class="label">Source</span>
                  <span class="value source-badge">{{ vol.origine || 'BULLETIN' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Aucun vol -->
          <div v-else class="empty-state">
            <p>Aucun vol trouve pour ces criteres</p>
            <button @click="mode = 'hors_programme'" class="btn btn-secondary">
              Creer un vol hors programme
            </button>
          </div>

          <!-- Actions -->
          <div v-if="selectedVol && !selectedVol.hasCRV && !selectedVol.crv" class="actions-section">
            <div class="selected-vol-summary">
              <h3>Vol selectionne</h3>
              <p>
                <strong>{{ selectedVol.numeroVol }}</strong> -
                {{ selectedVol.compagnie || selectedVol.compagnieAerienne }} -
                {{ formatDateTime(selectedVol.dateVol || selectedVol.date) }}
              </p>
            </div>
            <button
              @click="createCRVFromVol"
              :disabled="creating"
              class="btn btn-primary btn-create"
            >
              <span v-if="creating">Creation en cours...</span>
              <span v-else>Creer le CRV</span>
            </button>
          </div>

          <div v-else-if="selectedVol && (selectedVol.hasCRV || selectedVol.crv)" class="warning-box">
            <strong>CRV deja existant</strong>
            <p>Un CRV existe deja pour ce vol. Consultez-le dans "Mes CRV".</p>
          </div>
        </div>

        <!-- ============================================ -->
        <!-- MODE 2: VOL HORS PROGRAMME                  -->
        <!-- ============================================ -->
        <div v-if="mode === 'hors_programme'" class="creation-card">
          <h2>Vol Hors Programme</h2>
          <p class="card-subtitle">Creer un CRV pour un vol non planifie</p>

          <div class="hors-programme-form">
            <!-- Type d'operation -->
            <div class="form-group">
              <label>Type d'operation *</label>
              <div class="type-buttons">
                <button
                  v-for="t in typeOptions"
                  :key="t.value"
                  :class="['type-btn', { selected: horsProgForm.type === t.value }]"
                  @click="horsProgForm.type = t.value"
                >
                  <span class="type-icon">{{ t.icon }}</span>
                  <span class="type-name">{{ t.label }}</span>
                </button>
              </div>
            </div>

            <!-- Informations vol -->
            <div class="form-row">
              <div class="form-group">
                <label>Numero de vol</label>
                <input
                  type="text"
                  v-model="horsProgForm.numeroVol"
                  placeholder="Ex: AF123"
                  @input="horsProgForm.numeroVol = horsProgForm.numeroVol.toUpperCase()"
                />
              </div>
              <div class="form-group">
                <label>Compagnie (Code IATA)</label>
                <input
                  type="text"
                  v-model="horsProgForm.compagnie"
                  placeholder="Ex: AF"
                  maxlength="3"
                  @input="horsProgForm.compagnie = horsProgForm.compagnie.toUpperCase()"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Date et heure du vol *</label>
                <input
                  type="datetime-local"
                  v-model="horsProgForm.dateVol"
                />
              </div>
              <div class="form-group">
                <label>Escale</label>
                <input
                  type="text"
                  v-model="horsProgForm.escale"
                  placeholder="Ex: NDJ"
                  maxlength="4"
                  @input="horsProgForm.escale = horsProgForm.escale.toUpperCase()"
                />
              </div>
            </div>

            <!-- Raison hors programme -->
            <div class="form-group">
              <label>Raison du vol hors programme</label>
              <select v-model="horsProgForm.raison">
                <option value="">Selectionner...</option>
                <option value="CHARTER">Vol charter</option>
                <option value="DEROUTEMENT">Deroutement</option>
                <option value="VOL_SPECIAL">Vol special</option>
                <option value="RETARD_PROGRAMME">Retard sur programme</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <div v-if="horsProgForm.raison === 'AUTRE'" class="form-group">
              <label>Preciser la raison</label>
              <textarea
                v-model="horsProgForm.raisonAutre"
                rows="2"
                placeholder="Decrivez la raison..."
              ></textarea>
            </div>

            <button
              @click="createCRVHorsProgramme"
              :disabled="creating || !horsProgForm.type || !horsProgForm.dateVol"
              class="btn btn-primary btn-create"
            >
              <span v-if="creating">Creation en cours...</span>
              <span v-else>Creer le CRV</span>
            </button>
          </div>
        </div>

        <!-- Message d'erreur -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCRVStore } from '@/stores/crvStore'
import { useBulletinStore } from '@/stores/bulletinStore'
import { programmesVolAPI, bulletinsAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const crvStore = useCRVStore()
const bulletinStore = useBulletinStore()

// Mode: 'planifie' ou 'hors_programme'
const mode = ref('planifie')

// Source pour mode planifie: 'bulletin' ou 'programme'
const sourceType = ref('bulletin')

// Etats
const loading = ref(false)
const creating = ref(false)
const error = ref(null)
const selectedVol = ref(null)

// Listes de vols
const volsList = ref([])

// Filtres
const filters = reactive({
  date: new Date().toISOString().split('T')[0],
  typeOperation: '',
  statutCRV: 'sans_crv' // Par defaut, montrer ceux sans CRV
})

// Options de type
const typeOptions = [
  { value: 'ARRIVEE', label: 'Arrivee', icon: '🛬' },
  { value: 'DEPART', label: 'Depart', icon: '🛫' },
  { value: 'TURN_AROUND', label: 'Turn Around', icon: '🔄' }
]

// Formulaire hors programme
const horsProgForm = reactive({
  type: '',
  numeroVol: '',
  compagnie: '',
  dateVol: new Date().toISOString().slice(0, 16),
  escale: '',
  raison: '',
  raisonAutre: ''
})

// Computed: vols filtres
const filteredVols = computed(() => {
  let result = volsList.value

  if (filters.typeOperation) {
    result = result.filter(v => v.typeOperation === filters.typeOperation)
  }

  if (filters.statutCRV === 'sans_crv') {
    result = result.filter(v => !v.hasCRV && !v.crv)
  } else if (filters.statutCRV === 'avec_crv') {
    result = result.filter(v => v.hasCRV || v.crv)
  }

  return result
})

// Charger les mouvements du bulletin en cours
const loadBulletinMouvements = async () => {
  loading.value = true
  error.value = null
  volsList.value = []
  selectedVol.value = null

  try {
    // Recuperer l'escale de l'utilisateur ou utiliser une valeur par defaut
    const escale = authStore.currentUser?.escale || 'NDJ'

    // Recuperer le bulletin en cours pour cette escale
    const response = await bulletinsAPI.getEnCours(escale)
    const bulletin = response.data?.bulletin || response.data

    if (bulletin && bulletin.mouvements) {
      // Transformer les mouvements en format vol
      volsList.value = bulletin.mouvements.map(m => ({
        id: m._id || m.id,
        _id: m._id || m.id,
        numeroVol: m.numeroVol,
        typeOperation: m.typeOperation,
        compagnie: m.compagnie,
        compagnieAerienne: m.compagnie,
        dateVol: m.date || m.dateVol,
        date: m.date || m.dateVol,
        escale: bulletin.escale,
        origine: m.origine || 'BULLETIN',
        hasCRV: m.crvId ? true : false,
        crv: m.crvId,
        mouvementId: m._id || m.id,
        bulletinId: bulletin._id || bulletin.id
      }))
    }
  } catch (err) {
    console.error('[CRVNouveau] Erreur chargement bulletin:', err)
    // Pas d'erreur affichee si pas de bulletin - c'est normal
    if (err.response?.status !== 404) {
      error.value = 'Erreur lors du chargement du bulletin'
    }
  } finally {
    loading.value = false
  }
}

// Charger les vols du programme actif
const loadProgrammeVols = async () => {
  loading.value = true
  error.value = null
  volsList.value = []
  selectedVol.value = null

  try {
    // Recuperer les programmes actifs
    const response = await programmesVolAPI.getAll({ statut: 'ACTIF', limit: 1 })
    const programmes = response.data?.programmes || response.data || []

    if (programmes.length > 0) {
      const programme = programmes[0]

      // Recuperer les vols du jour selectionne
      const volsResponse = await programmesVolAPI.getVolsParJour(
        programme._id || programme.id,
        filters.date
      )

      const vols = volsResponse.data?.vols || volsResponse.data || []

      volsList.value = vols.map(v => ({
        id: v._id || v.id,
        _id: v._id || v.id,
        numeroVol: v.numeroVol,
        typeOperation: v.typeOperation,
        compagnie: v.compagnie,
        compagnieAerienne: v.compagnie,
        dateVol: v.dateVol || v.date,
        date: v.dateVol || v.date,
        escale: v.escale,
        origine: 'PROGRAMME',
        hasCRV: v.crvId ? true : false,
        crv: v.crvId,
        programmeId: programme._id || programme.id
      }))
    }
  } catch (err) {
    console.error('[CRVNouveau] Erreur chargement programme:', err)
    if (err.response?.status !== 404) {
      error.value = 'Erreur lors du chargement du programme'
    }
  } finally {
    loading.value = false
  }
}

// Filtrer les vols (appele quand les filtres changent)
const filterVols = () => {
  // Le filtrage est fait via computed filteredVols
  // Cette fonction peut etre utilisee pour des actions supplementaires
}

// Selectionner un vol
const selectVol = (vol) => {
  selectedVol.value = vol
}

// Creer CRV depuis un vol planifie
const createCRVFromVol = async () => {
  if (!selectedVol.value || selectedVol.value.hasCRV || selectedVol.value.crv) return

  creating.value = true
  error.value = null

  try {
    const vol = selectedVol.value

    // Creer le CRV avec reference au vol
    const result = await crvStore.createCRV({
      volId: vol.id || vol._id,
      type: vol.typeOperation?.toLowerCase() || 'arrivee',
      mouvementId: vol.mouvementId,
      bulletinId: vol.bulletinId,
      programmeId: vol.programmeId
    })

    // Rediriger vers la page CRV appropriee
    redirectToCRV(vol.typeOperation, result)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Erreur lors de la creation'
  } finally {
    creating.value = false
  }
}

// Creer CRV hors programme
const createCRVHorsProgramme = async () => {
  if (!horsProgForm.type || !horsProgForm.dateVol) return

  creating.value = true
  error.value = null

  try {
    const result = await crvStore.createCRV({
      type: horsProgForm.type.toLowerCase(),
      date: new Date(horsProgForm.dateVol).toISOString(),
      numeroVol: horsProgForm.numeroVol || undefined,
      compagnie: horsProgForm.compagnie || undefined,
      escale: horsProgForm.escale || undefined,
      horseProgramme: true,
      raisonHorsProgramme: horsProgForm.raison === 'AUTRE'
        ? horsProgForm.raisonAutre
        : horsProgForm.raison
    })

    // Rediriger vers la page CRV appropriee
    redirectToCRV(horsProgForm.type, result)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Erreur lors de la creation'
  } finally {
    creating.value = false
  }
}

// Redirection apres creation
const redirectToCRV = (typeOperation, result) => {
  const type = (typeOperation || '').toUpperCase().replace('_', '')
  let route = '/crv/arrivee'

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

  const crvId = result.id || result._id || result.crv?.id || result.crv?._id
  router.push({
    path: route,
    query: { id: crvId }
  })
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

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTypeClass = (type) => {
  return {
    'type-arrivee': type === 'ARRIVEE',
    'type-depart': type === 'DEPART',
    'type-turnaround': type === 'TURN_AROUND'
  }
}

// Charger au montage
onMounted(() => {
  if (mode.value === 'planifie') {
    loadBulletinMouvements()
  }
})

// Watcher pour changement de mode
watch(mode, (newMode) => {
  if (newMode === 'planifie') {
    if (sourceType.value === 'bulletin') {
      loadBulletinMouvements()
    } else {
      loadProgrammeVols()
    }
  }
})
</script>

<style scoped>
.crv-nouveau-container {
  min-height: calc(100vh - 64px);
  background: #f9fafb;
}

.crv-main {
  padding: 24px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header-bar {
  margin-bottom: 24px;
}

.page-header-bar h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.subtitle,
.card-subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.container {
  max-width: 900px;
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
  padding: 24px 20px;
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
  font-size: 36px;
  margin-bottom: 12px;
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
  text-align: center;
}

/* Cards */
.selection-card,
.creation-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.selection-card h2,
.creation-card h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

/* Source Tabs */
.source-tabs {
  display: flex;
  gap: 8px;
  margin: 20px 0;
  padding: 4px;
  background: #f3f4f6;
  border-radius: 8px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #374151;
}

.tab-btn.active {
  background: white;
  color: #2563eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Filtres */
.filters-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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

/* Liste des vols */
.vols-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.vol-card {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
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

.vol-card.has-crv {
  opacity: 0.6;
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

.vol-badges {
  display: flex;
  gap: 8px;
}

.vol-type {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.type-arrivee {
  background: #dcfce7;
  color: #166534;
}

.type-depart {
  background: #dbeafe;
  color: #1e40af;
}

.type-turnaround {
  background: #fef3c7;
  color: #92400e;
}

.crv-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #fee2e2;
  color: #991b1b;
}

.crv-badge.available {
  background: #d1fae5;
  color: #065f46;
}

.vol-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.vol-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vol-info .label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
}

.vol-info .value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.source-badge {
  font-size: 11px;
  padding: 2px 6px;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 4px;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.empty-state .btn {
  margin-top: 16px;
}

/* Actions */
.actions-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-vol-summary h3 {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.selected-vol-summary p {
  font-size: 15px;
  color: #1f2937;
  margin: 0;
}

/* Warning box */
.warning-box {
  margin-top: 20px;
  padding: 16px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
}

.warning-box strong {
  color: #92400e;
  display: block;
  margin-bottom: 4px;
}

.warning-box p {
  color: #92400e;
  margin: 0;
  font-size: 14px;
}

/* Formulaire hors programme */
.hors-programme-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
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
.form-group select,
.form-group textarea {
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
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
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: white;
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
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-create {
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
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

/* Responsive */
@media (max-width: 640px) {
  .mode-selector {
    grid-template-columns: 1fr;
  }

  .type-buttons {
    grid-template-columns: 1fr;
  }

  .filter-row {
    grid-template-columns: 1fr;
  }

  .actions-section {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
