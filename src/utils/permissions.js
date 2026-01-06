/**
 * MATRICE DES PERMISSIONS - CONTRAT BACKEND
 *
 * Source de vérité : TRANSMISSION_BACKEND_FRONTEND.md
 *
 * RÈGLE ABSOLUE : Cette matrice reflète EXACTEMENT les permissions backend.
 * Le frontend ne DÉCIDE pas, il AFFICHE ce que le backend autorise.
 */

import { ROLES } from '@/config/roles'

// ============================================
// ACTIONS DISPONIBLES
// ============================================

export const ACTIONS = Object.freeze({
  // CRV
  CRV_CREER: 'CRV_CREER',
  CRV_MODIFIER: 'CRV_MODIFIER',
  CRV_LIRE: 'CRV_LIRE',
  CRV_SUPPRIMER: 'CRV_SUPPRIMER',
  CRV_ARCHIVER: 'CRV_ARCHIVER',

  // Charges
  CHARGE_AJOUTER: 'CHARGE_AJOUTER',
  CHARGE_MODIFIER_CATEGORIES: 'CHARGE_MODIFIER_CATEGORIES',
  CHARGE_MODIFIER_CLASSES: 'CHARGE_MODIFIER_CLASSES',
  CHARGE_MODIFIER_BESOINS_MEDICAUX: 'CHARGE_MODIFIER_BESOINS_MEDICAUX',
  CHARGE_AJOUTER_DGR: 'CHARGE_AJOUTER_DGR',

  // Événements & Observations
  EVENEMENT_AJOUTER: 'EVENEMENT_AJOUTER',
  OBSERVATION_AJOUTER: 'OBSERVATION_AJOUTER',

  // Phases
  PHASE_DEMARRER: 'PHASE_DEMARRER',
  PHASE_TERMINER: 'PHASE_TERMINER',
  PHASE_NON_REALISE: 'PHASE_NON_REALISE',
  PHASE_MODIFIER: 'PHASE_MODIFIER',

  // Vols
  VOL_CREER: 'VOL_CREER',
  VOL_MODIFIER: 'VOL_MODIFIER',
  VOL_LIRE: 'VOL_LIRE',
  VOL_LIER_PROGRAMME: 'VOL_LIER_PROGRAMME',
  VOL_MARQUER_HORS_PROGRAMME: 'VOL_MARQUER_HORS_PROGRAMME',

  // Programmes vol
  PROGRAMME_CREER: 'PROGRAMME_CREER',
  PROGRAMME_MODIFIER: 'PROGRAMME_MODIFIER',
  PROGRAMME_LIRE: 'PROGRAMME_LIRE',
  PROGRAMME_VALIDER: 'PROGRAMME_VALIDER',
  PROGRAMME_ACTIVER: 'PROGRAMME_ACTIVER',
  PROGRAMME_SUSPENDRE: 'PROGRAMME_SUSPENDRE',
  PROGRAMME_SUPPRIMER: 'PROGRAMME_SUPPRIMER',

  // Avions
  AVION_MODIFIER_CONFIG: 'AVION_MODIFIER_CONFIG',
  AVION_CREER_VERSION: 'AVION_CREER_VERSION',
  AVION_LIRE_VERSIONS: 'AVION_LIRE_VERSIONS',
  AVION_RESTAURER_VERSION: 'AVION_RESTAURER_VERSION',

  // Statistiques
  STATS_LIRE: 'STATS_LIRE',

  // Gestion utilisateurs (ADMIN uniquement)
  USER_CREER: 'USER_CREER',
  USER_LIRE: 'USER_LIRE',
  USER_MODIFIER: 'USER_MODIFIER',
  USER_DESACTIVER: 'USER_DESACTIVER',
  USER_REACTIVER: 'USER_REACTIVER',
  USER_SUPPRIMER: 'USER_SUPPRIMER',
  USER_CHANGER_ROLE: 'USER_CHANGER_ROLE',

  // Profil personnel (tous)
  PROFIL_LIRE: 'PROFIL_LIRE',
  PROFIL_CHANGER_MDP: 'PROFIL_CHANGER_MDP'
})

// ============================================
// MATRICE DES PERMISSIONS
// Source : TRANSMISSION_BACKEND_FRONTEND.md Section 3
// ============================================

