<template>
  <div class="crv-phases-component card">
    <div class="section-header">
      <h3 class="section-title">Phases opérationnelles</h3>
      <!-- MVS-3 #3: Compteur progression phases -->
      <div class="phases-progress">
        <span class="progress-count">{{ phasesCompletes }}/{{ phases.length }} terminées</span>
        <span class="progress-impact">= {{ phasesCompletude }}% complétude phases</span>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Chargement des phases...</p>
    </div>

    <div v-else-if="phases.length === 0" class="empty-state">
      <p>Aucune phase disponible pour ce CRV</p>
    </div>

    <div v-else class="phases-list">
      <template v-for="(groupe, gi) in phasesGroupees" :key="gi">
        <div v-if="groupe.group" class="phase-group-header">
          <span class="phase-group-label" :class="'group-' + groupe.group.toLowerCase()">{{ groupe.label }}</span>
          <span class="phase-group-count">{{ groupe.phases.length }} phase{{ groupe.phases.length > 1 ? 's' : '' }}</span>
        </div>
      <div
        v-for="phase in groupe.phases"
        :key="phase.id || phase._id"
        class="phase-item"
        :class="{ 'phase-termine': phase.statut === 'TERMINE', 'phase-non-realise': phase.statut === 'NON_REALISE' }"
      >
        <div class="phase-header">
          <div class="phase-title-row">
            <h4>{{ getPhaseNom(phase) }}</h4>
            <!-- MVS-3 #2: Tag type opération -->
            <span
              v-if="getPhaseTypeOperation(phase)"
              class="type-operation-tag"
              :class="'type-' + getPhaseTypeOperation(phase).toLowerCase()"
            >
              {{ getPhaseTypeOperation(phase) }}
            </span>
          </div>
          <span class="phase-status" :class="getStatusClass(phase.statut)">
            {{ getStatusLabel(phase.statut) }}
          </span>
        </div>

        <!-- Countdown SLA temps réel -->
        <SLACountdown :phase="phase" />

        <!-- Indicateur SLA terrain (si applicable à cette phase) -->
        <div v-if="getPhaseSLATerrain(phase)" class="phase-sla-indicator" :class="'phase-sla-' + (getPhaseSLATerrain(phase).niveau || 'attente')">
          <span class="phase-sla-icon">{{ { ok: '🟢', warning: '🟡', critical: '🟠', exceeded: '🔴' }[getPhaseSLATerrain(phase).niveau] || '⏳' }}</span>
          <span class="phase-sla-text">
            <template v-if="getPhaseSLATerrain(phase).niveau === 'exceeded'">
              SLA {{ getPhaseSLATerrain(phase).domaine }} dépassé
              <template v-if="getPhaseSLATerrain(phase).detail"> — {{ getPhaseSLATerrain(phase).detail }}</template>
            </template>
            <template v-else-if="getPhaseSLATerrain(phase).niveau === 'critical'">
              SLA {{ getPhaseSLATerrain(phase).domaine }} critique
              <template v-if="getPhaseSLATerrain(phase).detail"> — {{ getPhaseSLATerrain(phase).detail }}</template>
            </template>
            <template v-else-if="getPhaseSLATerrain(phase).niveau === 'warning'">
              SLA {{ getPhaseSLATerrain(phase).domaine }} à surveiller
            </template>
            <template v-else-if="getPhaseSLATerrain(phase).niveau === 'ok'">
              SLA {{ getPhaseSLATerrain(phase).domaine }} OK
            </template>
            <template v-else>
              SLA {{ getPhaseSLATerrain(phase).domaine }} — en attente horodatage
            </template>
          </span>
        </div>

        <!-- Indicateur durée locale (uniquement si PAS de SLA terrain sur cette phase) -->
        <div v-if="getPhaseOwnSLA(phase) && !getPhaseSLATerrain(phase)" class="phase-duration-indicator" :class="'duration-' + getPhaseOwnSLA(phase).niveau">
          <span class="duration-icon">⏱</span>
          <span class="duration-text">Durée : {{ getPhaseOwnSLA(phase).label }}</span>
        </div>

        <!-- MVS-3 #1: Affichage des prérequis -->
        <div v-if="phase.phase?.prerequis?.length > 0" class="phase-prerequis">
          <span class="prerequis-label">Prérequis :</span>
          <template v-if="canStartPhase(phase).canStart">
            <span class="prerequis-ok">Tous satisfaits</span>
          </template>
          <template v-else>
            <span class="prerequis-manquants">
              Terminez d'abord : {{ canStartPhase(phase).prerequisManquants.join(', ') }}
            </span>
          </template>
        </div>

        <!-- Phase NON_COMMENCE: permettre de démarrer avec saisie manuelle des heures -->
        <div v-if="phase.statut === 'NON_COMMENCE'" class="phase-actions-block">
          <!-- Mode édition : saisie manuelle des heures -->
          <div v-if="phaseEditId === (phase.id || phase._id)" class="manual-hours-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Heure de début <span class="required">*</span></label>
                <input
                  v-model="editHeureDebut"
                  type="time"
                  class="form-input"
                  :disabled="saving"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Heure de fin (optionnel)</label>
                <input
                  v-model="editHeureFin"
                  type="time"
                  class="form-input"
                  :disabled="saving"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Remarques (optionnel)</label>
              <textarea
                v-model="editRemarques"
                class="form-input"
                rows="2"
                placeholder="Observations sur cette phase..."
                :disabled="saving"
              ></textarea>
            </div>
            <div class="form-actions">
              <button
                @click="handleSavePhaseManuel(phase)"
                class="btn btn-success btn-sm"
                :disabled="!editHeureDebut || saving"
                type="button"
              >
                {{ editHeureFin ? 'Enregistrer (Terminée)' : 'Enregistrer (En cours)' }}
              </button>
              <button
                @click="cancelEdit"
                class="btn btn-secondary btn-sm"
                :disabled="saving"
                type="button"
              >
                Annuler
              </button>
            </div>
          </div>

          <!-- Actions par défaut -->
          <div v-else class="form-row">
            <div class="form-group">
              <label class="form-label">Action</label>
              <div class="action-buttons">
                <!-- MVS-3 #1: Bouton bloqué si prérequis manquants -->
                <button
                  @click="showEditForm(phase)"
                  class="btn btn-primary btn-sm"
                  :disabled="disabled || saving || !canStartPhase(phase).canStart"
                  :title="!canStartPhase(phase).canStart ? 'Terminez d\'abord les phases prérequises' : ''"
                  type="button"
                >
                  Saisir les heures
                </button>
                <button
                  @click="showNonRealiseForm(phase)"
                  class="btn btn-secondary btn-sm"
                  :disabled="disabled || saving"
                  type="button"
                >
                  Non réalisée
                </button>
              </div>
            </div>
          </div>

          <!-- Formulaire pour phase non réalisée - CORRECTION AUDIT: detailMotif OBLIGATOIRE si AUTRE -->
          <div v-if="phaseNonRealiseId === (phase.id || phase._id)" class="non-realise-form">
            <!-- MVS-3 #4 & #5: Notes informationnelles -->
            <div class="non-realise-info-banner">
              <p><strong>Note :</strong> Les heures saisies seront effacées.</p>
              <p>Une phase non réalisée compte comme terminée pour la progression.</p>
            </div>

            <div class="form-group">
              <label class="form-label">
                Motif de non-réalisation <span class="required">*</span>
              </label>
              <select v-model="motifNonRealisation" class="form-input" required>
                <option value="">Sélectionner un motif</option>
                <option v-for="motif in motifsNonRealisation" :key="motif.value" :value="motif.value">
                  {{ motif.label }}
                </option>
              </select>
            </div>
            <!-- CORRECTION AUDIT: detailMotif OBLIGATOIRE si motif = AUTRE -->
            <div class="form-group">
              <label class="form-label">
                Détail du motif
                <span v-if="motifNonRealisation === 'AUTRE'" class="required">*</span>
                <span v-else>(optionnel)</span>
              </label>
              <textarea
                v-model="detailMotif"
                class="form-input"
                rows="2"
                :placeholder="motifNonRealisation === 'AUTRE' ? 'Précisions OBLIGATOIRES sur le motif...' : 'Précisions sur le motif...'"
                :class="{ 'required-field': motifNonRealisation === 'AUTRE' && !detailMotif?.trim() }"
              ></textarea>
              <p v-if="motifNonRealisation === 'AUTRE' && !detailMotif?.trim()" class="field-hint error">
                Le détail est obligatoire pour le motif "Autre"
              </p>
            </div>
            <div class="form-actions">
              <button
                @click="handleMarquerNonRealisee(phase)"
                class="btn btn-warning btn-sm"
                :disabled="!canSubmitNonRealise || saving"
                type="button"
              >
                Confirmer non réalisée
              </button>
              <button
                @click="cancelNonRealise"
                class="btn btn-secondary btn-sm"
                type="button"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>

        <!-- Phase EN_COURS: permettre de terminer avec saisie manuelle -->
        <div v-if="phase.statut === 'EN_COURS'" class="phase-actions-block">
          <!-- Mode édition -->
          <div v-if="phaseEditId === (phase.id || phase._id)" class="manual-hours-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ isPhaseInstant(phase) ? 'Heure' : 'Heure de début' }}</label>
                <input
                  v-model="editHeureDebut"
                  type="time"
                  class="form-input"
                  :disabled="saving"
                />
              </div>
              <div v-if="!isPhaseInstant(phase)" class="form-group">
                <label class="form-label">Heure de fin <span class="required">*</span></label>
                <input
                  v-model="editHeureFin"
                  type="time"
                  class="form-input"
                  :disabled="saving"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Remarques (optionnel)</label>
              <textarea
                v-model="editRemarques"
                class="form-input"
                rows="2"
                placeholder="Observations sur cette phase..."
                :disabled="saving"
              ></textarea>
            </div>
            <div class="form-actions">
              <button
                @click="handleSavePhaseManuel(phase)"
                class="btn btn-success btn-sm"
                :disabled="(isPhaseInstant(phase) ? !editHeureDebut : !editHeureFin) || saving"
                type="button"
              >
                {{ isPhaseInstant(phase) ? 'Confirmer l\'heure' : 'Terminer la phase' }}
              </button>
              <button
                @click="cancelEdit"
                class="btn btn-secondary btn-sm"
                :disabled="saving"
                type="button"
              >
                Annuler
              </button>
            </div>
          </div>

          <!-- Vue par défaut -->
          <div v-else class="form-row">
            <div class="form-group">
              <label class="form-label">{{ isPhaseInstant(phase) ? 'Heure' : 'Heure de début' }}</label>
              <input
                :value="formatTime(phase.heureDebutReelle)"
                type="time"
                class="form-input"
                disabled
              />
            </div>
            <div v-if="!isPhaseInstant(phase)" class="form-group">
              <label class="form-label">Action</label>
              <button
                @click="showEditForm(phase, true)"
                class="btn btn-success btn-sm"
                :disabled="disabled || saving"
                type="button"
              >
                Saisir l'heure de fin
              </button>
            </div>
          </div>
        </div>

        <!-- Phase TERMINE: afficher les infos avec possibilité d'édition -->
        <div v-if="phase.statut === 'TERMINE'" class="phase-info-block">
          <!-- Mode édition -->
          <div v-if="phaseEditId === (phase.id || phase._id)" class="manual-hours-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Heure de début</label>
                <input
                  v-model="editHeureDebut"
                  type="time"
                  class="form-input"
                  :disabled="saving"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Heure de fin</label>
                <input
                  v-model="editHeureFin"
                  type="time"
                  class="form-input"
                  :disabled="saving"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Remarques</label>
              <textarea
                v-model="editRemarques"
                class="form-input"
                rows="2"
                :disabled="saving"
              ></textarea>
            </div>
            <div class="form-actions">
              <button
                @click="handleSavePhaseManuel(phase)"
                class="btn btn-primary btn-sm"
                :disabled="saving"
                type="button"
              >
                Mettre à jour
              </button>
              <button
                @click="cancelEdit"
                class="btn btn-secondary btn-sm"
                :disabled="saving"
                type="button"
              >
                Annuler
              </button>
            </div>
          </div>

          <!-- Vue par défaut -->
          <div v-else>
            <!-- Horaires prévus (lecture seule) -->
            <div v-if="phase.heureDebutPrevue || phase.heureFinPrevue" class="form-row phase-prevu-row">
              <div class="form-group">
                <label class="form-label prevu-label">Début prévu</label>
                <input
                  :value="formatDateTime(phase.heureDebutPrevue)"
                  type="text"
                  class="form-input prevu-input"
                  disabled
                />
              </div>
              <div class="form-group">
                <label class="form-label prevu-label">Fin prévue</label>
                <input
                  :value="formatDateTime(phase.heureFinPrevue)"
                  type="text"
                  class="form-input prevu-input"
                  disabled
                />
              </div>
            </div>
            <!-- Horaires réels -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ isPhaseInstant(phase) ? 'Heure' : 'Début réel' }}</label>
                <input
                  :value="formatTime(phase.heureDebutReelle)"
                  type="time"
                  class="form-input"
                  disabled
                />
              </div>
              <div v-if="!isPhaseInstant(phase)" class="form-group">
                <label class="form-label">Fin réelle</label>
                <input
                  :value="formatTime(phase.heureFinReelle)"
                  type="time"
                  class="form-input"
                  disabled
                />
              </div>
              <div v-if="!isPhaseInstant(phase)" class="form-group">
                <label class="form-label">Durée</label>
                <input
                  :value="formatDuree(phase.dureeReelleMinutes)"
                  type="text"
                  class="form-input"
                  disabled
                />
              </div>
              <!-- Écart SLA — utilise ecartMinutes du backend -->
              <div v-if="phase.ecartMinutes !== null && phase.ecartMinutes !== undefined" class="form-group">
                <label class="form-label">Écart</label>
                <div
                  class="ecart-sla"
                  :class="{
                    'ecart-ok': Math.abs(phase.ecartMinutes) <= getPhaseSeuil(phase),
                    'ecart-depassement': Math.abs(phase.ecartMinutes) > getPhaseSeuil(phase)
                  }"
                >
                  <span class="ecart-valeur">
                    {{ phase.ecartMinutes > 0 ? '+' : '' }}{{ phase.ecartMinutes }} min
                  </span>
                  <span class="ecart-seuil">(tolérance: {{ getPhaseSeuil(phase) }} min)</span>
                </div>
              </div>
              <div v-if="!disabled" class="form-group">
                <label class="form-label">Action</label>
                <button
                  @click="showEditForm(phase, false, true)"
                  class="btn btn-secondary btn-sm"
                  :disabled="saving"
                  type="button"
                >
                  Modifier
                </button>
              </div>
            </div>
            <div v-if="phase.remarques" class="form-group">
              <label class="form-label">Remarques</label>
              <p class="observation-text">{{ phase.remarques }}</p>
            </div>
          </div>
        </div>

        <!-- Phase NON_REALISE: afficher le motif -->
        <div v-if="phase.statut === 'NON_REALISE'" class="phase-info-block non-realise-info">
          <div class="form-group">
            <label class="form-label">Motif de non-réalisation</label>
            <p class="motif-text">{{ formatMotif(phase.motifNonRealisation) }}</p>
          </div>
          <div v-if="phase.detailMotif" class="form-group">
            <label class="form-label">Détail</label>
            <p class="observation-text">{{ phase.detailMotif }}</p>
          </div>
        </div>

        <!-- Message d'erreur -->
        <div v-if="phaseError === (phase.id || phase._id)" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
      </template>
    </div>

    <!-- Message d'erreur global -->
    <div v-if="globalError" class="error-banner">
      {{ globalError }}
    </div>
  </div>
