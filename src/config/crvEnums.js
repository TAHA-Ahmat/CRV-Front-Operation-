/**
 * ENUMS CRV - SOURCE DE VÉRITÉ FRONTEND
 *
 * CONFORME À : DOCUMENTATION_FRONTEND_CRV.md (GELÉE)
 * Date de conformité : 2026-01-08
 *
 * RÈGLE ABSOLUE : Ces enums correspondent EXACTEMENT aux valeurs backend.
 * Ne JAMAIS ajouter, modifier ou supprimer de valeurs sans validation documentaire.
 *
 * INTERDICTION : Toute valeur non présente ici est INTERDITE.
 */

// ============================================
// STATUTS CRV
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Section 3.4
// ============================================

export const STATUT_CRV = Object.freeze({
  BROUILLON: 'BROUILLON',
  EN_COURS: 'EN_COURS',
  TERMINE: 'TERMINE',
  VALIDE: 'VALIDE',
  VERROUILLE: 'VERROUILLE',
  ANNULE: 'ANNULE'
})

export const STATUT_CRV_LABELS = Object.freeze({
  [STATUT_CRV.BROUILLON]: 'Brouillon',
  [STATUT_CRV.EN_COURS]: 'En cours',
  [STATUT_CRV.TERMINE]: 'Terminé',
  [STATUT_CRV.VALIDE]: 'Validé',
  [STATUT_CRV.VERROUILLE]: 'Verrouillé',
  [STATUT_CRV.ANNULE]: 'Annulé'
})

// ============================================
// STATUTS PHASE
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 4
// ============================================

export const STATUT_PHASE = Object.freeze({
  NON_COMMENCE: 'NON_COMMENCE',
  EN_COURS: 'EN_COURS',
  TERMINE: 'TERMINE',
  NON_REALISE: 'NON_REALISE',
  ANNULE: 'ANNULE'
})

export const STATUT_PHASE_LABELS = Object.freeze({
  [STATUT_PHASE.NON_COMMENCE]: 'Non démarrée',
  [STATUT_PHASE.EN_COURS]: 'En cours',
  [STATUT_PHASE.TERMINE]: 'Terminée',
  [STATUT_PHASE.NON_REALISE]: 'Non réalisée',
  [STATUT_PHASE.ANNULE]: 'Annulée'
})

// ============================================
// MOTIFS NON-RÉALISATION PHASE
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 4.e
// ============================================

export const MOTIF_NON_REALISATION = Object.freeze({
  NON_NECESSAIRE: 'NON_NECESSAIRE',
  EQUIPEMENT_INDISPONIBLE: 'EQUIPEMENT_INDISPONIBLE',
  PERSONNEL_ABSENT: 'PERSONNEL_ABSENT',
  CONDITIONS_METEO: 'CONDITIONS_METEO',
  AUTRE: 'AUTRE'
})

export const MOTIF_NON_REALISATION_LABELS = Object.freeze({
  [MOTIF_NON_REALISATION.NON_NECESSAIRE]: 'Non nécessaire',
  [MOTIF_NON_REALISATION.EQUIPEMENT_INDISPONIBLE]: 'Équipement indisponible',
  [MOTIF_NON_REALISATION.PERSONNEL_ABSENT]: 'Personnel absent',
  [MOTIF_NON_REALISATION.CONDITIONS_METEO]: 'Conditions météo',
  [MOTIF_NON_REALISATION.AUTRE]: 'Autre'
})

// ============================================
// CATÉGORIES PHASE
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 4.d
// ============================================

export const CATEGORIE_PHASE = Object.freeze({
  PISTE: 'PISTE',
  PASSAGERS: 'PASSAGERS',
  FRET: 'FRET',
  BAGAGE: 'BAGAGE',
  TECHNIQUE: 'TECHNIQUE',
  AVITAILLEMENT: 'AVITAILLEMENT',
  NETTOYAGE: 'NETTOYAGE',
  SECURITE: 'SECURITE'
})

// ============================================
// TYPES ÉVÉNEMENT
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 6.c
// ============================================

export const TYPE_EVENEMENT = Object.freeze({
  PANNE_EQUIPEMENT: 'PANNE_EQUIPEMENT',
  ABSENCE_PERSONNEL: 'ABSENCE_PERSONNEL',
  RETARD: 'RETARD',
  INCIDENT_SECURITE: 'INCIDENT_SECURITE',
  PROBLEME_TECHNIQUE: 'PROBLEME_TECHNIQUE',
  METEO: 'METEO',
  AUTRE: 'AUTRE'
})

