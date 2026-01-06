/**
 * =====================================================
 * UTILISATEURS DE TEST
 * =====================================================
 */

import { ROLES } from '@/config/roles'

/**
 * Mot de passe par défaut pour tous les utilisateurs de test
 * En production, chaque utilisateur aura un mot de passe temporaire unique
 */
export const MOT_DE_PASSE_TEST = 'Test2024!'

/**
 * Liste complète des utilisateurs de test
 */
export const utilisateurs = [
  // ==========================================
  // ADMINISTRATEUR
  // ==========================================
  {
    id: 'user-admin-001',
    nom: 'Administrateur',
    prenom: 'Système',
    email: 'admin@airport.sn',
    fonction: ROLES.ADMIN,
    matricule: 'ADM-001',
    telephone: '+221 77 000 00 01',
    actif: true,
    dateCreation: '2024-01-01T00:00:00Z',
    derniereConnexion: '2024-01-15T08:00:00Z',
    doitChangerMotDePasse: false,
    metadata: {
      description: 'Compte administrateur principal',
      permissions: ['FULL_ACCESS']
    }
  },

  // ==========================================
  // AGENTS D'ESCALE
  // ==========================================
  {
    id: 'user-agent-001',
    nom: 'Diallo',
    prenom: 'Amadou',
    email: 'amadou.diallo@airport.sn',
    fonction: ROLES.AGENT_ESCALE,
    matricule: 'AGT-2024-001',
    telephone: '+221 77 100 00 01',
    actif: true,
    dateCreation: '2024-01-02T09:00:00Z',
    derniereConnexion: '2024-01-15T14:00:00Z',
    doitChangerMotDePasse: false,
    equipe: 'Équipe A - Matin',
    metadata: {
      specialite: 'Vols long-courriers',
      langues: ['Français', 'Anglais', 'Wolof']
    }
  },
  {
    id: 'user-agent-002',
    nom: 'Faye',
    prenom: 'Mariama',
    email: 'mariama.faye@airport.sn',
    fonction: ROLES.AGENT_ESCALE,
    matricule: 'AGT-2024-002',
    telephone: '+221 77 100 00 02',
    actif: true,
    dateCreation: '2024-01-02T09:00:00Z',
    derniereConnexion: '2024-01-15T22:00:00Z',
    doitChangerMotDePasse: false,
    equipe: 'Équipe B - Nuit',
    metadata: {
      specialite: 'Vols régionaux',
      langues: ['Français', 'Anglais', 'Portugais']
    }
  },
  {
    id: 'user-agent-003',
    nom: 'Sarr',
    prenom: 'Ousmane',
    email: 'ousmane.sarr@airport.sn',
    fonction: ROLES.AGENT_ESCALE,
    matricule: 'AGT-2024-003',
    telephone: '+221 77 100 00 03',
    actif: true,
    dateCreation: '2024-01-03T09:00:00Z',
    derniereConnexion: '2024-01-16T08:00:00Z',
    doitChangerMotDePasse: false,
    equipe: 'Équipe A - Matin',
    metadata: {
      specialite: 'Turn Around',
      langues: ['Français', 'Arabe']
    }
  },
  {
    id: 'user-agent-004',
    nom: 'Ba',
    prenom: 'Ibrahima',
    email: 'ibrahima.ba@airport.sn',
    fonction: ROLES.AGENT_ESCALE,
    matricule: 'AGT-2024-004',
    telephone: '+221 77 100 00 04',
    actif: true,
    dateCreation: '2024-01-04T09:00:00Z',
    derniereConnexion: '2024-01-14T16:00:00Z',
    doitChangerMotDePasse: true, // Doit changer son mot de passe
    equipe: 'Équipe C - Après-midi',
    metadata: {
      specialite: 'Fret',
      langues: ['Français', 'Anglais']
    }
  },
  {
    id: 'user-agent-005',
    nom: 'Gueye',
    prenom: 'Awa',
    email: 'awa.gueye@airport.sn',
    fonction: ROLES.AGENT_ESCALE,
    matricule: 'AGT-2024-005',
    telephone: '+221 77 100 00 05',
    actif: false, // Compte désactivé
    dateCreation: '2024-01-05T09:00:00Z',
    derniereConnexion: '2024-01-10T12:00:00Z',
    doitChangerMotDePasse: false,
    equipe: 'Équipe B - Nuit',
    metadata: {
      motifDesactivation: 'Congé maternité',
      dateDesactivation: '2024-01-10T00:00:00Z'
    }
  },

  // ==========================================
  // CHEFS D'ÉQUIPE
  // ==========================================
  {
    id: 'user-chef-001',
    nom: 'Niang',
    prenom: 'Abdoulaye',
    email: 'abdoulaye.niang@airport.sn',
    fonction: ROLES.CHEF_EQUIPE,
    matricule: 'CHF-2024-001',
    telephone: '+221 77 200 00 01',
    actif: true,
    dateCreation: '2024-01-01T09:00:00Z',
    derniereConnexion: '2024-01-15T06:00:00Z',
    doitChangerMotDePasse: false,
    equipe: 'Équipe A - Matin',
    metadata: {
      agentsSupervises: ['user-agent-001', 'user-agent-003'],
      experience: '8 ans'
    }
  },
  {
    id: 'user-chef-002',
    nom: 'Thiam',
    prenom: 'Coumba',
    email: 'coumba.thiam@airport.sn',
    fonction: ROLES.CHEF_EQUIPE,
    matricule: 'CHF-2024-002',
    telephone: '+221 77 200 00 02',
    actif: true,
    dateCreation: '2024-01-01T09:00:00Z',
    derniereConnexion: '2024-01-15T20:00:00Z',
    doitChangerMotDePasse: false,
    equipe: 'Équipe B - Nuit',
    metadata: {
      agentsSupervises: ['user-agent-002', 'user-agent-005'],
      experience: '5 ans'
    }
  },

  // ==========================================
  // SUPERVISEURS
  // ==========================================
  {
    id: 'user-sup-001',
    nom: 'Ndiaye',
    prenom: 'Fatou',
    email: 'fatou.ndiaye@airport.sn',
    fonction: ROLES.SUPERVISEUR,
    matricule: 'SUP-2024-001',
    telephone: '+221 77 300 00 01',
    actif: true,
    dateCreation: '2024-01-01T09:00:00Z',
    derniereConnexion: '2024-01-15T15:00:00Z',
    doitChangerMotDePasse: false,
    metadata: {
      responsabilite: 'Validation CRV - Tous terminaux',
      experience: '12 ans'
    }
  },
  {
    id: 'user-sup-002',
    nom: 'Fall',
    prenom: 'Moustapha',
    email: 'moustapha.fall@airport.sn',
    fonction: ROLES.SUPERVISEUR,
    matricule: 'SUP-2024-002',
    telephone: '+221 77 300 00 02',
    actif: true,
    dateCreation: '2024-01-01T09:00:00Z',
    derniereConnexion: '2024-01-14T18:00:00Z',
    doitChangerMotDePasse: false,
    metadata: {
      responsabilite: 'Validation CRV - Terminal 1',
      experience: '10 ans'
    }
  },

  // ==========================================
  // MANAGERS
  // ==========================================
  {
    id: 'user-mgr-001',
    nom: 'Diop',
    prenom: 'Moussa',
    email: 'moussa.diop@airport.sn',
    fonction: ROLES.MANAGER,
    matricule: 'MGR-2024-001',
    telephone: '+221 77 400 00 01',
    actif: true,
    dateCreation: '2024-01-01T09:00:00Z',
    derniereConnexion: '2024-01-15T09:00:00Z',
    doitChangerMotDePasse: false,
    metadata: {
      responsabilite: 'Direction Opérations Sol',
      reportsTo: 'Directeur Général'
    }
  },

  // ==========================================
  // QUALITÉ
  // ==========================================
  {
    id: 'user-qua-001',
    nom: 'Sow',
    prenom: 'Aissatou',
    email: 'aissatou.sow@airport.sn',
    fonction: ROLES.QUALITE,
    matricule: 'QUA-2024-001',
    telephone: '+221 77 500 00 01',
    actif: true,
    dateCreation: '2024-01-01T09:00:00Z',
    derniereConnexion: '2024-01-15T11:00:00Z',
    doitChangerMotDePasse: false,
    metadata: {
      responsabilite: 'Audit Qualité et Conformité',
      certifications: ['ISO 9001', 'ISAGO']
    }
  },
  {
    id: 'user-qua-002',
    nom: 'Mbaye',
    prenom: 'Cheikh',
    email: 'cheikh.mbaye@airport.sn',
    fonction: ROLES.QUALITE,
    matricule: 'QUA-2024-002',
    telephone: '+221 77 500 00 02',
    actif: true,
    dateCreation: '2024-01-02T09:00:00Z',
    derniereConnexion: '2024-01-13T14:00:00Z',
    doitChangerMotDePasse: false,
    metadata: {
      responsabilite: 'Analyse Données et Reporting',
      certifications: ['ISO 9001']
    }
  }
]