</template>

<script setup>
/**
 * CRVPhases.vue - CORRIGÉ AUDIT 2025-01
 *
 * CORRECTIONS APPLIQUÉES:
 * - CORRIGÉ: detailMotif OBLIGATOIRE quand motifNonRealisation = AUTRE
 * - AJOUTÉ: Computed canSubmitNonRealise avec validation
 * - AJOUTÉ: Import des enums centralisés (MOTIF_NON_REALISATION)
 * - AJOUTÉ: Console.log format [CRV][PHASE_*]
 * - AJOUTÉ: Indicateur visuel pour champ obligatoire
 */
import { ref, computed } from 'vue'
import { useCRVStore } from '@/stores/crvStore'
import { useSLA } from '@/composables/useSLA'
import { MOTIF_NON_REALISATION, getEnumOptions } from '@/config/crvEnums'
import SLACountdown from '@/components/crv/SLACountdown.vue'

const props = defineProps({
  phases: {
    type: Array,
    default: () => []
  },
  crvType: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // SLA terrain par domaine — { bagages: {...}, boarding: {...}, checkin: {...} }
  slaTerrain: {
    type: Object,
    default: () => ({})
  },
  // Code IATA compagnie du CRV — pour résolution durée phase par compagnie
  codeIATA: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['phase-update'])

const crvStore = useCRVStore()
const { resoudreDureePhase } = useSLA()

// États locaux
const loading = ref(false)
const saving = ref(false)
const phaseNonRealiseId = ref(null)
const motifNonRealisation = ref('')
const detailMotif = ref('')
const phaseError = ref(null)
const errorMessage = ref('')
const globalError = ref('')

// États pour l'édition manuelle des heures
const phaseEditId = ref(null)
const editHeureDebut = ref('')
const editHeureFin = ref('')
const editRemarques = ref('')
const editStatutOriginal = ref('')

// CORRECTION AUDIT: Utilisation des enums centralisés
const motifsNonRealisation = getEnumOptions(MOTIF_NON_REALISATION)

console.log('[CRV][PHASE_INIT] Enums motifs chargés:', motifsNonRealisation.length)

// CORRECTION AUDIT: Computed pour validation detailMotif OBLIGATOIRE si AUTRE
const canSubmitNonRealise = computed(() => {
  if (!motifNonRealisation.value) {
    console.log('[CRV][PHASE_VALIDATION] canSubmitNonRealise: false (motif manquant)')
    return false
  }

  // Si motif = AUTRE, detailMotif est OBLIGATOIRE
  if (motifNonRealisation.value === MOTIF_NON_REALISATION.AUTRE) {
    const hasDetail = detailMotif.value?.trim()?.length > 0
    console.log('[CRV][PHASE_VALIDATION] canSubmitNonRealise: motif=AUTRE, detailMotif requis:', hasDetail)
    return hasDetail
  }

  console.log('[CRV][PHASE_VALIDATION] canSubmitNonRealise: true')
  return true
})

// MVS-3 #3: Computed pour compteur phases terminées
const phasesCompletes = computed(() => {
  return props.phases.filter(p => p.statut === 'TERMINE' || p.statut === 'NON_REALISE').length
})

// MVS-3 #3: Computed pour % complétude phases (phases = 40% du total)
const phasesCompletude = computed(() => {
  if (props.phases.length === 0) return 0
  const ratio = phasesCompletes.value / props.phases.length
  return Math.round(ratio * 40) // phases = 40% de la complétude totale
})

// MVS-3 #1: Vérifier si une phase peut être démarrée (prérequis satisfaits)
const canStartPhase = (phase) => {
  if (!phase.phase?.prerequis || phase.phase.prerequis.length === 0) {
    return { canStart: true, prerequisManquants: [] }
  }

  const prerequisManquants = []
  for (const prereqId of phase.phase.prerequis) {
    const prereqPhase = props.phases.find(p =>
      (p.phase?.id || p.phase?._id) === prereqId ||
      (p.phaseId) === prereqId
    )
    if (prereqPhase && prereqPhase.statut !== 'TERMINE' && prereqPhase.statut !== 'NON_REALISE') {
      prerequisManquants.push(getPhaseNom(prereqPhase))
    }
  }

  return {
    canStart: prerequisManquants.length === 0,
    prerequisManquants
  }
}

// MVS-3 #2: Obtenir le type d'opération de la phase
const getPhaseTypeOperation = (phase) => {
  return phase.phase?.typeOperation || phase.typeOperation || null
}

// Regroupement visuel des phases par typeOperation (pour TurnAround)
const ORDER_GROUPS = ['ARRIVEE', 'TURN_AROUND', 'DEPART', 'COMMUN']
const GROUP_LABELS = { ARRIVEE: 'Arrivée', TURN_AROUND: 'Turn-Around', DEPART: 'Départ', COMMUN: 'Commun' }

// Tri par phase.ordre au sein d'un groupe
const sortByOrdre = (phases) => [...phases].sort((a, b) => {
  const ordreA = a.phase?.ordre ?? a.ordre ?? 999
  const ordreB = b.phase?.ordre ?? b.ordre ?? 999
  return ordreA - ordreB
})

const phasesGroupees = computed(() => {
  if (!props.phases || props.phases.length === 0) return []
  const types = new Set(props.phases.map(p => getPhaseTypeOperation(p)).filter(Boolean))

  // Si un seul type sans COMMUN — pas besoin de regroupement
  if (types.size === 1 && !types.has('COMMUN')) {
    return [{ group: null, phases: sortByOrdre(props.phases) }]
  }

  // Regrouper par typeOperation pour TOUS les CRV (Arrivée, Départ, TurnAround)
  // Ordre : ARRIVEE → TURN_AROUND → DEPART → COMMUN
  const groups = []
  for (const g of ORDER_GROUPS) {
    const filtered = props.phases.filter(p => getPhaseTypeOperation(p) === g)
    if (filtered.length > 0) groups.push({ group: g, label: GROUP_LABELS[g], phases: sortByOrdre(filtered) })
  }
  // Phases sans type
  const orphans = props.phases.filter(p => !getPhaseTypeOperation(p))
  if (orphans.length > 0) groups.push({ group: 'AUTRE', label: 'Autre', phases: sortByOrdre(orphans) })
  return groups
})

// MVS-3 #6: Obtenir le seuil SLA de la phase (en minutes)
const getPhaseSeuil = (phase) => {
  return phase.phase?.seuilSLA || phase.seuilSLA || 15 // 15 min par défaut
}

// EXTENSION 11 — Détection type temporel
const isPhaseInstant = (phase) => {
  return phase.phase?.typeTemporel === 'INSTANT'
}

// EXTENSION 12 — SLA propre par phase (basé sur dureeStandardMinutes)
const PHASE_SLA_SEUILS = { WARNING: 1.25, CRITICAL: 1.5, EXCEEDED: 1.5 }

/**
 * Calcule le SLA propre d'une phase basé sur sa durée standard.
 * DEBUT_FIN : compare durée réelle (ou temps écoulé) vs dureeStandardMinutes
 * INSTANT : pas de SLA durée (retourne null)
 * @returns {{ niveau, label, cssClass }|null}
 */
const getPhaseOwnSLA = (phase) => {
  // Pas de SLA pour les instants — une seule heure, pas de durée
  if (isPhaseInstant(phase)) return null

  const defaultStandard = phase.phase?.dureeStandardMinutes
  if (!defaultStandard || defaultStandard <= 0) return null

  // Résolution par compagnie : phaseDurees[code] sinon Phase.dureeStandardMinutes
  const codePhase = phase.phase?.code
  const { duree: standard, source } = codePhase && props.codeIATA
    ? resoudreDureePhase(codePhase, props.codeIATA, defaultStandard)
    : { duree: defaultStandard, source: 'standard' }

  // Phase terminée → utiliser durée réelle
  if (phase.statut === 'TERMINE' && phase.dureeReelleMinutes != null) {
    return qualifyPhaseSLA(phase.dureeReelleMinutes, standard, source)
  }

  // Phase en cours → utiliser temps écoulé depuis début
  if (phase.statut === 'EN_COURS' && phase.heureDebutReelle) {
    const debut = new Date(phase.heureDebutReelle)
    const elapsed = Math.round((new Date() - debut) / 60000)
    if (elapsed >= 0) return qualifyPhaseSLA(elapsed, standard, source)
  }

  // Non démarrée ou données manquantes
  return null
}

function qualifyPhaseSLA(minutes, standard, source = 'standard') {
  const ratio = minutes / standard
  const srcLabel = source !== 'standard' ? ` · ${source}` : ''
  if (ratio > PHASE_SLA_SEUILS.EXCEEDED) {
    return { niveau: 'exceeded', label: `${minutes}/${standard} min — Dépassé${srcLabel}`, cssClass: 'phase-sla-exceeded' }
  } else if (ratio > PHASE_SLA_SEUILS.CRITICAL) {
    return { niveau: 'critical', label: `${minutes}/${standard} min — Critique${srcLabel}`, cssClass: 'phase-sla-critical' }
  } else if (ratio > PHASE_SLA_SEUILS.WARNING) {
    return { niveau: 'warning', label: `${minutes}/${standard} min${srcLabel}`, cssClass: 'phase-sla-warning' }
  }
  return { niveau: 'ok', label: `${minutes}/${standard} min${srcLabel}`, cssClass: 'phase-sla-ok' }
}

/**
 * Résoudre le SLA terrain applicable à une phase donnée
 * Mapping : catégorie phase → domaine SLA terrain
 * Ne retourne un résultat que si le SLA terrain est réellement calculable
 */
const getPhaseSLATerrain = (phase) => {
  const categorie = phase.phase?.categorie
  const typeOp = getPhaseTypeOperation(phase)
  const libelle = (phase.phase?.libelle || '').toLowerCase()

  // Bagages : phases catégorie BAGAGE avec libellé contenant "livraison" ou "déchargement"
  if (categorie === 'BAGAGE' && (libelle.includes('livraison') || libelle.includes('déchargement') || libelle.includes('dechargement'))) {
    const sla = props.slaTerrain?.bagages
    if (sla) return { domaine: 'Bagages', niveau: (sla.niveau || '').toLowerCase(), detail: sla.detail }
  }

  // Boarding : phase embarquement passagers (catégorie PASSAGERS, type DEPART ou TURN_AROUND)
  if (categorie === 'PASSAGERS' && (typeOp === 'DEPART' || typeOp === 'TURN_AROUND') && libelle.includes('embarquement')) {
    const sla = props.slaTerrain?.boarding
    if (sla) return { domaine: 'Boarding', niveau: (sla.niveau || '').toLowerCase(), detail: sla.detail }
  }

  // Check-in : DEP_CHECKIN et TA_CHECKIN sont désormais des phases (Palier 2)
  // Le SLA terrain check-in est géré par le SLACountdown (mode DEADLINE), pas par cet indicateur statique
  if (categorie === 'PASSAGERS' && (typeOp === 'DEPART' || typeOp === 'TURN_AROUND') && libelle.includes('enregistrement')) {
    const sla = props.slaTerrain?.checkin
    if (sla) return { domaine: 'Check-in', niveau: (sla.niveau || '').toLowerCase(), detail: sla.detail }
  }

  return null
}

// Formatters
const formatTime = (datetime) => {
  if (!datetime) return ''
  if (datetime.includes('T')) {
    return datetime.split('T')[1]?.substring(0, 5) || ''
  }
  return datetime.substring(0, 5)
}

const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  const d = new Date(datetime)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const formatDuree = (minutes) => {
  if (!minutes) return '-'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) {
    return `${h}h ${m}min`
  }
  return `${m} min`
}

