<template>
  <div class="bulletin-detail-container">
    <main class="bulletin-detail-main">
      <div class="container">
        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Chargement du bulletin...</p>
        </div>

        <!-- Erreur -->
        <div v-else-if="error && !bulletin" class="error-state">
          <p>{{ error }}</p>
          <button class="btn-secondary" @click="loadBulletin">Réessayer</button>
        </div>

        <!-- Contenu -->
        <template v-else-if="bulletin">
          <!-- En-tête -->
          <div class="bulletin-header">
            <div class="header-left">
              <button class="btn-back" @click="goBack">← Retour</button>
              <div class="header-info">
                <div class="header-badges">
                  <span class="escale-badge">{{ bulletin.escale }}</span>
                  <span class="semaine-badge">Semaine {{ bulletin.numeroSemaine }}</span>
                  <span
                    class="statut-badge"
                    :style="{
                      backgroundColor: statutColor.bg,
                      color: statutColor.text
                    }"
                  >
                    {{ statutLabel }}
                  </span>
                </div>
                <h1>{{ bulletin.titre || `Bulletin S${bulletin.numeroSemaine}` }}</h1>
                <p class="period">
                  {{ formatDate(bulletin.dateDebut) }} - {{ formatDate(bulletin.dateFin) }}
                </p>
              </div>
            </div>

            <!-- Actions workflow -->
            <div class="header-actions">
              <button
                v-if="peutModifier && canEdit"
                class="btn-secondary"
                @click="showMouvementModal = true"
              >
                + Mouvement
              </button>
              <button
                v-if="peutModifier && canEdit"
                class="btn-outline-red"
                @click="showHorsProgrammeModal = true"
              >
                + Vol HP
              </button>
              <button
                v-if="peutPublier && canEdit"
                class="btn-success"
                :disabled="saving"
                @click="publier"
              >
                Publier
              </button>
              <button
                v-if="peutArchiver && canEdit"
                class="btn-primary"
                :disabled="saving"
                @click="archiver"
              >
                Archiver
              </button>
              <button
                v-if="peutSupprimer && canEdit"
                class="btn-danger"
                :disabled="saving"
                @click="confirmerSuppression"
              >
                Supprimer
              </button>
            </div>
          </div>

          <!-- Statistiques -->
          <div class="stats-section">
            <div class="stat-card">
              <span class="stat-value">{{ stats.total }}</span>
              <span class="stat-label">Mouvements</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ stats.programme }}</span>
              <span class="stat-label">Programme</span>
            </div>
            <div class="stat-card highlight-hp">
              <span class="stat-value">{{ stats.horsProgramme }}</span>
              <span class="stat-label">Hors Programme</span>
            </div>
            <div class="stat-card highlight-aj">
              <span class="stat-value">{{ stats.ajustements }}</span>
              <span class="stat-label">Ajustements</span>
            </div>
            <div class="stat-card" v-if="stats.annules > 0">
              <span class="stat-value stat-annule">{{ stats.annules }}</span>
              <span class="stat-label">Annulés</span>
            </div>
          </div>

          <!-- Bandeau lecture seule -->
          <div v-if="!peutModifier" class="readonly-banner">
            Ce bulletin est {{ statutLabel.toLowerCase() }} et ne peut plus être modifié.
          </div>

          <!-- Bandeau QUALITE -->
          <div v-if="isReadOnly" class="qualite-banner">
            Mode lecture seule - Vous ne pouvez pas modifier ce bulletin.
          </div>

          <!-- Erreur -->
          <div v-if="error" class="error-box">
            {{ error }}
          </div>

          <!-- Mouvements par jour -->
          <div class="mouvements-section">
            <h2>Mouvements</h2>

            <div v-if="Object.keys(mouvementsParJour).length === 0" class="empty-mouvements">
              <p>Aucun mouvement dans ce bulletin.</p>
              <button
                v-if="peutModifier && canEdit"
                class="btn-primary"
                @click="showMouvementModal = true"
              >
                Ajouter un mouvement
              </button>
            </div>

            <div v-else class="jours-list">
              <div
                v-for="(mouvements, date) in mouvementsParJour"
                :key="date"
                class="jour-section"
              >
                <div class="jour-header">
                  <span class="jour-date">{{ formatDateFull(date) }}</span>
                  <span class="jour-count">{{ mouvements.length }} vol(s)</span>
                </div>

                <div class="mouvements-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Vol</th>
                        <th>Type</th>
                        <th>Arrivée</th>
                        <th>Départ</th>
                        <th>Provenance</th>
                        <th>Destination</th>
                        <th>Avion</th>
                        <th>Origine</th>
                        <th>Statut</th>
                        <th v-if="peutModifier && canEdit">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="mvt in mouvements"
                        :key="mvt._id"
                        :class="{
                          'row-annule': mvt.statutMouvement === 'ANNULE',
                          'row-hp': mvt.origine === 'HORS_PROGRAMME',
                          'row-aj': mvt.origine === 'AJUSTEMENT'
                        }"
                      >
                        <td class="col-vol">
                          <strong>{{ mvt.numeroVol }}</strong>
                          <span v-if="mvt.origine !== 'PROGRAMME'" class="origine-badge" :class="mvt.origine.toLowerCase()">
                            {{ getOrigineLabel(mvt.origine) }}
                          </span>
                        </td>
                        <td>{{ getTypeLabel(mvt.typeOperation) }}</td>
                        <td>{{ formatHeure(mvt.heureArriveePrevue) }}</td>
                        <td>{{ formatHeure(mvt.heureDepartPrevue) }}</td>
                        <td>{{ mvt.provenance || '-' }}</td>
                        <td>{{ mvt.destination || '-' }}</td>
                        <td>{{ mvt.typeAvion || '-' }}</td>
                        <td>
                          <span class="origine-tag" :class="mvt.origine.toLowerCase()">
                            {{ mvt.origine }}
                          </span>
                        </td>
                        <td>
                          <span class="statut-mvt" :class="mvt.statutMouvement.toLowerCase()">
                            {{ mvt.statutMouvement }}
                          </span>
                        </td>
                        <td v-if="peutModifier && canEdit" class="col-actions">
                          <button
                            v-if="mvt.statutMouvement !== 'ANNULE'"
                            class="btn-icon"
                            title="Modifier"
                            @click="editMouvement(mvt)"
                          >
                            ✏️
                          </button>
                          <button
                            v-if="mvt.statutMouvement !== 'ANNULE'"
                            class="btn-icon"
                            title="Annuler"
                            @click="annulerMouvementConfirm(mvt)"
                          >
                            ❌
                          </button>
                          <button
                            class="btn-icon"
                            title="Supprimer"
                            @click="supprimerMouvementConfirm(mvt)"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Remarques -->
          <div v-if="bulletin.remarques" class="remarques-section">
            <h3>Remarques</h3>
            <p>{{ bulletin.remarques }}</p>
          </div>
        </template>
      </div>
    </main>

    <!-- Modal Ajout Mouvement -->
    <div v-if="showMouvementModal" class="modal-overlay" @click.self="closeMouvementModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingMouvement ? 'Modifier' : 'Ajouter' }} un mouvement</h2>
          <button class="btn-close" @click="closeMouvementModal">×</button>
        </div>
        <form @submit.prevent="saveMouvement">
          <div class="form-row">
            <div class="form-group">
              <label>Numéro de vol *</label>
              <input v-model="mouvementForm.numeroVol" type="text" required placeholder="ET939" />
            </div>
            <div class="form-group">
              <label>Date *</label>
              <input
                v-model="mouvementForm.dateMouvement"
                type="date"
                required
                :min="bulletin?.dateDebut?.split('T')[0]"
                :max="bulletin?.dateFin?.split('T')[0]"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Heure arrivée prévue</label>
              <input v-model="mouvementForm.heureArriveePrevue" type="time" />
            </div>
            <div class="form-group">
              <label>Heure départ prévue</label>
              <input v-model="mouvementForm.heureDepartPrevue" type="time" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Provenance</label>
              <input v-model="mouvementForm.provenance" type="text" placeholder="ADD" maxlength="4" />
            </div>
            <div class="form-group">
              <label>Destination</label>
              <input v-model="mouvementForm.destination" type="text" placeholder="ADD" maxlength="4" />
            </div>
          </div>
          <div class="form-group">
            <label>Type d'avion</label>
            <input v-model="mouvementForm.typeAvion" type="text" placeholder="B737-800" />
          </div>
          <div class="form-group">
            <label>Remarques</label>
            <textarea v-model="mouvementForm.remarques" rows="2" placeholder="Notes..."></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeMouvementModal">Annuler</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ editingMouvement ? 'Modifier' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Vol Hors Programme -->
    <div v-if="showHorsProgrammeModal" class="modal-overlay" @click.self="closeHorsProgrammeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Ajouter un vol hors programme</h2>
          <button class="btn-close" @click="closeHorsProgrammeModal">×</button>
        </div>
        <form @submit.prevent="saveVolHorsProgramme">
          <div class="form-row">
            <div class="form-group">
              <label>Numéro de vol *</label>
              <input v-model="hpForm.numeroVol" type="text" required placeholder="XX001" />
            </div>
            <div class="form-group">
              <label>Date *</label>
              <input
                v-model="hpForm.dateMouvement"
                type="date"
                required
                :min="bulletin?.dateDebut?.split('T')[0]"
                :max="bulletin?.dateFin?.split('T')[0]"
              />
            </div>
          </div>
          <div class="form-group">
            <label>Type de vol hors programme *</label>
            <select v-model="hpForm.typeHorsProgramme" required>
              <option value="">Sélectionner...</option>
              <option value="CHARTER">Charter</option>
              <option value="MEDICAL">Médical / Évacuation</option>
              <option value="TECHNIQUE">Vol technique</option>
              <option value="COMMERCIAL">Commercial ponctuel</option>
              <option value="CARGO">Cargo spécial</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div class="form-group">
            <label>Raison</label>
            <input v-model="hpForm.raisonHorsProgramme" type="text" placeholder="Motif du vol hors programme" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Heure arrivée prévue</label>
              <input v-model="hpForm.heureArriveePrevue" type="time" />
            </div>
            <div class="form-group">
              <label>Heure départ prévue</label>
              <input v-model="hpForm.heureDepartPrevue" type="time" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Provenance</label>
              <input v-model="hpForm.provenance" type="text" placeholder="XXX" maxlength="4" />
            </div>
            <div class="form-group">
              <label>Destination</label>
              <input v-model="hpForm.destination" type="text" placeholder="XXX" maxlength="4" />
            </div>
          </div>
          <div class="form-group">
            <label>Type d'avion</label>
            <input v-model="hpForm.typeAvion" type="text" placeholder="B737-800" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeHorsProgrammeModal">Annuler</button>
            <button type="submit" class="btn-primary" :disabled="saving">Ajouter</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Annulation -->
    <div v-if="showAnnulationModal" class="modal-overlay" @click.self="closeAnnulationModal">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h2>Annuler le mouvement</h2>
          <button class="btn-close" @click="closeAnnulationModal">×</button>
        </div>
        <form @submit.prevent="confirmAnnulation">
          <p class="modal-text">
            Vous allez annuler le vol <strong>{{ mouvementToAnnuler?.numeroVol }}</strong>.
            Le mouvement restera visible mais sera marqué comme annulé.
          </p>
          <div class="form-group">
            <label>Raison de l'annulation *</label>
            <textarea v-model="annulationRaison" required rows="3" placeholder="Motif de l'annulation..."></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeAnnulationModal">Annuler</button>
            <button type="submit" class="btn-danger" :disabled="saving">Confirmer l'annulation</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Suppression -->
    <div v-if="showSuppressionModal" class="modal-overlay" @click.self="closeSuppressionModal">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h2>Supprimer le mouvement</h2>
          <button class="btn-close" @click="closeSuppressionModal">×</button>
        </div>
        <p class="modal-text">
          Êtes-vous sûr de vouloir supprimer définitivement le vol <strong>{{ mouvementToDelete?.numeroVol }}</strong> ?
          Cette action est irréversible.
        </p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="closeSuppressionModal">Annuler</button>
          <button class="btn-danger" :disabled="saving" @click="confirmSuppression">Supprimer</button>
        </div>
      </div>
    </div>

    <!-- Modal Suppression Bulletin -->
    <div v-if="showDeleteBulletinModal" class="modal-overlay" @click.self="showDeleteBulletinModal = false">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h2>Supprimer le bulletin</h2>
          <button class="btn-close" @click="showDeleteBulletinModal = false">×</button>
        </div>
        <p class="modal-text">
          Êtes-vous sûr de vouloir supprimer définitivement ce bulletin et tous ses mouvements ?
          Cette action est irréversible.
        </p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="showDeleteBulletinModal = false">Annuler</button>
          <button class="btn-danger" :disabled="saving" @click="deleteBulletin">Supprimer le bulletin</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBulletinStore, STATUT_COLORS, ORIGINE_COLORS } from '@/stores/bulletinStore'
