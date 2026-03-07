/**
 * ROUTES OPS — Centre de Contrôle Opérationnel
 *
 * MODULE OPS CONTROL CENTER v1.0.0
 *
 * Rôles autorisés :
 * - ADMIN → Accès complet
 * - MANAGER → Accès complet
 * - SUPERVISEUR → Accès complet
 *
 * Rôles exclus :
 * - AGENT_ESCALE, CHEF_EQUIPE, QUALITE → Pas d'accès
 */

import { ROLES } from '@/config/roles'

const opsRoutes = [
  {
    path: '/ops',
    name: 'OpsControlCenter',
    component: () => import('@/views/Ops/OpsDashboard.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISEUR]
    }
  }
]

export default opsRoutes
