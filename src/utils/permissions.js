/**
 * MATRICE DES PERMISSIONS - CONTRAT BACKEND
 *
 * Source de vérité unique pour les permissions frontend.
 *
 * DOCTRINE STRICTE 2026-03-03 :
 * - ADMIN = infrastructure uniquement (comptes, rôles, paramètres, logs)
 * - ADMIN ne peut PAS intervenir dans le métier opérationnel (CRV, Programme, Bulletin)
 * - QUALITE = lecture seule absolue (ne peut RIEN faire sauf lire)
 * - OPÉRATIONNELS (AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER) = métier CRV
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
  PROFIL_CHANGER_MDP: 'PROFIL_CHANGER_MDP',

  // Bulletins de Mouvement
  BULLETIN_CREER: 'BULLETIN_CREER',
  BULLETIN_MODIFIER: 'BULLETIN_MODIFIER',
  BULLETIN_LIRE: 'BULLETIN_LIRE',
  BULLETIN_SUPPRIMER: 'BULLETIN_SUPPRIMER',
  BULLETIN_PUBLIER: 'BULLETIN_PUBLIER',
  BULLETIN_ARCHIVER: 'BULLETIN_ARCHIVER'
})

// ============================================
// MATRICE DES PERMISSIONS - DOCTRINE STRICTE
// ============================================

/**
 * DOCTRINE 2026-03-03 :
 * - ADMIN = périmètre infrastructure (comptes, paramètres, logs)
 * - ADMIN n'a AUCUN accès opérationnel (CRV, Programme, Bulletin, Avion)
 * - QUALITE = LECTURE SEULE ABSOLUE
 * - OPÉRATIONNELS = seuls rôles avec accès métier CRV
 */

// Rôles opérationnels : peuvent agir sur le métier (CRV, Programme, Bulletin)
const ROLES_OPERATIONNELS = [
  ROLES.AGENT_ESCALE,
  ROLES.CHEF_EQUIPE,
  ROLES.SUPERVISEUR,
  ROLES.MANAGER
]

const PERMISSION_MATRIX = {
  // CRV - Opérationnels uniquement (ADMIN = infrastructure, QUALITE = lecture seule)
  [ACTIONS.CRV_CREER]: ROLES_OPERATIONNELS,
  [ACTIONS.CRV_MODIFIER]: ROLES_OPERATIONNELS,
  [ACTIONS.CRV_LIRE]: [...ROLES_OPERATIONNELS, ROLES.QUALITE],
  [ACTIONS.CRV_SUPPRIMER]: ROLES_OPERATIONNELS,
  [ACTIONS.CRV_ARCHIVER]: ROLES_OPERATIONNELS,
  [ACTIONS.CRV_DEMARRER]: ROLES_OPERATIONNELS,
  [ACTIONS.CRV_TERMINER]: ROLES_OPERATIONNELS,
  // Validation/verrouillage/annulation restreints à SUPERVISEUR/MANAGER
  [ACTIONS.CRV_VALIDER]: [ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_REJETER]: [ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_VERROUILLER]: [ROLES.SUPERVISEUR, ROLES.MANAGER],
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

  // Programmes vol - Opérationnels uniquement (sauf QUALITE et ADMIN)
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
  [ACTIONS.PROFIL_CHANGER_MDP]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE, ROLES.ADMIN],

  // Bulletins de Mouvement - Opérationnels uniquement (ADMIN = infrastructure)
  [ACTIONS.BULLETIN_CREER]: ROLES_OPERATIONNELS,
  [ACTIONS.BULLETIN_MODIFIER]: ROLES_OPERATIONNELS,
  [ACTIONS.BULLETIN_LIRE]: [...ROLES_OPERATIONNELS, ROLES.QUALITE],
  [ACTIONS.BULLETIN_SUPPRIMER]: ROLES_OPERATIONNELS,
  [ACTIONS.BULLETIN_PUBLIER]: ROLES_OPERATIONNELS,
  [ACTIONS.BULLETIN_ARCHIVER]: ROLES_OPERATIONNELS
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

  // Normaliser le rôle en majuscules pour correspondre à la matrice
  const normalizedRole = typeof role === 'string' ? role.toUpperCase().trim() : role

  const allowedRoles = PERMISSION_MATRIX[action]
  if (!allowedRoles) {
    console.warn(`[CRV][PERMISSION_CHECK] Action non définie dans la matrice: ${action}`)
    return false
  }

  return allowedRoles.includes(normalizedRole)
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

  return actions.some(action => {
    const allowedRoles = PERMISSION_MATRIX[action]
    return allowedRoles && allowedRoles.includes(role)
  })
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

  return actions.every(action => {
    const allowedRoles = PERMISSION_MATRIX[action]
    return allowedRoles && allowedRoles.includes(role)
  })
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
// PERMISSIONS MÉTIER SPÉCIFIQUES CRV
// DOCTRINE STRICTE
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
 * Suppression CRV - Opérationnels uniquement
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
 * DOCTRINE: QUALITE = lecture seule ABSOLUE
 * @param {string} role
 * @returns {boolean}
 */
