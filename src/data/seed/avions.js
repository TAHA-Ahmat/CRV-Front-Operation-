/**
 * =====================================================
 * AVIONS (Types et Immatriculations)
 * =====================================================
 */

/**
 * Types d'avions avec leurs caractéristiques
 */
export const typesAvions = [
  // ==========================================
  // AIRBUS - MONOCOULOIR
  // ==========================================
  {
    code: 'A319',
    nom: 'Airbus A319',
    constructeur: 'Airbus',
    categorie: 'Monocouloir',
    capaciteMax: 156,
    capaciteTypique: 140,
    autonomieKm: 6850,
    vitesseCroisiere: 840,
    longueurM: 33.84,
    envergureM: 35.80,
    poidsMaxKg: 75500
  },
  {
    code: 'A320',
    nom: 'Airbus A320',
    constructeur: 'Airbus',
    categorie: 'Monocouloir',
    capaciteMax: 180,
    capaciteTypique: 164,
    autonomieKm: 6100,
    vitesseCroisiere: 840,
    longueurM: 37.57,
    envergureM: 35.80,
    poidsMaxKg: 78000
  },
  {
    code: 'A321',
    nom: 'Airbus A321',
    constructeur: 'Airbus',
    categorie: 'Monocouloir',
    capaciteMax: 236,
    capaciteTypique: 200,
    autonomieKm: 5950,
    vitesseCroisiere: 840,
    longueurM: 44.51,
    envergureM: 35.80,
    poidsMaxKg: 93500
  },

  // ==========================================
  // AIRBUS - LONG COURRIER
  // ==========================================
  {
    code: 'A330',
    nom: 'Airbus A330-300',
    constructeur: 'Airbus',
    categorie: 'Long-courrier',
    capaciteMax: 440,
    capaciteTypique: 290,
    autonomieKm: 11750,
    vitesseCroisiere: 871,
    longueurM: 63.69,
    envergureM: 60.30,
    poidsMaxKg: 242000
  },
  {
    code: 'A333',
    nom: 'Airbus A330-300',
    constructeur: 'Airbus',
    categorie: 'Long-courrier',
    capaciteMax: 440,
    capaciteTypique: 290,
    autonomieKm: 11750,
    vitesseCroisiere: 871,
    longueurM: 63.69,
    envergureM: 60.30,
    poidsMaxKg: 242000
  },
  {
    code: 'A350',
    nom: 'Airbus A350-900',
    constructeur: 'Airbus',
    categorie: 'Long-courrier',
    capaciteMax: 440,
    capaciteTypique: 315,
    autonomieKm: 15000,
    vitesseCroisiere: 903,
    longueurM: 66.80,
    envergureM: 64.75,
    poidsMaxKg: 280000
  },
  {
    code: 'A380',
    nom: 'Airbus A380-800',
    constructeur: 'Airbus',
    categorie: 'Très gros porteur',
    capaciteMax: 853,
    capaciteTypique: 525,
    autonomieKm: 15200,
    vitesseCroisiere: 900,
    longueurM: 72.72,
    envergureM: 79.75,
    poidsMaxKg: 575000
  },

  // ==========================================
  // BOEING - MONOCOULOIR
  // ==========================================
  {
    code: 'B737',
    nom: 'Boeing 737-800',
    constructeur: 'Boeing',
    categorie: 'Monocouloir',
    capaciteMax: 189,
    capaciteTypique: 162,
    autonomieKm: 5765,
    vitesseCroisiere: 842,
    longueurM: 39.47,
    envergureM: 35.79,
    poidsMaxKg: 79016
  },
  {
    code: 'B738',
    nom: 'Boeing 737-800',
    constructeur: 'Boeing',
    categorie: 'Monocouloir',
    capaciteMax: 189,
    capaciteTypique: 162,
    autonomieKm: 5765,
    vitesseCroisiere: 842,
    longueurM: 39.47,
    envergureM: 35.79,
    poidsMaxKg: 79016
  },
  {
    code: 'B739',
    nom: 'Boeing 737-900',
    constructeur: 'Boeing',
    categorie: 'Monocouloir',
    capaciteMax: 220,
    capaciteTypique: 180,
    autonomieKm: 5925,
    vitesseCroisiere: 842,
    longueurM: 42.11,
    envergureM: 35.79,
    poidsMaxKg: 85139
  },
  {
    code: 'B38M',
    nom: 'Boeing 737 MAX 8',
    constructeur: 'Boeing',
    categorie: 'Monocouloir',
    capaciteMax: 210,
    capaciteTypique: 178,
    autonomieKm: 6570,
    vitesseCroisiere: 842,
    longueurM: 39.52,
    envergureM: 35.92,
    poidsMaxKg: 82191
  },

  // ==========================================
  // BOEING - LONG COURRIER
  // ==========================================
  {
    code: 'B777',
    nom: 'Boeing 777-300ER',
    constructeur: 'Boeing',
    categorie: 'Long-courrier',
    capaciteMax: 550,
    capaciteTypique: 365,
    autonomieKm: 13650,
    vitesseCroisiere: 905,
    longueurM: 73.86,
    envergureM: 64.80,
    poidsMaxKg: 351534
  },
  {
    code: 'B77W',
    nom: 'Boeing 777-300ER',
    constructeur: 'Boeing',
    categorie: 'Long-courrier',
    capaciteMax: 550,
    capaciteTypique: 365,
    autonomieKm: 13650,
    vitesseCroisiere: 905,
    longueurM: 73.86,
    envergureM: 64.80,
    poidsMaxKg: 351534
  },
  {
    code: 'B787',
    nom: 'Boeing 787-8 Dreamliner',
    constructeur: 'Boeing',
    categorie: 'Long-courrier',
    capaciteMax: 381,
    capaciteTypique: 262,
    autonomieKm: 13530,
    vitesseCroisiere: 903,
    longueurM: 56.72,
    envergureM: 60.12,
    poidsMaxKg: 227930
  },
  {
    code: 'B788',
    nom: 'Boeing 787-8 Dreamliner',
    constructeur: 'Boeing',
    categorie: 'Long-courrier',
    capaciteMax: 381,
    capaciteTypique: 262,
    autonomieKm: 13530,
    vitesseCroisiere: 903,
    longueurM: 56.72,
    envergureM: 60.12,
    poidsMaxKg: 227930
  },
  {
    code: 'B789',
    nom: 'Boeing 787-9 Dreamliner',
    constructeur: 'Boeing',
    categorie: 'Long-courrier',
    capaciteMax: 420,
    capaciteTypique: 296,
    autonomieKm: 14140,
    vitesseCroisiere: 903,
    longueurM: 62.81,
    envergureM: 60.12,
    poidsMaxKg: 254011
  },

  // ==========================================
  // EMBRAER - RÉGIONAL
  // ==========================================
  {
    code: 'E190',
    nom: 'Embraer E190',
    constructeur: 'Embraer',
    categorie: 'Régional',
    capaciteMax: 114,
    capaciteTypique: 100,
    autonomieKm: 4537,
    vitesseCroisiere: 829,
    longueurM: 36.24,
    envergureM: 28.72,
    poidsMaxKg: 51800
  },
  {
    code: 'E195',
    nom: 'Embraer E195',
    constructeur: 'Embraer',
    categorie: 'Régional',
    capaciteMax: 132,
    capaciteTypique: 118,
    autonomieKm: 4260,
    vitesseCroisiere: 829,
    longueurM: 38.65,
    envergureM: 28.72,
    poidsMaxKg: 52290
  },

  // ==========================================
  // ATR - TURBOPROP
  // ==========================================
  {
    code: 'AT72',
    nom: 'ATR 72-600',
    constructeur: 'ATR',
    categorie: 'Turbopropulseur',
    capaciteMax: 78,
    capaciteTypique: 70,
    autonomieKm: 1528,
    vitesseCroisiere: 510,
    longueurM: 27.17,
    envergureM: 27.05,
    poidsMaxKg: 23000
  }
]

