<template>
  <div class="chef-dashboard-container">
    <main class="chef-main">
      <div class="page-header-bar">
        <div>
          <h1>Tableau de bord équipe</h1>
          <p class="page-subtitle">
            CRV du jour groupés par agent responsable — avec agrégat SLA par personne.
            Actualisation automatique toutes les 60 s.
          </p>
        </div>
        <div class="header-actions">
          <span class="last-refresh">
            Dernière maj : {{ lastRefreshLabel }}
          </span>
          <button class="btn btn-secondary" type="button" :disabled="loading" @click="refresh">
            <span class="refresh-icon">↻</span>
            Rafraîchir
          </button>
        </div>
      </div>

      <div class="container">
        <!-- Résumé global -->
        <div class="kpi-row">
          <div class="kpi-card">
            <div class="kpi-label">Agents actifs</div>
            <div class="kpi-value">{{ agentCards.length }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">CRV du jour (total)</div>
            <div class="kpi-value">{{ totalCRVDuJour }}</div>
          </div>
          <div class="kpi-card kpi-alert" :class="{ 'kpi-alert-on': totalAlertes > 0 }">
            <div class="kpi-label">Tâches en alerte</div>
            <div class="kpi-value">{{ totalAlertes }}</div>
          </div>
          <div class="kpi-card kpi-critical" :class="{ 'kpi-critical-on': totalDepassees > 0 }">
            <div class="kpi-label">Tâches dépassées</div>
            <div class="kpi-value">{{ totalDepassees }}</div>
          </div>
        </div>

        <div v-if="loading && agentCards.length === 0" class="loading-state">
          Chargement des CRV du jour…
        </div>
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="refresh">Réessayer</button>
        </div>
        <div v-else-if="agentCards.length === 0" class="empty-state">
          <p>Aucun CRV en cours pour aujourd'hui.</p>
        </div>

        <div v-else class="agents-grid">
          <article
            v-for="agent in agentCards"
            :key="agent.key"
            class="agent-card sla-fade-in"
            :class="{ 'agent-alert': agent.depassees >= 2 }"
            :aria-label="`Agent ${agent.nom}, ${agent.crvs.length} CRV, ${agent.alertes} en alerte, ${agent.depassees} dépassées`"
          >
            <header class="agent-head">
              <div class="agent-identity">
                <div class="agent-avatar" aria-hidden="true">{{ agent.initiales }}</div>
                <div class="agent-meta">
                  <h3 class="agent-name">{{ agent.nom }}</h3>
                  <span class="agent-role">{{ agent.role || 'Agent' }}</span>
                </div>
              </div>
              <div
                v-if="agent.depassees >= 2"
                class="agent-flag"
                title="Au moins 2 tâches dépassées sur les CRV de cet agent — attention requise"
              >
                ⚠ {{ agent.depassees }} dépassées
              </div>
            </header>

            <div class="agent-kpis">
              <div class="agent-kpi">
                <span class="agent-kpi-label">CRV en cours</span>
                <span class="agent-kpi-value">{{ agent.crvs.length }}</span>
              </div>
              <div class="agent-kpi" :class="{ 'agent-kpi-warn': agent.alertes > 0 }">
                <span class="agent-kpi-label">Tâches en alerte</span>
                <span class="agent-kpi-value">{{ agent.alertes }}</span>
              </div>
              <div class="agent-kpi" :class="{ 'agent-kpi-crit': agent.depassees > 0 }">
                <span class="agent-kpi-label">Dépassées</span>
                <span class="agent-kpi-value">{{ agent.depassees }}</span>
              </div>
            </div>

            <button
              class="btn-agent-toggle"
              type="button"
              @click="toggleOpen(agent.key)"
              :aria-expanded="openedKey === agent.key"
            >
              {{ openedKey === agent.key ? 'Masquer les CRV' : `Voir les ${agent.crvs.length} CRV` }}
            </button>

            <transition name="ce-expand">
              <ul v-if="openedKey === agent.key" class="agent-crv-list">
                <li
                  v-for="item in agent.crvs"
                  :key="item.crv._id || item.crv.id"
                  class="agent-crv-item"
                >
                  <div class="ce-crv-main">
                    <div class="ce-crv-ref">
                      <span class="ce-crv-num">{{ item.crv.numeroCRV }}</span>
                      <span class="ce-crv-type">{{ formatType(item.crv.typeOperation || item.crv.vol?.typeOperation) }}</span>
                    </div>
                    <div class="ce-crv-vol">
                      <span v-if="item.crv.vol?.numeroVol" class="ce-vol-code">{{ item.crv.vol.numeroVol }}</span>
                      <span v-if="item.crv.vol?.codeIATA" class="ce-vol-cie">{{ item.crv.vol.codeIATA }}</span>
                    </div>
                  </div>
                  <div class="ce-crv-status">
                    <SLABadge
                      v-if="item.sla"
                      :niveau="item.sla.niveau"
                      :show-label="true"
                      :custom-label="item.sla.label"
                      size="sm"
                    />
                    <span v-else class="ce-no-sla">—</span>
                  </div>
                  <button
                    class="btn-open-crv"
                    type="button"
                    @click="openCrv(item.crv)"
                    :aria-label="`Ouvrir ${item.crv.numeroCRV}`"
                  >
                    Ouvrir
                  </button>
                </li>
              </ul>
            </transition>
          </article>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
/**
 * ChefEquipeDashboard — Vue chef d'équipe (UX-4).
 *
 * - Liste les CRV du jour (EN_COURS + BROUILLON + TERMINE) groupés par agent
 *   responsable (personnelAffecte[].isResponsable === true, sinon fallback
 *   sur crv.creePar).
 * - Calcule pour chaque agent : nb CRV, nb tâches SLA en alerte, nb dépassées.
 * - Badge rouge si un agent a >= 2 tâches dépassées.
 * - Refresh polling toutes les 60 s.
 * - Clic sur carte → expand listing des CRV.
 * - Protection rôle : CHEF_EQUIPE + SUPERVISEUR + MANAGER (faite en routeur).
 */
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { crvAPI } from '@/services/api'
import { useSLA } from '@/composables/useSLA'
import SLABadge from '@/components/Common/SLABadge.vue'

const router = useRouter()
const { init: initSLA, calculerSLACRV } = useSLA()

const loading = ref(false)
const error = ref('')
const lastRefresh = ref(null)
const crvs = ref([]) // [{ crv, phases }]
const openedKey = ref(null)
let pollingInterval = null

const SLA_CODE_PREFIXES = ['CHECKIN_', 'BRIEFING_', 'BOARDING_', 'BAGAGES_', 'RAMP_', 'MSG_']

function isPhaseSLA(phase) {
  const code = phase?.phase?.code || phase?.code || ''
  return code && SLA_CODE_PREFIXES.some(p => code.startsWith(p))
}

function qualifyPhaseNiveau(phase) {
  const statut = phase.statut
  if (statut === 'TERMINE' || statut === 'NON_REALISE') return 'ok'
  const slaMode = phase?.phase?.slaMode || 'DUREE'
  const now = new Date()
  if (slaMode === 'DEADLINE') {
    if (statut === 'NON_COMMENCE' && phase.heureDebutPrevue) {
      const diffMin = (new Date(phase.heureDebutPrevue) - now) / 60000
      if (diffMin > 15) return 'ok'
      if (diffMin > 5) return 'warning'
      if (diffMin > 0) return 'critical'
      return 'exceeded'
    }
    if (statut === 'EN_COURS' && phase.heureFinPrevue) {
      const diffMin = (new Date(phase.heureFinPrevue) - now) / 60000
      if (diffMin > 10) return 'ok'
      if (diffMin > 3) return 'warning'
      if (diffMin > 0) return 'critical'
      return 'exceeded'
    }
  }
  if (statut === 'EN_COURS' && phase.heureDebutReelle && phase?.phase?.dureeStandardMinutes) {
    const elapsed = (now - new Date(phase.heureDebutReelle)) / 60000
    const ratio = elapsed / phase.phase.dureeStandardMinutes
    if (ratio >= 1) return 'exceeded'
    if (ratio >= 0.9) return 'critical'
    if (ratio >= 0.75) return 'warning'
  }
  return 'ok'
}

function responsableKey(crv) {
  // Priorité : personnelAffecte avec isResponsable
  const resp = (crv.personnelAffecte || []).find(p => p?.isResponsable)
  if (resp) {
    const fullname = [resp.prenom, resp.nom].filter(Boolean).join(' ').trim()
    const key = (resp.matricule || fullname || 'resp_inconnu').toLowerCase()
    return {
      key,
      nom: fullname || resp.matricule || 'Responsable',
      role: resp.fonction || 'Responsable'
    }
  }
  // Fallback : crv.creePar
  const c = crv.creePar || {}
  const fullname = [c.prenom, c.nom].filter(Boolean).join(' ').trim()
  if (fullname) {
    return {
      key: (c._id || c.id || fullname).toString().toLowerCase(),
      nom: fullname,
      role: c.role || 'Créateur'
    }
  }
  return { key: 'non_affecte', nom: 'Non affecté', role: '—' }
}

async function loadCRVsDuJour() {
  loading.value = true
  error.value = ''
  try {
    await initSLA()
    // Charger les CRV actifs
    const statuts = ['EN_COURS', 'BROUILLON', 'TERMINE']
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const aggregated = []
    for (const statut of statuts) {
      try {
        const r = await crvAPI.getAll({ statut, page: 1, limit: 50 })
        const data = r?.data?.data || r?.data || []
        const list = Array.isArray(data) ? data : (data.data || [])
        aggregated.push(...list)
      } catch { /* continue */ }
    }

    // Déduplication + filtre "aujourd'hui"
    const seen = new Set()
    const filtered = []
    for (const c of aggregated) {
      const id = c._id || c.id
      if (!id || seen.has(id)) continue
      seen.add(id)
      const d = new Date(c.dateCreation || c.createdAt || 0)
      // CRV "du jour" = créé aujourd'hui OU statut actif non terminal
      if (d >= today || ['EN_COURS', 'BROUILLON', 'TERMINE'].includes(c.statut)) {
        filtered.push(c)
      }
    }

    // Charger phases pour compter les tâches en alerte (parallèle, limité)
    const enriched = []
    const chunkSize = 6
    for (let i = 0; i < filtered.length; i += chunkSize) {
      const chunk = filtered.slice(i, i + chunkSize)
      const results = await Promise.all(chunk.map(async (c) => {
        try {
          const r = await crvAPI.getById(c._id || c.id)
          const payload = r?.data?.data || r?.data || {}
          const fullCrv = payload.crv || c
          const phases = payload.phases || []
          return { crv: { ...c, ...fullCrv }, phases }
        } catch {
          return { crv: c, phases: [] }
        }
      }))
      enriched.push(...results)
    }

    crvs.value = enriched
    lastRefresh.value = new Date()
  } catch (err) {
    console.warn('[ChefEquipeDashboard] loadCRVsDuJour erreur:', err.message)
    error.value = 'Impossible de charger les CRV.'
  } finally {
    loading.value = false
  }
}

const agentCards = computed(() => {
  const map = new Map()
  for (const { crv, phases } of crvs.value) {
    const { key, nom, role } = responsableKey(crv)
    if (!map.has(key)) {
      map.set(key, {
        key,
        nom,
        role,
        initiales: computeInitiales(nom),
        crvs: [],
        alertes: 0,
        depassees: 0
      })
    }
    const card = map.get(key)
    const sla = calculerSLACRV(crv)
    card.crvs.push({ crv, phases, sla })

    for (const p of phases) {
      if (!isPhaseSLA(p)) continue
      const niveau = qualifyPhaseNiveau(p)
      if (niveau === 'warning' || niveau === 'critical') card.alertes++
      if (niveau === 'exceeded') card.depassees++
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    // Agents avec dépassements d'abord
    if (b.depassees !== a.depassees) return b.depassees - a.depassees
    if (b.alertes !== a.alertes) return b.alertes - a.alertes
    return a.nom.localeCompare(b.nom)
  })
})

const totalCRVDuJour = computed(() => crvs.value.length)
const totalAlertes = computed(() => agentCards.value.reduce((s, a) => s + a.alertes, 0))
const totalDepassees = computed(() => agentCards.value.reduce((s, a) => s + a.depassees, 0))

function computeInitiales(nom) {
  if (!nom) return '?'
  const parts = nom.trim().split(/\s+/)
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || '?'
}

function toggleOpen(key) {
  openedKey.value = openedKey.value === key ? null : key
}

function openCrv(crv) {
  const id = crv._id || crv.id
  const type = (crv.typeOperation || crv.vol?.typeOperation || '').toUpperCase()
  if (!id) return
  if (type === 'DEPART') router.push({ path: '/crv/depart', query: { id } })
  else if (type === 'TURN_AROUND' || type === 'TURNAROUND') router.push({ path: '/crv/turnaround', query: { id } })
  else router.push({ path: '/crv/arrivee', query: { id } })
}

function formatType(t) {
  if (!t) return '—'
  const up = String(t).toUpperCase()
  if (up === 'DEPART') return 'Départ'
  if (up === 'ARRIVEE') return 'Arrivée'
  if (up === 'TURN_AROUND' || up === 'TURNAROUND') return 'TA'
  return t
}

const lastRefreshLabel = computed(() => {
  if (!lastRefresh.value) return '—'
  return lastRefresh.value.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

function refresh() {
  loadCRVsDuJour()
}

onMounted(async () => {
  await loadCRVsDuJour()
  pollingInterval = setInterval(loadCRVsDuJour, 60_000)
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})
</script>

<style scoped>
.chef-dashboard-container {
  min-height: 100vh;
  background: var(--bg-body, #f9fafb);
}

.chef-main {
  padding: 24px 20px;
}

.page-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.page-header-bar h1 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary, #111827);
}

.page-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
  max-width: 620px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.last-refresh {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  font-family: 'JetBrains Mono', monospace;
}

.refresh-icon {
  display: inline-block;
  transition: transform 0.3s ease;
}

.btn {
  padding: 8px 14px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #111827);
  transition: all 0.15s;
}
.btn:hover:not(:disabled) { background: var(--bg-card-hover, #f3f4f6); }
.btn:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-primary { background: #2563eb; color: white; border-color: #2563eb; }
.btn-primary:hover:not(:disabled) { background: #1d4ed8; }
.btn-secondary { background: white; color: var(--text-primary, #111827); }

.container { max-width: 1280px; margin: 0 auto; }

.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 22px;
}

.kpi-card {
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 14px 16px;
  transition: border-color 300ms, background 300ms;
}

.kpi-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-secondary, #6b7280);
  font-weight: 600;
  margin-bottom: 6px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary, #111827);
  font-family: 'JetBrains Mono', monospace;
}

.kpi-alert-on {
  border-color: #f59e0b;
  background: rgba(245,158,11,0.05);
}
.kpi-alert-on .kpi-value { color: #d97706; }

.kpi-critical-on {
  border-color: #ef4444;
  background: rgba(239,68,68,0.05);
}
.kpi-critical-on .kpi-value { color: #dc2626; }

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
}

.agent-card {
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 14px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 300ms, box-shadow 300ms;
}

.agent-card.agent-alert {
  border-color: #ef4444;
  box-shadow: 0 0 0 1px rgba(239,68,68,0.2);
}

.agent-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.agent-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.agent-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.agent-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary, #111827);
}

.agent-role {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--text-secondary, #6b7280);
}

.agent-flag {
  background: rgba(239,68,68,0.15);
  color: #dc2626;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 14px;
  animation: sla-pulse-critical 1.8s ease-in-out infinite;
  white-space: nowrap;
}

@keyframes sla-pulse-critical {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.7; }
}

.agent-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.agent-kpi {
  background: var(--bg-body, #f9fafb);
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  border: 1px solid transparent;
  transition: background-color 300ms, border-color 300ms;
}

.agent-kpi-label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 2px;
}

.agent-kpi-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #111827);
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.agent-kpi-warn { background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.3); }
.agent-kpi-warn .agent-kpi-value { color: #d97706; }

.agent-kpi-crit { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.3); }
.agent-kpi-crit .agent-kpi-value { color: #dc2626; }

.btn-agent-toggle {
  background: none;
  color: var(--color-primary, #2563eb);
  border: 1px solid var(--border-color, #e5e7eb);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-agent-toggle:hover {
  background: var(--bg-card-hover, #f3f4f6);
}

.agent-crv-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  padding-top: 10px;
}

.agent-crv-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  background: var(--bg-body, #f9fafb);
  border-radius: 6px;
  font-size: 12px;
}

.ce-crv-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ce-crv-ref {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ce-crv-num {
  font-weight: 700;
  color: var(--color-primary, #2563eb);
  font-family: 'JetBrains Mono', monospace;
}

.ce-crv-type {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--bg-badge, #e5e7eb);
  color: var(--text-secondary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.ce-crv-vol {
  display: flex;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary, #6b7280);
}

.ce-vol-code { font-family: 'JetBrains Mono', monospace; }
.ce-vol-cie  { font-weight: 600; }

.ce-no-sla { color: var(--text-tertiary, #9ca3af); font-size: 11px; }

.btn-open-crv {
  background: #2563eb;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.btn-open-crv:hover { background: #1d4ed8; }

.sla-fade-in {
  animation: sla-fade-in 320ms ease-out both;
}
@keyframes sla-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.ce-expand-enter-active, .ce-expand-leave-active {
  transition: all 250ms ease;
  overflow: hidden;
}
.ce-expand-enter-from, .ce-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px 20px;
  background: var(--bg-card, #ffffff);
  border-radius: 10px;
  color: var(--text-secondary, #6b7280);
}

@media (prefers-reduced-motion: reduce) {
  .sla-fade-in,
  .agent-flag,
  .ce-expand-enter-active, .ce-expand-leave-active {
    animation: none !important;
    transition: none !important;
  }
  .refresh-icon { transition: none !important; }
}

@media (max-width: 640px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .agents-grid { grid-template-columns: 1fr; }
  .agent-kpis { grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .agent-crv-item {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
