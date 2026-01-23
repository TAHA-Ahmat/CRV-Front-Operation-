<template>
  <div class="bulletin-create-container">
    <main class="bulletin-create-main">
      <div class="container">
        <!-- En-tête -->
        <div class="page-header-bar">
          <button class="btn-back" @click="goBack">
            ← Retour
          </button>
          <h1>Nouveau Bulletin de Mouvement</h1>
        </div>

        <!-- Choix du mode de création -->
        <div class="creation-mode-section">
          <h2>Comment souhaitez-vous créer ce bulletin ?</h2>

          <div class="mode-cards">
            <!-- Mode: Depuis Programme -->
            <div
              class="mode-card"
              :class="{ active: mode === 'programme' }"
              @click="mode = 'programme'"
            >
              <div class="mode-icon">📅</div>
              <h3>Depuis un Programme</h3>
              <p>Importer automatiquement les vols du programme actif pour la période sélectionnée.</p>
              <span class="mode-badge recommended">Recommandé</span>
            </div>

            <!-- Mode: Vide -->
            <div
              class="mode-card"
              :class="{ active: mode === 'vide' }"
              @click="mode = 'vide'"
            >
              <div class="mode-icon">📝</div>
              <h3>Bulletin Vide</h3>
              <p>Créer un bulletin vierge et ajouter les mouvements manuellement.</p>
            </div>
          </div>
        </div>

        <!-- Formulaire -->
        <div class="form-section">
          <form @submit.prevent="handleSubmit">
            <!-- Escale -->
            <div class="form-group">
              <label for="escale">Escale <span class="required">*</span></label>
              <input
                id="escale"
                v-model="form.escale"
                type="text"
                placeholder="NDJ"
                maxlength="4"
                required
                class="form-input"
                @input="form.escale = form.escale.toUpperCase()"
              />
              <span class="form-hint">Code IATA de l'escale (3-4 caractères)</span>
            </div>

            <!-- Période -->
            <div class="form-row">
              <div class="form-group">
                <label for="dateDebut">Date de début <span class="required">*</span></label>
                <input
                  id="dateDebut"
                  v-model="form.dateDebut"
                  type="date"
                  required
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="dateFin">Date de fin <span class="required">*</span></label>
                <input
                  id="dateFin"
                  v-model="form.dateFin"
                  type="date"
                  required
                  :min="form.dateDebut"
                  class="form-input"
                />
              </div>
            </div>

            <!-- Durée warning -->
            <div v-if="dureePeriode > 4" class="warning-box">
              <span class="warning-icon">⚠️</span>
              <p>
                La période sélectionnée est de {{ dureePeriode }} jours.
                Il est recommandé de ne pas dépasser 4 jours par bulletin.
              </p>
            </div>

            <!-- Titre optionnel -->
            <div class="form-group">
              <label for="titre">Titre (optionnel)</label>
              <input
                id="titre"
                v-model="form.titre"
                type="text"
                :placeholder="titreSuggere"
                class="form-input"
              />
            </div>

            <!-- Programme (si mode programme) -->
            <div v-if="mode === 'programme'" class="form-group">
              <label for="programme">Programme source</label>
              <div v-if="loadingProgramme" class="loading-inline">
                Chargement du programme actif...
              </div>
              <div v-else-if="programmeActif" class="programme-info">
                <div class="programme-card">
                  <strong>{{ programmeActif.nom }}</strong>
                  <span class="programme-period">
                    {{ formatDate(programmeActif.dateDebut) }} - {{ formatDate(programmeActif.dateFin) }}
                  </span>
                  <span class="programme-status">{{ programmeActif.statut }}</span>
                </div>
                <p class="form-hint">
                  Les vols du programme seront automatiquement importés pour la période sélectionnée.
                </p>
              </div>
              <div v-else class="no-programme">
                <p>Aucun programme actif trouvé. Veuillez d'abord activer un programme ou créer un bulletin vide.</p>
              </div>
            </div>

            <!-- Remarques -->
            <div class="form-group">
              <label for="remarques">Remarques (optionnel)</label>
              <textarea
                id="remarques"
                v-model="form.remarques"
                placeholder="Notes ou informations complémentaires..."
                rows="3"
                class="form-input"
              ></textarea>
            </div>

            <!-- Erreur -->
            <div v-if="error" class="error-box">
              {{ error }}
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="goBack">
                Annuler
              </button>
              <button
                type="submit"
                class="btn-primary"
                :disabled="saving || !canSubmit"
              >
                <span v-if="saving">Création en cours...</span>
                <span v-else>Créer le bulletin</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBulletinStore } from '@/stores/bulletinStore'
import { programmesVolAPI } from '@/services/api'

const router = useRouter()
const bulletinStore = useBulletinStore()

