<template>
  <div class="crv-charges-component card">
    <h3 class="section-title">Charges (Passagers, Bagages, Fret)</h3>

    <!-- Charges existantes -->
    <div v-if="charges.length > 0" class="existing-charges">
      <h4 class="subsection-title">Charges enregistrées</h4>
      <div class="charges-grid">
        <div
          v-for="charge in charges"
          :key="charge.id || charge._id"
          class="charge-card"
          :class="`charge-${charge.typeCharge?.toLowerCase()}`"
        >
          <div class="charge-header">
            <span class="charge-type">{{ getTypeLabel(charge.typeCharge) }}</span>
            <span class="charge-sens">{{ getSensLabel(charge.sensOperation) }}</span>
          </div>
          <div class="charge-details">
            <template v-if="charge.typeCharge === 'PASSAGERS'">
              <div class="detail-row">
                <span>Adultes:</span>
                <strong>{{ charge.passagersAdultes ?? 0 }}</strong>
              </div>
              <div class="detail-row">
                <span>Enfants:</span>
                <strong>{{ charge.passagersEnfants ?? 0 }}</strong>
              </div>
              <div class="detail-row">
                <span>Bébés:</span>
                <strong>{{ charge.passagersBebes ?? 0 }}</strong>
              </div>
              <div class="detail-row total">
                <span>Total:</span>
                <strong>{{ (charge.passagersAdultes ?? 0) + (charge.passagersEnfants ?? 0) + (charge.passagersBebes ?? 0) }}</strong>
              </div>
            </template>
            <template v-else-if="charge.typeCharge === 'BAGAGES'">
              <div class="detail-row">
                <span>Soute:</span>
                <strong>{{ charge.nombreBagagesSoute ?? 0 }} pcs</strong>
              </div>
              <div class="detail-row">
                <span>Poids:</span>
                <strong>{{ charge.poidsBagagesSouteKg ?? 0 }} kg</strong>
              </div>
              <div v-if="charge.nombreBagagesCabine" class="detail-row">
                <span>Cabine:</span>
                <strong>{{ charge.nombreBagagesCabine }} pcs</strong>
              </div>
            </template>
            <template v-else-if="charge.typeCharge === 'FRET'">
              <div class="detail-row">
                <span>Nombre:</span>
                <strong>{{ charge.nombreFret ?? 0 }} pcs</strong>
              </div>
              <div class="detail-row">
                <span>Poids:</span>
                <strong>{{ charge.poidsFretKg ?? 0 }} kg</strong>
              </div>
              <div v-if="charge.typeFret" class="detail-row">
                <span>Type:</span>
                <strong>{{ getTypeFretLabel(charge.typeFret) }}</strong>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Aucune charge - DOCTRINE: pas de confirmation, juste informatif -->
    <div v-else class="empty-state">
      <p>Aucune charge enregistrée pour ce vol</p>
    </div>

    <!-- MVS-4 #1: Impact complétude affiché -->
    <div class="completude-impact-info">
      <span class="info-icon">ℹ️</span>
      <div class="info-text">
        <strong>Impact sur la complétude :</strong>
        1 type de charge = +20% | 2 types = +25% | 3+ types = +30%
      </div>
    </div>

    <!-- Formulaire d'ajout -->
    <div v-if="!disabled" class="add-charge-section">
      <h4 class="subsection-title">Ajouter une charge</h4>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Type de charge <span class="required">*</span></label>
          <select v-model="newCharge.typeCharge" class="form-input" @change="resetChargeForm">
            <option value="">Sélectionner</option>
            <option v-for="type in typesCharge" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Sens opération <span class="required">*</span></label>
          <select v-model="newCharge.sensOperation" class="form-input">
            <option value="">Sélectionner</option>
            <option v-for="sens in sensOperations" :key="sens.value" :value="sens.value">
              {{ sens.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Passagers -->
      <div v-if="newCharge.typeCharge === 'PASSAGERS'" class="charge-form-section">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Adultes <span class="required">*</span></label>
            <input
              v-model.number="newCharge.passagersAdultes"
              type="number"
              class="form-input"
              min="0"
              placeholder="0"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Enfants</label>
            <input
              v-model.number="newCharge.passagersEnfants"
              type="number"
              class="form-input"
              min="0"
              placeholder="0"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Bébés</label>
            <input
              v-model.number="newCharge.passagersBebes"
              type="number"
              class="form-input"
              min="0"
              placeholder="0"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Total</label>
            <input
              :value="totalPassagers"
              type="number"
              class="form-input"
              disabled
            />
          </div>
        </div>
      </div>

      <!-- Bagages -->
      <div v-if="newCharge.typeCharge === 'BAGAGES'" class="charge-form-section">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Bagages soute <span class="required">*</span></label>
            <input
              v-model.number="newCharge.nombreBagagesSoute"
              type="number"
              class="form-input"
              min="0"
              placeholder="0"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Poids soute (kg)</label>
            <input
              v-model.number="newCharge.poidsBagagesSouteKg"
              type="number"
              class="form-input"
              min="0"
              step="0.1"
              placeholder="0"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Bagages cabine</label>
            <input
              v-model.number="newCharge.nombreBagagesCabine"
              type="number"
              class="form-input"
              min="0"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <!-- Fret - CORRECTION AUDIT: Types de fret conformes -->
      <div v-if="newCharge.typeCharge === 'FRET'" class="charge-form-section">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nombre de pièces <span class="required">*</span></label>
            <input
              v-model.number="newCharge.nombreFret"
              type="number"
              class="form-input"
              min="0"
              placeholder="Laisser vide si non applicable"
            />
            <!-- MVS-4 #2: Doctrine VIDE != ZERO -->
            <span class="form-hint">0 = zéro explicite, vide = non renseigné</span>
          </div>
          <div class="form-group">
            <label class="form-label">Poids total (kg)</label>
            <input
              v-model.number="newCharge.poidsFretKg"
              type="number"
              class="form-input"
              min="0"
              step="0.1"
              placeholder="Laisser vide si non applicable"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Type de fret</label>
            <select v-model="newCharge.typeFret" class="form-input">
              <option value="">Sélectionner</option>
              <option v-for="typeFret in typesFret" :key="typeFret.value" :value="typeFret.value">
                {{ typeFret.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- MVS-4 #6, #7, #8: Section DGR (Marchandises Dangereuses) -->
        <div v-if="newCharge.typeFret === 'DANGEREUX'" class="dgr-section">
          <h5 class="dgr-title">Marchandises Dangereuses (DGR)</h5>

          <div class="form-row">
            <!-- MVS-4 #6: Format code ONU -->
            <div class="form-group">
              <label class="form-label">Code ONU <span class="required">*</span></label>
              <input
                v-model="newCharge.dgr.codeONU"
                type="text"
                class="form-input"
                :class="{ 'input-error': dgrCodeONUError }"
                placeholder="UN0000"
                maxlength="6"
                @input="validateCodeONU"
              />
              <span class="form-hint">Format: UN + 4 chiffres (ex: UN1234)</span>
              <span v-if="dgrCodeONUError" class="form-error">{{ dgrCodeONUError }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Classe ONU <span class="required">*</span></label>
              <select v-model="newCharge.dgr.classeONU" class="form-input">
                <option value="">Sélectionner</option>
                <option value="1">1 - Explosifs</option>
                <option value="2">2 - Gaz</option>
                <option value="3">3 - Liquides inflammables</option>
                <option value="4">4 - Solides inflammables</option>
                <option value="5">5 - Matières comburantes</option>
                <option value="6">6 - Matières toxiques</option>
                <option value="7">7 - Matières radioactives</option>
                <option value="8">8 - Matières corrosives</option>
                <option value="9">9 - Divers</option>
              </select>
            </div>

            <!-- MVS-4 #7: Groupe emballage -->
            <div class="form-group">
              <label class="form-label">Groupe emballage</label>
              <select v-model="newCharge.dgr.groupeEmballage" class="form-input">
                <option value="">Non spécifié</option>
                <option value="I">I - Danger élevé</option>
                <option value="II">II - Danger moyen</option>
                <option value="III">III - Danger faible</option>
              </select>
              <span class="form-hint">I=danger élevé, II=moyen, III=faible</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Désignation officielle</label>
              <input
                v-model="newCharge.dgr.designationOfficielle"
                type="text"
                class="form-input"
                placeholder="Nom officiel de transport"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Quantité</label>
              <input
                v-model.number="newCharge.dgr.quantite"
                type="number"
                class="form-input"
                min="0"
                step="0.1"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Unité</label>
              <select v-model="newCharge.dgr.unite" class="form-input">
                <option value="kg">kg</option>
                <option value="L">Litres</option>
                <option value="pcs">Pièces</option>
              </select>
            </div>
          </div>

          <!-- MVS-4 #8: Bouton validation DGR -->
          <div class="dgr-validation-section">
            <button
              type="button"
              class="btn btn-outline btn-validate-dgr"
              @click="validateDGR"
              :disabled="!canValidateDGR || validatingDGR"
            >
              {{ validatingDGR ? 'Vérification...' : 'Vérifier conformité DGR' }}
            </button>

            <!-- Résultats validation -->
            <div v-if="dgrValidationResult" class="dgr-validation-result" :class="dgrValidationResult.valide ? 'valid' : 'invalid'">
              <div v-if="dgrValidationResult.valide" class="result-success">
                ✓ Marchandise dangereuse conforme
              </div>
              <div v-else class="result-errors">
                <strong>Erreurs :</strong>
                <ul>
                  <li v-for="(err, idx) in dgrValidationResult.erreurs" :key="idx">{{ err }}</li>
                </ul>
              </div>
              <div v-if="dgrValidationResult.avertissements?.length > 0" class="result-warnings">
                <strong>Avertissements :</strong>
                <ul>
                  <li v-for="(warn, idx) in dgrValidationResult.avertissements" :key="idx">{{ warn }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bouton d'ajout -->
      <div v-if="newCharge.typeCharge" class="form-actions">
        <button
          @click="handleAddCharge"
          class="btn btn-primary"
          :disabled="!canAddCharge || saving"
          type="button"
        >
          {{ saving ? 'Ajout en cours...' : 'Ajouter la charge' }}
        </button>
        <button
          @click="resetNewCharge"
          class="btn btn-secondary"
          :disabled="saving"
          type="button"
        >
          Annuler
        </button>
      </div>

      <!-- Message d'erreur -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>

    <!-- SUPPRIMÉ AUDIT: Pas de checkbox "confirmer aucune charge"
         DOCTRINE: "Absence = Non documenté" - pas de confirmation -->
  </div>
</template>

<script setup>
/**
 * CRVCharges.vue - CORRIGÉ AUDIT 2025-01
 *
 * CORRECTIONS APPLIQUÉES:
 * - SUPPRIMÉ: Checkbox "confirmer aucune charge" (doctrine: absence = non documenté)
 * - SUPPRIMÉ: confirmNoCharge, handleConfirmNoCharge, watcher hasConfirmationAucuneCharge
 * - CORRIGÉ: Types de fret selon doctrine (STANDARD, EXPRESS, PERISSABLE, DANGEREUX, ANIMAUX_VIVANTS, AUTRE)
 * - SUPPRIMÉ: Type fret "VALEUR" (non conforme)
 * - AJOUTÉ: Import des enums centralisés
 * - AJOUTÉ: Console.log format [CRV][CHARGE_*]
 */
import { ref, computed } from 'vue'
import { useCRVStore } from '@/stores/crvStore'
import { chargesAPI } from '@/services/api'
import {
  TYPE_CHARGE,
  SENS_OPERATION,
  TYPE_FRET,
  getEnumOptions
} from '@/config/crvEnums'

const props = defineProps({
  charges: {
    type: Array,
    default: () => []
  },
  crvId: {
    type: String,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['charge-added'])

const crvStore = useCRVStore()

// États locaux
const saving = ref(false)
const errorMessage = ref('')

// MVS-4: États DGR
const dgrCodeONUError = ref('')
const validatingDGR = ref(false)
const dgrValidationResult = ref(null)

// CORRECTION AUDIT: Utilisation des enums centralisés
const typesCharge = getEnumOptions(TYPE_CHARGE)
const sensOperations = getEnumOptions(SENS_OPERATION)
const typesFret = getEnumOptions(TYPE_FRET)

console.log('[CRV][CHARGE_INIT] Enums chargés:', {
  typesCharge: typesCharge.length,
  sensOperations: sensOperations.length,
  typesFret: typesFret.length
})

// Nouveau charge form
const newCharge = ref({
  typeCharge: '',
  sensOperation: '',
  // Passagers
  passagersAdultes: 0,
  passagersEnfants: 0,
  passagersBebes: 0,
  // Bagages
  nombreBagagesSoute: 0,
  poidsBagagesSouteKg: 0,
  nombreBagagesCabine: 0,
  // Fret
  nombreFret: 0,
  poidsFretKg: 0,
  typeFret: '',
  // MVS-4: DGR (Marchandises Dangereuses)
  dgr: {
    codeONU: '',
    classeONU: '',
    groupeEmballage: '',
    designationOfficielle: '',
    quantite: 0,
    unite: 'kg'
  }
})

// Computed
const totalPassagers = computed(() => {
  return (newCharge.value.passagersAdultes || 0) +
         (newCharge.value.passagersEnfants || 0) +
         (newCharge.value.passagersBebes || 0)
})

const canAddCharge = computed(() => {
  if (!newCharge.value.typeCharge || !newCharge.value.sensOperation) {
    console.log('[CRV][CHARGE_VALIDATION] canAddCharge: false (type ou sens manquant)')
    return false
  }

  let isValid = false
  switch (newCharge.value.typeCharge) {
    case TYPE_CHARGE.PASSAGERS:
      isValid = newCharge.value.passagersAdultes !== undefined &&
               newCharge.value.passagersAdultes !== null &&
               newCharge.value.passagersAdultes !== ''
      break
    case TYPE_CHARGE.BAGAGES:
      isValid = newCharge.value.nombreBagagesSoute !== undefined &&
               newCharge.value.nombreBagagesSoute !== null &&
               newCharge.value.nombreBagagesSoute !== ''
      break
    case TYPE_CHARGE.FRET:
      isValid = newCharge.value.nombreFret !== undefined &&
               newCharge.value.nombreFret !== null &&
               newCharge.value.nombreFret !== ''
      // MVS-4: Si DGR, vérifier les champs obligatoires
      if (newCharge.value.typeFret === 'DANGEREUX') {
        isValid = isValid &&
                  newCharge.value.dgr.codeONU &&
                  !dgrCodeONUError.value &&
                  newCharge.value.dgr.classeONU
      }
      break
  }

  console.log('[CRV][CHARGE_VALIDATION] canAddCharge:', isValid, 'type:', newCharge.value.typeCharge)
  return isValid
})

// MVS-4 #8: Computed pour valider DGR
const canValidateDGR = computed(() => {
  return newCharge.value.dgr.codeONU &&
         !dgrCodeONUError.value &&
         newCharge.value.dgr.classeONU
})

// Formatters
const getTypeLabel = (type) => {
  const labels = {
    [TYPE_CHARGE.PASSAGERS]: 'Passagers',
    [TYPE_CHARGE.BAGAGES]: 'Bagages',
    [TYPE_CHARGE.FRET]: 'Fret'
  }
  return labels[type] || type
}

const getSensLabel = (sens) => {
  const labels = {
    [SENS_OPERATION.EMBARQUEMENT]: 'Embarquement',
    [SENS_OPERATION.DEBARQUEMENT]: 'Débarquement'
  }
  return labels[sens] || sens
}

// CORRECTION AUDIT: Labels types de fret conformes à la doctrine
const getTypeFretLabel = (type) => {
  const labels = {
    [TYPE_FRET.STANDARD]: 'Standard',
    [TYPE_FRET.EXPRESS]: 'Express',
    [TYPE_FRET.PERISSABLE]: 'Périssable',
    [TYPE_FRET.DANGEREUX]: 'Dangereux (DGR)',
    [TYPE_FRET.ANIMAUX_VIVANTS]: 'Animaux vivants',
    [TYPE_FRET.AUTRE]: 'Autre'
  }
  return labels[type] || type
}

// Actions
const resetChargeForm = () => {
  console.log('[CRV][CHARGE_RESET] Reset formulaire spécifique')
  newCharge.value.passagersAdultes = 0
  newCharge.value.passagersEnfants = 0
  newCharge.value.passagersBebes = 0
  newCharge.value.nombreBagagesSoute = 0
  newCharge.value.poidsBagagesSouteKg = 0
  newCharge.value.nombreBagagesCabine = 0
  newCharge.value.nombreFret = 0
  newCharge.value.poidsFretKg = 0
  newCharge.value.typeFret = ''
  errorMessage.value = ''
}

const resetNewCharge = () => {
  console.log('[CRV][CHARGE_RESET] Reset formulaire complet')
  newCharge.value = {
    typeCharge: '',
    sensOperation: '',
    passagersAdultes: 0,
    passagersEnfants: 0,
    passagersBebes: 0,
    nombreBagagesSoute: 0,
    poidsBagagesSouteKg: 0,
    nombreBagagesCabine: 0,
    nombreFret: 0,
    poidsFretKg: 0,
    typeFret: ''
  }
  errorMessage.value = ''
}

const handleAddCharge = async () => {
  console.log('[CRV][CHARGE_ADD] Début ajout charge:', newCharge.value)

  if (!canAddCharge.value) {
    console.warn('[CRV][CHARGE_ADD] Validation échouée')
    errorMessage.value = 'Veuillez remplir tous les champs obligatoires'
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    const chargeData = {
      typeCharge: newCharge.value.typeCharge,
      sensOperation: newCharge.value.sensOperation
    }

    switch (newCharge.value.typeCharge) {
      case TYPE_CHARGE.PASSAGERS:
        chargeData.passagersAdultes = newCharge.value.passagersAdultes || 0
        chargeData.passagersEnfants = newCharge.value.passagersEnfants || 0
        chargeData.passagersBebes = newCharge.value.passagersBebes || 0
        break
      case TYPE_CHARGE.BAGAGES:
        chargeData.nombreBagagesSoute = newCharge.value.nombreBagagesSoute || 0
        chargeData.poidsBagagesSouteKg = newCharge.value.poidsBagagesSouteKg || 0
        if (newCharge.value.nombreBagagesCabine) {
          chargeData.nombreBagagesCabine = newCharge.value.nombreBagagesCabine
        }
        break
      case TYPE_CHARGE.FRET:
        chargeData.nombreFret = newCharge.value.nombreFret || 0
        chargeData.poidsFretKg = newCharge.value.poidsFretKg || 0
        if (newCharge.value.typeFret) {
          chargeData.typeFret = newCharge.value.typeFret
        }
        break
    }

    console.log('[CRV][CHARGE_API] Envoi au backend:', chargeData)

    await crvStore.addCharge(chargeData)

    console.log('[CRV][CHARGE_SUCCESS] Charge ajoutée avec succès')
    resetNewCharge()
    emit('charge-added', chargeData)

  } catch (error) {
    console.error('[CRV][CHARGE_ERROR] Erreur ajout charge:', error)
    errorMessage.value = error.message || 'Erreur lors de l\'ajout de la charge'
  } finally {
    saving.value = false
  }
}

// SUPPRIMÉ AUDIT: handleConfirmNoCharge et watcher hasConfirmationAucuneCharge
// DOCTRINE: "Absence = Non documenté" - pas de confirmation d'absence

// MVS-4 #6: Validation format code ONU
const validateCodeONU = () => {
  const code = newCharge.value.dgr.codeONU
  if (!code) {
    dgrCodeONUError.value = ''
    return
  }

  // Format attendu: UN + 4 chiffres
  const regex = /^UN\d{4}$/
  if (!regex.test(code.toUpperCase())) {
    dgrCodeONUError.value = 'Format invalide. Exemple: UN1234'
  } else {
    dgrCodeONUError.value = ''
    // Normaliser en majuscules
    newCharge.value.dgr.codeONU = code.toUpperCase()
  }
}

// MVS-4 #8: Validation DGR via API
const validateDGR = async () => {
  if (!canValidateDGR.value) return

  validatingDGR.value = true
  dgrValidationResult.value = null

  try {
    const response = await chargesAPI.validerMarchandiseDangereuse({
      codeONU: newCharge.value.dgr.codeONU,
      classeONU: newCharge.value.dgr.classeONU,
      quantite: newCharge.value.dgr.quantite,
      groupeEmballage: newCharge.value.dgr.groupeEmballage || undefined
    })

    dgrValidationResult.value = response.data
    console.log('[CRV][DGR_VALIDATION] Résultat:', response.data)
  } catch (error) {
    console.error('[CRV][DGR_VALIDATION] Erreur:', error)
    dgrValidationResult.value = {
      valide: false,
      erreurs: [error.response?.data?.message || 'Erreur lors de la validation'],
      avertissements: []
    }
  } finally {
    validatingDGR.value = false
  }
}
</script>

<style scoped>
.crv-charges-component {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.subsection-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.existing-charges {
  margin-bottom: 25px;
}

.charges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.charge-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
}

.charge-card.charge-passagers {
  border-left: 4px solid #2563eb;
}

.charge-card.charge-bagages {
  border-left: 4px solid #10b981;
}

.charge-card.charge-fret {
  border-left: 4px solid #f59e0b;
}

.charge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.charge-type {
  font-weight: 600;
  color: #1f2937;
}

.charge-sens {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #e5e7eb;
  color: #4b5563;
}

.charge-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-row span {
  color: #6b7280;
}

.detail-row strong {
  color: #1f2937;
}

.detail-row.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #d1d5db;
  font-size: 15px;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
  margin-bottom: 20px;
}

.add-charge-section {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.charge-form-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #bae6fd;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
  color: #374151;
}

.form-input {
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

.form-input:disabled {
  background: #f3f4f6;
  color: #6b7280;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
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

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.required {
  color: #dc2626;
  font-weight: 700;
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
}

/* MVS-4 #1: Info complétude */
.completude-impact-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 12px 15px;
  margin-bottom: 20px;
}

.completude-impact-info .info-icon {
  font-size: 18px;
}

.completude-impact-info .info-text {
  font-size: 13px;
  color: #1e40af;
  line-height: 1.5;
}

/* MVS-4 #2: Form hints */
.form-hint {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

.form-error {
  font-size: 12px;
  color: #dc2626;
  margin-top: 4px;
}

.input-error {
  border-color: #dc2626 !important;
}

/* MVS-4: Section DGR */
.dgr-section {
  margin-top: 20px;
  padding: 20px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
}

.dgr-title {
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dgr-title::before {
  content: '⚠️';
}

/* MVS-4 #8: Validation DGR */
.dgr-validation-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #fcd34d;
}

.btn-validate-dgr {
  background: white;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.btn-validate-dgr:hover:not(:disabled) {
  background: #fef3c7;
}

.dgr-validation-result {
  margin-top: 15px;
  padding: 15px;
  border-radius: 6px;
}

.dgr-validation-result.valid {
  background: #dcfce7;
  border: 1px solid #86efac;
}

.dgr-validation-result.invalid {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.result-success {
  color: #166534;
  font-weight: 600;
}

.result-errors {
  color: #991b1b;
}

.result-errors ul,
.result-warnings ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.result-errors li,
.result-warnings li {
  font-size: 13px;
  margin-bottom: 4px;
}

.result-warnings {
  margin-top: 10px;
  color: #92400e;
}
</style>
