/**
 * MATRICE DES PERMISSIONS - CONTRAT BACKEND
 *
 * Source de vérité : Backend (excludeQualite middleware)
 *
 * RÈGLE ABSOLUE : Cette matrice reflète EXACTEMENT les permissions backend.
 * Le frontend ne DÉCIDE pas, il AFFICHE ce que le backend autorise.
 *
 * CORRECTION 2026-01-23 - Alignement Backend (excludeQualite):
 * - Tous les opérationnels + ADMIN peuvent TOUT faire sur les CRV
 * - QUALITE: LECTURE SEULE ABSOLUE (ne peut RIEN faire sauf lire)
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
  CRV_DEMARRER: 'CRV_DEMARRER',
  CRV_TERMINER: 'CRV_TERMINER',
  CRV_VALIDER: 'CRV_VALIDER',
  CRV_REJETER: 'CRV_REJETER',
  CRV_VERROUILLER: 'CRV_VERROUILLER',
  CRV_DEVERROUILLER: 'CRV_DEVERROUILLER',
  CRV_ANNULER: 'CRV_ANNULER',
  CRV_REACTIVER: 'CRV_REACTIVER',

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
// MATRICE DES PERMISSIONS - DOCTRINE STRICTE
// Source : DOCUMENTATION_FRONTEND_CRV.md
// ============================================

/**
 * Alignement Backend 2026-01-23:
 * - excludeQualite = tous les rôles sauf QUALITE peuvent agir
 * - QUALITE: LECTURE SEULE ABSOLUE
 */

// Tous les rôles qui peuvent agir sur les CRV (backend excludeQualite)
const ROLES_OPERATIONNELS_ET_ADMIN = [
  ROLES.AGENT_ESCALE,
  ROLES.CHEF_EQUIPE,
  ROLES.SUPERVISEUR,
  ROLES.MANAGER,
  ROLES.ADMIN
]

const PERMISSION_MATRIX = {
  // CRV - Tous les opérationnels + ADMIN peuvent tout faire (sauf QUALITE)
  [ACTIONS.CRV_CREER]: ROLES_OPERATIONNELS_ET_ADMIN,
  [ACTIONS.CRV_MODIFIER]: ROLES_OPERATIONNELS_ET_ADMIN,
  [ACTIONS.CRV_LIRE]: [...ROLES_OPERATIONNELS_ET_ADMIN, ROLES.QUALITE],
  [ACTIONS.CRV_SUPPRIMER]: ROLES_OPERATIONNELS_ET_ADMIN,
  [ACTIONS.CRV_ARCHIVER]: ROLES_OPERATIONNELS_ET_ADMIN,
  [ACTIONS.CRV_DEMARRER]: ROLES_OPERATIONNELS_ET_ADMIN,
  [ACTIONS.CRV_TERMINER]: ROLES_OPERATIONNELS_ET_ADMIN,
  [ACTIONS.CRV_VALIDER]: ROLES_OPERATIONNELS_ET_ADMIN,
  [ACTIONS.CRV_REJETER]: ROLES_OPERATIONNELS_ET_ADMIN,
  [ACTIONS.CRV_VERROUILLER]: ROLES_OPERATIONNELS_ET_ADMIN,

  [ACTIONS.CRV_DEVERROUILLER]: ROLES_OPERATIONNELS_ET_ADMIN,

  [ACTIONS.CRV_ANNULER]: ROLES_OPERATIONNELS_ET_ADMIN,
  [ACTIONS.CRV_REACTIVER]: ROLES_OPERATIONNELS_ET_ADMIN,

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

  // Programmes vol - Tous les opérationnels peuvent tout faire (sauf QUALITE et ADMIN)
  [ACTIONS.PROGRAMME_CREER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PROGRAMME_MODIFIER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PROGRAMME_LIRE]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE],
  [ACTIONS.PROGRAMME_VALIDER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PROGRAMME_ACTIVER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PROGRAMME_SUSPENDRE]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PROGRAMME_SUPPRIMER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],

  // Avions
  [ACTIONS.AVION_MODIFIER_CONFIG]: [ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.AVION_CREER_VERSION]: [ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.AVION_LIRE_VERSIONS]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE],
  [ACTIONS.AVION_RESTAURER_VERSION]: [ROLES.SUPERVISEUR, ROLES.MANAGER],

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
// FONCTIONS DE VÉRIFICATION AVEC LOGS
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
    console.log('[CRV][PERMISSION_CHECK] Vérification permission avec paramètre manquant:', { role, action })
    return false
  }

  // Normaliser le rôle en majuscules pour correspondre à la matrice
  const normalizedRole = typeof role === 'string' ? role.toUpperCase().trim() : role

  const allowedRoles = PERMISSION_MATRIX[action]
  if (!allowedRoles) {
    console.warn(`[CRV][PERMISSION_CHECK] Action non définie dans la matrice: ${action}`)
    return false
  }

  const hasAccess = allowedRoles.includes(normalizedRole)
  console.log(`[CRV][PERMISSION_CHECK] ${normalizedRole} pour ${action}: ${hasAccess ? 'AUTORISÉ' : 'REFUSÉ'}`)

  return hasAccess
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
    console.log('[CRV][PERMISSION_CHECK] hasAnyPermission avec paramètres invalides:', { role, actions })
    return false
  }

  const result = actions.some(action => {
    const allowedRoles = PERMISSION_MATRIX[action]
    return allowedRoles && allowedRoles.includes(role)
  })

  console.log(`[CRV][PERMISSION_CHECK] ${role} hasAny [${actions.join(', ')}]: ${result}`)
  return result
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
    console.log('[CRV][PERMISSION_CHECK] hasAllPermissions avec paramètres invalides:', { role, actions })
    return false
  }

  const result = actions.every(action => {
    const allowedRoles = PERMISSION_MATRIX[action]
    return allowedRoles && allowedRoles.includes(role)
  })

  console.log(`[CRV][PERMISSION_CHECK] ${role} hasAll [${actions.join(', ')}]: ${result}`)
  return result
}

