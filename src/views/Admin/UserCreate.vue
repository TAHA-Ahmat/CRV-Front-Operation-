<template>
  <!--
    CRÉATION UTILISATEUR - CONTRAT BACKEND
    Source : TRANSMISSION_BACKEND_FRONTEND.md

    Réservé : ADMIN uniquement
    Endpoint : POST /api/personnes
  -->
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="card">
        <!-- En-tête -->
        <div class="mb-6">
          <router-link to="/users" class="text-crv-blue hover:underline text-sm mb-2 inline-block">
            &larr; Retour à la liste
          </router-link>
          <h1 class="text-2xl font-bold text-gray-800">Nouvel utilisateur</h1>
          <p class="text-gray-500 text-sm mt-1">Créer un nouveau compte utilisateur</p>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Prénom -->
          <div>
            <label for="prenom" class="form-label">Prénom *</label>
            <input
              id="prenom"
              v-model="form.prenom"
              type="text"
              class="form-input w-full"
              :class="{ 'border-red-500': errors.prenom }"
              placeholder="Prénom de l'utilisateur"
              required
            />
            <p v-if="errors.prenom" class="text-red-600 text-sm mt-1">{{ errors.prenom }}</p>
          </div>

          <!-- Nom -->
          <div>
            <label for="nom" class="form-label">Nom *</label>
            <input
              id="nom"
              v-model="form.nom"
              type="text"
              class="form-input w-full"
              :class="{ 'border-red-500': errors.nom }"
              placeholder="Nom de l'utilisateur"
              required
            />
            <p v-if="errors.nom" class="text-red-600 text-sm mt-1">{{ errors.nom }}</p>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="form-label">Email *</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input w-full"
              :class="{ 'border-red-500': errors.email }"
              placeholder="email@exemple.com"
              required
            />
            <p v-if="errors.email" class="text-red-600 text-sm mt-1">{{ errors.email }}</p>
          </div>

          <!-- Rôle -->
          <div>
            <label for="fonction" class="form-label">Rôle (fonction) *</label>
            <select
              id="fonction"
              v-model="form.fonction"
              class="form-input w-full"
              :class="{ 'border-red-500': errors.fonction }"
              required
            >
              <option value="">Sélectionner un rôle</option>
              <option v-for="role in availableRoles" :key="role.value" :value="role.value">
                {{ role.label }}
              </option>
            </select>
            <p v-if="errors.fonction" class="text-red-600 text-sm mt-1">{{ errors.fonction }}</p>

            <!-- Description du rôle sélectionné -->
            <div v-if="form.fonction" class="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-600">
              <strong>{{ getRoleLabel(form.fonction) }}</strong>
              <p class="mt-1">{{ getRoleDescription(form.fonction) }}</p>
            </div>
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="motDePasse" class="form-label">Mot de passe temporaire *</label>
            <div class="flex space-x-2">
              <input
                id="motDePasse"
                v-model="form.motDePasse"
                type="text"
                class="form-input flex-1"
                :class="{ 'border-red-500': errors.motDePasse }"
                placeholder="Mot de passe temporaire"
                required
              />
              <button
                type="button"
                @click="generatePassword"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              >
                Générer
              </button>
            </div>
            <p v-if="errors.motDePasse" class="text-red-600 text-sm mt-1">{{ errors.motDePasse }}</p>
            <p class="text-gray-500 text-xs mt-1">
              L'utilisateur devra changer ce mot de passe à sa première connexion.
            </p>
          </div>

          <!-- Erreur globale -->
          <div v-if="globalError" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {{ globalError }}
          </div>

          <!-- Boutons -->
          <div class="flex justify-end space-x-3 pt-4">
            <router-link to="/users" class="px-4 py-2 text-gray-600 hover:text-gray-800">
              Annuler
            </router-link>
            <button
              type="submit"
              class="btn-primary px-6 py-2"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Création...' : 'Créer le compte' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Modal de succès avec identifiants -->
      <div
        v-if="showSuccessModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div class="text-center mb-4">
            <div class="text-4xl text-green-500 mb-2">✓</div>
            <h3 class="text-lg font-bold text-gray-900">Compte créé avec succès</h3>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
            <p class="text-yellow-800 text-sm font-medium mb-2">
              Notez ces identifiants de connexion (affichés une seule fois) :
            </p>
            <div class="bg-white p-3 rounded border border-yellow-300">
              <p class="text-sm"><strong>Email :</strong> {{ createdUser.email }}</p>
              <p class="text-sm"><strong>Mot de passe :</strong> {{ createdUser.motDePasse }}</p>
            </div>
          </div>

          <p class="text-gray-600 text-sm mb-6">
            L'utilisateur devra changer son mot de passe à la première connexion.
          </p>

          <div class="flex justify-center space-x-3">
            <button
              @click="copyCredentials"
              class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Copier les identifiants
            </button>
            <router-link to="/users" class="btn-primary px-4 py-2">
              Fermer
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { personnesAPI } from '@/services/api';
import { ROLES, ROLES_LABELS, getRolesForSelect } from '@/config/roles';

