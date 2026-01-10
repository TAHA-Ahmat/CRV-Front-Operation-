/**
 * ROUTES ADMIN - CONTRAT BACKEND
 *
 * Source de vérité : TRANSMISSION_BACKEND_FRONTEND.md
 *
 * Rôles autorisés :
 * - ADMIN → Accès exclusif (gestion utilisateurs, logs, paramètres)
 *
 * IMPORTANT :
 * - ADMIN n'a PAS accès aux routes CRV
 * - ADMIN peut uniquement gérer les comptes
 */

import { ROLES } from '@/config/roles';

const adminRoutes = [
  {
    path: '/dashboard-admin',
    name: 'DashboardAdmin',
    component: () => import('@/views/Admin/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [ROLES.ADMIN]
    }
  },
  {
    path: '/users',
    name: 'UserManagement',
    // MVS-1: Remplacé par GestionUtilisateurs avec vérification dépendances
    component: () => import('@/views/Admin/GestionUtilisateurs.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [ROLES.ADMIN]
    }
  },
  {
    path: '/users/nouveau',
    name: 'UserCreate',
    component: () => import('@/views/Admin/UserCreate.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [ROLES.ADMIN]
    }
  },
  {
    path: '/users/:id/edit',
    name: 'UserEdit',
    component: () => import('@/views/Admin/UserEdit.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [ROLES.ADMIN]
    }
  },
  {
    path: '/logs',
    name: 'SystemLogs',
    component: () => import('@/views/Admin/Logs.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [ROLES.ADMIN]
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Admin/Settings.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [ROLES.ADMIN]
    }
  }
];

export default adminRoutes;