import { useAuth } from '@/composables/useAuth'
import { hasPermission, ACTIONS, isReadOnlyRole } from '@/utils/permissions'

const router = useRouter()
const route = useRoute()
const bulletinStore = useBulletinStore()
const { userRole } = useAuth()

// État
const showMouvementModal = ref(false)
const showHorsProgrammeModal = ref(false)
const showAnnulationModal = ref(false)
const showSuppressionModal = ref(false)
const showDeleteBulletinModal = ref(false)
const editingMouvement = ref(null)
const mouvementToAnnuler = ref(null)
const mouvementToDelete = ref(null)
const annulationRaison = ref('')

// Formulaires
const mouvementForm = ref({
  numeroVol: '',
  dateMouvement: '',
  heureArriveePrevue: '',
  heureDepartPrevue: '',
  provenance: '',
  destination: '',
  typeAvion: '',
  remarques: ''
})

const hpForm = ref({
  numeroVol: '',
  dateMouvement: '',
  typeHorsProgramme: '',
  raisonHorsProgramme: '',
  heureArriveePrevue: '',
  heureDepartPrevue: '',
  provenance: '',
  destination: '',
  typeAvion: ''
})

// Computed
const loading = computed(() => bulletinStore.isLoading)
const saving = computed(() => bulletinStore.isSaving)
const error = computed(() => bulletinStore.getError)
const bulletin = computed(() => bulletinStore.getBulletinActuel)
const mouvementsParJour = computed(() => bulletinStore.getMouvementsParJour)
const stats = computed(() => bulletinStore.getStatistiques)
const peutModifier = computed(() => bulletinStore.peutModifier)
const peutPublier = computed(() => bulletinStore.peutPublier)
const peutArchiver = computed(() => bulletinStore.peutArchiver)
const peutSupprimer = computed(() => bulletinStore.peutSupprimer)
const canEdit = computed(() => hasPermission(userRole.value, ACTIONS.BULLETIN_MODIFIER))
const isReadOnly = computed(() => isReadOnlyRole(userRole.value))

