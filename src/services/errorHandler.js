/**
 * Service de gestion des erreurs métier backend
 *
 * Centralise l'interprétation des codes d'erreur métier
 * et fournit des messages clairs pour les agents OPS
 */

/**
 * Codes d'erreur métier documentés dans REGLES_METIER.md et TRANSMISSION_BACKEND_FRONTEND.md
 */
export const ERROR_CODES = {
  // Verrouillage
  CRV_VERROUILLE: 'CRV_VERROUILLE',

  // Cohérence métier
  INCOHERENCE_TYPE_OPERATION: 'INCOHERENCE_TYPE_OPERATION',

  // Phase non réalisée
  MOTIF_NON_REALISATION_REQUIS: 'MOTIF_NON_REALISATION_REQUIS',
  DETAIL_MOTIF_REQUIS: 'DETAIL_MOTIF_REQUIS',

  // Valeurs explicites
  VALEURS_EXPLICITES_REQUISES: 'VALEURS_EXPLICITES_REQUISES',

  // Charges
  POIDS_REQUIS_AVEC_BAGAGES: 'POIDS_REQUIS_AVEC_BAGAGES',
  TYPE_FRET_REQUIS: 'TYPE_FRET_REQUIS',

  // ============================================
  // CODES AUTHENTIFICATION & PERMISSIONS
  // Source : TRANSMISSION_BACKEND_FRONTEND.md
  // ============================================

  // Permissions rôles
  QUALITE_READ_ONLY: 'QUALITE_READ_ONLY',
  ADMIN_ONLY: 'ADMIN_ONLY',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Authentification
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Gestion comptes
  ACCOUNT_IN_USE: 'ACCOUNT_IN_USE',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',

  // Bootstrap
  BOOTSTRAP_ALREADY_DONE: 'BOOTSTRAP_ALREADY_DONE',
}

/**
 * Messages terrain pour chaque code d'erreur métier
 */
const ERROR_MESSAGES = {
  [ERROR_CODES.CRV_VERROUILLE]: {
    titre: 'CRV Verrouillé',
    message: 'Ce CRV a été validé et ne peut plus être modifié. Contactez un manager pour le déverrouiller si nécessaire.',
    type: 'warning',
    icon: '🔒'
  },

  [ERROR_CODES.INCOHERENCE_TYPE_OPERATION]: {
    titre: 'Phase Incompatible',
    message: 'Cette phase ne correspond pas au type de vol. Vérifiez le type d\'opération (Arrivée/Départ).',
    type: 'error',
    icon: '⚠️'
  },

  [ERROR_CODES.MOTIF_NON_REALISATION_REQUIS]: {
    titre: 'Motif Requis',
    message: 'Veuillez sélectionner un motif pour expliquer pourquoi cette phase n\'a pas été réalisée.',
    type: 'error',
    icon: '📝'
  },

  [ERROR_CODES.DETAIL_MOTIF_REQUIS]: {
    titre: 'Justification Requise',
    message: 'Veuillez préciser la raison de non-réalisation de cette phase (champ obligatoire).',
    type: 'error',
    icon: '📝'
  },

  [ERROR_CODES.VALEURS_EXPLICITES_REQUISES]: {
    titre: 'Valeurs Manquantes',
    message: 'Tous les champs doivent être renseignés, même avec la valeur 0. Ne laissez aucun champ vide.',
    type: 'error',
    icon: '📊'
  },

  [ERROR_CODES.POIDS_REQUIS_AVEC_BAGAGES]: {
    titre: 'Poids Manquant',
    message: 'Si des bagages sont présents, vous devez indiquer leur poids total.',
    type: 'error',
    icon: '⚖️'
  },

  [ERROR_CODES.TYPE_FRET_REQUIS]: {
    titre: 'Type Fret Manquant',
    message: 'Si du fret est présent, vous devez préciser son type (Standard, Périssable, etc.).',
    type: 'error',
    icon: '📦'
  },

  // ============================================
  // MESSAGES AUTHENTIFICATION & PERMISSIONS
  // Source : TRANSMISSION_BACKEND_FRONTEND.md
  // ============================================

  [ERROR_CODES.QUALITE_READ_ONLY]: {
    titre: 'Profil Lecture Seule',
    message: 'Votre profil QUALITE est en lecture seule. Vous ne pouvez pas créer ou modifier de données.',
    type: 'warning',
    icon: '👁️'
  },

  [ERROR_CODES.ADMIN_ONLY]: {
    titre: 'Accès Administrateur Requis',
    message: 'Accès refusé. Cette action est réservée aux administrateurs.',
    type: 'warning',
    icon: '🔐'
  },

  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: {
    titre: 'Permissions Insuffisantes',
    message: 'Vous n\'avez pas les permissions nécessaires pour cette action. Contactez votre superviseur.',
    type: 'warning',
    icon: '🚫'
  },

  [ERROR_CODES.INVALID_CREDENTIALS]: {
    titre: 'Identifiants Incorrects',
    message: 'Email ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.',
    type: 'error',
    icon: '🔑'
  },

  [ERROR_CODES.ACCOUNT_DISABLED]: {
    titre: 'Compte Désactivé',
    message: 'Votre compte a été désactivé. Contactez l\'administrateur à support-crv@example.com',
    type: 'error',
    icon: '🚷'
  },

  [ERROR_CODES.TOKEN_EXPIRED]: {
    titre: 'Session Expirée',
    message: 'Votre session a expiré. Veuillez vous reconnecter.',
    type: 'warning',
    icon: '⏱️'
  },

  [ERROR_CODES.TOKEN_INVALID]: {
    titre: 'Session Invalide',
    message: 'Session invalide. Veuillez vous reconnecter.',
    type: 'warning',
    icon: '⚠️'
  },

  [ERROR_CODES.ACCOUNT_IN_USE]: {
    titre: 'Suppression Impossible',
    message: 'Impossible de supprimer ce compte : il a été utilisé pour créer des CRV. Utilisez la désactivation à la place.',
    type: 'error',
    icon: '🔗'
  },

  [ERROR_CODES.WEAK_PASSWORD]: {
    titre: 'Mot de Passe Faible',
    message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
    type: 'error',
    icon: '🔒'
  },

  [ERROR_CODES.EMAIL_ALREADY_EXISTS]: {
    titre: 'Email Déjà Utilisé',
    message: 'Cet email est déjà associé à un compte existant.',
    type: 'error',
    icon: '📧'
  },

  [ERROR_CODES.BOOTSTRAP_ALREADY_DONE]: {
    titre: 'Initialisation Terminée',
    message: 'Le système est déjà initialisé. Impossible de créer un nouveau compte administrateur via cette méthode.',
    type: 'warning',
    icon: '✅'
  }
}

