<template>
  <div v-if="crv" class="crv-sla-banner" :class="bannerClass">
    <div class="banner-row-main">
      <!-- SLA CRV global -->
      <div class="banner-block banner-block-main">
        <span class="banner-icon">{{ niveauIcon }}</span>
        <div class="banner-text">
          <div class="banner-label">SLA CRV</div>
          <div class="banner-value">
            <span v-if="slaStatus" class="banner-countdown">{{ slaStatus.label }}</span>
            <span v-else class="banner-dim">—</span>
            <span v-if="slaStatus" class="banner-sub">{{ slaStatus.etape }} · {{ slaStatus.source }}</span>
          </div>
        </div>
      </div>

      <!-- Compteur visuel tâches -->
      <div class="banner-block">
        <div class="banner-label">Tâches SLA</div>
        <div class="banner-tasks">
          <span class="task-chip task-ok" :title="`${tasksCounts.ok} à l'heure`">
            <span class="chip-dot"></span>{{ tasksCounts.ok }} à l'heure
          </span>
          <span v-if="tasksCounts.alerte > 0" class="task-chip task-warning" :title="`${tasksCounts.alerte} en alerte`">
            <span class="chip-dot"></span>{{ tasksCounts.alerte }} en alerte
          </span>
          <span v-if="tasksCounts.depasse > 0" class="task-chip task-exceeded" :title="`${tasksCounts.depasse} dépassée(s)`">
            <span class="chip-dot"></span>{{ tasksCounts.depasse }} dépassée{{ tasksCounts.depasse > 1 ? 's' : '' }}
          </span>
          <span v-if="totalTasks === 0" class="banner-dim">Aucune phase SLA</span>
        </div>
      </div>

      <!-- Prochaine échéance -->
      <div class="banner-block">
        <div class="banner-label">Prochain</div>
        <div v-if="prochaineEcheance" class="banner-next">
          <span class="next-code">{{ prochaineEcheance.code }}</span>
          <span class="next-timer" :class="prochaineEcheance.urgent ? 'next-timer-urgent' : ''">
            dans {{ prochaineEcheance.timer }}
          </span>
        </div>
        <div v-else class="banner-dim">—</div>
      </div>

      <!-- Toggle tableau de bord -->
      <div class="banner-actions">
        <button
          class="btn-tasks-toggle"
          type="button"
          @click="$emit('open-tasks')"
          title="Voir toutes les tâches SLA"
        >
          <span class="toggle-icon">📋</span>
          Tableau tâches
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * CRVSLABanner — Bandeau SLA persistant (wizard CRV)
 *
 * Fonctions :
 * - SLA CRV global (réutilise useSLA.calculerSLACRV)
 * - Compteur X/Y tâches à l'heure / en alerte / dépassées
 * - Prochaine échéance (phase non commencée la plus proche)
 * - Tick 1s temps réel
 *
 * Props :
 * - crv : objet CRV complet (avec phases résolues)
 * - phases : tableau ChronologiePhase (optionnel, fallback crv.phases)
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useSLA } from '@/composables/useSLA'

const props = defineProps({
  crv: { type: Object, default: null },
  phases: { type: Array, default: () => [] }
})

defineEmits(['open-tasks'])

const { calculerSLACRV } = useSLA()

// ── Tick temps réel 1s ────────────────────────────────
const now = ref(new Date())
let interval = null
onMounted(() => {
  interval = setInterval(() => { now.value = new Date() }, 1000)
})
onUnmounted(() => { if (interval) clearInterval(interval) })

// ── Phases SLA (fines) ────────────────────────────────
const SLA_CODE_PREFIXES = ['CHECKIN_', 'BRIEFING_', 'BOARDING_', 'BAGAGES_', 'RAMP_', 'MSG_']

function isPhaseSLA(phase) {
  const code = phase?.phase?.code || phase?.code || ''
  if (!code) return false
  return SLA_CODE_PREFIXES.some(prefix => code.startsWith(prefix))
}

const phasesList = computed(() => {
  if (props.phases?.length) return props.phases
  return props.crv?.phases || []
})

const phasesSLA = computed(() => phasesList.value.filter(isPhaseSLA))

// ── SLA CRV global ────────────────────────────────────
const slaStatus = computed(() => {
  if (!props.crv) return null
  // Force le recalcul à chaque tick
  // eslint-disable-next-line no-unused-expressions
  now.value
  return calculerSLACRV(props.crv)
})

