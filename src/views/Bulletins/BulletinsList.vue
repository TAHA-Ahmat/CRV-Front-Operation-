<template>
  <div class="bulletins-container">
    <main class="bulletins-main">
      <div class="container">
        <!-- En-tête -->
        <div class="page-header-bar">
          <h1>Bulletins de Mouvement</h1>
          <button
            v-if="canCreate"
            class="btn-primary"
            @click="goToCreate"
          >
            + Nouveau Bulletin
          </button>
        </div>

        <!-- Filtres -->
        <div class="filters-section">
          <div class="filters-row">
            <div class="filter-group">
              <label>Escale</label>
              <input
                v-model="filtres.escale"
                type="text"
                placeholder="NDJ, ABJ..."
                maxlength="4"
                class="filter-input"
                @input="filtres.escale = filtres.escale.toUpperCase()"
              />
            </div>
            <div class="filter-group">
              <label>Statut</label>
              <select v-model="filtres.statut" class="filter-select">
                <option value="">Tous</option>
                <option value="BROUILLON">Brouillon</option>
                <option value="PUBLIE">Publié</option>
                <option value="ARCHIVE">Archivé</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Date début</label>
              <input v-model="filtres.dateDebut" type="date" class="filter-input" />
            </div>
            <div class="filter-group">
              <label>Date fin</label>
              <input v-model="filtres.dateFin" type="date" class="filter-input" />
            </div>
            <div class="filter-actions">
              <button class="btn-secondary" @click="applyFilters">Filtrer</button>
              <button class="btn-text" @click="resetFilters">Réinitialiser</button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des bulletins...</p>
        </div>

        <!-- Erreur -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button class="btn-secondary" @click="loadBulletins">Réessayer</button>
        </div>

        <!-- Liste vide -->
        <div v-else-if="bulletins.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>Aucun bulletin trouvé</h3>
          <p>Créez votre premier bulletin de mouvement pour planifier les vols.</p>
          <button v-if="canCreate" class="btn-primary" @click="goToCreate">
            Créer un bulletin
          </button>
        </div>

        <!-- Liste des bulletins -->
        <div v-else class="bulletins-grid">
          <div
            v-for="bulletin in bulletins"
            :key="bulletin._id"
            class="bulletin-card"
            @click="goToDetail(bulletin._id)"
          >
            <div class="card-header">
              <div class="card-title">
                <span class="escale-badge">{{ bulletin.escale }}</span>
                <span class="semaine-badge">S{{ bulletin.numeroSemaine }}</span>
              </div>
              <span
                class="statut-badge"
                :style="{
                  backgroundColor: getStatutColor(bulletin.statut).bg,
                  color: getStatutColor(bulletin.statut).text
                }"
              >
                {{ getStatutLabel(bulletin.statut) }}
              </span>
            </div>

            <div class="card-body">
              <h3>{{ bulletin.titre || `Bulletin Semaine ${bulletin.numeroSemaine}` }}</h3>
              <p class="period">
                {{ formatDate(bulletin.dateDebut) }} - {{ formatDate(bulletin.dateFin) }}
              </p>
            </div>

            <div class="card-stats">
              <div class="stat">
                <span class="stat-value">{{ bulletin.nombreMouvements || 0 }}</span>
                <span class="stat-label">Mouvements</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ (bulletin.compagnies || []).length }}</span>
                <span class="stat-label">Compagnies</span>
              </div>
            </div>

            <div class="card-footer">
              <span class="date-info">
                Créé le {{ formatDateTime(bulletin.createdAt) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pages > 1" class="pagination">
          <button
            class="btn-pagination"
            :disabled="page === 1"
            @click="changePage(page - 1)"
          >
            Précédent
          </button>
          <span class="page-info">Page {{ page }} / {{ pages }}</span>
          <button
            class="btn-pagination"
            :disabled="page === pages"
            @click="changePage(page + 1)"
          >
            Suivant
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBulletinStore, STATUT_COLORS } from '@/stores/bulletinStore'
import { useAuth } from '@/composables/useAuth'
import { hasPermission, ACTIONS } from '@/utils/permissions'

const router = useRouter()
const bulletinStore = useBulletinStore()
const { userRole } = useAuth()

// Filtres locaux
const filtres = ref({
  escale: '',
  statut: '',
  dateDebut: '',
  dateFin: ''
})

// Computed
const loading = computed(() => bulletinStore.isLoading)
const error = computed(() => bulletinStore.getError)
const bulletins = computed(() => bulletinStore.getBulletins)
const page = computed(() => bulletinStore.getPagination.page)
const pages = computed(() => bulletinStore.getPagination.pages)
const canCreate = computed(() => hasPermission(userRole.value, ACTIONS.BULLETIN_CREER))

// Helpers
const getStatutColor = (statut) => STATUT_COLORS[statut] || STATUT_COLORS.BROUILLON
const getStatutLabel = (statut) => STATUT_COLORS[statut]?.label || statut

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Actions
const loadBulletins = async () => {
  try {
    await bulletinStore.fetchBulletins()
  } catch (e) {
    console.error('Erreur chargement bulletins:', e)
  }
}

const applyFilters = async () => {
  bulletinStore.setFiltres(filtres.value)
  await loadBulletins()
}

const resetFilters = async () => {
  filtres.value = { escale: '', statut: '', dateDebut: '', dateFin: '' }
  bulletinStore.resetFiltres()
  await loadBulletins()
}

const changePage = async (newPage) => {
  await bulletinStore.fetchBulletins({ page: newPage })
}

const goToCreate = () => {
  router.push('/bulletins/nouveau')
}

const goToDetail = (id) => {
  router.push(`/bulletins/${id}`)
}

// Lifecycle
onMounted(() => {
  loadBulletins()
})
</script>

<style scoped>
.bulletins-container {
  min-height: calc(100vh - 64px);
  background: var(--bg-body);
}

.bulletins-main {
  padding: 24px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header-bar h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Filtres */
.filters-section {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.filter-input,
.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  min-width: 120px;
  background: var(--bg-input);
  color: var(--text-primary);
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.filter-actions {
  display: flex;
  gap: 8px;
}

/* Boutons */
.btn-primary {
  background: #2563eb;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: var(--bg-input);
  color: var(--text-primary);
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: var(--border-color);
}

.btn-text {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
}

.btn-text:hover {
  color: var(--text-primary);
}

/* États */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-card);
  border-radius: 8px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

/* Grille bulletins */
.bulletins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.bulletin-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.bulletin-card:hover {
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  display: flex;
  gap: 8px;
}

.escale-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
}

.semaine-badge {
  background: var(--bg-input);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.statut-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.card-body h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.period {
  font-size: 14px;
  color: var(--text-secondary);
}

.card-stats {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.date-info {
  font-size: 12px;
  color: var(--text-secondary);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
}

.btn-pagination {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);
}

.btn-pagination:hover:not(:disabled) {
  background: var(--bg-input);
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
