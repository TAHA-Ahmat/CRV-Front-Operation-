<template>
  <!-- STRUCTURE COPIÉE DEPUIS STOCK THS ET ADAPTÉE POUR CRV -->
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Header : Visible uniquement si l'utilisateur est authentifié -->
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

    <!-- Footer conditionnel : visible uniquement si l'utilisateur est authentifié -->
    <AppFooter v-if="isAuthenticated" :isAuthenticated="isAuthenticated" class="fixed-footer" />
  </div>
</template>

<script>
// COPIÉ ET ADAPTÉ DEPUIS STOCK THS POUR CRV
import { ref, onMounted } from 'vue';
import { getToken, getUserRole, getUserData, logoutUser } from '@/services/auth/authService';
import { useRouter, useRoute } from 'vue-router';
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

    const isAuthenticated = ref(!!getToken());
    const userRole = ref(getUserRole());
    const userName = ref(getUserData()?.name || getUserData()?.email || '');

    // Liste des chemins de pages accessibles sans authentification
    const publicPages = ['/login', '/'];

    // Vérifie l'authentification au chargement de la page
    onMounted(() => {
      if (!isAuthenticated.value && !publicPages.includes(route.path)) {
        router.push('/login');
      }
    });

    // Mettre à jour l'état d'authentification lors de la navigation
    router.beforeEach((to, from, next) => {
      isAuthenticated.value = !!getToken();
      userRole.value = getUserRole();
      const userData = getUserData();
      userName.value = userData?.name || userData?.email || '';
      next();
    });

    // Fonction de déconnexion complète
    const logout = async () => {
      try {
        await logoutUser();
        isAuthenticated.value = false;
        router.push('/login');
      } catch (error) {
        console.error('[CRV App] Erreur lors de la déconnexion:', error);
      }
    };

    return {
      isAuthenticated,
      userRole,
      userName,
      logout
    };
  }
};
</script>

<style>
/* Styles globaux copiés depuis Stock THS */
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: #f9fafb;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
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
