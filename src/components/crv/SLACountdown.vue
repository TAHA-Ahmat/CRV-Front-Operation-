<template>
  <div v-if="display" class="sla-countdown" :class="'sla-countdown-' + display.niveau">
    <span class="sla-countdown-icon">{{ icons[display.niveau] || '⏱' }}</span>
    <span class="sla-countdown-timer">{{ display.timer }}</span>
    <span class="sla-countdown-label">{{ display.label }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

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

const icons = { ok: '🟢', warning: '🟡', critical: '🟠', exceeded: '🔴', pending: '⏳' }

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

.sla-countdown-ok { background: #e8f5e9; color: #2e7d32; }
.sla-countdown-warning { background: #fff8e1; color: #f57f17; }
.sla-countdown-critical { background: #fff3e0; color: #e65100; }
.sla-countdown-exceeded { background: #ffebee; color: #c62828; animation: sla-pulse 1.5s infinite; }
.sla-countdown-pending { background: #f5f5f5; color: #757575; }

.sla-countdown-timer {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.sla-countdown-label {
  font-weight: 400;
  opacity: 0.85;
}

@keyframes sla-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
