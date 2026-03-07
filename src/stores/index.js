/**
 * INDEX DES STORES PINIA
 *
 * Centralise tous les stores de l'application CRV
 * Couverture : 100% des 78 routes backend
 *
 * Structure :
 * - authStore : Authentification et session
 * - crvStore : Comptes Rendus de Vol (11 routes)
 * - phasesStore : Gestion des phases (6 routes)
 * - chargesStore : Charges opérationnelles (12 routes)
 * - volsStore : Gestion des vols (7 routes)
 * - programmesStore : Programmes vol (9 routes)
 * - avionsStore : Configuration avions (12 routes)
 * - notificationsStore : Notifications (8 routes)
 * - slaStore : Alertes SLA (7 routes)
 * - personnesStore : Gestion utilisateurs (8 routes)
 */

// Auth & Session
export { useAuthStore } from './authStore'

// CRV - Coeur métier
export { useCrvStore } from './crvStore'
export { usePhasesStore } from './phasesStore'
export { useChargesStore } from './chargesStore'

// Vols & Programmes
export { useVolsStore } from './volsStore'
export { useProgrammesStore } from './programmesStore'

// Avions
export { useAvionsStore } from './avionsStore'

// Notifications
export { useNotificationsStore } from './notificationsStore'

// SLA & Qualité
export { useSlaStore } from './slaStore'

// Administration
export { usePersonnesStore } from './personnesStore'
