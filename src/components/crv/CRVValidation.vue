<template>
  <div class="crv-validation-component card">
    <div class="section-title-row">
      <h3 class="section-title">Soumission du CRV</h3>
      <!-- Badge SLA final (UX-1) — source unique : useSLA -->
      <SLABadge
        v-if="slaNiveauFinal"
        :niveau="slaNiveauFinal"
        :show-label="true"
        size="md"
      />
    </div>

    <div v-if="!validated" class="validation-form">
      <div class="form-group">
        <label class="form-label">Soumis par</label>
        <input
          v-model="localData.validateur"
          type="text"
          class="form-input"
          placeholder="Nom complet"
          @input="emitUpdate"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Fonction</label>
        <select
          v-model="localData.fonction"
          class="form-input"
          @change="emitUpdate"
        >
          <option value="">Sélectionner</option>
          <option v-for="role in fonctionsValidation" :key="role.value" :value="role.value">
            {{ role.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Commentaires finaux (optionnel)</label>
        <textarea
          v-model="localData.commentaires"
          class="form-input"
          rows="4"
          placeholder="Remarques générales sur l'opération"
          @input="emitUpdate"
        ></textarea>
      </div>

      <div class="validation-check">
        <label class="checkbox-label">
          <input
            v-model="localData.certifie"
            type="checkbox"
            @change="emitUpdate"
          />
          <span>
            Je certifie que les informations saisies dans ce CRV sont exactes et conformes aux opérations réellement effectuées.
          </span>
        </label>
      </div>

      <div class="validation-actions">
        <button
          @click="handleValidate"
          class="btn btn-success btn-large"
          type="button"
          :disabled="!canValidate || loading"
        >
          {{ loading ? 'Soumission en cours...' : 'Soumettre le CRV' }}
        </button>
        <p v-if="!canValidate && !loading" class="validation-warning">
          Veuillez remplir tous les champs requis et certifier les informations avant soumission
        </p>
      </div>
    </div>

    <div v-else class="validation-success">
      <div class="success-icon">✓</div>
      <h4>CRV Soumis</h4>
      <p class="soumission-info">En attente de validation par un superviseur</p>
      <div class="validation-info">
        <p><strong>Soumis par :</strong> {{ localData.validateur }}</p>
        <p><strong>Fonction :</strong> {{ localData.fonction }}</p>
        <p><strong>Date de soumission :</strong> {{ formatDate(localData.dateValidation) }}</p>
      </div>
      <div v-if="localData.commentaires" class="validation-comments">
        <strong>Commentaires:</strong>
        <p>{{ localData.commentaires }}</p>
      </div>

      <!-- Téléchargement PDF -->
      <div v-if="crvId" class="pdf-actions">
        <button
          @click="downloadPDF"
          class="btn btn-primary"
          type="button"
          :disabled="pdfLoading"
        >
          {{ pdfLoading ? 'Génération en cours...' : 'Télécharger le PDF' }}
        </button>
        <p v-if="pdfError" class="pdf-error">{{ pdfError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ROLE_PERSONNEL, ROLE_PERSONNEL_LABELS } from '@/config/crvEnums'
import { crvAPI } from '@/services/api'
import SLABadge from '@/components/Common/SLABadge.vue'
import { useSLA } from '@/composables/useSLA'

// Fonctions autorisées pour la validation — alignées sur ROLE_PERSONNEL backend
const fonctionsValidation = [
  { value: ROLE_PERSONNEL.CHEF_ESCALE, label: ROLE_PERSONNEL_LABELS[ROLE_PERSONNEL.CHEF_ESCALE] },
  { value: ROLE_PERSONNEL.SUPERVISEUR, label: ROLE_PERSONNEL_LABELS[ROLE_PERSONNEL.SUPERVISEUR] },
  { value: ROLE_PERSONNEL.COORDINATEUR, label: ROLE_PERSONNEL_LABELS[ROLE_PERSONNEL.COORDINATEUR] }
]

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      validateur: '',
      fonction: '',
      commentaires: '',
      certifie: false,
      dateValidation: null
    })
  },
  validated: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  crvId: {
    type: String,
    default: null
  },
  // UX-1 : CRV complet fourni par le parent pour le badge SLA final
  crv: {
    type: Object,
    default: null
  }
})

