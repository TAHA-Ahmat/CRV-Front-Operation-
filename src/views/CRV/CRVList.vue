<template>
  <div class="crv-list-container">
    <!-- Pas de header local - AppHeader global dans App.vue -->

    <main class="crv-main">
      <div class="page-header-bar">
        <h1>Mes CRV</h1>
        <button @click="goToNewCRV" class="btn btn-primary">
          + Nouveau CRV
        </button>
      </div>
      <div class="container">
        <!-- Filtres -->
        <div class="filters-card">
          <div class="filters-row">
            <div class="filter-group">
              <label>Statut</label>
              <select v-model="filters.statut" @change="loadCRVList">
                <option value="">Tous les statuts</option>
                <option value="BROUILLON">Brouillon</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINE">Terminé</option>
                <option value="VALIDE">Validé</option>
                <option value="VERROUILLE">Verrouillé</option>
                <option value="ANNULE">Annulé</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Date début</label>
              <input
                type="date"
                v-model="filters.dateDebut"
                @change="loadCRVList"
              />
            </div>

            <div class="filter-group">
              <label>Date fin</label>
              <input
                type="date"
                v-model="filters.dateFin"
                @change="loadCRVList"
              />
            </div>

            <div class="filter-group">
              <label>&nbsp;</label>
              <button @click="resetFilters" class="btn btn-secondary">
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        <!-- Tableau -->
        <div class="table-card">
          <div v-if="loading" class="loading-state">
            <p>Chargement des CRV...</p>
          </div>

          <div v-else-if="error" class="error-state">
            <p>{{ error }}</p>
            <button @click="loadCRVList" class="btn btn-primary">Réessayer</button>
          </div>

          <div v-else-if="crvList.length === 0" class="empty-state">
            <p>Aucun CRV trouvé</p>
            <button @click="goToNewCRV" class="btn btn-primary">Créer un CRV</button>
          </div>

          <table v-else class="crv-table">
            <thead>
              <tr>
                <th>N° CRV</th>
                <th>Vol</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Complétude</th>
                <th>Créé par</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="crv in crvList" :key="crv._id">
                <td class="crv-number">{{ crv.numeroCRV }}</td>
                <td>
                  <span v-if="crv.vol">{{ crv.vol.numeroVol }}</span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span class="type-badge" :class="getTypeBadgeClass(crv.vol?.typeOperation)">
                    {{ formatType(crv.vol?.typeOperation) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="getStatusClass(crv.statut)">
                    {{ formatStatus(crv.statut) }}
                  </span>
                </td>
                <td>
                  <div class="completude-bar">
                    <div
                      class="completude-fill"
                      :style="{ width: crv.completude + '%' }"
                      :class="getCompletudeClass(crv.completude)"
                    ></div>
                    <span class="completude-text">{{ crv.completude }}%</span>
                  </div>
                </td>
                <td>
                  <span v-if="crv.creePar">
                    {{ crv.creePar.prenom }} {{ crv.creePar.nom }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>{{ formatDate(crv.dateCreation) }}</td>
                <td class="actions-cell">
                  <button
                    @click="viewCRV(crv)"
                    class="btn-action btn-view"
                    title="Voir / Modifier"
                  >
                    {{ canEditCRV(crv) ? 'Modifier' : 'Voir' }}
                  </button>
                  <!-- MVS-2 #5: Bouton Annuler -->
                  <button
                    v-if="canAnnulerCRV(crv)"
                    @click="openAnnulerModal(crv)"
                    class="btn-action btn-cancel"
                    title="Annuler ce CRV"
                  >
                    Annuler
                  </button>
                  <!-- MVS-2 #5: Bouton Réactiver -->
                  <button
                    v-if="canReactiverCRV(crv)"
                    @click="openReactiverModal(crv)"
                    class="btn-action btn-reactivate"
                    title="Réactiver ce CRV"
                  >
                    Réactiver
                  </button>
                  <!-- MVS-2 #11: Bouton Supprimer -->
                  <button
                    v-if="canSupprimerCRV(crv)"
                    @click="openSupprimerModal(crv)"
                    class="btn-action btn-delete"
                    title="Supprimer ce CRV"
                  >
                    Supprimer
                  </button>
                  <!-- Bouton Archiver Google Drive -->
                  <ArchiveButton
                    v-if="canArchiveCRV(crv)"
                    document-type="crv"
                    :document-id="crv._id || crv.id"
                    :document-name="crv.numeroCRV"
                    :archivage-info="crv.archivage"
                    :document-statut="crv.statut"
                    :api-service="crvAPI"
                    :compact="true"
                    @archived="onCRVArchived"
                    @error="onArchiveError"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div v-if="pagination.pages > 1" class="pagination">
            <button
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="btn-page"
            >
              ← Précédent
            </button>

            <span class="page-info">
              Page {{ pagination.page }} / {{ pagination.pages }}
              ({{ pagination.total }} CRV)
            </span>

            <button
              @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.pages"
              class="btn-page"
            >
              Suivant →
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- MVS-2: Modal Annuler CRV -->
    <div v-if="showAnnulerModal" class="modal-overlay" @click.self="closeAnnulerModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Annuler le CRV</h2>
          <button @click="closeAnnulerModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="warning-box">
            <strong>Attention</strong>
            <p>L'annulation d'un CRV est une action réversible. Le CRV pourra être réactivé ultérieurement.</p>
          </div>
          <p>CRV concerné : <strong>{{ selectedCRV?.numeroCRV }}</strong></p>
          <div class="form-group">
            <label>Motif d'annulation <span class="required">*</span></label>
            <select v-model="annulationData.motif" required>
              <option value="">Sélectionner un motif</option>
              <option value="VOL_ANNULE">Vol annulé</option>
              <option value="DOUBLON">Doublon</option>
              <option value="ERREUR_SAISIE">Erreur de saisie</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div class="form-group">
            <label>Commentaire <span class="required">*</span></label>
            <textarea
              v-model="annulationData.commentaire"
              rows="3"
              placeholder="Décrivez la raison de l'annulation..."
              required
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeAnnulerModal" class="btn btn-secondary">Annuler</button>
          <button
            @click="confirmerAnnulation"
            class="btn btn-warning"
            :disabled="!annulationData.motif || !annulationData.commentaire"
          >
            Confirmer l'annulation
          </button>
        </div>
      </div>
    </div>

    <!-- MVS-2: Modal Réactiver CRV -->
    <div v-if="showReactiverModal" class="modal-overlay" @click.self="closeReactiverModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Réactiver le CRV</h2>
          <button @click="closeReactiverModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>CRV concerné : <strong>{{ selectedCRV?.numeroCRV }}</strong></p>
          <p>Le CRV sera remis en statut <strong>EN_COURS</strong> pour modification.</p>
          <div class="form-group">
            <label>Raison de la réactivation <span class="required">*</span></label>
            <textarea
              v-model="reactivationData.raison"
              rows="3"
              placeholder="Décrivez la raison de la réactivation..."
              required
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeReactiverModal" class="btn btn-secondary">Annuler</button>
          <button
            @click="confirmerReactivation"
            class="btn btn-primary"
            :disabled="!reactivationData.raison"
          >
            Réactiver
          </button>
        </div>
      </div>
    </div>

    <!-- MVS-2: Modal Supprimer CRV -->
    <div v-if="showSupprimerModal" class="modal-overlay" @click.self="closeSupprimerModal">
      <div class="modal-content">
        <div class="modal-header modal-header-danger">
          <h2>Supprimer le CRV</h2>
          <button @click="closeSupprimerModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="danger-box">
            <strong>Action irréversible</strong>
            <p>La suppression d'un CRV est définitive et ne peut pas être annulée.</p>
          </div>
          <p>CRV concerné : <strong>{{ selectedCRV?.numeroCRV }}</strong></p>
          <div class="form-group">
            <label>Tapez "SUPPRIMER" pour confirmer <span class="required">*</span></label>
            <input
              v-model="suppressionConfirmation"
              type="text"
              placeholder="SUPPRIMER"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeSupprimerModal" class="btn btn-secondary">Annuler</button>
          <button
            @click="confirmerSuppression"
            class="btn btn-danger"
            :disabled="suppressionConfirmation !== 'SUPPRIMER'"
          >
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>

    <!-- Toast notification -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCRVStore } from '@/stores/crvStore'
import { useAuthStore } from '@/stores/authStore'
import { crvAPI } from '@/services/api'
import { canEdit, canCancelCRV, canDeleteCRV } from '@/utils/permissions'
import ArchiveButton from '@/components/Common/ArchiveButton.vue'

const router = useRouter()
const crvStore = useCRVStore()
const authStore = useAuthStore()

// États
const loading = ref(false)
const error = ref('')
const crvList = ref([])
const pagination = reactive({
  page: 1,
  pages: 1,
  total: 0,
  limit: 20
})

const filters = reactive({
  statut: '',
  dateDebut: '',
  dateFin: ''
})

// MVS-2: États modaux
const selectedCRV = ref(null)
const showAnnulerModal = ref(false)
const showReactiverModal = ref(false)
const showSupprimerModal = ref(false)
const annulationData = reactive({ motif: '', commentaire: '' })
const reactivationData = reactive({ raison: '' })
const suppressionConfirmation = ref('')
const toast = reactive({ show: false, message: '', type: 'success' })

// Chargement initial
onMounted(() => {
  loadCRVList()
})

// Charger la liste des CRV
const loadCRVList = async () => {
  loading.value = true
  error.value = ''

  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit
    }

    if (filters.statut) params.statut = filters.statut
    if (filters.dateDebut) params.dateDebut = filters.dateDebut
    if (filters.dateFin) params.dateFin = filters.dateFin

    console.log('[CRVList] Chargement avec params:', params)

    const result = await crvStore.listCRV(params)

    crvList.value = crvStore.crvList
    pagination.page = crvStore.crvPage
    pagination.pages = crvStore.crvPages
    pagination.total = crvStore.crvTotal

    console.log('[CRVList] CRV chargés:', crvList.value.length, '- Total:', pagination.total)
  } catch (err) {
    console.error('[CRVList] Erreur:', err)
    error.value = err.message || 'Erreur lors du chargement des CRV'
  } finally {
    loading.value = false
  }
}

