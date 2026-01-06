/**
 * =====================================================
 * AÉROPORTS
 * =====================================================
 */

export const aeroports = [
  // ==========================================
  // SÉNÉGAL (Aéroport principal)
  // ==========================================
  {
    id: 'apt-dss',
    codeIATA: 'DSS',
    codeICAO: 'GOBD',
    nom: 'Aéroport International Blaise Diagne',
    ville: 'Dakar',
    pays: 'Sénégal',
    timezone: 'Africa/Dakar',
    utcOffset: 0,
    latitude: 14.6700,
    longitude: -17.0733,
    altitude: 27,
    terminaux: ['Terminal 1', 'Terminal 2'],
    pistes: ['01/19', '02/20'],
    actif: true,
    metadata: {
      capaciteAnnuelle: 3000000,
      ouverture: 2017
    }
  },

  // ==========================================
  // AFRIQUE
  // ==========================================
  {
    id: 'apt-add',
    codeIATA: 'ADD',
    codeICAO: 'HAAB',
    nom: 'Aéroport International Bole',
    ville: 'Addis Abeba',
    pays: 'Éthiopie',
    timezone: 'Africa/Addis_Ababa',
    utcOffset: 3,
    latitude: 8.9779,
    longitude: 38.7993,
    altitude: 2334,
    terminaux: ['Terminal 1', 'Terminal 2'],
    actif: true
  },
  {
    id: 'apt-cmn',
    codeIATA: 'CMN',
    codeICAO: 'GMMN',
    nom: 'Aéroport Mohammed V',
    ville: 'Casablanca',
    pays: 'Maroc',
    timezone: 'Africa/Casablanca',
    utcOffset: 1,
    latitude: 33.3675,
    longitude: -7.5897,
    altitude: 200,
    terminaux: ['Terminal 1', 'Terminal 2'],
    actif: true
  },
  {
    id: 'apt-jnb',
    codeIATA: 'JNB',
    codeICAO: 'FAOR',
    nom: 'Aéroport O.R. Tambo',
    ville: 'Johannesburg',
    pays: 'Afrique du Sud',
    timezone: 'Africa/Johannesburg',
    utcOffset: 2,
    latitude: -26.1367,
    longitude: 28.2411,
    altitude: 1694,
    terminaux: ['Terminal A', 'Terminal B'],
    actif: true
  },
  {
    id: 'apt-nbo',
    codeIATA: 'NBO',
    codeICAO: 'HKJK',
    nom: 'Aéroport Jomo Kenyatta',
    ville: 'Nairobi',
    pays: 'Kenya',
    timezone: 'Africa/Nairobi',
    utcOffset: 3,
    latitude: -1.3192,
    longitude: 36.9278,
    altitude: 1624,
    terminaux: ['Terminal 1', 'Terminal 2'],
    actif: true
  },
  {
    id: 'apt-acc',
    codeIATA: 'ACC',
    codeICAO: 'DGAA',
    nom: 'Aéroport International Kotoka',
    ville: 'Accra',
    pays: 'Ghana',
    timezone: 'Africa/Accra',
    utcOffset: 0,
    latitude: 5.6052,
    longitude: -0.1668,
    altitude: 62,
    terminaux: ['Terminal 3'],
    actif: true
  },
  {
    id: 'apt-abj',
    codeIATA: 'ABJ',
    codeICAO: 'DIAP',
    nom: 'Aéroport Félix Houphouët-Boigny',
    ville: 'Abidjan',
    pays: 'Côte d\'Ivoire',
    timezone: 'Africa/Abidjan',
    utcOffset: 0,
    latitude: 5.2614,
    longitude: -3.9263,
    altitude: 6,
    terminaux: ['Terminal Principal'],
    actif: true
  },

  // ==========================================
  // EUROPE
  // ==========================================
  {
    id: 'apt-cdg',
    codeIATA: 'CDG',
    codeICAO: 'LFPG',
    nom: 'Aéroport Paris-Charles de Gaulle',
    ville: 'Paris',
    pays: 'France',
    timezone: 'Europe/Paris',
    utcOffset: 1,
    latitude: 49.0097,
    longitude: 2.5478,
    altitude: 119,
    terminaux: ['Terminal 1', 'Terminal 2A-G', 'Terminal 3'],
    actif: true
  },
  {
    id: 'apt-bru',
    codeIATA: 'BRU',
    codeICAO: 'EBBR',
    nom: 'Aéroport de Bruxelles-National',
    ville: 'Bruxelles',
    pays: 'Belgique',
    timezone: 'Europe/Brussels',
    utcOffset: 1,
    latitude: 50.9014,
    longitude: 4.4844,
    altitude: 56,
    terminaux: ['Terminal A', 'Terminal B'],
    actif: true
  },
  {
    id: 'apt-lis',
    codeIATA: 'LIS',
    codeICAO: 'LPPT',
    nom: 'Aéroport Humberto Delgado',
    ville: 'Lisbonne',
    pays: 'Portugal',
    timezone: 'Europe/Lisbon',
    utcOffset: 0,
    latitude: 38.7756,
    longitude: -9.1354,
    altitude: 114,
    terminaux: ['Terminal 1', 'Terminal 2'],
    actif: true
  },
  {
    id: 'apt-mad',
    codeIATA: 'MAD',
    codeICAO: 'LEMD',
    nom: 'Aéroport Adolfo Suárez Madrid-Barajas',
    ville: 'Madrid',
    pays: 'Espagne',
    timezone: 'Europe/Madrid',
    utcOffset: 1,
    latitude: 40.4936,
    longitude: -3.5668,
    altitude: 609,
    terminaux: ['T1', 'T2', 'T3', 'T4', 'T4S'],
    actif: true
  },
  {
    id: 'apt-fra',
    codeIATA: 'FRA',
    codeICAO: 'EDDF',
    nom: 'Aéroport de Francfort',
    ville: 'Francfort',
    pays: 'Allemagne',
    timezone: 'Europe/Berlin',
    utcOffset: 1,
    latitude: 50.0379,
    longitude: 8.5622,
    altitude: 111,
    terminaux: ['Terminal 1', 'Terminal 2'],
    actif: true
  },
  {
    id: 'apt-ist',
    codeIATA: 'IST',
    codeICAO: 'LTFM',
    nom: 'Aéroport d\'Istanbul',
    ville: 'Istanbul',
    pays: 'Turquie',
    timezone: 'Europe/Istanbul',
    utcOffset: 3,
    latitude: 41.2753,
    longitude: 28.7519,
    altitude: 99,
    terminaux: ['Terminal Principal'],
    actif: true
  },

  // ==========================================
  // MOYEN-ORIENT
  // ==========================================
  {
    id: 'apt-dxb',
    codeIATA: 'DXB',
    codeICAO: 'OMDB',
    nom: 'Aéroport International de Dubaï',
    ville: 'Dubaï',
    pays: 'Émirats Arabes Unis',
    timezone: 'Asia/Dubai',
    utcOffset: 4,
    latitude: 25.2528,
    longitude: 55.3644,
    altitude: 5,
    terminaux: ['Terminal 1', 'Terminal 2', 'Terminal 3'],
    actif: true
  },
  {
    id: 'apt-doh',
    codeIATA: 'DOH',
    codeICAO: 'OTHH',
    nom: 'Aéroport International Hamad',
    ville: 'Doha',
    pays: 'Qatar',
    timezone: 'Asia/Qatar',
    utcOffset: 3,
    latitude: 25.2609,
    longitude: 51.6138,
    altitude: 4,
    terminaux: ['Terminal Principal'],
    actif: true
  },

  // ==========================================
  // AMÉRIQUE DU NORD
  // ==========================================
  {
    id: 'apt-jfk',
    codeIATA: 'JFK',
    codeICAO: 'KJFK',
    nom: 'Aéroport John F. Kennedy',
    ville: 'New York',
    pays: 'États-Unis',
    timezone: 'America/New_York',
    utcOffset: -5,
    latitude: 40.6413,
    longitude: -73.7781,
    altitude: 4,
    terminaux: ['Terminal 1', 'Terminal 2', 'Terminal 4', 'Terminal 5', 'Terminal 7', 'Terminal 8'],
    actif: true
  },
  {
    id: 'apt-iad',
    codeIATA: 'IAD',
    codeICAO: 'KIAD',
    nom: 'Aéroport Washington-Dulles',
    ville: 'Washington D.C.',
    pays: 'États-Unis',
    timezone: 'America/New_York',
    utcOffset: -5,
    latitude: 38.9445,
    longitude: -77.4558,
    altitude: 95,
    terminaux: ['Main Terminal', 'Concourse A-D'],
    actif: true
  },
  {
    id: 'apt-atl',
    codeIATA: 'ATL',
    codeICAO: 'KATL',
    nom: 'Aéroport Hartsfield-Jackson',
    ville: 'Atlanta',
    pays: 'États-Unis',
    timezone: 'America/New_York',
    utcOffset: -5,
    latitude: 33.6407,
    longitude: -84.4277,
    altitude: 313,
    terminaux: ['Domestic Terminal', 'International Terminal'],
    actif: true
  }
]

/**
 * Obtenir un aéroport par code IATA
 */
export function getAeroportByCode(code) {
  return aeroports.find(a => a.codeIATA === code)
}

/**
 * Obtenir les aéroports par pays
 */
export function getAeroportsByPays(pays) {
  return aeroports.filter(a => a.pays === pays)
}

/**
 * Calculer le décalage horaire entre deux aéroports
 */
export function getDecalageHoraire(codeDepart, codeArrivee) {
  const depart = getAeroportByCode(codeDepart)
  const arrivee = getAeroportByCode(codeArrivee)
  if (!depart || !arrivee) return null
  return arrivee.utcOffset - depart.utcOffset
}
