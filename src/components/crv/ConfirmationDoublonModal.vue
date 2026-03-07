<template>
  <div v-if="visible" class="modal-overlay" @click.self="cancel">
    <div class="modal-container">
      <!-- Etape 1 : Avertissement doublon -->
      <div v-if="step === 1" class="modal-content">
        <div class="modal-icon warning-icon">&#9888;&#65039;</div>
        <h2 class="modal-title">CRV doublon detecte</h2>
        <p class="modal-message">
          Un CRV existe deja pour ce vol sur cette escale.
        </p>
        <div class="doublon-info">
          <div class="info-row">
            <span class="info-label">CRV existant</span>
            <span class="info-value">{{ numeroCRV }}</span>
          </div>
        </div>
        <p class="modal-question">Voulez-vous continuer et creer un doublon ?</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="cancel">Annuler</button>
          <button class="btn btn-warning" @click="step = 2">Continuer</button>
        </div>
      </div>

      <!-- Etape 2 : Confirmation finale -->
      <div v-if="step === 2" class="modal-content">
        <div class="modal-icon danger-icon">&#128680;</div>
        <h2 class="modal-title">Confirmation requise</h2>
        <p class="modal-message">
          Confirmez-vous la creation d'un doublon ?
          <strong>Cette action est tracee.</strong>
        </p>
        <div class="doublon-info alert">
          <p>Le CRV cree sera marque comme doublon (<code>crvDoublon: true</code>).</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="cancel">Annuler</button>
          <button class="btn btn-danger" @click="confirm">Confirmer la creation</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  crvExistantId: { type: String, default: '' },
  numeroCRV: { type: String, default: '' }
})

const emit = defineEmits(['confirm', 'cancel'])

const step = ref(1)

// Reset step quand la modale s'ouvre
watch(() => props.visible, (val) => {
  if (val) step.value = 1
})

function cancel() {
  step.value = 1
  emit('cancel')
}

function confirm() {
  step.value = 1
  emit('confirm')
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
  max-width: 480px;
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
  margin: 0 0 12px 0;
}

.modal-message {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.modal-question {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin: 16px 0;
}

.doublon-info {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 16px 0;
}

.doublon-info.alert {
  background: #fee2e2;
  border-color: #ef4444;
}

.doublon-info p {
  margin: 0;
  font-size: 13px;
  color: #92400e;
}

.doublon-info.alert p {
  color: #991b1b;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 13px;
  color: #92400e;
}

.info-value {
  font-size: 14px;
  font-weight: 700;
  color: #92400e;
  font-family: monospace;
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

.btn-warning {
  background: #f59e0b;
  color: #fff;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-danger {
  background: #ef4444;
  color: #fff;
}

.btn-danger:hover {
  background: #dc2626;
}

code {
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
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
