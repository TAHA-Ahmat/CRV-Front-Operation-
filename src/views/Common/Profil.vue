<template>
  <!--
    PAGE PROFIL UTILISATEUR - CONTRAT BACKEND
    Source : TRANSMISSION_BACKEND_FRONTEND.md

    Accessible à tous les rôles authentifiés
  -->
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="card">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Mon profil</h1>

        <!-- Informations utilisateur -->
        <div class="space-y-4">
          <!-- Avatar et nom -->
          <div class="flex items-center space-x-4 pb-4 border-b">
            <div class="h-16 w-16 rounded-full bg-crv-blue flex items-center justify-center text-white text-xl font-bold">
              {{ initials }}
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-800">{{ fullName }}</h2>
              <span class="px-2 py-1 text-xs rounded-full font-medium" :class="roleBadgeClass">
                {{ roleLabel }}
              </span>
            </div>
          </div>

          <!-- Détails -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-500">Email</label>
              <p class="font-medium text-gray-800">{{ userData?.email || '-' }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">Rôle</label>
              <p class="font-medium text-gray-800">{{ roleLabel }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-6 border-t">
            <h3 class="text-lg font-medium text-gray-800 mb-4">Actions</h3>
            <div class="space-y-3">
              <router-link
                to="/changer-mot-de-passe"
                class="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
              >
                <span class="font-medium text-gray-800">Changer mon mot de passe</span>
                <p class="text-sm text-gray-500">Modifier votre mot de passe de connexion</p>
              </router-link>
            </div>
          </div>

          <!-- Info rôle lecture seule -->
          <div v-if="isQualite" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-yellow-800 text-sm">
              <strong>Mode lecture seule :</strong> Votre profil QUALITE vous permet de consulter les données
              mais pas de les modifier.
            </p>
          </div>

          <!-- Info rôle admin -->
          <div v-if="isAdmin" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-800 text-sm">
              <strong>Compte Administrateur :</strong> Vous avez accès à la gestion des comptes utilisateurs.
              Vous n'avez pas accès aux opérations CRV.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { ROLES, ROLES_LABELS } from '@/config/roles';

const { userData, userRole } = useAuth();

// Computed
const fullName = computed(() => {
  if (!userData.value) return '';
  return `${userData.value.prenom || ''} ${userData.value.nom || ''}`.trim() || userData.value.email;
});

const initials = computed(() => {
  if (!userData.value) return '?';
  const prenom = userData.value.prenom || '';
  const nom = userData.value.nom || '';
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || '?';
});

const roleLabel = computed(() => {
  return ROLES_LABELS[userRole.value] || userRole.value || 'Inconnu';
});

const isQualite = computed(() => userRole.value === ROLES.QUALITE);
const isAdmin = computed(() => userRole.value === ROLES.ADMIN);

const roleBadgeClass = computed(() => {
  switch (userRole.value) {
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
});
</script>
