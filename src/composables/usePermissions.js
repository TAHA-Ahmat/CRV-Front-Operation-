/**
 * COMPOSABLE DE PERMISSIONS - CONTRAT BACKEND
 *
 * Source de vérité : TRANSMISSION_BACKEND_FRONTEND.md
 *
 * Ce composable fournit des helpers réactifs pour vérifier les permissions
 * et masquer/désactiver les éléments UI selon le rôle de l'utilisateur.
 */

import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { ROLES } from '@/config/roles';
import {
  hasPermission,
  ACTIONS,
  canOperateCRV,
  canViewCRV,
  canDeleteCRV,
  canManageUsers,
  canValidateProgramme,
  canDeleteProgramme,
  isReadOnlyRole,
  isAdminRole,
  getPermissionDeniedMessage
} from '@/utils/permissions';

/**
 * Composable pour la gestion des permissions dans les composants Vue
 */
export function usePermissions() {
  const { userRole, isAuthenticated } = useAuth();

  // ============================================
  // COMPUTED - ÉTAT DU RÔLE
  // ============================================

  /**
   * L'utilisateur est en mode lecture seule (QUALITE)
   */
  const isReadOnly = computed(() => isReadOnlyRole(userRole.value));

  /**
   * L'utilisateur est administrateur (pas d'accès CRV)
   */
  const isAdmin = computed(() => isAdminRole(userRole.value));

  /**
   * L'utilisateur est opérationnel (peut créer/modifier CRV)
   */
  const isOperationnel = computed(() =>
    [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER].includes(userRole.value)
  );

  // ============================================
  // COMPUTED - PERMISSIONS CRV
  // ============================================

  /**
   * Peut créer un CRV
   */
  const canCreateCRV = computed(() => canOperateCRV(userRole.value));

  /**
   * Peut modifier un CRV
   */
  const canEditCRV = computed(() => canOperateCRV(userRole.value));

  /**
   * Peut voir les CRV
   */
  const canViewCRVComputed = computed(() => canViewCRV(userRole.value));

  /**
   * Peut supprimer un CRV (SUPERVISEUR, MANAGER)
   */
  const canDeleteCRVComputed = computed(() => canDeleteCRV(userRole.value));

  // ============================================
  // COMPUTED - PERMISSIONS PROGRAMMES
  // ============================================

  /**
   * Peut valider un programme vol (SUPERVISEUR, MANAGER)
   */
  const canValidate = computed(() => canValidateProgramme(userRole.value));

  /**
   * Peut supprimer un programme vol (MANAGER uniquement)
   */
  const canDeleteProgrammeComputed = computed(() => canDeleteProgramme(userRole.value));

  // ============================================
  // COMPUTED - PERMISSIONS ADMIN
  // ============================================

  /**
   * Peut gérer les utilisateurs (ADMIN uniquement)
   */
  const canManageUsersComputed = computed(() => canManageUsers(userRole.value));

  // ============================================
  // MÉTHODES
  // ============================================

  /**
   * Vérifie si l'utilisateur peut effectuer une action spécifique
   * @param {string} action - Code de l'action (voir ACTIONS)
   * @returns {boolean}
   */
  const can = (action) => {
    if (!isAuthenticated.value || !userRole.value) return false;
    return hasPermission(userRole.value, action);
  };

  /**
   * Vérifie si l'utilisateur peut effectuer au moins une des actions
   * @param {Array<string>} actions - Liste d'actions
   * @returns {boolean}
   */
  const canAny = (actions) => {
    if (!Array.isArray(actions)) return false;
    return actions.some(action => can(action));
  };

  /**
   * Vérifie si l'utilisateur peut effectuer toutes les actions
   * @param {Array<string>} actions - Liste d'actions
   * @returns {boolean}
   */
  const canAll = (actions) => {
    if (!Array.isArray(actions)) return false;
    return actions.every(action => can(action));
  };

  /**
   * Retourne le message d'erreur approprié si une action est refusée
   * @param {string} action - Code de l'action
   * @returns {string}
   */
  const getDeniedMessage = (action) => {
    return getPermissionDeniedMessage(userRole.value, action);
  };

  /**
   * Classe CSS pour désactiver visuellement un élément si pas de permission
   * @param {string} action - Code de l'action
   * @returns {string}
   */
  const disabledClass = (action) => {
    return can(action) ? '' : 'opacity-50 cursor-not-allowed pointer-events-none';
  };

  /**
   * Classe CSS pour masquer un élément si pas de permission
   * @param {string} action - Code de l'action
   * @returns {string}
   */
  const hiddenClass = (action) => {
    return can(action) ? '' : 'hidden';
  };

  return {
    // États du rôle
    isReadOnly,
    isAdmin,
    isOperationnel,

    // Permissions CRV
    canCreateCRV,
    canEditCRV,
    canViewCRV: canViewCRVComputed,
    canDeleteCRV: canDeleteCRVComputed,

    // Permissions programmes
    canValidate,
    canDeleteProgramme: canDeleteProgrammeComputed,

    // Permissions admin
    canManageUsers: canManageUsersComputed,

    // Méthodes
    can,
    canAny,
    canAll,
    getDeniedMessage,
    disabledClass,
    hiddenClass,

    // Constantes exportées
    ACTIONS,
    ROLES
  };
}

export default usePermissions;
