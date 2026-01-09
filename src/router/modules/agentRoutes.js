/**
 * ROUTES CRV - CONTRAT BACKEND
 *
 * Source de vérité : TRANSMISSION_BACKEND_FRONTEND.md
 *
 * Rôles autorisés pour accès CRV :
 * - AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER → lecture + écriture
 * - QUALITE → lecture seule
 * - ADMIN → PAS D'ACCÈS (redirigé vers dashboard-admin)
 */

import { ROLES } from '@/config/roles';

const crvRoutes = [
  {
    path: '/crv',
    name: 'CRVHome',
    component: () => import('@/views/CRV/CRVHome.vue'),
    meta: {
      requiresAuth: true,
      // Rôles avec accès CRV (lecture au minimum)
      allowedRoles: [
        ROLES.AGENT_ESCALE,
        ROLES.CHEF_EQUIPE,
        ROLES.SUPERVISEUR,
        ROLES.MANAGER,
        ROLES.QUALITE
      ]
    }
  },
  {
    path: '/crv/liste',
    name: 'CRVList',
    component: () => import('@/views/CRV/CRVList.vue'),
    meta: {
      requiresAuth: true,
      // Rôles avec accès CRV (lecture au minimum)
      allowedRoles: [
        ROLES.AGENT_ESCALE,
        ROLES.CHEF_EQUIPE,
        ROLES.SUPERVISEUR,
        ROLES.MANAGER,
        ROLES.QUALITE
      ]
    }
  },
  {
    path: '/crv/arrivee',
    name: 'CRVArrivee',
    component: () => import('@/views/CRV/CRVArrivee.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [
        ROLES.AGENT_ESCALE,
        ROLES.CHEF_EQUIPE,
        ROLES.SUPERVISEUR,
        ROLES.MANAGER,
        ROLES.QUALITE
      ]
    }
  },
  {
    path: '/crv/depart',
    name: 'CRVDepart',
    component: () => import('@/views/CRV/CRVDepart.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [
        ROLES.AGENT_ESCALE,
        ROLES.CHEF_EQUIPE,
        ROLES.SUPERVISEUR,
        ROLES.MANAGER,
        ROLES.QUALITE
      ]
    }
  },
  {
    path: '/crv/turnaround',
    name: 'CRVTurnAround',
    component: () => import('@/views/CRV/CRVTurnAround.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [
        ROLES.AGENT_ESCALE,
        ROLES.CHEF_EQUIPE,
        ROLES.SUPERVISEUR,
        ROLES.MANAGER,
        ROLES.QUALITE
      ]
    }
  },
  // Route création CRV (pas QUALITE, pas ADMIN)
  {
    path: '/crv/nouveau',
    name: 'CRVNouveau',
    component: () => import('@/views/CRV/CRVNouveau.vue'),
    meta: {
      requiresAuth: true,
      // Uniquement rôles opérationnels (pas QUALITE qui est lecture seule)
      allowedRoles: [
        ROLES.AGENT_ESCALE,
        ROLES.CHEF_EQUIPE,
        ROLES.SUPERVISEUR,
        ROLES.MANAGER
      ]
    }
  }
];

export default crvRoutes;
