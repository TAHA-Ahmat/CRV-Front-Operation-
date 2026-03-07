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
              @click="sourceType = 'bulletin'; volsList = []; selectedVol = null"
            >
              Bulletin de Mouvement
            </button>
            <button
              :class="['tab-btn', { active: sourceType === 'programme' }]"
              @click="sourceType = 'programme'; volsList = []; selectedVol = null"
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
                  @change="onDateChange"
                />
              </div>
              <div class="filter-group">
                <label>Escale</label>
                <select v-model="filters.escale" :disabled="escalesDisponibles.length === 0">
                  <option value="" disabled>
                    {{ loadingEscales ? 'Chargement...' : (escalesDisponibles.length === 0 ? 'Aucune escale' : 'Selectionner') }}
                  </option>
                  <option v-for="esc in escalesDisponibles" :key="esc" :value="esc">
                    {{ esc }}
                  </option>
                </select>
              </div>
              <div class="filter-group">
                <label>Type d'operation</label>
                <select v-model="filters.typeOperation">
                  <option value="">Tous</option>
                  <option value="ARRIVEE">Arrivee</option>
                  <option value="DEPART">Depart</option>
                  <option value="TURN_AROUND">Turn Around</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Statut CRV</label>
                <select v-model="filters.statutCRV">
                  <option value="">Tous</option>
                  <option value="sans_crv">Sans CRV</option>
                  <option value="avec_crv">Avec CRV</option>
                </select>
              </div>
            </div>
            <div class="filter-actions">
              <button
                class="btn btn-primary btn-search"
                :disabled="!filters.escale || loading"
                @click="rechercher"
              >
                <span v-if="loading">Chargement...</span>
                <span v-else>Rechercher</span>
              </button>
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
        <!-- MODE 2: VOL HORS PROGRAMME (PATH 2)         -->
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
                  :class="['type-btn', { selected: horsProgForm.typeOperation === t.value }]"
                  @click="horsProgForm.typeOperation = t.value"
                >
                  <span class="type-icon">{{ t.icon }}</span>
                  <span class="type-name">{{ t.label }}</span>
                </button>
              </div>
            </div>

            <!-- Informations vol -->
            <div class="form-row">
              <div class="form-group">
                <label>Numero de vol *</label>
                <input
                  type="text"
                  v-model="horsProgForm.numeroVol"
                  placeholder="Ex: AH1234"
                  @input="horsProgForm.numeroVol = horsProgForm.numeroVol.toUpperCase()"
                />
              </div>
              <div class="form-group">
                <label>Compagnie aerienne *</label>
                <input
                  type="text"
                  v-model="horsProgForm.compagnieAerienne"
                  placeholder="Ex: Air Algerie"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Code IATA *</label>
                <input
                  type="text"
                  v-model="horsProgForm.codeIATA"
                  placeholder="Ex: AH"
                  maxlength="2"
                  @input="horsProgForm.codeIATA = horsProgForm.codeIATA.toUpperCase()"
                />
              </div>
              <div class="form-group">
                <label>Date du vol *</label>
                <input
                  type="datetime-local"
                  v-model="horsProgForm.dateVol"
                />
              </div>
            </div>

            <!-- Aeroports conditionnels -->
            <div class="form-row" v-if="horsProgForm.typeOperation === 'ARRIVEE' || horsProgForm.typeOperation === 'TURN_AROUND'">
              <div class="form-group">
                <label>Aeroport d'origine *</label>
                <input
                  type="text"
                  v-model="horsProgForm.aeroportOrigine"
                  placeholder="Ex: ALG"
                  maxlength="4"
                  @input="horsProgForm.aeroportOrigine = horsProgForm.aeroportOrigine.toUpperCase()"
                />
              </div>
            </div>
            <div class="form-row" v-if="horsProgForm.typeOperation === 'DEPART' || horsProgForm.typeOperation === 'TURN_AROUND'">
              <div class="form-group">
                <label>Aeroport de destination *</label>
                <input
                  type="text"
                  v-model="horsProgForm.aeroportDestination"
                  placeholder="Ex: TLS"
                  maxlength="4"
                  @input="horsProgForm.aeroportDestination = horsProgForm.aeroportDestination.toUpperCase()"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Type de vol hors programme *</label>
                <select v-model="horsProgForm.typeVolHorsProgramme">
                  <option value="">Selectionner...</option>
                  <option v-for="opt in typeVolHPOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Escale</label>
                <input
                  type="text"
                  v-model="horsProgForm.escale"
                  placeholder="Ex: TLS"
                  maxlength="4"
                  @input="horsProgForm.escale = horsProgForm.escale.toUpperCase()"
                />
              </div>
            </div>

            <!-- Raison hors programme -->
            <div class="form-group">
              <label>Raison du vol hors programme *</label>
              <textarea
                v-model="horsProgForm.raisonHorsProgramme"
                rows="2"
                placeholder="Decrivez la raison (ex: Vol charter ponctuel)..."
              ></textarea>
            </div>

            <button
              @click="createCRVHorsProgramme"
              :disabled="creating || !isHorsProgValid"
              class="btn btn-primary btn-create"
            >
              <span v-if="creating">Creation en cours...</span>
              <span v-else>Creer le CRV</span>
            </button>
          </div>
        </div>

        <!-- Lien creation exceptionnelle (PATH LEGACY) -->
        <div class="legacy-link">
          <button class="btn-legacy" @click="showLegacyModal = true">
            &#9888;&#65039; Creation exceptionnelle (sans vol associe)
          </button>
        </div>

        <!-- Message d'erreur -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </main>

    <!-- Modale doublon -->
    <ConfirmationDoublonModal
      :visible="showDoublonModal"
      :crv-existant-id="doublonInfo.crvExistantId"
      :numero-c-r-v="doublonInfo.numeroCRV"
      @confirm="onDoublonConfirm"
      @cancel="showDoublonModal = false"
    />

    <!-- Modale creation exceptionnelle -->
    <CreationLegacyModal
      :visible="showLegacyModal"
      :creating="creating"
      @submit="createCRVLegacy"
      @cancel="showLegacyModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCRVStore } from '@/stores/crvStore'
