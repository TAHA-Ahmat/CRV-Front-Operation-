<template>
  <div class="avions-gestion-container">
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="$router.push('/dashboard-manager')" class="btn-back">
            ← Retour
          </button>
          <h1>Gestion des Avions</h1>
        </div>
        <div class="header-actions">
          <!-- MVS-8 #8: Dashboard révisions prochaines -->
          <button
            class="btn btn-warning"
            @click="showRevisionsModal = true"
            :disabled="loadingRevisions"
          >
            <span class="badge-count" v-if="revisionsProchaines.length > 0">
              {{ revisionsProchaines.length }}
            </span>
            Révisions prochaines
          </button>
          <!-- MVS-8 #1: Bouton création avion (MANAGER/ADMIN) -->
          <button
            v-if="canCreateAvion"
            class="btn btn-primary"
            @click="openCreateModal"
          >
            + Ajouter un avion
          </button>
        </div>
      </div>
    </header>

    <main class="page-main">
      <!-- MVS-8 #9: Dashboard statistiques (MANAGER) -->
      <div v-if="canViewStats" class="stats-dashboard">
        <h3>Statistiques Flotte</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ statistiques.totalAvions || 0 }}</div>
            <div class="stat-label">Avions</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ statistiques.totalCompagnies || 0 }}</div>
            <div class="stat-label">Compagnies</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ statistiques.totalVersions || 0 }}</div>
            <div class="stat-label">Versions config</div>
          </div>
          <div class="stat-card warning" v-if="revisionsProchaines.length > 0">
            <div class="stat-value">{{ revisionsProchaines.length }}</div>
            <div class="stat-label">Révisions à venir</div>
          </div>
        </div>
      </div>

      <!-- Liste des avions -->
      <div class="avions-list card">
        <div class="list-header">
          <h3>Liste des avions</h3>
          <div class="filters">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher..."
              class="form-input"
            />
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          Chargement...
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Immatriculation</th>
              <th>Compagnie</th>
              <th>Type</th>
              <th>Version config</th>
              <th>Prochaine révision</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="avion in filteredAvions" :key="avion.id || avion._id">
              <td class="immat">{{ avion.immatriculation }}</td>
              <td>{{ avion.compagnie || avion.compagnieAerienne }}</td>
              <td>{{ avion.typeAvion || avion.type }}</td>
              <td>
                <span class="version-badge">
                  v{{ avion.versionConfiguration || 1 }}
                </span>
              </td>
              <td>
                <span
                  v-if="avion.prochaineRevision"
                  class="revision-date"
                  :class="getRevisionClass(avion.prochaineRevision)"
                >
                  {{ formatDate(avion.prochaineRevision.dateRevision) }}
                  ({{ avion.prochaineRevision.typeRevision }})
                </span>
                <span v-else class="no-revision">Non planifiée</span>
              </td>
              <td class="actions">
                <button
                  class="btn btn-sm btn-secondary"
                  @click="openDetailModal(avion)"
                  title="Voir détails"
                >
                  Détails
                </button>
                <button
                  v-if="canModifyConfig"
                  class="btn btn-sm btn-outline"
                  @click="openConfigModal(avion)"
                  title="Configuration"
                >
                  Config
                </button>
                <button
                  class="btn btn-sm btn-outline"
                  @click="openVersionsModal(avion)"
                  title="Historique versions"
                >
                  Versions
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!loading && filteredAvions.length === 0" class="empty-state">
          Aucun avion trouvé
        </div>
      </div>
    </main>

    <!-- MVS-8 #1: Modal création avion -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingAvion ? 'Modifier avion' : 'Ajouter un avion' }}</h3>
          <button class="btn-close" @click="showCreateModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Immatriculation *</label>
            <input
              v-model="avionForm.immatriculation"
              type="text"
              class="form-input"
              placeholder="ex: F-GKXA"
              :disabled="!!editingAvion"
            />
            <span class="form-hint">Format standard OACI</span>
          </div>
          <div class="form-group">
            <label class="form-label">Compagnie *</label>
            <input
              v-model="avionForm.compagnie"
              type="text"
              class="form-input"
              placeholder="ex: Air France"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Type d'avion</label>
            <input
              v-model="avionForm.typeAvion"
              type="text"
              class="form-input"
              placeholder="ex: A320-200"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Modèle</label>
            <input
              v-model="avionForm.modele"
              type="text"
              class="form-input"
              placeholder="ex: Airbus A320-214"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateModal = false">Annuler</button>
          <button
            class="btn btn-primary"
            @click="saveAvion"
            :disabled="!avionForm.immatriculation || !avionForm.compagnie"
          >
            {{ editingAvion ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MVS-8 #2: Modal configuration avion -->
    <div v-if="showConfigModal" class="modal-overlay" @click.self="showConfigModal = false">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>Configuration - {{ selectedAvion?.immatriculation }}</h3>
          <button class="btn-close" @click="showConfigModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="config-notice">
            <span class="notice-icon">ℹ️</span>
            Une nouvelle version sera créée automatiquement lors de la modification.
          </div>

          <div class="config-section">
            <h4>Configuration cabine</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Sièges première classe</label>
                <input
                  v-model.number="configForm.siegesPremiere"
                  type="number"
                  class="form-input"
                  min="0"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Sièges affaires</label>
                <input
                  v-model.number="configForm.siegesAffaires"
                  type="number"
                  class="form-input"
                  min="0"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Sièges économique</label>
                <input
                  v-model.number="configForm.siegesEconomique"
                  type="number"
                  class="form-input"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div class="config-section">
            <h4>Capacités</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Capacité soute (kg)</label>
                <input
                  v-model.number="configForm.capaciteSoute"
                  type="number"
                  class="form-input"
                  min="0"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Capacité carburant (L)</label>
                <input
                  v-model.number="configForm.capaciteCarburant"
                  type="number"
                  class="form-input"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div class="config-section">
            <h4>Équipements spéciaux</h4>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="configForm.equipementPMR" />
                Équipement PMR (fauteuil roulant)
              </label>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="configForm.equipementMedical" />
                Équipement médical
              </label>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="configForm.equipementFret" />
                Configuration fret (combi)
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description de la modification</label>
            <textarea
              v-model="configForm.description"
              class="form-input"
              rows="2"
              placeholder="Décrivez les modifications apportées..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showConfigModal = false">Annuler</button>
          <button class="btn btn-primary" @click="saveConfiguration">
            Enregistrer la configuration
          </button>
        </div>
      </div>
    </div>

    <!-- MVS-8 #3 & #4: Modal versions (historique + création) -->
    <div v-if="showVersionsModal" class="modal-overlay" @click.self="showVersionsModal = false">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>Historique des versions - {{ selectedAvion?.immatriculation }}</h3>
          <button class="btn-close" @click="showVersionsModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingVersions" class="loading-state">
            Chargement des versions...
          </div>

          <!-- MVS-8 #6: Comparaison versions -->
          <div v-if="versions.length >= 2" class="compare-section">
            <h4>Comparer deux versions</h4>
            <div class="compare-row">
              <select v-model="compareV1" class="form-input">
                <option value="">Version 1</option>
                <option v-for="v in versions" :key="'v1-'+v.numero" :value="v.numero">
                  v{{ v.numero }}
                </option>
              </select>
              <span class="vs-label">vs</span>
              <select v-model="compareV2" class="form-input">
                <option value="">Version 2</option>
                <option v-for="v in versions" :key="'v2-'+v.numero" :value="v.numero">
                  v{{ v.numero }}
                </option>
              </select>
              <button
                class="btn btn-outline"
                @click="compareVersions"
                :disabled="!compareV1 || !compareV2 || compareV1 === compareV2"
              >
                Comparer
              </button>
            </div>
          </div>

          <!-- Liste des versions -->
          <div class="versions-list">
            <div
              v-for="version in versions"
              :key="version.numero"
              class="version-item"
              :class="{ 'current': version.numero === selectedAvion?.versionConfiguration }"
            >
              <div class="version-header">
                <span class="version-number">v{{ version.numero }}</span>
                <span v-if="version.numero === selectedAvion?.versionConfiguration" class="current-badge">
                  Actuelle
                </span>
                <span class="version-date">{{ formatDateTime(version.dateCreation) }}</span>
              </div>
              <div class="version-description" v-if="version.description">
                {{ version.description }}
              </div>
              <div class="version-author" v-if="version.auteur">
                Par {{ version.auteur.nom }} {{ version.auteur.prenom }}
              </div>
              <div class="version-actions">
                <!-- MVS-8 #5: Bouton restauration -->
                <button
                  v-if="canModifyConfig && version.numero !== selectedAvion?.versionConfiguration"
                  class="btn btn-sm btn-warning"
                  @click="restaurerVersion(version.numero)"
                  title="Restaurer cette version"
                >
                  Restaurer
                </button>
                <button
                  class="btn btn-sm btn-outline"
                  @click="viewVersionDetail(version)"
                  title="Voir détails"
                >
                  Détails
                </button>
              </div>
            </div>
          </div>

          <div v-if="!loadingVersions && versions.length === 0" class="empty-state">
            Aucune version disponible
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showVersionsModal = false">Fermer</button>
        </div>
      </div>
    </div>

    <!-- MVS-8 #7: Modal planification révision -->
    <div v-if="showRevisionPlanModal" class="modal-overlay" @click.self="showRevisionPlanModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Planifier une révision - {{ selectedAvion?.immatriculation }}</h3>
          <button class="btn-close" @click="showRevisionPlanModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="revision-types-info">
            <h4>Types de révision</h4>
            <ul>
              <li><strong>Type A</strong> : Check légère (quotidienne)</li>
              <li><strong>Type B</strong> : Check intermédiaire (hebdomadaire)</li>
              <li><strong>Type C</strong> : Maintenance lourde (annuelle)</li>
              <li><strong>Type D</strong> : Grande visite (pluriannuelle)</li>
            </ul>
          </div>

          <div class="form-group">
            <label class="form-label">Type de révision *</label>
            <select v-model="revisionForm.typeRevision" class="form-input">
              <option value="">-- Sélectionner --</option>
              <option value="A">Type A - Check légère</option>
              <option value="B">Type B - Check intermédiaire</option>
              <option value="C">Type C - Maintenance lourde</option>
              <option value="D">Type D - Grande visite</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Date prévue *</label>
            <input
              v-model="revisionForm.dateRevision"
              type="date"
              class="form-input"
              :min="minRevisionDate"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea
              v-model="revisionForm.description"
              class="form-input"
              rows="2"
              placeholder="Notes complémentaires..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showRevisionPlanModal = false">Annuler</button>
          <button
            class="btn btn-primary"
            @click="planifierRevision"
            :disabled="!revisionForm.typeRevision || !revisionForm.dateRevision"
          >
            Planifier
          </button>
        </div>
      </div>
    </div>

    <!-- MVS-8 #8: Modal révisions prochaines -->
    <div v-if="showRevisionsModal" class="modal-overlay" @click.self="showRevisionsModal = false">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>Révisions prochaines</h3>
          <button class="btn-close" @click="showRevisionsModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingRevisions" class="loading-state">
            Chargement...
          </div>

          <div v-else-if="revisionsProchaines.length === 0" class="empty-state success">
            Aucune révision planifiée dans les prochaines semaines.
          </div>

          <div v-else class="revisions-list">
            <div
              v-for="rev in revisionsProchaines"
              :key="rev.avion?.id + '-' + rev.dateRevision"
              class="revision-item"
              :class="getRevisionClass(rev)"
            >
              <div class="revision-avion">
                <strong>{{ rev.avion?.immatriculation }}</strong>
                <span class="revision-type">{{ rev.typeRevision }}</span>
              </div>
              <div class="revision-date-info">
                <span class="date">{{ formatDate(rev.dateRevision) }}</span>
                <span class="delay">{{ getDelayText(rev.dateRevision) }}</span>
              </div>
              <div class="revision-actions">
                <button
                  v-if="canModifyConfig"
                  class="btn btn-sm btn-outline"
                  @click="openRevisionPlanModal(rev.avion)"
                >
                  Replanifier
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showRevisionsModal = false">Fermer</button>
        </div>
      </div>
    </div>

    <!-- Modal comparaison versions -->
    <div v-if="showCompareModal" class="modal-overlay" @click.self="showCompareModal = false">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>Comparaison v{{ compareV1 }} ↔ v{{ compareV2 }}</h3>
          <button class="btn-close" @click="showCompareModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingCompare" class="loading-state">
            Chargement de la comparaison...
          </div>
          <div v-else class="compare-result">
            <div v-for="(diff, key) in comparaisonResult" :key="key" class="diff-item">
              <span class="diff-key">{{ key }}</span>
              <div class="diff-values">
                <span class="diff-old">{{ diff.ancien }}</span>
                <span class="diff-arrow">→</span>
                <span class="diff-new">{{ diff.nouveau }}</span>
              </div>
            </div>
            <div v-if="Object.keys(comparaisonResult).length === 0" class="empty-state">
              Aucune différence trouvée
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCompareModal = false">Fermer</button>
        </div>
      </div>
    </div>

    <!-- Modal détails avion -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>Détails - {{ selectedAvion?.immatriculation }}</h3>
          <button class="btn-close" @click="showDetailModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>Informations générales</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Immatriculation</span>
                <span class="value">{{ selectedAvion?.immatriculation }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Compagnie</span>
                <span class="value">{{ selectedAvion?.compagnie }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Type</span>
                <span class="value">{{ selectedAvion?.typeAvion }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Version configuration</span>
                <span class="value">v{{ selectedAvion?.versionConfiguration || 1 }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="selectedAvion?.configuration">
            <h4>Configuration actuelle</h4>
            <div class="detail-grid">
              <div class="detail-item" v-if="selectedAvion.configuration.siegesPremiere">
                <span class="label">Première classe</span>
                <span class="value">{{ selectedAvion.configuration.siegesPremiere }} sièges</span>
              </div>
              <div class="detail-item" v-if="selectedAvion.configuration.siegesAffaires">
                <span class="label">Affaires</span>
                <span class="value">{{ selectedAvion.configuration.siegesAffaires }} sièges</span>
              </div>
              <div class="detail-item" v-if="selectedAvion.configuration.siegesEconomique">
                <span class="label">Économique</span>
                <span class="value">{{ selectedAvion.configuration.siegesEconomique }} sièges</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            v-if="canModifyConfig"
            class="btn btn-outline"
            @click="openRevisionPlanModal(selectedAvion); showDetailModal = false"
          >
            Planifier révision
          </button>
          <button class="btn btn-secondary" @click="showDetailModal = false">Fermer</button>
        </div>
      </div>
    </div>

    <!-- Toast notifications -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { avionsAPI } from '@/services/api'
import { ROLES } from '@/config/roles'

const authStore = useAuthStore()

// États
const loading = ref(false)
const avions = ref([])
const searchQuery = ref('')
const statistiques = ref({})
const revisionsProchaines = ref([])
const loadingRevisions = ref(false)
const versions = ref([])
const loadingVersions = ref(false)

// Modals
const showCreateModal = ref(false)
const showConfigModal = ref(false)
const showVersionsModal = ref(false)
const showRevisionPlanModal = ref(false)
const showRevisionsModal = ref(false)
const showCompareModal = ref(false)
const showDetailModal = ref(false)

// Sélections
const selectedAvion = ref(null)
const editingAvion = ref(null)

// Formulaires
const avionForm = ref({
  immatriculation: '',
  compagnie: '',
  typeAvion: '',
  modele: ''
})

const configForm = ref({
  siegesPremiere: 0,
  siegesAffaires: 0,
  siegesEconomique: 0,
  capaciteSoute: 0,
  capaciteCarburant: 0,
  equipementPMR: false,
  equipementMedical: false,
  equipementFret: false,
  description: ''
})

const revisionForm = ref({
  typeRevision: '',
  dateRevision: '',
  description: ''
})

// Comparaison
const compareV1 = ref('')
const compareV2 = ref('')
const comparaisonResult = ref({})
const loadingCompare = ref(false)

// Toast
const toast = ref({ show: false, message: '', type: 'success' })

// Permissions MVS-8
const userRole = computed(() => authStore.currentUser?.fonction || authStore.currentUser?.role)
const canCreateAvion = computed(() => [ROLES.MANAGER, ROLES.ADMIN].includes(userRole.value))
const canModifyConfig = computed(() => [ROLES.SUPERVISEUR, ROLES.MANAGER, ROLES.ADMIN].includes(userRole.value))
const canViewStats = computed(() => [ROLES.MANAGER, ROLES.ADMIN].includes(userRole.value))

// Computed
const filteredAvions = computed(() => {
  if (!searchQuery.value) return avions.value
  const q = searchQuery.value.toLowerCase()
  return avions.value.filter(a =>
    a.immatriculation?.toLowerCase().includes(q) ||
    a.compagnie?.toLowerCase().includes(q) ||
    a.typeAvion?.toLowerCase().includes(q)
  )
})

const minRevisionDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Chargement initial
onMounted(async () => {
  await Promise.all([
    loadAvions(),
    loadRevisionsProchaines(),
    loadStatistiques()
  ])
})

// Fonctions de chargement
const loadAvions = async () => {
  loading.value = true
  try {
    const response = await avionsAPI.getAll()
    avions.value = response.data?.avions || response.data || []
  } catch (error) {
    console.error('[AvionsGestion] Erreur chargement avions:', error)
    showToast('Erreur lors du chargement des avions', 'error')
  } finally {
    loading.value = false
  }
}

const loadRevisionsProchaines = async () => {
  loadingRevisions.value = true
  try {
    const response = await avionsAPI.getRevisionsProchaines()
    revisionsProchaines.value = response.data?.revisions || response.data || []
  } catch (error) {
    console.warn('[AvionsGestion] Erreur chargement révisions:', error.message)
    revisionsProchaines.value = []
  } finally {
    loadingRevisions.value = false
  }
}

const loadStatistiques = async () => {
  if (!canViewStats.value) return
  try {
    const response = await avionsAPI.getStatistiquesConfigurations()
    statistiques.value = response.data || {}
  } catch (error) {
    console.warn('[AvionsGestion] Erreur chargement stats:', error.message)
  }
}

const loadVersions = async (avionId) => {
  loadingVersions.value = true
  try {
    const response = await avionsAPI.getVersions(avionId)
    versions.value = response.data?.versions || response.data || []
  } catch (error) {
    console.error('[AvionsGestion] Erreur chargement versions:', error)
    versions.value = []
  } finally {
    loadingVersions.value = false
  }
}

// Actions modals
const openCreateModal = () => {
  editingAvion.value = null
  avionForm.value = {
    immatriculation: '',
    compagnie: '',
    typeAvion: '',
    modele: ''
  }
  showCreateModal.value = true
}

const openDetailModal = (avion) => {
  selectedAvion.value = avion
  showDetailModal.value = true
}

const openConfigModal = (avion) => {
  selectedAvion.value = avion
  configForm.value = {
    siegesPremiere: avion.configuration?.siegesPremiere || 0,
    siegesAffaires: avion.configuration?.siegesAffaires || 0,
    siegesEconomique: avion.configuration?.siegesEconomique || 0,
    capaciteSoute: avion.configuration?.capaciteSoute || 0,
    capaciteCarburant: avion.configuration?.capaciteCarburant || 0,
    equipementPMR: avion.configuration?.equipementPMR || false,
    equipementMedical: avion.configuration?.equipementMedical || false,
    equipementFret: avion.configuration?.equipementFret || false,
    description: ''
  }
  showConfigModal.value = true
}

const openVersionsModal = async (avion) => {
  selectedAvion.value = avion
  compareV1.value = ''
  compareV2.value = ''
  showVersionsModal.value = true
  await loadVersions(avion.id || avion._id)
}

const openRevisionPlanModal = (avion) => {
  selectedAvion.value = avion
  revisionForm.value = {
    typeRevision: '',
    dateRevision: '',
    description: ''
  }
  showRevisionPlanModal.value = true
}

// Actions CRUD
const saveAvion = async () => {
  try {
    if (editingAvion.value) {
      // Modification
      await avionsAPI.update(editingAvion.value.id || editingAvion.value._id, avionForm.value)
      showToast('Avion modifié avec succès', 'success')
    } else {
      // Création
      await avionsAPI.create(avionForm.value)
      showToast('Avion créé avec succès', 'success')
    }
    showCreateModal.value = false
    await loadAvions()
  } catch (error) {
    console.error('[AvionsGestion] Erreur sauvegarde avion:', error)
    showToast(error.response?.data?.message || 'Erreur lors de la sauvegarde', 'error')
  }
}

const saveConfiguration = async () => {
  try {
    const avionId = selectedAvion.value.id || selectedAvion.value._id
    await avionsAPI.updateConfiguration(avionId, { configuration: configForm.value })
    showToast('Configuration mise à jour (nouvelle version créée)', 'success')
    showConfigModal.value = false
    await loadAvions()
  } catch (error) {
    console.error('[AvionsGestion] Erreur sauvegarde config:', error)
    showToast(error.response?.data?.message || 'Erreur lors de la mise à jour', 'error')
  }
}

const restaurerVersion = async (numeroVersion) => {
  if (!confirm(`Restaurer la version ${numeroVersion} ? Une nouvelle version sera créée avec l'ancienne configuration.`)) {
    return
  }

  try {
    const avionId = selectedAvion.value.id || selectedAvion.value._id
    await avionsAPI.restaurerVersion(avionId, numeroVersion)
    showToast(`Version ${numeroVersion} restaurée avec succès`, 'success')
    await loadVersions(avionId)
    await loadAvions()
  } catch (error) {
    console.error('[AvionsGestion] Erreur restauration:', error)
    showToast(error.response?.data?.message || 'Erreur lors de la restauration', 'error')
  }
}

const compareVersions = async () => {
  loadingCompare.value = true
  showCompareModal.value = true
  try {
    const avionId = selectedAvion.value.id || selectedAvion.value._id
    const response = await avionsAPI.comparerVersions(avionId, compareV1.value, compareV2.value)
    comparaisonResult.value = response.data?.differences || response.data || {}
  } catch (error) {
    console.error('[AvionsGestion] Erreur comparaison:', error)
    showToast('Erreur lors de la comparaison', 'error')
    comparaisonResult.value = {}
  } finally {
    loadingCompare.value = false
  }
}

const viewVersionDetail = (version) => {
  alert(`Version ${version.numero}\n\nDate: ${formatDateTime(version.dateCreation)}\nDescription: ${version.description || 'Non spécifiée'}\n\nConfiguration:\n${JSON.stringify(version.configuration, null, 2)}`)
}

const planifierRevision = async () => {
  try {
    const avionId = selectedAvion.value.id || selectedAvion.value._id
    await avionsAPI.planifierRevision(avionId, revisionForm.value)
    showToast('Révision planifiée avec succès', 'success')
    showRevisionPlanModal.value = false
    await Promise.all([loadAvions(), loadRevisionsProchaines()])
  } catch (error) {
    console.error('[AvionsGestion] Erreur planification:', error)
    showToast(error.response?.data?.message || 'Erreur lors de la planification', 'error')
  }
}

// Utilitaires
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('fr-FR')
}

const getRevisionClass = (revision) => {
  if (!revision?.dateRevision) return ''
  const date = new Date(revision.dateRevision)
  const now = new Date()
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 7) return 'urgent'
  if (diffDays <= 30) return 'warning'
  return 'ok'
}

const getDelayText = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return `${Math.abs(diffDays)} jours de retard`
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Demain'
  return `Dans ${diffDays} jours`
}

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}
</script>

<style scoped>
.avions-gestion-container {
  min-height: 100vh;
  background: #f9fafb;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-back {
  background: #f3f4f6;
  color: #374151;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 14px;
  border: none;
  cursor: pointer;
}

.btn-back:hover {
  background: #e5e7eb;
}

.page-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* Stats Dashboard */
.stats-dashboard {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stats-dashboard h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #374151;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.stat-card.warning {
  background: #fef3c7;
  border: 1px solid #f59e0b;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.stat-card.warning .stat-value {
  color: #92400e;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

/* Liste avions */
.avions-list {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  color: #374151;
}

.filters .form-input {
  width: 250px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  font-weight: 600;
  color: #6b7280;
  font-size: 13px;
  text-transform: uppercase;
}

.data-table td.immat {
  font-weight: 600;
  color: #1f2937;
}

.version-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.revision-date {
  font-size: 13px;
}

.revision-date.overdue {
  color: #dc2626;
  font-weight: 600;
}

.revision-date.urgent {
  color: #ea580c;
  font-weight: 600;
}

.revision-date.warning {
  color: #ca8a04;
}

.revision-date.ok {
  color: #16a34a;
}

.no-revision {
  color: #9ca3af;
  font-style: italic;
}

.actions {
  display: flex;
  gap: 8px;
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
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.modal-large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

/* Forms */
.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

/* Config notice */
.config-notice {
  background: #dbeafe;
  color: #1e40af;
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.config-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.config-section h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #6b7280;
  text-transform: uppercase;
}

/* Versions */
.compare-section {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.compare-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.compare-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.compare-row .form-input {
  width: 120px;
}

.vs-label {
  font-weight: 600;
  color: #6b7280;
}

.versions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.version-item {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
}

.version-item.current {
  background: #dbeafe;
  border-color: #3b82f6;
}

.version-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.version-number {
  font-weight: 700;
  font-size: 16px;
  color: #1f2937;
}

.current-badge {
  background: #2563eb;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.version-date {
  color: #6b7280;
  font-size: 13px;
  margin-left: auto;
}

.version-description {
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
}

.version-author {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.version-actions {
  display: flex;
  gap: 8px;
}

/* Révisions */
.revision-types-info {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.revision-types-info h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.revision-types-info ul {
  margin: 0;
  padding-left: 20px;
}

.revision-types-info li {
  font-size: 13px;
  color: #374151;
  margin-bottom: 4px;
}

.revisions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.revision-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
}

.revision-item.overdue {
  background: #fef2f2;
  border-color: #fecaca;
}

.revision-item.urgent {
  background: #fff7ed;
  border-color: #fed7aa;
}

.revision-item.warning {
  background: #fefce8;
  border-color: #fef08a;
}

.revision-avion strong {
  font-size: 16px;
  color: #1f2937;
}

.revision-type {
  margin-left: 8px;
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.revision-date-info {
  text-align: center;
}

.revision-date-info .date {
  display: block;
  font-weight: 600;
  color: #1f2937;
}

.revision-date-info .delay {
  font-size: 12px;
  color: #6b7280;
}

/* Comparaison */
.compare-result {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.diff-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8fafc;
  border-radius: 6px;
}

.diff-key {
  font-weight: 600;
  color: #374151;
}

.diff-values {
  display: flex;
  align-items: center;
  gap: 10px;
}

.diff-old {
  color: #dc2626;
  text-decoration: line-through;
}

.diff-arrow {
  color: #6b7280;
}

.diff-new {
  color: #16a34a;
  font-weight: 600;
}

/* Détails */
.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #6b7280;
  text-transform: uppercase;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item .label {
  font-size: 12px;
  color: #6b7280;
}

.detail-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  position: relative;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.badge-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc2626;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* États */
.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.empty-state.success {
  color: #16a34a;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 8px;
  font-weight: 500;
  z-index: 2000;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.toast.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
