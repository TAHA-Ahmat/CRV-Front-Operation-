/**
 * ROUTES MANAGER / SUPERVISEUR - CONTRAT BACKEND
 *
 * Alignement Backend 2026-01-23 (excludeQualite):
 * - Tous les opérationnels + ADMIN peuvent tout faire sur les CRV
 * - QUALITE: lecture seule absolue (pas d'accès aux pages de modification)
 */

import { ROLES } from '@/config/roles';

const managerRoutes = [
  {
    path: '/dashboard-manager',
    name: 'DashboardManager',
    component: () => import('@/views/Manager/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [ROLES.MANAGER, ROLES.SUPERVISEUR]
    }
  },
  {
    path: '/validation',
    name: 'ValidationCRV',
    component: () => import('@/views/Manager/ValidationCRV.vue'),
    meta: {
      requiresAuth: true,
      // Tous les opérationnels + ADMIN (sauf QUALITE)
      allowedRoles: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.ADMIN]
    }
  },
  {
    path: '/statistiques',
    name: 'Statistiques',
    component: () => import('@/views/Manager/Statistiques.vue'),
    meta: {
      requiresAuth: true,
      // Statistiques accessibles à plus de rôles (lecture)
      allowedRoles: [
        ROLES.SUPERVISEUR,
        ROLES.MANAGER,
        ROLES.QUALITE
      ]
    }
  },
  {
    path: '/programmes-vol',
    name: 'ProgrammesVol',
    component: () => import('@/views/Manager/ProgrammesVol.vue'),
    meta: {
      requiresAuth: true,
      // Programmes de vol accessibles à tous les rôles (lecture)
      // Actions selon permissions : CREER/MODIFIER (opérationnels), VALIDER/ACTIVER (superviseurs+), SUPPRIMER (manager)
      allowedRoles: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE, ROLES.ADMIN]
    }
  },
  {
    path: '/avions',
    name: 'AvionsGestion',
    component: () => import('@/views/Manager/AvionsGestion.vue'),
    meta: {
      requiresAuth: true,
      // MVS-8: Gestion avions et versioning configuration
      // Consultation pour tous, modification config SUPERVISEUR+, stats MANAGER+
      allowedRoles: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE, ROLES.ADMIN]
    }
  }
];

export default managerRoutes;
