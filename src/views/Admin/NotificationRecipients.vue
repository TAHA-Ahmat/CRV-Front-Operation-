<template>
  <div class="container mx-auto px-4 py-6 max-w-[1200px]">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Contacts de Notification</h1>
        <p class="text-sm text-gray-500 mt-1">
          Configurez les emails et numéros WhatsApp qui recevront les notifications par rôle
        </p>
      </div>
      <div class="flex items-center gap-3 text-xs text-gray-500">
        <span v-if="store.totalEmails > 0">{{ store.totalEmails }} emails</span>
        <span v-if="store.totalWhatsapps > 0">{{ store.totalWhatsapps }} WhatsApp</span>
        <button
          @click="store.fetchAll()"
          :disabled="store.loading"
          class="flex items-center gap-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <span :class="{ 'animate-spin': store.loading }">&#8635;</span>
          Actualiser
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && store.recipients.length === 0" class="text-center py-20">
      <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-3 text-gray-500">Chargement...</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <p class="text-red-700 text-sm">{{ store.error }}</p>
      <button @click="store.fetchAll()" class="mt-2 text-sm text-red-600 underline">Réessayer</button>
    </div>

    <!-- Grille des rôles -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="role in roles"
        :key="role"
        class="bg-white rounded-xl shadow-sm border overflow-hidden"
      >
        <!-- En-tête rôle -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b">
          <h3 class="text-sm font-bold text-blue-800">{{ roleLabels[role] }}</h3>
          <div class="text-xs text-blue-500 mt-0.5">
            {{ getRecipient(role)?.emails?.length || 0 }} email(s) ·
            {{ getRecipient(role)?.whatsapps?.length || 0 }} WhatsApp
          </div>
        </div>

        <div class="p-4 space-y-4">
          <!-- Section Email -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-purple-700 flex items-center gap-1">
                <span class="w-4 h-4 rounded bg-purple-500 text-white text-[9px] inline-flex items-center justify-center">E</span>
                Emails
              </span>
              <select
                :value="getRecipient(role)?.emailMode || 'users_only'"
                @change="updateMode(role, 'emailMode', $event.target.value)"
                class="text-[10px] rounded border-gray-300 px-1 py-0.5"
              >
                <option value="users_only">Utilisateurs seuls</option>
                <option value="contacts_only">Contacts seuls</option>
                <option value="both">Les deux</option>
              </select>
            </div>
            <!-- Liste emails -->
            <div v-if="getRecipient(role)?.emails?.length" class="space-y-1 mb-2">
              <div
                v-for="email in getRecipient(role).emails"
                :key="email._id"
                class="flex items-center justify-between bg-gray-50 rounded px-2 py-1 text-xs group"
              >
                <div class="flex items-center gap-1.5 min-w-0">
                  <button
                    @click="store.toggleEmail(role, email._id, !email.actif)"
                    :disabled="store.saving"
                    :class="email.actif ? 'text-green-600' : 'text-gray-400'"
                    class="shrink-0"
                  >
                    {{ email.actif ? '●' : '○' }}
                  </button>
                  <span class="truncate" :class="{ 'text-gray-400 line-through': !email.actif }">
                    {{ email.email }}
                  </span>
                  <span v-if="email.nom" class="text-gray-400 truncate">({{ email.nom }})</span>
                </div>
                <button
                  @click="store.removeEmail(role, email._id)"
                  :disabled="store.saving"
                  class="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 shrink-0 ml-1"
                >✕</button>
              </div>
            </div>
            <!-- Formulaire ajout email -->
            <form @submit.prevent="addEmail(role)" class="flex gap-1">
              <input
                v-model="newEmail[role]"
                type="email"
                placeholder="email@exemple.com"
                class="flex-1 rounded border-gray-300 text-xs px-2 py-1"
              />
              <button
                type="submit"
                :disabled="store.saving || !newEmail[role]"
                class="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >+</button>
            </form>
          </div>

          <!-- Séparateur -->
          <hr class="border-gray-200" />

          <!-- Section WhatsApp -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-green-700 flex items-center gap-1">
                <span class="w-4 h-4 rounded bg-green-500 text-white text-[9px] inline-flex items-center justify-center">W</span>
                WhatsApp
              </span>
              <select
                :value="getRecipient(role)?.whatsappMode || 'contacts_only'"
                @change="updateMode(role, 'whatsappMode', $event.target.value)"
                class="text-[10px] rounded border-gray-300 px-1 py-0.5"
              >
                <option value="users_only">Utilisateurs seuls</option>
                <option value="contacts_only">Contacts seuls</option>
                <option value="both">Les deux</option>
              </select>
            </div>
            <!-- Liste whatsapps -->
            <div v-if="getRecipient(role)?.whatsapps?.length" class="space-y-1 mb-2">
              <div
                v-for="wa in getRecipient(role).whatsapps"
                :key="wa._id"
                class="flex items-center justify-between bg-gray-50 rounded px-2 py-1 text-xs group"
              >
                <div class="flex items-center gap-1.5 min-w-0">
                  <button
                    @click="store.toggleWhatsapp(role, wa._id, !wa.actif)"
                    :disabled="store.saving"
                    :class="wa.actif ? 'text-green-600' : 'text-gray-400'"
                    class="shrink-0"
                  >
                    {{ wa.actif ? '●' : '○' }}
                  </button>
                  <span class="truncate" :class="{ 'text-gray-400 line-through': !wa.actif }">
                    {{ wa.telephone }}
                  </span>
                  <span v-if="wa.nom" class="text-gray-400 truncate">({{ wa.nom }})</span>
                </div>
                <button
                  @click="store.removeWhatsapp(role, wa._id)"
                  :disabled="store.saving"
                  class="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 shrink-0 ml-1"
                >✕</button>
              </div>
            </div>
            <!-- Formulaire ajout whatsapp -->
            <form @submit.prevent="addWhatsapp(role)" class="flex gap-1">
              <input
                v-model="newWhatsapp[role]"
                type="tel"
                placeholder="+235 XX XX XX XX"
                class="flex-1 rounded border-gray-300 text-xs px-2 py-1"
              />
              <button
                type="submit"
                :disabled="store.saving || !newWhatsapp[role]"
                class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >+</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Légende -->
    <div class="mt-6 bg-white rounded-lg shadow-sm border p-4">
      <h3 class="text-xs font-bold text-gray-600 mb-2">Modes de distribution</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-500">
        <div class="flex items-start gap-2">
          <span class="font-semibold text-gray-700 whitespace-nowrap">Utilisateurs seuls :</span>
          <span>Seuls les comptes utilisateurs du rôle dans le système</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="font-semibold text-gray-700 whitespace-nowrap">Contacts seuls :</span>
          <span>Seuls les contacts configurés ci-dessus</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="font-semibold text-gray-700 whitespace-nowrap">Les deux :</span>
          <span>Utilisateurs du système + contacts configurés</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useNotificationRecipientsStore } from '@/stores/notificationRecipientsStore'

