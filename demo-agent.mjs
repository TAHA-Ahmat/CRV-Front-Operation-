/**
 * Script de démonstration: CRV Arrivée COMPLET + VALIDATION
 * Usage: node demo-agent.mjs
 */

// ==========================================
// DONNÉES DE TEST
// ==========================================

const agent = {
  id: 'user-agent-001',
  nom: 'Diallo',
  prenom: 'Amadou',
  email: 'amadou.diallo@airport.sn',
  fonction: 'AGENT_ESCALE',
  matricule: 'AGT-2024-001',
  equipe: 'Équipe A - Matin'
}

const superviseur = {
  id: 'user-sup-001',
  nom: 'Ndiaye',
  prenom: 'Fatou',
  email: 'fatou.ndiaye@airport.sn',
  fonction: 'SUPERVISEUR',
  matricule: 'SUP-2024-001',
  responsabilite: 'Tous terminaux'
}

const volAF123 = {
  id: 'vol-af123',
  numeroVol: 'AF123',
  typeOperation: 'ARRIVEE',
  compagnie: { code: 'AF', nom: 'Air France', pays: 'France' },
  origine: { code: 'CDG', ville: 'Paris', pays: 'France' },
  destination: { code: 'DSS', ville: 'Dakar', pays: 'Sénégal' },
  avion: { immatriculation: 'F-GSPX', type: 'B738' },
  passagersPrevus: 168,
  heuresPrevues: { arrivee: '2024-01-15T14:30:00Z' }
}

const PHASES_ARRIVEE = [
  { nom: 'Positionnement avion', dureePrevue: 5 },
  { nom: 'Calage & Sécurisation', dureePrevue: 3 },
  { nom: 'Débarquement passagers', dureePrevue: 15 },
  { nom: 'Déchargement bagages', dureePrevue: 20 },
  { nom: 'Nettoyage & Inspection', dureePrevue: 10 }
]