// Réinitialiser les filtres
const resetFilters = () => {
  filters.statut = ''
  filters.dateDebut = ''
  filters.dateFin = ''
  pagination.page = 1
  loadCRVList()
}

// Pagination
const goToPage = (page) => {
  if (page >= 1 && page <= pagination.pages) {
    pagination.page = page
    loadCRVList()
  }
}

// Navigation
const goToNewCRV = () => {
  router.push('/crv')
}

const viewCRV = (crv) => {
  const typeOperation = crv.vol?.typeOperation?.toLowerCase() || 'arrivee'
  const crvId = crv._id || crv.id

  // Mapper le type d'opération vers la route
  let route = '/crv/arrivee'
  if (typeOperation === 'depart') {
    route = '/crv/depart'
  } else if (typeOperation === 'turn_around' || typeOperation === 'turnaround') {
    route = '/crv/turnaround'
  }

  // Naviguer avec l'ID du CRV en query param
  router.push({ path: route, query: { id: crvId } })
}

// Vérifier si l'utilisateur peut modifier le CRV
const canEditCRV = (crv) => {
  const userRole = authStore.currentUser?.role
  if (!canEdit(userRole)) return false

  // Les CRV verrouillés ou annulés ne sont pas modifiables
  return !['VERROUILLE', 'ANNULE'].includes(crv.statut)
}

