/**
 * ROUTES MANAGER / SUPERVISEUR - CONTRAT BACKEND
 *
 * DOCTRINE 2026-03-03 :
 * - Opérationnels uniquement (ADMIN = infrastructure, pas d'accès métier)
 * - QUALITE : lecture seule absolue (pas d'accès aux pages de modification)
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
      // Validation superviseur : SUP + MGR uniquement (action de validation métier)
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
  },
  {
    path: '/programmes-vol',
    name: 'ProgrammesVol',
    component: () => import('@/views/Manager/ProgrammesVol.vue'),
    meta: {
      requiresAuth: true,
      // Programmes de vol : opérationnels + QUALITE (lecture)
      // Actions selon permissions : CREER/MODIFIER (opérationnels), VALIDER/ACTIVER (superviseurs+), SUPPRIMER (manager)
      allowedRoles: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE]
    }
  },
  {
    path: '/avions',
    name: 'AvionsGestion',
    component: () => import('@/views/Manager/AvionsGestion.vue'),
    meta: {
      requiresAuth: true,
      // MVS-8: Gestion avions et versioning configuration
      // Consultation : opérationnels + QUALITE, modification config SUPERVISEUR+
      allowedRoles: [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.QUALITE]
    }
  },
  {
    path: '/sla-configuration',
    name: 'SLAConfiguration',
    component: () => import('@/views/Manager/SLAConfiguration.vue'),
    meta: {
      requiresAuth: true,
      // Configuration SLA : MANAGER uniquement (paramétrage métier global)
      allowedRoles: [ROLES.MANAGER]
    }
  }
];

export default managerRoutes;