// État
const mode = ref('programme')
const loadingProgramme = ref(false)
const programmeActif = ref(null)

const form = ref({
  escale: '',
  dateDebut: '',
  dateFin: '',
  titre: '',
  remarques: ''
})

// Computed
const saving = computed(() => bulletinStore.isSaving)
const error = computed(() => bulletinStore.getError)

const dureePeriode = computed(() => {
  if (!form.value.dateDebut || !form.value.dateFin) return 0
  const debut = new Date(form.value.dateDebut)
  const fin = new Date(form.value.dateFin)
  const diff = (fin - debut) / (1000 * 60 * 60 * 24)
  return Math.max(0, diff + 1)
})

const titreSuggere = computed(() => {
  if (!form.value.dateDebut) return 'Bulletin Semaine XX'
  const date = new Date(form.value.dateDebut)
  const weekNumber = getWeekNumber(date)
  return `Bulletin Semaine ${weekNumber}`
})

const canSubmit = computed(() => {
  const hasRequired = form.value.escale && form.value.dateDebut && form.value.dateFin
  const validPeriod = new Date(form.value.dateFin) >= new Date(form.value.dateDebut)

  if (mode.value === 'programme') {
    return hasRequired && validPeriod && programmeActif.value
  }
  return hasRequired && validPeriod
})

// Helpers
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Actions
const loadProgrammeActif = async () => {
  loadingProgramme.value = true
  try {
    const response = await programmesVolAPI.getActif()
    programmeActif.value = response.data?.data || response.data?.programme || response.data
  } catch (e) {
    console.log('Pas de programme actif:', e.message)
    programmeActif.value = null
  } finally {
    loadingProgramme.value = false
  }
}

const handleSubmit = async () => {
  bulletinStore.clearError()

  try {
    let bulletin

    if (mode.value === 'programme' && programmeActif.value) {
      bulletin = await bulletinStore.creerBulletinDepuisProgramme({
        escale: form.value.escale,
        dateDebut: form.value.dateDebut,
        dateFin: form.value.dateFin,
        programmeId: programmeActif.value._id || programmeActif.value.id,
        titre: form.value.titre || titreSuggere.value,
        remarques: form.value.remarques
      })
    } else {
      bulletin = await bulletinStore.creerBulletin({
        escale: form.value.escale,
        dateDebut: form.value.dateDebut,
        dateFin: form.value.dateFin,
        titre: form.value.titre || titreSuggere.value,
        remarques: form.value.remarques
      })
    }

    if (bulletin) {
      router.push(`/bulletins/${bulletin._id || bulletin.id}`)
    }
  } catch (e) {
    console.error('Erreur création bulletin:', e)
  }
}

const goBack = () => {
  router.push('/bulletins')
}

// Définir les dates par défaut (aujourd'hui + 3 jours)
const setDefaultDates = () => {
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 3)

  form.value.dateDebut = today.toISOString().split('T')[0]
  form.value.dateFin = endDate.toISOString().split('T')[0]
}

// Lifecycle
onMounted(() => {
  setDefaultDates()
  loadProgrammeActif()
})

// Watcher pour recharger le programme si on change de mode
watch(mode, (newMode) => {
  if (newMode === 'programme' && !programmeActif.value) {
    loadProgrammeActif()
  }
})
</script>

<style scoped>
.bulletin-create-container {
  min-height: calc(100vh - 64px);
  background: #f9fafb;
}

.bulletin-create-main {
  padding: 24px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.btn-back {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
}

.btn-back:hover {
  color: #374151;
}

.page-header-bar h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

/* Mode de création */
.creation-mode-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.creation-mode-section h2 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.mode-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.mode-card:hover {
  border-color: #93c5fd;
}

.mode-card.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.mode-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.mode-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.mode-card p {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.mode-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.mode-badge.recommended {
  background: #d1fae5;
  color: #065f46;
}

/* Formulaire */
.form-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #dc2626;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

/* Warning box */
.warning-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.warning-icon {
  font-size: 20px;
}

.warning-box p {
  font-size: 14px;
  color: #92400e;
  margin: 0;
}

/* Programme info */
.loading-inline {
  color: #6b7280;
  font-size: 14px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.programme-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f0fdf4;
  border: 1px solid #22c55e;
  border-radius: 8px;
  padding: 12px 16px;
}

.programme-card strong {
  color: #166534;
}

.programme-period {
  font-size: 13px;
  color: #6b7280;
}

.programme-status {
  background: #dcfce7;
  color: #166534;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.no-programme {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
}

.no-programme p {
  font-size: 14px;
  color: #991b1b;
  margin: 0;
}

/* Error box */
.error-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  color: #991b1b;
  font-size: 14px;
  margin-bottom: 20px;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-primary {
  background: #2563eb;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  padding: 10px 24px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 640px) {
  .mode-cards {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