export const TYPE_EVENEMENT_LABELS = Object.freeze({
  [TYPE_EVENEMENT.PANNE_EQUIPEMENT]: 'Panne équipement',
  [TYPE_EVENEMENT.ABSENCE_PERSONNEL]: 'Absence personnel',
  [TYPE_EVENEMENT.RETARD]: 'Retard',
  [TYPE_EVENEMENT.INCIDENT_SECURITE]: 'Incident sécurité',
  [TYPE_EVENEMENT.PROBLEME_TECHNIQUE]: 'Problème technique',
  [TYPE_EVENEMENT.METEO]: 'Météo',
  [TYPE_EVENEMENT.AUTRE]: 'Autre'
})

// ============================================
// GRAVITÉS ÉVÉNEMENT
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 6.c
// ============================================

export const GRAVITE_EVENEMENT = Object.freeze({
  MINEURE: 'MINEURE',
  MODEREE: 'MODEREE',
  MAJEURE: 'MAJEURE',
  CRITIQUE: 'CRITIQUE'
})

export const GRAVITE_EVENEMENT_LABELS = Object.freeze({
  [GRAVITE_EVENEMENT.MINEURE]: 'Mineure',
  [GRAVITE_EVENEMENT.MODEREE]: 'Modérée',
  [GRAVITE_EVENEMENT.MAJEURE]: 'Majeure',
  [GRAVITE_EVENEMENT.CRITIQUE]: 'Critique'
})

// ============================================
// STATUTS ÉVÉNEMENT
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 6.c
// ============================================

export const STATUT_EVENEMENT = Object.freeze({
  OUVERT: 'OUVERT',
  EN_COURS: 'EN_COURS',
  RESOLU: 'RESOLU',
  CLOTURE: 'CLOTURE'
})

export const STATUT_EVENEMENT_LABELS = Object.freeze({
  [STATUT_EVENEMENT.OUVERT]: 'Ouvert',
  [STATUT_EVENEMENT.EN_COURS]: 'En cours',
  [STATUT_EVENEMENT.RESOLU]: 'Résolu',
  [STATUT_EVENEMENT.CLOTURE]: 'Clôturé'
})

// ============================================
// TYPES CHARGE
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 5.d
// ============================================

export const TYPE_CHARGE = Object.freeze({
  PASSAGERS: 'PASSAGERS',
  BAGAGES: 'BAGAGES',
  FRET: 'FRET'
})

export const TYPE_CHARGE_LABELS = Object.freeze({
  [TYPE_CHARGE.PASSAGERS]: 'Passagers',
  [TYPE_CHARGE.BAGAGES]: 'Bagages',
  [TYPE_CHARGE.FRET]: 'Fret'
})

// ============================================
// SENS OPÉRATION CHARGE
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 5.d
// ============================================

export const SENS_OPERATION = Object.freeze({
  EMBARQUEMENT: 'EMBARQUEMENT',
  DEBARQUEMENT: 'DEBARQUEMENT'
})

export const SENS_OPERATION_LABELS = Object.freeze({
  [SENS_OPERATION.EMBARQUEMENT]: 'Embarquement',
  [SENS_OPERATION.DEBARQUEMENT]: 'Débarquement'
})

// ============================================
// TYPES FRET
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 5.d
// ============================================

export const TYPE_FRET = Object.freeze({
  GENERAL: 'GENERAL',
  STANDARD: 'STANDARD',
  PERISSABLE: 'PERISSABLE',
  DANGEREUX: 'DANGEREUX',
  ANIMAUX: 'ANIMAUX',
  AUTRE: 'AUTRE'
})

export const TYPE_FRET_LABELS = Object.freeze({
  [TYPE_FRET.GENERAL]: 'Général',
  [TYPE_FRET.STANDARD]: 'Standard',
  [TYPE_FRET.PERISSABLE]: 'Périssable',
  [TYPE_FRET.DANGEREUX]: 'Dangereux (DGR)',
  [TYPE_FRET.ANIMAUX]: 'Animaux vivants',
  [TYPE_FRET.AUTRE]: 'Autre'
})

// ============================================
// CATÉGORIES OBSERVATION
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 7.c
// ============================================

