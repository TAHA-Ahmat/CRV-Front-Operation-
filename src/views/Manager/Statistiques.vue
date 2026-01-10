<template>
  <div class="statistiques-container">
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="$router.push('/dashboard-manager')" class="btn-back">
            ← Retour
          </button>
          <h1>Statistiques</h1>
        </div>
        <div class="header-actions">
          <select v-model="periode" class="form-input periode-select" @change="loadAllStats">
            <option value="jour">Aujourd'hui</option>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
        </div>
      </div>
    </header>

    <main class="page-main">
      <!-- Section CRV -->
      <section class="stats-section">
        <h2>Statistiques CRV</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon crv">📋</div>
            <div class="stat-info">
              <div class="stat-value">{{ crvStats.total || 0 }}</div>
              <div class="stat-label">CRV créés</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon valide">✓</div>
            <div class="stat-info">
              <div class="stat-value">{{ crvStats.valides || 0 }}</div>
              <div class="stat-label">Validés</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon en-cours">⏳</div>
            <div class="stat-info">
              <div class="stat-value">{{ crvStats.enCours || 0 }}</div>
              <div class="stat-label">En cours</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon completude">📊</div>
            <div class="stat-info">
              <div class="stat-value">{{ crvStats.completudeMoyenne || 0 }}%</div>
              <div class="stat-label">Complétude moyenne</div>
            </div>
          </div>
        </div>

        <!-- Répartition par statut -->
        <div class="chart-container" v-if="crvStats.parStatut">
          <h3>Répartition par statut</h3>
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

      <!-- MVS-7 #3: Section Notifications (MANAGER uniquement) -->
      <section v-if="canViewNotificationStats" class="stats-section">
        <h2>Statistiques Notifications</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon notif">🔔</div>
            <div class="stat-info">
              <div class="stat-value">{{ notifStats.total || 0 }}</div>
              <div class="stat-label">Total envoyées</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon non-lues">📩</div>
            <div class="stat-info">
              <div class="stat-value">{{ notifStats.nonLues || 0 }}</div>
              <div class="stat-label">Non lues</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon urgentes">⚠️</div>
            <div class="stat-info">
              <div class="stat-value">{{ notifStats.urgentes || 0 }}</div>
              <div class="stat-label">Urgentes</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon taux">📈</div>
            <div class="stat-info">
              <div class="stat-value">{{ notifStats.tauxLecture || 0 }}%</div>
              <div class="stat-label">Taux de lecture</div>
            </div>
          </div>
        </div>

        <!-- Répartition par type -->
        <div class="chart-container" v-if="notifStats.parType">
          <h3>Répartition par type</h3>
          <div class="type-grid">
            <div
              v-for="(count, type) in notifStats.parType"
              :key="type"
              class="type-card"
              :class="'type-' + type.toLowerCase()"
            >
              <div class="type-count">{{ count }}</div>
              <div class="type-label">{{ formatTypeNotif(type) }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section Vols -->
      <section class="stats-section">
        <h2>Statistiques Vols</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon vols">✈️</div>
            <div class="stat-info">
              <div class="stat-value">{{ volsStats.total || 0 }}</div>
              <div class="stat-label">Vols traités</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon arrivees">🛬</div>
            <div class="stat-info">
              <div class="stat-value">{{ volsStats.arrivees || 0 }}</div>
              <div class="stat-label">Arrivées</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon departs">🛫</div>
            <div class="stat-info">
              <div class="stat-value">{{ volsStats.departs || 0 }}</div>
              <div class="stat-label">Départs</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon turnaround">🔄</div>
            <div class="stat-info">
              <div class="stat-value">{{ volsStats.turnarounds || 0 }}</div>
              <div class="stat-label">Turn-arounds</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section Charges -->
      <section class="stats-section">
        <h2>Statistiques Charges</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon passagers">👥</div>
            <div class="stat-info">
              <div class="stat-value">{{ chargesStats.passagers || 0 }}</div>
              <div class="stat-label">Passagers</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon bagages">🧳</div>
            <div class="stat-info">
              <div class="stat-value">{{ chargesStats.bagages || 0 }}</div>
              <div class="stat-label">Bagages (pcs)</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon fret">📦</div>
            <div class="stat-info">
              <div class="stat-value">{{ formatPoids(chargesStats.fretKg) }}</div>
              <div class="stat-label">Fret (kg)</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon dgr">⚠️</div>
            <div class="stat-info">
              <div class="stat-value">{{ chargesStats.dgr || 0 }}</div>
              <div class="stat-label">DGR traités</div>
            </div>
          </div>
        </div>
      </section>

      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner">Chargement des statistiques...</div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { crvAPI, notificationsAPI, volsAPI } from '@/services/api'
import { ROLES } from '@/config/roles'

const authStore = useAuthStore()

// États
const loading = ref(false)
const periode = ref('mois')

const crvStats = ref({
  total: 0,
  valides: 0,
  enCours: 0,
  completudeMoyenne: 0,
  parStatut: {}
})

const notifStats = ref({
  total: 0,
  nonLues: 0,
  urgentes: 0,
  tauxLecture: 0,
  parType: {}
})

const volsStats = ref({
  total: 0,
  arrivees: 0,
  departs: 0,
  turnarounds: 0
})

const chargesStats = ref({
  passagers: 0,
  bagages: 0,
  fretKg: 0,
  dgr: 0
})

// Permissions
const userRole = computed(() => authStore.currentUser?.fonction || authStore.currentUser?.role)
const canViewNotificationStats = computed(() => [ROLES.MANAGER, ROLES.ADMIN].includes(userRole.value))

// Chargement
onMounted(async () => {
  await loadAllStats()
})

const loadAllStats = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadCRVStats(),
      loadNotificationStats(),
      loadVolsStats(),
      loadChargesStats()
    ])
  } catch (error) {
    console.error('[Statistiques] Erreur chargement:', error)
  } finally {
    loading.value = false
  }
}

