<template>
  <!-- COPIÉ DEPUIS STOCK THS (UserLogin.vue) ET ADAPTÉ POUR CRV -->
  <div class="login min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg">
      <!-- En-tête avec logo CRV -->
      <div class="bg-crv-dark text-white p-6 border-b-4 border-crv-blue text-center rounded-t-lg">
        <div class="text-6xl mb-3">✈️</div>
        <h2 class="text-xl font-normal tracking-wider uppercase">Connexion Utilisateur</h2>
        <p class="text-sm text-gray-300 mt-1">THS - Compte Rendu de Vol</p>
      </div>

      <div class="p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              type="email"
              v-model="credentials.email"
              placeholder="Email"
              required
              :disabled="isLoading"
              class="form-input"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="form-label">Mot de passe</label>
            <input
              id="password"
              type="password"
              v-model="credentials.mot_de_passe"
              placeholder="Mot de passe"
              required
              :disabled="isLoading"
              class="form-input"
            />
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 text-red-800 px-4 py-2 text-sm rounded">
            {{ error }}
          </div>

          <!-- Message session expirée ou compte désactivé -->
          <div v-if="sessionMessage" class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 text-sm rounded">
            {{ sessionMessage }}
          </div>

          <div class="pt-2">
            <button
              type="submit"
              class="btn-primary w-full py-2 px-4 uppercase text-sm tracking-wider"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Connexion...' : 'Se connecter' }}
            </button>
          </div>

          <!-- MVS-1 #1: Information sur la durée de session -->
          <div class="session-info text-center">
            <p class="text-xs text-gray-500">
              La session reste active pendant 3 heures
            </p>
          </div>

          <!-- Texte mot de passe oublié - CONFORME AU CONTRAT BACKEND -->
          <div class="pt-4 text-center">
            <p class="text-sm text-gray-600">
              Mot de passe oublié ?
              <span class="text-crv-blue font-medium">Contactez le support.</span>
            </p>
          </div>
        </form>
      </div>

      <!-- MVS-1 #3: Système fermé explicite -->
      <div class="bg-gray-50 px-6 py-4 text-center border-t border-gray-200 rounded-b-lg">
        <p class="text-xs text-gray-600">Portail sécurisé - Accès réservé au personnel SDTA/THS</p>
        <p class="text-xs text-gray-500 mt-1">Pour obtenir un accès, contactez votre responsable</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const route = useRoute();
const { login, isLoading, error } = useAuth();

const credentials = ref({
  email: '',
  mot_de_passe: ''
});

// Message contextuel selon les query params (session expirée, compte désactivé, etc.)
const sessionMessage = computed(() => {
  if (route.query.expired === 'true') {
    return 'Votre session a expiré. Veuillez vous reconnecter.';
  }
  if (route.query.disabled === 'true') {
    return 'Votre compte a été désactivé. Contactez l\'administrateur.';
  }
  return '';
});

const handleLogin = async () => {
  try {
    // useAuth.login gère automatiquement :
    // - La redirection vers /changer-mot-de-passe si doitChangerMotDePasse
    // - La redirection vers le dashboard selon le rôle
    await login(credentials.value);
  } catch (err) {
    console.error('[Login] Erreur de connexion:', err);
  }
};

// Nettoyer le localStorage au montage si on arrive avec un paramètre d'expiration
onMounted(() => {
  if (route.query.expired === 'true' || route.query.disabled === 'true') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userData');
  }
});
</script>

<style scoped>
/* Styles spécifiques au Login - le reste est géré par Tailwind */
</style>
