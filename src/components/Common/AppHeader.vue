<template>
  <!--
    HEADER PRINCIPAL - CONTRAT BACKEND
    Source : TRANSMISSION_BACKEND_FRONTEND.md

    Menus conditionnels selon les 6 rôles backend :
    - AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER → Opérations CRV
    - QUALITE → Lecture seule (pas de "Nouveau CRV")
    - ADMIN → Gestion utilisateurs uniquement
  -->
  <header v-if="isAuthenticated" class="fixed top-0 w-full shadow-sm z-50 border-b header-theme">
    <div class="header-container">
      <!-- Logo CRV - Cliquable pour revenir à l'accueil -->
      <router-link to="/services" class="header-logo">
        <div class="logo-icon">✈️</div>
        <span class="logo-text">THS - CRV</span>
        <!-- Badge rôle -->
        <span class="role-badge" :class="roleBadgeClass">
          {{ roleLabel }}
        </span>
      </router-link>

      <!-- Bouton Menu Mobile (Hamburger) -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Menu">
        <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Menu de Navigation selon le rôle (6 rôles backend) -->
      <nav class="desktop-nav">

        <!-- RÔLES OPÉRATIONNELS : AGENT_ESCALE, CHEF_EQUIPE, SUPERVISEUR, MANAGER -->
        <template v-if="isOperationnel">
          <router-link to="/services" class="nav-link">Accueil</router-link>
          <router-link to="/crv/liste" class="nav-link">Mes CRV</router-link>
          <router-link to="/crv/nouveau" class="nav-link">Nouveau CRV</router-link>
          <router-link to="/bulletins" class="nav-link">Bulletins</router-link>
          <router-link to="/programmes-vol" class="nav-link">Programmes</router-link>
          <router-link to="/archives" class="nav-link">Archives</router-link>
        </template>

        <!-- SUPERVISEUR & MANAGER : Menu supplémentaire validation -->
        <template v-if="canValidate">
          <router-link to="/validation" class="nav-link">À valider</router-link>
        </template>

        <!-- MANAGER : Dashboard complet -->
        <template v-if="isManager">
          <router-link to="/dashboard-manager" class="nav-link">Dashboard</router-link>
          <router-link to="/statistiques" class="nav-link">Stats</router-link>
        </template>

        <!-- QUALITE : Lecture seule (pas de "Nouveau CRV") -->
        <template v-if="isQualite">
          <router-link to="/services" class="nav-link">Accueil</router-link>
          <router-link to="/crv/liste" class="nav-link">Consulter CRV</router-link>
          <router-link to="/bulletins" class="nav-link">Bulletins</router-link>
          <router-link to="/programmes-vol" class="nav-link">Programmes</router-link>
          <router-link to="/archives" class="nav-link">Archives</router-link>
          <router-link to="/statistiques" class="nav-link">Stats</router-link>
        </template>

        <!-- ADMIN : Gestion système uniquement (pas de CRV) -->
        <template v-if="isAdmin">
          <router-link to="/dashboard-admin" class="nav-link">Admin</router-link>
          <router-link to="/users" class="nav-link">Utilisateurs</router-link>
          <router-link to="/logs" class="nav-link">Logs</router-link>
          <router-link to="/settings" class="nav-link">Paramètres</router-link>
        </template>

      </nav>

      <!-- Profil utilisateur et déconnexion -->
      <div class="header-actions">
        <!-- Bouton Theme Jour/Nuit -->
        <button
          @click="toggleTheme"
          class="theme-toggle"
          :title="isDark ? 'Passer en mode jour' : 'Passer en mode nuit'"
        >
          <!-- Icone Soleil (mode nuit actif) -->
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <!-- Icone Lune (mode jour actif) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <!-- Menu profil -->
        <router-link to="/profil" class="profile-link">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span class="profile-name">{{ userName }}</span>
        </router-link>

        <!-- Bouton de déconnexion -->
        <button @click="logout" class="logout-btn">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span class="logout-text">Déconnexion</span>
        </button>
      </div>
    </div>

    <!-- Menu Mobile (Slide down) -->
    <nav v-if="mobileMenuOpen" class="mobile-nav">
      <!-- RÔLES OPÉRATIONNELS -->
      <template v-if="isOperationnel">
        <router-link to="/services" class="mobile-nav-link" @click="closeMobileMenu">Accueil</router-link>
        <router-link to="/crv/liste" class="mobile-nav-link" @click="closeMobileMenu">Mes CRV</router-link>
        <router-link to="/crv/nouveau" class="mobile-nav-link" @click="closeMobileMenu">Nouveau CRV</router-link>
        <router-link to="/bulletins" class="mobile-nav-link" @click="closeMobileMenu">Bulletins</router-link>
        <router-link to="/programmes-vol" class="mobile-nav-link" @click="closeMobileMenu">Programmes Vol</router-link>
        <router-link to="/archives" class="mobile-nav-link" @click="closeMobileMenu">Archives</router-link>
      </template>
      <template v-if="canValidate">
        <router-link to="/validation" class="mobile-nav-link" @click="closeMobileMenu">À valider</router-link>
      </template>
      <template v-if="isManager">
        <router-link to="/dashboard-manager" class="mobile-nav-link" @click="closeMobileMenu">Dashboard</router-link>
        <router-link to="/statistiques" class="mobile-nav-link" @click="closeMobileMenu">Statistiques</router-link>
      </template>
      <!-- QUALITE -->
      <template v-if="isQualite">
        <router-link to="/services" class="mobile-nav-link" @click="closeMobileMenu">Accueil</router-link>
        <router-link to="/crv/liste" class="mobile-nav-link" @click="closeMobileMenu">Consulter CRV</router-link>
        <router-link to="/bulletins" class="mobile-nav-link" @click="closeMobileMenu">Bulletins</router-link>
        <router-link to="/programmes-vol" class="mobile-nav-link" @click="closeMobileMenu">Programmes Vol</router-link>
        <router-link to="/archives" class="mobile-nav-link" @click="closeMobileMenu">Archives</router-link>
        <router-link to="/statistiques" class="mobile-nav-link" @click="closeMobileMenu">Statistiques</router-link>
      </template>
      <!-- ADMIN -->
      <template v-if="isAdmin">
        <router-link to="/dashboard-admin" class="mobile-nav-link" @click="closeMobileMenu">Administration</router-link>
        <router-link to="/users" class="mobile-nav-link" @click="closeMobileMenu">Utilisateurs</router-link>
        <router-link to="/logs" class="mobile-nav-link" @click="closeMobileMenu">Logs</router-link>
        <router-link to="/settings" class="mobile-nav-link" @click="closeMobileMenu">Paramètres</router-link>
      </template>
      <!-- Profil mobile -->
      <router-link to="/profil" class="mobile-nav-link" @click="closeMobileMenu">Mon profil</router-link>
    </nav>

    <!-- Bandeau lecture seule pour QUALITE -->
    <div v-if="isQualite" class="readonly-banner">
      <span>Mode lecture seule - Vous ne pouvez pas modifier les données</span>
    </div>
  </header>
