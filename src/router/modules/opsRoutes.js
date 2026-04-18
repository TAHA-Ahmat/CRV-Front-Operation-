/**
 * ROUTES OPS — Centre de Contrôle Opérationnel
 *
 * MODULE OPS CONTROL CENTER v1.0.0
 *
 * Rôles autorisés :
 * - MANAGER → Accès complet
 * - SUPERVISEUR → Accès complet
 *
 * Rôles exclus :
 * - ADMIN → Doctrine MADMIT : aucun accès opérationnel
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
      allowedRoles: [ROLES.MANAGER, ROLES.SUPERVISEUR]
    }
  }
]

export default opsRoutes
