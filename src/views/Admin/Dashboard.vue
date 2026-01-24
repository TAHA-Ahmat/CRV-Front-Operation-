<template>
  <div class="dashboard-admin-container">
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1>Dashboard Administrateur</h1>
          <span class="subtitle">Vue d'ensemble du systeme CRV</span>
        </div>
        <div class="header-actions">
          <button @click="refreshAll" class="btn btn-secondary" :disabled="loading">
            <span v-if="loading">Actualisation...</span>
            <span v-else>Actualiser</span>
          </button>
        </div>
      </div>
    </header>

    <main class="page-main">
      <!-- Section Utilisateurs -->
      <section class="stats-section">
        <div class="section-header">
          <h2>Statistiques Utilisateurs</h2>
          <router-link to="/admin/utilisateurs" class="link-more">
            Gerer les utilisateurs
          </router-link>
        </div>

        <div class="stats-grid stats-grid-5">
          <div class="stat-card">
            <div class="stat-icon users-total">
              <span>👥</span>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.total || 0 }}</div>
              <div class="stat-label">Utilisateurs total</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon users-active">
              <span>✓</span>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.actifs || 0 }}</div>
              <div class="stat-label">Actifs</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon users-inactive">
              <span>⏸</span>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.inactifs || 0 }}</div>
              <div class="stat-label">Inactifs</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon users-suspended">
              <span>🚫</span>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.suspendus || 0 }}</div>
              <div class="stat-label">Suspendus</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon users-conge">
              <span>🏖</span>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.enConge || 0 }}</div>
              <div class="stat-label">En conge</div>
            </div>
          </div>
        </div>

        <!-- Repartition par fonction -->
        <div class="chart-container">
          <h3>Repartition par fonction</h3>
          <div class="fonction-bars">
            <div
              v-for="(data, fonction) in userStats.parFonction"
              :key="fonction"
              class="fonction-bar-item"
            >
              <div class="bar-label">{{ formatFonction(fonction) }}</div>
              <div class="bar-wrapper">
                <div
                  class="bar-fill"
                  :class="'fonction-' + fonction.toLowerCase()"
                  :style="{ width: getBarWidth(data.count, userStats.total) }"
                ></div>
              </div>
              <div class="bar-stats">
                <span class="bar-count">{{ data.count }}</span>
                <span class="bar-actifs">({{ data.actifs }} actifs)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section CRV -->
      <section class="stats-section">
        <div class="section-header">
          <h2>Statistiques CRV</h2>
          <router-link to="/crv" class="link-more">
            Voir les CRV
          </router-link>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon crv-total">
              <span>📋</span>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ crvStats.total || 0 }}</div>
              <div class="stat-label">CRV total</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon crv-valide">
              <span>✓</span>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ crvStats.valides || 0 }}</div>
              <div class="stat-label">Valides</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon crv-encours">
              <span>⏳</span>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ crvStats.enCours || 0 }}</div>
              <div class="stat-label">En cours</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon crv-archives">
              <span>📁</span>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ crvStats.archives || 0 }}</div>
              <div class="stat-label">Archives</div>
            </div>
          </div>
        </div>

        <!-- Repartition par statut -->
        <div class="chart-container" v-if="crvStats.parStatut && Object.keys(crvStats.parStatut).length">
          <h3>Repartition par statut</h3>
          <div class="status-bars">
            <div
              v-for="(count, statut) in crvStats.parStatut"
              :key="statut"
              class="status-bar-item"
            >
              <div class="bar-label">{{ formatStatut(statut) }}</div>
              <div class="bar-wrapper">
                <div
                  class="bar-fill"
                  :class="'statut-' + statut.toLowerCase()"
                  :style="{ width: getBarWidth(count, crvStats.total) }"
                ></div>
              </div>
              <div class="bar-count">{{ count }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section Archivage -->
      <section class="stats-section">
        <div class="section-header">
          <h2>Etat du service d'archivage</h2>
        </div>

        <div class="archivage-status" :class="archiveStatus.status">
          <div class="archivage-indicator">
            <span v-if="archiveStatus.status === 'connected'" class="status-dot connected"></span>
            <span v-else-if="archiveStatus.status === 'error'" class="status-dot error"></span>
            <span v-else class="status-dot unknown"></span>
          </div>
          <div class="archivage-info">
            <div class="archivage-title">
              Google Drive
              <span class="archivage-badge" :class="archiveStatus.status">
                {{ archiveStatus.status === 'connected' ? 'Connecte' : archiveStatus.status === 'error' ? 'Erreur' : 'Inconnu' }}
              </span>
            </div>
            <div class="archivage-details" v-if="archiveStatus.lastCheck">
              Derniere verification: {{ formatDate(archiveStatus.lastCheck) }}
            </div>
          </div>
          <button @click="testArchivage" class="btn btn-sm btn-outline" :disabled="testingArchive">
            {{ testingArchive ? 'Test...' : 'Tester connexion' }}
          </button>
        </div>

        <div class="stats-grid stats-grid-3 mt-20">
          <div class="stat-card stat-card-sm">
            <div class="stat-info">
              <div class="stat-value">{{ archiveStats.totalArchives || 0 }}</div>
              <div class="stat-label">CRV archives</div>
            </div>
          </div>
          <div class="stat-card stat-card-sm">
            <div class="stat-info">
              <div class="stat-value">{{ archiveStats.totalProgrammes || 0 }}</div>
              <div class="stat-label">Programmes archives</div>
            </div>
          </div>
          <div class="stat-card stat-card-sm">
            <div class="stat-info">
              <div class="stat-value">{{ archiveStats.enAttente || 0 }}</div>
              <div class="stat-label">En attente d'archivage</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section Activite recente -->
      <section class="stats-section">
        <div class="section-header">
          <h2>Activite recente</h2>
        </div>

        <div class="activity-list" v-if="recentActivity.length">
          <div
            v-for="(activity, index) in recentActivity"
            :key="index"
            class="activity-item"
          >
            <div class="activity-icon" :class="activity.type">
              <span>{{ getActivityIcon(activity.type) }}</span>
            </div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.message }}</div>
              <div class="activity-meta">
                <span class="activity-user" v-if="activity.user">{{ activity.user }}</span>
                <span class="activity-time">{{ formatRelativeTime(activity.date) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          Aucune activite recente
        </div>
      </section>

      <!-- Toast -->
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { personnesAPI, crvAPI } from '@/services/api'

// Etats
const loading = ref(false)
const testingArchive = ref(false)
const toast = reactive({ show: false, message: '', type: 'success' })

// Stats utilisateurs
const userStats = ref({
  total: 0,
  actifs: 0,
  inactifs: 0,
  suspendus: 0,
  enConge: 0,
  parFonction: {}
})

// Stats CRV
const crvStats = ref({
  total: 0,
  valides: 0,
  enCours: 0,
  archives: 0,
  parStatut: {}
})

// Archivage
const archiveStatus = ref({
  status: 'unknown',
  lastCheck: null
})

const archiveStats = ref({
  totalArchives: 0,
  totalProgrammes: 0,
  enAttente: 0
})

// Activite recente
const recentActivity = ref([])

// Chargement initial
onMounted(async () => {
  await refreshAll()
})

const refreshAll = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadUserStats(),
      loadCRVStats(),
      loadArchiveStatus(),
      loadRecentActivity()
    ])
  } catch (error) {
    console.error('[Dashboard Admin] Erreur:', error)
    showToast('Erreur lors du chargement des donnees', 'error')
  } finally {
    loading.value = false
  }
}

