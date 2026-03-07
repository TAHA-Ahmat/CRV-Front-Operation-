<template>
  <!-- COPIÉ DEPUIS STOCK THS ET ADAPTÉ POUR CRV -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="loading-overlay"
        @click.self="!persistent && $emit('close')"
      >
        <div class="loading-content">
          <!-- Logo CRV -->
          <div class="logo-container">
            <div class="logo-text">CRV</div>
            <div class="spinner-wrapper">
              <div class="spinner"></div>
            </div>
          </div>

          <!-- Message -->
          <p class="loading-message">{{ message }}</p>

          <!-- Progress bar optionnelle -->
          <div v-if="progress !== null" class="progress-container">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ progress }}%</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'LoadingOverlay',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'Chargement en cours...'
    },
    progress: {
      type: Number,
      default: null,
      validator: value => value === null || (value >= 0 && value <= 100)
    },
    persistent: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close']
};
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-content {
  background-color: #1f2937;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  text-align: center;
  min-width: 280px;
  max-width: 400px;
  border: 1px solid #374151;
}

.logo-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.logo-text {
  font-size: 2.5rem;
  font-weight: bold;
  /* Couleurs CRV (bleu au lieu de purple) */
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  letter-spacing: 2px;
}

.spinner-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #374151;
  border-top-color: #2563eb; /* Couleur CRV */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-message {
  color: #e5e7eb;
  font-size: 1rem;
  margin: 1rem 0;
  line-height: 1.5;
}

.progress-container {
  margin-top: 1.5rem;
}

.progress-bar {
  background-color: #374151;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  /* Gradient bleu CRV */
  background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%);
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .loading-content {
    margin: 1rem;
    min-width: unset;
    width: calc(100% - 2rem);
  }
}
</style>
