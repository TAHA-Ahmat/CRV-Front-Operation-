<template>
  <div class="tasks-board">
    <header class="tasks-header">
      <div class="tasks-header-left">
        <h3 class="tasks-title">Tâches SLA — {{ filteredTasks.length }} / {{ tasks.length }}</h3>
        <p class="tasks-subtitle">Chrono temps réel, triées par heure cible</p>
      </div>
      <button
        v-if="closable"
        class="btn-close"
        type="button"
        @click="$emit('close')"
        title="Fermer"
      >×</button>
    </header>

    <!-- Onglets domaine -->
    <div class="domain-tabs" v-if="tasks.length > 0">
      <button
        v-for="d in domainesDisponibles"
        :key="d.key"
        class="domain-tab"
        :class="{ active: selectedDomain === d.key }"
        @click="selectedDomain = d.key"
        type="button"
      >
        <span class="domain-icon">{{ d.icon }}</span>
        <span class="domain-label">{{ d.label }}</span>
        <span class="domain-count">{{ d.count }}</span>
      </button>
    </div>

    <div v-if="!tasks.length" class="empty-state">
      <p>Aucune tâche SLA fine pour ce CRV.</p>
      <p class="empty-sub">Les phases SLA apparaîtront ici une fois générées.</p>
    </div>

    <div v-else class="tasks-grid">
      <div
        v-for="(task, idx) in filteredTasks"
        :key="task.id || task._id"
        class="task-card sla-fade-in"
        :class="[
          'niveau-' + qualifyPhase(task),
          task.statut === 'TERMINE' ? 'task-done' : '',
          task.statut === 'NON_REALISE' ? 'task-nonr' : '',
          qualifyPhase(task) === 'exceeded' ? 'task-exceeded-pulse' : ''
        ]"
        :style="{ animationDelay: (idx * 50) + 'ms' }"
        :title="taskTooltip(task)"
      >
        <div class="task-head">
          <span class="task-icon" aria-hidden="true">{{ getDomainIcon(task) }}</span>
          <div class="task-titles">
            <h4 class="task-name">{{ getTaskLabel(task) }}</h4>
            <span class="task-code">{{ task.phase?.code || task.code || '—' }}</span>
          </div>
          <SLABadge
            :niveau="canonNiveau(task)"
            :show-label="true"
            size="sm"
            class="task-sla-badge"
          />
          <span class="task-statut-badge" :class="'statut-' + (task.statut || '').toLowerCase()">
            {{ formatStatut(task.statut) }}
          </span>
        </div>

        <div class="task-body">
          <div class="task-times">
            <div class="task-time-col">
              <span class="time-label">Cible</span>
              <span class="time-value">{{ formatHHMM(task.heureDebutPrevue) }}</span>
            </div>
            <div class="task-time-col">
              <span class="time-label">Réel</span>
              <span class="time-value" :class="task.heureDebutReelle ? '' : 'time-muted'">
                {{ task.heureDebutReelle ? formatHHMM(task.heureDebutReelle) : '—' }}
              </span>
            </div>
            <div class="task-time-col task-time-countdown">
              <SLACountdown :phase="task" />
            </div>
          </div>
        </div>

        <div class="task-foot" v-if="!disabled && !isTerminal(task)">
          <button
            v-if="task.statut === 'NON_COMMENCE'"
            class="btn-task btn-task-start"
            type="button"
            @click="$emit('action', { type: 'start', phase: task })"
          >
            Démarrer
          </button>
          <button
            v-if="task.statut === 'EN_COURS'"
            class="btn-task btn-task-end"
            type="button"
            @click="$emit('action', { type: 'end', phase: task })"
          >
            Terminer
          </button>
          <!-- UX-5 : action suggestive saisie cause retard sur EXCEEDED -->
          <button
            v-if="qualifyPhase(task) === 'exceeded'"
            class="btn-task btn-task-cause"
            type="button"
            :title="`Saisir la cause du retard sur ${getTaskLabel(task)}`"
            @click="$emit('cause-retard', task)"
          >
            ⚠ Saisir la cause du retard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * CRVTasksBoard — Tableau de bord des tâches SLA fines
 *
 * Filtre les phases avec codes CHECKIN_*, BRIEFING_*, BOARDING_*, BAGAGES_*, RAMP_*, MSG_*
 * Affiche chaque tâche : icône domaine, libellé, heure cible, heure réelle, countdown, badge.
 *
 * Props :
 * - phases : tableau ChronologiePhase
 * - closable : affiche un bouton de fermeture (pour drawer)
 * - disabled : désactive les actions
 *
 * Events :
 * - close : fermeture du tableau
 * - action : { type: 'start'|'end', phase } → relayé au parent pour demarrerPhase/terminerPhase
 */
import { computed, ref, onMounted, onUnmounted } from 'vue'
import SLACountdown from './SLACountdown.vue'
import SLABadge from '@/components/Common/SLABadge.vue'
import { normalizeNiveau, tooltipText } from '@/constants/slaSemantique'

