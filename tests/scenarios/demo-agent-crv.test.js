/**
 * Démonstration: Agent crée un CRV Arrivée
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mockAPI, resetMockState } from '@/data/mockApi'

describe('DEMO: Agent crée CRV Arrivée', () => {
  beforeEach(() => {
    resetMockState()
  })

  it('Scénario complet: connexion + création CRV + phases', async () => {
    console.log('\n' + '='.repeat(60))
    console.log('DÉMONSTRATION: Agent d\'Escale crée un CRV Arrivée')
    console.log('='.repeat(60) + '\n')

    // ========================================
    // ÉTAPE 1: Connexion Agent
    // ========================================
    console.log('📝 ÉTAPE 1: Connexion Agent d\'Escale')
    console.log('-'.repeat(40))

    const loginResult = await mockAPI.auth.login('amadou.diallo@airport.sn', 'Test2024!')

    expect(loginResult.data.token).toBeDefined()
    expect(loginResult.data.utilisateur.fonction).toBe('AGENT_ESCALE')

    const agent = loginResult.data.utilisateur
    console.log(`✅ Connexion réussie!`)
    console.log(`   Agent: ${agent.prenom} ${agent.nom}`)
    console.log(`   Email: ${agent.email}`)
    console.log(`   Matricule: ${agent.matricule}`)
    console.log(`   Fonction: ${agent.fonction}`)
    console.log(`   Équipe: ${agent.equipe}\n`)

    // ========================================
    // ÉTAPE 2: Consulter vols Arrivée
    // ========================================
    console.log('📝 ÉTAPE 2: Vols ARRIVÉE disponibles')
    console.log('-'.repeat(40))

    const volsResult = await mockAPI.vols.getAll({ type: 'ARRIVEE' })
    const volsArrivee = volsResult.data.vols

    expect(volsArrivee.length).toBeGreaterThan(0)

    console.log(`   ${volsArrivee.length} vols arrivée trouvés:\n`)
    volsArrivee.forEach(v => {
      const heure = v.heuresPrevues.arrivee?.split('T')[1]?.substring(0,5) || '??:??'
      console.log(`   ✈️  ${v.numeroVol} | ${v.compagnie.nom.padEnd(20)} | ${v.origine.ville.padEnd(15)} | ${heure}`)
    })
    console.log('')

    // ========================================
    // ÉTAPE 3: Sélectionner vol AF123
    // ========================================
    console.log('📝 ÉTAPE 3: Sélection du vol AF123')
    console.log('-'.repeat(40))

    const volAF123 = volsArrivee.find(v => v.numeroVol === 'AF123')
    expect(volAF123).toBeDefined()

    console.log(`   Vol sélectionné: ${volAF123.numeroVol}`)
    console.log(`   Compagnie: ${volAF123.compagnie.nom} (${volAF123.compagnie.code})`)
    console.log(`   Origine: ${volAF123.origine.ville} (${volAF123.origine.code})`)
    console.log(`   Avion: ${volAF123.avion.immatriculation} (${volAF123.avion.type})`)
    console.log(`   Passagers prévus: ${volAF123.passagersPrevus}\n`)

    // ========================================
    // ÉTAPE 4: Créer le CRV
    // ========================================
    console.log('📝 ÉTAPE 4: Création du CRV')
    console.log('-'.repeat(40))

    const crvResult = await mockAPI.crv.create({ volId: volAF123.id })
    const crv = crvResult.data

    expect(crv.numeroCRV).toBeDefined()
    expect(crv.statut).toBe('BROUILLON')
    expect(crv.completude).toBe(0)

    console.log(`   ✅ CRV créé avec succès!`)
    console.log(`   Numéro: ${crv.numeroCRV}`)
    console.log(`   Statut: ${crv.statut}`)
    console.log(`   Complétude: ${crv.completude}%`)
    console.log(`   Date création: ${new Date(crv.dateCreation).toLocaleString('fr-FR')}\n`)

    // ========================================
    // ÉTAPE 5: Afficher les phases
    // ========================================
    console.log('📝 ÉTAPE 5: Phases du CRV Arrivée')
    console.log('-'.repeat(40))

    expect(crv.phases.length).toBe(8)

    console.log(`   ${crv.phases.length} phases pour un vol ARRIVÉE:\n`)
    crv.phases.forEach((phase, i) => {
      const icon = phase.statut === 'NON_DEMARRE' ? '⬜' : phase.statut === 'EN_COURS' ? '🔵' : '✅'
      console.log(`   ${i+1}. ${icon} ${phase.nom}`)
      console.log(`      Ordre: ${phase.ordre} | Durée prévue: ${phase.dureePrevue || '?'} min`)
    })
    console.log('')

    // ========================================
    // ÉTAPE 6: Démarrer Phase 1
    // ========================================
    console.log('📝 ÉTAPE 6: Démarrage Phase 1 (Positionnement)')
    console.log('-'.repeat(40))

    const phase1 = crv.phases[0]
    const demarrerResult = await mockAPI.phases.demarrer(phase1.id)

    expect(demarrerResult.data.phase.statut).toBe('EN_COURS')

    console.log(`   ✅ Phase "${phase1.nom}" démarrée!`)
    console.log(`   Statut: ${demarrerResult.data.phase.statut}`)
    console.log(`   Heure début: ${new Date(demarrerResult.data.phase.heureDebut).toLocaleTimeString('fr-FR')}\n`)

    // ========================================
    // ÉTAPE 7: Terminer Phase 1
    // ========================================
    console.log('📝 ÉTAPE 7: Fin Phase 1')
    console.log('-'.repeat(40))

    const terminerResult = await mockAPI.phases.terminer(phase1.id)

    expect(terminerResult.data.phase.statut).toBe('TERMINE')

    console.log(`   ✅ Phase "${phase1.nom}" terminée!`)
    console.log(`   Durée: ${terminerResult.data.phase.dureeMinutes || 0} minutes\n`)

    // ========================================
    // ÉTAPE 8: Ajouter Charge Passagers
    // ========================================
    console.log('📝 ÉTAPE 8: Saisie des passagers')
    console.log('-'.repeat(40))

    const chargePassagers = await mockAPI.crv.addCharge(crv.id, {
      typeCharge: 'PASSAGERS',
      sensOperation: 'DEBARQUEMENT',
      passagersAdultes: 145,
      passagersEnfants: 18,
      passagersBebes: 5
    })

    expect(chargePassagers.data.charge).toBeDefined()

    console.log(`   ✅ Passagers enregistrés!`)
    console.log(`   Adultes: 145`)
    console.log(`   Enfants: 18`)
    console.log(`   Bébés: 5`)
    console.log(`   Total: 168 passagers\n`)

    // ========================================
    // ÉTAPE 9: Ajouter Charge Bagages
    // ========================================
    console.log('📝 ÉTAPE 9: Saisie des bagages')
    console.log('-'.repeat(40))

    const chargeBagages = await mockAPI.crv.addCharge(crv.id, {
      typeCharge: 'BAGAGES',
      sensOperation: 'DEBARQUEMENT',
      nombreBagagesSoute: 185,
      poidsBagagesSouteKg: 2775,
      nombreBagagesCabine: 10
    })

    expect(chargeBagages.data.charge).toBeDefined()

    console.log(`   ✅ Bagages enregistrés!`)
    console.log(`   Bagages soute: 185 (2775 kg)`)
    console.log(`   Bagages cabine: 10`)
    console.log(`   Total: 195 bagages\n`)

    // ========================================
    // ÉTAPE 10: Ajouter Observation
    // ========================================
    console.log('📝 ÉTAPE 10: Ajout observation')
    console.log('-'.repeat(40))

    const observation = await mockAPI.crv.addObservation(crv.id, {
      categorie: 'OPERATIONNELLE',
      contenu: 'Vol arrivé à l\'heure. Débarquement sans incident.'
    })

    expect(observation.data.observation).toBeDefined()

    console.log(`   ✅ Observation ajoutée!`)
    console.log(`   Catégorie: OPERATIONNELLE`)
    console.log(`   Contenu: "Vol arrivé à l'heure. Débarquement sans incident."\n`)

    // ========================================
    // RÉSUMÉ FINAL
    // ========================================
    console.log('='.repeat(60))
    console.log('RÉSUMÉ: CRV Arrivée créé avec succès!')
    console.log('='.repeat(60))

    // Recharger le CRV pour voir la complétude mise à jour
    const crvFinal = await mockAPI.crv.getById(crv.id)

    console.log(`
   📋 CRV: ${crvFinal.data.crv.numeroCRV}
   ✈️  Vol: ${volAF123.numeroVol} (${volAF123.compagnie.nom})
   📍 Origine: ${volAF123.origine.ville}
   👤 Agent: ${agent.prenom} ${agent.nom}

   📊 Progression:
   - Phases complétées: 1/5
   - Charges saisies: 2 (Passagers + Bagages)
   - Observations: 1
   - Complétude: ${crvFinal.data.crv.completude}%

   ⏳ Prochaines étapes:
   - Compléter les 4 phases restantes
   - Atteindre 80% pour soumettre à validation
`)

    console.log('='.repeat(60) + '\n')
  })
})
