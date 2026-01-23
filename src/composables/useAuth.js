/**
 * COMPOSABLE D'AUTHENTIFICATION - CONTRAT BACKEND
 *
 * Source de vérité : TRANSMISSION_BACKEND_FRONTEND.md
 *
 * Gère l'état d'authentification et les redirections selon les rôles.
 */

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import {
  loginUser,
  logoutUser,
  changerMotDePasse,
  getToken,
  getUserRole,
  getUserData,
  doitChangerMotDePasse as checkDoitChangerMDP
} from '@/services/auth/authService';
import { ROLES, normalizeRole, isReadOnly, isAdmin as checkIsAdmin } from '@/config/roles';
import { hasPermission, ACTIONS, canOperateCRV, canViewCRV, canManageUsers } from '@/utils/permissions';

export function useAuth() {
  const router = useRouter();
  const toast = useToast();

  // ============================================
  // ÉTATS RÉACTIFS
  // ============================================
  const isAuthenticated = ref(!!getToken());
  const userRole = ref(getUserRole());
  const userData = ref(getUserData());
  const isLoading = ref(false);
  const error = ref(null);
  const mustChangePassword = ref(checkDoitChangerMDP());

  // ============================================
  // COMPUTED - INFORMATIONS UTILISATEUR
  // ============================================
  const userName = computed(() => {
    const data = userData.value;
    if (!data) return '';
    if (data.prenom && data.nom) return `${data.prenom} ${data.nom}`;
    return data.email || '';
  });

  const userEmail = computed(() => userData.value?.email || '');

  // ============================================
  // COMPUTED - VÉRIFICATION DES RÔLES (6 RÔLES BACKEND)
  // ============================================
  const isAgentEscale = computed(() => userRole.value === ROLES.AGENT_ESCALE);
  const isChefEquipe = computed(() => userRole.value === ROLES.CHEF_EQUIPE);
  const isSuperviseur = computed(() => userRole.value === ROLES.SUPERVISEUR);
  const isManager = computed(() => userRole.value === ROLES.MANAGER);
  const isQualite = computed(() => userRole.value === ROLES.QUALITE);
  const isAdmin = computed(() => userRole.value === ROLES.ADMIN);

  // Alias pour compatibilité avec l'ancien code
  const isAgent = computed(() =>
    [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER].includes(userRole.value)
  );

  // ============================================
  // COMPUTED - PERMISSIONS MÉTIER
  // ============================================

  /**
   * Peut effectuer des opérations CRV (création/modification)
   * = Tous sauf QUALITE et ADMIN
   */
  const canCreateCRV = computed(() => canOperateCRV(userRole.value));

  /**
   * Peut voir les CRV (lecture)
   * = Tous sauf ADMIN
   */
  const canReadCRV = computed(() => canViewCRV(userRole.value));

  /**
   * Est en mode lecture seule (QUALITE)
   */
  const isReadOnlyMode = computed(() => isReadOnly(userRole.value));

  /**
   * Peut gérer les utilisateurs (ADMIN uniquement)
   */
  const canManageUsersComputed = computed(() => canManageUsers(userRole.value));

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Connexion utilisateur
   * Gère la redirection selon le rôle ET doitChangerMotDePasse
   */
  const login = async (credentials) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await loginUser(credentials);

      // Mise à jour des états
      isAuthenticated.value = true;
      userRole.value = getUserRole();
      userData.value = getUserData();
      mustChangePassword.value = response.doitChangerMotDePasse;

      // GESTION doitChangerMotDePasse (OBLIGATOIRE selon contrat backend)
      if (mustChangePassword.value) {
        toast.warning('Vous devez changer votre mot de passe avant de continuer.');
        router.push('/changer-mot-de-passe');
        return response;
      }

      toast.success('Connexion réussie !');

      // Redirection selon le rôle (6 rôles backend)
      const redirectPath = getRedirectPathForRole(userRole.value);
      router.push(redirectPath);

      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la connexion';
      error.value = errorMessage;
      toast.error(errorMessage);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Déconnexion utilisateur
   */
  const logout = async () => {
    try {
      await logoutUser();

      // Réinitialisation des états
      isAuthenticated.value = false;
      userRole.value = null;
      userData.value = null;
      mustChangePassword.value = false;

      toast.info('Déconnexion réussie');
      router.push('/login');
    } catch (err) {
      console.error('[useAuth] Erreur déconnexion:', err);
      // Forcer la déconnexion locale même en cas d'erreur
      isAuthenticated.value = false;
      userRole.value = null;
      userData.value = null;
      router.push('/login');
    }
  };

  /**
   * Changement de mot de passe
   */
  const updatePassword = async (ancienMotDePasse, nouveauMotDePasse) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await changerMotDePasse({ ancienMotDePasse, nouveauMotDePasse });

      // Mise à jour du flag
      mustChangePassword.value = false;
      userData.value = getUserData();

      toast.success('Mot de passe changé avec succès !');

      // Rediriger vers le dashboard approprié
      const redirectPath = getRedirectPathForRole(userRole.value);
      router.push(redirectPath);

      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du changement de mot de passe';
      error.value = errorMessage;
      toast.error(errorMessage);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Retourne le chemin de redirection selon le rôle
   */
  const getRedirectPathForRole = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return '/dashboard-admin';
      case ROLES.MANAGER:
        return '/dashboard-manager';
      case ROLES.QUALITE:
      case ROLES.SUPERVISEUR:
      case ROLES.CHEF_EQUIPE:
      case ROLES.AGENT_ESCALE:
      default:
        return '/services'; // Page d'accueil
    }
  };

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  const hasRole = (role) => {
    const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role;
    return userRole.value === normalizedRole;
  };

  /**
   * Vérifie si l'utilisateur a l'un des rôles listés
   */
  const hasAnyRole = (roles) => {
    if (!Array.isArray(roles)) return false;
    return roles.some(role => hasRole(role));
  };

  /**
   * Vérifie si l'utilisateur peut effectuer une action
   */
  const can = (action) => {
    return hasPermission(userRole.value, action);
  };

  /**
   * Rafraîchit l'état d'authentification depuis le localStorage
   */
  const refreshAuthState = () => {
    isAuthenticated.value = !!getToken();
    userRole.value = getUserRole();
    userData.value = getUserData();
    mustChangePassword.value = checkDoitChangerMDP();
  };

  return {
    // États
    isAuthenticated,
    userRole,
    userData,
    userName,
    userEmail,
    isLoading,
    error,
    mustChangePassword,

    // Computed - Rôles (6 rôles backend)
    isAgentEscale,
    isChefEquipe,
    isSuperviseur,
    isManager,
    isQualite,
    isAdmin,
    isAgent, // Alias compatibilité

    // Computed - Permissions
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
    refreshAuthState,
    getRedirectPathForRole,

    // Constantes exportées
    ROLES,
    ACTIONS
  };
}
