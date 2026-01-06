<template>
  <!--
    GESTION DES UTILISATEURS - CONTRAT BACKEND
    Source : TRANSMISSION_BACKEND_FRONTEND.md

    Réservé : ADMIN uniquement
    Endpoint : GET/POST/PATCH/DELETE /api/personnes
  -->
  <div class="container mx-auto px-4 py-8">
    <div class="card">
      <!-- En-tête -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
          <p class="text-gray-500 text-sm mt-1">Administration des comptes du système CRV</p>
        </div>
        <router-link
          to="/users/nouveau"
          class="btn-primary px-4 py-2 flex items-center space-x-2"
        >
          <span>+</span>
          <span>Nouvel utilisateur</span>
        </router-link>
      </div>

      <!-- Filtres -->
      <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <!-- Recherche -->
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Rechercher par nom ou email..."
            class="form-input w-full"
            @input="debouncedSearch"
          />
        </div>

        <!-- Filtre rôle -->
        <div class="w-48">
          <select v-model="filters.fonction" class="form-input w-full" @change="loadUsers">
            <option value="">Tous les rôles</option>
            <option v-for="role in availableRoles" :key="role.value" :value="role.value">
              {{ role.label }}
            </option>
          </select>
        </div>

        <!-- Filtre statut -->
        <div class="w-40">
          <select v-model="filters.actif" class="form-input w-full" @change="loadUsers">
            <option value="">Tous</option>
            <option value="true">Actifs</option>
            <option value="false">Désactivés</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-crv-blue mx-auto"></div>
        <p class="text-gray-500 mt-4">Chargement des utilisateurs...</p>
      </div>

      <!-- Erreur -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <!-- Liste des utilisateurs -->
      <div v-else>
        <!-- Compteur -->
        <p class="text-gray-600 text-sm mb-4">
          {{ users.length }} utilisateur(s) trouvé(s)
        </p>

        <!-- Tableau -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <!-- Nom -->
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-gray-600 font-medium">
                        {{ getInitials(user) }}
                      </span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.prenom }} {{ user.nom }}
                      </div>
                      <div class="text-xs text-gray-500">
                        ID: {{ user.id }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ user.email }}
                </td>

                <!-- Rôle -->
                <td class="px-4 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs rounded-full font-medium"
                    :class="getRoleBadgeClass(user.fonction)"
                  >
                    {{ getRoleLabel(user.fonction) }}
                  </span>
                </td>

                <!-- Statut -->
                <td class="px-4 py-4 whitespace-nowrap text-center">
                  <span
                    class="px-2 py-1 text-xs rounded-full font-medium"
                    :class="user.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ user.actif ? 'Actif' : 'Désactivé' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <div class="flex justify-end space-x-2">
                    <!-- Modifier -->
                    <router-link
                      :to="`/users/${user.id}/edit`"
                      class="text-blue-600 hover:text-blue-800"
                      title="Modifier"
                    >
                      Modifier
                    </router-link>

                    <!-- Activer/Désactiver -->
                    <button
                      v-if="user.actif"
                      @click="confirmDesactivate(user)"
                      class="text-orange-600 hover:text-orange-800"
                      title="Désactiver"
                    >
                      Désactiver
                    </button>
                    <button
                      v-else
                      @click="reactivateUser(user)"
                      class="text-green-600 hover:text-green-800"
                      title="Réactiver"
                    >
                      Réactiver
                    </button>

                    <!-- Supprimer -->
                    <button
                      @click="confirmDelete(user)"
                      class="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Aucun résultat -->
        <div v-if="users.length === 0" class="text-center py-12 text-gray-500">
          Aucun utilisateur trouvé.
        </div>
      </div>
    </div>

    <!-- Modal de confirmation -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">{{ modalTitle }}</h3>
        <p class="text-gray-600 mb-6">{{ modalMessage }}</p>

        <!-- Raison (pour désactivation) -->
        <div v-if="modalAction === 'desactivate'" class="mb-4">
          <label class="form-label">Raison (optionnel)</label>
          <textarea
            v-model="actionReason"
            class="form-input w-full"
            rows="2"
            placeholder="Indiquez la raison de la désactivation..."
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3">
          <button @click="closeModal" class="px-4 py-2 text-gray-600 hover:text-gray-800">
            Annuler
          </button>
          <button
            @click="executeModalAction"
            :class="modalAction === 'delete' ? 'btn-danger' : 'btn-primary'"
            class="px-4 py-2"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'Traitement...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useToast } from 'vue-toastification';