/**
 * Utilisateurs par rôle (pour faciliter les tests)
 */
export const utilisateursParRole = {
  [ROLES.ADMIN]: utilisateurs.filter(u => u.fonction === ROLES.ADMIN),
  [ROLES.AGENT_ESCALE]: utilisateurs.filter(u => u.fonction === ROLES.AGENT_ESCALE),
  [ROLES.CHEF_EQUIPE]: utilisateurs.filter(u => u.fonction === ROLES.CHEF_EQUIPE),
  [ROLES.SUPERVISEUR]: utilisateurs.filter(u => u.fonction === ROLES.SUPERVISEUR),
  [ROLES.MANAGER]: utilisateurs.filter(u => u.fonction === ROLES.MANAGER),
  [ROLES.QUALITE]: utilisateurs.filter(u => u.fonction === ROLES.QUALITE)
}

/**
 * Comptes de test rapide (pour le développement)
 */
export const comptesTest = {
  admin: {
    email: 'admin@airport.sn',
    password: MOT_DE_PASSE_TEST
  },
  agent: {
    email: 'amadou.diallo@airport.sn',
    password: MOT_DE_PASSE_TEST
  },
  superviseur: {
    email: 'fatou.ndiaye@airport.sn',
    password: MOT_DE_PASSE_TEST
  },
  manager: {
    email: 'moussa.diop@airport.sn',
    password: MOT_DE_PASSE_TEST
  },
  qualite: {
    email: 'aissatou.sow@airport.sn',
    password: MOT_DE_PASSE_TEST
  }
}