// CORRECTION AUDIT: Labels motifs conformes
const formatMotif = (motif) => {
  const motifs = {
    [MOTIF_NON_REALISATION.NON_NECESSAIRE]: 'Non nécessaire',
    [MOTIF_NON_REALISATION.EQUIPEMENT_INDISPONIBLE]: 'Équipement indisponible',
    [MOTIF_NON_REALISATION.PERSONNEL_ABSENT]: 'Personnel absent',
    [MOTIF_NON_REALISATION.CONDITIONS_METEO]: 'Conditions météo',
    [MOTIF_NON_REALISATION.AUTRE]: 'Autre'
  }
  return motifs[motif] || motif || 'Non spécifié'
}

// Obtenir le nom de la phase (structure imbriquée du backend)
const getPhaseNom = (phase) => {
  return phase.phase?.libelle || phase.nomPhase || phase.nom || 'Phase sans nom'
}

const getStatusClass = (statut) => {
  return {
    'status-non-commence': statut === 'NON_COMMENCE',
    'status-en-cours': statut === 'EN_COURS',
    'status-termine': statut === 'TERMINE',
    'status-non-realise': statut === 'NON_REALISE',
    'status-annule': statut === 'ANNULE'
  }
}

const getStatusLabel = (statut) => {
  const labels = {
    'NON_COMMENCE': 'Non démarrée',
    'EN_COURS': 'En cours',
    'TERMINE': 'Terminée',
    'NON_REALISE': 'Non réalisée',
    'ANNULE': 'Annulée'
  }
  return labels[statut] || statut
}