const loadUserStats = async () => {
  try {
    // Charger tous les utilisateurs pour calculer les stats
    const response = await personnesAPI.getAll({ limit: 1000 })
    const users = response.data?.personnes || response.data || []

    // Calculer les statistiques
    const stats = {
      total: users.length,
      actifs: 0,
      inactifs: 0,
      suspendus: 0,
      enConge: 0,
      parFonction: {}
    }

    users.forEach(user => {
      // Compter par statut
      const statut = user.statut || user.statutCompte || 'ACTIF'
      switch (statut.toUpperCase()) {
        case 'ACTIF':
        case 'VALIDE':
          stats.actifs++
          break
        case 'INACTIF':
        case 'DESACTIVE':
          stats.inactifs++
          break
        case 'SUSPENDU':
          stats.suspendus++
          break
        case 'CONGE':
          stats.enConge++
          break
      }

      // Compter par fonction
      const fonction = user.fonction || 'AUTRE'
      if (!stats.parFonction[fonction]) {
        stats.parFonction[fonction] = { count: 0, actifs: 0 }
      }
      stats.parFonction[fonction].count++
      if (['ACTIF', 'VALIDE'].includes(statut.toUpperCase())) {
        stats.parFonction[fonction].actifs++
      }
    })

    userStats.value = stats
    console.log('[Dashboard Admin] Stats utilisateurs:', stats)
  } catch (error) {
    console.warn('[Dashboard Admin] Erreur stats utilisateurs:', error.message)
  }
}

