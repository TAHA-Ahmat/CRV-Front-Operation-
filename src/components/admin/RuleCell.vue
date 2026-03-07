<template>
  <div v-if="rule" class="flex flex-col items-center gap-0.5">
    <!-- Toggle enabled -->
    <button
      @click="toggleEnabled"
      :disabled="saving"
      :class="[
        'w-6 h-6 rounded text-xs font-bold transition-colors',
        rule.enabled
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      ]"
      :title="rule.enabled ? 'Actif — cliquer pour désactiver' : 'Inactif — cliquer pour activer'"
    >
      {{ rule.enabled ? '✓' : '✗' }}
    </button>
    <!-- Canaux (icônes) -->
    <div v-if="rule.enabled" class="flex gap-0.5">
      <button
        @click="toggleChannel('inApp')"
        :disabled="saving"
        :class="['w-4 h-4 rounded text-[9px] leading-none', rule.channels?.inApp ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400']"
        title="In-App"
      >I</button>
      <button
        @click="toggleChannel('email')"
        :disabled="saving"
        :class="['w-4 h-4 rounded text-[9px] leading-none', rule.channels?.email ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-400']"
        title="Email"
      >E</button>
      <button
        @click="toggleChannel('whatsapp')"
        :disabled="saving"
        :class="['w-4 h-4 rounded text-[9px] leading-none', rule.channels?.whatsapp ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400']"
        title="WhatsApp"
      >W</button>
    </div>
  </div>
  <div v-else class="text-gray-300 text-xs">—</div>
</template>

<script setup>
const props = defineProps({
  rule: { type: Object, default: null },
  saving: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle'])

function toggleEnabled() {
  if (!props.rule) return
  emit('toggle', props.rule._id, 'enabled', !props.rule.enabled)
}

function toggleChannel(channel) {
  if (!props.rule) return
  const channels = { ...props.rule.channels }
  channels[channel] = !channels[channel]
  emit('toggle', props.rule._id, 'channels', channels)
}
</script>