const statutColor = computed(() => STATUT_COLORS[bulletin.value?.statut] || STATUT_COLORS.BROUILLON)
const statutLabel = computed(() => statutColor.value.label)

// Helpers
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const formatDateFull = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const formatHeure = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const getOrigineLabel = (origine) => ORIGINE_COLORS[origine]?.label || ''
const getTypeLabel = (type) => {
  const labels = { ARRIVEE: 'Arrivée', DEPART: 'Départ', TURN_AROUND: 'Turn-Around' }
  return labels[type] || type
}

// Actions
const loadBulletin = async () => {
  const id = route.params.id
  if (id) {
    await bulletinStore.fetchBulletinById(id)
  }
}

const goBack = () => {
  router.push('/bulletins')
}

const publier = async () => {
  if (confirm('Êtes-vous sûr de vouloir publier ce bulletin ? Il ne pourra plus être modifié.')) {
    try {
      await bulletinStore.publierBulletin()
    } catch (e) {
      console.error('Erreur publication:', e)
    }
  }
}

const archiver = async () => {
  if (confirm('Êtes-vous sûr de vouloir archiver ce bulletin ?')) {
    try {
      await bulletinStore.archiverBulletin()
    } catch (e) {
      console.error('Erreur archivage:', e)
    }
  }
}

