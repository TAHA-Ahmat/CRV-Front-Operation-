/**
 * ROUTER PRINCIPAL - CONTRAT BACKEND
 *
 * Source de vérité : TRANSMISSION_BACKEND_FRONTEND.md
 *
 * Guards implémentés :
 * - Authentification requise (requiresAuth)
 * - Vérification doitChangerMotDePasse
 * - Protection par rôle (6 rôles backend)
 */

import { createRouter, createWebHistory } from 'vue-router';

// Importation des routes modulaires
import agentRoutes from './modules/agentRoutes';
import managerRoutes from './modules/managerRoutes';
import adminRoutes from './modules/adminRoutes';
import commonRoutes from './modules/commonRoutes';
import bulletinRoutes from './modules/bulletinRoutes';

// Importation des composants
import Login from '@/views/Login.vue';
import Services from '@/views/Services.vue';
import ChangePassword from '@/views/ChangePassword.vue';

// Services d'authentification
import { getToken, getUserRole, doitChangerMotDePasse } from '@/services/auth/authService';
import { ROLES, hasAccessCRV, isAdmin } from '@/config/roles';

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { isPublic: true },
    beforeEnter: (to, from, next) => {
      const token = getToken();
      const userRole = getUserRole();

      if (token) {
        // Redirection des utilisateurs connectés selon leur rôle
        next(getRedirectPathForRole(userRole));
      } else {
        next();
      }
    },
  },
  {
    path: '/services',
    name: 'Services',
    component: Services,
    meta: { requiresAuth: true }
  },
  // Route changement de mot de passe (OBLIGATOIRE selon contrat backend)
  {
    path: '/changer-mot-de-passe',
    name: 'ChangePassword',
    component: ChangePassword,
    meta: {
      requiresAuth: true,
      allowWithMustChangePassword: true // Seule route accessible avec doitChangerMotDePasse
    }
  },
  // Routes modulaires par rôle
  ...agentRoutes,
  ...managerRoutes,
  ...adminRoutes,
  ...commonRoutes,
  ...bulletinRoutes,
  // Route 404 - à la fin
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ============================================
// MIDDLEWARE GLOBAL - CONTRAT BACKEND
// Source : TRANSMISSION_BACKEND_FRONTEND.md
// ============================================
router.beforeEach((to, from, next) => {
  const token = getToken();
  const userRole = getUserRole();
  const mustChangePassword = doitChangerMotDePasse();

  // ============================================
  // 1. VÉRIFICATION AUTHENTIFICATION
  // ============================================
  if (!token && to.matched.some(record => record.meta.requiresAuth)) {
    // Non connecté → Redirection login
    next('/login?expired=true');
    return;
  }

  // ============================================
  // 2. VÉRIFICATION doitChangerMotDePasse (PRIORITAIRE)
  // Si l'utilisateur doit changer son MDP, bloquer TOUTES les routes
  // sauf /changer-mot-de-passe et /login
  // ============================================
  if (token && mustChangePassword) {
    const allowedWithMustChangePassword = to.matched.some(
      record => record.meta.allowWithMustChangePassword || record.meta.isPublic
    );

    if (!allowedWithMustChangePassword && to.path !== '/changer-mot-de-passe') {
      console.warn('[Router] doitChangerMotDePasse actif → Redirection forcée');
      next('/changer-mot-de-passe');
      return;
    }
  }

  // ============================================
  // 3. GESTION DES UTILISATEURS CONNECTÉS SUR /login
  // ============================================
  if (token && to.path === '/login') {
    const redirectPath = getRedirectPathForRole(userRole);
    next(redirectPath);
    return;
  }

  // ============================================
  // 4. PROTECTION PAR RÔLE (allowedRoles)
  // ============================================
  const allowedRoles = to.meta.allowedRoles;

  if (allowedRoles && Array.isArray(allowedRoles)) {
    if (!allowedRoles.includes(userRole)) {
      console.warn(`[Router] Rôle ${userRole} non autorisé pour ${to.path}`);

      // Rediriger vers le dashboard approprié pour le rôle
      const redirectPath = getRedirectPathForRole(userRole);
      if (redirectPath !== to.path) {
        next(redirectPath);
        return;
      }
    }
  }

  // ============================================
  // 5. CAS SPÉCIAUX
  // ============================================

  // ADMIN ne doit jamais accéder aux routes CRV
  if (userRole === ROLES.ADMIN && to.path.startsWith('/crv')) {
    console.warn('[Router] ADMIN redirigé - Pas d\'accès CRV');
    next('/dashboard-admin');
    return;
  }

  next(); // Autoriser la navigation
});

/**
 * Helper : Retourne le chemin de redirection selon le rôle
 * @param {string} role - Rôle normalisé
 * @returns {string}
 */
function getRedirectPathForRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      return '/dashboard-admin';
    case ROLES.MANAGER:
      return '/dashboard-manager';
    case ROLES.QUALITE:
      return '/services'; // Lecture seule - page d'accueil
    case ROLES.SUPERVISEUR:
    case ROLES.CHEF_EQUIPE:
    case ROLES.AGENT_ESCALE:
      return '/services'; // Page d'accueil
    // Compatibilité anciens rôles (à supprimer après migration)
    case 'admin':
      return '/dashboard-admin';
    case 'manager':
      return '/dashboard-manager';
    case 'agent_ops':
      return '/services';
    default:
      return '/services';
  }
}

export default router;