const { calculerSLACRV } = useSLA()

const slaNiveauFinal = computed(() => {
  if (!props.crv) return null
  const status = calculerSLACRV(props.crv)
  return status?.niveau || null
})

const emit = defineEmits(['update:modelValue', 'validate'])

const localData = ref({ ...props.modelValue })

watch(() => props.modelValue, (newValue) => {
  localData.value = { ...newValue }
}, { deep: true })

const canValidate = computed(() => {
  return localData.value.validateur &&
         localData.value.fonction &&
         localData.value.certifie
})

const handleValidate = () => {
  if (canValidate.value && !props.loading) {
    localData.value.dateValidation = new Date().toISOString()
    emit('validate', localData.value)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR')
}

const emitUpdate = () => {
  emit('update:modelValue', localData.value)
}

// ── PDF Download ──
const pdfLoading = ref(false)
const pdfError = ref(null)

const downloadPDF = async () => {
  if (!props.crvId) return
  pdfLoading.value = true
  pdfError.value = null

  try {
    const response = await crvAPI.getPDFBase64(props.crvId)
    const data = response.data.data || response.data
    const { base64, mimeType } = data

    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: mimeType || 'application/pdf' })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `CRV_${props.crvId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    pdfError.value = err.response?.data?.message || 'Erreur lors de la génération du PDF'
  } finally {
    pdfLoading.value = false
  }
}
</script>

<style scoped>
.crv-validation-component {
  margin-bottom: 20px;
  background: #fef3c7;
  border: 2px solid #f59e0b;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.validation-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.validation-check {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.checkbox-label {
  display: flex;
  align-items: start;
  gap: 10px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 3px;
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.checkbox-label span {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}

.validation-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.btn-large {
  padding: 15px 40px;
  font-size: 16px;
  font-weight: 600;
}

.validation-warning {
  color: #dc2626;
  font-size: 13px;
  text-align: center;
}

.validation-success {
  text-align: center;
  padding: 30px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #16a34a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin: 0 auto 20px;
}

.validation-success h4 {
  font-size: 24px;
  font-weight: 700;
  color: #166534;
  margin-bottom: 8px;
}

.soumission-info {
  color: #92400e;
  font-size: 14px;
  margin-bottom: 20px;
}

.validation-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: left;
}

.validation-info p {
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
}

.validation-comments {
  background: white;
  padding: 15px;
  border-radius: 8px;
  text-align: left;
}

.validation-comments strong {
  display: block;
  margin-bottom: 8px;
  color: #1f2937;
}

.validation-comments p {
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.pdf-actions {
  margin-top: 20px;
  text-align: center;
}

.pdf-error {
  color: #dc2626;
  font-size: 13px;
  margin-top: 8px;
}

/* ============================================ */
/* RESPONSIVE DESIGN                            */
/* ============================================ */

/* Mobile (jusqu'à 640px) */
@media (max-width: 640px) {
  .crv-validation-component {
    padding: 16px;
  }

  .section-title {
    font-size: 16px;
  }

  .validation-form {
    gap: 16px;
  }

  .form-label {
    font-size: 13px;
  }

  .form-input {
    font-size: 16px;
    padding: 12px;
  }

  .validation-check {
    padding: 12px;
  }

  .checkbox-label {
    gap: 8px;
  }

  .checkbox-label span {
    font-size: 13px;
  }

  .btn-large {
    width: 100%;
    padding: 14px 20px;
    font-size: 15px;
  }

  .validation-warning {
    font-size: 12px;
  }

  .validation-success {
    padding: 20px;
  }

  .success-icon {
    width: 60px;
    height: 60px;
    font-size: 36px;
    margin-bottom: 16px;
  }

  .validation-success h4 {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .validation-info {
    padding: 14px;
  }

  .validation-info p {
    font-size: 13px;
  }

  .validation-comments {
    padding: 12px;
  }

  .validation-comments p {
    font-size: 13px;
  }
}

/* Tablet (641px - 1024px) */
@media (min-width: 641px) and (max-width: 1024px) {
  .crv-validation-component {
    padding: 20px;
  }

  .validation-form {
    gap: 18px;
  }

  .validation-success {
    padding: 25px;
  }
}
</style>