const router = useRouter();
const toast = useToast();

// États
const isLoading = ref(false);
const globalError = ref('');
const showSuccessModal = ref(false);
const createdUser = ref({ email: '', motDePasse: '' });

// Formulaire
const form = reactive({
  prenom: '',
  nom: '',
  email: '',
  fonction: '',
  motDePasse: ''
});

// Erreurs
const errors = reactive({
  prenom: '',
  nom: '',
  email: '',
  fonction: '',
  motDePasse: ''
});

// Rôles disponibles
const availableRoles = computed(() => getRolesForSelect());

// Label du rôle
const getRoleLabel = (fonction) => {
  return ROLES_LABELS[fonction] || fonction;
};

// Description du rôle
const getRoleDescription = (fonction) => {
  const descriptions = {
    [ROLES.AGENT_ESCALE]: 'Peut créer et modifier des CRV.',
    [ROLES.CHEF_EQUIPE]: 'Peut créer et modifier des CRV.',
    [ROLES.SUPERVISEUR]: 'Peut créer, modifier et valider des CRV et programmes.',
    [ROLES.MANAGER]: 'Accès complet : CRV, validation, statistiques, suppression programmes.',
    [ROLES.QUALITE]: 'Lecture seule : consultation des CRV et statistiques.',
    [ROLES.ADMIN]: 'Administration système : gestion des comptes uniquement.'
  };
  return descriptions[fonction] || '';
};

// Générer un mot de passe aléatoire
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const specials = '!@#$%&*';
  let password = '';

  // 6 caractères alphanumériques
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // 1 chiffre garanti
  password += Math.floor(Math.random() * 10);
  // 1 caractère spécial garanti
  password += specials.charAt(Math.floor(Math.random() * specials.length));

  // Mélanger
  form.motDePasse = password.split('').sort(() => Math.random() - 0.5).join('');
};

// Validation du formulaire
const validateForm = () => {
  let isValid = true;

  // Reset des erreurs
  Object.keys(errors).forEach(key => errors[key] = '');

  if (!form.prenom.trim()) {
    errors.prenom = 'Le prénom est requis';
    isValid = false;
  }

  if (!form.nom.trim()) {
    errors.nom = 'Le nom est requis';
    isValid = false;
  }

  if (!form.email.trim()) {
    errors.email = 'L\'email est requis';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Format d\'email invalide';
    isValid = false;
  }

  if (!form.fonction) {
    errors.fonction = 'Le rôle est requis';
    isValid = false;
  }

  if (!form.motDePasse.trim()) {
    errors.motDePasse = 'Le mot de passe est requis';
    isValid = false;
  } else if (form.motDePasse.length < 8) {
    errors.motDePasse = 'Le mot de passe doit contenir au moins 8 caractères';
    isValid = false;
  }

  return isValid;
};

// Soumission
const handleSubmit = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  globalError.value = '';

  try {
    await personnesAPI.create({
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      email: form.email.trim().toLowerCase(),
      fonction: form.fonction,
      motDePasse: form.motDePasse
    });

    // Stocker les identifiants pour l'affichage
    createdUser.value = {
      email: form.email,
      motDePasse: form.motDePasse
    };

    // Afficher le modal de succès
    showSuccessModal.value = true;

  } catch (err) {
    const errorCode = err.response?.data?.code;
    const errorMessage = err.response?.data?.message;

    if (errorCode === 'EMAIL_ALREADY_EXISTS') {
      errors.email = 'Cet email est déjà utilisé';
    } else if (errorCode === 'WEAK_PASSWORD') {
      errors.motDePasse = errorMessage || 'Mot de passe trop faible';
    } else {
      globalError.value = errorMessage || 'Erreur lors de la création du compte';
    }
  } finally {
    isLoading.value = false;
  }
};

// Copier les identifiants
const copyCredentials = () => {
  const text = `Email: ${createdUser.value.email}\nMot de passe: ${createdUser.value.motDePasse}`;
  navigator.clipboard.writeText(text);
  toast.success('Identifiants copiés dans le presse-papier');
};
</script>