/**
 * Retourne la liste des actions autorisées pour un rôle
 *
 * @param {string} role - Rôle normalisé
 * @returns {Array<string>}
 */
export function getPermissionsForRole(role) {
  if (!role) {
    console.log('[CRV][PERMISSION_CHECK] getPermissionsForRole sans rôle')
    return []
  }

  const permissions = Object.entries(PERMISSION_MATRIX)
    .filter(([, allowedRoles]) => allowedRoles.includes(role))
    .map(([action]) => action)

  console.log(`[CRV][PERMISSION_CHECK] Permissions pour ${role}: ${permissions.length} actions`)
  return permissions
}

/**
 * Retourne la liste des rôles autorisés pour une action
 *
 * @param {string} action - Action
 * @returns {Array<string>}
 */
export function getRolesForAction(action) {
  const roles = PERMISSION_MATRIX[action] || []
  console.log(`[CRV][PERMISSION_CHECK] Rôles pour ${action}:`, roles)
  return roles
}

// ============================================
// PERMISSIONS MÉTIER SPÉCIFIQUES CRV
// DOCTRINE STRICTE
// ============================================

/**
 * Vérifie si un rôle peut effectuer des opérations CRV (création/modification)
 * @param {string} role
 * @returns {boolean}
 */
export function canOperateCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_CREER)
  console.log(`[CRV][PERMISSION_CRV] canOperateCRV(${role}): ${result}`)
  return result
}

/**
 * Vérifie si un rôle peut voir les CRV (lecture)
 * @param {string} role
 * @returns {boolean}
 */
export function canViewCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_LIRE)
  console.log(`[CRV][PERMISSION_CRV] canViewCRV(${role}): ${result}`)
  return result
}

/**
 * CORRECTION AUDIT: Suppression réservée SUPERVISEUR et MANAGER
 * @param {string} role
 * @returns {boolean}
 */
export function canDeleteCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_SUPPRIMER)
  console.log(`[CRV][PERMISSION_CRV] canDeleteCRV(${role}): ${result} [SUPERVISEUR/MANAGER only]`)
  return result
}

