<template>
  <div class="archive-button-container">
    <!-- Bouton principal d'archivage -->
    <button
      @click="handleArchive"
      :disabled="loading || !canArchive"
      :class="[
        'archive-btn',
        { 'archived': isArchived, 'loading': loading }
      ]"
      :title="buttonTitle"
    >
      <i v-if="loading" class="fas fa-spinner fa-spin"></i>
      <i v-else-if="isArchived" class="fas fa-cloud-check"></i>
      <i v-else class="fas fa-cloud-upload-alt"></i>
      <span class="btn-text">{{ buttonLabel }}</span>
    </button>

    <!-- Lien vers Drive si archivé -->
    <a
      v-if="isArchived && archivageInfo?.driveWebViewLink"
      :href="archivageInfo.driveWebViewLink"
      target="_blank"
      rel="noopener noreferrer"
      class="drive-link"
      title="Voir dans Google Drive"
    >
      <i class="fab fa-google-drive"></i>
    </a>

    <!-- Modal de confirmation -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showConfirmModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content">
            <div class="modal-header">
              <i class="fas fa-cloud-upload-alt text-blue-400 mr-3"></i>
              <h3>Archiver dans Google Drive</h3>
            </div>

            <div class="modal-body">
              <p class="modal-text">
                {{ isArchived ? 'Ce document a déjà été archivé.' : 'Voulez-vous archiver ce document dans Google Drive ?' }}
              </p>

              <!-- Info archivage existant -->
              <div v-if="isArchived && archivageInfo" class="archive-info">
                <div class="info-item">
                  <i class="fas fa-file-pdf"></i>
                  <span>{{ archivageInfo.filename || 'Document.pdf' }}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-folder"></i>
                  <span>{{ archivageInfo.folderPath || 'Dossier' }}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-clock"></i>
                  <span>{{ formatDate(archivageInfo.archivedAt) }}</span>
                </div>
                <div v-if="archivageInfo.version" class="info-item">
                  <i class="fas fa-code-branch"></i>
                  <span>Version {{ archivageInfo.version }}</span>
                </div>
              </div>

              <p v-if="isArchived" class="rearchive-warning">
                <i class="fas fa-info-circle mr-2"></i>
                Un nouveau fichier sera créé (version {{ (archivageInfo?.version || 0) + 1 }}).
              </p>
            </div>

            <div class="modal-footer">
              <button @click="closeModal" class="btn-cancel">
                Annuler
              </button>
              <button @click="confirmArchive" class="btn-confirm" :disabled="archiving">
                <i v-if="archiving" class="fas fa-spinner fa-spin mr-2"></i>
                <i v-else class="fas fa-cloud-upload-alt mr-2"></i>
                {{ isArchived ? 'Ré-archiver' : 'Archiver' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal de succès -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccessModal">
          <div class="modal-content success-modal">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h3 class="success-title">Archivage réussi</h3>
            <p class="success-text">Le document a été archivé dans Google Drive.</p>

            <div v-if="archiveResult" class="result-info">
              <div class="info-item">
                <i class="fas fa-file-pdf"></i>
                <span>{{ archiveResult.filename }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-folder"></i>
                <span>{{ archiveResult.folderPath }}</span>
              </div>
            </div>

            <div class="modal-footer">
              <button @click="closeSuccessModal" class="btn-cancel">
                Fermer
              </button>
              <a
                v-if="archiveResult?.webViewLink"
                :href="archiveResult.webViewLink"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-drive"
              >
                <i class="fab fa-google-drive mr-2"></i>
                Voir dans Drive
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
export default {
  name: 'ArchiveButton',

  props: {
    // Type de document: 'crv' ou 'programme-vol'
    documentType: {
      type: String,
      required: true,
      validator: (value) => ['crv', 'programme-vol'].includes(value)
    },
    // ID du document
    documentId: {
      type: String,
      required: true
    },
    // Nom du document (pour affichage)
    documentName: {
      type: String,
      default: ''
    },
    // Info d'archivage existant (optionnel)
    archivageInfo: {
      type: Object,
      default: null
    },
    // Statut du document (pour vérifier si archivable)
    documentStatut: {
      type: String,
      default: null
    },
    // Afficher en mode compact
    compact: {
      type: Boolean,
      default: false
    },
    // API service à utiliser
    apiService: {
      type: Object,
      required: true
    }
  },

  emits: ['archived', 'error'],

  data() {
    return {
      loading: false,
      archiving: false,
      canArchive: true,
      showConfirmModal: false,
      showSuccessModal: false,
      archiveResult: null,
      statusChecked: false
    }
  },

  computed: {
    isArchived() {
      return !!(this.archivageInfo?.driveFileId || this.archivageInfo?.archivedAt)
    },

    buttonLabel() {
      if (this.loading) return 'Vérification...'
      if (this.compact) return ''
      if (this.isArchived) return 'Archivé'
      return 'Archiver'
    },

    buttonTitle() {
      if (!this.canArchive) return 'Archivage non disponible pour ce statut'
      if (this.isArchived) return 'Déjà archivé - Cliquer pour ré-archiver'
      return 'Archiver dans Google Drive'
    }
  },

  async mounted() {
    await this.checkArchivageStatus()
  },

  methods: {
    async checkArchivageStatus() {
      if (this.statusChecked) return

      try {
        this.loading = true
        const response = await this.apiService.getArchivageStatus(this.documentId)
        const data = response.data?.data || response.data

        this.canArchive = data.canArchive !== false
        this.statusChecked = true
      } catch (error) {
        console.error('[ArchiveButton] Erreur vérification status:', error)
        // En cas d'erreur, on permet l'archivage par défaut
        this.canArchive = true
      } finally {
        this.loading = false
      }
    },

    handleArchive() {
      if (!this.canArchive || this.loading) return
      this.showConfirmModal = true
    },

    closeModal() {
      this.showConfirmModal = false
    },

    closeSuccessModal() {
      this.showSuccessModal = false
      this.archiveResult = null
    },

    async confirmArchive() {
      try {
        this.archiving = true

        // Appeler l'API d'archivage
        const archiveMethod = this.documentType === 'crv'
          ? this.apiService.archive
          : this.apiService.archiver

        const response = await archiveMethod(this.documentId)
        const data = response.data?.data || response.data

        // Récupérer les infos d'archivage
        this.archiveResult = data.archivage || data

        // Fermer le modal de confirmation
        this.showConfirmModal = false

        // Afficher le modal de succès
        this.showSuccessModal = true

        // Émettre l'événement de succès
        this.$emit('archived', {
          documentId: this.documentId,
          archivage: this.archiveResult
        })

      } catch (error) {
        console.error('[ArchiveButton] Erreur archivage:', error)

        const message = error.response?.data?.message || 'Erreur lors de l\'archivage'
        this.$toast?.error(message)

        this.$emit('error', {
          documentId: this.documentId,
          error: message
        })

        this.showConfirmModal = false
      } finally {
        this.archiving = false
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return 'Date inconnue'
      const date = new Date(dateStr)
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.archive-button-container {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.archive-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #4b5563;
  background-color: #374151;
  color: #e5e7eb;
}

.archive-btn:hover:not(:disabled) {
  background-color: #4b5563;
  border-color: #6b7280;
}

.archive-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.archive-btn.archived {
  background-color: #065f46;
  border-color: #059669;
  color: #6ee7b7;
}

.archive-btn.archived:hover:not(:disabled) {
  background-color: #047857;
}

.archive-btn.loading {
  pointer-events: none;
}

.drive-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: #1e40af;
  color: white;
  transition: all 0.2s;
}

.drive-link:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
}

.modal-content {
  background-color: #1f2937;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid #374151;
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #374151;
  background-color: #111827;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  color: #e5e7eb;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-text {
  color: #d1d5db;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.archive-info {
  background-color: #111827;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #9ca3af;
  font-size: 0.875rem;
}

.info-item i {
  width: 16px;
  color: #6b7280;
}

.info-item span {
  color: #e5e7eb;
}

.rearchive-warning {
  color: #fbbf24;
  font-size: 0.875rem;
  background-color: rgba(251, 191, 36, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #374151;
  background-color: #111827;
  border-radius: 0 0 12px 12px;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  background-color: #374151;
  color: #e5e7eb;
  border: 1px solid #4b5563;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: #4b5563;
}

.btn-confirm {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  background-color: #2563eb;
  color: white;
  border: none;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-drive {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: #1e40af;
  color: white;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-drive:hover {
  background-color: #1d4ed8;
}

/* Success modal */
.success-modal {
  text-align: center;
}

.success-modal .modal-body {
  padding: 2rem 1.5rem;
}

.success-icon {
  margin-bottom: 1rem;
}

.success-icon i {
  font-size: 4rem;
  color: #10b981;
}

.success-title {
  color: #e5e7eb;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.success-text {
  color: #9ca3af;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.success-modal .result-info {
  background-color: #111827;
  border-radius: 8px;
  padding: 1rem;
  text-align: left;
}

.success-modal .modal-footer {
  justify-content: center;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-content {
    max-width: 100%;
    margin: 1rem;
  }

  .btn-text {
    display: none;
  }

  .archive-btn {
    padding: 0.5rem;
  }
}
</style>