</template>

<script>
/**
 * HEADER - CONTRAT BACKEND
 * Source : TRANSMISSION_BACKEND_FRONTEND.md
 */
import { ROLES, ROLES_LABELS } from '@/config/roles';
import { useThemeStore } from '@/stores/themeStore';

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
  data() {
    return {
      mobileMenuOpen: false
    };
  },
  setup() {
    const themeStore = useThemeStore();
    return { themeStore };
  },
  computed: {
    // Theme
    isDark() {
      return this.themeStore.isDark;
    },
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
    },
    toggleTheme() {
      this.themeStore.toggleTheme();
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false;
    }
  }
};
</script>

<style scoped>
/* Header container */
.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: opacity 0.2s;
}

.header-logo:hover {
  opacity: 0.8;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.role-badge {
  display: none;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

/* Desktop Navigation */
.desktop-nav {
  display: none;
  align-items: center;
  gap: 24px;
}

.nav-link {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-primary);
  text-decoration: none;
  position: relative;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #2563eb;
}

.nav-link.router-link-active {
  color: #2563eb;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: #2563eb;
}

/* Mobile menu button */
.mobile-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
}

.mobile-menu-btn svg {
  width: 24px;
  height: 24px;
}

/* Header actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.profile-link:hover {
  color: var(--text-primary);
}

.profile-name {
  display: none;
  font-size: 14px;
  font-weight: 500;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.logout-btn:hover {
  color: #ef4444;
}

.logout-text {
  display: none;
  font-size: 14px;
  font-weight: 500;
}

/* Mobile Navigation */
.mobile-nav {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: 8px 0;
  max-height: 70vh;
  overflow-y: auto;
}

.mobile-nav-link {
  display: block;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
}

.mobile-nav-link:hover {
  background: var(--bg-body);
}

.mobile-nav-link.router-link-active {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.05);
}

/* Readonly banner */
.readonly-banner {
  background: #fef3c7;
  border-bottom: 1px solid #fcd34d;
  padding: 4px 16px;
  text-align: center;
}

.readonly-banner span {
  font-size: 12px;
  font-weight: 500;
  color: #92400e;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .mobile-menu-btn {
    display: none;
  }

  .desktop-nav {
    display: flex;
  }

  .mobile-nav {
    display: none !important;
  }

  .profile-name,
  .logout-text {
    display: inline;
  }

  .header-actions {
    gap: 16px;
  }

  .role-badge {
    display: inline-block;
  }
}

/* Desktop large (1024px+) */
@media (min-width: 1024px) {
  .header-container {
    padding: 0 24px;
  }

  .desktop-nav {
    gap: 32px;
  }
}

/* Desktop XL (1200px+) */
@media (min-width: 1200px) {
  .nav-link {
    font-size: 15px;
  }
}
</style>
