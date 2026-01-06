/**
 * SERVICE D'AUTHENTIFICATION - FAÇADE LEGACY
 *
 * Ce service est maintenu pour compatibilité avec le code existant.
 * Recommandation : Utiliser directement useAuthStore pour les nouvelles fonctionnalités.
 *
 * Source de vérité : authAPI dans @/services/api.js
 *
 * Endpoints utilisés :
 * - POST /api/auth/connexion
 * - POST /api/auth/deconnexion
 * - POST /api/auth/changer-mot-de-passe
 * - GET /api/auth/me
 */

import { authAPI } from '@/services/api'
import { normalizeRole } from '@/config/roles'

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Connexion utilisateur
 * Endpoint : POST /api/auth/connexion
 *
 * @param {Object} credentials - { email, mot_de_passe }
 * @returns {Object} - { token, utilisateur, doitChangerMotDePasse? }
 */
export const loginUser = async (credentials) => {
  try {
    const response = await authAPI.login(credentials)
    const data = response.data

    if (data && data.token) {
      // Extraire les données utilisateur
      const utilisateur = data.utilisateur || data.user || {}

      // Normaliser le rôle selon le contrat backend
      const roleNormalise = normalizeRole(utilisateur)

      // Construire l'objet userData conforme
      const userData = {
        id: utilisateur.id || utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        fonction: roleNormalise,
        role: roleNormalise,
        matricule: utilisateur.matricule,
        telephone: utilisateur.telephone,
        doitChangerMotDePasse: data.doitChangerMotDePasse || utilisateur.doitChangerMotDePasse || false
      }

      // Stockage
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('userData', JSON.stringify(userData))

      console.log('[CRV Auth] Connexion réussie:', {
        email: userData.email,
        fonction: userData.fonction,
        doitChangerMotDePasse: userData.doitChangerMotDePasse
      })

      return {
        token: data.token,
        utilisateur: userData,
        doitChangerMotDePasse: userData.doitChangerMotDePasse
      }
    }

    throw new Error('Réponse de connexion invalide')
  } catch (error) {
    console.error('[CRV Auth] Erreur connexion:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Déconnexion utilisateur
 * Endpoint : POST /api/auth/deconnexion
 */
export const logoutUser = async () => {
  try {
    // Tenter d'informer le backend (même si échoue, on nettoie localement)
    await authAPI.logout().catch(() => {
      // Ignorer les erreurs de logout côté serveur
    })
  } finally {
    // TOUJOURS nettoyer le stockage local
    localStorage.removeItem('auth_token')
    localStorage.removeItem('userData')
  }
}

/**
 * Changement de mot de passe
 * Endpoint : POST /api/auth/changer-mot-de-passe
 *
 * @param {Object} data - { ancienMotDePasse, nouveauMotDePasse }
 * @returns {Object} - Réponse backend
 */
export const changerMotDePasse = async (data) => {
  try {
    const response = await authAPI.changerMotDePasse(data)

    // Si succès, mettre à jour le flag doitChangerMotDePasse
    if (response.data?.success) {
      const userData = getUserData()
      if (userData) {
        userData.doitChangerMotDePasse = false
        localStorage.setItem('userData', JSON.stringify(userData))
      }
    }

    return response.data
  } catch (error) {
    console.error('[CRV Auth] Erreur changement MDP:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Récupérer le profil utilisateur
 * Endpoint : GET /api/auth/me
 */
export const fetchCurrentUser = async () => {
  try {
    const response = await authAPI.me()
    const utilisateur = response.data.utilisateur || response.data

    // Mettre à jour le stockage local
    const roleNormalise = normalizeRole(utilisateur)
    const userData = {
      id: utilisateur.id || utilisateur._id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      fonction: roleNormalise,
      role: roleNormalise,
      matricule: utilisateur.matricule,
      telephone: utilisateur.telephone
    }

    localStorage.setItem('userData', JSON.stringify(userData))
    return userData
  } catch (error) {
    console.error('[CRV Auth] Erreur fetch user:', error.response?.data || error.message)
    throw error
  }
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Récupérer le token JWT stocké
 */
export const getToken = () => {
  return localStorage.getItem('auth_token')
}

/**
 * Récupérer le rôle normalisé de l'utilisateur
 * @returns {string|null} - Rôle conforme (AGENT_ESCALE, ADMIN, etc.)
 */
export const getUserRole = () => {
  const userData = getUserData()
  if (!userData) return null

  // Priorité : fonction (backend) > role (alias)
  return userData.fonction || userData.role || null
}

/**
 * Récupérer les données utilisateur complètes
 */
export const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem('userData') || 'null')
  } catch {
    return null
  }
}

/**
 * Vérifier si l'utilisateur doit changer son mot de passe
 * @returns {boolean}
 */
export const doitChangerMotDePasse = () => {
  const userData = getUserData()
  return userData?.doitChangerMotDePasse === true
}

/**
 * Vérifier si l'utilisateur est authentifié
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken()
}

/**
 * Vérifier si l'utilisateur a un rôle spécifique
 * @param {string|Array} roles - Rôle(s) à vérifier
 * @returns {boolean}
 */
export const hasRole = (roles) => {
  const userRole = getUserRole()
  if (!userRole) return false

  if (Array.isArray(roles)) {
    return roles.includes(userRole)
  }
  return userRole === roles
}

// Export par défaut
export default {
  loginUser,
  logoutUser,
  changerMotDePasse,
  fetchCurrentUser,
  getToken,
  getUserRole,
  getUserData,
  doitChangerMotDePasse,
  isAuthenticated,
  hasRole
}