// ── Qualification d'une phase en niveau ──────────────
function qualifyPhase(phase) {
  const statut = phase.statut
  if (statut === 'TERMINE' || statut === 'NON_REALISE') return 'done'

  const slaMode = phase?.phase?.slaMode || 'DUREE'
  const currentTime = now.value

  if (slaMode === 'DEADLINE') {
    if (statut === 'NON_COMMENCE') {
      const debutPrevue = phase.heureDebutPrevue ? new Date(phase.heureDebutPrevue) : null
      if (!debutPrevue) return 'ok'
      const diffMin = (debutPrevue - currentTime) / 60000
      if (diffMin > 15) return 'ok'
      if (diffMin > 5) return 'alerte'
      if (diffMin > 0) return 'alerte'
      return 'depasse'
    }
    if (statut === 'EN_COURS') {
      const finPrevue = phase.heureFinPrevue ? new Date(phase.heureFinPrevue) : null
      if (!finPrevue) return 'ok'
      const diffMin = (finPrevue - currentTime) / 60000
      if (diffMin > 10) return 'ok'
      if (diffMin > 3) return 'alerte'
      if (diffMin > 0) return 'alerte'
      return 'depasse'
    }
    return 'ok'
  }

  // Mode DUREE
  if (statut === 'EN_COURS' && phase.heureDebutReelle) {
    const debut = new Date(phase.heureDebutReelle)
    const elapsedMin = (currentTime - debut) / 60000
    const standard = phase?.phase?.dureeStandardMinutes
    if (!standard || standard <= 0) return 'ok'
    const ratio = elapsedMin / standard
    if (ratio >= 1) return 'depasse'
    if (ratio >= 0.75) return 'alerte'
    return 'ok'
  }

  return 'ok' // NON_COMMENCE DUREE = pending mais pas d'alerte
}

const tasksCounts = computed(() => {
  const counts = { ok: 0, alerte: 0, depasse: 0, done: 0 }
  for (const phase of phasesSLA.value) {
    const niv = qualifyPhase(phase)
    if (counts[niv] !== undefined) counts[niv]++
  }
  return counts
})

const totalTasks = computed(() => phasesSLA.value.length)

// ── Prochaine échéance ────────────────────────────────
function formatCountdown(ms) {
  const abMs = Math.max(0, Math.abs(ms))
  const totalSec = Math.floor(abMs / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n) => String(n).padStart(2, '0')
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

const prochaineEcheance = computed(() => {
  // Phase SLA NON_COMMENCE avec heureDebutPrevue la plus proche dans le futur
  const currentTime = now.value
  const candidates = phasesSLA.value
    .filter(p => p.statut === 'NON_COMMENCE' && p.heureDebutPrevue)
    .map(p => {
      const debut = new Date(p.heureDebutPrevue)
      return { phase: p, debut, diffMs: debut - currentTime }
    })
    .filter(c => c.diffMs >= -60000) // tolérance 1 min de retard
    .sort((a, b) => a.diffMs - b.diffMs)

  if (!candidates.length) return null

  const next = candidates[0]
  const code = next.phase?.phase?.code || next.phase?.code || '—'
  const urgent = next.diffMs < 5 * 60 * 1000 // < 5 min
  return {
    code,
    timer: formatCountdown(next.diffMs),
    urgent
  }
})

// ── Classe du bandeau selon pire niveau ──────────────
const bannerClass = computed(() => {
  if (slaStatus.value?.niveau === 'EXCEEDED' || tasksCounts.value.depasse > 0) return 'banner-critical'
  if (slaStatus.value?.niveau === 'CRITICAL' || tasksCounts.value.alerte > 0) return 'banner-warning'
  if (slaStatus.value?.niveau === 'WARNING') return 'banner-warning'
  return 'banner-ok'
})

const niveauIcon = computed(() => {
  if (bannerClass.value === 'banner-critical') return '🔴'
  if (bannerClass.value === 'banner-warning') return '🟠'
  return '🟢'
})
</script>

<style scoped>
.crv-sla-banner {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-md);
  transition: border-color 0.3s;
}

.banner-ok { border-left: 4px solid #22c55e; }
.banner-warning { border-left: 4px solid #f59e0b; }
.banner-critical { border-left: 4px solid #ef4444; animation: banner-pulse 2.5s infinite; }

@keyframes banner-pulse {
  0%, 100% { box-shadow: var(--shadow-md); }
  50% { box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2), var(--shadow-md); }
}

.banner-row-main {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.banner-block {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.banner-block-main {
  flex: 0 0 auto;
}

.banner-icon {
  font-size: 24px;
  line-height: 1;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.banner-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.banner-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.banner-countdown {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.banner-sub {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.85;
}

.banner-dim {
  color: var(--text-tertiary);
  font-size: 13px;
  font-style: italic;
}

.banner-tasks {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.task-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.task-ok { background: rgba(34,197,94,0.12); color: #22c55e; }
.task-ok .chip-dot { background: #22c55e; }
.task-warning { background: rgba(245,158,11,0.14); color: #d97706; }
.task-warning .chip-dot { background: #f59e0b; }
.task-exceeded { background: rgba(239,68,68,0.14); color: #dc2626; }
.task-exceeded .chip-dot { background: #ef4444; animation: dot-pulse 1.2s infinite; }

@keyframes dot-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.banner-next {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
}

.next-code {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 12px;
  letter-spacing: 0.3px;
}

.next-timer {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
}

.next-timer-urgent {
  color: #ef4444;
  font-weight: 700;
}

.banner-actions {
  margin-left: auto;
}

.btn-tasks-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--bg-badge, #f3f4f6);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-tasks-toggle:hover {
  background: var(--bg-card-hover, #e5e7eb);
  transform: translateY(-1px);
}

.toggle-icon {
  font-size: 14px;
}

@media (max-width: 768px) {
  .banner-row-main {
    gap: 16px;
  }
  .banner-block {
    flex: 1 1 auto;
  }
  .banner-actions {
    margin-left: 0;
    width: 100%;
  }
  .btn-tasks-toggle {
    width: 100%;
    justify-content: center;
  }
  .banner-countdown {
    font-size: 16px;
  }
}
</style>
