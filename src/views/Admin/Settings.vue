<template>
  <div class="container mx-auto px-4 py-8 max-w-[800px]">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Parametres</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Matrice de Notifications -->
      <router-link
        to="/settings/notifications"
        class="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow group"
      >
        <div class="flex items-center gap-3 mb-2">
          <span class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xl">&#9881;</span>
          <h2 class="text-sm font-bold text-gray-800 group-hover:text-blue-600">Matrice de Notifications</h2>
        </div>
        <p class="text-xs text-gray-500">
          82 evenements x 6 roles x 3 canaux. Activez/desactivez les notifications par evenement et par role.
        </p>
      </router-link>

      <!-- Contacts de Notification -->
      <router-link
        to="/settings/notification-recipients"
        class="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow group"
      >
        <div class="flex items-center gap-3 mb-2">
          <span class="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xl">&#9993;</span>
          <h2 class="text-sm font-bold text-gray-800 group-hover:text-purple-600">Contacts de Notification</h2>
        </div>
        <p class="text-xs text-gray-500">
          Configurez les emails et numeros WhatsApp qui recevront les notifications par role.
        </p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
// Admin Settings — Hub de navigation
</script>
