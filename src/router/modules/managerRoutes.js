/**
 * ROUTES MANAGER / SUPERVISEUR - CONTRAT BACKEND
 *
 * Source de vérité : docs/process/MVS-10-Validation/05-process-metier.md
 *
 * Rôles autorisés :
 * - MANAGER → Accès complet (dashboard, validation, statistiques)
 * - SUPERVISEUR → Accès dashboard et statistiques
 * - QUALITE → Accès validation et statistiques (MVS-10: peut valider/rejeter/verrouiller)
 * - ADMIN → Accès validation (peut tout faire y compris déverrouiller)
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
      // MVS-10: Validation réservée QUALITE et ADMIN uniquement
      allowedRoles: [ROLES.QUALITE, ROLES.ADMIN]
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
      // MVS-5 Extension 2: Gestion des programmes saisonniers
      // MANAGER peut créer/modifier, QUALITE peut valider, ADMIN peut tout faire
      allowedRoles: [ROLES.MANAGER, ROLES.QUALITE, ROLES.ADMIN]
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