// Helpers
const delay = (ms) => new Promise(r => setTimeout(r, ms))
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`

// État du CRV
let currentCRV = null
let currentUser = null

// ==========================================
// PARTIE 1: AGENT CRÉE LE CRV
// ==========================================

console.log('\n' + '═'.repeat(70))
console.log('  PARTIE 1: AGENT D\'ESCALE - Création du CRV Arrivée')
console.log('═'.repeat(70) + '\n')

// Connexion Agent
console.log('📝 Connexion Agent d\'Escale')
console.log('─'.repeat(50))
await delay(150)
currentUser = agent
console.log(`✅ ${agent.prenom} ${agent.nom} connecté (${agent.fonction})\n`)

// Création CRV
console.log('📝 Création du CRV pour vol AF123')
console.log('─'.repeat(50))
await delay(150)

currentCRV = {
  id: generateId('crv'),
  numeroCRV: `CRV-2024-0008`,
  volId: volAF123.id,
  vol: volAF123,
  agentId: agent.id,
  agent: { nom: agent.nom, prenom: agent.prenom, matricule: agent.matricule },
  statut: 'BROUILLON',
  completude: 0,
  dateCreation: new Date().toISOString(),
  phases: PHASES_ARRIVEE.map((p, i) => ({
    id: generateId('phase'),
    ...p,
    ordre: i + 1,
    statut: 'NON_DEMARRE'
  })),
  charges: [],
  observations: [],
  historique: []
}

console.log(`✅ CRV créé: ${currentCRV.numeroCRV}\n`)

// Compléter toutes les phases
console.log('📝 Exécution des phases opérationnelles')
console.log('─'.repeat(50))

for (let i = 0; i < currentCRV.phases.length; i++) {
  const phase = currentCRV.phases[i]
  await delay(100)
  phase.statut = 'TERMINE'
  phase.heureDebut = new Date(Date.now() - phase.dureePrevue * 60000).toISOString()
  phase.heureFin = new Date().toISOString()
  phase.dureeMinutes = phase.dureePrevue
  console.log(`   ✅ Phase ${i+1}/5: ${phase.nom} (${phase.dureeMinutes} min)`)
}
console.log('')

// Saisie des charges
console.log('📝 Saisie des charges')
console.log('─'.repeat(50))
await delay(100)

currentCRV.charges.push({
  id: generateId('charge'),
  typeCharge: 'PASSAGERS',
  sensOperation: 'DEBARQUEMENT',
  passagersAdultes: 145,
  passagersEnfants: 18,
  passagersBebes: 5
})
console.log('   ✅ Passagers: 168 (145 adultes, 18 enfants, 5 bébés)')

currentCRV.charges.push({
  id: generateId('charge'),
  typeCharge: 'BAGAGES',
  sensOperation: 'DEBARQUEMENT',
  nombreBagagesSoute: 185,
  poidsBagagesSouteKg: 2775,
  nombreBagagesCabine: 10
})
console.log('   ✅ Bagages: 195 (185 soute + 10 cabine) - 2775 kg')

currentCRV.charges.push({
  id: generateId('charge'),
  typeCharge: 'FRET',
  sensOperation: 'DEBARQUEMENT',
  nombreFret: 12,
  poidsFretKg: 450
})
console.log('   ✅ Fret: 12 colis - 450 kg\n')

// Observation
console.log('📝 Ajout observation')
console.log('─'.repeat(50))
await delay(100)

currentCRV.observations.push({
  id: generateId('obs'),
  categorie: 'OPERATIONNELLE',
  contenu: 'Vol arrivé à l\'heure. Débarquement fluide, aucun incident.',
  auteur: { nom: agent.nom, prenom: agent.prenom },
  dateCreation: new Date().toISOString()
})
console.log('   ✅ Observation opérationnelle ajoutée\n')

// Calcul complétude et soumission
currentCRV.completude = 100
currentCRV.statut = 'EN_ATTENTE_VALIDATION'
currentCRV.dateSoumission = new Date().toISOString()

currentCRV.historique.push({
  action: 'SOUMISSION_VALIDATION',
  date: new Date().toISOString(),
  auteur: { nom: agent.nom, prenom: agent.prenom },
  details: 'CRV soumis pour validation - Complétude 100%'
})

console.log('📝 Soumission pour validation')
console.log('─'.repeat(50))
console.log(`   ✅ CRV soumis pour validation`)
console.log(`   📊 Complétude: 100%`)
console.log(`   📊 Statut: EN_ATTENTE_VALIDATION\n`)

console.log(`   💬 "${agent.prenom} ${agent.nom} a terminé la saisie du CRV"`)
console.log(`   📧 Notification envoyée au Superviseur\n`)

// ==========================================
// PARTIE 2: SUPERVISEUR VALIDE LE CRV
// ==========================================

console.log('═'.repeat(70))
console.log('  PARTIE 2: SUPERVISEUR - Validation du CRV')
console.log('═'.repeat(70) + '\n')

// Déconnexion Agent
console.log('📝 Déconnexion Agent')
console.log('─'.repeat(50))
await delay(200)
console.log(`   🚪 ${agent.prenom} ${agent.nom} déconnecté\n`)

// Connexion Superviseur
console.log('📝 Connexion Superviseur')
console.log('─'.repeat(50))
await delay(200)
currentUser = superviseur
console.log(`✅ ${superviseur.prenom} ${superviseur.nom} connecté`)
console.log(`   💼 Fonction: ${superviseur.fonction}`)
console.log(`   🎫 Matricule: ${superviseur.matricule}`)
console.log(`   📍 Responsabilité: ${superviseur.responsabilite}\n`)

// Notification CRV en attente
console.log('📝 Notifications')
console.log('─'.repeat(50))
console.log(`   🔔 1 CRV en attente de validation`)
console.log(`   └─ ${currentCRV.numeroCRV} - Vol ${currentCRV.vol.numeroVol} (${currentCRV.vol.compagnie.nom})\n`)

// Consultation du CRV
console.log('📝 Consultation du CRV')
console.log('─'.repeat(50))
await delay(150)

console.log(`
   ┌─────────────────────────────────────────────────────────────┐
   │  CRV: ${currentCRV.numeroCRV}                                       │
   ├─────────────────────────────────────────────────────────────┤
   │  Vol        : ${currentCRV.vol.numeroVol} - ${currentCRV.vol.compagnie.nom.padEnd(25)}      │
   │  Type       : ${currentCRV.vol.typeOperation.padEnd(40)}│
   │  Trajet     : ${currentCRV.vol.origine.ville} (${currentCRV.vol.origine.code}) → Dakar (DSS)              │
   │  Avion      : ${currentCRV.vol.avion.immatriculation} (${currentCRV.vol.avion.type})                            │
   │  Agent      : ${currentCRV.agent.prenom} ${currentCRV.agent.nom} (${currentCRV.agent.matricule})            │
   ├─────────────────────────────────────────────────────────────┤
   │  PHASES (5/5 complétées)                                    │
   │  ✅ Positionnement avion ............ 5 min                 │
   │  ✅ Calage & Sécurisation ........... 3 min                 │
   │  ✅ Débarquement passagers .......... 15 min                │
   │  ✅ Déchargement bagages ............ 20 min                │
   │  ✅ Nettoyage & Inspection .......... 10 min                │
   ├─────────────────────────────────────────────────────────────┤
   │  CHARGES                                                    │
   │  👥 Passagers : 168 (145 adultes + 18 enfants + 5 bébés)    │
   │  🧳 Bagages   : 195 pièces (2775 kg soute + 10 cabine)      │
   │  📦 Fret      : 12 colis (450 kg)                           │
   ├─────────────────────────────────────────────────────────────┤
   │  OBSERVATION                                                │
   │  📝 "Vol arrivé à l'heure. Débarquement fluide."            │
   ├─────────────────────────────────────────────────────────────┤
   │  Complétude : ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%                     │
   │  Statut     : EN_ATTENTE_VALIDATION                         │
   └─────────────────────────────────────────────────────────────┘
