<template>
  <!-- COPIÉ DEPUIS STOCK THS (UserLogin.vue) ET ADAPTÉ POUR CRV -->
  <div class="login min-h-screen flex items-center justify-center p-4" style="background: var(--bg-body);">
    <div class="w-full max-w-md rounded-lg shadow-lg" style="background: var(--bg-card); border: 1px solid var(--border-color);">
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
            <div class="password-field">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="credentials.mot_de_passe"
                placeholder="Mot de passe"
                required
                :disabled="isLoading"
                class="form-input"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :title="showPassword ? 'Masquer' : 'Afficher'"
                :disabled="isLoading"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
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
              class="btn-primary w-full py-2 px-4 uppercase text-sm tracking-wider btn-login"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="login-spinner"></span>
              {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
            </button>
          </div>

          <!-- MVS-1 #1: Information sur la durée de session -->
          <div class="session-info text-center">
            <p class="text-xs" style="color: var(--text-tertiary);">
              La session reste active pendant 3 heures
            </p>
          </div>

          <!-- Texte mot de passe oublié - CONFORME AU CONTRAT BACKEND -->
          <div class="pt-4 text-center">
            <p class="text-sm" style="color: var(--text-secondary);">
              Mot de passe oublié ?
              <span class="text-crv-blue font-medium">Contactez le support.</span>
            </p>
          </div>
        </form>
      </div>

      <!-- MVS-1 #3: Système fermé explicite -->
      <div class="px-6 py-4 text-center rounded-b-lg" style="background: var(--bg-table-header); border-top: 1px solid var(--border-color);">
        <p class="text-xs" style="color: var(--text-secondary);">Portail sécurisé - Accès réservé au personnel SDTA/THS</p>
        <p class="text-xs mt-1" style="color: var(--text-tertiary);">Pour obtenir un accès, contactez votre responsable</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const authStore = useAuthStore();
const { login, isLoading, error } = useAuth();

const credentials = ref({
  email: '',
  mot_de_passe: ''
});

const showPassword = ref(false);

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

// Nettoyer la session si on arrive avec un paramètre d'expiration/désactivation
onMounted(() => {
  if (route.query.expired === 'true' || route.query.disabled === 'true') {
    authStore.clearSession();
  }
});
</script>

<style scoped>
/* Styles spécifiques au Login - le reste est géré par Tailwind */

/* ============================================ */
/* RESPONSIVE DESIGN                            */
/* ============================================ */

/* Champ mot de passe avec bouton afficher/masquer */
.password-field {
  position: relative;
  display: flex;
  align-items: center;
}

.password-field .form-input {
  padding-right: 48px !important;
  width: 100%;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: var(--text-primary);
}

.password-toggle svg {
  width: 20px;
  height: 20px;
}

/* Bouton login avec spinner */
.btn-login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
}

.login-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .login {
    padding: 16px !important;
  }

  .login > div {
    margin: 0;
  }

  .bg-crv-dark {
    padding: 20px 16px !important;
  }

  .bg-crv-dark .text-6xl {
    font-size: 48px !important;
  }

  .bg-crv-dark h2 {
    font-size: 18px !important;
  }

  .bg-crv-dark p {
    font-size: 12px !important;
  }

  .p-8 {
    padding: 20px 16px !important;
  }

  .form-input {
    font-size: 16px !important; /* Empêche le zoom sur iOS */
  }

  .btn-primary {
    padding: 14px !important;
    font-size: 14px !important;
  }
}

/* Tablette (768px - 1023px = md:) */
@media (min-width: 768px) and (max-width: 1023px) {
  .login > div {
    max-width: 440px;
  }

  .bg-crv-dark .text-6xl {
    font-size: 56px !important;
  }
}
</style>
