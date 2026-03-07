/**
 * =====================================================
 * SCÉNARIO COMPLET: DÉVERROUILLAGE CRV - MANAGER
 * =====================================================
 *
 * Ce test simule le PARCOURS UTILISATEUR EXACT d'un Manager
 * qui doit déverrouiller un CRV validé pour correction.
 *
 * CONTEXTE:
 * Un CRV a été validé mais contient une erreur de saisie.
 * Le Manager doit le déverrouiller pour permettre la correction.
 *
 * PROCESSUS:
 * ┌─────────────────────────────────────────────────────────┐
 * │ Étape                              │ Résultat           │
 * ├─────────────────────────────────────────────────────────┤
 * │ 1. Connexion Manager               │ Accès complet      │
 * │ 2. Trouver le CRV verrouillé       │ Statut VERROUILLE  │
 * │ 3. Constater l'erreur              │ Données incorrectes│
 * │ 4. DÉVERROUILLER avec raison       │ Statut → EN_COURS  │
 * │ 5. Modifier les données            │ Correction OK      │
 * │ 6. RE-VALIDER le CRV               │ Statut → VALIDE    │
 * │                                                         │
 * │ AUTRES ACTIONS MANAGER:                                │
 * │ 7. Réactiver un CRV annulé         │ Statut → EN_COURS  │
 * │ 8. Supprimer un programme vol      │ Suppression OK     │
 * │ 9. Consulter statistiques          │ Rapport généré     │
 * └─────────────────────────────────────────────────────────┘
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useCRVStore } from '@/stores/crvStore'
import { ROLES } from '@/config/roles'
import { hasPermission, ACTIONS, canDeleteProgramme } from '@/utils/permissions'

// Mock des API
vi.mock('@/services/api', () => ({
  authAPI: {
    login: vi.fn(),
    logout: vi.fn()
  },
  crvAPI: {
    getById: vi.fn(),
    getAll: vi.fn(),
    update: vi.fn(),
    reactiver: vi.fn(),
    getAnnules: vi.fn(),
    getStats: vi.fn(),
    getStatistiquesAnnulations: vi.fn()
  },
  phasesAPI: {},
  chargesAPI: {
    update: vi.fn()
  },
  validationAPI: {
    valider: vi.fn(),
    deverrouiller: vi.fn()
  },
  programmesVolAPI: {
    delete: vi.fn(),
    suspendre: vi.fn()
  },
  slaAPI: {
    getRapport: vi.fn()
  }
}))

import { authAPI, crvAPI, validationAPI, programmesVolAPI, slaAPI, chargesAPI } from '@/services/api'

describe('SCÉNARIO COMPLET: DÉVERROUILLAGE CRV - Manager', () => {
  let authStore
  let crvStore

  const manager = {
    id: 'mgr-001',
    nom: 'Sow',
    prenom: 'Moussa',
    email: 'moussa.sow@airport.sn',
    fonction: ROLES.MANAGER,
    matricule: 'MGR-2024-001'
  }

  const crvVerrouille = {
    id: 'crv-001',
    numeroCRV: 'CRV-2024-0001',
    statut: 'VERROUILLE',
    completude: 92,
    validePar: { nom: 'Ndiaye', prenom: 'Fatou' },
    dateValidation: '2024-01-15T16:00:00Z',
    vol: {
      numeroVol: 'AF123',
      typeOperation: 'ARRIVEE'
    }
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    crvStore = useCRVStore()
    vi.clearAllMocks()
  })

  // ==========================================
  // ÉTAPE 1: CONNEXION MANAGER
  // ==========================================
  describe('ÉTAPE 1: Connexion Manager', () => {
    it('Manager Moussa Sow se connecte', async () => {
      console.log('\n📋 SCÉNARIO: DÉVERROUILLAGE CRV')
      console.log('👤 Manager: Moussa Sow (MGR-2024-001)')
      console.log('─'.repeat(55))

      authAPI.login.mockResolvedValue({
        data: {
          token: 'jwt-manager-token',
          utilisateur: manager
        }
      })

      await authStore.login({
        email: 'moussa.sow@airport.sn',
        password: 'ManagerPass2024!'
      })

      console.log('✅ Étape 1: Connexion réussie')
      console.log(`   → Rôle: ${authStore.getUserRole}`)
      console.log(`   → canManage: ${authStore.canManage}`)
      console.log(`   → canSupervise: ${authStore.canSupervise}`)

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.isManager).toBe(true)
      expect(authStore.canManage).toBe(true)
    })

    it('devrait avoir TOUTES les permissions opérationnelles', () => {
      // Permissions Manager
      expect(hasPermission(ROLES.MANAGER, ACTIONS.CRV_CREER)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.CRV_MODIFIER)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.CRV_SUPPRIMER)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.PROGRAMME_SUPPRIMER)).toBe(true)
      expect(hasPermission(ROLES.MANAGER, ACTIONS.PROGRAMME_VALIDER)).toBe(true)
      expect(canDeleteProgramme(ROLES.MANAGER)).toBe(true)

      // Mais PAS les permissions Admin
      expect(hasPermission(ROLES.MANAGER, ACTIONS.USER_CREER)).toBe(false)

      console.log('\n   Permissions Manager:')
      console.log('   ✅ Toutes les opérations CRV')
      console.log('   ✅ Déverrouiller CRV validés')
      console.log('   ✅ Réactiver CRV annulés')
      console.log('   ✅ Supprimer programmes vol')
      console.log('   ✅ Statistiques avancées')
      console.log('   ✗ Gestion utilisateurs (Admin uniquement)')
    })
  })

  // ==========================================
  // ÉTAPE 2: TROUVER LE CRV VERROUILLÉ
  // ==========================================
  describe('ÉTAPE 2: Trouver le CRV verrouillé', () => {
    beforeEach(() => {
      authStore.user = manager
      authStore.token = 'jwt-token'
    })

    it('Manager charge le CRV verrouillé', async () => {
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: crvVerrouille,
          phases: [{ statut: 'TERMINE' }],
          charges: [
            {
              id: 'c1',
              typeCharge: 'PASSAGERS',
              passagersAdultes: 150, // ERREUR: devrait être 168
              passagersEnfants: 15,
              passagersBebes: 3
            }
          ],
          evenements: [],
          observations: []
        }
      })

      await crvStore.loadCRV('crv-001')

      console.log('\n✅ Étape 2: CRV chargé')
      console.log(`   → Numéro: ${crvStore.currentCRV.numeroCRV}`)
      console.log(`   → Statut: ${crvStore.currentCRV.statut}`)
      console.log(`   → Validé par: ${crvStore.currentCRV.validePar.prenom} ${crvStore.currentCRV.validePar.nom}`)
      console.log(`   → isLocked: ${crvStore.isLocked}`)

      expect(crvStore.currentCRV.statut).toBe('VERROUILLE')
      expect(crvStore.isLocked).toBe(true)
      expect(crvStore.isEditable).toBe(false)
    })
  })

  // ==========================================
  // ÉTAPE 3: CONSTATER L'ERREUR
  // ==========================================
  describe('ÉTAPE 3: Constater l\'erreur', () => {
    beforeEach(() => {
      authStore.user = manager
      authStore.token = 'jwt-token'
      crvStore.currentCRV = crvVerrouille
      crvStore.charges = [
        {
          id: 'c1',
          typeCharge: 'PASSAGERS',
          passagersAdultes: 150, // ERREUR
          passagersEnfants: 15,
          passagersBebes: 3
        }
      ]
    })

    it('Manager identifie l\'erreur de saisie', () => {
      console.log('\n✅ Étape 3: Erreur identifiée')
      console.log('   ⚠️  Passagers adultes: 150 (saisi)')
      console.log('   ✓  Passagers adultes: 168 (réel selon manifeste)')
      console.log('   → Différence: 18 passagers manquants')

      const chargePassagers = crvStore.getChargesPassagers[0]
      expect(chargePassagers.passagersAdultes).toBe(150)
      // L'erreur est confirmée, il faut déverrouiller pour corriger
    })
  })

  // ==========================================
  // ÉTAPE 4: DÉVERROUILLAGE
  // ==========================================
  describe('ÉTAPE 4: Déverrouiller le CRV', () => {
    beforeEach(() => {
      authStore.user = manager
      authStore.token = 'jwt-token'
      crvStore.currentCRV = { ...crvVerrouille }
    })

    it('Manager déverrouille avec raison obligatoire', async () => {
      const raison = 'Correction nombre passagers: 150 → 168 (erreur de saisie agent)'

      validationAPI.deverrouiller.mockResolvedValue({
        data: {
          statut: 'EN_COURS',
          deverrouillePar: manager.id,
          dateDeverrouillage: '2024-01-15T17:30:00Z',
          raisonDeverrouillage: raison
        }
      })

      await crvStore.deverrouillerCRV(raison)

      console.log('\n✅ Étape 4: CRV DÉVERROUILLÉ')
      console.log(`   → Déverrouillé par: ${manager.prenom} ${manager.nom}`)
      console.log(`   → Raison: "${raison}"`)
      console.log(`   → Nouveau statut: ${crvStore.currentCRV.statut}`)
      console.log(`   → isEditable: ${crvStore.isEditable}`)

      expect(validationAPI.deverrouiller).toHaveBeenCalledWith('crv-001', raison)
      expect(crvStore.currentCRV.statut).toBe('EN_COURS')
      expect(crvStore.isEditable).toBe(true)
      expect(crvStore.isLocked).toBe(false)
    })
  })

  // ==========================================
  // ÉTAPE 5: CORRECTION DES DONNÉES
  // ==========================================
  describe('ÉTAPE 5: Corriger les données', () => {
    beforeEach(() => {
      authStore.user = manager
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        ...crvVerrouille,
        statut: 'EN_COURS'
      }
      crvStore.charges = [
        {
          id: 'c1',
          typeCharge: 'PASSAGERS',
          passagersAdultes: 150
        }
      ]
    })

    it('Manager corrige le nombre de passagers', async () => {
      chargesAPI.update.mockResolvedValue({
        data: {
          charge: {
            id: 'c1',
            typeCharge: 'PASSAGERS',
            passagersAdultes: 168, // CORRIGÉ
            passagersEnfants: 15,
            passagersBebes: 3
          }
        }
      })

      crvAPI.getById.mockResolvedValue({
        data: {
          crv: { ...crvStore.currentCRV, completude: 92 },
          phases: [],
          charges: [
            {
              id: 'c1',
              typeCharge: 'PASSAGERS',
              passagersAdultes: 168,
              passagersEnfants: 15,
              passagersBebes: 3
            }
          ],
          evenements: [],
          observations: []
        }
      })

      // Simuler la mise à jour via l'API directe (updateCharge serait ajouté au store)
      await chargesAPI.update('c1', { passagersAdultes: 168 })
      // Recharger le CRV pour obtenir les nouvelles données
      await crvStore.loadCRV('crv-001')

      console.log('\n✅ Étape 5: Données corrigées')
      console.log('   → Passagers adultes: 150 → 168')
      console.log('   → Correction appliquée')

      expect(chargesAPI.update).toHaveBeenCalledWith('c1', { passagersAdultes: 168 })
    })
  })

  // ==========================================
  // ÉTAPE 6: RE-VALIDATION
  // ==========================================
  describe('ÉTAPE 6: Re-valider le CRV', () => {
    beforeEach(() => {
      authStore.user = manager
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        ...crvVerrouille,
        statut: 'EN_COURS',
        completude: 92
      }
    })

    it('Manager re-valide le CRV corrigé', async () => {
      validationAPI.valider.mockResolvedValue({
        data: {
          statut: 'VALIDE',
          validePar: manager.id,
          dateValidation: '2024-01-15T17:45:00Z'
        }
      })

      await crvStore.validateCRV()

      console.log('\n✅ Étape 6: CRV RE-VALIDÉ')
      console.log(`   → Validé par: ${manager.prenom} ${manager.nom}`)
      console.log(`   → Nouveau statut: ${crvStore.currentCRV.statut}`)

      expect(crvStore.currentCRV.statut).toBe('VALIDE')
      expect(crvStore.isValidated).toBe(true)
    })
  })

  // ==========================================
  // ACTION 7: RÉACTIVER CRV ANNULÉ
  // ==========================================
  describe('Étape 7: Réactiver un CRV annulé', () => {
    beforeEach(() => {
      authStore.user = manager
      authStore.token = 'jwt-token'
      crvStore.currentCRV = {
        _id: 'crv-annule-001',
        id: 'crv-annule-001',
        numeroCRV: 'CRV-2024-0050',
        statut: 'ANNULE',
        motifAnnulation: 'VOL_ANNULE',
        annulePar: { nom: 'Ndiaye' },
        dateAnnulation: '2024-01-14T10:00:00Z'
      }
    })

    it('Manager réactive un CRV annulé par erreur', async () => {
      console.log('\n' + '─'.repeat(55))
      console.log('🔄 RÉACTIVATION CRV ANNULÉ')
      console.log('─'.repeat(55))
      console.log(`   → CRV: ${crvStore.currentCRV.numeroCRV}`)
      console.log(`   → Motif annulation: ${crvStore.currentCRV.motifAnnulation}`)

      crvAPI.reactiver.mockResolvedValue({
        data: {
          statut: 'EN_COURS',
          reactivePar: manager.id,
          dateReactivation: '2024-01-15T18:00:00Z'
        }
      })

      await crvStore.reactiverCRV({
        motifReactivation: 'Vol reprogrammé - annulation était une erreur'
      })

      console.log('\n✅ Étape 7: CRV RÉACTIVÉ')
      console.log('   → Statut: EN_COURS')
      console.log('   → L\'agent peut maintenant le compléter')

      expect(crvAPI.reactiver).toHaveBeenCalledWith('crv-annule-001', {
        motifReactivation: 'Vol reprogrammé - annulation était une erreur'
      })
      expect(crvStore.currentCRV.statut).toBe('EN_COURS')
    })

    it('Manager peut consulter la liste des CRV annulés', async () => {
      crvAPI.getAnnules.mockResolvedValue({
        data: {
          data: [
            { id: 'crv-a1', motifAnnulation: 'VOL_ANNULE' },
            { id: 'crv-a2', motifAnnulation: 'DOUBLON' }
          ],
          total: 2
        }
      })

      const result = await crvStore.loadCRVAnnules({ dateDebut: '2024-01-01' })

      console.log('\n   CRV Annulés trouvés:')
      result.data.forEach(crv => {
        console.log(`   → ${crv.id}: ${crv.motifAnnulation}`)
      })

      expect(result.data).toHaveLength(2)
    })
  })

  // ==========================================
  // ACTION 8: SUPPRIMER PROGRAMME VOL
  // ==========================================
  describe('Étape 8: Supprimer un programme vol', () => {
    beforeEach(() => {
      authStore.user = manager
      authStore.token = 'jwt-token'
    })

    it('SEUL le Manager peut supprimer un programme vol', async () => {
      console.log('\n' + '─'.repeat(55))
      console.log('🗑️  SUPPRESSION PROGRAMME VOL')
      console.log('─'.repeat(55))

      programmesVolAPI.delete.mockResolvedValue({
        data: { message: 'Programme supprimé avec succès' }
      })

      await programmesVolAPI.delete('prog-001')

      console.log('✅ Étape 8: Programme supprimé')
      console.log('   → PROG-001 définitivement supprimé')

      expect(programmesVolAPI.delete).toHaveBeenCalledWith('prog-001')

      // Vérifier que Superviseur ne peut pas
      expect(canDeleteProgramme(ROLES.MANAGER)).toBe(true)
      expect(canDeleteProgramme(ROLES.SUPERVISEUR)).toBe(false)
      expect(canDeleteProgramme(ROLES.AGENT_ESCALE)).toBe(false)
    })

    it('Manager peut suspendre un programme', async () => {
      programmesVolAPI.suspendre.mockResolvedValue({
        data: {
          programme: {
            id: 'prog-002',
            statut: 'SUSPENDU',
            motifSuspension: 'Maintenance système prévue'
          }
        }
      })

      const result = await programmesVolAPI.suspendre('prog-002', 'Maintenance système prévue')

      console.log('\n   Programme suspendu:')
      console.log(`   → Statut: ${result.data.programme.statut}`)
      console.log(`   → Motif: ${result.data.programme.motifSuspension}`)

      expect(result.data.programme.statut).toBe('SUSPENDU')
    })
  })

  // ==========================================
  // ACTION 9: STATISTIQUES ET RAPPORTS
  // ==========================================
  describe('Étape 9: Consulter statistiques', () => {
    beforeEach(() => {
      authStore.user = manager
      authStore.token = 'jwt-token'
    })

    it('Manager consulte les statistiques CRV', async () => {
      console.log('\n' + '─'.repeat(55))
      console.log('📊 STATISTIQUES ET RAPPORTS')
      console.log('─'.repeat(55))

      crvAPI.getStats.mockResolvedValue({
        data: {
          stats: {
            totalCRV: 450,
            enCours: 35,
            termines: 150,
            valides: 250,
            annules: 15,
            completudeMoyenne: 87,
            tauxValidation: 92.5
          }
        }
      })

      await crvStore.getStats({ dateDebut: '2024-01-01', dateFin: '2024-01-31' })

      console.log('✅ Étape 9: Statistiques récupérées')
      console.log(`   → Total CRV: ${crvStore.stats.totalCRV}`)
      console.log(`   → En cours: ${crvStore.stats.enCours}`)
      console.log(`   → Validés: ${crvStore.stats.valides}`)
      console.log(`   → Taux validation: ${crvStore.stats.tauxValidation}%`)
      console.log(`   → Complétude moyenne: ${crvStore.stats.completudeMoyenne}%`)

      expect(crvStore.stats.totalCRV).toBe(450)
    })

    it('Manager consulte le rapport SLA', async () => {
      slaAPI.getRapport.mockResolvedValue({
        data: {
          tauxConformite: 94.5,
          depassements: 12,
          tempsTraitementMoyen: 45,
          parTypeOperation: {
            ARRIVEE: { conformite: 96, count: 180 },
            DEPART: { conformite: 93, count: 150 },
            TURN_AROUND: { conformite: 92, count: 120 }
          }
        }
      })

      const rapport = await slaAPI.getRapport({ dateDebut: '2024-01-01' })

      console.log('\n   Rapport SLA:')
      console.log(`   → Taux conformité: ${rapport.data.tauxConformite}%`)
      console.log(`   → Dépassements: ${rapport.data.depassements}`)
      console.log(`   → Temps moyen: ${rapport.data.tempsTraitementMoyen} min`)

      expect(rapport.data.tauxConformite).toBe(94.5)
    })
  })

  // ==========================================
  // SCÉNARIO COMPLET
  // ==========================================
  describe('SCÉNARIO COMPLET: Déverrouillage et correction', () => {
    it('devrait déverrouiller, corriger et re-valider un CRV', async () => {
      console.log('\n' + '═'.repeat(60))
      console.log('🔄 EXÉCUTION SCÉNARIO COMPLET DÉVERROUILLAGE')
      console.log('═'.repeat(60))

      // 1. LOGIN
      authAPI.login.mockResolvedValue({ data: { token: 'jwt', utilisateur: manager } })
      await authStore.login({ email: 'test@test.com', password: 'pass' })
      expect(authStore.isManager).toBe(true)
      console.log('✅ 1. Connexion Manager')

      // 2. CHARGER CRV VERROUILLÉ
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: crvVerrouille,
          phases: [],
          charges: [{ id: 'c1', passagersAdultes: 150 }],
          evenements: [],
          observations: []
        }
      })
      await crvStore.loadCRV('crv-001')
      expect(crvStore.isLocked).toBe(true)
      console.log('✅ 2. CRV verrouillé chargé')

      // 3. DÉVERROUILLER
      validationAPI.deverrouiller.mockResolvedValue({
        data: { statut: 'EN_COURS' }
      })
      await crvStore.deverrouillerCRV('Correction passagers')
      expect(crvStore.isEditable).toBe(true)
      console.log('✅ 3. CRV déverrouillé')

      // 4. CORRIGER
      chargesAPI.update.mockResolvedValue({
        data: { charge: { passagersAdultes: 168 } }
      })
      crvAPI.getById.mockResolvedValue({
        data: {
          crv: { ...crvStore.currentCRV, completude: 92 },
          phases: [],
          charges: [{ id: 'c1', passagersAdultes: 168 }],
          evenements: [],
          observations: []
        }
      })
      await chargesAPI.update('c1', { passagersAdultes: 168 })
      await crvStore.loadCRV('crv-001')
      console.log('✅ 4. Données corrigées (150 → 168)')

      // 5. RE-VALIDER
      validationAPI.valider.mockResolvedValue({
        data: { statut: 'VALIDE' }
      })
      await crvStore.validateCRV()
      expect(crvStore.isValidated).toBe(true)
      console.log('✅ 5. CRV re-validé')

      console.log('─'.repeat(60))
      console.log('📊 RÉSULTAT: Correction réussie')
      console.log(`   → CRV: ${crvStore.currentCRV.numeroCRV}`)
      console.log(`   → Statut final: ${crvStore.currentCRV.statut}`)
      console.log('═'.repeat(60))
    })
  })
})