import { useBulletinStore } from '@/stores/bulletinStore'
import { programmesVolAPI, bulletinsAPI } from '@/services/api'
import { TYPE_VOL_HORS_PROGRAMME, TYPE_VOL_HORS_PROGRAMME_LABELS, getEnumOptions } from '@/config/crvEnums'
import ConfirmationDoublonModal from '@/components/crv/ConfirmationDoublonModal.vue'
import CreationLegacyModal from '@/components/crv/CreationLegacyModal.vue'

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

// Modales
const showDoublonModal = ref(false)
const showLegacyModal = ref(false)
const doublonInfo = reactive({
  crvExistantId: '',
  numeroCRV: '',
  originalPayload: null
})

// Listes de vols
const volsList = ref([])

// Escales disponibles (alimentees par GET /api/bulletins/escales-actives)
const escalesDisponibles = ref([])
const loadingEscales = ref(false)

// Filtres
const filters = reactive({
  date: new Date().toISOString().split('T')[0],
  escale: '',
  typeOperation: '',
  statutCRV: 'sans_crv' // Par defaut, montrer ceux sans CRV
})

// Options de type
const typeOptions = [
  { value: 'ARRIVEE', label: 'Arrivee', icon: '🛬' },
  { value: 'DEPART', label: 'Depart', icon: '🛫' },
  { value: 'TURN_AROUND', label: 'Turn Around', icon: '🔄' }
]

// Options type vol hors programme (depuis enums contrat v2)
const typeVolHPOptions = getEnumOptions(TYPE_VOL_HORS_PROGRAMME)

// Formulaire hors programme — conforme contrat v2 PATH 2
const horsProgForm = reactive({
  typeOperation: '',
  numeroVol: '',
  compagnieAerienne: '',
  codeIATA: '',
  dateVol: new Date().toISOString().slice(0, 16),
  aeroportOrigine: '',
  aeroportDestination: '',
  typeVolHorsProgramme: '',
  raisonHorsProgramme: '',
  escale: ''
})

