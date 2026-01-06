/**
 * CONFIGURATION DES RÔLES - CONTRAT BACKEND
 *
 * Source de vérité : TRANSMISSION_BACKEND_FRONTEND.md
 *
 * RÈGLE ABSOLUE : Ces valeurs correspondent EXACTEMENT aux valeurs backend.
 * Ne JAMAIS renommer, modifier ou inventer de nouveaux rôles.
 */

// ============================================
// CONSTANTES DES RÔLES (valeurs backend exactes)
// ============================================

export const ROLES = Object.freeze({
  AGENT_ESCALE: 'AGENT_ESCALE',
  CHEF_EQUIPE: 'CHEF_EQUIPE',
  SUPERVISEUR: 'SUPERVISEUR',
  MANAGER: 'MANAGER',
  QUALITE: 'QUALITE',
  ADMIN: 'ADMIN'
})

// ============================================
// GROUPES DE RÔLES (pour simplifier les conditions)
// ============================================

/**
 * Rôles opérationnels : peuvent créer/modifier des CRV
 */
export const ROLES_OPERATIONNELS = Object.freeze([
  ROLES.AGENT_ESCALE,
  ROLES.CHEF_EQUIPE,
  ROLES.SUPERVISEUR,
  ROLES.MANAGER
])

/**
 * Rôles avec accès CRV (lecture au minimum)
 */
export const ROLES_ACCES_CRV = Object.freeze([
  ROLES.AGENT_ESCALE,
  ROLES.CHEF_EQUIPE,
  ROLES.SUPERVISEUR,
  ROLES.MANAGER,
  ROLES.QUALITE
])

/**
 * Rôles avec droits de validation programmes vol
 */
export const ROLES_VALIDATION_PROGRAMME = Object.freeze([
  ROLES.SUPERVISEUR,
  ROLES.MANAGER
])

/**
 * Rôles avec droits de suppression CRV
 */
export const ROLES_SUPPRESSION_CRV = Object.freeze([
  ROLES.SUPERVISEUR,
  ROLES.MANAGER
])

/**
 * Rôle unique pour suppression programme vol
 */
export const ROLES_SUPPRESSION_PROGRAMME = Object.freeze([
  ROLES.MANAGER
])

// ============================================
// LABELS AFFICHAGE (pour l'UI)
// ============================================

export const ROLES_LABELS = Object.freeze({
  [ROLES.AGENT_ESCALE]: 'Agent d\'escale',
  [ROLES.CHEF_EQUIPE]: 'Chef d\'équipe',
  [ROLES.SUPERVISEUR]: 'Superviseur',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.QUALITE]: 'Qualité',
  [ROLES.ADMIN]: 'Administrateur'
})

// ============================================
// FONCTION DE NORMALISATION
// ============================================

/**
 * Normalise un rôle backend vers la constante frontend correspondante.
 *
 * Le backend peut retourner le rôle dans différents formats :
 * - Directement : "AGENT_ESCALE"
 * - Dans un champ 'fonction' ou 'role'
 * - Potentiellement en minuscules ou casse mixte
 *
 * Cette fonction garantit une valeur normalisée ou null si invalide.
 *
 * @param {string|object} backendRole - Rôle ou objet utilisateur du backend
 * @returns {string|null} - Rôle normalisé (MAJUSCULES) ou null si non reconnu
 */
export function normalizeRole(backendRole) {
  if (!backendRole) {
    return null
  }

  // Si c'est un objet (ex: réponse utilisateur), extraire le champ pertinent
  let roleValue = backendRole
  if (typeof backendRole === 'object') {
    // Le backend utilise 'fonction' selon le document de référence
    roleValue = backendRole.fonction || backendRole.role || backendRole.function || null
  }

  if (!roleValue || typeof roleValue !== 'string') {
    return null
  }

  // Normaliser en majuscules
  const normalized = roleValue.toUpperCase().trim()

  // Vérifier que c'est un rôle valide
  if (Object.values(ROLES).includes(normalized)) {
    return normalized
  }

  // Mapping de compatibilité (anciens noms frontend → nouveaux noms backend)
  // À SUPPRIMER une fois la migration terminée
  const LEGACY_MAPPING = {
    'AGENT_OPS': ROLES.AGENT_ESCALE,
    'AGENT': ROLES.AGENT_ESCALE,
    'ADMIN': ROLES.ADMIN,
    'MANAGER': ROLES.MANAGER
  }

  if (LEGACY_MAPPING[normalized]) {
    console.warn(`[ROLES] Rôle legacy détecté: ${normalized} → ${LEGACY_MAPPING[normalized]}. Mettre à jour le backend.`)
    return LEGACY_MAPPING[normalized]
  }

  console.error(`[ROLES] Rôle non reconnu: ${roleValue}`)
  return null
}

// ============================================
// HELPERS DE VÉRIFICATION
// ============================================

/**
 * Vérifie si un rôle est opérationnel (peut créer/modifier CRV)
 * @param {string} role - Rôle normalisé
 * @returns {boolean}
 */
export function isRoleOperationnel(role) {
  return ROLES_OPERATIONNELS.includes(role)
}

/**
 * Vérifie si un rôle a accès aux CRV (au moins lecture)
 * @param {string} role - Rôle normalisé
 * @returns {boolean}
 */
export function hasAccessCRV(role) {
  return ROLES_ACCES_CRV.includes(role)
}

/**
 * Vérifie si un rôle est en lecture seule (QUALITE)
 * @param {string} role - Rôle normalisé
 * @returns {boolean}
 */
export function isReadOnly(role) {
  return role === ROLES.QUALITE
}

/**
 * Vérifie si un rôle est ADMIN
 * @param {string} role - Rôle normalisé
 * @returns {boolean}
 */
export function isAdmin(role) {
  return role === ROLES.ADMIN
}

/**
 * Vérifie si un rôle peut valider des programmes vol
 * @param {string} role - Rôle normalisé
 * @returns {boolean}
 */
export function canValidateProgramme(role) {
  return ROLES_VALIDATION_PROGRAMME.includes(role)
}

/**
 * Vérifie si un rôle peut supprimer des CRV
 * @param {string} role - Rôle normalisé
 * @returns {boolean}
 */
export function canDeleteCRV(role) {
  return ROLES_SUPPRESSION_CRV.includes(role)
}

/**
 * Vérifie si un rôle peut supprimer des programmes vol
 * @param {string} role - Rôle normalisé
 * @returns {boolean}
 */
export function canDeleteProgramme(role) {
  return ROLES_SUPPRESSION_PROGRAMME.includes(role)
}

/**
 * Retourne le label d'affichage d'un rôle
 * @param {string} role - Rôle normalisé
 * @returns {string}
 */
export function getRoleLabel(role) {
  return ROLES_LABELS[role] || 'Rôle inconnu'
}

/**
 * Retourne la liste des rôles pour un dropdown (ex: formulaire admin)
 * @returns {Array<{value: string, label: string}>}
 */
export function getRolesForSelect() {
  return Object.entries(ROLES_LABELS).map(([value, label]) => ({
    value,
    label
  }))
}

export default {
  ROLES,
  ROLES_OPERATIONNELS,
  ROLES_ACCES_CRV,
  ROLES_VALIDATION_PROGRAMME,
  ROLES_SUPPRESSION_CRV,
  ROLES_SUPPRESSION_PROGRAMME,
  ROLES_LABELS,
  normalizeRole,
  isRoleOperationnel,
  hasAccessCRV,
  isReadOnly,
  isAdmin,
  canValidateProgramme,
  canDeleteCRV,
  canDeleteProgramme,
  getRoleLabel,
  getRolesForSelect
}