const store = useNotificationRecipientsStore()

const roles = ['AGENT_ESCALE', 'CHEF_EQUIPE', 'SUPERVISEUR', 'MANAGER', 'QUALITE', 'ADMIN']

const roleLabels = {
  AGENT_ESCALE: 'Agent d\'escale',
  CHEF_EQUIPE: 'Chef d\'equipe',
  SUPERVISEUR: 'Superviseur',
  MANAGER: 'Manager',
  QUALITE: 'Qualite',
  ADMIN: 'Administrateur'
}

const newEmail = reactive({})
const newWhatsapp = reactive({})

// Initialiser les champs
roles.forEach(r => {
  newEmail[r] = ''
  newWhatsapp[r] = ''
})

onMounted(async () => {
  await store.fetchAll()
})

function getRecipient(role) {
  return store.byRole[role] || null
}

async function addEmail(role) {
  if (!newEmail[role]) return
  try {
    await store.addEmail(role, { email: newEmail[role] })
    newEmail[role] = ''
  } catch (err) {
    console.error('[Recipients] Erreur ajout email:', err)
  }
}

async function addWhatsapp(role) {
  if (!newWhatsapp[role]) return
  try {
    await store.addWhatsapp(role, { telephone: newWhatsapp[role] })
    newWhatsapp[role] = ''
  } catch (err) {
    console.error('[Recipients] Erreur ajout WhatsApp:', err)
  }
}

async function updateMode(role, field, value) {
  try {
    await store.updateMode(role, { [field]: value })
  } catch (err) {
    console.error('[Recipients] Erreur update mode:', err)
  }
}
</script>