const loadCRVStats = async () => {
  try {
    // Utiliser l'endpoint de stats si disponible
    const response = await crvAPI.getStats({})
    const data = response.data || {}

    crvStats.value = {
      total: data.total || 0,
      valides: data.valides || data.parStatut?.VALIDE || 0,
      enCours: data.enCours || data.parStatut?.EN_COURS || 0,
      archives: data.archives || data.parStatut?.VERROUILLE || 0,
      parStatut: data.parStatut || {}
    }

    // Compter les CRV archives (avec info archivage)
    archiveStats.value.totalArchives = data.archives || 0
    archiveStats.value.enAttente = (data.parStatut?.VALIDE || 0) + (data.parStatut?.VERROUILLE || 0) - (data.archives || 0)
    if (archiveStats.value.enAttente < 0) archiveStats.value.enAttente = 0

    console.log('[Dashboard Admin] Stats CRV:', crvStats.value)
  } catch (error) {
    console.warn('[Dashboard Admin] Erreur stats CRV:', error.message)
    // Fallback: charger la liste et calculer
    try {
      const listResponse = await crvAPI.getAll({ limit: 1000 })
      const crvList = listResponse.data?.crv || listResponse.data || []

      const stats = {
        total: crvList.length,
        valides: 0,
        enCours: 0,
        archives: 0,
        parStatut: {}
      }

      crvList.forEach(crv => {
        const statut = crv.statut || 'BROUILLON'
        stats.parStatut[statut] = (stats.parStatut[statut] || 0) + 1

        if (statut === 'VALIDE') stats.valides++
        if (statut === 'EN_COURS') stats.enCours++
        if (crv.archivage?.fileId) stats.archives++
      })

      crvStats.value = stats
      archiveStats.value.totalArchives = stats.archives
    } catch (fallbackError) {
      console.warn('[Dashboard Admin] Fallback stats CRV echoue:', fallbackError.message)
    }
  }
}

const loadArchiveStatus = async () => {
  try {
    const response = await crvAPI.getArchiveStatus()
    const data = response.data || {}

    archiveStatus.value = {
      status: data.connected ? 'connected' : 'error',
      lastCheck: new Date()
    }
  } catch (error) {
    console.warn('[Dashboard Admin] Erreur status archivage:', error.message)
    archiveStatus.value = {
      status: 'unknown',
      lastCheck: null
    }
  }
}

const loadRecentActivity = async () => {
  // Simuler l'activite recente basee sur les donnees disponibles
  const activities = []

  try {
    // Charger les derniers CRV crees
    const crvResponse = await crvAPI.getAll({ limit: 5, sort: '-dateCreation' })
    const recentCRV = crvResponse.data?.crv || crvResponse.data || []

    recentCRV.forEach(crv => {
      activities.push({
        type: 'crv',
        message: `CRV ${crv.numeroCRV || 'nouveau'} cree`,
        user: crv.creePar ? `${crv.creePar.prenom} ${crv.creePar.nom}` : null,
        date: crv.dateCreation
      })
    })

    // Trier par date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date))
    recentActivity.value = activities.slice(0, 10)
  } catch (error) {
    console.warn('[Dashboard Admin] Erreur activite recente:', error.message)
  }
}

const testArchivage = async () => {
  testingArchive.value = true
  try {
    const response = await crvAPI.testArchive()
    if (response.data?.success) {
      archiveStatus.value.status = 'connected'
      showToast('Connexion Google Drive OK', 'success')
    } else {
      archiveStatus.value.status = 'error'
      showToast('Erreur de connexion Google Drive', 'error')
    }
    archiveStatus.value.lastCheck = new Date()
  } catch (error) {
    archiveStatus.value.status = 'error'
    showToast(error.response?.data?.message || 'Erreur test archivage', 'error')
  } finally {
    testingArchive.value = false
  }
}

// Formatters
const formatFonction = (fonction) => {
  const map = {
    'AGENT_ESCALE': 'Agent d\'escale',
    'CHEF_EQUIPE': 'Chef d\'equipe',
    'SUPERVISEUR': 'Superviseur',
    'MANAGER': 'Manager',
    'QUALITE': 'Qualite',
    'ADMIN': 'Administrateur',
    'AUTRE': 'Autre'
  }
  return map[fonction] || fonction
}

