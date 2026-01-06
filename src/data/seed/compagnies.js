/**
 * =====================================================
 * COMPAGNIES AÉRIENNES
 * =====================================================
 */

export const compagnies = [
  // ==========================================
  // COMPAGNIES AFRICAINES
  // ==========================================
  {
    id: 'comp-sn',
    code: 'SN',
    codeICAO: 'BEL',
    nom: 'Brussels Airlines',
    pays: 'Belgique',
    logo: '/logos/brussels-airlines.png',
    alliance: 'Star Alliance',
    hubPrincipal: 'BRU',
    actif: true
  },
  {
    id: 'comp-et',
    code: 'ET',
    codeICAO: 'ETH',
    nom: 'Ethiopian Airlines',
    pays: 'Éthiopie',
    logo: '/logos/ethiopian.png',
    alliance: 'Star Alliance',
    hubPrincipal: 'ADD',
    actif: true
  },
  {
    id: 'comp-at',
    code: 'AT',
    codeICAO: 'RAM',
    nom: 'Royal Air Maroc',
    pays: 'Maroc',
    logo: '/logos/royal-air-maroc.png',
    alliance: 'Oneworld',
    hubPrincipal: 'CMN',
    actif: true
  },
  {
    id: 'comp-sa',
    code: 'SA',
    codeICAO: 'SAA',
    nom: 'South African Airways',
    pays: 'Afrique du Sud',
    logo: '/logos/south-african.png',
    alliance: 'Star Alliance',
    hubPrincipal: 'JNB',
    actif: true
  },
  {
    id: 'comp-kq',
    code: 'KQ',
    codeICAO: 'KQA',
    nom: 'Kenya Airways',
    pays: 'Kenya',
    logo: '/logos/kenya-airways.png',
    alliance: 'SkyTeam',
    hubPrincipal: 'NBO',
    actif: true
  },
  {
    id: 'comp-hc',
    code: 'HC',
    codeICAO: 'ASK',
    nom: 'Air Sénégal',
    pays: 'Sénégal',
    logo: '/logos/air-senegal.png',
    alliance: null,
    hubPrincipal: 'DSS',
    actif: true
  },

  // ==========================================
  // COMPAGNIES EUROPÉENNES
  // ==========================================
  {
    id: 'comp-af',
    code: 'AF',
    codeICAO: 'AFR',
    nom: 'Air France',
    pays: 'France',
    logo: '/logos/air-france.png',
    alliance: 'SkyTeam',
    hubPrincipal: 'CDG',
    actif: true
  },
  {
    id: 'comp-ib',
    code: 'IB',
    codeICAO: 'IBE',
    nom: 'Iberia',
    pays: 'Espagne',
    logo: '/logos/iberia.png',
    alliance: 'Oneworld',
    hubPrincipal: 'MAD',
    actif: true
  },
  {
    id: 'comp-tp',
    code: 'TP',
    codeICAO: 'TAP',
    nom: 'TAP Air Portugal',
    pays: 'Portugal',
    logo: '/logos/tap.png',
    alliance: 'Star Alliance',
    hubPrincipal: 'LIS',
    actif: true
  },
  {
    id: 'comp-lh',
    code: 'LH',
    codeICAO: 'DLH',
    nom: 'Lufthansa',
    pays: 'Allemagne',
    logo: '/logos/lufthansa.png',
    alliance: 'Star Alliance',
    hubPrincipal: 'FRA',
    actif: true
  },
  {
    id: 'comp-tk',
    code: 'TK',
    codeICAO: 'THY',
    nom: 'Turkish Airlines',
    pays: 'Turquie',
    logo: '/logos/turkish.png',
    alliance: 'Star Alliance',
    hubPrincipal: 'IST',
    actif: true
  },

  // ==========================================
  // COMPAGNIES MOYEN-ORIENT
  // ==========================================
  {
    id: 'comp-ek',
    code: 'EK',
    codeICAO: 'UAE',
    nom: 'Emirates',
    pays: 'Émirats Arabes Unis',
    logo: '/logos/emirates.png',
    alliance: null,
    hubPrincipal: 'DXB',
    actif: true
  },
  {
    id: 'comp-qr',
    code: 'QR',
    codeICAO: 'QTR',
    nom: 'Qatar Airways',
    pays: 'Qatar',
    logo: '/logos/qatar.png',
    alliance: 'Oneworld',
    hubPrincipal: 'DOH',
    actif: true
  },

  // ==========================================
  // COMPAGNIES AMÉRICAINES
  // ==========================================
  {
    id: 'comp-dl',
    code: 'DL',
    codeICAO: 'DAL',
    nom: 'Delta Air Lines',
    pays: 'États-Unis',
    logo: '/logos/delta.png',
    alliance: 'SkyTeam',
    hubPrincipal: 'ATL',
    actif: true
  },
  {
    id: 'comp-ua',
    code: 'UA',
    codeICAO: 'UAL',
    nom: 'United Airlines',
    pays: 'États-Unis',
    logo: '/logos/united.png',
    alliance: 'Star Alliance',
    hubPrincipal: 'ORD',
    actif: true
  }
]

/**
 * Obtenir une compagnie par code IATA
 */
export function getCompagnieByCode(code) {
  return compagnies.find(c => c.code === code)
}

/**
 * Obtenir les compagnies par alliance
 */
export function getCompagniesByAlliance(alliance) {
  return compagnies.filter(c => c.alliance === alliance)
}