const confirmerSuppression = () => {
  showDeleteBulletinModal.value = true
}

const deleteBulletin = async () => {
  try {
    await bulletinStore.supprimerBulletin(bulletin.value._id)
    router.push('/bulletins')
  } catch (e) {
    console.error('Erreur suppression:', e)
  }
  showDeleteBulletinModal.value = false
}

// Mouvements
const closeMouvementModal = () => {
  showMouvementModal.value = false
  editingMouvement.value = null
  resetMouvementForm()
}

const resetMouvementForm = () => {
  mouvementForm.value = {
    numeroVol: '',
    dateMouvement: bulletin.value?.dateDebut?.split('T')[0] || '',
    heureArriveePrevue: '',
    heureDepartPrevue: '',
    provenance: '',
    destination: '',
    typeAvion: '',
    remarques: ''
  }
}

const editMouvement = (mvt) => {
  editingMouvement.value = mvt
  mouvementForm.value = {
    numeroVol: mvt.numeroVol,
    dateMouvement: mvt.dateMouvement?.split('T')[0] || '',
    heureArriveePrevue: mvt.heureArriveePrevue ? new Date(mvt.heureArriveePrevue).toTimeString().slice(0, 5) : '',
    heureDepartPrevue: mvt.heureDepartPrevue ? new Date(mvt.heureDepartPrevue).toTimeString().slice(0, 5) : '',
    provenance: mvt.provenance || '',
    destination: mvt.destination || '',
    typeAvion: mvt.typeAvion || '',
    remarques: mvt.remarques || ''
  }
  showMouvementModal.value = true
}