const formatStatut = (statut) => {
  const map = {
    'BROUILLON': 'Brouillon',
    'EN_COURS': 'En cours',
    'TERMINE': 'Termine',
    'VALIDE': 'Valide',
    'VERROUILLE': 'Verrouille',
    'ANNULE': 'Annule'
  }
  return map[statut] || statut
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatRelativeTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const then = new Date(date)
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'A l\'instant'
  if (diffMin < 60) return `Il y a ${diffMin} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return formatDate(date)
}

const getBarWidth = (count, total) => {
  if (!total) return '0%'
  return Math.max(5, Math.round((count / total) * 100)) + '%'
}

const getActivityIcon = (type) => {
  const icons = {
    'crv': '📋',
    'user': '👤',
    'archive': '📁',
    'validation': '✓'
  }
  return icons[type] || '📌'
}

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
.dashboard-admin-container {
  min-height: 100vh;
  background: #f9fafb;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  display: block;
  margin-top: 4px;
}

.page-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* Stats Section */
.stats-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.link-more {
  font-size: 14px;
  color: #2563eb;
  text-decoration: none;
}

.link-more:hover {
  text-decoration: underline;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.stats-grid-5 {
  grid-template-columns: repeat(5, 1fr);
}

.stats-grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.stat-card-sm {
  padding: 15px;
}

.stat-card-sm .stat-value {
  font-size: 24px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.users-total { background: #dbeafe; }
.stat-icon.users-active { background: #dcfce7; }
.stat-icon.users-inactive { background: #f3f4f6; }
.stat-icon.users-suspended { background: #fee2e2; }
.stat-icon.users-conge { background: #fef3c7; }
.stat-icon.crv-total { background: #dbeafe; }
.stat-icon.crv-valide { background: #dcfce7; }
.stat-icon.crv-encours { background: #fef3c7; }
.stat-icon.crv-archives { background: #e0e7ff; }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

/* Charts */
.chart-container {
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.chart-container h3 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 15px 0;
}

.fonction-bars,
.status-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fonction-bar-item,
.status-bar-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.bar-label {
  width: 120px;
  font-size: 13px;
  color: #374151;
}

.bar-wrapper {
  flex: 1;
  height: 24px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
}

/* Fonction colors */
.bar-fill.fonction-agent_escale { background: #3b82f6; }
.bar-fill.fonction-chef_equipe { background: #8b5cf6; }
.bar-fill.fonction-superviseur { background: #f59e0b; }
.bar-fill.fonction-manager { background: #10b981; }
.bar-fill.fonction-qualite { background: #ec4899; }
.bar-fill.fonction-admin { background: #ef4444; }
.bar-fill.fonction-autre { background: #6b7280; }

/* Statut colors */
.bar-fill.statut-brouillon { background: #9ca3af; }
.bar-fill.statut-en_cours { background: #f59e0b; }
.bar-fill.statut-termine { background: #3b82f6; }
.bar-fill.statut-valide { background: #10b981; }
.bar-fill.statut-verrouille { background: #6366f1; }
.bar-fill.statut-annule { background: #ef4444; }

.bar-stats {
  width: 100px;
  text-align: right;
}

.bar-count {
  font-weight: 600;
  color: #374151;
}

.bar-actifs {
  font-size: 12px;
  color: #6b7280;
  margin-left: 5px;
}

/* Archivage */
.archivage-status {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.archivage-status.connected {
  border-color: #10b981;
  background: #f0fdf4;
}

.archivage-status.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.archivage-indicator {
  flex-shrink: 0;
}

.status-dot {
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.status-dot.connected {
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

.status-dot.error {
  background: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
}

.status-dot.unknown {
  background: #9ca3af;
}

.archivage-info {
  flex: 1;
}

.archivage-title {
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.archivage-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.archivage-badge.connected {
  background: #dcfce7;
  color: #166534;
}

.archivage-badge.error {
  background: #fee2e2;
  color: #991b1b;
}

.archivage-badge.unknown {
  background: #f3f4f6;
  color: #6b7280;
}

.archivage-details {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.mt-20 {
  margin-top: 20px;
}

/* Activity */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: #e5e7eb;
}

.activity-icon.crv { background: #dbeafe; }
.activity-icon.user { background: #dcfce7; }
.activity-icon.archive { background: #e0e7ff; }
.activity-icon.validation { background: #fef3c7; }

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #374151;
}

.activity-meta {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  display: flex;
  gap: 10px;
}

.activity-user {
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
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

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

@media (max-width: 1200px) {
  .stats-grid-5 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid,
  .stats-grid-5,
  .stats-grid-3 {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .bar-label {
    width: 80px;
    font-size: 12px;
  }

  .archivage-status {
    flex-direction: column;
    text-align: center;
  }
}
</style>