/**
 * Vérifie si un rôle peut gérer les utilisateurs
 * @param {string} role
 * @returns {boolean}
 */
export function canManageUsers(role) {
  const result = hasPermission(role, ACTIONS.USER_CREER)
  console.log(`[CRV][PERMISSION_ADMIN] canManageUsers(${role}): ${result}`)
  return result
}

/**
 * Vérifie si un rôle peut valider des programmes vol
 * @param {string} role
 * @returns {boolean}
 */
export function canValidateProgramme(role) {
  const result = hasPermission(role, ACTIONS.PROGRAMME_VALIDER)
  console.log(`[CRV][PERMISSION_PROGRAMME] canValidateProgramme(${role}): ${result}`)
  return result
}

/**
 * Vérifie si un rôle peut supprimer des programmes vol
 * @param {string} role
 * @returns {boolean}
 */
export function canDeleteProgramme(role) {
  const result = hasPermission(role, ACTIONS.PROGRAMME_SUPPRIMER)
  console.log(`[CRV][PERMISSION_PROGRAMME] canDeleteProgramme(${role}): ${result} [Opérationnels]`)
  return result
}

/**
 * DOCTRINE: QUALITE = lecture seule ABSOLUE
 * @param {string} role
 * @returns {boolean}
 */
export function isReadOnlyRole(role) {
  const isReadOnly = role === ROLES.QUALITE
  console.log(`[CRV][READ_ONLY] isReadOnlyRole(${role}): ${isReadOnly}`)
  return isReadOnly
}

/**
 * Validation CRV - Tous sauf QUALITE
 * @param {string} role
 * @returns {boolean}
 */
export function canValidateCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_VALIDER)
  console.log(`[CRV][PERMISSION_CRV] canValidateCRV(${role}): ${result}`)
  return result
}

/**
 * Rejet CRV - Tous sauf QUALITE
 * @param {string} role
 * @returns {boolean}
 */
export function canRejectCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_REJETER)
  console.log(`[CRV][PERMISSION_CRV] canRejectCRV(${role}): ${result}`)
  return result
}

/**
 * Verrouillage CRV - Tous sauf QUALITE
 * @param {string} role
 * @returns {boolean}
 */
export function canLockCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_VERROUILLER)
  console.log(`[CRV][PERMISSION_CRV] canLockCRV(${role}): ${result}`)
  return result
}

/**
 * Déverrouillage CRV - Tous sauf QUALITE
 * @param {string} role
 * @returns {boolean}
 */
export function canUnlockCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_DEVERROUILLER)
  console.log(`[CRV][PERMISSION_CRV] canUnlockCRV(${role}): ${result}`)
  return result
}

/**
 * Vérifie si un rôle peut annuler un CRV
 * @param {string} role
 * @returns {boolean}
 */
export function canCancelCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_ANNULER)
  console.log(`[CRV][PERMISSION_CRV] canCancelCRV(${role}): ${result}`)
  return result
}

/**
 * Vérifie si un rôle peut éditer (tous sauf QUALITE)
 * DOCTRINE: QUALITE = lecture seule absolue
 * @param {string} role
 * @returns {boolean}
 */
export function canEdit(role) {
  const result = role !== ROLES.QUALITE
  console.log(`[CRV][PERMISSION_CRV] canEdit(${role}): ${result} [QUALITE=false]`)
  return result
}

/**
 * Vérifie si un rôle est administrateur système (pas d'accès métier CRV)
 * @param {string} role
 * @returns {boolean}
 */
export function isAdminRole(role) {
  const isAdmin = role === ROLES.ADMIN
  console.log(`[CRV][PERMISSION_ADMIN] isAdminRole(${role}): ${isAdmin}`)
  return isAdmin
}

// ============================================
// MESSAGES D'ERREUR SELON LE RÔLE - DOCTRINE
// ============================================