const saveMouvement = async () => {
  try {
    const data = { ...mouvementForm.value }
    // Convertir les heures en ISO si présentes
    if (data.heureArriveePrevue) {
      data.heureArriveePrevue = `${data.dateMouvement}T${data.heureArriveePrevue}:00`
    }
    if (data.heureDepartPrevue) {
      data.heureDepartPrevue = `${data.dateMouvement}T${data.heureDepartPrevue}:00`
    }

    if (editingMouvement.value) {
      await bulletinStore.modifierMouvement(editingMouvement.value._id, data)
    } else {
      await bulletinStore.ajouterMouvement(data)
    }
    closeMouvementModal()
  } catch (e) {
    console.error('Erreur sauvegarde mouvement:', e)
  }
}

// Vol hors programme
const closeHorsProgrammeModal = () => {
  showHorsProgrammeModal.value = false
  hpForm.value = {
    numeroVol: '',
    dateMouvement: bulletin.value?.dateDebut?.split('T')[0] || '',
    typeHorsProgramme: '',
    raisonHorsProgramme: '',
    heureArriveePrevue: '',
    heureDepartPrevue: '',
    provenance: '',
    destination: '',
    typeAvion: ''
  }
}

const saveVolHorsProgramme = async () => {
  try {
    const data = { ...hpForm.value }
    if (data.heureArriveePrevue) {
      data.heureArriveePrevue = `${data.dateMouvement}T${data.heureArriveePrevue}:00`
    }
    if (data.heureDepartPrevue) {
      data.heureDepartPrevue = `${data.dateMouvement}T${data.heureDepartPrevue}:00`
    }

    await bulletinStore.ajouterVolHorsProgramme(data)
    closeHorsProgrammeModal()
  } catch (e) {
    console.error('Erreur ajout vol HP:', e)
  }
}

// Annulation
const annulerMouvementConfirm = (mvt) => {
  mouvementToAnnuler.value = mvt
  annulationRaison.value = ''
  showAnnulationModal.value = true
}

const closeAnnulationModal = () => {
  showAnnulationModal.value = false
  mouvementToAnnuler.value = null
  annulationRaison.value = ''
}

const confirmAnnulation = async () => {
  try {
    await bulletinStore.annulerMouvement(mouvementToAnnuler.value._id, annulationRaison.value)
    closeAnnulationModal()
  } catch (e) {
    console.error('Erreur annulation:', e)
  }
}

// Suppression mouvement
const supprimerMouvementConfirm = (mvt) => {
  mouvementToDelete.value = mvt
  showSuppressionModal.value = true
}

const closeSuppressionModal = () => {
  showSuppressionModal.value = false
  mouvementToDelete.value = null
}

const confirmSuppression = async () => {
  try {
    await bulletinStore.supprimerMouvement(mouvementToDelete.value._id)
    closeSuppressionModal()
  } catch (e) {
    console.error('Erreur suppression:', e)
  }
}

// Lifecycle
onMounted(() => {
  loadBulletin()
})
</script>

<style scoped>
.bulletin-detail-container {
  min-height: calc(100vh - 64px);
  background: #f9fafb;
}

.bulletin-detail-main {
  padding: 24px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Loading/Error */
.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Header */
.bulletin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.btn-back {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  white-space: nowrap;
}

.btn-back:hover {
  color: #374151;
}

.header-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.escale-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
}

.semaine-badge {
  background: #f3f4f6;
  color: #374151;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
}

