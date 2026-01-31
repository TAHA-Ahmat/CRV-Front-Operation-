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
  SECURITE: 'SECURITE',
  BRIEFING: 'BRIEFING'
})

// ============================================
// RÔLES PERSONNEL (MVS-9 #1)
// Référence : MVS-9-Transversal/05-process-metier.md
// ============================================

export const ROLE_PERSONNEL = Object.freeze({
  CHEF_ESCALE: 'CHEF_ESCALE',
  AGENT_TRAFIC: 'AGENT_TRAFIC',
  AGENT_PISTE: 'AGENT_PISTE',
  AGENT_PASSAGE: 'AGENT_PASSAGE',
  MANUTENTIONNAIRE: 'MANUTENTIONNAIRE',
  CHAUFFEUR: 'CHAUFFEUR',
  AGENT_SECURITE: 'AGENT_SECURITE',
  TECHNICIEN: 'TECHNICIEN',
  SUPERVISEUR: 'SUPERVISEUR',
  COORDINATEUR: 'COORDINATEUR',
  AUTRE: 'AUTRE'
})

export const ROLE_PERSONNEL_LABELS = Object.freeze({
  [ROLE_PERSONNEL.CHEF_ESCALE]: 'Chef d\'escale',
  [ROLE_PERSONNEL.AGENT_TRAFIC]: 'Agent de trafic',
  [ROLE_PERSONNEL.AGENT_PISTE]: 'Agent de piste',
  [ROLE_PERSONNEL.AGENT_PASSAGE]: 'Agent de passage',
  [ROLE_PERSONNEL.MANUTENTIONNAIRE]: 'Manutentionnaire',
  [ROLE_PERSONNEL.CHAUFFEUR]: 'Chauffeur',
  [ROLE_PERSONNEL.AGENT_SECURITE]: 'Agent de sécurité',
  [ROLE_PERSONNEL.TECHNICIEN]: 'Technicien',
  [ROLE_PERSONNEL.SUPERVISEUR]: 'Superviseur',
  [ROLE_PERSONNEL.COORDINATEUR]: 'Coordinateur',
  [ROLE_PERSONNEL.AUTRE]: 'Autre'
})

export const ROLE_PERSONNEL_DESCRIPTIONS = Object.freeze({
  [ROLE_PERSONNEL.CHEF_ESCALE]: 'Responsable de la coordination des opérations d\'escale',
  [ROLE_PERSONNEL.AGENT_TRAFIC]: 'Gère le trafic passagers et les formalités',
  [ROLE_PERSONNEL.AGENT_PISTE]: 'Intervient sur les opérations piste',
  [ROLE_PERSONNEL.AGENT_PASSAGE]: 'Gère l\'embarquement et le débarquement passagers',
  [ROLE_PERSONNEL.MANUTENTIONNAIRE]: 'Chargement et déchargement bagages et fret',
  [ROLE_PERSONNEL.CHAUFFEUR]: 'Conduite des engins de piste',
  [ROLE_PERSONNEL.AGENT_SECURITE]: 'Assure la sécurité sur le périmètre avion',
  [ROLE_PERSONNEL.TECHNICIEN]: 'Maintenance et interventions techniques',
  [ROLE_PERSONNEL.SUPERVISEUR]: 'Supervise les équipes au sol',
  [ROLE_PERSONNEL.COORDINATEUR]: 'Coordonne entre différents services',
  [ROLE_PERSONNEL.AUTRE]: 'Autre rôle (précisez)'
})

// ============================================
// TYPES ÉVÉNEMENT (MVS-9 #2 - ÉTENDU)
// Référence : MVS-9-Transversal/05-process-metier.md - 14 types
// ============================================

export const TYPE_EVENEMENT = Object.freeze({
  // Types retard détaillés
  RETARD_PASSAGERS: 'RETARD_PASSAGERS',
  RETARD_BAGAGES: 'RETARD_BAGAGES',
  RETARD_FRET: 'RETARD_FRET',
  RETARD_CARBURANT: 'RETARD_CARBURANT',
  RETARD_EQUIPAGE: 'RETARD_EQUIPAGE',
  RETARD_TECHNIQUE: 'RETARD_TECHNIQUE',
  RETARD_METEO: 'RETARD_METEO',
  RETARD_ATC: 'RETARD_ATC',
  // Types incidents
  INCIDENT_SECURITE: 'INCIDENT_SECURITE',
  INCIDENT_SURETE: 'INCIDENT_SURETE',
  INCIDENT_TECHNIQUE: 'INCIDENT_TECHNIQUE',
  // Types changements
  CHANGEMENT_PORTE: 'CHANGEMENT_PORTE',
  CHANGEMENT_STAND: 'CHANGEMENT_STAND',
  // Autre
  AUTRE: 'AUTRE'
})