`)

// Vérification avant validation
console.log('📝 Vérification pré-validation')
console.log('─'.repeat(50))
await delay(200)

console.log('   ✅ Complétude >= 80% : OUI (100%)')
console.log('   ✅ Toutes phases complétées : OUI (5/5)')
console.log('   ✅ Passagers saisis : OUI (168)')
console.log('   ✅ Bagages saisis : OUI (195)')
console.log('   ✅ Observation présente : OUI')
console.log('   ✅ Aucune anomalie détectée')
console.log('')
console.log('   🟢 CRV ÉLIGIBLE À LA VALIDATION\n')

// Validation
console.log('📝 VALIDATION DU CRV')
console.log('─'.repeat(50))
await delay(300)

currentCRV.statut = 'VALIDE'
currentCRV.dateValidation = new Date().toISOString()
currentCRV.validateurId = superviseur.id
currentCRV.validateur = {
  nom: superviseur.nom,
  prenom: superviseur.prenom,
  matricule: superviseur.matricule
}
currentCRV.commentaireValidation = 'CRV conforme. Opération réalisée dans les délais.'

currentCRV.historique.push({
  action: 'VALIDATION',
  date: new Date().toISOString(),
  auteur: { nom: superviseur.nom, prenom: superviseur.prenom },
  details: 'CRV validé par le superviseur'
})

console.log(`   ✅ CRV VALIDÉ avec succès!`)
console.log(`   📅 Date: ${new Date(currentCRV.dateValidation).toLocaleString('fr-FR')}`)
console.log(`   👤 Par: ${superviseur.prenom} ${superviseur.nom}`)
console.log(`   💬 Commentaire: "${currentCRV.commentaireValidation}"`)
console.log('')

// Verrouillage automatique
await delay(200)
currentCRV.statut = 'VERROUILLE'
currentCRV.dateVerrouillage = new Date().toISOString()

currentCRV.historique.push({
  action: 'VERROUILLAGE',
  date: new Date().toISOString(),
  auteur: { nom: 'Système', prenom: '' },
  details: 'CRV verrouillé automatiquement après validation'
})

console.log('   🔒 CRV automatiquement VERROUILLÉ')
console.log('   ℹ️  Aucune modification possible sans déverrouillage Manager\n')

// ==========================================
// RÉSUMÉ FINAL
// ==========================================

console.log('═'.repeat(70))
console.log('  RÉSUMÉ FINAL - CRV VALIDÉ ET VERROUILLÉ')
console.log('═'.repeat(70))

console.log(`
   ┌─────────────────────────────────────────────────────────────────┐
   │                                                                 │
   │   📋 CRV: ${currentCRV.numeroCRV}                                        │
   │   ✈️  Vol: ${currentCRV.vol.numeroVol} - ${currentCRV.vol.compagnie.nom} (${currentCRV.vol.origine.ville} → Dakar)       │
   │                                                                 │
   │   ┌───────────────────────────────────────────────────────┐     │
   │   │  STATUT: 🔒 VERROUILLÉ                                │     │
   │   │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%                            │     │
   │   └───────────────────────────────────────────────────────┘     │
   │                                                                 │
   │   HISTORIQUE:                                                   │
   │   ─────────────────────────────────────────────────────────     │
   │   ${new Date(currentCRV.dateCreation).toLocaleTimeString('fr-FR')}  📝 Création par ${agent.prenom} ${agent.nom}                     │
   │   ${new Date(currentCRV.dateSoumission).toLocaleTimeString('fr-FR')}  📤 Soumission pour validation                      │
   │   ${new Date(currentCRV.dateValidation).toLocaleTimeString('fr-FR')}  ✅ Validation par ${superviseur.prenom} ${superviseur.nom}                   │
   │   ${new Date(currentCRV.dateVerrouillage).toLocaleTimeString('fr-FR')}  🔒 Verrouillage automatique                        │
   │                                                                 │
   │   INTERVENANTS:                                                 │
   │   ─────────────────────────────────────────────────────────     │
   │   👤 Agent      : ${agent.prenom} ${agent.nom} (${agent.matricule})                │
   │   👤 Validateur : ${superviseur.prenom} ${superviseur.nom} (${superviseur.matricule})              │
   │                                                                 │
   └─────────────────────────────────────────────────────────────────┘

   ✅ WORKFLOW COMPLET TERMINÉ!

   Le CRV est maintenant:
   • Validé par le Superviseur
   • Verrouillé (lecture seule)
   • Archivable pour audit/reporting

   💡 Pour déverrouiller: Seul un MANAGER peut déverrouiller
      → Connexion: moussa.diop@airport.sn / Test2024!
`)

console.log('═'.repeat(70) + '\n')
