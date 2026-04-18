<template>
  <span
    v-if="sem"
    class="sla-badge sla-badge-transition"
    :class="[
      'sla-badge-' + sem.niveau.toLowerCase(),
      'sla-badge-size-' + size,
      pulse ? 'sla-badge-pulse' : ''
    ]"
    :title="tooltip"
    :aria-label="ariaLabel"
    role="status"
  >
    <span class="sla-badge-icon" aria-hidden="true">{{ sem.icon }}</span>
    <span v-if="showLabel" class="sla-badge-label">{{ labelToShow }}</span>
  </span>
</template>

<script setup>
/**
 * SLABadge — Badge SLA réutilisable avec tooltip pédagogique
 *
 * Props :
 * - niveau     : 'OK' | 'WARNING' | 'CRITICAL' | 'EXCEEDED' (casse libre)
 * - showLabel  : affiche le texte (par défaut true)
 * - size       : 'sm' | 'md' | 'lg' (par défaut 'md')
 * - customLabel: texte optionnel qui remplace le label canonique (ex: "12h" au lieu de "Critique")
 * - pulse      : force l'animation pulse (par défaut actif sur EXCEEDED)
 *
 * Accessibilité : role="status", aria-label complet (niveau + description)
 * Motion        : pulse désactivé automatiquement si prefers-reduced-motion
 */
import { computed } from 'vue'
import {
  semantique,
  tooltipText,
  SLA_LABELS
} from '@/constants/slaSemantique'

const props = defineProps({
  niveau: { type: String, default: null },
  showLabel: { type: Boolean, default: true },
  size: { type: String, default: 'md', validator: v => ['sm', 'md', 'lg'].includes(v) },
  customLabel: { type: String, default: null },
  pulse: { type: Boolean, default: null }
})

const sem = computed(() => semantique(props.niveau))

const labelToShow = computed(() => {
  if (!sem.value) return ''
  return props.customLabel != null ? props.customLabel : SLA_LABELS[sem.value.niveau]
})

const tooltip = computed(() => tooltipText(props.niveau))

const ariaLabel = computed(() => {
  if (!sem.value) return ''
  return `SLA ${sem.value.label}. ${sem.value.description}`
})

// Par défaut, pulse uniquement sur EXCEEDED. Si prop pulse explicite → respect.
const pulse = computed(() => {
  if (props.pulse !== null) return props.pulse
  return sem.value?.niveau === 'EXCEEDED'
})
</script>

<style scoped>
.sla-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 14px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  cursor: help;
  vertical-align: middle;
}

.sla-badge-transition {
  transition: background-color 300ms ease, color 300ms ease, box-shadow 300ms ease;
}

.sla-badge-icon {
  display: inline-flex;
  line-height: 1;
}

/* ── Tailles ── */
.sla-badge-size-sm {
  font-size: 11px;
  padding: 2px 8px;
}
.sla-badge-size-sm .sla-badge-icon { font-size: 10px; }

.sla-badge-size-md {
  font-size: 12px;
  padding: 3px 10px;
}
.sla-badge-size-md .sla-badge-icon { font-size: 12px; }

.sla-badge-size-lg {
  font-size: 14px;
  padding: 5px 14px;
}
.sla-badge-size-lg .sla-badge-icon { font-size: 16px; }

/* ── Niveaux ── */
.sla-badge-ok       { background: rgba(34,197,94,0.12);  color: #16a34a; }
.sla-badge-warning  { background: rgba(245,158,11,0.14); color: #d97706; }
.sla-badge-critical { background: rgba(249,115,22,0.18); color: #ea580c; }
.sla-badge-exceeded { background: rgba(239,68,68,0.18);  color: #dc2626; }

/* ── Animation critique (mutualisée avec sla-motion.css) ── */
.sla-badge-pulse {
  animation: sla-pulse-critical 1.6s ease-in-out infinite;
}

@keyframes sla-pulse-critical {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.65; }
}

@media (prefers-reduced-motion: reduce) {
  .sla-badge-pulse { animation: none !important; }
  .sla-badge-transition { transition: none !important; }
}
</style>