const props = defineProps({
  phases: { type: Array, default: () => [] },
  closable: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  compagnieNom: { type: String, default: null },
  codeIATA: { type: String, default: null }
})

defineEmits(['close', 'action', 'cause-retard'])

// ── Filtrage phases SLA fines ─────────────────────────
const DOMAINES = [
  { key: 'CHECKIN', label: 'Check-in', icon: '🛃', prefix: 'CHECKIN_' },
  { key: 'BRIEFING', label: 'Briefing', icon: '📝', prefix: 'BRIEFING_' },
  { key: 'BOARDING', label: 'Boarding', icon: '🛫', prefix: 'BOARDING_' },
  { key: 'BAGAGES', label: 'Bagages', icon: '🧳', prefix: 'BAGAGES_' },
  { key: 'RAMP', label: 'Ramp', icon: '🛬', prefix: 'RAMP_' },
  { key: 'MSG', label: 'Messages', icon: '📡', prefix: 'MSG_' }
]

function getCode(phase) {
  return phase?.phase?.code || phase?.code || ''
}

function getDomainKey(phase) {
  const code = getCode(phase)
  const dom = DOMAINES.find(d => code.startsWith(d.prefix))
  return dom?.key || null
}

function getDomainIcon(phase) {
  const key = getDomainKey(phase)
  return DOMAINES.find(d => d.key === key)?.icon || '⏱'
}

const tasks = computed(() => {
  return [...props.phases]
    .filter(p => getDomainKey(p) !== null)
    .sort((a, b) => {
      // Tri par heureDebutPrevue croissante ; null en fin
      const ta = a.heureDebutPrevue ? new Date(a.heureDebutPrevue).getTime() : Number.POSITIVE_INFINITY
      const tb = b.heureDebutPrevue ? new Date(b.heureDebutPrevue).getTime() : Number.POSITIVE_INFINITY
      return ta - tb
    })
})

// ── Onglets domaines ─────────────────────────────────
const selectedDomain = ref('ALL')

const domainesDisponibles = computed(() => {
  const counts = {}
  for (const t of tasks.value) {
    const key = getDomainKey(t)
    counts[key] = (counts[key] || 0) + 1
  }
  const items = [{ key: 'ALL', label: 'Tout', icon: '⏱', count: tasks.value.length }]
  for (const d of DOMAINES) {
    if (counts[d.key]) {
      items.push({ ...d, count: counts[d.key] })
    }
  }
  return items
})

const filteredTasks = computed(() => {
  if (selectedDomain.value === 'ALL') return tasks.value
  return tasks.value.filter(t => getDomainKey(t) === selectedDomain.value)
})

// ── Tick temps réel pour les niveaux ─────────────────
const now = ref(new Date())
let interval = null
onMounted(() => {
  interval = setInterval(() => { now.value = new Date() }, 1000)
})
onUnmounted(() => { if (interval) clearInterval(interval) })

// ── Qualification niveau (copie locale, même logique que banner) ──
function qualifyPhase(phase) {
  const statut = phase.statut
  if (statut === 'TERMINE') return 'done'
  if (statut === 'NON_REALISE') return 'skipped'

  const slaMode = phase?.phase?.slaMode || 'DUREE'
  const currentTime = now.value

  if (slaMode === 'DEADLINE') {
    if (statut === 'NON_COMMENCE') {
      const debutPrevue = phase.heureDebutPrevue ? new Date(phase.heureDebutPrevue) : null
      if (!debutPrevue) return 'ok'
      const diffMin = (debutPrevue - currentTime) / 60000
      if (diffMin > 15) return 'ok'
      if (diffMin > 5) return 'warning'
      if (diffMin > 0) return 'critical'
      return 'exceeded'
    }
    if (statut === 'EN_COURS') {
      const finPrevue = phase.heureFinPrevue ? new Date(phase.heureFinPrevue) : null
      if (!finPrevue) return 'ok'
      const diffMin = (finPrevue - currentTime) / 60000
      if (diffMin > 10) return 'ok'
      if (diffMin > 3) return 'warning'
      if (diffMin > 0) return 'critical'
      return 'exceeded'
    }
    return 'ok'
  }

  if (statut === 'EN_COURS' && phase.heureDebutReelle) {
    const debut = new Date(phase.heureDebutReelle)
    const elapsedMin = (currentTime - debut) / 60000
    const standard = phase?.phase?.dureeStandardMinutes
    if (!standard || standard <= 0) return 'ok'
    const ratio = elapsedMin / standard
    if (ratio >= 1) return 'exceeded'
    if (ratio >= 0.9) return 'critical'
    if (ratio >= 0.75) return 'warning'
    return 'ok'
  }

  return 'ok'
}

