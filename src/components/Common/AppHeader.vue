<template>
  <!--
    HEADER PRINCIPAL - CONTRAT BACKEND
    Source : TRANSMISSION_BACKEND_FRONTEND.md

    Menus conditionnels selon les 6 rôles backend :
    - AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER → Opérations CRV
    - QUALITE → Lecture seule (pas de "Nouveau CRV")
    - ADMIN → Gestion utilisateurs uniquement
  -->
  <header v-if="isAuthenticated" class="fixed top-0 w-full bg-white shadow-sm z-50 border-b border-gray-200">
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo CRV - Cliquable pour revenir à l'accueil -->
      <router-link to="/services" class="flex items-center space-x-3 hover:opacity-80 transition">
        <div class="text-2xl">✈️</div>
        <span class="text-xl font-semibold text-gray-800">THS - CRV</span>
        <!-- Badge rôle -->
        <span class="hidden lg:inline-block px-2 py-0.5 text-xs rounded" :class="roleBadgeClass">
          {{ roleLabel }}
        </span>
      </router-link>

      <!-- Menu de Navigation selon le rôle (6 rôles backend) -->
      <nav class="hidden md:flex items-center space-x-6">

        <!-- RÔLES OPÉRATIONNELS : AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER -->
        <template v-if="isOperationnel">
          <router-link to="/services" class="nav-link">Accueil</router-link>
          <router-link to="/crv/liste" class="nav-link">Mes CRV</router-link>
          <router-link to="/crv/nouveau" class="nav-link">Nouveau CRV</router-link>
          <router-link to="/bulletins" class="nav-link">Bulletins</router-link>
          <router-link to="/programmes-vol" class="nav-link">Programmes Vol</router-link>
          <router-link to="/archives" class="nav-link">Archives</router-link>
        </template>

        <!-- SUPERVISEUR & MANAGER : Menu supplémentaire validation -->
        <template v-if="canValidate">
          <router-link to="/validation" class="nav-link">À valider</router-link>
        </template>

        <!-- MANAGER : Dashboard complet -->
        <template v-if="isManager">
          <router-link to="/dashboard-manager" class="nav-link">Dashboard</router-link>
          <router-link to="/statistiques" class="nav-link">Statistiques</router-link>
        </template>

        <!-- QUALITE : Lecture seule (pas de "Nouveau CRV") -->
        <template v-if="isQualite">
          <router-link to="/services" class="nav-link">Accueil</router-link>
          <router-link to="/crv/liste" class="nav-link">Consulter CRV</router-link>
          <router-link to="/bulletins" class="nav-link">Bulletins</router-link>
          <router-link to="/programmes-vol" class="nav-link">Programmes Vol</router-link>
          <router-link to="/archives" class="nav-link">Archives</router-link>
          <router-link to="/statistiques" class="nav-link">Statistiques</router-link>
        </template>

        <!-- ADMIN : Gestion système uniquement (pas de CRV) -->
        <template v-if="isAdmin">
          <router-link to="/dashboard-admin" class="nav-link">Administration</router-link>
          <router-link to="/users" class="nav-link">Utilisateurs</router-link>
          <router-link to="/logs" class="nav-link">Logs</router-link>
          <router-link to="/settings" class="nav-link">Paramètres</router-link>
        </template>

      </nav>

      <!-- Profil utilisateur et déconnexion -->
      <div class="flex items-center space-x-4">
        <!-- Menu profil -->
        <router-link to="/profil" class="text-gray-600 hover:text-crv-blue flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span class="hidden md:inline text-sm font-medium">{{ userName }}</span>
        </router-link>

        <!-- Bouton de déconnexion -->
        <button @click="logout" class="text-gray-600 hover:text-red-600 flex items-center space-x-2 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span class="hidden md:inline text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </div>

    <!-- Bandeau lecture seule pour QUALITE -->
    <div v-if="isQualite" class="bg-yellow-100 border-b border-yellow-300 px-4 py-1 text-center">
      <span class="text-yellow-800 text-xs font-medium">
        Mode lecture seule - Vous ne pouvez pas modifier les données
      </span>
    </div>
  </header>
</template>

<script>
/**
 * HEADER - CONTRAT BACKEND
 * Source : TRANSMISSION_BACKEND_FRONTEND.md
 */
import { ROLES, ROLES_LABELS } from '@/config/roles';

export default {
  name: 'AppHeader',
  props: {
    isAuthenticated: {
      type: Boolean,
      required: true
    },
    userRole: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    }
  },
  emits: ['logout'],
  computed: {
    // Vérification des rôles (6 rôles backend)
    isAgentEscale() {
      return this.userRole === ROLES.AGENT_ESCALE;
    },
    isChefEquipe() {
      return this.userRole === ROLES.CHEF_EQUIPE;
    },
    isSuperviseur() {
      return this.userRole === ROLES.SUPERVISEUR;
    },
    isManager() {
      return this.userRole === ROLES.MANAGER;
    },
    isQualite() {
      return this.userRole === ROLES.QUALITE;
    },
    isAdmin() {
      return this.userRole === ROLES.ADMIN;
    },

    // Groupes de rôles
    isOperationnel() {
      return [ROLES.AGENT_ESCALE, ROLES.CHEF_EQUIPE, ROLES.SUPERVISEUR, ROLES.MANAGER].includes(this.userRole);
    },
    canValidate() {
      return [ROLES.SUPERVISEUR, ROLES.MANAGER].includes(this.userRole);
    },

    // Label du rôle pour affichage
    roleLabel() {
      return ROLES_LABELS[this.userRole] || this.userRole;
    },

    // Classe CSS du badge rôle
    roleBadgeClass() {
      switch (this.userRole) {
        case ROLES.ADMIN:
          return 'bg-red-100 text-red-800';
        case ROLES.MANAGER:
          return 'bg-purple-100 text-purple-800';
        case ROLES.SUPERVISEUR:
          return 'bg-blue-100 text-blue-800';
        case ROLES.QUALITE:
          return 'bg-yellow-100 text-yellow-800';
        case ROLES.CHEF_EQUIPE:
          return 'bg-green-100 text-green-800';
        case ROLES.AGENT_ESCALE:
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  },
  methods: {
    logout() {
      this.$emit('logout');
    }
  }
};
</script>

<style scoped>
.nav-link {
  @apply text-gray-700 font-medium text-sm hover:text-crv-blue transition-colors duration-200 relative;
}

.nav-link.router-link-active {
  @apply text-crv-blue;
}

.nav-link.router-link-active::after {
  content: '';
  @apply absolute bottom-0 left-0 right-0 h-0.5 bg-crv-blue;
}
</style>
