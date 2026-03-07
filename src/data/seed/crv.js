/**
 * =====================================================
 * CRV DE TEST (Compte Rendu de Vol)
 * =====================================================
 *
 * CRV dans différents états pour tester tous les scénarios
 */

/**
 * Statuts possibles d'un CRV
 */
export const STATUTS_CRV = {
  BROUILLON: 'BROUILLON',
  EN_COURS: 'EN_COURS',
  TERMINE: 'TERMINE',
  EN_ATTENTE_VALIDATION: 'EN_ATTENTE_VALIDATION',
  VALIDE: 'VALIDE',
  REJETE: 'REJETE',
  DEVERROUILLE: 'DEVERROUILLE',
  ANNULE: 'ANNULE'
}

/**
 * Types de phases ARRIVEE
 * REF: Backend seedPhases.js - Mise à jour 2026-01-11
 * 8 phases (6 obligatoires + 2 facultatives)
 */
export const PHASES_ARRIVEE = [
  { id: 'ARR_BRIEFING', nom: 'Briefing équipes', ordre: 1, dureeEstimee: 10, categorie: 'BRIEFING', obligatoire: true },
  { id: 'ARR_ARRIVEE_AVION', nom: 'Arrivée avion', ordre: 2, dureeEstimee: 15, categorie: 'PISTE', obligatoire: true },
  { id: 'ARR_OUVERTURE_SOUTES', nom: 'Ouverture des soutes', ordre: 3, dureeEstimee: 5, categorie: 'BAGAGE', obligatoire: true },
  { id: 'ARR_DECHARGEMENT', nom: 'Déchargement', ordre: 4, dureeEstimee: 25, categorie: 'BAGAGE', obligatoire: true },
  { id: 'ARR_LIVRAISON_BAGAGES', nom: 'Livraison bagages', ordre: 5, dureeEstimee: 15, categorie: 'BAGAGE', obligatoire: true },
  { id: 'ARR_DEBARQUEMENT_PAX', nom: 'Débarquement passagers', ordre: 6, dureeEstimee: 20, categorie: 'PASSAGERS', obligatoire: true },
  { id: 'ARR_MISE_CONDITION_CABINE', nom: 'Mise en condition cabine', ordre: 7, dureeEstimee: 20, categorie: 'NETTOYAGE', obligatoire: false },
  { id: 'ARR_DEBRIEFING', nom: 'Débriefing clôture', ordre: 8, dureeEstimee: 10, categorie: 'BRIEFING', obligatoire: false }
]

export const PHASES_DEPART = [
  { id: 'phase-prep', nom: 'Préparation cabine', ordre: 1, dureeEstimee: 20 },
  { id: 'phase-emb', nom: 'Embarquement passagers', ordre: 2, dureeEstimee: 30 },
  { id: 'phase-charg-bag', nom: 'Chargement bagages', ordre: 3, dureeEstimee: 25 },
  { id: 'phase-charg-fret', nom: 'Chargement fret', ordre: 4, dureeEstimee: 15 },
  { id: 'phase-ferm', nom: 'Fermeture soutes', ordre: 5, dureeEstimee: 5 },
  { id: 'phase-push', nom: 'Push-back', ordre: 6, dureeEstimee: 5 }
]

export const PHASES_TURN_AROUND = [
  // Arrivée
  { id: 'phase-ta-pos', nom: 'Positionnement passerelle', ordre: 1, groupe: 'ARRIVEE', dureeEstimee: 5 },
  { id: 'phase-ta-cal', nom: 'Calage avion', ordre: 2, groupe: 'ARRIVEE', dureeEstimee: 3 },
  { id: 'phase-ta-deb', nom: 'Débarquement passagers', ordre: 3, groupe: 'ARRIVEE', dureeEstimee: 20 },
  { id: 'phase-ta-dech', nom: 'Déchargement bagages', ordre: 4, groupe: 'ARRIVEE', dureeEstimee: 20 },
  // Escale
  { id: 'phase-ta-nett', nom: 'Nettoyage cabine', ordre: 5, groupe: 'ESCALE', dureeEstimee: 35 },
  { id: 'phase-ta-avit', nom: 'Avitaillement carburant', ordre: 6, groupe: 'ESCALE', dureeEstimee: 30 },
  { id: 'phase-ta-cat', nom: 'Catering', ordre: 7, groupe: 'ESCALE', dureeEstimee: 25 },
  { id: 'phase-ta-maint', nom: 'Maintenance transit', ordre: 8, groupe: 'ESCALE', dureeEstimee: 20 },
  // Départ
  { id: 'phase-ta-emb', nom: 'Embarquement passagers', ordre: 9, groupe: 'DEPART', dureeEstimee: 30 },
  { id: 'phase-ta-charg', nom: 'Chargement bagages', ordre: 10, groupe: 'DEPART', dureeEstimee: 25 },
  { id: 'phase-ta-ferm', nom: 'Fermeture soutes', ordre: 11, groupe: 'DEPART', dureeEstimee: 5 },
  { id: 'phase-ta-push', nom: 'Push-back', ordre: 12, groupe: 'DEPART', dureeEstimee: 5 }
]