export const CATEGORIE_OBSERVATION = Object.freeze({
  GENERALE: 'GENERALE',
  TECHNIQUE: 'TECHNIQUE',
  OPERATIONNELLE: 'OPERATIONNELLE',
  SECURITE: 'SECURITE',
  QUALITE: 'QUALITE',
  SLA: 'SLA'
})

export const CATEGORIE_OBSERVATION_LABELS = Object.freeze({
  [CATEGORIE_OBSERVATION.GENERALE]: 'Générale',
  [CATEGORIE_OBSERVATION.TECHNIQUE]: 'Technique',
  [CATEGORIE_OBSERVATION.OPERATIONNELLE]: 'Opérationnelle',
  [CATEGORIE_OBSERVATION.SECURITE]: 'Sécurité',
  [CATEGORIE_OBSERVATION.QUALITE]: 'Qualité',
  [CATEGORIE_OBSERVATION.SLA]: 'SLA'
})

// ============================================
// VISIBILITÉ OBSERVATION
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 7.c
// ============================================

export const VISIBILITE_OBSERVATION = Object.freeze({
  INTERNE: 'INTERNE',
  COMPAGNIE: 'COMPAGNIE',
  PUBLIQUE: 'PUBLIQUE'
})

export const VISIBILITE_OBSERVATION_LABELS = Object.freeze({
  [VISIBILITE_OBSERVATION.INTERNE]: 'Interne',
  [VISIBILITE_OBSERVATION.COMPAGNIE]: 'Compagnie',
  [VISIBILITE_OBSERVATION.PUBLIQUE]: 'Publique'
})

// ============================================
// TYPES ENGIN CRV (15 types)
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 9.c
// ============================================

export const TYPE_ENGIN = Object.freeze({
  TRACTEUR_PUSHBACK: 'TRACTEUR_PUSHBACK',
  PASSERELLE: 'PASSERELLE',
  TAPIS_BAGAGES: 'TAPIS_BAGAGES',
  GPU: 'GPU',
  ASU: 'ASU',
  ESCALIER: 'ESCALIER',
  TRANSBORDEUR: 'TRANSBORDEUR',
  CAMION_AVITAILLEMENT: 'CAMION_AVITAILLEMENT',
  CAMION_VIDANGE: 'CAMION_VIDANGE',
  CAMION_EAU: 'CAMION_EAU',
  NACELLE_ELEVATRICE: 'NACELLE_ELEVATRICE',
  CHARIOT_BAGAGES: 'CHARIOT_BAGAGES',
  CONTENEUR_ULD: 'CONTENEUR_ULD',
  DOLLY: 'DOLLY',
  AUTRE: 'AUTRE'
})

export const TYPE_ENGIN_LABELS = Object.freeze({
  [TYPE_ENGIN.TRACTEUR_PUSHBACK]: 'Tracteur pushback',
  [TYPE_ENGIN.PASSERELLE]: 'Passerelle',
  [TYPE_ENGIN.TAPIS_BAGAGES]: 'Tapis bagages',
  [TYPE_ENGIN.GPU]: 'GPU (Groupe de parc)',
  [TYPE_ENGIN.ASU]: 'ASU (Air Start Unit)',
  [TYPE_ENGIN.ESCALIER]: 'Escalier',
  [TYPE_ENGIN.TRANSBORDEUR]: 'Transbordeur',
  [TYPE_ENGIN.CAMION_AVITAILLEMENT]: 'Camion avitaillement',
  [TYPE_ENGIN.CAMION_VIDANGE]: 'Camion vidange',
  [TYPE_ENGIN.CAMION_EAU]: 'Camion eau',
  [TYPE_ENGIN.NACELLE_ELEVATRICE]: 'Nacelle élévatrice',
  [TYPE_ENGIN.CHARIOT_BAGAGES]: 'Chariot bagages',
  [TYPE_ENGIN.CONTENEUR_ULD]: 'Conteneur ULD',
  [TYPE_ENGIN.DOLLY]: 'Dolly',
  [TYPE_ENGIN.AUTRE]: 'Autre'
})

// ============================================
// USAGE ENGIN
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 9.c
// ============================================

export const USAGE_ENGIN = Object.freeze({
  TRACTAGE: 'TRACTAGE',
  BAGAGES: 'BAGAGES',
  FRET: 'FRET',
  ALIMENTATION_ELECTRIQUE: 'ALIMENTATION_ELECTRIQUE',
  CLIMATISATION: 'CLIMATISATION',
  PASSERELLE: 'PASSERELLE',
  CHARGEMENT: 'CHARGEMENT'
})

