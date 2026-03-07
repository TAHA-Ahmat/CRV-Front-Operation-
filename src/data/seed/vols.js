/**
 * =====================================================
 * VOLS DE TEST
 * =====================================================
 *
 * Vols programmés pour les tests de l'application CRV.
 * Couvre tous les types d'opérations: ARRIVÉE, DÉPART, TURN_AROUND
 */

/**
 * Date de référence pour les tests (aujourd'hui)
 */
const dateRef = new Date()
const today = dateRef.toISOString().split('T')[0]
const tomorrow = new Date(dateRef.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const yesterday = new Date(dateRef.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

/**
 * Liste des vols de test
 */
export const vols = [
  // ==========================================
  // VOLS ARRIVÉE
  // ==========================================
  {
    id: 'vol-af123',
    numeroVol: 'AF123',
    compagnie: {
      code: 'AF',
      nom: 'Air France'
    },
    typeOperation: 'ARRIVEE',
    origine: {
      code: 'CDG',
      nom: 'Paris Charles de Gaulle',
      ville: 'Paris',
      pays: 'France'
    },
    destination: {
      code: 'DSS',
      nom: 'Aéroport Blaise Diagne',
      ville: 'Dakar',
      pays: 'Sénégal'
    },
    avion: {
      immatriculation: 'F-GZHA',
      type: 'B738',
      capacite: 180
    },
    heuresPrevues: {
      depart: `${today}T08:30:00Z`,
      arrivee: `${today}T14:30:00Z`
    },
    heuresReelles: {
      depart: null,
      arrivee: null
    },
    statut: 'PROGRAMME',
    terminal: 'Terminal 1',
    porte: 'A12',
    parking: 'P24',
    escale: false,
    metadata: {
      dureeVolMinutes: 360,
      distance: 4200,
      passagersPrevus: 168,
      fretPrevu: false
    }
  },
  {
    id: 'vol-ek752',
    numeroVol: 'EK752',
    compagnie: {
      code: 'EK',
      nom: 'Emirates'
    },
    typeOperation: 'ARRIVEE',
    origine: {
      code: 'DXB',
      nom: 'Aéroport International de Dubaï',
      ville: 'Dubaï',
      pays: 'Émirats Arabes Unis'
    },
    destination: {
      code: 'DSS',
      nom: 'Aéroport Blaise Diagne',
      ville: 'Dakar',
      pays: 'Sénégal'
    },
    avion: {
      immatriculation: 'A6-EQC',
      type: 'B77W',
      capacite: 354
    },
    heuresPrevues: {
      depart: `${today}T01:00:00Z`,
      arrivee: `${today}T09:15:00Z`
    },
    heuresReelles: {
      depart: null,
      arrivee: null
    },
    statut: 'PROGRAMME',
    terminal: 'Terminal 1',
    porte: 'B05',
    parking: 'P12',
    escale: false,
    metadata: {
      dureeVolMinutes: 495,
      distance: 6800,
      passagersPrevus: 320,
      fretPrevu: true
    }
  },
  {
    id: 'vol-tk561',
    numeroVol: 'TK561',
    compagnie: {
      code: 'TK',
      nom: 'Turkish Airlines'
    },
    typeOperation: 'ARRIVEE',
    origine: {
      code: 'IST',
      nom: 'Aéroport d\'Istanbul',
      ville: 'Istanbul',
      pays: 'Turquie'
    },
    destination: {
      code: 'DSS',
      nom: 'Aéroport Blaise Diagne',
      ville: 'Dakar',
      pays: 'Sénégal'
    },
    avion: {
      immatriculation: 'TC-LJA',
      type: 'B789',
      capacite: 300
    },
    heuresPrevues: {
      depart: `${today}T02:00:00Z`,
      arrivee: `${today}T10:30:00Z`
    },
    statut: 'PROGRAMME',
    terminal: 'Terminal 1',
    porte: 'C08',
    parking: 'P18',
    escale: false,
    metadata: {
      dureeVolMinutes: 510,
      distance: 5200,
      passagersPrevus: 275,
      fretPrevu: true
    }
  },
  {
    id: 'vol-at500',
    numeroVol: 'AT500',
    compagnie: {
      code: 'AT',
      nom: 'Royal Air Maroc'
    },
    typeOperation: 'ARRIVEE',
    origine: {
      code: 'CMN',
      nom: 'Aéroport Mohammed V',
      ville: 'Casablanca',
      pays: 'Maroc'
    },
    destination: {
      code: 'DSS',
      nom: 'Aéroport Blaise Diagne',
      ville: 'Dakar',
      pays: 'Sénégal'
    },
    avion: {
      immatriculation: 'CN-RGM',
      type: 'B738',
      capacite: 162
    },
    heuresPrevues: {
      depart: `${today}T11:00:00Z`,
      arrivee: `${today}T13:30:00Z`
    },
    statut: 'PROGRAMME',
    terminal: 'Terminal 1',
    porte: 'A08',
    parking: 'P08',
    escale: false,
    metadata: {
      dureeVolMinutes: 150,
      distance: 1800,
      passagersPrevus: 145,
      fretPrevu: false
    }
  },

  // ==========================================
  // VOLS DÉPART
  // ==========================================
  {
    id: 'vol-sn205',
    numeroVol: 'SN205',
    compagnie: {
      code: 'SN',
      nom: 'Brussels Airlines'
    },
    typeOperation: 'DEPART',
    origine: {
      code: 'DSS',
      nom: 'Aéroport Blaise Diagne',
      ville: 'Dakar',
      pays: 'Sénégal'
    },
    destination: {
      code: 'BRU',
      nom: 'Aéroport de Bruxelles-National',
      ville: 'Bruxelles',
      pays: 'Belgique'
    },
    avion: {
      immatriculation: 'OO-SFC',
      type: 'A333',
      capacite: 290
    },
    heuresPrevues: {
      depart: `${today}T23:45:00Z`,
      arrivee: `${tomorrow}T06:30:00Z`
    },
    statut: 'PROGRAMME',
    terminal: 'Terminal 1',
    porte: 'B12',
    parking: 'P32',
    escale: false,
    metadata: {
      dureeVolMinutes: 405,
      distance: 4500,
      passagersPrevus: 265,
      fretPrevu: true,
      fretPoids: 1200
    }
  },
  {
    id: 'vol-af124',
    numeroVol: 'AF124',
    compagnie: {
      code: 'AF',
      nom: 'Air France'
    },
    typeOperation: 'DEPART',
    origine: {
      code: 'DSS',
      nom: 'Aéroport Blaise Diagne',
      ville: 'Dakar',
      pays: 'Sénégal'
    },
    destination: {
      code: 'CDG',
      nom: 'Paris Charles de Gaulle',
      ville: 'Paris',
      pays: 'France'
    },
    avion: {
      immatriculation: 'F-GZHA',
      type: 'B738',
      capacite: 180
    },
    heuresPrevues: {
      depart: `${today}T16:00:00Z`,
      arrivee: `${today}T22:00:00Z`
    },
    statut: 'PROGRAMME',
    terminal: 'Terminal 1',
    porte: 'A12',
    parking: 'P24',
    escale: false,
    metadata: {
      dureeVolMinutes: 360,
      distance: 4200,
      passagersPrevus: 172,
      fretPrevu: false
    }
  },
  {
    id: 'vol-hc400',
    numeroVol: 'HC400',
    compagnie: {
      code: 'HC',
      nom: 'Air Sénégal'
    },
    typeOperation: 'DEPART',
    origine: {
      code: 'DSS',
      nom: 'Aéroport Blaise Diagne',
      ville: 'Dakar',
      pays: 'Sénégal'
    },
    destination: {
      code: 'ABJ',
      nom: 'Aéroport Félix Houphouët-Boigny',
      ville: 'Abidjan',
      pays: 'Côte d\'Ivoire'
    },
    avion: {
      immatriculation: '6V-ANA',
      type: 'A321',
      capacite: 184
    },
    heuresPrevues: {
      depart: `${today}T07:00:00Z`,
      arrivee: `${today}T09:30:00Z`
    },
    statut: 'PROGRAMME',
    terminal: 'Terminal 2',
    porte: 'D02',
    parking: 'P05',
    escale: false,
    metadata: {
      dureeVolMinutes: 150,
      distance: 1400,
      passagersPrevus: 156,
      fretPrevu: true,
      fretPoids: 800
    }
  },

  // ==========================================
  // VOLS TURN AROUND (Arrivée + Départ)
  // ==========================================
  {
    id: 'vol-et908',
    numeroVol: 'ET908',
    compagnie: {
      code: 'ET',
      nom: 'Ethiopian Airlines'
    },
    typeOperation: 'TURN_AROUND',
    origine: {
      code: 'ADD',
      nom: 'Aéroport International Bole',
      ville: 'Addis Abeba',
      pays: 'Éthiopie'
    },
    escale: {
      code: 'DSS',
      nom: 'Aéroport Blaise Diagne',
      ville: 'Dakar',
      pays: 'Sénégal'
    },
    destination: {
      code: 'JFK',
      nom: 'Aéroport John F. Kennedy',
      ville: 'New York',
      pays: 'États-Unis'
    },
    avion: {
      immatriculation: 'ET-AOP',
      type: 'B788',
      capacite: 262
    },
    heuresPrevues: {
      departOrigine: `${today}T01:30:00Z`,
      arrivee: `${today}T08:30:00Z`,
      depart: `${today}T11:00:00Z`,
      arriveeDestination: `${today}T17:00:00Z`
    },
    statut: 'PROGRAMME',
    terminal: 'Terminal 1',
    porte: 'C12',
    parking: 'P40',
    tempsEscale: 150, // 2h30
    metadata: {
      dureeVolArrivee: 420,
      dureeVolDepart: 540,
      passagersPrevusArrivee: 180,
      passagersPrevusDepart: 262,
      fretPrevu: true,
      transitPassagers: true
    }
  },
  {
    id: 'vol-dl127',
    numeroVol: 'DL127',
    compagnie: {
      code: 'DL',
      nom: 'Delta Air Lines'
    },
    typeOperation: 'TURN_AROUND',
    origine: {
      code: 'ATL',
      nom: 'Aéroport Hartsfield-Jackson',
      ville: 'Atlanta',
      pays: 'États-Unis'
    },
    escale: {
      code: 'DSS',
      nom: 'Aéroport Blaise Diagne',
      ville: 'Dakar',
      pays: 'Sénégal'
    },
    destination: {
      code: 'JNB',
      nom: 'Aéroport O.R. Tambo',
      ville: 'Johannesburg',
      pays: 'Afrique du Sud'
    },
    avion: {
      immatriculation: 'N867DA',
      type: 'B789',
      capacite: 296
    },
    heuresPrevues: {
      departOrigine: `${yesterday}T23:00:00Z`,
      arrivee: `${today}T12:00:00Z`,
      depart: `${today}T14:30:00Z`,
      arriveeDestination: `${today}T23:30:00Z`
    },
    statut: 'PROGRAMME',
    terminal: 'Terminal 1',
    porte: 'B08',
    parking: 'P35',
    tempsEscale: 150,
    metadata: {
      dureeVolArrivee: 660,
      dureeVolDepart: 540,
      passagersPrevusArrivee: 220,
      passagersPrevusDepart: 280,
      fretPrevu: true,
      transitPassagers: true
    }
  },
  {
    id: 'vol-kq500',
    numeroVol: 'KQ500',
    compagnie: {
      code: 'KQ',
      nom: 'Kenya Airways'
    },
    typeOperation: 'TURN_AROUND',
    origine: {
      code: 'NBO',
      nom: 'Aéroport Jomo Kenyatta',
      ville: 'Nairobi',
      pays: 'Kenya'
    },
    escale: {
      code: 'DSS',
      nom: 'Aéroport Blaise Diagne',
      ville: 'Dakar',
      pays: 'Sénégal'
    },
    destination: {
      code: 'ACC',
      nom: 'Aéroport International Kotoka',
      ville: 'Accra',
      pays: 'Ghana'
    },
    avion: {
      immatriculation: '5Y-KZA',
      type: 'B738',
      capacite: 162
    },
    heuresPrevues: {
      departOrigine: `${today}T06:00:00Z`,
      arrivee: `${today}T11:30:00Z`,
      depart: `${today}T13:00:00Z`,
      arriveeDestination: `${today}T14:30:00Z`
    },
    statut: 'PROGRAMME',
    terminal: 'Terminal 2',
    porte: 'D05',
    parking: 'P15',
    tempsEscale: 90,
    metadata: {
      dureeVolArrivee: 330,
      dureeVolDepart: 90,
      passagersPrevusArrivee: 120,
      passagersPrevusDepart: 145,
      fretPrevu: false,
      transitPassagers: true
    }
  },

  // ==========================================
  // VOLS HISTORIQUES (pour tests)
  // ==========================================
  {
    id: 'vol-af121-hist',
    numeroVol: 'AF121',
    compagnie: {
      code: 'AF',
      nom: 'Air France'
    },
    typeOperation: 'ARRIVEE',
    origine: {
      code: 'CDG',
      nom: 'Paris Charles de Gaulle',
      ville: 'Paris',
      pays: 'France'
    },
    destination: {
      code: 'DSS',
      nom: 'Aéroport Blaise Diagne',
      ville: 'Dakar',
      pays: 'Sénégal'
    },
    avion: {
      immatriculation: 'F-GZHA',
      type: 'B738',
      capacite: 180
    },
    heuresPrevues: {
      depart: `${yesterday}T08:30:00Z`,
      arrivee: `${yesterday}T14:30:00Z`
    },
    heuresReelles: {
      depart: `${yesterday}T08:45:00Z`,
      arrivee: `${yesterday}T14:42:00Z`
    },
    statut: 'ARRIVE',
    terminal: 'Terminal 1',
    porte: 'A12',
    parking: 'P24',
    metadata: {
      passagersReels: 165,
      retardMinutes: 12
    }
  }
]

/**
 * Obtenir les vols par type d'opération
 */
export function getVolsByType(type) {
  return vols.filter(v => v.typeOperation === type)
}

/**
 * Obtenir les vols du jour
 */
export function getVolsDuJour() {
  const todayStr = new Date().toISOString().split('T')[0]
  return vols.filter(v => {
    const volDate = (v.heuresPrevues.arrivee || v.heuresPrevues.depart).split('T')[0]
    return volDate === todayStr
  })
}

/**
 * Obtenir les vols par compagnie
 */
export function getVolsByCompagnie(codeCompagnie) {
  return vols.filter(v => v.compagnie.code === codeCompagnie)
}

/**
 * Obtenir les vols en attente de CRV
 */
export function getVolsSansCRV() {
  return vols.filter(v => v.statut === 'PROGRAMME')
}
