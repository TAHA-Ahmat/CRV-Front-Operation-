<template>
  <!--
    PAGE CHANGEMENT DE MOT DE PASSE
    Source : TRANSMISSION_BACKEND_FRONTEND.md

    Cas d'usage :
    1. Utilisateur avec doitChangerMotDePasse: true (redirection forcée après login)
    2. Utilisateur souhaitant changer son mot de passe volontairement
  -->
  <div class="change-password min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg">
      <!-- En-tête -->
      <div class="bg-crv-dark text-white p-6 border-b-4 border-crv-blue text-center rounded-t-lg">
        <div class="text-5xl mb-3">🔐</div>
        <h2 class="text-xl font-normal tracking-wider uppercase">Changement de mot de passe</h2>
        <p v-if="isForced" class="text-sm text-yellow-300 mt-2">
          Vous devez changer votre mot de passe pour continuer
        </p>
      </div>

      <div class="p-8">
        <!-- Message informatif si changement forcé -->
        <div v-if="isForced" class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
          <p class="text-sm">
            <strong>Sécurité :</strong> Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant d'accéder à l'application.
          </p>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Ancien mot de passe -->
          <div class="space-y-2">
            <label for="oldPassword" class="form-label">Ancien mot de passe</label>
            <input
              id="oldPassword"
              type="password"
              v-model="form.ancienMotDePasse"
              placeholder="Votre mot de passe actuel"
              required
              :disabled="isLoading"
              class="form-input"
              :class="{ 'border-red-500': errors.ancienMotDePasse }"
            />
            <p v-if="errors.ancienMotDePasse" class="text-red-600 text-sm">
              {{ errors.ancienMotDePasse }}
            </p>
          </div>

          <!-- Nouveau mot de passe -->
          <div class="space-y-2">
            <label for="newPassword" class="form-label">Nouveau mot de passe</label>
            <input
              id="newPassword"
              type="password"
              v-model="form.nouveauMotDePasse"
              placeholder="Nouveau mot de passe"
              required
              :disabled="isLoading"
              class="form-input"
              :class="{ 'border-red-500': errors.nouveauMotDePasse }"
              @input="validatePassword"
            />
            <p v-if="errors.nouveauMotDePasse" class="text-red-600 text-sm">
              {{ errors.nouveauMotDePasse }}
            </p>

            <!-- Indicateur de force du mot de passe -->
            <div class="mt-2">
              <p class="text-xs text-gray-600 mb-1">Critères de sécurité :</p>
              <ul class="text-xs space-y-1">
                <li :class="passwordCriteria.minLength ? 'text-green-600' : 'text-gray-400'">
                  {{ passwordCriteria.minLength ? '✓' : '○' }} Minimum 8 caractères
                </li>
                <li :class="passwordCriteria.hasUppercase ? 'text-green-600' : 'text-gray-400'">
                  {{ passwordCriteria.hasUppercase ? '✓' : '○' }} Au moins 1 majuscule
                </li>
                <li :class="passwordCriteria.hasLowercase ? 'text-green-600' : 'text-gray-400'">
                  {{ passwordCriteria.hasLowercase ? '✓' : '○' }} Au moins 1 minuscule
                </li>
                <li :class="passwordCriteria.hasNumber ? 'text-green-600' : 'text-gray-400'">
                  {{ passwordCriteria.hasNumber ? '✓' : '○' }} Au moins 1 chiffre
                </li>
                <li :class="passwordCriteria.hasSpecial ? 'text-green-600' : 'text-gray-400'">
                  {{ passwordCriteria.hasSpecial ? '✓' : '○' }} Au moins 1 caractère spécial (!@#$%^&*)
                </li>
              </ul>
            </div>
          </div>

          <!-- Confirmation -->
          <div class="space-y-2">
            <label for="confirmPassword" class="form-label">Confirmer le nouveau mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              v-model="form.confirmationMotDePasse"
              placeholder="Confirmer le nouveau mot de passe"
              required
              :disabled="isLoading"
              class="form-input"
              :class="{ 'border-red-500': errors.confirmationMotDePasse }"
            />
            <p v-if="errors.confirmationMotDePasse" class="text-red-600 text-sm">
              {{ errors.confirmationMotDePasse }}
            </p>
          </div>

          <!-- Message d'erreur global -->
          <div v-if="globalError" class="bg-red-50 border border-red-200 text-red-800 px-4 py-2 text-sm rounded">
            {{ globalError }}
          </div>

          <!-- Boutons -->
          <div class="pt-4 space-y-3">
            <button
              type="submit"
              class="btn-primary w-full py-2 px-4 uppercase text-sm tracking-wider"
              :disabled="isLoading || !isFormValid"
            >
              {{ isLoading ? 'Changement en cours...' : 'Changer le mot de passe' }}
            </button>

            <!-- Bouton annuler (seulement si pas forcé) -->
            <button
              v-if="!isForced"
              type="button"
              @click="handleCancel"
              class="w-full py-2 px-4 text-gray-600 hover:text-gray-800 text-sm"
              :disabled="isLoading"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-6 py-4 text-center border-t border-gray-200 rounded-b-lg">
        <p class="text-xs text-gray-600">
          THS - Système CRV sécurisé
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const route = useRoute();
const { updatePassword, isLoading, mustChangePassword, userRole, getRedirectPathForRole, isAuthenticated } = useAuth();

// Formulaire
const form = ref({
  ancienMotDePasse: '',
  nouveauMotDePasse: '',
  confirmationMotDePasse: ''
});

// Erreurs
const errors = ref({
  ancienMotDePasse: '',
  nouveauMotDePasse: '',
  confirmationMotDePasse: ''
});
const globalError = ref('');

// Changement forcé (doitChangerMotDePasse)
const isForced = computed(() => {
  return mustChangePassword.value || route.query.forced === 'true';
});

// Critères de validation du mot de passe
const passwordCriteria = computed(() => {
  const pwd = form.value.nouveauMotDePasse;
  return {
    minLength: pwd.length >= 8,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /\d/.test(pwd),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  };
});

// Validation complète
const isPasswordValid = computed(() => {
  const criteria = passwordCriteria.value;
  return criteria.minLength &&
         criteria.hasUppercase &&
         criteria.hasLowercase &&
         criteria.hasNumber &&
         criteria.hasSpecial;
});

const isFormValid = computed(() => {
  return form.value.ancienMotDePasse &&
         form.value.nouveauMotDePasse &&
         form.value.confirmationMotDePasse &&
         isPasswordValid.value &&
         form.value.nouveauMotDePasse === form.value.confirmationMotDePasse &&
         form.value.nouveauMotDePasse !== form.value.ancienMotDePasse;
});

// Validation en temps réel
const validatePassword = () => {
  errors.value.nouveauMotDePasse = '';

  if (form.value.nouveauMotDePasse === form.value.ancienMotDePasse) {
    errors.value.nouveauMotDePasse = 'Le nouveau mot de passe doit être différent de l\'ancien';
  }
};

// Validation avant soumission
const validateForm = () => {
  let isValid = true;
  errors.value = {
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmationMotDePasse: ''
  };
  globalError.value = '';

  if (!form.value.ancienMotDePasse) {
    errors.value.ancienMotDePasse = 'L\'ancien mot de passe est requis';
    isValid = false;
  }

  if (!form.value.nouveauMotDePasse) {
    errors.value.nouveauMotDePasse = 'Le nouveau mot de passe est requis';
    isValid = false;
  } else if (!isPasswordValid.value) {
    errors.value.nouveauMotDePasse = 'Le mot de passe ne respecte pas les critères de sécurité';
    isValid = false;
  } else if (form.value.nouveauMotDePasse === form.value.ancienMotDePasse) {
    errors.value.nouveauMotDePasse = 'Le nouveau mot de passe doit être différent de l\'ancien';
    isValid = false;
  }

  if (!form.value.confirmationMotDePasse) {
    errors.value.confirmationMotDePasse = 'La confirmation est requise';
    isValid = false;
  } else if (form.value.nouveauMotDePasse !== form.value.confirmationMotDePasse) {
    errors.value.confirmationMotDePasse = 'Les mots de passe ne correspondent pas';
    isValid = false;
  }

  return isValid;
};

// Soumission du formulaire
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    await updatePassword(form.value.ancienMotDePasse, form.value.nouveauMotDePasse);
    // La redirection est gérée dans updatePassword
  } catch (err) {
    // Gestion des erreurs spécifiques
    const errorCode = err.response?.data?.code;
    const errorMessage = err.response?.data?.message;

    if (errorCode === 'WEAK_PASSWORD') {
      errors.value.nouveauMotDePasse = errorMessage || 'Le mot de passe ne respecte pas les critères de sécurité';
    } else if (errorMessage?.toLowerCase().includes('ancien')) {
      errors.value.ancienMotDePasse = 'L\'ancien mot de passe est incorrect';
    } else {
      globalError.value = errorMessage || 'Erreur lors du changement de mot de passe';
    }
  }
};

// Annuler (seulement si pas forcé)
const handleCancel = () => {
  if (!isForced.value) {
    const redirectPath = getRedirectPathForRole(userRole.value);
    router.push(redirectPath);
  }
};

// Vérification au montage
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login');
  }
});
</script>

<style scoped>
/* Styles spécifiques à ChangePassword - le reste est géré par Tailwind */
</style>