/**
 * CRV de test dans différents états
 */
export const crv = [
  // ==========================================
  // CRV EN COURS (Agent en train de saisir)
  // ==========================================
  {
    id: 'crv-001',
    numeroCRV: 'CRV-2024-0001',
    volId: 'vol-af123',
    vol: {
      numeroVol: 'AF123',
      compagnie: { code: 'AF', nom: 'Air France' },
      typeOperation: 'ARRIVEE',
      origine: { code: 'CDG', nom: 'Paris CDG' },
      destination: { code: 'DSS', nom: 'Dakar' }
    },
    agentId: 'user-agent-001',
    agent: {
      nom: 'Diallo',
      prenom: 'Amadou',
      matricule: 'AGT-2024-001'
    },
    statut: STATUTS_CRV.EN_COURS,
    completude: 40,
    dateCreation: '2024-01-15T14:35:00Z',
    dateModification: '2024-01-15T15:10:00Z',
    phases: [
      // 8 phases ARRIVEE (REF: Backend seedPhases.js 2026-01-11)
      { ...PHASES_ARRIVEE[0], statut: 'TERMINE', heureDebut: '2024-01-15T14:20:00Z', heureFin: '2024-01-15T14:30:00Z', dureeMinutes: 10 },
      { ...PHASES_ARRIVEE[1], statut: 'TERMINE', heureDebut: '2024-01-15T14:32:00Z', heureFin: '2024-01-15T14:47:00Z', dureeMinutes: 15 },
      { ...PHASES_ARRIVEE[2], statut: 'TERMINE', heureDebut: '2024-01-15T14:47:00Z', heureFin: '2024-01-15T14:52:00Z', dureeMinutes: 5 },
      { ...PHASES_ARRIVEE[3], statut: 'EN_COURS', heureDebut: '2024-01-15T14:52:00Z', heureFin: null, dureeMinutes: null },
      { ...PHASES_ARRIVEE[4], statut: 'NON_DEMARRE', heureDebut: null, heureFin: null, dureeMinutes: null },
      { ...PHASES_ARRIVEE[5], statut: 'NON_DEMARRE', heureDebut: null, heureFin: null, dureeMinutes: null },
      { ...PHASES_ARRIVEE[6], statut: 'NON_DEMARRE', heureDebut: null, heureFin: null, dureeMinutes: null },
      { ...PHASES_ARRIVEE[7], statut: 'NON_DEMARRE', heureDebut: null, heureFin: null, dureeMinutes: null }
    ],
    charges: [],
    evenements: [],
    observations: []
  },

  // ==========================================
  // CRV TERMINÉ (En attente de validation)
  // ==========================================
  {
    id: 'crv-002',
    numeroCRV: 'CRV-2024-0002',
    volId: 'vol-af121-hist',
    vol: {
      numeroVol: 'AF121',
      compagnie: { code: 'AF', nom: 'Air France' },
      typeOperation: 'ARRIVEE',
      origine: { code: 'CDG', nom: 'Paris CDG' },
      destination: { code: 'DSS', nom: 'Dakar' }
    },
    agentId: 'user-agent-001',
    agent: {
      nom: 'Diallo',
      prenom: 'Amadou',
      matricule: 'AGT-2024-001'
    },
    statut: STATUTS_CRV.EN_ATTENTE_VALIDATION,
    completude: 92,
    dateCreation: '2024-01-14T14:45:00Z',
    dateModification: '2024-01-14T16:30:00Z',
    phases: PHASES_ARRIVEE.map((p, i) => ({
      ...p,
      statut: 'TERMINE',
      heureDebut: `2024-01-14T${14 + Math.floor(i * 0.5)}:${(i * 10) % 60}:00Z`,
      heureFin: `2024-01-14T${14 + Math.floor((i + 1) * 0.5)}:${((i + 1) * 10) % 60}:00Z`,
      dureeMinutes: p.dureeEstimee
    })),
    charges: [
      {
        id: 'charge-001',
        typeCharge: 'PASSAGERS',
        sensOperation: 'DEBARQUEMENT',
        passagersAdultes: 142,
        passagersEnfants: 18,
        passagersBebes: 5,
        total: 165,
        dateCreation: '2024-01-14T15:30:00Z'
      },
      {
        id: 'charge-002',
        typeCharge: 'BAGAGES',
        sensOperation: 'DEBARQUEMENT',
        nombreBagagesSoute: 180,
        poidsBagagesSouteKg: 2700,
        nombreBagagesCabine: 12,
        total: 192,
        dateCreation: '2024-01-14T15:45:00Z'
      }
    ],
    evenements: [],
    observations: [
      {
        id: 'obs-001',
        categorie: 'GENERALE',
        contenu: 'Vol arrivé avec 12 minutes de retard. Débarquement et déchargement sans incident.',
        auteurId: 'user-agent-001',
        auteur: { nom: 'Diallo', prenom: 'Amadou' },
        dateCreation: '2024-01-14T16:15:00Z'
      }
    ]
  },

  // ==========================================
  // CRV VALIDÉ (Historique)
  // ==========================================
  {
    id: 'crv-003',
    numeroCRV: 'CRV-2024-0003',
    volId: 'vol-sn205-hist',
    vol: {
      numeroVol: 'SN205',
      compagnie: { code: 'SN', nom: 'Brussels Airlines' },
      typeOperation: 'DEPART',
      origine: { code: 'DSS', nom: 'Dakar' },
      destination: { code: 'BRU', nom: 'Bruxelles' }
    },
    agentId: 'user-agent-002',
    agent: {
      nom: 'Faye',
      prenom: 'Mariama',
      matricule: 'AGT-2024-002'
    },
    validateurId: 'user-sup-001',
    validateur: {
      nom: 'Ndiaye',
      prenom: 'Fatou'
    },
    statut: STATUTS_CRV.VALIDE,
    completude: 95,
    dateCreation: '2024-01-13T22:00:00Z',
    dateModification: '2024-01-14T00:30:00Z',
    dateValidation: '2024-01-14T08:15:00Z',
    phases: PHASES_DEPART.map((p, i) => ({
      ...p,
      statut: 'TERMINE',
      heureDebut: `2024-01-13T${22 + Math.floor(i * 0.3)}:${(i * 15) % 60}:00Z`,
      heureFin: `2024-01-13T${22 + Math.floor((i + 1) * 0.3)}:${((i + 1) * 15) % 60}:00Z`,
      dureeMinutes: p.dureeEstimee
    })),
    charges: [
      {
        id: 'charge-003',
        typeCharge: 'PASSAGERS',
        sensOperation: 'EMBARQUEMENT',
        passagersAdultes: 228,
        passagersEnfants: 30,
        passagersBebes: 7,
        total: 265
      },
      {
        id: 'charge-004',
        typeCharge: 'BAGAGES',
        sensOperation: 'EMBARQUEMENT',
        nombreBagagesSoute: 295,
        poidsBagagesSouteKg: 4720,
        nombreBagagesCabine: 25,
        total: 320
      },
      {
        id: 'charge-005',
        typeCharge: 'FRET',
        sensOperation: 'EMBARQUEMENT',
        nombreFret: 45,
        poidsFretKg: 1200
      }
    ],
    observations: [
      {
        id: 'obs-002',
        categorie: 'GENERALE',
        contenu: 'Vol parti à l\'heure. Embarquement fluide. Fret complet chargé.',
        auteurId: 'user-agent-002',
        auteur: { nom: 'Faye', prenom: 'Mariama' },
        dateCreation: '2024-01-14T00:15:00Z'
      }
    ],
    commentaireValidation: 'RAS - CRV complet et conforme'
  },

  // ==========================================
  // CRV REJETÉ (À corriger)
  // ==========================================
  {
    id: 'crv-004',
    numeroCRV: 'CRV-2024-0004',
    volId: 'vol-ek752-hist',
    vol: {
      numeroVol: 'EK752',
      compagnie: { code: 'EK', nom: 'Emirates' },
      typeOperation: 'ARRIVEE',
      origine: { code: 'DXB', nom: 'Dubaï' },
      destination: { code: 'DSS', nom: 'Dakar' }
    },
    agentId: 'user-agent-003',
    agent: {
      nom: 'Sarr',
      prenom: 'Ousmane',
      matricule: 'AGT-2024-003'
    },
    validateurId: 'user-sup-001',
    validateur: {
      nom: 'Ndiaye',
      prenom: 'Fatou'
    },
    statut: STATUTS_CRV.REJETE,
    completude: 78,
    dateCreation: '2024-01-12T09:20:00Z',
    dateModification: '2024-01-12T11:00:00Z',
    dateRejet: '2024-01-12T14:30:00Z',
    motifRejet: 'Observation manquante. Veuillez ajouter une observation de clôture.',
    phases: PHASES_ARRIVEE.map((p, i) => ({
      ...p,
      statut: i < 4 ? 'TERMINE' : 'NON_DEMARRE'
    })),
    charges: [
      {
        id: 'charge-006',
        typeCharge: 'PASSAGERS',
        sensOperation: 'DEBARQUEMENT',
        passagersAdultes: 285,
        passagersEnfants: 28,
        passagersBebes: 7,
        total: 320
      }
    ],
    observations: []
  },

  // ==========================================
  // CRV TURN AROUND (Complet)
  // ==========================================
  {
    id: 'crv-005',
    numeroCRV: 'CRV-2024-0005',
    volId: 'vol-et908',
    vol: {
      numeroVol: 'ET908',
      compagnie: { code: 'ET', nom: 'Ethiopian Airlines' },
      typeOperation: 'TURN_AROUND',
      origine: { code: 'ADD', nom: 'Addis Abeba' },
      escale: { code: 'DSS', nom: 'Dakar' },
      destination: { code: 'JFK', nom: 'New York' }
    },
    agentId: 'user-agent-003',
    agent: {
      nom: 'Sarr',
      prenom: 'Ousmane',
      matricule: 'AGT-2024-003'
    },
    statut: STATUTS_CRV.EN_ATTENTE_VALIDATION,
    completude: 95,
    dateCreation: '2024-01-15T08:35:00Z',
    dateModification: '2024-01-15T11:05:00Z',
    phases: PHASES_TURN_AROUND.map((p) => ({
      ...p,
      statut: 'TERMINE'
    })),
    charges: [
      // Débarquement
      {
        id: 'charge-007',
        typeCharge: 'PASSAGERS',
        sensOperation: 'DEBARQUEMENT',
        passagersAdultes: 155,
        passagersEnfants: 20,
        passagersBebes: 5,
        total: 180
      },
      {
        id: 'charge-008',
        typeCharge: 'BAGAGES',
        sensOperation: 'DEBARQUEMENT',
        nombreBagagesSoute: 200,
        poidsBagagesSouteKg: 3000,
        nombreBagagesCabine: 10,
        total: 210
      },
      // Embarquement
      {
        id: 'charge-009',
        typeCharge: 'PASSAGERS',
        sensOperation: 'EMBARQUEMENT',
        passagersAdultes: 220,
        passagersEnfants: 35,
        passagersBebes: 7,
        total: 262
      },
      {
        id: 'charge-010',
        typeCharge: 'BAGAGES',
        sensOperation: 'EMBARQUEMENT',
        nombreBagagesSoute: 310,
        poidsBagagesSouteKg: 4960,
        nombreBagagesCabine: 30,
        total: 340
      }
    ],
    observations: [
      {
        id: 'obs-003',
        categorie: 'OPERATIONNELLE',
        contenu: 'Turn around réalisé en 2h28 (objectif 2h30). Escale fluide. Départ avec 2 min d\'avance.',
        auteurId: 'user-agent-003',
        auteur: { nom: 'Sarr', prenom: 'Ousmane' },
        dateCreation: '2024-01-15T11:00:00Z'
      }
    ]
  },

  // ==========================================
  // CRV DÉVERROUILLÉ (En correction par Manager)
  // ==========================================
  {
    id: 'crv-006',
    numeroCRV: 'CRV-2024-0006',
    volId: 'vol-tk561-hist',
    vol: {
      numeroVol: 'TK561',
      compagnie: { code: 'TK', nom: 'Turkish Airlines' },
      typeOperation: 'ARRIVEE',
      origine: { code: 'IST', nom: 'Istanbul' },
      destination: { code: 'DSS', nom: 'Dakar' }
    },
    agentId: 'user-agent-001',
    agent: {
      nom: 'Diallo',
      prenom: 'Amadou',
      matricule: 'AGT-2024-001'
    },
    validateurId: 'user-sup-002',
    validateur: {
      nom: 'Fall',
      prenom: 'Moustapha'
    },
    deverrouilleurId: 'user-mgr-001',
    deverrouilleur: {
      nom: 'Diop',
      prenom: 'Moussa'
    },
    statut: STATUTS_CRV.DEVERROUILLE,
    completude: 90,
    dateCreation: '2024-01-11T10:35:00Z',
    dateValidation: '2024-01-11T16:00:00Z',
    dateDeverrouillage: '2024-01-12T09:00:00Z',
    motifDeverrouillage: 'Erreur nombre passagers signalée par la compagnie. Correction requise: 275 → 278',
    phases: PHASES_ARRIVEE.map((p) => ({
      ...p,
      statut: 'TERMINE'
    })),
    charges: [
      {
        id: 'charge-011',
        typeCharge: 'PASSAGERS',
        sensOperation: 'DEBARQUEMENT',
        passagersAdultes: 240,
        passagersEnfants: 30,
        passagersBebes: 5,
        total: 275, // À corriger vers 278
        aCorrection: true
      },
      {
        id: 'charge-012',
        typeCharge: 'BAGAGES',
        sensOperation: 'DEBARQUEMENT',
        nombreBagagesSoute: 290,
        poidsBagagesSouteKg: 4350,
        nombreBagagesCabine: 20,
        total: 310
      }
    ],
    observations: [
      {
        id: 'obs-004',
        categorie: 'GENERALE',
        contenu: 'Vol arrivé à l\'heure. Opérations normales.',
        auteurId: 'user-agent-001',
        auteur: { nom: 'Diallo', prenom: 'Amadou' },
        dateCreation: '2024-01-11T12:30:00Z'
      }
    ],
    historique: [
      {
        action: 'CREATION',
        date: '2024-01-11T10:35:00Z',
        utilisateur: 'Amadou Diallo'
      },
      {
        action: 'VALIDATION',
        date: '2024-01-11T16:00:00Z',
        utilisateur: 'Moustapha Fall',
        commentaire: 'CRV validé'
      },
      {
        action: 'DEVERROUILLAGE',
        date: '2024-01-12T09:00:00Z',
        utilisateur: 'Moussa Diop',
        commentaire: 'Erreur nombre passagers signalée par la compagnie'
      }
    ]
  },

  // ==========================================
  // CRV BROUILLON (Juste créé)
  // ==========================================
  {
    id: 'crv-007',
    numeroCRV: 'CRV-2024-0007',
    volId: 'vol-hc400',
    vol: {
      numeroVol: 'HC400',
      compagnie: { code: 'HC', nom: 'Air Sénégal' },
      typeOperation: 'DEPART',
      origine: { code: 'DSS', nom: 'Dakar' },
      destination: { code: 'ABJ', nom: 'Abidjan' }
    },
    agentId: 'user-agent-004',
    agent: {
      nom: 'Ba',
      prenom: 'Ibrahima',
      matricule: 'AGT-2024-004'
    },
    statut: STATUTS_CRV.BROUILLON,
    completude: 0,
    dateCreation: '2024-01-15T06:30:00Z',
    dateModification: '2024-01-15T06:30:00Z',
    phases: PHASES_DEPART.map((p) => ({
      ...p,
      statut: 'NON_DEMARRE',
      heureDebut: null,
      heureFin: null
    })),
    charges: [],
    evenements: [],
    observations: []
  }
]

