/**
 * ROUTES BULLETIN DE MOUVEMENT
 *
 * Hiérarchie : Programme → Bulletin → CRV
 */

import { ROLES } from '@/config/roles'

// DOCTRINE 2026-03-03 : Opérationnels uniquement (ADMIN = infrastructure)
const ROLES_OPERATIONNELS = [
  ROLES.AGENT_ESCALE,
  ROLES.CHEF_EQUIPE,
  ROLES.SUPERVISEUR,
  ROLES.MANAGER
]

export default [
  {
    path: '/bulletins',
    name: 'BulletinsList',
    component: () => import('@/views/Bulletins/BulletinsList.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [...ROLES_OPERATIONNELS, ROLES.QUALITE]
    }
  },
  {
    path: '/bulletins/nouveau',
    name: 'BulletinCreate',
    component: () => import('@/views/Bulletins/BulletinCreate.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ROLES_OPERATIONNELS
    }
  },
  {
    path: '/bulletins/:id',
    name: 'BulletinDetail',
    component: () => import('@/views/Bulletins/BulletinDetail.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [...ROLES_OPERATIONNELS, ROLES.QUALITE]
    }
  }
]
