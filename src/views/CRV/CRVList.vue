<template>
  <div class="crv-list-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="btn-back">← Retour</button>
          <h1>Liste des CRV</h1>
        </div>
        <div class="header-actions">
          <button @click="goToNewCRV" class="btn btn-primary">
            + Nouveau CRV
          </button>
        </div>
      </div>
    </header>

    <main class="crv-main">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCRVStore } from '@/stores/crvStore'
import { useAuthStore } from '@/stores/authStore'
import { canEdit } from '@/utils/permissions'

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
const goBack = () => {
  router.push('/crv')
}

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
</script>

<style scoped>
.crv-list-container {
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
  font-weight: 500;
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

.crv-main {
  padding: 30px 20px;
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
