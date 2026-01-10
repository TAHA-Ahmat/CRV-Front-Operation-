<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Validation CRV</h1>
      <p class="text-gray-600 mt-1">CRV en attente de validation</p>
    </div>

    <!-- Filtres -->
    <div class="card mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select v-model="filters.statut" @change="loadCRVList" class="input w-full">
            <option value="TERMINE">Terminé (en attente validation)</option>
            <option value="VALIDE">Validé (en attente verrouillage)</option>
            <option value="VERROUILLE">Verrouillé</option>
            <option value="">Tous</option>
          </select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
          <input
            v-model="filters.search"
            @input="debounceSearch"
            type="text"
            placeholder="N° CRV, vol, compagnie..."
            class="input w-full"
          />
        </div>
        <button @click="loadCRVList" class="btn btn-secondary">
          Actualiser
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Liste CRV -->
    <div v-else-if="crvList.length > 0" class="space-y-4">
      <div
        v-for="crv in crvList"
        :key="crv.id || crv._id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="selectCRV(crv)"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="font-bold text-lg">{{ crv.numeroCRV }}</span>
              <span :class="getStatutClass(crv.statut)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ getStatutLabel(crv.statut) }}
              </span>
              <span v-if="crv.completude !== undefined" class="text-sm text-gray-500">
                Complétude: {{ crv.completude }}%
              </span>
            </div>
            <div class="text-gray-600 text-sm">
              <span v-if="crv.vol">{{ crv.vol.numeroVol }} - {{ crv.vol.compagnieAerienne }}</span>
              <span v-if="crv.vol?.typeOperation" class="ml-2 text-gray-400">
                ({{ getTypeOperationLabel(crv.vol.typeOperation) }})
              </span>
            </div>
            <div class="text-gray-500 text-xs mt-1">
              {{ formatDate(crv.createdAt) }}
            </div>
          </div>
          <div class="flex gap-2">
            <!-- Actions rapides selon statut -->
            <template v-if="crv.statut === 'TERMINE'">
              <button
                v-if="canValidate"
                @click.stop="openValidateModal(crv)"
                class="btn btn-sm btn-success"
                :disabled="crv.completude < 80"
                :title="crv.completude < 80 ? 'Complétude insuffisante (minimum 80%)' : 'Approuver ce CRV'"
              >
                Valider
              </button>
              <button
                v-if="canReject"
                @click.stop="openRejectModal(crv)"
                class="btn btn-sm btn-warning"
                title="Renvoyer pour correction"
              >
                Rejeter
              </button>
            </template>
            <template v-else-if="crv.statut === 'VALIDE'">
              <button
                v-if="canLock"
                @click.stop="handleLock(crv)"
                class="btn btn-sm btn-primary"
                title="Finaliser ce CRV (aucune modification possible après)"
              >
                Verrouiller
              </button>
            </template>
            <template v-else-if="crv.statut === 'VERROUILLE'">
              <button
                v-if="canUnlock"
                @click.stop="openUnlockModal(crv)"
                class="btn btn-sm btn-danger"
                title="Opération exceptionnelle: déverrouiller ce CRV"
              >
                Déverrouiller
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-6">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="btn btn-sm btn-secondary"
        >
          Précédent
        </button>
        <span class="px-4 py-2 text-gray-600">
          Page {{ pagination.page }} / {{ pagination.pages }}
        </span>
        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.pages"
          class="btn btn-sm btn-secondary"
        >
          Suivant
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="card text-center py-12">
      <div class="text-gray-400 text-6xl mb-4">📋</div>
      <h3 class="text-lg font-medium text-gray-700">Aucun CRV en attente</h3>
      <p class="text-gray-500 mt-1">
        {{ filters.statut === 'TERMINE'
          ? 'Aucun CRV terminé en attente de validation'
          : 'Aucun CRV correspondant aux critères'
        }}
      </p>
    </div>

    <!-- Modal Détail CRV -->
    <div v-if="selectedCRV" class="modal-overlay" @click.self="closeCRVDetail">
      <div class="modal-content max-w-4xl">
        <div class="modal-header">
          <h2 class="text-xl font-bold">{{ selectedCRV.numeroCRV }}</h2>
          <button @click="closeCRVDetail" class="text-gray-400 hover:text-gray-600">
            <span class="text-2xl">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <!-- Résumé CRV -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span class="text-gray-500 text-sm">Statut</span>
              <div :class="getStatutClass(selectedCRV.statut)" class="inline-block px-3 py-1 rounded-full text-sm font-medium mt-1">
                {{ getStatutLabel(selectedCRV.statut) }}
              </div>
            </div>
            <div>
              <span class="text-gray-500 text-sm">Complétude</span>
              <div class="text-lg font-bold" :class="selectedCRV.completude >= 80 ? 'text-green-600' : 'text-orange-500'">
                {{ selectedCRV.completude }}%
              </div>
            </div>
            <div v-if="selectedCRV.vol">
              <span class="text-gray-500 text-sm">Vol</span>
              <div class="font-medium">{{ selectedCRV.vol.numeroVol }} - {{ selectedCRV.vol.compagnieAerienne }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm">Type</span>
              <div class="font-medium">{{ getTypeOperationLabel(selectedCRV.vol?.typeOperation) }}</div>
            </div>
          </div>

          <!-- Historique actions -->
          <div v-if="validationStatus?.historique?.length" class="mb-6">
            <h3 class="font-medium text-gray-700 mb-2">Historique des actions</h3>
            <div class="border rounded-lg divide-y">
              <div v-for="(action, idx) in validationStatus.historique" :key="idx" class="p-3 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium">{{ action.action }}</span>
                  <span class="text-gray-500">{{ formatDate(action.date) }}</span>
                </div>
                <div v-if="action.commentaires" class="text-gray-600 mt-1">{{ action.commentaires }}</div>
                <div class="text-gray-400 text-xs mt-1">Par: {{ action.utilisateur }}</div>
              </div>
            </div>
          </div>

          <!-- Actions disponibles -->
          <div class="flex gap-3 justify-end">
            <template v-if="selectedCRV.statut === 'TERMINE'">
              <button
                v-if="canValidate"
                @click="openValidateModal(selectedCRV)"
                class="btn btn-success"
                :disabled="selectedCRV.completude < 80"
              >
                Valider
              </button>
              <button
                v-if="canReject"
                @click="openRejectModal(selectedCRV)"
                class="btn btn-warning"
              >
                Rejeter
              </button>
            </template>
            <template v-else-if="selectedCRV.statut === 'VALIDE'">
              <button
                v-if="canLock"
                @click="handleLock(selectedCRV)"
                class="btn btn-primary"
              >
                Verrouiller
              </button>
            </template>
            <template v-else-if="selectedCRV.statut === 'VERROUILLE'">
              <button
                v-if="canUnlock"
                @click="openUnlockModal(selectedCRV)"
                class="btn btn-danger"
              >
                Déverrouiller
              </button>
            </template>
            <button @click="closeCRVDetail" class="btn btn-secondary">Fermer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Validation -->
    <div v-if="showValidateModal" class="modal-overlay" @click.self="closeValidateModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="text-xl font-bold">Valider le CRV</h2>
          <button @click="closeValidateModal" class="text-gray-400 hover:text-gray-600">
            <span class="text-2xl">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="text-gray-600 mb-4">
            Vous êtes sur le point de valider le CRV <strong>{{ crvToAction?.numeroCRV }}</strong>.
          </p>
          <p class="text-sm text-gray-500 mb-4">
            Ce CRV sera marqué comme validé et prêt pour verrouillage.
          </p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Commentaires (optionnel)</label>
            <textarea
              v-model="actionComment"
              class="input w-full"
              rows="3"
              placeholder="Commentaires de validation..."
            ></textarea>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="closeValidateModal" class="btn btn-secondary">Annuler</button>
            <button @click="handleValidate" class="btn btn-success" :disabled="saving">
              {{ saving ? 'Validation...' : 'Confirmer la validation' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Rejet -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="text-xl font-bold">Rejeter le CRV</h2>
          <button @click="closeRejectModal" class="text-gray-400 hover:text-gray-600">
            <span class="text-2xl">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="text-gray-600 mb-4">
            Vous êtes sur le point de rejeter le CRV <strong>{{ crvToAction?.numeroCRV }}</strong>.
          </p>
          <p class="text-sm text-gray-500 mb-4">
            Raison du rejet (obligatoire) - Le CRV retournera en cours pour correction.
          </p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Indiquez les éléments à corriger <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="actionComment"
              class="input w-full"
              rows="4"
              placeholder="Décrivez les corrections à apporter..."
              required
            ></textarea>
            <p v-if="rejectError" class="text-red-500 text-sm mt-1">{{ rejectError }}</p>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="closeRejectModal" class="btn btn-secondary">Annuler</button>
            <button @click="handleReject" class="btn btn-warning" :disabled="saving || !actionComment.trim()">
              {{ saving ? 'Rejet...' : 'Confirmer le rejet' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Déverrouillage -->
    <div v-if="showUnlockModal" class="modal-overlay" @click.self="closeUnlockModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="text-xl font-bold text-red-600">Déverrouiller le CRV</h2>
          <button @click="closeUnlockModal" class="text-gray-400 hover:text-gray-600">
            <span class="text-2xl">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p class="text-red-700 font-medium">Opération exceptionnelle</p>
            <p class="text-red-600 text-sm mt-1">
              Le déverrouillage d'un CRV est une opération sensible réservée aux administrateurs.
              Cette action sera enregistrée dans l'historique d'audit.
            </p>
          </div>
          <p class="text-gray-600 mb-4">
            CRV concerné: <strong>{{ crvToAction?.numeroCRV }}</strong>
          </p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Justification pour l'audit <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="actionComment"
              class="input w-full"
              rows="4"
              placeholder="Raison du déverrouillage (sera conservée pour l'audit)..."
              required
            ></textarea>
            <p v-if="unlockError" class="text-red-500 text-sm mt-1">{{ unlockError }}</p>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="closeUnlockModal" class="btn btn-secondary">Annuler</button>
            <button @click="handleUnlock" class="btn btn-danger" :disabled="saving || !actionComment.trim()">
              {{ saving ? 'Déverrouillage...' : 'Confirmer le déverrouillage' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast notifications -->
    <div v-if="toast.show" :class="toastClass" class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
/**
 * ValidationCRV.vue - Page de validation des CRV
 *
 * CONFORME À: docs/process/MVS-10-Validation/FRONT-CORRECTIONS.md
 *
 * Permissions (MVS-10):
 * - Valider CRV: QUALITE, ADMIN uniquement (prérequis: complétude >= 80%)
 * - Rejeter CRV: QUALITE, ADMIN uniquement (commentaire obligatoire)
 * - Verrouiller CRV: QUALITE, ADMIN uniquement (prérequis: statut VALIDE)
 * - Déverrouiller CRV: ADMIN uniquement (raison obligatoire)
 */

import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { crvAPI, validationAPI } from '@/services/api'
import { canValidateCRV, canRejectCRV, canLockCRV, canUnlockCRV } from '@/utils/permissions'
import { STATUT_CRV_LABELS, TYPE_OPERATION_LABELS } from '@/config/crvEnums'

// Stores
const authStore = useAuthStore()

// State
const loading = ref(false)
const saving = ref(false)
const crvList = ref([])
const selectedCRV = ref(null)
const validationStatus = ref(null)
const pagination = ref({ page: 1, pages: 1, total: 0 })

// Filtres
const filters = ref({
  statut: 'TERMINE',
  search: ''
})

// Modals
const showValidateModal = ref(false)
const showRejectModal = ref(false)
const showUnlockModal = ref(false)
const crvToAction = ref(null)
const actionComment = ref('')
const rejectError = ref('')
const unlockError = ref('')

// Toast
const toast = ref({ show: false, message: '', type: 'success' })

// Computed
const userRole = computed(() => authStore.user?.fonction || authStore.user?.role)
const canValidate = computed(() => canValidateCRV(userRole.value))
const canReject = computed(() => canRejectCRV(userRole.value))
const canLock = computed(() => canLockCRV(userRole.value))
const canUnlock = computed(() => canUnlockCRV(userRole.value))

const toastClass = computed(() => ({
  'bg-green-500 text-white': toast.value.type === 'success',
  'bg-red-500 text-white': toast.value.type === 'error',
  'bg-orange-500 text-white': toast.value.type === 'warning'
}))

// Methods
function getStatutLabel(statut) {
  return STATUT_CRV_LABELS[statut] || statut
}

function getTypeOperationLabel(type) {
  return TYPE_OPERATION_LABELS[type] || type || '-'
}

function getStatutClass(statut) {
  const classes = {
    'TERMINE': 'bg-blue-100 text-blue-800',
    'VALIDE': 'bg-green-100 text-green-800',
    'VERROUILLE': 'bg-gray-100 text-gray-800',
    'EN_COURS': 'bg-yellow-100 text-yellow-800',
    'BROUILLON': 'bg-gray-100 text-gray-600',
    'ANNULE': 'bg-red-100 text-red-800'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800'
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

let searchTimeout = null
function debounceSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadCRVList()
  }, 300)
}

async function loadCRVList() {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: 20
    }
    if (filters.value.statut) {
      params.statut = filters.value.statut
    }
    if (filters.value.search) {
      params.search = filters.value.search
    }

    const response = await crvAPI.getAll(params)
    const data = response.data.data || response.data
    crvList.value = Array.isArray(data) ? data : (data.data || [])
    pagination.value = {
      page: data.page || data.pagination?.page || 1,
      pages: data.pages || data.pagination?.pages || 1,
      total: data.total || data.pagination?.total || 0
    }
  } catch (error) {
    console.error('[ValidationCRV] Erreur chargement:', error)
    showToast('Erreur lors du chargement des CRV', 'error')
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.pages) {
    pagination.value.page = page
    loadCRVList()
  }
}

async function selectCRV(crv) {
  selectedCRV.value = crv
  try {
    const response = await validationAPI.getStatus(crv.id || crv._id)
    validationStatus.value = response.data.data || response.data
  } catch (error) {
    console.error('[ValidationCRV] Erreur récupération statut:', error)
    validationStatus.value = null
  }
}

function closeCRVDetail() {
  selectedCRV.value = null
  validationStatus.value = null
}

// Modal handlers
function openValidateModal(crv) {
  crvToAction.value = crv
  actionComment.value = ''
  showValidateModal.value = true
}

function closeValidateModal() {
  showValidateModal.value = false
  crvToAction.value = null
  actionComment.value = ''
}

function openRejectModal(crv) {
  crvToAction.value = crv
  actionComment.value = ''
  rejectError.value = ''
  showRejectModal.value = true
}

function closeRejectModal() {
  showRejectModal.value = false
  crvToAction.value = null
  actionComment.value = ''
  rejectError.value = ''
}

function openUnlockModal(crv) {
  crvToAction.value = crv
  actionComment.value = ''
  unlockError.value = ''
  showUnlockModal.value = true
}

function closeUnlockModal() {
  showUnlockModal.value = false
  crvToAction.value = null
  actionComment.value = ''
  unlockError.value = ''
}

// Actions
async function handleValidate() {
  if (!crvToAction.value) return

  saving.value = true
  try {
    const crvId = crvToAction.value.id || crvToAction.value._id
    await validationAPI.valider(crvId, actionComment.value || null)
    showToast('CRV validé avec succès', 'success')
    closeValidateModal()
    closeCRVDetail()
    loadCRVList()
  } catch (error) {
    console.error('[ValidationCRV] Erreur validation:', error)
    showToast(error.response?.data?.message || 'Erreur lors de la validation', 'error')
  } finally {
    saving.value = false
  }
}

async function handleReject() {
  if (!crvToAction.value) return

  if (!actionComment.value.trim()) {
    rejectError.value = 'Le commentaire est obligatoire pour rejeter un CRV'
    return
  }

  saving.value = true
  try {
    const crvId = crvToAction.value.id || crvToAction.value._id
    await validationAPI.rejeter(crvId, actionComment.value)
    showToast('CRV rejeté - renvoyé pour correction', 'warning')
    closeRejectModal()
    closeCRVDetail()
    loadCRVList()
  } catch (error) {
    console.error('[ValidationCRV] Erreur rejet:', error)
    showToast(error.response?.data?.message || 'Erreur lors du rejet', 'error')
  } finally {
    saving.value = false
  }
}

async function handleLock(crv) {
  const crvToLock = crv || crvToAction.value
  if (!crvToLock) return

  if (!confirm('Le CRV sera définitif. Aucune modification possible après. Continuer ?')) {
    return
  }

  saving.value = true
  try {
    const crvId = crvToLock.id || crvToLock._id
    await validationAPI.verrouiller(crvId)
    showToast('CRV verrouillé définitivement', 'success')
    closeCRVDetail()
    loadCRVList()
  } catch (error) {
    console.error('[ValidationCRV] Erreur verrouillage:', error)
    showToast(error.response?.data?.message || 'Erreur lors du verrouillage', 'error')
  } finally {
    saving.value = false
  }
}

async function handleUnlock() {
  if (!crvToAction.value) return

  if (!actionComment.value.trim()) {
    unlockError.value = 'La raison est obligatoire pour déverrouiller un CRV'
    return
  }

  saving.value = true
  try {
    const crvId = crvToAction.value.id || crvToAction.value._id
    await validationAPI.deverrouiller(crvId, actionComment.value)
    showToast('CRV déverrouillé - retour au statut VALIDE', 'warning')
    closeUnlockModal()
    closeCRVDetail()
    loadCRVList()
  } catch (error) {
    console.error('[ValidationCRV] Erreur déverrouillage:', error)
    showToast(error.response?.data?.message || 'Erreur lors du déverrouillage', 'error')
  } finally {
    saving.value = false
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 4000)
}

// Lifecycle
onMounted(() => {
  loadCRVList()
})

// Watch filters
watch(() => filters.value.statut, () => {
  pagination.value.page = 1
  loadCRVList()
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply flex justify-between items-center p-4 border-b;
}

.modal-body {
  @apply p-4;
}

.card {
  @apply bg-white rounded-lg shadow p-4;
}

.input {
  @apply border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-sm {
  @apply px-3 py-1 text-sm;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
}

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700;
}

.btn-warning {
  @apply bg-orange-500 text-white hover:bg-orange-600;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>
