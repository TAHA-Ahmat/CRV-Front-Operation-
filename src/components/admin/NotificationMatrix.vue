<template>
  <div class="notification-matrix">
    <!-- Filtres -->
    <div class="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Domaine</label>
          <select v-model="localFilters.domain" @change="emitFilters"
                  class="w-full rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="">Tous les domaines</option>
            <option v-for="d in domains" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Priorité</label>
          <select v-model="localFilters.priority" @change="emitFilters"
                  class="w-full rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="">Toutes</option>
            <option value="CRITIQUE">CRITIQUE</option>
            <option value="HAUTE">HAUTE</option>
            <option value="NORMALE">NORMALE</option>
            <option value="BASSE">BASSE</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Rôle</label>
          <select v-model="localFilters.role" @change="emitFilters"
                  class="w-full rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="">Tous les rôles</option>
            <option v-for="r in roles" :key="r" :value="r">{{ roleLabels[r] || r }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">État</label>
          <select v-model="localFilters.enabled" @change="emitFilters"
                  class="w-full rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="">Tous</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Matrice par domaine -->
    <div v-for="(events, domain) in groupedRules" :key="domain" class="mb-6">
      <!-- Header domaine -->
      <div class="flex items-center justify-between bg-blue-50 rounded-t-lg px-4 py-2 border border-blue-200">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-blue-800">{{ domain }}</span>
          <span class="text-xs text-blue-500">({{ Object.keys(events).length }} événements)</span>
        </div>
        <div class="flex items-center gap-2">
          <button @click="$emit('toggleDomain', domain, true)"
                  class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  :disabled="saving">
            Tout activer
          </button>
          <button @click="$emit('toggleDomain', domain, false)"
                  class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  :disabled="saving">
            Tout désactiver
          </button>
        </div>
      </div>

      <!-- Table des événements -->
      <div class="overflow-x-auto border border-t-0 border-blue-200 rounded-b-lg">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left px-3 py-2 text-xs font-medium text-gray-500 w-56">Événement</th>
              <th class="text-center px-2 py-2 text-xs font-medium text-gray-500" v-for="r in roles" :key="r">
                {{ roleLabelsShort[r] || r }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rules, eventName) in events" :key="eventName"
                class="border-t border-gray-100 hover:bg-gray-50">
              <!-- Nom de l'événement -->
              <td class="px-3 py-2">
                <div class="flex items-center gap-1">
                  <span :class="priorityBadge(rules[0]?.eventPriority)" class="inline-block w-2 h-2 rounded-full"></span>
                  <span class="text-xs font-medium text-gray-700 truncate" :title="rules[0]?.eventDescription">
                    {{ eventName }}
                  </span>
                </div>
              </td>
              <!-- Cellules par rôle -->
              <td v-for="r in roles" :key="r" class="text-center px-1 py-1">
                <RuleCell
                  :rule="getRuleForRole(rules, r)"
                  :saving="saving"
                  @toggle="(ruleId, field, value) => $emit('updateRule', ruleId, field, value)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- État vide -->
    <div v-if="Object.keys(groupedRules).length === 0" class="text-center py-12 text-gray-500">
      <p class="text-lg">Aucune règle trouvée</p>
      <p class="text-sm mt-1">Modifiez les filtres ou réinitialisez les règles par défaut</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import RuleCell from './RuleCell.vue'

const props = defineProps({
  groupedRules: { type: Object, required: true },
  saving: { type: Boolean, default: false },
  domains: { type: Array, default: () => [] },
  roles: { type: Array, default: () => ['AGENT_ESCALE', 'CHEF_EQUIPE', 'SUPERVISEUR', 'MANAGER', 'QUALITE', 'ADMIN'] }
})

const emit = defineEmits(['updateRule', 'toggleDomain', 'filtersChanged'])

const roleLabels = {
  AGENT_ESCALE: 'Agent d\'escale',
  CHEF_EQUIPE: 'Chef d\'équipe',
  SUPERVISEUR: 'Superviseur',
  MANAGER: 'Manager',
  QUALITE: 'Qualité',
  ADMIN: 'Administrateur'
}

const roleLabelsShort = {
  AGENT_ESCALE: 'Agent',
  CHEF_EQUIPE: 'Chef Éq.',
  SUPERVISEUR: 'Superv.',
  MANAGER: 'Manager',
  QUALITE: 'Qualité',
  ADMIN: 'Admin'
}

const localFilters = ref({
  domain: '',
  priority: '',
  role: '',
  enabled: ''
})

function emitFilters() {
  emit('filtersChanged', { ...localFilters.value })
}

function getRuleForRole(rules, role) {
  return rules.find(r => r.role === role) || null
}

function priorityBadge(priority) {
  const map = {
    CRITIQUE: 'bg-red-500',
    HAUTE: 'bg-orange-400',
    NORMALE: 'bg-blue-400',
    BASSE: 'bg-gray-300'
  }
  return map[priority] || 'bg-gray-300'
}
</script>
