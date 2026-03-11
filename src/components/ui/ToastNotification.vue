<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="toast-container"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast-item"
        :class="'toast-' + t.type"
        role="alert"
      >
        <span class="toast-icon" aria-hidden="true">
          <svg v-if="t.type === 'success'" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          <svg v-else-if="t.type === 'error'" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
          <svg v-else-if="t.type === 'warning'" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
        </span>
        <span class="toast-message">{{ t.message }}</span>
        <button
          @click="dismiss(t.id)"
          class="toast-close"
          aria-label="Fermer la notification"
        >&times;</button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { useGlobalToast } from '@/composables/useGlobalToast'

const { toasts, dismiss } = useGlobalToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 72px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 420px;
  width: calc(100vw - 32px);
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  border: 1px solid transparent;
  pointer-events: auto;
  font-size: 0.875rem;
  line-height: 1.4;
}

.toast-success {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border-color: var(--color-success);
}

.toast-error {
  background-color: var(--color-error-bg);
  color: var(--color-error);
  border-color: var(--color-error);
}

.toast-warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
  border-color: var(--color-warning);
}

.toast-info {
  background-color: var(--color-info-bg);
  color: var(--color-info);
  border-color: var(--color-info);
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.toast-message {
  flex: 1;
  white-space: pre-line;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0 2px;
}

.toast-close:hover {
  opacity: 1;
}

/* Animations */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(60px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(60px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