export const USAGE_ENGIN_LABELS = Object.freeze({
  [USAGE_ENGIN.TRACTAGE]: 'Tractage',
  [USAGE_ENGIN.BAGAGES]: 'Bagages',
  [USAGE_ENGIN.FRET]: 'Fret',
  [USAGE_ENGIN.ALIMENTATION_ELECTRIQUE]: 'Alimentation électrique',
  [USAGE_ENGIN.CLIMATISATION]: 'Climatisation',
  [USAGE_ENGIN.PASSERELLE]: 'Passerelle',
  [USAGE_ENGIN.CHARGEMENT]: 'Chargement'
})

// ============================================
// STATUT VOL
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 2.d
// ============================================

export const STATUT_VOL = Object.freeze({
  PROGRAMME: 'PROGRAMME',
  EN_COURS: 'EN_COURS',
  TERMINE: 'TERMINE',
  ANNULE: 'ANNULE',
  RETARDE: 'RETARDE'
})

export const STATUT_VOL_LABELS = Object.freeze({
  [STATUT_VOL.PROGRAMME]: 'Programmé',
  [STATUT_VOL.EN_COURS]: 'En cours',
  [STATUT_VOL.TERMINE]: 'Terminé',
  [STATUT_VOL.ANNULE]: 'Annulé',
  [STATUT_VOL.RETARDE]: 'Retardé'
})

// ============================================
// TYPE OPÉRATION VOL
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Bloc 2.d
// Note : DÉDUIT par le backend - jamais modifiable manuellement
// ============================================

export const TYPE_OPERATION = Object.freeze({
  ARRIVEE: 'ARRIVEE',
  DEPART: 'DEPART',
  TURN_AROUND: 'TURN_AROUND'
})

export const TYPE_OPERATION_LABELS = Object.freeze({
  [TYPE_OPERATION.ARRIVEE]: 'Arrivée',
  [TYPE_OPERATION.DEPART]: 'Départ',
  [TYPE_OPERATION.TURN_AROUND]: 'Turn Around'
})

// ============================================
// SEUILS DE COMPLÉTUDE
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Section 4.3
// ============================================

export const SEUILS_COMPLETUDE = Object.freeze({
  TERMINER: 50,  // Minimum pour EN_COURS → TERMINE
  VALIDER: 80    // Minimum pour TERMINE → VALIDE
})

// ============================================
// CODES ERREUR MÉTIER
// Référence : DOCUMENTATION_FRONTEND_CRV.md - Section 4.1
// ============================================

export const ERROR_CODES = Object.freeze({
  CRV_VERROUILLE: 'CRV_VERROUILLE',
  COMPLETUDE_INSUFFISANTE: 'COMPLETUDE_INSUFFISANTE',
  CONDITIONS_TERMINAISON_NON_SATISFAITES: 'CONDITIONS_TERMINAISON_NON_SATISFAITES',
  MOTIF_NON_REALISATION_REQUIS: 'MOTIF_NON_REALISATION_REQUIS',
  DETAIL_MOTIF_REQUIS: 'DETAIL_MOTIF_REQUIS',
  INCOHERENCE_TYPE_OPERATION: 'INCOHERENCE_TYPE_OPERATION',
  VALEURS_EXPLICITES_REQUISES: 'VALEURS_EXPLICITES_REQUISES',
  TRANSITION_STATUT_INVALIDE: 'TRANSITION_STATUT_INVALIDE',
  POIDS_REQUIS_AVEC_BAGAGES: 'POIDS_REQUIS_AVEC_BAGAGES',
  POIDS_FRET_REQUIS: 'POIDS_FRET_REQUIS',
  TYPE_FRET_REQUIS: 'TYPE_FRET_REQUIS',
  QUALITE_READ_ONLY: 'QUALITE_READ_ONLY',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID'
})

// ============================================
// FONCTIONS DE VALIDATION
// ============================================

/**
 * Valide qu'une valeur appartient à un enum
 * @param {string} value - Valeur à valider
 * @param {Object} enumObj - Enum de référence
 * @param {string} fieldName - Nom du champ (pour logging)
 * @returns {boolean}
 */
