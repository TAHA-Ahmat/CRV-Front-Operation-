/**
 * slaSemantique.js — Vocabulaire SLA canonique (front)
 *
 * Source unique pour l'ensemble des composants SLA (bandeau, tableau tâches,
 * urgences, matrice compagnie, popover liste). Toute nouvelle icône, label ou
 * description SLA DOIT passer par ce fichier.
 *
 * 4 niveaux canoniques alignés sur useSLA.js :
 *   - OK       : < 75% du délai contractuel
 *   - WARNING  : entre 75% et 90%
 *   - CRITICAL : entre 90% et 100%
 *   - EXCEEDED : délai contractuel dépassé
 */

export const SLA_LEVELS = Object.freeze({
  OK: 'OK',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
  EXCEEDED: 'EXCEEDED'
})

export const SLA_COLORS = Object.freeze({
  OK:        { icon: '🟢', fg: '#16a34a', bg: 'rgba(34,197,94,0.12)',  border: '#22c55e' },
  WARNING:   { icon: '🟡', fg: '#d97706', bg: 'rgba(245,158,11,0.14)', border: '#f59e0b' },
  CRITICAL:  { icon: '🟠', fg: '#ea580c', bg: 'rgba(249,115,22,0.18)', border: '#f97316' },
  EXCEEDED:  { icon: '🔴', fg: '#dc2626', bg: 'rgba(239,68,68,0.18)',  border: '#ef4444' }
})

export const SLA_LABELS = Object.freeze({
  OK:       'Dans le temps',
  WARNING:  'Attention',
  CRITICAL: 'Critique',
  EXCEEDED: 'Dépassé'
})

export const SLA_DESCRIPTIONS = Object.freeze({
  OK:       'Moins de 75% du délai contractuel écoulé',
  WARNING:  '75% du délai écoulé — vigilance',
  CRITICAL: '90% du délai — agis maintenant',
  EXCEEDED: 'Délai contractuel dépassé — saisir la cause'
})

// Ordre de tri (pire en premier pour les listes d'urgences)
export const SLA_ORDER = Object.freeze({
  EXCEEDED: 0,
  CRITICAL: 1,
  WARNING:  2,
  OK:       3
})

/**
 * Normalise un niveau (accepte 'ok', 'warning', 'exceeded', etc. — casse libre)
 * @param {string|null|undefined} niveau
 * @returns {string|null} niveau canonique ou null si inconnu
 */
export function normalizeNiveau(niveau) {
  if (!niveau) return null
  const up = String(niveau).toUpperCase()
  return SLA_LEVELS[up] || null
}

/**
 * Convertit un niveau vers sa forme "minuscule legacy" (pour compat cssClass
 * existante type niveau-critical, sla-exceeded, timer-warning).
 */
export function niveauLegacy(niveau) {
  const n = normalizeNiveau(niveau)
  return n ? n.toLowerCase() : null
}

/**
 * Retourne le quadruplet (icon, label, description, couleurs) pour un niveau.
 * Utilisé par SLABadge.vue et par les tooltips natifs partout ailleurs.
 */
export function semantique(niveau) {
  const n = normalizeNiveau(niveau)
  if (!n) return null
  return {
    niveau: n,
    icon: SLA_COLORS[n].icon,
    label: SLA_LABELS[n],
    description: SLA_DESCRIPTIONS[n],
    colors: SLA_COLORS[n]
  }
}

/**
 * Produit un texte tooltip prêt à l'emploi : "Attention — 75% du délai écoulé…"
 */
export function tooltipText(niveau) {
  const s = semantique(niveau)
  if (!s) return ''
  return `${s.label} — ${s.description}`
}