// Formatters
const formatType = (type) => {
  const types = {
    'ARRIVEE': 'Arrivée',
    'DEPART': 'Départ',
    'TURN_AROUND': 'Turn Around'
  }
  return types[type] || type || '-'
}

const formatStatus = (statut) => {
  const statuts = {
    'BROUILLON': 'Brouillon',
    'EN_COURS': 'En cours',
    'TERMINE': 'Terminé',
    'VALIDE': 'Validé',
    'VERROUILLE': 'Verrouillé',
    'ANNULE': 'Annulé'
  }
  return statuts[statut] || statut
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTypeBadgeClass = (type) => {
  return {
    'type-arrivee': type === 'ARRIVEE',
    'type-depart': type === 'DEPART',
    'type-turnaround': type === 'TURN_AROUND'
  }
}

const getStatusClass = (statut) => {
  return {
    'status-brouillon': statut === 'BROUILLON',
    'status-en-cours': statut === 'EN_COURS',
    'status-termine': statut === 'TERMINE',
    'status-valide': statut === 'VALIDE',
    'status-verrouille': statut === 'VERROUILLE',
    'status-annule': statut === 'ANNULE'
  }
}

const getCompletudeClass = (completude) => {
  if (completude >= 80) return 'completude-high'
  if (completude >= 50) return 'completude-medium'
  return 'completude-low'
}

// MVS-2: Vérifications permissions
const canAnnulerCRV = (crv) => {
  const userRole = authStore.currentUser?.fonction || authStore.currentUser?.role
  if (!canCancelCRV(userRole)) return false
  // Pas déjà annulé et pas verrouillé
  return crv.statut && crv.statut !== 'ANNULE' && crv.statut !== 'VERROUILLE'
}

const canReactiverCRV = (crv) => {
  const userRole = authStore.currentUser?.fonction || authStore.currentUser?.role
  if (!canCancelCRV(userRole)) return false
  return crv.statut === 'ANNULE'
}

const canSupprimerCRV = (crv) => {
  const userRole = authStore.currentUser?.fonction || authStore.currentUser?.role
  if (!canDeleteCRV(userRole)) return false
  // Pas verrouillé
  return crv.statut !== 'VERROUILLE'
}

// Vérifier si un CRV peut être archivé (VALIDE ou VERROUILLE)
const canArchiveCRV = (crv) => {
  return crv.statut === 'VALIDE' || crv.statut === 'VERROUILLE'
}

// MVS-2: Gestion modaux Annuler
const openAnnulerModal = (crv) => {
  selectedCRV.value = crv
  annulationData.motif = ''
  annulationData.commentaire = ''
  showAnnulerModal.value = true
}

const closeAnnulerModal = () => {
  showAnnulerModal.value = false
  selectedCRV.value = null
}

const confirmerAnnulation = async () => {
  if (!selectedCRV.value || !annulationData.motif || !annulationData.commentaire) return

  try {
    // Charger le CRV dans le store pour utiliser annulerCRV
    await crvStore.loadCRV(selectedCRV.value._id || selectedCRV.value.id)
    await crvStore.annulerCRV({
      motif: annulationData.motif,
      commentaire: annulationData.commentaire
    })

    showToast('CRV annulé avec succès', 'success')
    closeAnnulerModal()
    loadCRVList()
  } catch (err) {
    showToast(err.message || 'Erreur lors de l\'annulation', 'error')
  }
}

// MVS-2: Gestion modaux Réactiver
const openReactiverModal = (crv) => {
  selectedCRV.value = crv
  reactivationData.raison = ''
  showReactiverModal.value = true
}

const closeReactiverModal = () => {
  showReactiverModal.value = false
  selectedCRV.value = null
}

const confirmerReactivation = async () => {
  if (!selectedCRV.value || !reactivationData.raison) return

  try {
    await crvStore.loadCRV(selectedCRV.value._id || selectedCRV.value.id)
    await crvStore.reactiverCRV({
      raison: reactivationData.raison
    })

    showToast('CRV réactivé avec succès', 'success')
    closeReactiverModal()
    loadCRVList()
  } catch (err) {
    showToast(err.message || 'Erreur lors de la réactivation', 'error')
  }
}

// MVS-2: Gestion modaux Supprimer
const openSupprimerModal = (crv) => {
  selectedCRV.value = crv
  suppressionConfirmation.value = ''
  showSupprimerModal.value = true
}

const closeSupprimerModal = () => {
  showSupprimerModal.value = false
  selectedCRV.value = null
}

const confirmerSuppression = async () => {
  if (!selectedCRV.value || suppressionConfirmation.value !== 'SUPPRIMER') return

  try {
    await crvStore.deleteCRV(selectedCRV.value._id || selectedCRV.value.id)
    showToast('CRV supprimé définitivement', 'success')
    closeSupprimerModal()
    loadCRVList()
  } catch (err) {
    showToast(err.message || 'Erreur lors de la suppression', 'error')
  }
}

// Archivage Google Drive
const onCRVArchived = async ({ documentId, archivage }) => {
  console.log('[CRVList] CRV archivé:', documentId, archivage)
  showToast('CRV archivé dans Google Drive', 'success')
  // Rafraîchir la liste pour mettre à jour les infos d'archivage
  await loadCRVList()
}

const onArchiveError = ({ documentId, error }) => {
  console.error('[CRVList] Erreur archivage:', documentId, error)
  showToast(error || 'Erreur lors de l\'archivage', 'error')
}

// Toast
const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 4000)
}
</script>

