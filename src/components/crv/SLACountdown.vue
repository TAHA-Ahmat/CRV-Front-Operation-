<template>
  <div
    v-if="display"
    class="sla-countdown sla-badge-transition"
    :class="'sla-countdown-' + display.niveau"
    :title="tooltip"
    :aria-label="ariaLabel"
    role="status"
  >
    <span class="sla-countdown-icon" aria-hidden="true">{{ icons[display.niveau] || '⏱' }}</span>
    <span class="sla-countdown-timer">{{ display.timer }}</span>
    <span class="sla-countdown-label">{{ display.label }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { SLA_COLORS, SLA_LABELS, SLA_DESCRIPTIONS, tooltipText } from '@/constants/slaSemantique'

/**
 * SLACountdown — Compte à rebours SLA temps réel
 *
 * Deux modes :
 * - DUREE : chrono depuis heureDebutReelle, alerte si > dureeStandardMinutes
 * - DEADLINE : countdown vers heureDebutPrevue (puis heureFinPrevue)
 *
 * Props :
 * - phase : objet ChronologiePhase (avec .phase, .heureDebutPrevue, .heureDebutReelle, etc.)
 * - slaMinutes : durée SLA en minutes (pour mode DUREE, override possible)
 */
const props = defineProps({
  phase: { type: Object, required: true },
  slaMinutes: { type: Number, default: null }
})

const icons = {
  ok: SLA_COLORS.OK.icon,
  warning: SLA_COLORS.WARNING.icon,
  critical: SLA_COLORS.CRITICAL.icon,
  exceeded: SLA_COLORS.EXCEEDED.icon,
  pending: '⏳'
}

// Tooltip pédagogique — mapping statut minuscule vers niveau canonique
const NIVEAU_MAP = { ok: 'OK', warning: 'WARNING', critical: 'CRITICAL', exceeded: 'EXCEEDED' }

const tooltip = computed(() => {
  const niv = display.value?.niveau
  if (!niv) return ''
  const canon = NIVEAU_MAP[niv]
  if (!canon) return 'Phase en attente de démarrage'
  return tooltipText(canon)
})

const ariaLabel = computed(() => {
  const niv = display.value?.niveau
  if (!niv) return ''
  const canon = NIVEAU_MAP[niv]
  if (!canon) return `Compte à rebours : ${display.value?.label || ''}`
  return `SLA ${SLA_LABELS[canon]}. ${SLA_DESCRIPTIONS[canon]}. ${display.value?.label || ''}`
})

const now = ref(new Date())
let interval = null

onMounted(() => {
  interval = setInterval(() => { now.value = new Date() }, 1000)
})
onUnmounted(() => { if (interval) clearInterval(interval) })

const display = computed(() => {
  const p = props.phase
  if (!p) return null

  const slaMode = p.phase?.slaMode || 'DUREE'
  const statut = p.statut

  // Phase terminée ou non réalisée → pas de countdown
  if (statut === 'TERMINE' || statut === 'NON_REALISE') return null

  if (slaMode === 'DEADLINE') {
    return computeDeadline(p, statut)
  } else {
    return computeDuree(p, statut)
  }
})

function computeDeadline(p, statut) {
  // Avant le début : countdown vers heureDebutPrevue
  // Pendant : countdown vers heureFinPrevue
  // Après heureFinPrevue : retard

  const debutPrevue = p.heureDebutPrevue ? new Date(p.heureDebutPrevue) : null
  const finPrevue = p.heureFinPrevue ? new Date(p.heureFinPrevue) : null
  const currentTime = now.value

  if (statut === 'NON_COMMENCE') {
    if (!debutPrevue) return null

    const diffMs = debutPrevue - currentTime
    const diffMin = Math.round(diffMs / 60000)

    if (diffMin > 15) {
      return { niveau: 'ok', timer: formatCountdown(diffMs), label: 'avant ouverture' }
    } else if (diffMin > 5) {
      return { niveau: 'warning', timer: formatCountdown(diffMs), label: 'ouverture imminente' }
    } else if (diffMin > 0) {
      return { niveau: 'critical', timer: formatCountdown(diffMs), label: 'ouverture imminente' }
    } else {
      // Retard : la phase aurait dû commencer
      return { niveau: 'exceeded', timer: '+' + formatCountdown(-diffMs), label: 'retard ouverture' }
    }
  }

  if (statut === 'EN_COURS') {
    if (!finPrevue) return null

    const diffMs = finPrevue - currentTime
    const diffMin = Math.round(diffMs / 60000)

    if (diffMin > 10) {
      return { niveau: 'ok', timer: formatCountdown(diffMs), label: 'avant fermeture' }
    } else if (diffMin > 3) {
      return { niveau: 'warning', timer: formatCountdown(diffMs), label: 'fermeture proche' }
    } else if (diffMin > 0) {
      return { niveau: 'critical', timer: formatCountdown(diffMs), label: 'fermeture imminente' }
    } else {
      return { niveau: 'exceeded', timer: '+' + formatCountdown(-diffMs), label: 'retard fermeture' }
    }
  }

  return null
}

function computeDuree(p, statut) {
  // Phase non commencée → afficher la durée standard attendue
  if (statut === 'NON_COMMENCE') {
    const standard = props.slaMinutes || p.phase?.dureeStandardMinutes
    if (!standard) return null
    return { niveau: 'pending', timer: standard + 'min', label: 'durée attendue' }
  }

  // Phase en cours → chrono depuis le début
  if (statut === 'EN_COURS' && p.heureDebutReelle) {
    const debut = new Date(p.heureDebutReelle)
    const elapsed = now.value - debut
    const elapsedMin = Math.round(elapsed / 60000)
    const standard = props.slaMinutes || p.phase?.dureeStandardMinutes

    if (!standard || standard <= 0) {
      return { niveau: 'ok', timer: formatCountdown(elapsed), label: 'en cours' }
    }

    const ratio = elapsedMin / standard
    let niveau = 'ok'
    if (ratio >= 1.0) niveau = 'exceeded'
    else if (ratio >= 0.9) niveau = 'critical'
    else if (ratio >= 0.75) niveau = 'warning'

    return { niveau, timer: elapsedMin + '/' + standard + 'min', label: niveau === 'exceeded' ? 'durée dépassée' : 'en cours' }
  }

  return null
}

function formatCountdown(ms) {
  const abMs = Math.abs(ms)
  const totalSec = Math.floor(abMs / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60

  if (h > 0) return `${h}h${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m${String(s).padStart(2, '0')}s`
  return `${s}s`
}
</script>

<style scoped>
.sla-countdown {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.sla-countdown-ok { background: rgba(34,197,94,0.12); color: #16a34a; }
.sla-countdown-warning { background: rgba(245,158,11,0.14); color: #d97706; }
.sla-countdown-critical { background: rgba(249,115,22,0.18); color: #ea580c; }
.sla-countdown-exceeded {
  background: rgba(239,68,68,0.18);
  color: #dc2626;
  animation: sla-pulse-critical 1.6s ease-in-out infinite;
}
.sla-countdown-pending { background: var(--bg-badge, #f3f4f6); color: var(--text-secondary, #6b7280); }

.sla-badge-transition {
  transition: background-color 300ms ease, color 300ms ease, box-shadow 300ms ease;
}

.sla-countdown-timer {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.sla-countdown-label {
  font-weight: 400;
  opacity: 0.85;
}

@keyframes sla-pulse-critical {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.65; }
}

@media (prefers-reduced-motion: reduce) {
  .sla-countdown-exceeded { animation: none !important; }
  .sla-badge-transition { transition: none !important; }
}
</style>