export function validateEnumValue(value, enumObj, fieldName) {
  const allowed = Object.values(enumObj)
  const isValid = allowed.includes(value)

  console.log('[CRV][ENUM_CHECK]', {
    field: fieldName,
    value,
    allowed,
    valid: isValid
  })

  if (!isValid) {
    console.error(`[CRV][ENUM_ERROR] Valeur "${value}" non autorisée pour ${fieldName}. Valeurs autorisées: ${allowed.join(', ')}`)
  }

  return isValid
}

/**
 * Retourne les options pour un select à partir d'un enum
 * @param {Object} enumObj - Enum
 * @param {Object} labelsObj - Labels correspondants
 * @returns {Array<{value: string, label: string}>}
 */
export function enumToOptions(enumObj, labelsObj) {
  return Object.values(enumObj).map(value => ({
    value,
    label: labelsObj[value] || value
  }))
}

// Mapping des enums vers leurs labels pour getEnumOptions
const ENUM_LABELS_MAP = new Map([
  [STATUT_CRV, STATUT_CRV_LABELS],
  [STATUT_PHASE, STATUT_PHASE_LABELS],
  [STATUT_EVENEMENT, STATUT_EVENEMENT_LABELS],
  [STATUT_VOL, STATUT_VOL_LABELS],
  [TYPE_EVENEMENT, TYPE_EVENEMENT_LABELS],
  [TYPE_CHARGE, TYPE_CHARGE_LABELS],
  [TYPE_FRET, TYPE_FRET_LABELS],
  [TYPE_ENGIN, TYPE_ENGIN_LABELS],
  [TYPE_OPERATION, TYPE_OPERATION_LABELS],
  [GRAVITE_EVENEMENT, GRAVITE_EVENEMENT_LABELS],
  [SENS_OPERATION, SENS_OPERATION_LABELS],
  [CATEGORIE_OBSERVATION, CATEGORIE_OBSERVATION_LABELS],
  [VISIBILITE_OBSERVATION, VISIBILITE_OBSERVATION_LABELS],
  [MOTIF_NON_REALISATION, MOTIF_NON_REALISATION_LABELS],
  [USAGE_ENGIN, USAGE_ENGIN_LABELS]
])

/**
 * Retourne les options pour un select à partir d'un enum (auto-détection des labels)
 * @param {Object} enumObj - Enum
 * @returns {Array<{value: string, label: string}>}
 */
export function getEnumOptions(enumObj) {
  const labelsObj = ENUM_LABELS_MAP.get(enumObj)

  if (!labelsObj) {
    console.warn('[CRV][ENUM_WARNING] Labels non trouvés pour cet enum, utilisation des valeurs brutes')
    return Object.values(enumObj).map(value => ({ value, label: value }))
  }

  console.log('[CRV][ENUM_OPTIONS] Options générées:', Object.values(enumObj).length)
  return enumToOptions(enumObj, labelsObj)
}

// ============================================
// EXPORTS GROUPÉS
// ============================================

export default {
  // Statuts
  STATUT_CRV,
  STATUT_CRV_LABELS,
  STATUT_PHASE,
  STATUT_PHASE_LABELS,
  STATUT_EVENEMENT,
  STATUT_EVENEMENT_LABELS,
  STATUT_VOL,
  STATUT_VOL_LABELS,

  // Types
  TYPE_EVENEMENT,
  TYPE_EVENEMENT_LABELS,
  TYPE_CHARGE,
  TYPE_CHARGE_LABELS,
  TYPE_FRET,
  TYPE_FRET_LABELS,
  TYPE_ENGIN,
  TYPE_ENGIN_LABELS,
  TYPE_OPERATION,
  TYPE_OPERATION_LABELS,

  // Autres enums
  GRAVITE_EVENEMENT,
  GRAVITE_EVENEMENT_LABELS,
  SENS_OPERATION,
  SENS_OPERATION_LABELS,
  CATEGORIE_OBSERVATION,
  CATEGORIE_OBSERVATION_LABELS,
  VISIBILITE_OBSERVATION,
  VISIBILITE_OBSERVATION_LABELS,
  CATEGORIE_PHASE,
  MOTIF_NON_REALISATION,
  MOTIF_NON_REALISATION_LABELS,
  USAGE_ENGIN,
  USAGE_ENGIN_LABELS,

  // Constantes
  SEUILS_COMPLETUDE,
  ERROR_CODES,

  // Fonctions
  validateEnumValue,
  enumToOptions,
  getEnumOptions
}