/**
 * Flotte d'avions avec immatriculations
 */
export const avions = [
  // ==========================================
  // AIR FRANCE
  // ==========================================
  {
    id: 'avion-af-001',
    immatriculation: 'F-GZHA',
    type: 'B738',
    compagnie: 'AF',
    nomAvion: 'Normandie',
    configuration: {
      business: 0,
      premiumEco: 0,
      economie: 180
    },
    age: 8,
    actif: true
  },
  {
    id: 'avion-af-002',
    immatriculation: 'F-GSPN',
    type: 'B77W',
    compagnie: 'AF',
    nomAvion: 'Paris',
    configuration: {
      business: 40,
      premiumEco: 32,
      economie: 250
    },
    age: 12,
    actif: true
  },
  {
    id: 'avion-af-003',
    immatriculation: 'F-HTYA',
    type: 'A350',
    compagnie: 'AF',
    nomAvion: 'Nice',
    configuration: {
      business: 34,
      premiumEco: 24,
      economie: 266
    },
    age: 3,
    actif: true
  },

  // ==========================================
  // BRUSSELS AIRLINES
  // ==========================================
  {
    id: 'avion-sn-001',
    immatriculation: 'OO-SFC',
    type: 'A333',
    compagnie: 'SN',
    nomAvion: 'Bruegel',
    configuration: {
      business: 30,
      premiumEco: 21,
      economie: 239
    },
    age: 10,
    actif: true
  },
  {
    id: 'avion-sn-002',
    immatriculation: 'OO-SFN',
    type: 'A320',
    compagnie: 'SN',
    nomAvion: 'Magritte',
    configuration: {
      business: 0,
      premiumEco: 0,
      economie: 168
    },
    age: 6,
    actif: true
  },

  // ==========================================
  // ETHIOPIAN AIRLINES
  // ==========================================
  {
    id: 'avion-et-001',
    immatriculation: 'ET-AOP',
    type: 'B788',
    compagnie: 'ET',
    nomAvion: 'Blue Nile',
    configuration: {
      business: 24,
      premiumEco: 0,
      economie: 238
    },
    age: 7,
    actif: true
  },
  {
    id: 'avion-et-002',
    immatriculation: 'ET-ARH',
    type: 'A350',
    compagnie: 'ET',
    nomAvion: 'Simien Mountains',
    configuration: {
      business: 30,
      premiumEco: 0,
      economie: 285
    },
    age: 4,
    actif: true
  },

  // ==========================================
  // AIR SÉNÉGAL
  // ==========================================
  {
    id: 'avion-hc-001',
    immatriculation: '6V-ANA',
    type: 'A321',
    compagnie: 'HC',
    nomAvion: 'Casamance',
    configuration: {
      business: 16,
      premiumEco: 0,
      economie: 168
    },
    age: 4,
    actif: true
  },
  {
    id: 'avion-hc-002',
    immatriculation: '6V-ANB',
    type: 'A330',
    compagnie: 'HC',
    nomAvion: 'Gorée',
    configuration: {
      business: 18,
      premiumEco: 21,
      economie: 251
    },
    age: 3,
    actif: true
  },

  // ==========================================
  // EMIRATES
  // ==========================================
  {
    id: 'avion-ek-001',
    immatriculation: 'A6-EDB',
    type: 'A380',
    compagnie: 'EK',
    nomAvion: null,
    configuration: {
      first: 14,
      business: 76,
      economie: 399
    },
    age: 8,
    actif: true
  },
  {
    id: 'avion-ek-002',
    immatriculation: 'A6-EQC',
    type: 'B77W',
    compagnie: 'EK',
    nomAvion: null,
    configuration: {
      first: 8,
      business: 42,
      economie: 304
    },
    age: 6,
    actif: true
  },

  // ==========================================
  // TURKISH AIRLINES
  // ==========================================
  {
    id: 'avion-tk-001',
    immatriculation: 'TC-LJA',
    type: 'B789',
    compagnie: 'TK',
    nomAvion: 'Anadolu',
    configuration: {
      business: 30,
      premiumEco: 0,
      economie: 270
    },
    age: 5,
    actif: true
  }
]

/**
 * Obtenir un type d'avion par code
 */
export function getTypeAvion(code) {
  return typesAvions.find(t => t.code === code)
}

/**
 * Obtenir un avion par immatriculation
 */
export function getAvionByImmat(immat) {
  return avions.find(a => a.immatriculation === immat)
}

/**
 * Obtenir la capacité totale d'un avion
 */
export function getCapaciteTotale(immat) {
  const avion = getAvionByImmat(immat)
  if (!avion) return 0
  const config = avion.configuration
  return (config.first || 0) + (config.business || 0) + (config.premiumEco || 0) + (config.economie || 0)
}