// Ouvrir le formulaire d'édition manuelle
const showEditForm = (phase, prefillFromPhase = false, isTerminee = false) => {
  const phaseId = phase.id || phase._id
  console.log('[CRV][PHASE_EDIT] showEditForm:', phaseId, { prefillFromPhase, isTerminee })

  phaseEditId.value = phaseId
  editStatutOriginal.value = phase.statut

  if (prefillFromPhase || isTerminee) {
    editHeureDebut.value = formatTime(phase.heureDebutReelle)
    editHeureFin.value = formatTime(phase.heureFinReelle) || ''
    editRemarques.value = phase.remarques || ''
  } else {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    editHeureDebut.value = currentTime
    editHeureFin.value = ''
    editRemarques.value = ''
  }

  phaseNonRealiseId.value = null
  phaseError.value = null
}

const cancelEdit = () => {
  console.log('[CRV][PHASE_EDIT] cancelEdit')
  phaseEditId.value = null
  editHeureDebut.value = ''
  editHeureFin.value = ''
  editRemarques.value = ''
  editStatutOriginal.value = ''
}

const handleSavePhaseManuel = async (phase) => {
  const phaseId = phase.id || phase._id
  console.log('[CRV][PHASE_SAVE] handleSavePhaseManuel:', phaseId, {
    heureDebut: editHeureDebut.value,
    heureFin: editHeureFin.value,
    remarques: editRemarques.value,
    statutOriginal: editStatutOriginal.value
  })

  saving.value = true
  phaseError.value = null
  globalError.value = ''

  try {
    const data = {}
    const instant = isPhaseInstant(phase)

    if (instant) {
      // INSTANT : une seule heure → directement TERMINE
      data.statut = 'TERMINE'
      if (editHeureDebut.value) {
        data.heureDebutReelle = editHeureDebut.value
      }
    } else if (editHeureFin.value) {
      data.statut = 'TERMINE'
    } else if (editStatutOriginal.value === 'NON_COMMENCE') {
      data.statut = 'EN_COURS'
    }

    if (!instant && editHeureDebut.value) {
      data.heureDebutReelle = editHeureDebut.value
    }
    if (editHeureFin.value) {
      data.heureFinReelle = editHeureFin.value
    }

    if (editRemarques.value) {
      data.remarques = editRemarques.value
    }

    console.log('[CRV][PHASE_API] Envoi données:', data)

    await crvStore.updatePhaseManuel(phaseId, data)
    console.log('[CRV][PHASE_SUCCESS] Phase mise à jour avec succès')

    cancelEdit()
    emit('phase-update', { action: 'update-manuel', phaseId, data })
  } catch (error) {
    console.error('[CRV][PHASE_ERROR] Erreur mise à jour phase:', error)
    phaseError.value = phaseId
    errorMessage.value = error.message || 'Erreur lors de la mise à jour'
  } finally {
    saving.value = false
  }
}

