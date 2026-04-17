<template>
  <transition name="cr-fade">
    <div class="cr-overlay" @click.self="close" role="dialog" aria-modal="true" aria-labelledby="cr-title">
      <div class="cr-modal">
        <header class="cr-head">
          <div class="cr-head-left">
            <span class="cr-icon" aria-hidden="true">⚠</span>
            <h3 id="cr-title" class="cr-title">Cause du retard</h3>
          </div>
          <button type="button" class="cr-close" @click="close" aria-label="Fermer">×</button>
        </header>

        <div class="cr-body">
          <div class="cr-context">
            <span class="cr-ctx-label">Tâche concernée</span>
            <span class="cr-ctx-value">{{ taskLabel }}</span>
            <span v-if="phaseCode" class="cr-ctx-code">{{ phaseCode }}</span>
          </div>

          <div class="cr-field">
            <label for="cr-cause" class="cr-label">Cause principale *</label>
            <select id="cr-cause" v-model="cause" class="cr-select" :disabled="saving">
              <option value="">Sélectionner</option>
              <option v-for="opt in CAUSES" :key="opt.value" :value="opt.value">
                {{ opt.icon }} {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="cr-field">
            <label for="cr-detail" class="cr-label">Détail</label>
            <textarea
              id="cr-detail"
              v-model="detail"
              class="cr-textarea"
              rows="4"
              placeholder="Décrivez brièvement les faits (ex: pluie forte 10 min avant calage, tapis 3 indisponible, etc.)"
              :disabled="saving"
            ></textarea>
          </div>

          <p v-if="error" class="cr-error" role="alert">{{ error }}</p>
        </div>

        <footer class="cr-foot">
          <button type="button" class="cr-btn cr-btn-secondary" @click="close" :disabled="saving">
            Annuler
          </button>
          <button
            type="button"
            class="cr-btn cr-btn-primary"
            :disabled="!canSubmit || saving"
            @click="submit"
          >
            {{ saving ? 'Enregistrement…' : 'Confirmer' }}
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup>
/**
 * SLACauseRetardModal — Saisie d'une cause de retard SLA (UX-5).
 *
 * Envoie une observation catégorie SLA au backend :
 *   POST /api/crv/:id/observations
 *   { categorie: 'SLA', contenu, phaseConcernee, visibilite: 'INTERNE' }
 *
 * Props :
 * - crvId : id du CRV
 * - phase : objet ChronologiePhase (pour libellé + phaseConcernee)
 *
 * Events :
 * - close : fermeture du modal
 * - saved : observation enregistrée (payload serveur) → parent peut afficher toast
 */
import { computed, ref } from 'vue'
import { crvAPI } from '@/services/api'
import { useGlobalToast } from '@/composables/useGlobalToast'

const props = defineProps({
  crvId: { type: String, required: true },
  phase: { type: Object, required: true }
})

const emit = defineEmits(['close', 'saved'])

const CAUSES = [
  { value: 'METEO',               icon: '🌧', label: 'Météo' },
  { value: 'MATERIEL_INDISPONIBLE', icon: '🔧', label: 'Matériel indisponible' },
  { value: 'PERSONNEL_ABSENT',    icon: '👤', label: 'Personnel absent' },
  { value: 'ATTENTE_PASSAGERS',   icon: '🧍', label: 'Attente passagers' },
  { value: 'SECURITE',            icon: '🛡', label: 'Sécurité' },
  { value: 'AUTRE',               icon: '📝', label: 'Autre' }
]

const cause = ref('')
const detail = ref('')
const saving = ref(false)
const error = ref('')

const toast = useGlobalToast()

const taskLabel = computed(() => {
  return props.phase?.phase?.libelle || props.phase?.libelle || props.phase?.phase?.code || 'Tâche SLA'
})

const phaseCode = computed(() => {
  return props.phase?.phase?.code || props.phase?.code || null
})

const canSubmit = computed(() => !!cause.value)

async function submit() {
  if (!canSubmit.value) return
  saving.value = true
  error.value = ''
  try {
    const contenu = formatContenu()
    const payload = {
      categorie: 'SLA',
      contenu,
      visibilite: 'INTERNE'
    }
    if (phaseCode.value) payload.phaseConcernee = phaseCode.value

    const res = await crvAPI.addObservation(props.crvId, payload)
    const data = res?.data?.data || res?.data || {}
    toast.success('Cause enregistrée, traçabilité qualité OK')
    emit('saved', data)
    close()
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Erreur lors de l\'enregistrement'
    error.value = msg
    toast.error(msg)
  } finally {
    saving.value = false
  }
}

function formatContenu() {
  const causeLabel = CAUSES.find(c => c.value === cause.value)?.label || cause.value
  const lines = [
    `[Retard SLA] Cause : ${causeLabel}`,
    `Tâche : ${taskLabel.value}${phaseCode.value ? ' (' + phaseCode.value + ')' : ''}`
  ]
  if (detail.value?.trim()) {
    lines.push('Détail : ' + detail.value.trim())
  }
  return lines.join('\n')
}

function close() {
  if (saving.value) return
  emit('close')
}
</script>

<style scoped>
.cr-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 9100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.cr-modal {
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #111827);
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  width: min(100%, 520px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: cr-pop 280ms ease-out;
}

@keyframes cr-pop {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.cr-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  background: rgba(239, 68, 68, 0.06);
}

.cr-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cr-icon {
  font-size: 22px;
  color: #dc2626;
  animation: cr-wiggle 1.6s ease-in-out infinite;
}

@keyframes cr-wiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.cr-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.cr-close {
  background: none;
  border: none;
  font-size: 22px;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  line-height: 1;
  padding: 0 6px;
}
.cr-close:hover { color: var(--text-primary, #111827); }

.cr-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cr-context {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  background: var(--bg-body, #f9fafb);
  border-radius: 8px;
  border: 1px solid var(--border-color, #e5e7eb);
}

.cr-ctx-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-secondary, #6b7280);
  font-weight: 600;
}

.cr-ctx-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.cr-ctx-code {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-tertiary, #9ca3af);
}

.cr-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cr-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.cr-select, .cr-textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 7px;
  background: var(--bg-input, #ffffff);
  color: var(--text-primary, #111827);
  font-size: 14px;
  font-family: inherit;
}

.cr-select:focus, .cr-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
}

.cr-textarea {
  resize: vertical;
  min-height: 80px;
}

.cr-error {
  color: #dc2626;
  font-size: 12px;
  margin: 0;
}

.cr-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-body, #f9fafb);
}

.cr-btn {
  padding: 9px 16px;
  border: 1px solid transparent;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cr-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.cr-btn-secondary {
  background: white;
  color: var(--text-primary, #111827);
  border-color: var(--border-color, #d1d5db);
}
.cr-btn-secondary:hover:not(:disabled) {
  background: var(--bg-card-hover, #f3f4f6);
}

.cr-btn-primary {
  background: #dc2626;
  color: white;
}
.cr-btn-primary:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
}

.cr-fade-enter-active, .cr-fade-leave-active { transition: opacity 200ms ease; }
.cr-fade-enter-from, .cr-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .cr-modal { animation: none !important; }
  .cr-icon { animation: none !important; }
  .cr-btn-primary:hover { transform: none !important; }
}
</style>