/**
 * Messages génériques par code HTTP
 */
const HTTP_MESSAGES = {
  400: {
    titre: 'Données Invalides',
    message: 'Les informations saisies sont incorrectes ou incomplètes. Vérifiez les champs marqués en rouge.',
    type: 'error'
  },
  401: {
    titre: 'Session Expirée',
    message: 'Votre session a expiré. Veuillez vous reconnecter.',
    type: 'warning'
  },
  403: {
    titre: 'Action Non Autorisée',
    message: 'Vous n\'avez pas les droits nécessaires pour effectuer cette action.',
    type: 'warning'
  },
  404: {
    titre: 'Donnée Introuvable',
    message: 'L\'élément recherché n\'existe pas ou a été supprimé.',
    type: 'error'
  },
  500: {
    titre: 'Erreur Serveur',
    message: 'Une erreur technique est survenue. Contactez le support si le problème persiste.',
    type: 'error'
  }
}

/**
 * Extrait les informations d'erreur métier depuis la réponse API
 *
 * @param {Object} error - Erreur Axios
 * @returns {Object} Informations d'erreur formatées
 */
export function parseErrorMetier(error) {
  // Erreur réseau (pas de réponse)
  if (!error.response) {
    return {
      titre: 'Erreur de Connexion',
      message: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
      type: 'error',
      icon: '🌐',
      code: 'NETWORK_ERROR',
      statusCode: null
    }
  }

  const { status, data } = error.response
  const errorCode = data?.code
  const errorMessage = data?.message
  const errorDetails = data?.details

  // Si code d'erreur métier reconnu
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return {
      ...ERROR_MESSAGES[errorCode],
      code: errorCode,
      statusCode: status,
      details: errorDetails,
      rawMessage: errorMessage
    }
  }

  // Si erreur HTTP standard
  if (HTTP_MESSAGES[status]) {
    return {
      ...HTTP_MESSAGES[status],
      code: errorCode || `HTTP_${status}`,
      statusCode: status,
      details: errorDetails,
      rawMessage: errorMessage
    }
  }

  // Erreur inconnue
  return {
    titre: 'Erreur Inattendue',
    message: errorMessage || 'Une erreur est survenue. Réessayez ou contactez le support.',
    type: 'error',
    icon: '❌',
    code: errorCode || 'UNKNOWN',
    statusCode: status,
    details: errorDetails
  }
}

/**
 * Gère une erreur métier et retourne un objet formaté pour l'affichage
 *
 * @param {Object} error - Erreur Axios
 * @param {Object} options - Options d'affichage
 * @returns {Object} Erreur formatée
 */
