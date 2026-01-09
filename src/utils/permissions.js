/**
 * MATRICE DES PERMISSIONS - CONTRAT BACKEND
 *
 * Source de vérité : DOCUMENTATION_FRONTEND_CRV.md
 *
 * RÈGLE ABSOLUE : Cette matrice reflète EXACTEMENT les permissions backend.
 * Le frontend ne DÉCIDE pas, il AFFICHE ce que le backend autorise.
 *
 * CORRECTION AUDIT 2025-01:
 * - CRV_VALIDER: CHEF_EQUIPE, SUPERVISEUR, MANAGER (pas AGENT_ESCALE)
 * - CRV_VERROUILLER: SUPERVISEUR, MANAGER uniquement
 * - CRV_DEVERROUILLER: SUPERVISEUR, MANAGER uniquement
 * - CRV_SUPPRIMER: SUPERVISEUR, MANAGER uniquement
 * - QUALITE: lecture seule ABSOLUE
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
 * CORRECTION AUDIT:
 * - CRV_VALIDER: CHEF_EQUIPE peut valider (pas AGENT_ESCALE)
 * - CRV_VERROUILLER: Seulement SUPERVISEUR, MANAGER
 * - CRV_DEVERROUILLER: Seulement SUPERVISEUR, MANAGER
 * - CRV_SUPPRIMER: Seulement SUPERVISEUR, MANAGER
 */
const PERMISSION_MATRIX = {
  // CRV - Opérations de base
  [ACTIONS.CRV_CREER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_MODIFIER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_LIRE]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE],

  // CORRECTION: Suppression réservée SUPERVISEUR et MANAGER
  [ACTIONS.CRV_SUPPRIMER]: [ROLES.SUPERVISEUR, ROLES.MANAGER],

  [ACTIONS.CRV_ARCHIVER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_DEMARRER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_TERMINER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],

  // CORRECTION: Validation par CHEF_EQUIPE, SUPERVISEUR, MANAGER (pas AGENT_ESCALE)
  [ACTIONS.CRV_VALIDER]: [ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],

  // CORRECTION: Verrouillage réservé SUPERVISEUR et MANAGER
  [ACTIONS.CRV_VERROUILLER]: [ROLES.SUPERVISEUR, ROLES.MANAGER],

  // CORRECTION: Déverrouillage réservé SUPERVISEUR et MANAGER
  [ACTIONS.CRV_DEVERROUILLER]: [ROLES.SUPERVISEUR, ROLES.MANAGER],

  [ACTIONS.CRV_ANNULER]: [ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_REACTIVER]: [ROLES.SUPERVISEUR, ROLES.MANAGER],

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
  [ACTIONS.PROGRAMME_SUSPENDRE]: [ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.PROGRAMME_SUPPRIMER]: [ROLES.MANAGER],

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

  const allowedRoles = PERMISSION_MATRIX[action]
  if (!allowedRoles) {
    console.warn(`[CRV][PERMISSION_CHECK] Action non définie dans la matrice: ${action}`)
    return false
  }

  const hasAccess = allowedRoles.includes(role)
  console.log(`[CRV][PERMISSION_CHECK] ${role} pour ${action}: ${hasAccess ? 'AUTORISÉ' : 'REFUSÉ'}`)

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
  console.log(`[CRV][PERMISSION_PROGRAMME] canDeleteProgramme(${role}): ${result} [MANAGER only]`)
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
 * CORRECTION AUDIT: Validation par CHEF_EQUIPE, SUPERVISEUR, MANAGER
 * AGENT_ESCALE ne peut PAS valider
 * @param {string} role
 * @returns {boolean}
 */
export function canValidateCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_VALIDER)
  console.log(`[CRV][PERMISSION_CRV] canValidateCRV(${role}): ${result} [CHEF_EQUIPE/SUPERVISEUR/MANAGER]`)
  return result
}

/**
 * CORRECTION AUDIT: Verrouillage réservé SUPERVISEUR et MANAGER
 * @param {string} role
 * @returns {boolean}
 */
export function canLockCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_VERROUILLER)
  console.log(`[CRV][PERMISSION_CRV] canLockCRV(${role}): ${result} [SUPERVISEUR/MANAGER only]`)
  return result
}

