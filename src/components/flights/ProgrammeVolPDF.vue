<template>
  <div class="programme-vol-pdf">
    <!-- Boutons de generation PDF -->
    <div class="pdf-actions">
      <button
        @click="previewPDF"
        :disabled="loading"
        class="btn-preview"
        title="Previsualiser le PDF"
      >
        <i class="fas fa-eye mr-2"></i>
        Previsualiser
      </button>

      <button
        @click="downloadPDF"
        :disabled="loading"
        class="btn-download"
        title="Telecharger le PDF"
      >
        <i class="fas fa-download mr-2"></i>
        Telecharger PDF
      </button>
    </div>

    <!-- Apercu des donnees (optionnel) -->
    <div v-if="showPreviewData && previewData" class="preview-data">
      <h4 class="preview-title">
        <i class="fas fa-plane mr-2"></i>
        {{ previewData.programme.nom }}
      </h4>
      <div class="preview-stats">
        <span class="stat">
          <i class="fas fa-calendar"></i>
          {{ formatDate(previewData.programme.dateDebut) }} - {{ formatDate(previewData.programme.dateFin) }}
        </span>
        <span class="stat">
          <i class="fas fa-plane-departure"></i>
          {{ previewData.programme.nombreVols }} vols
        </span>
        <span class="stat">
          <i class="fas fa-building"></i>
          {{ previewData.programme.compagnies?.join(', ') || '-' }}
        </span>
      </div>

      <!-- Resume par jour -->
      <div class="jours-resume">
        <div
          v-for="(vols, jour) in previewData.volsParJour"
          :key="jour"
          class="jour-item"
          :class="{ 'has-vols': vols.length > 0 }"
        >
          <span class="jour-nom">{{ jour.slice(0, 3) }}</span>
          <span class="jour-count">{{ vols.length }}</span>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span class="loading-text">{{ loadingMessage }}</span>
    </div>

    <!-- Modal PDF -->
    <PDFViewModal
      :visible="showPDFModal"
      :pdfUrl="pdfBlobUrl"
      :title="`Programme ${programmeNom}`"
      @close="closePDFModal"
      @download="downloadPDF"
    />
  </div>
</template>

<script>
import { programmesVolAPI } from '@/services/api'
import PDFViewModal from '@/components/Common/PDFViewModal.vue'

export default {
  name: 'ProgrammeVolPDF',

  components: {
    PDFViewModal
  },

  props: {
    programmeId: {
      type: String,
      required: true
    },
    programmeNom: {
      type: String,
      default: 'Programme de Vols'
    },
    showPreviewData: {
      type: Boolean,
      default: false
    }
  },

  emits: ['success', 'error'],

  data() {
    return {
      loading: false,
      loadingMessage: '',
      previewData: null,
      showPDFModal: false,
      pdfBlobUrl: null
    }
  },

  mounted() {
    if (this.showPreviewData) {
      this.loadPreviewData()
    }
  },

  beforeUnmount() {
    // Nettoyer les blob URLs
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl)
    }
  },

  methods: {
    /**
     * Charger les donnees d'apercu
     */
    async loadPreviewData() {
      try {
        this.loading = true
        this.loadingMessage = 'Chargement des donnees...'

        const response = await programmesVolAPI.exportPDF(this.programmeId)
        this.previewData = response.data.data || response.data

      } catch (error) {
        console.error('[ProgrammeVolPDF] Erreur chargement apercu:', error)
        this.$emit('error', 'Erreur lors du chargement des donnees')
      } finally {
        this.loading = false
      }
    },

    /**
     * Previsualiser le PDF dans un modal
     */
    async previewPDF() {
      try {
        this.loading = true
        this.loadingMessage = 'Generation du PDF...'

        // Utiliser base64 pour la preview
        const response = await programmesVolAPI.getPDFBase64(this.programmeId)
        const data = response.data.data || response.data
        const { base64, mimeType } = data

        // Convertir base64 en blob URL
        const byteCharacters = atob(base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: mimeType || 'application/pdf' })

        // Revoquer l'ancienne URL si existante
        if (this.pdfBlobUrl) {
          URL.revokeObjectURL(this.pdfBlobUrl)
        }

        this.pdfBlobUrl = URL.createObjectURL(blob)
        this.showPDFModal = true

        this.$emit('success', 'PDF genere avec succes')

      } catch (error) {
        console.error('[ProgrammeVolPDF] Erreur preview:', error)
        this.$emit('error', 'Erreur lors de la generation du PDF')
      } finally {
        this.loading = false
      }
    },

    /**
     * Telecharger le PDF directement
     */
    async downloadPDF() {
      try {
        this.loading = true
        this.loadingMessage = 'Telechargement en cours...'

        const response = await programmesVolAPI.telechargerPDF(this.programmeId)

        // Creer un lien de telechargement
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = `PROGRAMME_VOLS_${this.programmeNom.replace(/\s+/g, '_')}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)

        this.$emit('success', 'PDF telecharge avec succes')

      } catch (error) {
        console.error('[ProgrammeVolPDF] Erreur telechargement:', error)
        this.$emit('error', 'Erreur lors du telechargement')
      } finally {
        this.loading = false
      }
    },

    /**
     * Fermer le modal PDF
     */
    closePDFModal() {
      this.showPDFModal = false
    },

    /**
     * Formater une date
     */
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.programme-vol-pdf {
  position: relative;
}

.pdf-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-preview,
.btn-download {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-preview {
  background-color: #374151;
  color: #e5e7eb;
  border: 1px solid #4b5563;
}

.btn-preview:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-download {
  background-color: #2563eb;
  color: white;
}

.btn-download:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-preview:disabled,
.btn-download:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Preview data */
.preview-data {
  background-color: #1f2937;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
}

.preview-title {
  color: #60a5fa;
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
}

.preview-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.stat i {
  color: #6b7280;
}

/* Jours resume */
.jours-resume {
  display: flex;
  gap: 0.5rem;
}

.jour-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  background-color: #374151;
  min-width: 50px;
}

.jour-item.has-vols {
  background-color: #1e40af;
}

.jour-nom {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
}

.jour-item.has-vols .jour-nom {
  color: #93c5fd;
}

.jour-count {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e5e7eb;
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 10;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #4b5563;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #e5e7eb;
  font-size: 0.875rem;
  margin-top: 0.75rem;
}

/* Responsive */
@media (max-width: 640px) {
  .pdf-actions {
    flex-direction: column;
  }

  .jours-resume {
    flex-wrap: wrap;
  }
}

/* Helper classes */
.mr-2 {
  margin-right: 0.5rem;
}
</style>