const showNonRealiseForm = (phase) => {
  const phaseId = phase.id || phase._id
  console.log('[CRV][PHASE_NON_REALISE] showNonRealiseForm:', phaseId)
  phaseNonRealiseId.value = phaseId
  motifNonRealisation.value = ''
  detailMotif.value = ''
  phaseError.value = null
  phaseEditId.value = null
}

const cancelNonRealise = () => {
  console.log('[CRV][PHASE_NON_REALISE] cancelNonRealise')
  phaseNonRealiseId.value = null
  motifNonRealisation.value = ''
  detailMotif.value = ''
}

const handleMarquerNonRealisee = async (phase) => {
  const phaseId = phase.id || phase._id
  console.log('[CRV][PHASE_NON_REALISE] handleMarquerNonRealisee:', phaseId, {
    motif: motifNonRealisation.value,
    detail: detailMotif.value
  })

  // CORRECTION AUDIT: Validation detailMotif OBLIGATOIRE si AUTRE
  if (!canSubmitNonRealise.value) {
    phaseError.value = phaseId
    if (motifNonRealisation.value === MOTIF_NON_REALISATION.AUTRE) {
      errorMessage.value = 'Le détail du motif est obligatoire pour "Autre"'
      console.warn('[CRV][PHASE_VALIDATE] Rejet: detailMotif obligatoire pour AUTRE')
    } else {
      errorMessage.value = 'Le motif de non-réalisation est obligatoire'
    }
    return
  }

  saving.value = true
  phaseError.value = null
  globalError.value = ''

  try {
    const data = {
      motifNonRealisation: motifNonRealisation.value
    }

    // Inclure detailMotif si présent
    if (detailMotif.value?.trim()) {
      data.detailMotif = detailMotif.value.trim()
    }

    console.log('[CRV][PHASE_API] Envoi non réalisée:', data)

    await crvStore.marquerPhaseNonRealisee(phaseId, data)
    console.log('[CRV][PHASE_SUCCESS] Phase marquée non réalisée avec succès')
    cancelNonRealise()
    emit('phase-update', { action: 'non-realise', phaseId })
  } catch (error) {
    console.error('[CRV][PHASE_ERROR] Erreur marquage non réalisée:', error)
    phaseError.value = phaseId
    errorMessage.value = error.message || 'Erreur lors du marquage'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.crv-phases-component {
  margin-bottom: 20px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  background: var(--bg-body);
  border-radius: 8px;
  border: 1px dashed var(--text-muted);
}

.phases-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Regroupement visuel des phases (TurnAround) */
.phase-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  margin-top: 12px;
  margin-bottom: 4px;
  border-left: 4px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 4px;
}
.phase-group-header:first-child { margin-top: 0; }
.phase-group-label {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
}
.phase-group-count {
  font-size: 12px;
  color: var(--text-secondary);
}
.group-arrivee { color: #2563eb; }
.group-turn_around { color: #d97706; }
.group-depart { color: #059669; }
.group-commun { color: #6b7280; }
.phase-group-header:has(.group-arrivee) { border-left-color: #2563eb; }
.phase-group-header:has(.group-turn_around) { border-left-color: #d97706; }
.phase-group-header:has(.group-depart) { border-left-color: #059669; }
.phase-group-header:has(.group-commun) { border-left-color: #6b7280; }

.phase-item {
  background: var(--bg-body);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.phase-item.phase-termine {
  background: #ecfdf5;
  border-color: var(--color-success);
}

.phase-item.phase-non-realise {
  background: #fef3c7;
  border-color: var(--color-warning);
}

.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-color);
}

.phase-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.phase-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.status-non-commence {
  background: var(--border-color);
  color: var(--text-primary);
}

.status-en-cours {
  background: var(--color-info-bg);
  color: var(--color-primary);
}

.status-termine {
  background: var(--color-success-bg);
  color: var(--status-valide-text);
}

.status-non-realise {
  background: var(--color-warning-bg);
  color: var(--status-termine-text);
}

.phase-actions-block,
.phase-info-block {
  margin-top: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input:disabled {
  background: var(--bg-badge);
  color: var(--text-secondary);
}

/* CORRECTION AUDIT: Style pour champ obligatoire non rempli */
.form-input.required-field {
  border-color: var(--color-error);
  background: var(--color-error-bg);
}

.field-hint {
  font-size: 12px;
  margin-top: 4px;
}

.field-hint.error {
  color: var(--color-error);
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-sm {
  padding: 8px 12px;
  font-size: 13px;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--text-inverse);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-success {
  background: var(--color-success);
  color: var(--text-inverse);
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-warning {
  background: var(--color-warning);
  color: var(--text-inverse);
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
}

.btn-secondary {
  background: var(--text-secondary);
  color: var(--text-inverse);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--text-primary);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.non-realise-form {
  margin-top: 15px;
  padding: 15px;
  background: #fffbeb;
  border: 1px solid var(--color-warning);
  border-radius: 8px;
}

.non-realise-form .form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.non-realise-info {
  background: #fffbeb;
  padding: 15px;
  border-radius: 8px;
}

.observation-text,
.motif-text {
  padding: 10px;
  background: var(--bg-card);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-primary);
}

.required {
  color: var(--color-error);
  font-weight: 700;
}

.error-message {
  margin-top: 10px;
  padding: 10px;
  background: var(--color-error-bg);
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: var(--color-error);
  font-size: 13px;
}

.error-banner {
  margin-top: 15px;
  padding: 15px;
  background: var(--color-error-bg);
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: var(--color-error);
  font-weight: 500;
}

textarea.form-input {
  resize: vertical;
  min-height: 60px;
}

.manual-hours-form {
  margin-top: 15px;
  padding: 15px;
  background: #eff6ff;
  border: 1px solid var(--color-info);
  border-radius: 8px;
}

.manual-hours-form .form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

/* MVS-3: Styles section-header avec progression */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--border-color);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.phases-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  background: #eff6ff;
  padding: 4px 10px;
  border-radius: 6px;
}

.progress-impact {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Indicateur SLA terrain par phase */
.phase-sla-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  margin-bottom: 8px;
}
.phase-sla-icon { font-size: 14px; }
.phase-sla-text { font-weight: 500; }
.phase-sla-ok { background: #f0fdf4; color: #166534; }
.phase-sla-warning { background: #fffbeb; color: #92400e; }
.phase-sla-critical { background: #fff7ed; color: #c2410c; }
.phase-sla-exceeded { background: #fef2f2; color: #991b1b; font-weight: 600; }
.phase-sla-attente { background: #f8fafc; color: #64748b; font-style: italic; }

/* EXTENSION 12 — Indicateur durée locale (distinct du SLA contractuel) */
.phase-duration-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  margin-bottom: 6px;
  opacity: 0.85;
}
.duration-icon { font-size: 12px; }
.duration-text { font-weight: 400; }
.duration-ok { background: #f8fafb; color: #64748b; }
.duration-warning { background: #fffbeb; color: #92400e; }
.duration-critical { background: #fff7ed; color: #c2410c; }
.duration-exceeded { background: #fef2f2; color: #991b1b; font-weight: 500; }

/* MVS-3 #1: Styles prérequis */
.phase-prerequis {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  padding: 8px 12px;
  background: var(--bg-badge);
  border-radius: 6px;
  font-size: 13px;
}

.prerequis-label {
  font-weight: 500;
  color: var(--text-primary);
}

.prerequis-ok {
  color: #059669;
  font-weight: 500;
}

.prerequis-manquants {
  color: var(--color-error);
  font-weight: 500;
}

/* MVS-3 #2: Styles tags type opération */
.phase-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-operation-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.type-arrivee {
  background: var(--color-info-bg);
  color: var(--color-primary);
}

.type-depart {
  background: var(--color-warning-bg);
  color: var(--status-termine-text);
}

.type-turn_around {
  background: #e0e7ff;
  color: #4338ca;
}

/* MVS-3 #4 & #5: Banner info non réalisé */
.non-realise-info-banner {
  margin-bottom: 15px;
  padding: 10px 12px;
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning);
  border-radius: 6px;
}

.non-realise-info-banner p {
  margin: 0;
  font-size: 13px;
  color: var(--status-termine-text);
  line-height: 1.5;
}

.non-realise-info-banner p:first-child {
  margin-bottom: 4px;
}

/* Horaires prévus — ligne lecture seule */
.phase-prevu-row {
  background: #f0f4ff;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid var(--color-info);
  margin-bottom: 8px;
}

.prevu-label {
  color: var(--color-info);
  font-weight: 600;
}

.prevu-input {
  background: #e8eeff !important;
  color: #1e40af !important;
  font-weight: 500;
}

/* MVS-3 #6: Styles écart SLA */
.ecart-sla {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 6px;
}

.ecart-ok {
  background: var(--color-success-bg);
}

.ecart-ok .ecart-valeur {
  color: var(--status-valide-text);
  font-weight: 600;
}

.ecart-depassement {
  background: var(--color-error-bg);
}

.ecart-depassement .ecart-valeur {
  color: var(--color-error);
  font-weight: 600;
}

.ecart-seuil {
  font-size: 11px;
  color: var(--text-secondary);
}

/* ============================================ */
/* RESPONSIVE DESIGN                            */
/* ============================================ */

/* Mobile (jusqu'à 640px) */
@media (max-width: 640px) {
  .crv-phases-component {
    margin-bottom: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .section-title {
    font-size: 16px;
  }

  .phases-progress {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .progress-count {
    font-size: 13px;
  }

  .progress-impact {
    font-size: 12px;
  }

  .loading-state,
  .empty-state {
    padding: 24px;
  }

  .phases-list {
    gap: 14px;
  }

  .phase-item {
    padding: 14px;
  }

  .phase-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 12px;
    padding-bottom: 8px;
  }

  .phase-header h4 {
    font-size: 14px;
  }

  .phase-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .phase-status {
    font-size: 12px;
    padding: 3px 10px;
  }

  .phase-prerequis {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 8px 10px;
    font-size: 12px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }

  .form-label {
    font-size: 12px;
  }

  .form-input {
    font-size: 16px; /* Évite le zoom iOS */
    padding: 12px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons .btn {
    width: 100%;
  }

  .btn {
    padding: 12px 16px;
  }

  .btn-sm {
    padding: 10px 14px;
    font-size: 13px;
  }

  .manual-hours-form,
  .non-realise-form {
    padding: 12px;
    margin-top: 12px;
  }

  .manual-hours-form .form-actions,
  .non-realise-form .form-actions {
    flex-direction: column;
    gap: 8px;
  }

  .manual-hours-form .form-actions .btn,
  .non-realise-form .form-actions .btn {
    width: 100%;
  }

  .non-realise-info-banner {
    padding: 10px;
  }

  .non-realise-info-banner p {
    font-size: 12px;
  }

  .ecart-sla {
    padding: 8px 10px;
  }

  .ecart-valeur {
    font-size: 13px;
  }

  .error-message,
  .error-banner {
    padding: 10px;
    font-size: 12px;
  }
}

/* Tablet (641px - 1024px) */
@media (min-width: 641px) and (max-width: 1024px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-header {
    flex-wrap: wrap;
  }
}

/* Desktop (1025px+) */
@media (min-width: 1025px) {
  .form-row {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
