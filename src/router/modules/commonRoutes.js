/**
 * ROUTES COMMUNES - CONTRAT BACKEND
 *
 * Source de vérité : TRANSMISSION_BACKEND_FRONTEND.md
 *
 * Routes accessibles à tous les rôles authentifiés (sauf ADMIN pour CRV)
 */

import { ROLES } from '@/config/roles';

const commonRoutes = [
  {
    path: '/profil',
    name: 'Profil',
    component: () => import('@/views/Common/Profil.vue'),
    meta: {
      requiresAuth: true,
      // Tous les rôles peuvent voir leur profil
      allowedRoles: [
        ROLES.AGENT_ESCALE,
        ROLES.CHEF_EQUIPE,
        ROLES.SUPERVISEUR,
        ROLES.MANAGER,
        ROLES.QUALITE,
        ROLES.ADMIN
      ]
    }
  }
];

export default commonRoutes;