.statut-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.header-info h1 {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.period {
  font-size: 14px;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Boutons */
.btn-primary {
  background: #2563eb;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-success {
  background: #16a34a;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-success:hover:not(:disabled) {
  background: #15803d;
}

.btn-danger {
  background: #dc2626;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-outline-red {
  background: white;
  color: #dc2626;
  padding: 8px 16px;
  border: 1px solid #dc2626;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-outline-red:hover {
  background: #fef2f2;
}

.btn-icon {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-icon:hover {
  opacity: 0.7;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Stats */
.stats-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 16px 24px;
  min-width: 120px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-card.highlight-hp {
  border-left: 3px solid #dc2626;
}

.stat-card.highlight-aj {
  border-left: 3px solid #d97706;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  display: block;
}

.stat-value.stat-annule {
  color: #dc2626;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

/* Bandeaux */
.readonly-banner,
.qualite-banner {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 24px;
  color: #92400e;
  font-size: 14px;
}

.qualite-banner {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.error-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  color: #991b1b;
  font-size: 14px;
  margin-bottom: 24px;
}

/* Mouvements */
.mouvements-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mouvements-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.empty-mouvements {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.jour-section {
  margin-bottom: 24px;
}

.jour-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 8px 8px 0 0;
}

.jour-date {
  font-weight: 600;
  color: #1f2937;
  text-transform: capitalize;
}

.jour-count {
  font-size: 13px;
  color: #6b7280;
}

.mouvements-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f9fafb;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

td {
  font-size: 14px;
  color: #374151;
}

.col-vol {
  white-space: nowrap;
}

.col-vol strong {
  color: #1f2937;
}

.origine-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.origine-badge.hors_programme {
  background: #fef2f2;
  color: #dc2626;
}

.origine-badge.ajustement {
  background: #fef3c7;
  color: #d97706;
}

.origine-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.origine-tag.programme {
  background: #f3f4f6;
  color: #374151;
}

.origine-tag.hors_programme {
  background: #fef2f2;
  color: #dc2626;
}

.origine-tag.ajustement {
  background: #fef3c7;
  color: #d97706;
}

.statut-mvt {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.statut-mvt.prevu {
  background: #f3f4f6;
  color: #374151;
}

.statut-mvt.confirme {
  background: #d1fae5;
  color: #065f46;
}

.statut-mvt.modifie {
  background: #fef3c7;
  color: #92400e;
}

.statut-mvt.annule {
  background: #fef2f2;
  color: #dc2626;
}

.row-annule td {
  text-decoration: line-through;
  opacity: 0.6;
}

.row-hp {
  background: #fef2f2;
}

.row-aj {
  background: #fef3c7;
}

.col-actions {
  white-space: nowrap;
}

/* Remarques */
.remarques-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.remarques-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.remarques-section p {
  color: #6b7280;
  line-height: 1.6;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
}

.modal-content.modal-small {
  max-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
}

.modal-text {
  color: #6b7280;
  margin-bottom: 20px;
  line-height: 1.6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

/* ============================================ */
/* RESPONSIVE DESIGN                            */
/* ============================================ */

/* Mobile (jusqu'à 640px) */
@media (max-width: 640px) {
  .bulletin-detail-main {
    padding: 12px;
  }

  .bulletin-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .header-left {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .btn-back {
    align-self: flex-start;
  }

  .header-badges {
    flex-wrap: wrap;
  }

  .header-info h1 {
    font-size: 18px;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
    gap: 8px;
  }

  .header-actions button {
    flex: 1;
    min-width: 120px;
  }

  .stats-section {
    flex-direction: column;
    gap: 8px;
  }

  .stat-card {
    width: 100%;
    padding: 12px 16px;
  }

  .stat-value {
    font-size: 22px;
  }

  .mouvements-section {
    padding: 16px;
  }

  .jour-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 10px 12px;
  }

  .mouvements-table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .mouvements-table table {
    min-width: 800px;
  }

  th, td {
    padding: 8px 6px;
    font-size: 12px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  /* Modal responsive */
  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .modal-content {
    max-width: 100%;
    max-height: 85vh;
    border-radius: 16px 16px 0 0;
    padding: 20px 16px;
  }

  .modal-content.modal-small {
    max-width: 100%;
  }

  .modal-header h2 {
    font-size: 16px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    font-size: 16px;
    padding: 12px;
  }

  .remarques-section {
    padding: 16px;
  }

  .readonly-banner,
  .qualite-banner,
  .error-box {
    padding: 10px 12px;
    font-size: 13px;
  }
}

/* Tablet (641px - 1024px) */
@media (min-width: 641px) and (max-width: 1024px) {
  .bulletin-detail-main {
    padding: 20px;
  }

  .bulletin-header {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .stats-section {
    flex-wrap: wrap;
  }

  .stat-card {
    flex: 1;
    min-width: 140px;
  }

  .mouvements-table {
    overflow-x: auto;
  }

  .modal-content {
    max-width: 90%;
  }
}

/* Desktop (1025px+) */
@media (min-width: 1025px) {
  .bulletin-header {
    flex-wrap: nowrap;
  }

  .stats-section {
    flex-wrap: nowrap;
  }
}
</style>