/**
 * CORRECTION AUDIT: Déverrouillage réservé SUPERVISEUR et MANAGER
 * @param {string} role
 * @returns {boolean}
 */
export function canUnlockCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_DEVERROUILLER)
  console.log(`[CRV][PERMISSION_CRV] canUnlockCRV(${role}): ${result} [SUPERVISEUR/MANAGER only]`)
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
  QUALITE_READ_ONLY: 'Votre profil QUALITE est en lecture seule. Vous ne pouvez pas créer ou modifier de données.',
  ADMIN_NO_CRV: 'Les comptes ADMIN ne peuvent pas effectuer d\'opérations CRV. Utilisez un compte opérationnel.',
  INSUFFICIENT_PERMISSIONS: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
  VALIDATION_RESERVED: 'Validation réservée aux CHEF_EQUIPE, SUPERVISEUR et MANAGER.',
  VERROUILLAGE_RESERVED: 'Verrouillage/Déverrouillage réservé aux SUPERVISEUR et MANAGER.',
  SUPPRESSION_CRV_RESERVED: 'Suppression CRV réservée aux SUPERVISEUR et MANAGER.',
  SUPPRESSION_PROGRAMME_RESERVED: 'Suppression programme réservée au MANAGER uniquement.',
  ADMIN_ONLY: 'Accès refusé. Cette action est réservée aux administrateurs.',
  AGENT_CANNOT_VALIDATE: 'Les AGENT_ESCALE ne peuvent pas valider les CRV. Contactez un CHEF_EQUIPE.'
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

  if (role === ROLES.QUALITE) {
    return PERMISSION_MESSAGES.QUALITE_READ_ONLY
  }

  if (role === ROLES.ADMIN && action.startsWith('CRV_')) {
    return PERMISSION_MESSAGES.ADMIN_NO_CRV
  }

  // CORRECTION: Messages spécifiques CRV
  if (action === ACTIONS.CRV_VALIDER) {
    if (role === ROLES.AGENT_ESCALE) {
      return PERMISSION_MESSAGES.AGENT_CANNOT_VALIDATE
    }
    return PERMISSION_MESSAGES.VALIDATION_RESERVED
  }

  if (action === ACTIONS.CRV_VERROUILLER || action === ACTIONS.CRV_DEVERROUILLER) {
    return PERMISSION_MESSAGES.VERROUILLAGE_RESERVED
  }

  if (action === ACTIONS.CRV_SUPPRIMER) {
    return PERMISSION_MESSAGES.SUPPRESSION_CRV_RESERVED
  }

  if (action === ACTIONS.PROGRAMME_VALIDER || action === ACTIONS.PROGRAMME_ACTIVER) {
    return PERMISSION_MESSAGES.VALIDATION_RESERVED
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

  // QUALITE ne peut rien faire
  if (role === ROLES.QUALITE) {
    return { allowed: false, message: PERMISSION_MESSAGES.QUALITE_READ_ONLY }
  }

  // Transitions vers VALIDE
  if (toStatus === 'VALIDE') {
    if (![ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER].includes(role)) {
      console.log(`[CRV][TRANSITION_DENIED] ${role} ne peut pas valider`)
      return { allowed: false, message: PERMISSION_MESSAGES.AGENT_CANNOT_VALIDATE }
    }
  }

  // Transitions vers VERROUILLE
  if (toStatus === 'VERROUILLE') {
    if (![ROLES.SUPERVISEUR, ROLES.MANAGER].includes(role)) {
      console.log(`[CRV][TRANSITION_DENIED] ${role} ne peut pas verrouiller`)
      return { allowed: false, message: PERMISSION_MESSAGES.VERROUILLAGE_RESERVED }
    }
  }

  // Déverrouillage (depuis VERROUILLE vers autre)
  if (fromStatus === 'VERROUILLE') {
    if (![ROLES.SUPERVISEUR, ROLES.MANAGER].includes(role)) {
      console.log(`[CRV][TRANSITION_DENIED] ${role} ne peut pas déverrouiller`)
      return { allowed: false, message: PERMISSION_MESSAGES.VERROUILLAGE_RESERVED }
    }
  }

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
