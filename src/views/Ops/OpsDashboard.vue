<template>
  <div class="ops-dashboard">
    <!-- ═══════════════════════════════════════════════════════════
         HEADER
         ═══════════════════════════════════════════════════════════ -->
    <div class="ops-header">
      <div class="ops-header-left">
        <h1 class="ops-title">
          <svg class="ops-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          OPS Control Center
        </h1>
        <span class="ops-subtitle">Supervision temps réel des opérations</span>
      </div>
      <div class="ops-header-right">
        <!-- Indicateur connexion SSE -->
        <div class="sse-indicator" :class="{ 'sse-connected': opsStore.isConnected, 'sse-disconnected': !opsStore.isConnected }">
          <span class="sse-dot"></span>
          <span class="sse-label">{{ opsStore.isConnected ? 'Temps réel' : 'Déconnecté' }}</span>
        </div>
        <!-- Bouton refresh -->
        <button @click="refreshDashboard" class="btn-refresh" :disabled="opsStore.loading">
          <svg class="w-4 h-4" :class="{ 'animate-spin': opsStore.loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Rafraîchir
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════
         STATS GRID — CRV par statut
         ═══════════════════════════════════════════════════════════ -->
    <div class="stats-grid">
      <div v-for="stat in statusCards" :key="stat.status" class="stat-card" :style="{ borderColor: stat.color }">
        <div class="stat-value" :style="{ color: stat.color }">{{ stat.count }}</div>
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-bar" :style="{ backgroundColor: stat.color, width: stat.percentage + '%' }"></div>
      </div>
      <!-- Carte total -->
      <div class="stat-card stat-card-total">
        <div class="stat-value">{{ opsStore.totalCRV }}</div>
        <div class="stat-label">Total CRV</div>
        <div class="stat-bar stat-bar-total" style="width: 100%"></div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════
         ZONE PRINCIPALE — 2 colonnes
         ═══════════════════════════════════════════════════════════ -->
    <div class="ops-main">
      <!-- ─── COLONNE GAUCHE : Feed événements temps réel ─── -->
      <div class="ops-column ops-events-column">
        <div class="column-header">
          <h2 class="column-title">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Feed Temps Réel
          </h2>
          <span class="event-count">{{ opsStore.events.length }} événement(s)</span>
        </div>

        <div class="events-feed" ref="eventsFeed">
          <template v-if="opsStore.recentEvents.length > 0">
            <div
              v-for="event in opsStore.recentEvents"
              :key="event.id"
              class="event-item"
              :class="'event-' + event.priority.toLowerCase()"
            >
              <div class="event-priority-bar" :class="'priority-' + event.priority.toLowerCase()"></div>
              <div class="event-content">
                <div class="event-header">
                  <span class="event-label">{{ event.label }}</span>
                  <span class="event-badge" :class="'badge-' + event.priority.toLowerCase()">
                    {{ event.priority }}
                  </span>
                </div>
                <div class="event-details">
                  <span v-if="event.data?.numeroCRV" class="event-crv">{{ event.data.numeroCRV }}</span>
                  <span v-if="event.data?.userName" class="event-user">{{ event.data.userName }}</span>
                  <span v-if="event.data?.details" class="event-detail-text">{{ event.data.details }}</span>
                </div>
                <div class="event-time">{{ formatTime(event.timestamp) }}</div>
              </div>
            </div>
          </template>
          <div v-else class="events-empty">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p>Aucun événement pour le moment</p>
            <p class="text-sm opacity-50">Les événements apparaîtront ici en temps réel</p>
          </div>
        </div>
      </div>

      <!-- ─── COLONNE DROITE : Alertes SLA ─── -->
      <div class="ops-column ops-alerts-column">
        <div class="column-header">
          <h2 class="column-title">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Alertes SLA
          </h2>
          <span class="alert-count" :class="{ 'alert-active': opsStore.alertCount > 0 }">
            {{ opsStore.alertCount }} alerte(s)
          </span>
        </div>

        <div class="alerts-list">
          <template v-if="opsStore.activeAlerts.length > 0">
            <div
              v-for="alert in opsStore.activeAlerts"
              :key="alert.id"
              class="alert-item"
              :class="'alert-' + alert.priority.toLowerCase()"
            >
              <div class="alert-icon">
                <svg v-if="alert.priority === 'CRITIQUE'" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="alert-content">
                <div class="alert-label">{{ alert.label }}</div>
                <div class="alert-info">
                  <span v-if="alert.data?.numeroCRV">{{ alert.data.numeroCRV }}</span>
                  <span v-if="alert.data?.details">{{ alert.data.details }}</span>
                </div>
                <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
              </div>
            </div>
          </template>
          <div v-else class="alerts-empty">
            <svg class="w-12 h-12 mx-auto mb-2 text-green-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-green-600">Aucune alerte active</p>
            <p class="text-sm opacity-50">Toutes les opérations sont dans les délais SLA</p>
          </div>
        </div>

        <!-- Info connexion -->
        <div class="ops-info-panel">
          <div class="info-row">
            <span class="info-label">Clients connectés</span>
            <span class="info-value">{{ opsStore.dashboard.clients || 0 }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Dernière mise à jour</span>
            <span class="info-value">{{ opsStore.lastRefresh ? formatTime(opsStore.lastRefresh) : '—' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * OPS DASHBOARD — Vue principale du Centre de Contrôle Opérationnel
 *
 * MODULE OPS CONTROL CENTER v1.0.0
 *
 * Lifecycle :
 * - onMounted → connectSSE + fetchDashboard
 * - onUnmounted → disconnectSSE
 */
import { useOpsStore } from '@/stores/opsStore'

export default {
  name: 'OpsDashboard',

  setup() {
    const opsStore = useOpsStore()
    return { opsStore }
  },

  computed: {
    /**
     * Cartes de statut CRV avec couleurs et pourcentages
     */
    statusCards() {
      const statuses = [
        { status: 'BROUILLON', label: 'Brouillon', color: '#9ca3af' },
        { status: 'EN_COURS', label: 'En cours', color: '#f59e0b' },
        { status: 'TERMINE', label: 'Terminé', color: '#3b82f6' },
        { status: 'VALIDE', label: 'Validé', color: '#10b981' },
        { status: 'VERROUILLE', label: 'Verrouillé', color: '#6366f1' },
        { status: 'ANNULE', label: 'Annulé', color: '#ef4444' }
      ]

      const total = this.opsStore.totalCRV || 1 // Éviter division par 0

      return statuses.map(s => ({
        ...s,
        count: this.opsStore.crvByStatus[s.status] || 0,
        percentage: Math.round(((this.opsStore.crvByStatus[s.status] || 0) / total) * 100)
      }))
    }
  },

  methods: {
    /**
     * Formate un timestamp ISO en heure locale lisible
     */
    formatTime(timestamp) {
      if (!timestamp) return '—'
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMin = Math.floor(diffMs / 60000)

      if (diffMin < 1) return 'À l\'instant'
      if (diffMin < 60) return `Il y a ${diffMin} min`

      const diffH = Math.floor(diffMin / 60)
      if (diffH < 24) return `Il y a ${diffH}h`

      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    /**
     * Rafraîchit le dashboard manuellement
     */
    refreshDashboard() {
      this.opsStore.fetchDashboard()
    }
  },

  mounted() {
    // Initialiser SSE + auto-refresh dashboard
    this.opsStore.initialize()
  },

  unmounted() {
    // Nettoyer SSE + intervals
    this.opsStore.cleanup()
  }
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   OPS DASHBOARD — STYLES
   ═══════════════════════════════════════════════════════════════ */

.ops-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* ─── HEADER ─────────────────────────────────────────────────── */
.ops-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.ops-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ops-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
  margin: 0;
}

.ops-icon {
  width: 28px;
  height: 28px;
  color: #6366f1;
}

.ops-subtitle {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
}

.ops-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ─── SSE INDICATOR ──────────────────────────────────────────── */
.sse-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.sse-connected {
  background: #dcfce7;
  color: #166534;
}

.sse-disconnected {
  background: #fee2e2;
  color: #991b1b;
}

.sse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.sse-connected .sse-dot {
  background: #22c55e;
  animation: pulse-green 2s infinite;
}

.sse-disconnected .sse-dot {
  background: #ef4444;
}

@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ─── REFRESH BUTTON ─────────────────────────────────────────── */
.btn-refresh {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-card, white);
  color: var(--text-primary, #374151);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: var(--bg-body, #f9fafb);
  border-color: #6366f1;
  color: #6366f1;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ─── STATS GRID ─────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(7, 1fr);
  }
}

.stat-card {
  background: var(--bg-card, white);
  border: 1px solid var(--border-color, #e5e7eb);
  border-top: 3px solid;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.stat-card-total {
  border-top-color: #6366f1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-card-total .stat-value {
  color: #6366f1;
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  opacity: 0.3;
  transition: width 0.5s ease;
}

.stat-bar-total {
  background: #6366f1;
}

/* ─── MAIN LAYOUT ────────────────────────────────────────────── */
.ops-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 1024px) {
  .ops-main {
    grid-template-columns: 3fr 2fr;
  }
}

.ops-column {
  background: var(--bg-card, white);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
}

/* ─── COLUMN HEADER ──────────────────────────────────────────── */
.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-body, #f9fafb);
}

.column-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin: 0;
}

.event-count {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  background: var(--bg-card, white);
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color, #e5e7eb);
}

.alert-count {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  background: var(--bg-card, white);
  border: 1px solid var(--border-color, #e5e7eb);
  color: var(--text-secondary, #6b7280);
}

.alert-count.alert-active {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
  font-weight: 600;
}

/* ─── EVENTS FEED ────────────────────────────────────────────── */
.events-feed {
  max-height: 500px;
  overflow-y: auto;
  padding: 8px;
}

.event-item {
  display: flex;
  gap: 0;
  margin-bottom: 6px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color, #e5e7eb);
  transition: transform 0.15s;
}

.event-item:hover {
  transform: translateX(2px);
}

.event-priority-bar {
  width: 4px;
  flex-shrink: 0;
}

.priority-critique { background: #ef4444; }
.priority-haute { background: #f59e0b; }
.priority-normale { background: #3b82f6; }
.priority-basse { background: #9ca3af; }

.event-content {
  flex: 1;
  padding: 10px 12px;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.event-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.event-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-critique { background: #fef2f2; color: #991b1b; }
.badge-haute { background: #fffbeb; color: #92400e; }
.badge-normale { background: #eff6ff; color: #1e40af; }
.badge-basse { background: #f3f4f6; color: #6b7280; }

.event-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

.event-crv {
  font-weight: 600;
  color: #6366f1;
}

.event-time {
  font-size: 11px;
  color: var(--text-secondary, #9ca3af);
  margin-top: 4px;
}

.events-empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary, #6b7280);
}

/* ─── ALERTS LIST ────────────────────────────────────────────── */
.alerts-list {
  padding: 8px;
  max-height: 350px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 6px;
  border-radius: 8px;
  border: 1px solid;
}

.alert-critique {
  background: #fef2f2;
  border-color: #fecaca;
}

.alert-haute {
  background: #fffbeb;
  border-color: #fde68a;
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-content {
  flex: 1;
}

.alert-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin-bottom: 2px;
}

.alert-info {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

.alert-info span + span::before {
  content: ' · ';
}

.alert-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.alerts-empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary, #6b7280);
}

/* ─── INFO PANEL ─────────────────────────────────────────────── */
.ops-info-panel {
  padding: 12px 20px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-body, #f9fafb);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.info-label {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

.info-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary, #374151);
}

/* ─── ANIMATIONS ─────────────────────────────────────────────── */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ─── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 640px) {
  .ops-dashboard {
    padding: 16px 8px;
  }

  .ops-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .ops-title {
    font-size: 20px;
  }

  .stat-value {
    font-size: 22px;
  }

  .events-feed {
    max-height: 400px;
  }
}
</style>