// ── Formatage ────────────────────────────────────────
function formatHHMM(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatStatut(statut) {
  const labels = {
    NON_COMMENCE: 'À faire',
    EN_COURS: 'En cours',
    TERMINE: 'Terminée',
    NON_REALISE: 'Non réalisée'
  }
  return labels[statut] || statut || '—'
}

function getTaskLabel(phase) {
  return phase?.phase?.libelle || phase?.libelle || phase?.nomPhase || phase?.phase?.code || 'Tâche'
}

function isTerminal(phase) {
  return phase.statut === 'TERMINE' || phase.statut === 'NON_REALISE'
}

// Mapping statut tasksBoard → niveau canonique
function canonNiveau(task) {
  const q = qualifyPhase(task)
  if (q === 'done' || q === 'skipped') return null
  return normalizeNiveau(q) || 'OK'
}

// Tooltip combiné : sémantique SLA + contrat compagnie (UX-1 + UX-2)
function taskTooltip(task) {
  const q = qualifyPhase(task)
  const canon = normalizeNiveau(q)
  const parts = []
  if (canon) {
    parts.push(tooltipText(canon))
  }
  if (props.compagnieNom || props.codeIATA) {
    const nom = props.compagnieNom || props.codeIATA
    parts.push(`Source SLA : ${nom} (fallback standard si pas de config)`)
  } else {
    parts.push('Source SLA : contrat standard (aucune config compagnie)')
  }
  return parts.join('\n')
}
</script>

<style scoped>
.tasks-board {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
  margin-bottom: 20px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.tasks-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.tasks-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0 8px;
}

.btn-close:hover { color: var(--text-primary); }

.domain-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.domain-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-body);
  color: var(--text-secondary);
  border-radius: 18px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.domain-tab:hover {
  border-color: var(--color-primary, #2563eb);
  color: var(--text-primary);
}

.domain-tab.active {
  background: var(--color-primary, #2563eb);
  color: white;
  border-color: var(--color-primary, #2563eb);
}

.domain-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.domain-tab:not(.active) .domain-count {
  background: var(--bg-badge, #f3f4f6);
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.empty-state .empty-sub {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.task-card {
  background: var(--bg-body);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--border-color);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.task-card.niveau-ok { border-left-color: #22c55e; }
.task-card.niveau-warning { border-left-color: #f59e0b; }
.task-card.niveau-critical { border-left-color: #f97316; box-shadow: 0 0 0 1px rgba(249,115,22,0.12); }
.task-card.niveau-exceeded { border-left-color: #ef4444; box-shadow: 0 0 0 1px rgba(239,68,68,0.15); }
.task-card.niveau-done { border-left-color: #94a3b8; opacity: 0.72; }
.task-card.niveau-skipped { border-left-color: #cbd5e1; opacity: 0.55; }

/* UX-6 Motion : fade-in des cartes */
.sla-fade-in {
  animation: sla-fade-in 320ms ease-out both;
}

@keyframes sla-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* UX-5 Motion : pulse discret sur tâches dépassées */
.task-card.task-exceeded-pulse {
  animation: sla-fade-in 320ms ease-out both, sla-pulse-critical 1.8s ease-in-out 320ms infinite;
}

@keyframes sla-pulse-critical {
  0%, 100% { box-shadow: 0 0 0 1px rgba(239,68,68,0.15); }
  50%      { box-shadow: 0 0 0 3px rgba(239,68,68,0.28); }
}

.task-sla-badge {
  margin-left: auto;
  align-self: center;
}

/* Bouton UX-5 saisir cause retard */
.btn-task-cause {
  background: rgba(239,68,68,0.14);
  color: #dc2626;
  border: 1px solid rgba(239,68,68,0.35);
  font-weight: 700;
  margin-left: auto;
  transition: all 0.2s ease;
}
.btn-task-cause:hover {
  background: rgba(239,68,68,0.22);
  transform: translateY(-1px);
}

@media (prefers-reduced-motion: reduce) {
  .sla-fade-in,
  .task-card.task-exceeded-pulse,
  .btn-task-cause {
    animation: none !important;
    transition: none !important;
  }
}

.task-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.task-icon {
  font-size: 22px;
  line-height: 1;
  flex-shrink: 0;
}

.task-titles {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  word-break: break-word;
}

.task-code {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-tertiary);
  letter-spacing: 0.3px;
}

.task-statut-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.statut-non_commence { background: #f3f4f6; color: #6b7280; }
.statut-en_cours { background: #dbeafe; color: #1e40af; }
.statut-termine { background: #dcfce7; color: #166534; }
.statut-non_realise { background: #e5e7eb; color: #4b5563; }

.task-body {}

.task-times {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.task-time-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

.task-time-countdown {
  flex: 1;
  align-items: flex-end;
  display: flex;
  justify-content: flex-end;
}

.time-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-secondary);
}

.time-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.time-muted {
  color: var(--text-tertiary);
  font-weight: 400;
}

.task-foot {
  display: flex;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px dashed var(--border-color);
}

.btn-task {
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-task-start {
  background: #2563eb;
  color: white;
}

.btn-task-start:hover { background: #1d4ed8; }

.btn-task-end {
  background: #16a34a;
  color: white;
}

.btn-task-end:hover { background: #15803d; }

@media (max-width: 640px) {
  .tasks-grid {
    grid-template-columns: 1fr;
  }
  .task-times {
    gap: 8px;
  }
}
</style>
