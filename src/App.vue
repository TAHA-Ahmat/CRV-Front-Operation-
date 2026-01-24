<template>
  <!-- STRUCTURE COPIEE DEPUIS STOCK THS ET ADAPTEE POUR CRV -->
  <div id="app" class="min-h-screen" :class="{ 'dark': isDark }">
    <!-- Header : Visible uniquement si l'utilisateur est authentifie -->
    <AppHeader
      v-if="isAuthenticated"
      :isAuthenticated="isAuthenticated"
      :userRole="userRole"
      :userName="userName"
      @logout="logout"
      class="fixed-header"
    />

    <!-- Contenu principal -->
    <div class="content">
      <router-view />
    </div>

    <!-- Footer conditionnel : visible uniquement si l'utilisateur est authentifie -->
    <AppFooter v-if="isAuthenticated" :isAuthenticated="isAuthenticated" class="fixed-footer" />
  </div>
</template>

<script>
// COPIE ET ADAPTE DEPUIS STOCK THS POUR CRV
import { ref, onMounted, computed } from 'vue';
import { getToken, getUserRole, getUserData, logoutUser } from '@/services/auth/authService';
import { useRouter, useRoute } from 'vue-router';
import { useThemeStore } from '@/stores/themeStore';
import AppHeader from '@/components/Common/AppHeader.vue';
import AppFooter from '@/components/Common/AppFooter.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const themeStore = useThemeStore();

    const isAuthenticated = ref(!!getToken());
    const userRole = ref(getUserRole());
    const userName = ref(getUserData()?.name || getUserData()?.email || '');

    // Theme
    const isDark = computed(() => themeStore.isDark);

    // Liste des chemins de pages accessibles sans authentification
    const publicPages = ['/login', '/'];

    // Verifie l'authentification au chargement de la page
    onMounted(() => {
      // Initialiser le theme
      themeStore.initTheme();

      if (!isAuthenticated.value && !publicPages.includes(route.path)) {
        router.push('/login');
      }
    });

    // Mettre a jour l'etat d'authentification lors de la navigation
    router.beforeEach((to, from, next) => {
      isAuthenticated.value = !!getToken();
      userRole.value = getUserRole();
      const userData = getUserData();
      userName.value = userData?.name || userData?.email || '';
      next();
    });

    // Fonction de deconnexion complete
    const logout = async () => {
      try {
        await logoutUser();
        isAuthenticated.value = false;
        router.push('/login');
      } catch (error) {
        console.error('[CRV App] Erreur lors de la deconnexion:', error);
      }
    };

    return {
      isAuthenticated,
      userRole,
      userName,
      logout,
      isDark
    };
  }
};
</script>

<style>
/* Styles globaux */
#app {
  background-color: var(--bg-body);
  color: var(--text-primary);
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.fixed-header {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.fixed-footer {
  position: static;
  bottom: 0;
  width: 100%;
  z-index: 1000;
}

.content {
  padding-top: 64px; /* Hauteur du header */
  padding-bottom: 40px; /* Hauteur du footer */
  min-height: calc(100vh - 104px);
}
</style>