export function handleErrorMetier(error, options = {}) {
  const errorInfo = parseErrorMetier(error)

  const {
    showDetails = false,
    logToConsole = true
  } = options

  // Log en console pour debug
  if (logToConsole) {
    console.error('[Erreur Métier]', {
      code: errorInfo.code,
      status: errorInfo.statusCode,
      titre: errorInfo.titre,
      message: errorInfo.message,
      details: errorInfo.details,
      raw: error
    })
  }

  // Format pour affichage UI
  const result = {
    titre: errorInfo.titre,
    message: errorInfo.message,
    type: errorInfo.type,
    icon: errorInfo.icon,
    code: errorInfo.code
  }

  // Ajouter les détails si demandé
  if (showDetails && errorInfo.details) {
    result.details = errorInfo.details
  }

  return result
}

/**
 * Vérifie si une erreur est de type "CRV Verrouillé"
 *
 * @param {Object} error - Erreur Axios
 * @returns {Boolean}
 */
export function isCRVVerrouille(error) {
  return error.response?.data?.code === ERROR_CODES.CRV_VERROUILLE
}

/**
 * Vérifie si une erreur est de type "Session Expirée"
 *
 * @param {Object} error - Erreur Axios
 * @returns {Boolean}
 */
export function isSessionExpiree(error) {
  return error.response?.status === 401
}

/**
 * Vérifie si une erreur nécessite une action utilisateur
 *
 * @param {Object} error - Erreur Axios
 * @returns {Boolean}
 */
export function requiresUserAction(error) {
  const code = error.response?.data?.code
  return [
    ERROR_CODES.MOTIF_NON_REALISATION_REQUIS,
    ERROR_CODES.DETAIL_MOTIF_REQUIS,
    ERROR_CODES.VALEURS_EXPLICITES_REQUISES,
    ERROR_CODES.POIDS_REQUIS_AVEC_BAGAGES,
    ERROR_CODES.TYPE_FRET_REQUIS
  ].includes(code)
}

// ============================================
// FONCTIONS DE VÉRIFICATION PERMISSIONS
// Source : TRANSMISSION_BACKEND_FRONTEND.md
// ============================================

/**
 * Vérifie si une erreur est de type "QUALITE lecture seule"
 *
 * @param {Object} error - Erreur Axios
 * @returns {Boolean}
 */
export function isQualiteReadOnly(error) {
  return error.response?.data?.code === ERROR_CODES.QUALITE_READ_ONLY
}

/**
 * Vérifie si une erreur est de type "Admin uniquement"
 *
 * @param {Object} error - Erreur Axios
 * @returns {Boolean}
 */
export function isAdminOnly(error) {
  return error.response?.data?.code === ERROR_CODES.ADMIN_ONLY
}

/**
 * Vérifie si une erreur est de type "Permissions insuffisantes"
 *
 * @param {Object} error - Erreur Axios
 * @returns {Boolean}
 */
export function isInsufficientPermissions(error) {
  const code = error.response?.data?.code
  return [
    ERROR_CODES.QUALITE_READ_ONLY,
    ERROR_CODES.ADMIN_ONLY,
    ERROR_CODES.INSUFFICIENT_PERMISSIONS
  ].includes(code)
}

/**
 * Vérifie si une erreur est de type "Compte désactivé"
 *
 * @param {Object} error - Erreur Axios
 * @returns {Boolean}
 */
export function isAccountDisabled(error) {
  return error.response?.data?.code === ERROR_CODES.ACCOUNT_DISABLED
}

/**
 * Vérifie si une erreur nécessite une redéconnexion (401 ou token invalide)
 *
 * @param {Object} error - Erreur Axios
 * @returns {Boolean}
 */
export function requiresRelogin(error) {
  const status = error.response?.status
  const code = error.response?.data?.code
  return status === 401 || code === ERROR_CODES.TOKEN_EXPIRED || code === ERROR_CODES.TOKEN_INVALID
}

/**
 * Vérifie si une erreur est liée à la validation du mot de passe
 *
 * @param {Object} error - Erreur Axios
 * @returns {Boolean}
 */
export function isPasswordError(error) {
  return error.response?.data?.code === ERROR_CODES.WEAK_PASSWORD
}

/**
 * Vérifie si une erreur est liée à un email déjà utilisé
 *
 * @param {Object} error - Erreur Axios
 * @returns {Boolean}
 */
export function isEmailAlreadyExists(error) {
  return error.response?.data?.code === ERROR_CODES.EMAIL_ALREADY_EXISTS
}

export default {
  ERROR_CODES,
  parseErrorMetier,
  handleErrorMetier,
  isCRVVerrouille,
  isSessionExpiree,
  requiresUserAction,
  // Nouvelles fonctions permissions
  isQualiteReadOnly,
  isAdminOnly,
  isInsufficientPermissions,
  isAccountDisabled,
  requiresRelogin,
  isPasswordError,
  isEmailAlreadyExists
}