/**
 * Obtenir les CRV par statut
 */
export function getCRVByStatut(statut) {
  return crv.filter(c => c.statut === statut)
}

/**
 * Obtenir les CRV d'un agent
 */
export function getCRVByAgent(agentId) {
  return crv.filter(c => c.agentId === agentId)
}

/**
 * Obtenir les CRV en attente de validation
 */
export function getCRVEnAttenteValidation() {
  return crv.filter(c =>
    c.statut === STATUTS_CRV.EN_ATTENTE_VALIDATION ||
    (c.statut === STATUTS_CRV.TERMINE && c.completude >= 80)
  )
}

/**
 * Obtenir les CRV validés
 */
export function getCRVValides() {
  return crv.filter(c => c.statut === STATUTS_CRV.VALIDE)
}

/**
 * Statistiques des CRV
 */
export function getStatistiquesCRV() {
  return {
    total: crv.length,
    brouillons: getCRVByStatut(STATUTS_CRV.BROUILLON).length,
    enCours: getCRVByStatut(STATUTS_CRV.EN_COURS).length,
    termines: getCRVByStatut(STATUTS_CRV.TERMINE).length,
    enAttenteValidation: getCRVEnAttenteValidation().length,
    valides: getCRVByStatut(STATUTS_CRV.VALIDE).length,
    rejetes: getCRVByStatut(STATUTS_CRV.REJETE).length,
    deverrouilles: getCRVByStatut(STATUTS_CRV.DEVERROUILLE).length,
    completudeMoyenne: Math.round(crv.reduce((sum, c) => sum + c.completude, 0) / crv.length)
  }
}
