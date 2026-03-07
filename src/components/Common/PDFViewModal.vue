<template>
  <!-- COPIÉ DEPUIS STOCK THS SANS MODIFICATION (COMPOSANT GÉNÉRIQUE) -->
  <Teleport to="body">
    <Transition name="slide">
      <div v-if="visible" class="pdf-modal-overlay" @click.self="close">
        <div class="pdf-modal-container">
          <!-- Header -->
          <div class="pdf-modal-header">
            <div class="header-left">
              <i class="fas fa-file-pdf text-blue-400 mr-3"></i>
              <h3 class="header-title">{{ title }}</h3>
            </div>
            <div class="header-actions">
              <button
                @click="toggleFullscreen"
                class="action-btn"
                title="Plein écran"
              >
                <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
              </button>
              <button
                @click="downloadPDF"
                class="action-btn"
                title="Télécharger"
              >
                <i class="fas fa-download"></i>
              </button>
              <button
                @click="close"
                class="action-btn close-btn"
                title="Fermer"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- PDF Content -->
          <div class="pdf-modal-body" ref="pdfContainer">
            <!-- Loading state -->
            <div v-if="loading" class="pdf-loading">
              <LoadingOverlay
                :visible="true"
                :message="'Chargement du PDF...'"
                :persistent="true"
              />
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="pdf-error">
              <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
              <p class="text-lg text-gray-300">Erreur lors du chargement du PDF</p>
              <p class="text-sm text-gray-400 mt-2">{{ error }}</p>
              <button @click="retry" class="retry-btn mt-4">
                <i class="fas fa-redo mr-2"></i>
                Réessayer
              </button>
            </div>

            <!-- PDF iframe -->
            <iframe
              v-else
              :src="pdfUrl"
              class="pdf-iframe"
              @load="onPDFLoad"
              @error="onPDFError"
            ></iframe>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import LoadingOverlay from './LoadingOverlay.vue';

export default {
  name: 'PDFViewModal',
  components: {
    LoadingOverlay
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    pdfUrl: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: 'Document PDF'
    },
    fileId: {
      type: String,
      default: null
    },
    fileName: {
      type: String,
      default: null
    }
  },
  emits: ['close', 'download'],
  data() {
    return {
      loading: false,
      error: null,
      isFullscreen: false,
      loadingTimeout: null
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        console.log('[PDFModal] Modal ouvert avec pdfUrl:', this.pdfUrl);
        // NE PAS mettre loading à true si on a déjà une blob URL
        if (this.pdfUrl && this.pdfUrl.startsWith('blob:')) {
          console.log('[PDFModal] Blob URL détectée, pas de loading');
          this.loading = false;
        } else {
          this.loading = true;
        }
        this.error = null;
        document.body.style.overflow = 'hidden';
        this.startLoadingTimeout();
      } else {
        console.log('[PDFModal] Modal fermé');
        document.body.style.overflow = '';
        this.clearLoadingTimeout();
        if (this.isFullscreen) {
          this.exitFullscreen();
        }
      }
    },
    pdfUrl(newVal) {
      console.log('[PDFModal] pdfUrl changé:', newVal);
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },

    downloadPDF() {
      this.$emit('download', {
        fileId: this.fileId,
        fileName: this.fileName
      });
    },

    toggleFullscreen() {
      if (!this.isFullscreen) {
        this.enterFullscreen();
      } else {
        this.exitFullscreen();
      }
    },

    async enterFullscreen() {
      try {
        const elem = this.$refs.pdfContainer;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
        this.isFullscreen = true;
      } catch (err) {
        console.error('Erreur plein écran:', err);
      }
    },

    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      this.isFullscreen = false;
    },

    onPDFLoad() {
      console.log('[PDFModal] PDF chargé avec succès');
      this.loading = false;
      this.error = null;
      this.clearLoadingTimeout();
    },

    onPDFError(event) {
      console.error('[PDFModal] Erreur chargement PDF:', event);
      this.loading = false;
      this.error = 'Impossible de charger le PDF. Vérifiez votre connexion.';
      this.clearLoadingTimeout();
    },

    startLoadingTimeout() {
      this.clearLoadingTimeout();
      console.log('[PDFModal] Démarrage timeout de 15s');
      this.loadingTimeout = setTimeout(() => {
        if (this.loading) {
          console.warn('[PDFModal] Timeout atteint - PDF non chargé');
          this.loading = false;
          this.error = 'Le chargement du PDF a pris trop de temps. Vérifiez votre connexion et réessayez.';
        }
      }, 15000); // 15 secondes
    },

    clearLoadingTimeout() {
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout);
        this.loadingTimeout = null;
        console.log('[PDFModal] Timeout nettoyé');
      }
    },

    retry() {
      console.log('[PDFModal] Retry demandé');
      this.loading = true;
      this.error = null;
      this.startLoadingTimeout();

      // Force reload de l'iframe
      const iframe = this.$el.querySelector('.pdf-iframe');
      if (iframe) {
        // Forcer un nouveau chargement avec timestamp pour éviter le cache
        const originalSrc = this.pdfUrl;
        const separator = originalSrc.includes('?') ? '&' : '?';
        iframe.src = `${originalSrc}${separator}_t=${Date.now()}`;
      }
    }
  },
  beforeUnmount() {
    document.body.style.overflow = '';
    this.clearLoadingTimeout();

    // Nettoyer les blob URLs pour éviter les fuites mémoire
    if (this.pdfUrl && this.pdfUrl.startsWith('blob:')) {
      console.log('[PDFModal] Nettoyage blob URL:', this.pdfUrl);
      window.URL.revokeObjectURL(this.pdfUrl);
    }

    if (this.isFullscreen) {
      this.exitFullscreen();
    }
  }
};
</script>

<style scoped>
.pdf-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.pdf-modal-container {
  background-color: #1f2937;
  border-radius: 12px;
  width: 90%;
  height: 90%;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  border: 1px solid #374151;
}

.pdf-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #374151;
  background-color: #111827;
  border-radius: 12px 12px 0 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  color: #e5e7eb;
  font-size: 1.25rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background-color: #374151;
  color: #e5e7eb;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.action-btn:hover {
  background-color: #4b5563;
  transform: translateY(-1px);
}

.close-btn:hover {
  background-color: #ef4444;
  color: white;
}

.pdf-modal-body {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #374151;
  border-radius: 0 0 12px 12px;
}

.pdf-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1f2937;
}

.pdf-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.retry-btn {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background-color: #1d4ed8;
}

.pdf-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  background-color: white;
  display: block;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.slide-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .pdf-modal-container {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .pdf-modal-header {
    border-radius: 0;
  }

  .header-title {
    font-size: 1rem;
  }

  .action-btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
  }
}

/* Fullscreen styles */
:fullscreen .pdf-modal-body {
  border-radius: 0;
}
</style>