const PERMISSION_MATRIX = {
  // CRV
  [ACTIONS.CRV_CREER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_MODIFIER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_LIRE]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE],
  [ACTIONS.CRV_SUPPRIMER]: [ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_ARCHIVER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],

  // Charges
  [ACTIONS.CHARGE_AJOUTER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CHARGE_MODIFIER_CATEGORIES]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CHARGE_MODIFIER_CLASSES]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CHARGE_MODIFIER_BESOINS_MEDICAUX]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CHARGE_AJOUTER_DGR]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],

  // Événements & Observations
  [ACTIONS.EVENEMENT_AJOUTER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.OBSERVATION_AJOUTER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],

  // Phases
  [ACTIONS.PHASE_DEMARRER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PHASE_TERMINER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PHASE_NON_REALISE]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PHASE_MODIFIER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],

  // Vols
  [ACTIONS.VOL_CREER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.VOL_MODIFIER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.VOL_LIRE]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE],
  [ACTIONS.VOL_LIER_PROGRAMME]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.VOL_MARQUER_HORS_PROGRAMME]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],

  // Programmes vol
  [ACTIONS.PROGRAMME_CREER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PROGRAMME_MODIFIER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PROGRAMME_LIRE]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE],
  [ACTIONS.PROGRAMME_VALIDER]: [ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PROGRAMME_ACTIVER]: [ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PROGRAMME_SUSPENDRE]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PROGRAMME_SUPPRIMER]: [ROLES.MANAGER],

  // Avions
  [ACTIONS.AVION_MODIFIER_CONFIG]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.AVION_CREER_VERSION]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.AVION_LIRE_VERSIONS]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE],
  [ACTIONS.AVION_RESTAURER_VERSION]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],

  // Statistiques
  [ACTIONS.STATS_LIRE]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE],

  // Gestion utilisateurs (ADMIN uniquement)
  [ACTIONS.USER_CREER]: [ROLES.ADMIN],
  [ACTIONS.USER_LIRE]: [ROLES.ADMIN],
  [ACTIONS.USER_MODIFIER]: [ROLES.ADMIN],
  [ACTIONS.USER_DESACTIVER]: [ROLES.ADMIN],
  [ACTIONS.USER_REACTIVER]: [ROLES.ADMIN],
  [ACTIONS.USER_SUPPRIMER]: [ROLES.ADMIN],
  [ACTIONS.USER_CHANGER_ROLE]: [ROLES.ADMIN],

  // Profil personnel (tous les rôles authentifiés)
  [ACTIONS.PROFIL_LIRE]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE, ROLES.ADMIN],
  [ACTIONS.PROFIL_CHANGER_MDP]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE, ROLES.ADMIN]
}

// ============================================
// FONCTIONS DE VÉRIFICATION
// ============================================

/**
 * Vérifie si un rôle a la permission d'effectuer une action
 *
 * @param {string} role - Rôle normalisé (ex: 'AGENT_ESCALE')
 * @param {string} action - Action à vérifier (ex: ACTIONS.CRV_CREER)
 * @returns {boolean}
 */
export function hasPermission(role, action) {
  if (!role || !action) {
    return false
  }

  const allowedRoles = PERMISSION_MATRIX[action]
  if (!allowedRoles) {
    console.warn(`[PERMISSIONS] Action non définie: ${action}`)
    return false
  }

  return allowedRoles.includes(role)
}

/**
 * Vérifie si un rôle a au moins une des permissions listées
 *
 * @param {string} role - Rôle normalisé
 * @param {Array<string>} actions - Liste d'actions
 * @returns {boolean}
 */
export function hasAnyPermission(role, actions) {
  if (!role || !actions || !Array.isArray(actions)) {
    return false
  }

  return actions.some(action => hasPermission(role, action))
}

/**
 * Vérifie si un rôle a toutes les permissions listées
 *
 * @param {string} role - Rôle normalisé
 * @param {Array<string>} actions - Liste d'actions
 * @returns {boolean}
 */
export function hasAllPermissions(role, actions) {
  if (!role || !actions || !Array.isArray(actions)) {
    return false
  }

  return actions.every(action => hasPermission(role, action))
}

/**
 * Retourne la liste des actions autorisées pour un rôle
 *
 * @param {string} role - Rôle normalisé
 * @returns {Array<string>}
 */
export function getPermissionsForRole(role) {
  if (!role) {
    return []
  }

  return Object.entries(PERMISSION_MATRIX)
    .filter(([, allowedRoles]) => allowedRoles.includes(role))
    .map(([action]) => action)
}

/**
 * Retourne la liste des rôles autorisés pour une action
 *
 * @param {string} action - Action
 * @returns {Array<string>}
 */
export function getRolesForAction(action) {
  return PERMISSION_MATRIX[action] || []
}

