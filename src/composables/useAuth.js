/**
 * COMPOSABLE D'AUTHENTIFICATION - WRAPPER AUTHSTORE
 *
 * DOCTRINE PHASE 3 (2026-03-03) :
 * - Simple wrapper réactif read-only sur authStore
 * - Aucun état propre, aucune normalisation, aucune logique duplicative
 * - Gère uniquement l'UX (toast + navigation) autour des actions du store
 * - Toute donnée provient de authStore (source de vérité unique)
 */

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { ROLES } from '@/config/roles'
import { hasPermission, ACTIONS, canOperateCRV, canViewCRV, canManageUsers } from '@/utils/permissions'
import { isReadOnly } from '@/config/roles'

export function useAuth() {
  const router = useRouter()
  const toast = useToast()
  const authStore = useAuthStore()

  // ============================================
  // ÉTAT RÉACTIF (computed read-only depuis authStore)
  // ============================================
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const userRole = computed(() => authStore.getUserRole)
  const userData = computed(() => authStore.currentUser)
  const userName = computed(() => authStore.getUserFullName)
  const userEmail = computed(() => authStore.currentUser?.email || '')
  const isLoading = computed(() => authStore.loading)
  const error = computed(() => authStore.error)
  const mustChangePassword = computed(() => authStore.mustChangePassword)

  // ============================================
  // COMPUTED - RÔLES (6 rôles backend)
  // ============================================
  const isAgentEscale = computed(() => userRole.value === ROLES.AGENT_ESCALE)
  const isChefEquipe = computed(() => userRole.value === ROLES.CHEF_EQUIPE)
  const isSuperviseur = computed(() => userRole.value === ROLES.SUPERVISEUR)
  const isManager = computed(() => userRole.value === ROLES.MANAGER)
  const isQualite = computed(() => userRole.value === ROLES.QUALITE)
  const isAdmin = computed(() => userRole.value === ROLES.ADMIN)

  // Alias compatibilité
  const isAgent = computed(() =>
    [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER].includes(userRole.value)
  )

  // ============================================
  // COMPUTED - PERMISSIONS MÉTIER
  // ============================================
  const canCreateCRV = computed(() => canOperateCRV(userRole.value))
  const canReadCRV = computed(() => canViewCRV(userRole.value))
  const isReadOnlyMode = computed(() => isReadOnly(userRole.value))
  const canManageUsersComputed = computed(() => canManageUsers(userRole.value))

  // ============================================
  // ACTIONS (délèguent au store + gèrent l'UX)
  // ============================================

  /**
   * Connexion utilisateur
   * Délègue à authStore.login() puis gère toast + redirection
   */
  const login = async (credentials) => {
    try {
      const result = await authStore.login(credentials)

      // Gestion doitChangerMotDePasse (OBLIGATOIRE selon contrat backend)
      if (authStore.mustChangePassword) {
        toast.warning('Vous devez changer votre mot de passe avant de continuer.')
        router.push('/changer-mot-de-passe')
        return result
      }

      toast.success('Connexion réussie !')
      router.push(getRedirectPathForRole(authStore.getUserRole))
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la connexion'
      toast.error(errorMessage)
      throw err
    }
  }

  /**
   * Déconnexion utilisateur
   * Délègue à authStore.logout() puis gère toast + redirection
   */
  const logout = async () => {
    try {
      await authStore.logout()
      toast.info('Déconnexion réussie')
      router.push('/login')
    } catch (err) {
      console.error('[useAuth] Erreur déconnexion:', err)
      router.push('/login')
    }
  }

  /**
   * Changement de mot de passe
   * Délègue à authStore.changerMotDePasse() puis gère toast + redirection
   */
  const updatePassword = async (ancienMotDePasse, nouveauMotDePasse) => {
    try {
      const result = await authStore.changerMotDePasse({ ancienMotDePasse, nouveauMotDePasse })
      toast.success('Mot de passe changé avec succès !')
      router.push(getRedirectPathForRole(userRole.value))
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du changement de mot de passe'
      toast.error(errorMessage)
      throw err
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Retourne le chemin de redirection selon le rôle
   */
  const getRedirectPathForRole = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return '/dashboard-admin'
      case ROLES.MANAGER:
        return '/dashboard-manager'
      case ROLES.QUALITE:
      case ROLES.SUPERVISEUR:
      case ROLES.CHEF_EQUIPE:
      case ROLES.AGENT_ESCALE:
      default:
        return '/services'
    }
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  const hasRole = (role) => authStore.hasRole(role)

  /**
   * Vérifie si l'utilisateur a l'un des rôles listés
   */
  const hasAnyRole = (roles) => {
    if (!Array.isArray(roles)) return false
    return roles.some(r => authStore.hasRole(r))
  }

  /**
   * Vérifie si l'utilisateur peut effectuer une action
   */
  const can = (action) => hasPermission(userRole.value, action)

  return {
    // État (depuis authStore)
    isAuthenticated,
    userRole,
    userData,
    userName,
    userEmail,
    isLoading,
    error,
    mustChangePassword,

    // Rôles
    isAgentEscale,
    isChefEquipe,
    isSuperviseur,
    isManager,
    isQualite,
    isAdmin,
    isAgent,

    // Permissions
    canCreateCRV,
    canReadCRV,
    isReadOnlyMode,
    canManageUsers: canManageUsersComputed,

    // Actions
    login,
    logout,
    updatePassword,

    // Helpers
    hasRole,
    hasAnyRole,
    can,
    getRedirectPathForRole,

    // Constantes
    ROLES,
    ACTIONS
  }
}