import { personnesAPI } from '@/services/api';
import { ROLES, ROLES_LABELS, getRolesForSelect } from '@/config/roles';

const toast = useToast();

// États
const users = ref([]);
const isLoading = ref(false);
const isProcessing = ref(false);
const error = ref(null);

// Filtres
const filters = reactive({
  search: '',
  fonction: '',
  actif: ''
});

// Modal
const showModal = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');
const modalAction = ref('');
const selectedUser = ref(null);
const actionReason = ref('');

// Rôles disponibles pour le filtre
const availableRoles = computed(() => getRolesForSelect());

// Debounce pour la recherche
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadUsers();
  }, 300);
};

// Charger les utilisateurs
const loadUsers = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.fonction) params.fonction = filters.fonction;
    if (filters.actif !== '') params.actif = filters.actif;

    const response = await personnesAPI.getAll(params);
    users.value = response.data.data || response.data || [];
  } catch (err) {
    console.error('[UserManagement] Erreur chargement:', err);
    error.value = err.response?.data?.message || 'Erreur lors du chargement des utilisateurs';
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
};

// Initiales de l'utilisateur
const getInitials = (user) => {
  const prenom = user.prenom || '';
  const nom = user.nom || '';
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || '?';
};

// Label du rôle
const getRoleLabel = (fonction) => {
  return ROLES_LABELS[fonction] || fonction || 'Inconnu';
};

// Classe CSS du badge rôle
const getRoleBadgeClass = (fonction) => {
  switch (fonction) {
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
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Confirmation désactivation
const confirmDesactivate = (user) => {
  selectedUser.value = user;
  modalAction.value = 'desactivate';
  modalTitle.value = 'Désactiver le compte';
  modalMessage.value = `Êtes-vous sûr de vouloir désactiver le compte de ${user.prenom} ${user.nom} ?`;
  actionReason.value = '';
  showModal.value = true;
};

// Réactiver
const reactivateUser = async (user) => {
  try {
    await personnesAPI.reactiver(user.id);
    toast.success(`Compte de ${user.prenom} ${user.nom} réactivé`);
    await loadUsers();
  } catch (err) {
    const message = err.response?.data?.message || 'Erreur lors de la réactivation';
    toast.error(message);
  }
};

// Confirmation suppression
const confirmDelete = (user) => {
  selectedUser.value = user;
  modalAction.value = 'delete';
  modalTitle.value = 'Supprimer le compte';
  modalMessage.value = `Êtes-vous sûr de vouloir supprimer définitivement le compte de ${user.prenom} ${user.nom} ? Cette action est irréversible.`;
  showModal.value = true;
};

// Fermer le modal
const closeModal = () => {
  showModal.value = false;
  selectedUser.value = null;
  modalAction.value = '';
  actionReason.value = '';
};

// Exécuter l'action du modal
const executeModalAction = async () => {
  if (!selectedUser.value) return;

  isProcessing.value = true;

  try {
    if (modalAction.value === 'desactivate') {
      await personnesAPI.desactiver(selectedUser.value.id, actionReason.value);
      toast.success(`Compte de ${selectedUser.value.prenom} ${selectedUser.value.nom} désactivé`);
    } else if (modalAction.value === 'delete') {
      await personnesAPI.delete(selectedUser.value.id);
      toast.success(`Compte supprimé`);
    }

    await loadUsers();
    closeModal();
  } catch (err) {
    const errorCode = err.response?.data?.code;
    const errorMessage = err.response?.data?.message;

    if (errorCode === 'ACCOUNT_IN_USE') {
      toast.error('Impossible de supprimer : ce compte a été utilisé pour créer des CRV. Utilisez la désactivation à la place.');
    } else {
      toast.error(errorMessage || 'Erreur lors de l\'opération');
    }
  } finally {
    isProcessing.value = false;
  }
};

// Chargement initial
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.btn-danger {
  @apply bg-red-600 text-white rounded hover:bg-red-700;
}
</style>
