/**
 * ROUTES BULLETIN DE MOUVEMENT
 *
 * Hiérarchie : Programme → Bulletin → CRV
 */

import { ROLES } from '@/config/roles'

const ROLES_OPERATIONNELS_ET_ADMIN = [
  ROLES.AGENT_ESCALE,
  ROLES.CHEF_EQUIPE,
  ROLES.SUPERVISEUR,
  ROLES.MANAGER,
  ROLES.ADMIN
]

export default [
  {
    path: '/bulletins',
    name: 'BulletinsList',
    component: () => import('@/views/Bulletins/BulletinsList.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [...ROLES_OPERATIONNELS_ET_ADMIN, ROLES.QUALITE]
    }
  },
  {
    path: '/bulletins/nouveau',
    name: 'BulletinCreate',
    component: () => import('@/views/Bulletins/BulletinCreate.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ROLES_OPERATIONNELS_ET_ADMIN
    }
  },
  {
    path: '/bulletins/:id',
    name: 'BulletinDetail',
    component: () => import('@/views/Bulletins/BulletinDetail.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [...ROLES_OPERATIONNELS_ET_ADMIN, ROLES.QUALITE]
    }
  }
]
