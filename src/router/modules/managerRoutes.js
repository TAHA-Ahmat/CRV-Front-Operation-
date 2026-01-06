/**
 * ROUTES MANAGER / SUPERVISEUR - CONTRAT BACKEND
 *
 * Source de vérité : TRANSMISSION_BACKEND_FRONTEND.md
 *
 * Rôles autorisés :
 * - MANAGER → Accès complet (dashboard, validation, statistiques)
 * - SUPERVISEUR → Accès validation et statistiques
 * - QUALITE → Accès statistiques (lecture seule)
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
      // Validation réservée SUPERVISEUR et MANAGER
      allowedRoles: [ROLES.SUPERVISEUR, ROLES.MANAGER]
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
  }
];

export default managerRoutes;