// ============================================
// PERMISSIONS MÉTIER SPÉCIFIQUES
// ============================================

/**
 * Vérifie si un rôle peut effectuer des opérations CRV (création/modification)
 * @param {string} role
 * @returns {boolean}
 */
export function canOperateCRV(role) {
  return hasPermission(role, ACTIONS.CRV_CREER)
}

/**
 * Vérifie si un rôle peut voir les CRV (lecture)
 * @param {string} role
 * @returns {boolean}
 */
export function canViewCRV(role) {
  return hasPermission(role, ACTIONS.CRV_LIRE)
}

/**
 * Vérifie si un rôle peut supprimer des CRV
 * @param {string} role
 * @returns {boolean}
 */
export function canDeleteCRV(role) {
  return hasPermission(role, ACTIONS.CRV_SUPPRIMER)
}

/**
 * Vérifie si un rôle peut gérer les utilisateurs
 * @param {string} role
 * @returns {boolean}
 */
export function canManageUsers(role) {
  return hasPermission(role, ACTIONS.USER_CREER)
}

/**
 * Vérifie si un rôle peut valider des programmes vol
 * @param {string} role
 * @returns {boolean}
 */
export function canValidateProgramme(role) {
  return hasPermission(role, ACTIONS.PROGRAMME_VALIDER)
}

/**
 * Vérifie si un rôle peut supprimer des programmes vol
 * @param {string} role
 * @returns {boolean}
 */
export function canDeleteProgramme(role) {
  return hasPermission(role, ACTIONS.PROGRAMME_SUPPRIMER)
}

/**
 * Vérifie si un rôle est en mode lecture seule (QUALITE)
 * @param {string} role
 * @returns {boolean}
 */
export function isReadOnlyRole(role) {
  return role === ROLES.QUALITE
}

/**
 * Vérifie si un rôle est administrateur système (pas d'accès métier CRV)
 * @param {string} role
 * @returns {boolean}
 */
export function isAdminRole(role) {
  return role === ROLES.ADMIN
}

// ============================================
// MESSAGES D'ERREUR SELON LE RÔLE
// Source : TRANSMISSION_BACKEND_FRONTEND.md Section 3
// ============================================

export const PERMISSION_MESSAGES = Object.freeze({
  QUALITE_READ_ONLY: 'Votre profil QUALITE est en lecture seule. Vous ne pouvez pas créer ou modifier de données.',
  ADMIN_NO_CRV: 'Les comptes ADMIN ne peuvent pas effectuer d\'opérations CRV. Utilisez un compte opérationnel.',
  INSUFFICIENT_PERMISSIONS: 'Vous n\'avez pas les permissions nécessaires pour cette action. Contactez votre superviseur.',
  VALIDATION_RESERVED: 'Cette action est réservée aux SUPERVISEUR et MANAGER.',
  SUPPRESSION_RESERVED: 'Cette action est réservée au MANAGER uniquement.',
  ADMIN_ONLY: 'Accès refusé. Cette action est réservée aux administrateurs.'
})

/**
 * Retourne le message d'erreur approprié pour un refus de permission
 *
 * @param {string} role - Rôle de l'utilisateur
 * @param {string} action - Action tentée
 * @returns {string}
 */
export function getPermissionDeniedMessage(role, action) {
  if (role === ROLES.QUALITE) {
    return PERMISSION_MESSAGES.QUALITE_READ_ONLY
  }

  if (role === ROLES.ADMIN && action.startsWith('CRV_')) {
    return PERMISSION_MESSAGES.ADMIN_NO_CRV
  }

  if (action === ACTIONS.PROGRAMME_VALIDER || action === ACTIONS.PROGRAMME_ACTIVER) {
    return PERMISSION_MESSAGES.VALIDATION_RESERVED
  }

  if (action === ACTIONS.PROGRAMME_SUPPRIMER) {
    return PERMISSION_MESSAGES.SUPPRESSION_RESERVED
  }

  if (action.startsWith('USER_')) {
    return PERMISSION_MESSAGES.ADMIN_ONLY
  }

  return PERMISSION_MESSAGES.INSUFFICIENT_PERMISSIONS
}

export default {
  ACTIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRole,
  getRolesForAction,
  canOperateCRV,
  canViewCRV,
  canDeleteCRV,
  canManageUsers,
  canValidateProgramme,
  canDeleteProgramme,
  isReadOnlyRole,
  isAdminRole,
  PERMISSION_MESSAGES,
  getPermissionDeniedMessage
}