const loadCRVStats = async () => {
  try {
    const response = await crvAPI.getStatistiques({ periode: periode.value })
    const data = response.data || {}
    crvStats.value = {
      total: data.total || 0,
      valides: data.valides || 0,
      enCours: data.enCours || 0,
      completudeMoyenne: data.completudeMoyenne || 0,
      parStatut: data.parStatut || {}
    }
  } catch (error) {
    console.warn('[Statistiques] Erreur stats CRV:', error.message)
  }
}

// MVS-7 #3: Charger stats notifications
const loadNotificationStats = async () => {
  if (!canViewNotificationStats.value) return

  try {
    const response = await notificationsAPI.getStatistiques()
    const data = response.data || {}
    notifStats.value = {
      total: data.total || 0,
      nonLues: data.nonLues || 0,
      urgentes: data.urgentes || 0,
      tauxLecture: data.tauxLecture || Math.round(((data.total - data.nonLues) / data.total) * 100) || 0,
      parType: data.parType || {}
    }
  } catch (error) {
    console.warn('[Statistiques] Erreur stats notifications:', error.message)
  }
}

const loadVolsStats = async () => {
  try {
    const response = await volsAPI.getStatistiques({ periode: periode.value })
    const data = response.data || {}
    volsStats.value = {
      total: data.total || 0,
      arrivees: data.arrivees || 0,
      departs: data.departs || 0,
      turnarounds: data.turnarounds || 0
    }
  } catch (error) {
    console.warn('[Statistiques] Erreur stats vols:', error.message)
  }
}

const loadChargesStats = async () => {
  try {
    const response = await crvAPI.getStatistiquesCharges({ periode: periode.value })
    const data = response.data || {}
    chargesStats.value = {
      passagers: data.passagers || 0,
      bagages: data.bagages || 0,
      fretKg: data.fretKg || 0,
      dgr: data.dgr || 0
    }
  } catch (error) {
    console.warn('[Statistiques] Erreur stats charges:', error.message)
  }
}

// Formatters
const formatStatut = (statut) => {
  const map = {
    'BROUILLON': 'Brouillon',
    'EN_COURS': 'En cours',
    'TERMINE': 'Terminé',
    'VALIDE': 'Validé',
    'VERROUILLE': 'Verrouillé',
    'ANNULE': 'Annulé'
  }
  return map[statut] || statut
}

const formatTypeNotif = (type) => {
  const map = {
    'INFO': 'Information',
    'WARNING': 'Avertissement',
    'URGENT': 'Urgent',
    'SYSTEME': 'Système',
    'ERROR': 'Erreur',
    'SUCCESS': 'Succès',
    'ALERTE_SLA': 'Alerte SLA'
  }
  return map[type] || type
}

const formatPoids = (kg) => {
  if (!kg) return '0'
  if (kg >= 1000) {
    return (kg / 1000).toFixed(1) + 'T'
  }
  return kg.toLocaleString('fr-FR')
}

const getBarWidth = (count, total) => {
  if (!total) return '0%'
  return Math.round((count / total) * 100) + '%'
}
</script>

<style scoped>
.statistiques-container {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
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

.periode-select {
  width: 200px;
}

.page-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

/* Sections */
.stats-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stats-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
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

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.crv { background: #dbeafe; }
.stat-icon.valide { background: #dcfce7; }
.stat-icon.en-cours { background: #fef3c7; }
.stat-icon.completude { background: #e0e7ff; }
.stat-icon.notif { background: #fef3c7; }
.stat-icon.non-lues { background: #fee2e2; }
.stat-icon.urgentes { background: #fef3c7; }
.stat-icon.taux { background: #dcfce7; }
.stat-icon.vols { background: #dbeafe; }
.stat-icon.arrivees { background: #e0e7ff; }
.stat-icon.departs { background: #fce7f3; }
.stat-icon.turnaround { background: #d1fae5; }
.stat-icon.passagers { background: #dbeafe; }
.stat-icon.bagages { background: #fef3c7; }
.stat-icon.fret { background: #e0e7ff; }
.stat-icon.dgr { background: #fee2e2; }

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

/* Chart container */
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

/* Status bars */
.status-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-bar-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.bar-label {
  width: 100px;
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

.bar-fill.statut-brouillon { background: #9ca3af; }
.bar-fill.statut-en_cours { background: #f59e0b; }
.bar-fill.statut-termine { background: #3b82f6; }
.bar-fill.statut-valide { background: #10b981; }
.bar-fill.statut-verrouille { background: #6366f1; }
.bar-fill.statut-annule { background: #ef4444; }

.bar-count {
  width: 50px;
  text-align: right;
  font-weight: 600;
  color: #374151;
}

/* Type grid (notifications) */
.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.type-card {
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.type-card.type-info { background: #dbeafe; color: #1e40af; }
.type-card.type-warning { background: #fef3c7; color: #92400e; }
.type-card.type-urgent { background: #fee2e2; color: #991b1b; }
.type-card.type-systeme { background: #f3f4f6; color: #374151; }
.type-card.type-error { background: #fef2f2; color: #dc2626; }
.type-card.type-success { background: #dcfce7; color: #166534; }
.type-card.type-alerte_sla { background: #fce7f3; color: #9d174d; }

.type-count {
  font-size: 24px;
  font-weight: 700;
}

.type-label {
  font-size: 12px;
  margin-top: 4px;
}

/* Form */
.form-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

/* Loading */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  padding: 20px 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  color: #374151;
}
</style>