export function isReadOnlyRole(role) {
  return role === ROLES.QUALITE
}

/**
 * Validation CRV - SUPERVISEUR/MANAGER uniquement
 * @param {string} role
 * @returns {boolean}
 */
export function canValidateCRV(role) {
  return hasPermission(role, ACTIONS.CRV_VALIDER)
}

/**
 * Rejet CRV - SUPERVISEUR/MANAGER uniquement
 * @param {string} role
 * @returns {boolean}
 */
export function canRejectCRV(role) {
  return hasPermission(role, ACTIONS.CRV_REJETER)
}

/**
 * Verrouillage CRV - SUPERVISEUR/MANAGER uniquement
 * @param {string} role
 * @returns {boolean}
 */
export function canLockCRV(role) {
  return hasPermission(role, ACTIONS.CRV_VERROUILLER)
}

/**
 * Déverrouillage CRV - SUPERVISEUR/MANAGER uniquement
 * @param {string} role
 * @returns {boolean}
 */
export function canUnlockCRV(role) {
  return hasPermission(role, ACTIONS.CRV_DEVERROUILLER)
}

/**
 * Vérifie si un rôle peut annuler un CRV
 * @param {string} role
 * @returns {boolean}
 */
export function canCancelCRV(role) {
  return hasPermission(role, ACTIONS.CRV_ANNULER)
}

/**
 * Vérifie si un rôle peut éditer du contenu opérationnel (CRV, Programme, etc.)
 * DOCTRINE: QUALITE = lecture seule, ADMIN = infrastructure uniquement
 * @param {string} role
 * @returns {boolean}
 */
export function canEdit(role) {
  return role !== ROLES.QUALITE && role !== ROLES.ADMIN
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
// MESSAGES D'ERREUR SELON LE RÔLE - DOCTRINE
// ============================================

export const PERMISSION_MESSAGES = Object.freeze({
  QUALITE_READ_ONLY: 'Votre profil QUALITE est en lecture seule. Seuls les opérationnels peuvent agir sur les CRV.',
  INSUFFICIENT_PERMISSIONS: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
  VALIDATION_RESERVED: 'Validation CRV réservée aux SUPERVISEUR et MANAGER.',
  REJET_RESERVED: 'Rejet CRV réservé aux SUPERVISEUR et MANAGER.',
  VERROUILLAGE_RESERVED: 'Verrouillage CRV réservé aux SUPERVISEUR et MANAGER.',
  DEVERROUILLAGE_RESERVED: 'Déverrouillage CRV réservé aux SUPERVISEUR et MANAGER.',
  SUPPRESSION_CRV_RESERVED: 'Suppression CRV réservée aux rôles opérationnels.',
  SUPPRESSION_PROGRAMME_RESERVED: 'Suppression programme réservée au MANAGER uniquement.',
  ADMIN_ONLY: 'Accès refusé. Cette action est réservée aux administrateurs.',
  ADMIN_NO_OPERATIONAL: 'Le profil ADMIN est réservé à l\'infrastructure. Les opérations métier sont réservées aux rôles opérationnels.',
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
  // QUALITE est en lecture seule absolue pour toutes les actions CRV
  if (role === ROLES.QUALITE) {
    return PERMISSION_MESSAGES.QUALITE_READ_ONLY
  }

  // ADMIN ne peut pas accéder aux actions opérationnelles
  if (role === ROLES.ADMIN && !action.startsWith('USER_') && !action.startsWith('PROFIL_')) {
    return PERMISSION_MESSAGES.ADMIN_NO_OPERATIONAL
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
  // QUALITE ne peut faire aucune transition (lecture seule absolue)
  if (role === ROLES.QUALITE) {
    return { allowed: false, message: PERMISSION_MESSAGES.QUALITE_READ_ONLY }
  }

  // ADMIN ne peut faire aucune transition (périmètre infrastructure uniquement)
  if (role === ROLES.ADMIN) {
    return { allowed: false, message: PERMISSION_MESSAGES.ADMIN_NO_OPERATIONAL }
  }

  // Rôles opérationnels peuvent faire toutes les transitions
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