export const TYPE_EVENEMENT_LABELS = Object.freeze({
  [TYPE_EVENEMENT.RETARD_PASSAGERS]: 'Retard passagers',
  [TYPE_EVENEMENT.RETARD_BAGAGES]: 'Retard bagages',
  [TYPE_EVENEMENT.RETARD_FRET]: 'Retard fret',
  [TYPE_EVENEMENT.RETARD_CARBURANT]: 'Retard carburant',
  [TYPE_EVENEMENT.RETARD_EQUIPAGE]: 'Retard équipage',
  [TYPE_EVENEMENT.RETARD_TECHNIQUE]: 'Retard technique',
  [TYPE_EVENEMENT.RETARD_METEO]: 'Retard météo',
  [TYPE_EVENEMENT.RETARD_ATC]: 'Retard ATC',
  [TYPE_EVENEMENT.INCIDENT_SECURITE]: 'Incident sécurité',
  [TYPE_EVENEMENT.INCIDENT_SURETE]: 'Incident sûreté',
  [TYPE_EVENEMENT.INCIDENT_TECHNIQUE]: 'Incident technique',
  [TYPE_EVENEMENT.CHANGEMENT_PORTE]: 'Changement de porte',
  [TYPE_EVENEMENT.CHANGEMENT_STAND]: 'Changement de stand',
  [TYPE_EVENEMENT.AUTRE]: 'Autre'
})

// Groupes de types événement pour UI simplifiée
export const TYPE_EVENEMENT_GROUPES = Object.freeze({
  RETARDS: {
    label: 'Retards',
    types: [
      TYPE_EVENEMENT.RETARD_PASSAGERS,
      TYPE_EVENEMENT.RETARD_BAGAGES,
      TYPE_EVENEMENT.RETARD_FRET,
      TYPE_EVENEMENT.RETARD_CARBURANT,
      TYPE_EVENEMENT.RETARD_EQUIPAGE,
      TYPE_EVENEMENT.RETARD_TECHNIQUE,
      TYPE_EVENEMENT.RETARD_METEO,
      TYPE_EVENEMENT.RETARD_ATC
    ]
  },
  INCIDENTS: {
    label: 'Incidents',
    types: [
      TYPE_EVENEMENT.INCIDENT_SECURITE,
      TYPE_EVENEMENT.INCIDENT_SURETE,
      TYPE_EVENEMENT.INCIDENT_TECHNIQUE
    ]
  },
  CHANGEMENTS: {
    label: 'Changements',
    types: [
      TYPE_EVENEMENT.CHANGEMENT_PORTE,
      TYPE_EVENEMENT.CHANGEMENT_STAND
    ]
  },
  AUTRES: {
    label: 'Autres',
    types: [
      TYPE_EVENEMENT.AUTRE
    ]
  }
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
  ELEVATEUR: 'ELEVATEUR',
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
  [TYPE_ENGIN.ELEVATEUR]: 'Élévateur',
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
// TYPE VOL HORS PROGRAMME
// Référence : Contrat API CRV v2 - PATH 2
// ============================================

export const TYPE_VOL_HORS_PROGRAMME = Object.freeze({
  CHARTER: 'CHARTER',
  MEDICAL: 'MEDICAL',
  TECHNIQUE: 'TECHNIQUE',
  COMMERCIAL: 'COMMERCIAL',
  CARGO: 'CARGO',
  AUTRE: 'AUTRE'
})

export const TYPE_VOL_HORS_PROGRAMME_LABELS = Object.freeze({
  [TYPE_VOL_HORS_PROGRAMME.CHARTER]: 'Charter',
  [TYPE_VOL_HORS_PROGRAMME.MEDICAL]: 'Médical',
  [TYPE_VOL_HORS_PROGRAMME.TECHNIQUE]: 'Technique',
  [TYPE_VOL_HORS_PROGRAMME.COMMERCIAL]: 'Commercial',
  [TYPE_VOL_HORS_PROGRAMME.CARGO]: 'Cargo',
  [TYPE_VOL_HORS_PROGRAMME.AUTRE]: 'Autre'
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
  CRV_DOUBLON: 'CRV_DOUBLON',
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
  [USAGE_ENGIN, USAGE_ENGIN_LABELS],
  // MVS-9: Nouveaux enums
  [ROLE_PERSONNEL, ROLE_PERSONNEL_LABELS],
  // Contrat API v2
  [TYPE_VOL_HORS_PROGRAMME, TYPE_VOL_HORS_PROGRAMME_LABELS]
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
  TYPE_EVENEMENT_GROUPES, // MVS-9: Groupes pour UI
  TYPE_CHARGE,
  TYPE_CHARGE_LABELS,
  TYPE_FRET,
  TYPE_FRET_LABELS,
  TYPE_ENGIN,
  TYPE_ENGIN_LABELS,
  TYPE_OPERATION,
  TYPE_OPERATION_LABELS,
  TYPE_VOL_HORS_PROGRAMME,
  TYPE_VOL_HORS_PROGRAMME_LABELS,

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

  // MVS-9: Rôles personnel
  ROLE_PERSONNEL,
  ROLE_PERSONNEL_LABELS,
  ROLE_PERSONNEL_DESCRIPTIONS,

  // Constantes
  SEUILS_COMPLETUDE,
  ERROR_CODES,

  // Fonctions
  validateEnumValue,
  enumToOptions,
  getEnumOptions
}