<style scoped>
.crv-list-container {
  min-height: calc(100vh - 64px);
  background: #f9fafb;
}

.crv-main {
  padding: 30px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header-bar h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Filtres */
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

/* Tableau */
.table-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.loading-state,
.empty-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.crv-table {
  width: 100%;
  border-collapse: collapse;
}

.crv-table th {
  text-align: left;
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
  text-transform: uppercase;
}

.crv-table td {
  padding: 12px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}

.crv-table tr:hover {
  background: #f9fafb;
}

.crv-number {
  font-weight: 600;
  color: #2563eb;
}

.text-muted {
  color: #9ca3af;
}

/* Badges */
.type-badge,
.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-arrivee { background: #dbeafe; color: #1e40af; }
.type-depart { background: #fef3c7; color: #92400e; }
.type-turnaround { background: #e0e7ff; color: #3730a3; }

.status-brouillon { background: #f3f4f6; color: #4b5563; }
.status-en-cours { background: #dbeafe; color: #1e40af; }
.status-termine { background: #fef3c7; color: #92400e; }
.status-valide { background: #dcfce7; color: #166534; }
.status-verrouille { background: #e0e7ff; color: #3730a3; }
.status-annule { background: #fee2e2; color: #991b1b; }

/* Complétude */
.completude-bar {
  position: relative;
  width: 100px;
  height: 20px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.completude-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s;
}

.completude-high { background: #22c55e; }
.completude-medium { background: #f59e0b; }
.completude-low { background: #ef4444; }

.completude-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 600;
  color: #1f2937;
}

/* Actions */
.actions-cell {
  white-space: nowrap;
}

.btn-action {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.btn-view {
  background: #2563eb;
  color: white;
}

.btn-view:hover {
  background: #1d4ed8;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-page {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.btn-page:hover:not(:disabled) {
  background: #f3f4f6;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6b7280;
  font-size: 14px;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-danger:disabled,
.btn-warning:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Actions boutons dans tableau */
.btn-cancel {
  background: #fef3c7;
  color: #92400e;
  margin-left: 4px;
}

.btn-cancel:hover {
  background: #f59e0b;
  color: white;
}

.btn-reactivate {
  background: #d1fae5;
  color: #065f46;
  margin-left: 4px;
}

.btn-reactivate:hover {
  background: #10b981;
  color: white;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
  margin-left: 4px;
}

.btn-delete:hover {
  background: #ef4444;
  color: white;
}

/* Modaux */
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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
  color: #1f2937;
  margin: 0;
}

.modal-header-danger {
  background: #fee2e2;
}

.modal-header-danger h2 {
  color: #991b1b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
}

.modal-close:hover {
  color: #1f2937;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

.warning-box {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
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

.danger-box {
  background: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.danger-box strong {
  color: #991b1b;
  display: block;
  margin-bottom: 4px;
}

.danger-box p {
  color: #991b1b;
  margin: 0;
  font-size: 14px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-group .required {
  color: #ef4444;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

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
  animation: slideIn 0.3s ease;
}

.toast.success {
  background: #10b981;
  color: white;
}

.toast.error {
  background: #ef4444;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group select,
  .filter-group input {
    width: 100%;
  }

  .crv-table {
    font-size: 12px;
  }

  .crv-table th,
  .crv-table td {
    padding: 8px;
  }
}
</style>
