<template>
  <!--
    MODIFICATION UTILISATEUR - CONTRAT BACKEND
    Source : TRANSMISSION_BACKEND_FRONTEND.md

    Réservé : ADMIN uniquement
    Endpoint : GET/PATCH /api/personnes/:id
  -->
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="card">
        <!-- En-tête -->
        <div class="mb-6">
          <router-link to="/users" class="text-crv-blue hover:underline text-sm mb-2 inline-block">
            &larr; Retour à la liste
          </router-link>
          <h1 class="text-2xl font-bold text-gray-800">Modifier l'utilisateur</h1>
          <p class="text-gray-500 text-sm mt-1">ID: {{ userId }}</p>
        </div>

        <!-- Loading -->
        <div v-if="isLoadingUser" class="text-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-crv-blue mx-auto"></div>
          <p class="text-gray-500 mt-4">Chargement...</p>
        </div>

        <!-- Erreur chargement -->
        <div v-else-if="loadError" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {{ loadError }}
        </div>

        <!-- Formulaire -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Prénom -->
          <div>
            <label for="prenom" class="form-label">Prénom *</label>
            <input
              id="prenom"
              v-model="form.prenom"
              type="text"
              class="form-input w-full"
              :class="{ 'border-red-500': errors.prenom }"
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
              <option v-for="role in availableRoles" :key="role.value" :value="role.value">
                {{ role.label }}
              </option>
            </select>
            <p v-if="errors.fonction" class="text-red-600 text-sm mt-1">{{ errors.fonction }}</p>

            <!-- Avertissement changement rôle -->
            <div v-if="form.fonction !== originalFonction" class="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <strong>Attention :</strong> Le changement de rôle prendra effet à la prochaine connexion de l'utilisateur.
            </div>
          </div>

          <!-- Statut -->
          <div>
            <label class="form-label">Statut du compte</label>
            <div class="flex items-center space-x-4 mt-2">
              <label class="flex items-center">
                <input
                  type="radio"
                  v-model="form.actif"
                  :value="true"
                  class="mr-2"
                />
                <span class="text-green-700">Actif</span>
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  v-model="form.actif"
                  :value="false"
                  class="mr-2"
                />
                <span class="text-red-700">Désactivé</span>
              </label>
            </div>

            <!-- Raison désactivation -->
            <div v-if="!form.actif && form.actif !== originalActif" class="mt-2">
              <label class="form-label text-sm">Raison de la désactivation (optionnel)</label>
              <textarea
                v-model="form.raisonDesactivation"
                class="form-input w-full"
                rows="2"
                placeholder="Indiquez la raison..."
              ></textarea>
            </div>
          </div>

          <!-- Informations complémentaires -->
          <div class="border-t pt-4 mt-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Informations</h3>
            <div class="text-sm text-gray-500 space-y-1">
              <p><strong>Créé le :</strong> {{ formatDate(originalUser.createdAt) }}</p>
              <p><strong>Dernière modification :</strong> {{ formatDate(originalUser.updatedAt) }}</p>
            </div>
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
              :disabled="isLoading || !hasChanges"
            >
              {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { personnesAPI } from '@/services/api';
import { ROLES_LABELS, getRolesForSelect } from '@/config/roles';

const router = useRouter();
const route = useRoute();
const toast = useToast();

// États
const userId = computed(() => route.params.id);
const isLoadingUser = ref(false);
const isLoading = ref(false);
const loadError = ref('');
const globalError = ref('');

// Données originales pour comparaison
const originalUser = ref({});
const originalFonction = ref('');
const originalActif = ref(true);

// Formulaire
const form = reactive({
  prenom: '',
  nom: '',
  email: '',
  fonction: '',
  actif: true,
  raisonDesactivation: ''
});

// Erreurs
const errors = reactive({
  prenom: '',
  nom: '',
  email: '',
  fonction: ''
});

// Rôles disponibles
const availableRoles = computed(() => getRolesForSelect());

// Vérifier si des changements ont été faits
const hasChanges = computed(() => {
  return form.prenom !== originalUser.value.prenom ||
         form.nom !== originalUser.value.nom ||
         form.email !== originalUser.value.email ||
         form.fonction !== originalFonction.value ||
         form.actif !== originalActif.value;
});

// Charger l'utilisateur
const loadUser = async () => {
  isLoadingUser.value = true;
  loadError.value = '';

  try {
    const response = await personnesAPI.getById(userId.value);
    const user = response.data.data || response.data;

    // Stocker les données originales
    originalUser.value = { ...user };
    originalFonction.value = user.fonction;
    originalActif.value = user.actif !== false;

    // Remplir le formulaire
    form.prenom = user.prenom || '';
    form.nom = user.nom || '';
    form.email = user.email || '';
    form.fonction = user.fonction || '';
    form.actif = user.actif !== false;
  } catch (err) {
    console.error('[UserEdit] Erreur chargement:', err);
    loadError.value = err.response?.data?.message || 'Erreur lors du chargement de l\'utilisateur';
  } finally {
    isLoadingUser.value = false;
  }
};

// Formater une date
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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

  return isValid;
};

// Soumission
const handleSubmit = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  globalError.value = '';

  try {
    const updateData = {
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      email: form.email.trim().toLowerCase(),
      fonction: form.fonction,
      actif: form.actif
    };

    // Ajouter la raison si désactivation
    if (!form.actif && form.raisonDesactivation) {
      updateData.raisonDesactivation = form.raisonDesactivation;
    }

    await personnesAPI.update(userId.value, updateData);

    toast.success('Utilisateur modifié avec succès');
    router.push('/users');
  } catch (err) {
    const errorCode = err.response?.data?.code;
    const errorMessage = err.response?.data?.message;

    if (errorCode === 'EMAIL_ALREADY_EXISTS') {
      errors.email = 'Cet email est déjà utilisé par un autre compte';
    } else {
      globalError.value = errorMessage || 'Erreur lors de la modification';
    }
  } finally {
    isLoading.value = false;
  }
};

// Chargement initial
onMounted(() => {
  loadUser();
});
</script>
