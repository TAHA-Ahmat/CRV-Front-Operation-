<template>
  <div class="container mx-auto px-4 py-6 max-w-[1400px]">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Matrice de Notifications</h1>
        <p class="text-sm text-gray-500 mt-1">
          82 événements × 6 rôles × 3 canaux — Configuration centralisée
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Stats rapides -->
        <div v-if="store.stats" class="hidden md:flex items-center gap-4 text-xs text-gray-500">
          <span>{{ store.stats.total }} règles</span>
          <span class="text-green-600 font-medium">{{ store.stats.enabled }} actives</span>
          <span>InApp: {{ store.stats.channels?.inApp || 0 }}</span>
          <span>Email: {{ store.stats.channels?.email || 0 }}</span>
        </div>
        <!-- Actions -->
        <button
          @click="refreshData"
          :disabled="store.loading"
          class="flex items-center gap-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <span :class="{ 'animate-spin': store.loading }">&#8635;</span>
          Actualiser
        </button>
        <button
          @click="showResetModal = true"
          :disabled="store.saving"
          class="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100"
        >
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && store.rules.length === 0" class="text-center py-20">
      <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-3 text-gray-500">Chargement de la matrice...</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <p class="text-red-700 text-sm">{{ store.error }}</p>
      <button @click="refreshData" class="mt-2 text-sm text-red-600 underline">Réessayer</button>
    </div>

    <!-- Matrice -->
    <NotificationMatrix
      v-else
      :grouped-rules="store.filteredGrouped"
      :saving="store.saving"
      :domains="store.domains"
      @update-rule="handleUpdateRule"
      @toggle-domain="handleToggleDomain"
      @filters-changed="handleFiltersChanged"
    />

    <!-- Légende -->
    <div class="mt-6 bg-white rounded-lg shadow-sm border p-4">
      <h3 class="text-xs font-bold text-gray-600 mb-2">Légende</h3>
      <div class="flex flex-wrap gap-4 text-xs text-gray-500">
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-red-500 inline-block"></span> CRITIQUE
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-orange-400 inline-block"></span> HAUTE
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-blue-400 inline-block"></span> NORMALE
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-gray-300 inline-block"></span> BASSE
        </div>
        <div class="border-l pl-4 flex items-center gap-1">
          <span class="w-4 h-4 rounded bg-blue-500 text-white text-[9px] inline-flex items-center justify-center">I</span> In-App
        </div>
        <div class="flex items-center gap-1">
          <span class="w-4 h-4 rounded bg-purple-500 text-white text-[9px] inline-flex items-center justify-center">E</span> Email
        </div>
        <div class="flex items-center gap-1">
          <span class="w-4 h-4 rounded bg-green-500 text-white text-[9px] inline-flex items-center justify-center">W</span> WhatsApp
        </div>
      </div>
    </div>

    <!-- Modal de réinitialisation -->
    <Teleport to="body">
      <div v-if="showResetModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
          <h2 class="text-lg font-bold text-gray-800 mb-2">Réinitialiser les règles ?</h2>
          <p class="text-sm text-gray-600 mb-4">
            Cette action supprimera toutes les modifications et restaurera les 492 règles par défaut.
            Cette action est irréversible.
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showResetModal = false"
              class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              @click="handleReset"
              :disabled="store.saving"
              class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {{ store.saving ? 'En cours...' : 'Réinitialiser' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationRulesStore } from '@/stores/notificationRulesStore'
import NotificationMatrix from '@/components/admin/NotificationMatrix.vue'

const store = useNotificationRulesStore()
const showResetModal = ref(false)

onMounted(async () => {
  await Promise.all([
    store.fetchMatrix(),
    store.fetchMetadata(),
    store.fetchStats()
  ])
})

async function refreshData() {
  await Promise.all([
    store.fetchMatrix(),
    store.fetchStats()
  ])
}

async function handleUpdateRule(ruleId, field, value) {
  try {
    if (field === 'enabled') {
      await store.updateRule(ruleId, { enabled: value })
    } else if (field === 'channels') {
      await store.updateRule(ruleId, { channels: value })
    }
  } catch (err) {
    console.error('[NotifSettings] Erreur update:', err)
  }
}

async function handleToggleDomain(domain, enabled) {
  try {
    await store.toggleDomain(domain, enabled)
  } catch (err) {
    console.error('[NotifSettings] Erreur toggle domain:', err)
  }
}

function handleFiltersChanged(filters) {
  store.setFilters(filters)
}

async function handleReset() {
  try {
    await store.resetToDefaults()
    showResetModal.value = false
  } catch (err) {
    console.error('[NotifSettings] Erreur reset:', err)
  }
}
</script>
