/**
 * MATRICE DES PERMISSIONS - CONTRAT BACKEND
 *
 * Source de vérité : docs/process/MVS-10-Validation/05-process-metier.md
 *
 * RÈGLE ABSOLUE : Cette matrice reflète EXACTEMENT les permissions backend.
 * Le frontend ne DÉCIDE pas, il AFFICHE ce que le backend autorise.
 *
 * CORRECTION MVS-10 2026-01-10:
 * - CRV_VALIDER: QUALITE, ADMIN uniquement (validation = rôle QUALITE)
 * - CRV_REJETER: QUALITE, ADMIN uniquement (rejet avec commentaire obligatoire)
 * - CRV_VERROUILLER: QUALITE, ADMIN uniquement (verrouillage définitif)
 * - CRV_DEVERROUILLER: ADMIN uniquement (opération exceptionnelle)
 * - CRV_SUPPRIMER: SUPERVISEUR, MANAGER uniquement
 * - QUALITE: lecture seule sur CRV mais peut valider/rejeter/verrouiller
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
 * CORRECTION MVS-10 2026-01-10:
 * - CRV_VALIDER: QUALITE, ADMIN uniquement (séparation des rôles)
 * - CRV_REJETER: QUALITE, ADMIN uniquement (commentaire obligatoire)
 * - CRV_VERROUILLER: QUALITE, ADMIN uniquement (verrouillage définitif)
 * - CRV_DEVERROUILLER: ADMIN uniquement (opération exceptionnelle)
 * - CRV_SUPPRIMER: SUPERVISEUR, MANAGER uniquement
 */
const PERMISSION_MATRIX = {
  // CRV - Opérations de base
  [ACTIONS.CRV_CREER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_MODIFIER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_LIRE]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE],

  // Suppression réservée SUPERVISEUR et MANAGER
  [ACTIONS.CRV_SUPPRIMER]: [ROLES.SUPERVISEUR, ROLES.MANAGER],

  [ACTIONS.CRV_ARCHIVER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_DEMARRER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],
  [ACTIONS.CRV_TERMINER]: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER],

  // MVS-10: Validation QUALITE/ADMIN uniquement (prérequis: complétude >= 80%)
  [ACTIONS.CRV_VALIDER]: [ROLES.QUALITE, ROLES.ADMIN],

  // MVS-10: Rejet QUALITE/ADMIN uniquement (commentaire obligatoire)
  [ACTIONS.CRV_REJETER]: [ROLES.QUALITE, ROLES.ADMIN],

  // MVS-10: Verrouillage QUALITE/ADMIN uniquement (prérequis: statut VALIDE)
  [ACTIONS.CRV_VERROUILLER]: [ROLES.QUALITE, ROLES.ADMIN],

  // MVS-10: Déverrouillage ADMIN uniquement (opération exceptionnelle, raison obligatoire)
  [ACTIONS.CRV_DEVERROUILLER]: [ROLES.ADMIN],

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
 * MVS-10: Validation QUALITE/ADMIN uniquement
 * @param {string} role
 * @returns {boolean}
 */
export function canValidateCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_VALIDER)
  console.log(`[CRV][PERMISSION_CRV] canValidateCRV(${role}): ${result} [QUALITE/ADMIN only]`)
  return result
}

/**
 * MVS-10: Rejet QUALITE/ADMIN uniquement
 * @param {string} role
 * @returns {boolean}
 */
export function canRejectCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_REJETER)
  console.log(`[CRV][PERMISSION_CRV] canRejectCRV(${role}): ${result} [QUALITE/ADMIN only]`)
  return result
}

/**
 * MVS-10: Verrouillage QUALITE/ADMIN uniquement
 * @param {string} role
 * @returns {boolean}
 */
export function canLockCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_VERROUILLER)
  console.log(`[CRV][PERMISSION_CRV] canLockCRV(${role}): ${result} [QUALITE/ADMIN only]`)
  return result
}

/**
 * MVS-10: Déverrouillage ADMIN uniquement
 * @param {string} role
 * @returns {boolean}
 */
