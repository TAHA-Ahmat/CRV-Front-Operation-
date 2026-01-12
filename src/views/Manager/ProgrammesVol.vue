<template>
  <div class="programmes-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="btn-back">← Retour</button>
          <h1>Programmes de Vol Saisonniers</h1>
        </div>
        <div class="header-actions">
          <button v-if="canCreate" @click="openCreateModal" class="btn btn-primary">
            + Nouveau Programme
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <!-- Filtres -->
        <div class="filters-card">
          <div class="filters-row">
            <div class="filter-group">
              <label>Statut</label>
              <select v-model="filters.statut" @change="loadProgrammes">
                <option value="">Tous</option>
                <option value="BROUILLON">Brouillon</option>
                <option value="VALIDE">Validé</option>
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Compagnie</label>
              <input v-model="filters.compagnie" @input="debounceSearch" placeholder="Code IATA...">
            </div>
            <div class="filter-group">
              <label>Catégorie</label>
              <select v-model="filters.categorieVol" @change="loadProgrammes">
                <option value="">Toutes</option>
                <option value="PASSAGER">Passager</option>
                <option value="CARGO">Cargo</option>
                <option value="DOMESTIQUE">Domestique</option>
              </select>
            </div>
            <div class="filter-group">
              <label>&nbsp;</label>
              <button @click="resetFilters" class="btn btn-secondary">Réinitialiser</button>
            </div>
          </div>
        </div>

        <!-- Indicateur workflow -->
        <div class="workflow-indicator">
          <div class="workflow-step">
            <span class="step-icon">1</span>
            <span class="step-label">BROUILLON</span>
          </div>
          <div class="workflow-arrow">→</div>
          <div class="workflow-step">
            <span class="step-icon">2</span>
            <span class="step-label">VALIDÉ</span>
          </div>
          <div class="workflow-arrow">→</div>
          <div class="workflow-step">
            <span class="step-icon">3</span>
            <span class="step-label">ACTIF</span>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <p>Chargement des programmes...</p>
        </div>

        <!-- Liste des programmes -->
        <div v-else-if="programmes.length > 0" class="programmes-grid">
          <div
            v-for="programme in programmes"
            :key="programme._id || programme.id"
            class="programme-card"
            :class="getStatutClass(programme.statut)"
          >
            <div class="programme-header">
              <div class="programme-title">
                <h3>{{ programme.nom || programme.nomProgramme }}</h3>
                <span v-if="programme.categorieVol" class="category-badge" :class="getCategoryBadgeClass(programme.categorieVol)">
                  {{ programme.categorieVol }}
                </span>
              </div>
              <span class="status-badge" :class="getStatutBadgeClass(programme.statut)">
                {{ programme.statut }}
              </span>
            </div>

            <div class="programme-info">
              <div class="info-row">
                <span class="label">Compagnie:</span>
                <span class="value">{{ programme.compagnieAerienne || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Type:</span>
                <span class="value">{{ formatTypeOperation(programme.typeOperation) }}</span>
              </div>
              <div v-if="programme.route" class="info-row">
                <span class="label">Route:</span>
                <span class="value">{{ formatRoute(programme.route) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Période:</span>
                <span class="value">
                  {{ formatDate(programme.dateDebut) }} - {{ formatDate(programme.dateFin) }}
                </span>
              </div>
              <div v-if="programme.recurrence" class="info-row">
                <span class="label">Récurrence:</span>
                <span class="value">{{ formatRecurrence(programme.recurrence) }}</span>
              </div>
            </div>

            <div class="programme-actions">
              <button @click="viewProgramme(programme)" class="btn-action btn-view">
                Voir
              </button>
              <button
                v-if="canEdit(programme)"
                @click="openEditModal(programme)"
                class="btn-action btn-edit"
              >
                Modifier
              </button>
              <!-- Bouton Valider -->
              <button
                v-if="canValidate && programme.statut === 'BROUILLON'"
                @click="validerProgramme(programme)"
                class="btn-action btn-validate"
              >
                Valider
              </button>
              <!-- Bouton Activer -->
              <button
                v-if="canActivate && programme.statut === 'VALIDE'"
                @click="activerProgramme(programme)"
                class="btn-action btn-activate"
              >
                Activer
              </button>
              <!-- Bouton Suspendre -->
              <button
                v-if="canActivate && programme.statut === 'ACTIF'"
                @click="openSuspendreModal(programme)"
                class="btn-action btn-suspend"
              >
                Suspendre
              </button>
              <!-- Bouton Supprimer -->
              <button
                v-if="canDelete && programme.statut === 'BROUILLON'"
                @click="openDeleteModal(programme)"
                class="btn-action btn-delete"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>Aucun programme trouvé</h3>
          <p>Créez votre premier programme saisonnier pour automatiser la génération des vols.</p>
          <button v-if="canCreate" @click="openCreateModal" class="btn btn-primary">
            Créer un programme
          </button>
        </div>
      </div>
    </main>

    <!-- Modal Création/Edition -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeFormModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>{{ editingProgramme ? 'Modifier le programme' : 'Nouveau programme' }}</h2>
          <button @click="closeFormModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProgramme">
            <div class="form-grid">
              <div class="form-group">
                <label>Nom du programme <span class="required">*</span></label>
                <input v-model="formData.nom" type="text" required placeholder="Ex: Été 2026 Paris-NDJ">
              </div>

              <div class="form-group">
                <label>Compagnie aérienne <span class="required">*</span></label>
                <input v-model="formData.compagnieAerienne" type="text" required placeholder="Ex: THS">
              </div>

              <div class="form-group">
                <label>Catégorie de vol <span class="required">*</span></label>
                <select v-model="formData.categorieVol" required>
                  <option value="">Sélectionner...</option>
                  <option value="PASSAGER">Passager</option>
                  <option value="CARGO">Cargo</option>
                  <option value="DOMESTIQUE">Domestique</option>
                </select>
              </div>

              <div class="form-group">
                <label>Type d'opération <span class="required">*</span></label>
                <select v-model="formData.typeOperation" required>
                  <option value="">Sélectionner...</option>
                  <option value="ARRIVEE">Arrivée</option>
                  <option value="DEPART">Départ</option>
                  <option value="TURN_AROUND">Turn Around</option>
                </select>
              </div>

              <div class="form-group">
                <label>Date de début <span class="required">*</span></label>
                <input v-model="formData.dateDebut" type="date" required>
              </div>

              <div class="form-group">
                <label>Date de fin <span class="required">*</span></label>
                <input v-model="formData.dateFin" type="date" required>
              </div>

              <div class="form-group">
                <label>Provenance <span class="required">*</span></label>
                <input v-model="formData.provenance" type="text" required placeholder="Ex: CDG (Paris)">
              </div>

              <div class="form-group">
                <label>Destination <span class="required">*</span></label>
                <input v-model="formData.destination" type="text" required placeholder="Ex: NDJ (N'Djamena)">
              </div>

              <div class="form-group">
                <label>Récurrence</label>
                <select v-model="formData.recurrence">
                  <option value="">Aucune</option>
                  <option value="QUOTIDIEN">Quotidien</option>
                  <option value="HEBDOMADAIRE">Hebdomadaire</option>
                  <option value="MENSUEL">Mensuel</option>
                </select>
              </div>

              <div v-if="formData.recurrence === 'HEBDOMADAIRE'" class="form-group full-width">
                <label>Jours de la semaine</label>
                <div class="checkbox-group">
                  <label v-for="(jour, idx) in joursOptions" :key="idx" class="checkbox-label">
                    <input type="checkbox" v-model="formData.joursRecurrence" :value="idx">
                    {{ jour }}
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Numéro de vol type</label>
                <input v-model="formData.numeroVolType" type="text" placeholder="Ex: THS001">
              </div>

              <div class="form-group">
                <label>Type d'avion</label>
                <input v-model="formData.avionType" type="text" placeholder="Ex: B737-800">
              </div>

              <div class="form-group">
                <label>Capacité passagers</label>
                <input v-model.number="formData.capacitePassagers" type="number" min="0" placeholder="Ex: 189">
              </div>

              <div class="form-group">
                <label>Night Stop</label>
                <select v-model="formData.nightStop">
                  <option :value="false">Non</option>
                  <option :value="true">Oui</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label>Description</label>
                <textarea v-model="formData.description" rows="2" placeholder="Description du programme..."></textarea>
              </div>

              <div class="form-group full-width">
                <label>Remarques</label>
                <textarea v-model="formData.remarques" rows="2" placeholder="Remarques additionnelles..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeFormModal" class="btn btn-secondary">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Détail -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>{{ selectedProgramme?.nom || selectedProgramme?.nomProgramme }}</h2>
          <button @click="closeDetailModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Statut</span>
              <span class="status-badge" :class="getStatutBadgeClass(selectedProgramme?.statut)">
                {{ selectedProgramme?.statut }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Compagnie</span>
              <span class="detail-value">{{ selectedProgramme?.compagnieAerienne }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Catégorie</span>
              <span v-if="selectedProgramme?.categorieVol" class="category-badge" :class="getCategoryBadgeClass(selectedProgramme?.categorieVol)">
                {{ selectedProgramme?.categorieVol }}
              </span>
              <span v-else class="detail-value">-</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Type</span>
              <span class="detail-value">{{ formatTypeOperation(selectedProgramme?.typeOperation) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Route</span>
              <span class="detail-value">{{ formatRoute(selectedProgramme?.route) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Période</span>
              <span class="detail-value">
                {{ formatDate(selectedProgramme?.dateDebut) }} - {{ formatDate(selectedProgramme?.dateFin) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Récurrence</span>
              <span class="detail-value">{{ formatRecurrence(selectedProgramme?.recurrence) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Night Stop</span>
              <span class="detail-value">{{ selectedProgramme?.nightStop ? 'Oui' : 'Non' }}</span>
            </div>
            <div v-if="selectedProgramme?.detailsVol?.avionType" class="detail-item">
              <span class="detail-label">Type d'avion</span>
              <span class="detail-value">{{ selectedProgramme.detailsVol.avionType }}</span>
            </div>
            <div v-if="selectedProgramme?.detailsVol?.capacitePassagers" class="detail-item">
              <span class="detail-label">Capacité</span>
              <span class="detail-value">{{ selectedProgramme.detailsVol.capacitePassagers }} pax</span>
            </div>
            <div v-if="selectedProgramme?.description" class="detail-item full-width">
              <span class="detail-label">Description</span>
              <span class="detail-value">{{ selectedProgramme.description }}</span>
            </div>
            <div v-if="selectedProgramme?.remarques" class="detail-item full-width">
              <span class="detail-label">Remarques</span>
              <span class="detail-value">{{ selectedProgramme.remarques }}</span>
            </div>
          </div>

          <!-- Actions disponibles -->
          <div class="detail-actions">
            <button
              v-if="canValidate && selectedProgramme?.statut === 'BROUILLON'"
              @click="validerProgramme(selectedProgramme); closeDetailModal()"
              class="btn btn-success"
            >
              Valider ce programme
            </button>
            <button
              v-if="canActivate && selectedProgramme?.statut === 'VALIDE'"
              @click="activerProgramme(selectedProgramme); closeDetailModal()"
              class="btn btn-primary"
            >
              Activer ce programme
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDetailModal" class="btn btn-secondary">Fermer</button>
        </div>
      </div>
    </div>

    <!-- Modal Suspension -->
    <div v-if="showSuspendreModal" class="modal-overlay" @click.self="closeSuspendreModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Suspendre le programme</h2>
          <button @click="closeSuspendreModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Programme : <strong>{{ selectedProgramme?.nom }}</strong></p>
          <div class="form-group">
            <label>Raison de la suspension</label>
            <textarea v-model="suspendreRaison" rows="3" placeholder="Indiquez la raison..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeSuspendreModal" class="btn btn-secondary">Annuler</button>
          <button @click="confirmerSuspension" class="btn btn-warning">Suspendre</button>
        </div>
      </div>
    </div>

    <!-- Modal Suppression -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-content">
        <div class="modal-header modal-header-danger">
          <h2>Supprimer le programme</h2>
          <button @click="closeDeleteModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="danger-box">
            <strong>Action irréversible</strong>
            <p>La suppression d'un programme est définitive.</p>
          </div>
          <p>Programme : <strong>{{ selectedProgramme?.nom }}</strong></p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn btn-secondary">Annuler</button>
          <button @click="confirmerSuppression" class="btn btn-danger">Supprimer</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
/**
 * ProgrammesVol.vue - Gestion des programmes de vol saisonniers
 *
 * CONFORME À: docs/process/MVS-5-Flights/FRONT-CORRECTIONS.md
 * Écart #3 (CRITIQUE): Extension 2 - Interface programmes saisonniers
 * Écart #4 (HAUTE): Interface validation programme
 *
 * Workflow: BROUILLON -> VALIDE -> ACTIF
 * Permissions: SUPERVISEUR, MANAGER pour validation/activation
 */

import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { programmesVolAPI } from '@/services/api'
import { canValidateProgramme, canDeleteProgramme } from '@/utils/permissions'

const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(false)
const saving = ref(false)
const programmes = ref([])
const selectedProgramme = ref(null)
const editingProgramme = ref(null)

// Modals
const showFormModal = ref(false)
const showDetailModal = ref(false)
const showSuspendreModal = ref(false)
const showDeleteModal = ref(false)
const suspendreRaison = ref('')

// Filters
const filters = reactive({
  statut: '',
  compagnie: '',
  categorieVol: ''
})

// Form
const formData = reactive({
  nom: '',
  compagnieAerienne: '',
  categorieVol: '',
  typeOperation: '',
  dateDebut: '',
  dateFin: '',
  provenance: '',
  destination: '',
  recurrence: '',
  joursRecurrence: [],
  numeroVolType: '',
  avionType: '',
  capacitePassagers: null,
  nightStop: false,
  description: '',
  remarques: ''
})

// Toast
const toast = reactive({ show: false, message: '', type: 'success' })

// Options
const joursOptions = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// Computed
const userRole = computed(() => authStore.currentUser?.fonction || authStore.currentUser?.role)
const canCreate = computed(() => canValidateProgramme(userRole.value))
const canValidate = computed(() => canValidateProgramme(userRole.value))
const canActivate = computed(() => canValidateProgramme(userRole.value))
const canDelete = computed(() => canDeleteProgramme(userRole.value))

// Methods
const canEdit = (programme) => {
  return programme.statut === 'BROUILLON' && canCreate.value
}

const goBack = () => {
  router.push('/dashboard-manager')
}

let searchTimeout = null
const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadProgrammes, 300)
}

const resetFilters = () => {
  filters.statut = ''
  filters.compagnie = ''
  filters.categorieVol = ''
  loadProgrammes()
}

const loadProgrammes = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.statut) params.statut = filters.statut
    if (filters.compagnie) params.compagnie = filters.compagnie
    if (filters.categorieVol) params.categorieVol = filters.categorieVol

    const response = await programmesVolAPI.getAll(params)
    const data = response.data.data || response.data
    programmes.value = Array.isArray(data) ? data : (data.programmes || [])
  } catch (error) {
    console.error('[ProgrammesVol] Erreur chargement:', error)
    showToast('Erreur lors du chargement', 'error')
  } finally {
    loading.value = false
  }
}

const viewProgramme = (programme) => {
  selectedProgramme.value = programme
  showDetailModal.value = true
}

const openCreateModal = () => {
  editingProgramme.value = null
  resetFormData()
  showFormModal.value = true
}

const openEditModal = (programme) => {
  editingProgramme.value = programme
  Object.assign(formData, {
    nom: programme.nom || programme.nomProgramme || '',
    compagnieAerienne: programme.compagnieAerienne || '',
    categorieVol: programme.categorieVol || '',
    typeOperation: programme.typeOperation || '',
    dateDebut: programme.dateDebut?.split('T')[0] || '',
    dateFin: programme.dateFin?.split('T')[0] || '',
    provenance: programme.route?.provenance || '',
    destination: programme.route?.destination || '',
    recurrence: programme.recurrence || '',
    joursRecurrence: programme.joursRecurrence || [],
    numeroVolType: programme.numeroVolType || programme.detailsVol?.numeroVolBase || '',
    avionType: programme.detailsVol?.avionType || '',
    capacitePassagers: programme.detailsVol?.capacitePassagers || null,
    nightStop: programme.nightStop || false,
    description: programme.description || '',
    remarques: programme.remarques || ''
  })
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  editingProgramme.value = null
  resetFormData()
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedProgramme.value = null
}

const resetFormData = () => {
  Object.assign(formData, {
    nom: '',
    compagnieAerienne: '',
    categorieVol: '',
    typeOperation: '',
    dateDebut: '',
    dateFin: '',
    provenance: '',
    destination: '',
    recurrence: '',
    joursRecurrence: [],
    numeroVolType: '',
    avionType: '',
    capacitePassagers: null,
    nightStop: false,
    description: '',
    remarques: ''
  })
}

const saveProgramme = async () => {
  saving.value = true
  try {
    const data = {
      nom: formData.nom,
      nomProgramme: formData.nom,
      compagnieAerienne: formData.compagnieAerienne,
      categorieVol: formData.categorieVol,
      typeOperation: formData.typeOperation,
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      route: {
        provenance: formData.provenance,
        destination: formData.destination
      },
      recurrence: formData.recurrence || null,
      joursRecurrence: formData.joursRecurrence,
      numeroVolType: formData.numeroVolType,
      nightStop: formData.nightStop,
      detailsVol: {
        numeroVolBase: formData.numeroVolType,
        avionType: formData.avionType || undefined,
        capacitePassagers: formData.capacitePassagers || undefined
      },
      description: formData.description,
      remarques: formData.remarques || undefined
    }

    if (editingProgramme.value) {
      await programmesVolAPI.update(editingProgramme.value._id || editingProgramme.value.id, data)
      showToast('Programme modifié avec succès', 'success')
    } else {
      await programmesVolAPI.create(data)
      showToast('Programme créé avec succès', 'success')
    }

    closeFormModal()
    loadProgrammes()
  } catch (error) {
    console.error('[ProgrammesVol] Erreur sauvegarde:', error)
    showToast(error.response?.data?.message || 'Erreur lors de la sauvegarde', 'error')
  } finally {
    saving.value = false
  }
}

const validerProgramme = async (programme) => {
  try {
    await programmesVolAPI.valider(programme._id || programme.id)
    showToast('Programme validé - Prêt pour activation', 'success')
    loadProgrammes()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de la validation', 'error')
  }
}

const activerProgramme = async (programme) => {
  try {
    await programmesVolAPI.activer(programme._id || programme.id)
    showToast('Programme activé - Les vols seront générés selon la récurrence', 'success')
    loadProgrammes()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de l\'activation', 'error')
  }
}

const openSuspendreModal = (programme) => {
  selectedProgramme.value = programme
  suspendreRaison.value = ''
  showSuspendreModal.value = true
}

const closeSuspendreModal = () => {
  showSuspendreModal.value = false
  selectedProgramme.value = null
}

const confirmerSuspension = async () => {
  try {
    await programmesVolAPI.suspendre(selectedProgramme.value._id || selectedProgramme.value.id, suspendreRaison.value)
    showToast('Programme suspendu', 'success')
    closeSuspendreModal()
    loadProgrammes()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de la suspension', 'error')
  }
}

const openDeleteModal = (programme) => {
  selectedProgramme.value = programme
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedProgramme.value = null
}

const confirmerSuppression = async () => {
  try {
    await programmesVolAPI.delete(selectedProgramme.value._id || selectedProgramme.value.id)
    showToast('Programme supprimé', 'success')
    closeDeleteModal()
    loadProgrammes()
  } catch (error) {
    showToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error')
  }
}

// Formatters
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatTypeOperation = (type) => {
  const types = {
    'ARRIVEE': 'Arrivée',
    'DEPART': 'Départ',
    'TURN_AROUND': 'Turn Around'
  }
  return types[type] || type || '-'
}

const formatRecurrence = (rec) => {
  const recs = {
    'QUOTIDIEN': 'Quotidien',
    'HEBDOMADAIRE': 'Hebdomadaire',
    'MENSUEL': 'Mensuel'
  }
  return recs[rec] || 'Aucune'
}

const formatRoute = (route) => {
  if (!route) return '-'
  const { provenance, destination, escales } = route
  let routeStr = `${provenance || '?'} → ${destination || '?'}`
  if (escales && escales.length > 0) {
    routeStr += ` (via ${escales.join(', ')})`
  }
  return routeStr
}

const getCategoryBadgeClass = (category) => {
  return {
    'badge-passager': category === 'PASSAGER',
    'badge-cargo': category === 'CARGO',
    'badge-domestique': category === 'DOMESTIQUE'
  }
}

const getStatutClass = (statut) => {
  return {
    'card-brouillon': statut === 'BROUILLON',
    'card-valide': statut === 'VALIDE',
    'card-actif': statut === 'ACTIF',
    'card-inactif': statut === 'INACTIF'
  }
}

const getStatutBadgeClass = (statut) => {
  return {
    'badge-brouillon': statut === 'BROUILLON',
    'badge-valide': statut === 'VALIDE',
    'badge-actif': statut === 'ACTIF',
    'badge-inactif': statut === 'INACTIF'
  }
}

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 4000)
}

// Lifecycle
onMounted(() => {
  loadProgrammes()
})
</script>

<style scoped>
.programmes-container {
  min-height: 100vh;
  background: #f9fafb;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  max-width: 1400px;
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
  border: none;
  cursor: pointer;
}

.app-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.main-content {
  padding: 30px 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Workflow indicator */
.workflow-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.workflow-step {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.step-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.workflow-arrow {
  color: #9ca3af;
  font-size: 20px;
}

/* Filters */
.filters-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.filters-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
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

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;
}

/* Programmes grid */
.programmes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.programme-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-left: 4px solid #e5e7eb;
}

.programme-card.card-brouillon { border-left-color: #9ca3af; }
.programme-card.card-valide { border-left-color: #f59e0b; }
.programme-card.card-actif { border-left-color: #10b981; }
.programme-card.card-inactif { border-left-color: #ef4444; }

.programme-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.programme-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.programme-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.category-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.badge-passager { background: #dbeafe; color: #1e40af; }
.badge-cargo { background: #fef3c7; color: #92400e; }
.badge-domestique { background: #d1fae5; color: #065f46; }

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-brouillon { background: #f3f4f6; color: #4b5563; }
.badge-valide { background: #fef3c7; color: #92400e; }
.badge-actif { background: #d1fae5; color: #065f46; }
.badge-inactif { background: #fee2e2; color: #991b1b; }

.programme-info {
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-row .label {
  color: #6b7280;
  min-width: 80px;
}

.info-row .value {
  color: #374151;
  font-weight: 500;
}

.programme-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
}

.btn-action {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.btn-view { background: #e5e7eb; color: #374151; }
.btn-edit { background: #dbeafe; color: #1e40af; }
.btn-validate { background: #fef3c7; color: #92400e; }
.btn-activate { background: #d1fae5; color: #065f46; }
.btn-suspend { background: #fef3c7; color: #92400e; }
.btn-delete { background: #fee2e2; color: #991b1b; }

.btn-action:hover { opacity: 0.8; }

/* Empty state */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  color: #374151;
  margin-bottom: 10px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 20px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.modal-header-danger { background: #fee2e2; }
.modal-header-danger h2 { color: #991b1b; }

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
}

.modal-body { padding: 20px; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required { color: #ef4444; }

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
}

.detail-value {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.detail-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
}

.danger-box {
  background: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.danger-box strong { color: #991b1b; display: block; margin-bottom: 4px; }
.danger-box p { color: #991b1b; margin: 0; font-size: 14px; }

/* Buttons */
.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.btn-primary { background: #2563eb; color: white; }
.btn-primary:hover { background: #1d4ed8; }

.btn-secondary { background: #f3f4f6; color: #374151; }
.btn-secondary:hover { background: #e5e7eb; }

.btn-success { background: #10b981; color: white; }
.btn-warning { background: #f59e0b; color: white; }
.btn-danger { background: #ef4444; color: white; }

.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Toast */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 2000;
}

.toast.success { background: #10b981; color: white; }
.toast.error { background: #ef4444; color: white; }
</style>
