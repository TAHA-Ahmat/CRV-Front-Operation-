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
export const PHASES_ARRIVEE = [
  'Calage avion',
  'Déchargement bagages',
  'Déchargement fret',
  'Livraison bagages',
  'Nettoyage cabine'
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
