// CONSTANTES CRV OPÉRATIONS

export const CRV_TYPES = {
  ARRIVEE: 'arrivee',
  DEPART: 'depart',
  TURNAROUND: 'turnaround'
}

export const CRV_TYPE_LABELS = {
  [CRV_TYPES.ARRIVEE]: 'Arrivée',
  [CRV_TYPES.DEPART]: 'Départ',
  [CRV_TYPES.TURNAROUND]: 'Turn Around'
}

export const CRV_STATUS = {
  IN_PROGRESS: 'in_progress',
  CLOSED: 'closed',
  VALIDATED: 'validated'
}

export const CRV_STATUS_LABELS = {
  [CRV_STATUS.IN_PROGRESS]: 'En cours de saisie',
  [CRV_STATUS.CLOSED]: 'Clôturé',
  [CRV_STATUS.VALIDATED]: 'Validé et verrouillé'
}

// RÔLES UTILISATEURS CRV (adaptés depuis Stock THS)
export const USER_ROLES = {
  AGENT: 'agent_ops',
  MANAGER: 'manager',
  ADMIN: 'admin'
}

export const USER_ROLE_LABELS = {
  [USER_ROLES.AGENT]: 'Agent Opérations',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.ADMIN]: 'Administrateur'
}

// PHASES CRV
// REF: Backend seedPhases.js - Mise à jour 2026-01-11
// 8 phases (6 obligatoires + 2 facultatives)
export const PHASES_ARRIVEE = [
  'Briefing équipes',           // Obligatoire - BRIEFING
  'Arrivée avion',              // Obligatoire - PISTE
  'Ouverture des soutes',       // Obligatoire - BAGAGE
  'Déchargement',               // Obligatoire - BAGAGE
  'Livraison bagages',          // Obligatoire - BAGAGE
  'Débarquement passagers',     // Obligatoire - PASSAGERS
  'Mise en condition cabine',   // Facultatif - NETTOYAGE
  'Débriefing clôture'          // Facultatif - BRIEFING
]

export const PHASES_DEPART = [
  'Enregistrement passagers',
  'Chargement bagages',
  'Chargement fret',
  'Embarquement passagers',
  'Repoussage'
]

export const PHASES_TURNAROUND = [
  ...PHASES_ARRIVEE,
  'Transition',
  ...PHASES_DEPART
]

// SEUILS
export const COMPLETUDE_MIN_VALIDATION = 80 // Minimum 80% pour valider un CRV