// Validation formulaire hors programme
const isHorsProgValid = computed(() => {
  if (!horsProgForm.typeOperation || !horsProgForm.numeroVol || !horsProgForm.compagnieAerienne) return false
  if (!horsProgForm.codeIATA || !horsProgForm.dateVol) return false
  if (!horsProgForm.typeVolHorsProgramme || !horsProgForm.raisonHorsProgramme) return false
  // Validation conditionnelle aeroports
  if ((horsProgForm.typeOperation === 'ARRIVEE' || horsProgForm.typeOperation === 'TURN_AROUND') && !horsProgForm.aeroportOrigine) return false
  if ((horsProgForm.typeOperation === 'DEPART' || horsProgForm.typeOperation === 'TURN_AROUND') && !horsProgForm.aeroportDestination) return false
  return true
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

// ============================================
// CHARGEMENT DES ESCALES DISPONIBLES PAR DATE
// ============================================

/**
 * Quand la date change :
 * GET /api/bulletins/escales-actives?date=YYYY-MM-DD
 * Reponse : { success, escales: ["NDJ", "DSS"], date }
 */
const onDateChange = async () => {
  escalesDisponibles.value = []
  filters.escale = ''
  volsList.value = []
  selectedVol.value = null
  error.value = null

  if (!filters.date) return

  loadingEscales.value = true
  try {
    const response = await bulletinsAPI.getEscalesActives(filters.date)
    const escales = response.data?.escales || []

    console.log('[CRVNouveau] Escales actives:', escales, 'pour', filters.date)

    if (escales.length === 0) {
      error.value = `Aucun bulletin publie ne couvre le ${new Date(filters.date + 'T00:00:00').toLocaleDateString('fr-FR')}`
      return
    }

    escalesDisponibles.value = escales

    // Si une seule escale, la pre-selectionner
    if (escales.length === 1) {
      filters.escale = escales[0]
    }
  } catch (err) {
    console.error('[CRVNouveau] Erreur chargement escales:', err)
    if (err.response?.status === 400) {
      error.value = err.response.data?.message || 'Date invalide'
    } else {
      error.value = 'Erreur lors de la recherche des escales actives'
    }
  } finally {
    loadingEscales.value = false
  }
}

// ============================================
// CHARGEMENT DES MOUVEMENTS DU BULLETIN
// ============================================

const loadBulletinMouvements = async () => {
  loading.value = true
  error.value = null
  volsList.value = []
  selectedVol.value = null

  try {
    const escale = filters.escale
    if (!escale) {
      error.value = 'Veuillez selectionner une escale'
      loading.value = false
      return
    }

    // GET /api/bulletins/en-cours/:escale
    // Reponse : { success: true, data: { _id, escale, mouvements: [...] } }
    const response = await bulletinsAPI.getEnCours(escale)
    const bulletin = response.data?.data

    if (!bulletin || !Array.isArray(bulletin.mouvements)) {
      throw new Error('Bulletin invalide ou mouvements absents')
    }

    console.log('[CRVNouveau] Bulletin charge', {
      id: bulletin._id,
      escale: bulletin.escale,
      statut: bulletin.statut,
      nbMouvements: bulletin.mouvements.length,
      nbSansCRV: bulletin.mouvements.filter(m => !m.crvId).length
    })

    if (bulletin.mouvements.length > 0) {
      volsList.value = bulletin.mouvements.map(m => ({
        id: m._id,
        _id: m._id,
        numeroVol: m.numeroVol,
        typeOperation: m.typeOperation,
        compagnie: m.compagnie || m.codeCompagnie,
        compagnieAerienne: m.compagnie || m.codeCompagnie,
        dateVol: m.dateMouvement || m.date || m.dateVol,
        date: m.dateMouvement || m.date || m.dateVol,
        escale: bulletin.escale,
        origine: m.origine || 'BULLETIN',
        hasCRV: !!m.crvId,
        crv: m.crvId,
        mouvementId: m._id,
        bulletinId: bulletin._id
      }))
      console.log('[CRVNouveau] Vols mappes:', volsList.value.length, 'dont sans CRV:', volsList.value.filter(v => !v.hasCRV).length)
    } else {
      error.value = `Bulletin trouve pour ${escale} mais il ne contient aucun mouvement.`
    }
  } catch (err) {
    console.error('[CRVNouveau] Erreur chargement bulletin:', err)
    if (err.response?.status === 404) {
      error.value = `Aucun bulletin en cours pour "${filters.escale}". Verifiez qu'il est publie.`
    } else if (err.message?.includes('Bulletin invalide')) {
      error.value = `Reponse inattendue du serveur pour "${filters.escale}".`
    } else {
      error.value = err.response?.data?.message || 'Erreur lors du chargement du bulletin'
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
    // Recuperer le programme actif
    let programme = null
    try {
      const actifResponse = await programmesVolAPI.getActif()
      programme = actifResponse.data?.programme || actifResponse.data
    } catch (e) {
      // Fallback : chercher le premier programme actif
      const response = await programmesVolAPI.getAll({ statut: 'ACTIF', limit: 1 })
      const programmes = response.data?.programmes || response.data || []
      if (programmes.length > 0) programme = programmes[0]
    }

    if (programme) {
      const programmeId = programme._id || programme.id

      // Convertir la date selectionnee en numero de jour (0=Dim...6=Sam)
      const selectedDate = new Date(filters.date + 'T00:00:00')
      const jourSemaine = selectedDate.getDay()

      // Recuperer les vols du jour de la semaine correspondant
      const volsResponse = await programmesVolAPI.getVolsParJour(
        programmeId,
        jourSemaine
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
        volId: v._id || v.id
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

// Selectionner un vol
const selectVol = (vol) => {
  selectedVol.value = vol
}

// ============================================
// CREATION CRV — SEPARATION STRICTE DES PATHs
// ============================================

/**
 * Gestion commune du resultat de creation :
 * - Si doublon detecte (409) → ouvre la modale doublon
 * - Si succes → redirige vers la page CRV
 */
const handleCreateResult = (result, typeOperation) => {
  if (result && result.doublon) {
    // 409 CRV_DOUBLON — ouvrir la modale de confirmation
    doublonInfo.crvExistantId = result.crvExistantId || ''
    doublonInfo.numeroCRV = result.numeroCRV || ''
    doublonInfo.originalPayload = result.originalPayload
    showDoublonModal.value = true
    return
  }

  // Succes — rediriger
  redirectToCRV(typeOperation, result)
}

/**
 * PATH 1 (bulletin) ou PATH 3 (vol existant)
 * Determinisme par la presence de bulletinId+mouvementId
 */
const createCRVFromVol = async () => {
  if (!selectedVol.value || selectedVol.value.hasCRV || selectedVol.value.crv) return

  creating.value = true
  error.value = null

  try {
    const vol = selectedVol.value
    let payload

    if (vol.bulletinId && vol.mouvementId) {
      // PATH 1 — Depuis bulletin de mouvement
      payload = {
        bulletinId: vol.bulletinId,
        mouvementId: vol.mouvementId
      }
      if (vol.escale) payload.escale = vol.escale
    } else {
      // PATH 3 — Vol existant (backward compat)
      payload = {
        volId: vol.volId || vol.id || vol._id
      }
      if (vol.escale) payload.escale = vol.escale
    }

    const result = await crvStore.createCRV(payload)
    handleCreateResult(result, vol.typeOperation)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Erreur lors de la creation'
  } finally {
    creating.value = false
  }
}

/**
 * PATH 2 — Vol hors programme
 * Payload conforme contrat v2 : { vol: { ... }, escale? }
 */
const createCRVHorsProgramme = async () => {
  if (!isHorsProgValid.value) return

  creating.value = true
  error.value = null

  try {
    const volData = {
      numeroVol: horsProgForm.numeroVol,
      compagnieAerienne: horsProgForm.compagnieAerienne,
      codeIATA: horsProgForm.codeIATA,
      dateVol: new Date(horsProgForm.dateVol).toISOString(),
      typeOperation: horsProgForm.typeOperation,
      typeVolHorsProgramme: horsProgForm.typeVolHorsProgramme,
      raisonHorsProgramme: horsProgForm.raisonHorsProgramme
    }

    // Aeroports conditionnels
    if (horsProgForm.typeOperation === 'ARRIVEE' || horsProgForm.typeOperation === 'TURN_AROUND') {
      volData.aeroportOrigine = horsProgForm.aeroportOrigine
    }
    if (horsProgForm.typeOperation === 'DEPART' || horsProgForm.typeOperation === 'TURN_AROUND') {
      volData.aeroportDestination = horsProgForm.aeroportDestination
    }

    const payload = { vol: volData }
    if (horsProgForm.escale) payload.escale = horsProgForm.escale

    const result = await crvStore.createCRV(payload)
    handleCreateResult(result, horsProgForm.typeOperation)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Erreur lors de la creation'
  } finally {
    creating.value = false
  }
}

/**
 * PATH LEGACY — Creation exceptionnelle via modale
 * Payload : { type, date?, escale? } strictement
 */
const createCRVLegacy = async (legacyPayload) => {
  creating.value = true
  error.value = null

  try {
    const result = await crvStore.createCRV(legacyPayload)
    showLegacyModal.value = false

    // PATH LEGACY : typeOperation deduit par le backend, utiliser le type envoye
    const typeOp = (legacyPayload.type || 'depart').toUpperCase()
    handleCreateResult(result, typeOp)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Erreur lors de la creation'
  } finally {
    creating.value = false
  }
}

/**
 * Confirmation doublon — retry avec forceDoublon + confirmationLevel=2
 */
const onDoublonConfirm = async () => {
  showDoublonModal.value = false
  if (!doublonInfo.originalPayload) return

  creating.value = true
  error.value = null

  try {
    const result = await crvStore.createCRVForceDoublon(doublonInfo.originalPayload)
    // Determiner le typeOperation pour la redirection
    const typeOp = doublonInfo.originalPayload.vol?.typeOperation
      || selectedVol.value?.typeOperation
      || horsProgForm.typeOperation
      || 'DEPART'
    handleCreateResult(result, typeOp)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Erreur lors de la creation du doublon'
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

// Charger les escales au montage (date du jour par defaut)
onMounted(() => {
  onDateChange()
})

// Rechercher : action explicite de l'agent
const rechercher = () => {
  if (sourceType.value === 'bulletin') {
    loadBulletinMouvements()
  } else {
    loadProgrammeVols()
  }
}
</script>

<style scoped>
.crv-nouveau-container {
  min-height: calc(100vh - 64px);
  background: var(--bg-body);
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
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.subtitle,
.card-subtitle {
  color: var(--text-secondary);
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
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: #93c5fd;
  background: var(--bg-card-hover);
}

.mode-btn.active {
  border-color: #2563eb;
  background: var(--color-info-bg);
}

.mode-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.mode-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.mode-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
  text-align: center;
}

/* Cards */
.selection-card,
.creation-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
}

.selection-card h2,
.creation-card h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

/* Source Tabs */
.source-tabs {
  display: flex;
  gap: 8px;
  margin: 20px 0;
  padding: 4px;
  background: var(--bg-table-header);
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
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--bg-card);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

/* Filtres */
.filters-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
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
  color: var(--text-secondary);
}

.filter-group input,
.filter-group select {
  padding: 10px 12px;
  border: 1px solid var(--border-input);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-input);
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Filter actions */
.filter-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.btn-search {
  padding: 10px 28px;
  font-size: 14px;
  font-weight: 600;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--color-primary);
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
  border: 2px solid var(--border-color);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-card);
}

.vol-card:hover {
  border-color: #93c5fd;
  background: var(--bg-card-hover);
}

.vol-card.selected {
  border-color: var(--color-primary);
  background: var(--color-info-bg);
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
  color: var(--text-primary);
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

/* Legacy link */
.legacy-link {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px dashed var(--border-color, #e5e7eb);
}

.btn-legacy {
  background: none;
  border: 1px dashed #d97706;
  color: #92400e;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-legacy:hover {
  background: #fef3c7;
  border-color: #f59e0b;
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
