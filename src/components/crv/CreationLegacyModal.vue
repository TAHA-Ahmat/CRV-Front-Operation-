<template>
  <div v-if="visible" class="modal-overlay" @click.self="cancel">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-icon">&#9888;&#65039;</div>
        <h2 class="modal-title">Creation exceptionnelle</h2>

        <div class="legacy-warning">
          <strong>Mode exceptionnel</strong>
          <p>
            Les donnees vol seront generees automatiquement par le backend.
            Utilisez ce mode uniquement si aucun bulletin ni vol existant ne correspond.
          </p>
        </div>

        <!-- Type d'operation -->
        <div class="form-group">
          <label>Type d'operation</label>
          <select v-model="form.type">
            <option value="arrivee">Arrivee</option>
            <option value="depart">Depart</option>
            <option value="turnaround">Turn Around</option>
          </select>
        </div>

        <!-- Date -->
        <div class="form-group">
          <label>Date</label>
          <input type="date" v-model="form.date" />
        </div>

        <!-- Escale -->
        <div class="form-group">
          <label>Escale</label>
          <input
            type="text"
            v-model="form.escale"
            placeholder="TLS"
            maxlength="4"
            @input="form.escale = form.escale.toUpperCase()"
          />
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="cancel">Annuler</button>
          <button class="btn btn-primary" @click="submit" :disabled="creating">
            <span v-if="creating">Creation...</span>
            <span v-else>Creer le CRV</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  creating: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  type: 'depart',
  date: new Date().toISOString().split('T')[0],
  escale: ''
})

// Reset form quand la modale s'ouvre
watch(() => props.visible, (val) => {
  if (val) {
    form.type = 'depart'
    form.date = new Date().toISOString().split('T')[0]
    form.escale = ''
  }
})

function cancel() {
  emit('cancel')
}

function submit() {
  const payload = {
    type: form.type
  }
  // N'envoyer date et escale que si renseignes
  if (form.date) payload.date = form.date
  if (form.escale) payload.escale = form.escale

  emit('submit', payload)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: var(--bg-card, #fff);
  border-radius: 16px;
  padding: 32px;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content {
  text-align: center;
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
  margin: 0 0 16px 0;
}

.legacy-warning {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  text-align: left;
}

.legacy-warning strong {
  display: block;
  color: #92400e;
  font-size: 14px;
  margin-bottom: 4px;
}

.legacy-warning p {
  margin: 0;
  font-size: 13px;
  color: #92400e;
  line-height: 1.4;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  text-align: left;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid var(--border-input, #d1d5db);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-primary, #1f2937);
  background: var(--bg-input, #fff);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: var(--bg-table-header, #f3f4f6);
  color: var(--text-primary, #374151);
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .modal-container {
    padding: 24px 20px;
    max-width: 95%;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