export const PERMISSION_MESSAGES = Object.freeze({
  QUALITE_READ_ONLY: 'Votre profil QUALITE est en lecture seule. Seuls les opérationnels et ADMIN peuvent agir sur les CRV.',
  INSUFFICIENT_PERMISSIONS: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
  VALIDATION_RESERVED: 'Validation CRV réservée aux rôles opérationnels et ADMIN.',
  REJET_RESERVED: 'Rejet CRV réservé aux rôles opérationnels et ADMIN.',
  VERROUILLAGE_RESERVED: 'Verrouillage CRV réservé aux rôles opérationnels et ADMIN.',
  DEVERROUILLAGE_RESERVED: 'Déverrouillage CRV réservé aux rôles opérationnels et ADMIN.',
  SUPPRESSION_CRV_RESERVED: 'Suppression CRV réservée aux rôles opérationnels et ADMIN.',
  SUPPRESSION_PROGRAMME_RESERVED: 'Suppression programme réservée au MANAGER uniquement.',
  ADMIN_ONLY: 'Accès refusé. Cette action est réservée aux administrateurs.',
  COMPLETUDE_INSUFFISANTE: 'Complétude insuffisante. Minimum 80% requis pour valider.',
  COMMENTAIRE_OBLIGATOIRE: 'Le commentaire est obligatoire pour rejeter un CRV.',
  RAISON_OBLIGATOIRE: 'La raison est obligatoire pour déverrouiller un CRV.'
})

/**
 * Retourne le message d'erreur approprié pour un refus de permission
 *
 * @param {string} role - Rôle de l'utilisateur
 * @param {string} action - Action tentée
 * @returns {string}
 */
export function getPermissionDeniedMessage(role, action) {
  console.log(`[CRV][PERMISSION_DENIED] ${role} tentative: ${action}`)

  // QUALITE est en lecture seule absolue pour toutes les actions CRV
  if (role === ROLES.QUALITE) {
    return PERMISSION_MESSAGES.QUALITE_READ_ONLY
  }

  // Messages spécifiques par action (pour les autres cas rares)
  if (action === ACTIONS.CRV_SUPPRIMER) {
    return PERMISSION_MESSAGES.SUPPRESSION_CRV_RESERVED
  }

  if (action === ACTIONS.PROGRAMME_VALIDER || action === ACTIONS.PROGRAMME_ACTIVER) {
    return 'Validation/Activation programme réservée aux SUPERVISEUR et MANAGER.'
  }

  if (action === ACTIONS.PROGRAMME_SUPPRIMER) {
    return PERMISSION_MESSAGES.SUPPRESSION_PROGRAMME_RESERVED
  }

  if (action.startsWith('USER_')) {
    return PERMISSION_MESSAGES.ADMIN_ONLY
  }

  return PERMISSION_MESSAGES.INSUFFICIENT_PERMISSIONS
}

// ============================================
// HELPERS POUR TRANSITIONS CRV
// ============================================

/**
 * Vérifie si l'utilisateur peut effectuer une transition de statut CRV
 * @param {string} role - Rôle de l'utilisateur
 * @param {string} fromStatus - Statut actuel
 * @param {string} toStatus - Statut cible
 * @returns {{allowed: boolean, message: string}}
 */
export function canTransitionCRV(role, fromStatus, toStatus) {
  console.log(`[CRV][TRANSITION_CHECK] ${role}: ${fromStatus} → ${toStatus}`)

  // QUALITE ne peut faire aucune transition (lecture seule absolue)
  if (role === ROLES.QUALITE) {
    console.log(`[CRV][TRANSITION_DENIED] QUALITE est en lecture seule`)
    return { allowed: false, message: PERMISSION_MESSAGES.QUALITE_READ_ONLY }
  }

  // Tous les autres rôles (opérationnels + ADMIN) peuvent faire toutes les transitions
  console.log(`[CRV][TRANSITION_ALLOWED] ${role}: ${fromStatus} → ${toStatus}`)
  return { allowed: true, message: '' }
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
  canValidateCRV,
  canRejectCRV,
  canLockCRV,
  canUnlockCRV,
  canCancelCRV,
  canEdit,
  isReadOnlyRole,
  isAdminRole,
  canTransitionCRV,
  PERMISSION_MESSAGES,
  getPermissionDeniedMessage
}