export function canUnlockCRV(role) {
  const result = hasPermission(role, ACTIONS.CRV_DEVERROUILLER)
  console.log(`[CRV][PERMISSION_CRV] canUnlockCRV(${role}): ${result} [ADMIN only]`)
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
  QUALITE_READ_ONLY: 'Votre profil QUALITE est en lecture seule pour les opérations CRV (création/modification).',
  ADMIN_NO_CRV: 'Les comptes ADMIN ne peuvent pas créer ou modifier des CRV. Utilisez un compte opérationnel.',
  INSUFFICIENT_PERMISSIONS: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
  VALIDATION_RESERVED: 'Validation CRV réservée aux rôles QUALITE et ADMIN.',
  REJET_RESERVED: 'Rejet CRV réservé aux rôles QUALITE et ADMIN.',
  VERROUILLAGE_RESERVED: 'Verrouillage CRV réservé aux rôles QUALITE et ADMIN.',
  DEVERROUILLAGE_RESERVED: 'Déverrouillage CRV réservé au rôle ADMIN uniquement.',
  SUPPRESSION_CRV_RESERVED: 'Suppression CRV réservée aux SUPERVISEUR et MANAGER.',
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

  // MVS-10: Actions de validation/rejet/verrouillage réservées QUALITE/ADMIN
  if (action === ACTIONS.CRV_VALIDER) {
    return PERMISSION_MESSAGES.VALIDATION_RESERVED
  }

  if (action === ACTIONS.CRV_REJETER) {
    return PERMISSION_MESSAGES.REJET_RESERVED
  }

  if (action === ACTIONS.CRV_VERROUILLER) {
    return PERMISSION_MESSAGES.VERROUILLAGE_RESERVED
  }

  if (action === ACTIONS.CRV_DEVERROUILLER) {
    return PERMISSION_MESSAGES.DEVERROUILLAGE_RESERVED
  }

  // QUALITE en lecture seule pour création/modification CRV
  if (role === ROLES.QUALITE && (action === ACTIONS.CRV_CREER || action === ACTIONS.CRV_MODIFIER)) {
    return PERMISSION_MESSAGES.QUALITE_READ_ONLY
  }

  // ADMIN ne peut pas créer/modifier de CRV
  if (role === ROLES.ADMIN && (action === ACTIONS.CRV_CREER || action === ACTIONS.CRV_MODIFIER)) {
    return PERMISSION_MESSAGES.ADMIN_NO_CRV
  }

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

  // MVS-10: Transitions de validation/rejet/verrouillage réservées QUALITE/ADMIN
  if (toStatus === 'VALIDE') {
    if (![ROLES.QUALITE, ROLES.ADMIN].includes(role)) {
      console.log(`[CRV][TRANSITION_DENIED] ${role} ne peut pas valider`)
      return { allowed: false, message: PERMISSION_MESSAGES.VALIDATION_RESERVED }
    }
  }

  // Transitions vers VERROUILLE - QUALITE/ADMIN uniquement
  if (toStatus === 'VERROUILLE') {
    if (![ROLES.QUALITE, ROLES.ADMIN].includes(role)) {
      console.log(`[CRV][TRANSITION_DENIED] ${role} ne peut pas verrouiller`)
      return { allowed: false, message: PERMISSION_MESSAGES.VERROUILLAGE_RESERVED }
    }
  }

  // Déverrouillage (depuis VERROUILLE) - ADMIN uniquement
  if (fromStatus === 'VERROUILLE') {
    if (role !== ROLES.ADMIN) {
      console.log(`[CRV][TRANSITION_DENIED] ${role} ne peut pas déverrouiller`)
      return { allowed: false, message: PERMISSION_MESSAGES.DEVERROUILLAGE_RESERVED }
    }
  }

  // Retour EN_COURS depuis TERMINE (rejet) - QUALITE/ADMIN uniquement
  if (fromStatus === 'TERMINE' && toStatus === 'EN_COURS') {
    if (![ROLES.QUALITE, ROLES.ADMIN].includes(role)) {
      console.log(`[CRV][TRANSITION_DENIED] ${role} ne peut pas rejeter`)
      return { allowed: false, message: PERMISSION_MESSAGES.REJET_RESERVED }
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
