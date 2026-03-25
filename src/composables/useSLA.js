import { ref } from 'vue'
import { slaAPI } from '../services/api'

/**
 * Composable SLA — calcul local du statut SLA pour chaque CRV
 *
 * Charge les configs SLA (défaut + par compagnie) une seule fois,
 * puis calcule le statut SLA localement pour chaque CRV sans appel N+1.
 *
 * Niveau 2 : résolution sous-contexte typeAvion (narrow/wide) pour ramp.turnaround
 */

// Cache partagé entre toutes les instances du composable
let slaDefaults = null
let slaCompagnies = null // Map<codeIATA, config>
let loadPromise = null

const SLA_DEFAULTS_FALLBACK = {
  CRV: {
    BROUILLON_TO_EN_COURS: 24,
    EN_COURS_TO_TERMINE: 48,
    TERMINE_TO_VALIDE: 72,
    GLOBAL: 168
  }
}

// Turnaround standard par défaut (en minutes) — pas encore en base
const TURNAROUND_DEFAULT = 60

const SEUILS = {
  WARNING: 0.75,
  CRITICAL: 0.90,
  EXCEEDED: 1.0
}

// ── Mapping avion → catégorie (miroir léger du backend) ──
// Préfixes suffisants pour résolution front sans appel API supplémentaire
const AIRCRAFT_PREFIXES = [
  // Narrow
  { prefix: 'A31', cat: 'narrow' }, { prefix: 'A32', cat: 'narrow' }, { prefix: 'A22', cat: 'narrow' },
  { prefix: 'B73', cat: 'narrow' }, { prefix: 'B75', cat: 'narrow' },
  { prefix: 'E1', cat: 'narrow' }, { prefix: 'E9', cat: 'narrow' },
  { prefix: 'ATR', cat: 'narrow' }, { prefix: 'CRJ', cat: 'narrow' }, { prefix: 'ERJ', cat: 'narrow' },
  { prefix: 'DHC', cat: 'narrow' }, { prefix: 'Q40', cat: 'narrow' },
  { prefix: 'RPJ', cat: 'narrow' }, { prefix: 'QSF', cat: 'narrow' },
  // Wide
  { prefix: 'A33', cat: 'wide' }, { prefix: 'A34', cat: 'wide' }, { prefix: 'A35', cat: 'wide' }, { prefix: 'A38', cat: 'wide' },
  { prefix: 'B74', cat: 'wide' }, { prefix: 'B76', cat: 'wide' }, { prefix: 'B77', cat: 'wide' }, { prefix: 'B78', cat: 'wide' },
]

/**
 * Résout un type avion vers narrow/wide/null (côté front, sans appel API)
 */
function resolveAircraftCategory(typeAvion) {
  if (!typeAvion) return null
  let cleaned = typeAvion.toUpperCase().trim()
  if (cleaned.includes('/')) cleaned = cleaned.split('/')[0].trim()

  // Tri par longueur décroissante pour précision
  const sorted = [...AIRCRAFT_PREFIXES].sort((a, b) => b.prefix.length - a.prefix.length)
  for (const { prefix, cat } of sorted) {
    if (cleaned.startsWith(prefix)) return cat
  }
  return null
}

/**
 * Charge les configurations SLA (1 seul appel, mis en cache)
 */
async function loadSLAConfigs() {
  if (slaDefaults && slaCompagnies) return
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    try {
      const [configRes, compRes] = await Promise.all([
        slaAPI.getConfiguration(),
        slaAPI.getCompagnies()
      ])

      slaDefaults = configRes.data?.data?.defaults || SLA_DEFAULTS_FALLBACK
      const compagnies = compRes.data?.data || []
      slaCompagnies = new Map()
      for (const c of compagnies) {
        if (c.actif && c.codeIATA) {
          slaCompagnies.set(c.codeIATA.toUpperCase(), c)
        }
      }
    } catch (err) {
      console.warn('[SLA] Erreur chargement config, fallback local:', err.message)
      slaDefaults = SLA_DEFAULTS_FALLBACK
      slaCompagnies = new Map()
    }
  })()

  return loadPromise
}

/**
 * Résout le SLA applicable pour un CRV donné (transitions CRV)
 */
function resoudreSLA(codeIATA) {
  const defaults = slaDefaults?.CRV || SLA_DEFAULTS_FALLBACK.CRV
  if (!codeIATA || !slaCompagnies?.has(codeIATA.toUpperCase())) {
    return { sla: defaults, source: 'standard' }
  }

  const config = slaCompagnies.get(codeIATA.toUpperCase())
  return {
    sla: {
      BROUILLON_TO_EN_COURS: config.crv?.brouillonToEnCours ?? defaults.BROUILLON_TO_EN_COURS,
      EN_COURS_TO_TERMINE: config.crv?.enCoursToTermine ?? defaults.EN_COURS_TO_TERMINE,
      TERMINE_TO_VALIDE: config.crv?.termineToValide ?? defaults.TERMINE_TO_VALIDE,
      GLOBAL: config.crv?.global ?? defaults.GLOBAL
    },
    source: `contrat ${config.compagnieNom || codeIATA}`
  }
}

/**
 * Résout la durée standard d'une phase par compagnie.
 * Si la compagnie a un phaseDurees[codePhase], on utilise cette valeur.
 * Sinon fallback sur Phase.dureeStandardMinutes.
 * @param {string} codePhase - ex: 'ARR_DEBARQUEMENT'
 * @param {string} codeIATA - ex: 'AF'
 * @param {number} defaultDuree - Phase.dureeStandardMinutes (fallback)
 * @returns {{ duree: number, source: string }}
 */
function resoudreDureePhase(codePhase, codeIATA, defaultDuree) {
  if (codeIATA && slaCompagnies?.has(codeIATA.toUpperCase())) {
    const config = slaCompagnies.get(codeIATA.toUpperCase())
    const phaseDurees = config.phaseDurees
    if (phaseDurees) {
      // Map Mongoose retourné en objet simple par l'API
      const duree = phaseDurees instanceof Map ? phaseDurees.get(codePhase) : phaseDurees[codePhase]
      if (duree != null && duree > 0) {
        return { duree, source: `contrat ${config.compagnieNom || codeIATA}` }
      }
    }
  }
  return { duree: defaultDuree, source: 'standard' }
}

/**
 * Résout le turnaround SLA applicable pour un CRV donné, avec sous-contexte avion.
 *
 * Ordre de résolution :
 * 1. compagnie.ramp.turnaroundNarrow si avion = narrow
 * 2. compagnie.ramp.turnaroundWide si avion = wide
 * 3. compagnie.ramp.turnaround (générique)
 * 4. turnaround standard par défaut
 *
 * @returns {{ turnaround: number, source: string, categorie: string|null }}
 */
function resoudreTurnaround(codeIATA, typeAvion) {
  const categorie = resolveAircraftCategory(typeAvion)

  // Pas de config compagnie → standard
  if (!codeIATA || !slaCompagnies?.has(codeIATA.toUpperCase())) {
    return { turnaround: TURNAROUND_DEFAULT, source: 'standard', categorie }
  }

  const config = slaCompagnies.get(codeIATA.toUpperCase())
  const ramp = config.ramp || {}
  const nomCompagnie = config.compagnieNom || codeIATA

  // 1. Sous-contexte narrow
  if (categorie === 'narrow' && ramp.turnaroundNarrow != null) {
    return { turnaround: ramp.turnaroundNarrow, source: `contrat ${nomCompagnie} (narrow)`, categorie }
  }

  // 2. Sous-contexte wide
  if (categorie === 'wide' && ramp.turnaroundWide != null) {
    return { turnaround: ramp.turnaroundWide, source: `contrat ${nomCompagnie} (wide)`, categorie }
  }

  // 3. Turnaround générique compagnie
  if (ramp.turnaround != null) {
    return { turnaround: ramp.turnaround, source: `contrat ${nomCompagnie}`, categorie }
  }

  // 4. Standard
  return { turnaround: TURNAROUND_DEFAULT, source: 'standard', categorie }
}

/**
 * Calcule le statut SLA d'un CRV
 * @param {Object} crv - objet CRV avec statut, dateCreation, updatedAt, vol.codeIATA, vol.typeAvion
 * @returns {Object|null} { niveau, label, heuresRestantes, slaApplicable, source, etape, pourcentage, turnaround }
 */
function calculerSLACRV(crv) {
  if (!crv) return null

  const statutsTerminaux = ['VALIDE', 'VERROUILLE', 'ANNULE']
  if (statutsTerminaux.includes(crv.statut)) return null

  const codeIATA = crv.vol?.codeIATA || null
  const typeAvion = crv.vol?.typeAvion || null
  const { sla, source } = resoudreSLA(codeIATA)

  const maintenant = new Date()
  let slaApplicable, dateReference, etape

  // Résolution date de transition réelle (Extension 10 — datesTransitions)
  // Priorité : datesTransitions > dateCreation > updatedAt (fallback compat anciennes données)
  const dt = crv.datesTransitions || {}

  switch (crv.statut) {
    case 'BROUILLON':
      slaApplicable = sla.BROUILLON_TO_EN_COURS
      dateReference = new Date(crv.dateCreation || crv.createdAt)
      etape = 'Brouillon → En cours'
      break
    case 'EN_COURS':
      slaApplicable = sla.EN_COURS_TO_TERMINE
      dateReference = new Date(dt.enCoursAt || crv.dateCreation || crv.createdAt)
      etape = 'En cours → Terminé'
      break
    case 'TERMINE':
      slaApplicable = sla.TERMINE_TO_VALIDE
      dateReference = new Date(dt.termineAt || dt.enCoursAt || crv.dateCreation || crv.createdAt)
      etape = 'Terminé → Validé'
      break
    default:
      return null
  }

  const heuresEcoulees = (maintenant - dateReference) / (1000 * 60 * 60)
  const pourcentage = Math.min(Math.round((heuresEcoulees / slaApplicable) * 100), 999)
  const heuresRestantes = Math.round(slaApplicable - heuresEcoulees)

  let niveau, label, cssClass
  if (heuresEcoulees >= slaApplicable) {
    niveau = 'EXCEEDED'
    label = `Dépassé ${Math.abs(heuresRestantes)}h`
    cssClass = 'sla-exceeded'
  } else if (heuresEcoulees / slaApplicable >= SEUILS.CRITICAL) {
    niveau = 'CRITICAL'
    label = `${heuresRestantes}h`
    cssClass = 'sla-critical'
  } else if (heuresEcoulees / slaApplicable >= SEUILS.WARNING) {
    niveau = 'WARNING'
    label = `${heuresRestantes}h`
    cssClass = 'sla-warning'
  } else {
    niveau = 'OK'
    label = `${heuresRestantes}h`
    cssClass = 'sla-ok'
  }

  // Résolution turnaround avec sous-contexte avion
  const turnaroundInfo = resoudreTurnaround(codeIATA, typeAvion)

  return {
    niveau,
    label,
    cssClass,
    heuresRestantes,
    slaApplicable,
    source,
    etape,
    pourcentage,
    turnaround: turnaroundInfo
  }
}

// ── SLA Bagages defaults (minutes après calage) ──
const BAGAGES_DEFAULTS = {
  premierBagage: 25,  // 25 min après calage
  dernierBagage: 40   // 40 min après calage
}

/**
 * Résout les SLA bagages pour une compagnie donnée.
 * Utilise SLAConfig.bagages si configuré, sinon BAGAGES_DEFAULTS.
 */
function resoudreSLABagages(codeIATA) {
  const defaults = BAGAGES_DEFAULTS
  if (!codeIATA || !slaCompagnies?.has(codeIATA.toUpperCase())) {
    return { sla: defaults, source: 'standard' }
  }

  const config = slaCompagnies.get(codeIATA.toUpperCase())
  const bagages = config.bagages || {}

  return {
    sla: {
      premierBagage: bagages.premierBagage ?? defaults.premierBagage,
      dernierBagage: bagages.dernierBagage ?? defaults.dernierBagage
    },
    source: `contrat ${config.compagnieNom || codeIATA}`
  }
}

/**
 * Calcule le statut SLA bagages pour un CRV.
 *
 * Source temporelle :
 * - calage = horaire.heureArriveeAuParcReelle (chocks on)
 * - premier bagage = horaire.heureLivraisonBagagesDebut
 * - dernier bagage = horaire.heureLivraisonBagagesFin
 *
 * @param {Object} crv - CRV avec .vol.codeIATA et .horaire peuplé
 * @returns {Object|null} { premierBagage, dernierBagage } avec chacun { statut, minutes, slaMinutes, source }
 */
function calculerSLABagages(crv) {
  if (!crv?.horaire) return null

  const calage = crv.horaire.heureArriveeAuParcReelle
  if (!calage) return null // pas encore calé → pas de calcul possible

  const calageDate = new Date(calage)
  const codeIATA = crv.vol?.codeIATA || null
  const { sla, source } = resoudreSLABagages(codeIATA)

  const result = {}

  // Premier bagage
  const premierBagageAt = crv.horaire.heureLivraisonBagagesDebut
  if (premierBagageAt) {
    const minutesEcoulees = Math.round((new Date(premierBagageAt) - calageDate) / (1000 * 60))
    const slaMin = sla.premierBagage
    const ratio = minutesEcoulees / slaMin

    result.premierBagage = {
      saisi: true,
      minutes: minutesEcoulees,
      slaMinutes: slaMin,
      source,
      ratio,
      ...qualifierNiveau(ratio, minutesEcoulees, slaMin)
    }
  } else {
    // Non saisi : calcul temps écoulé depuis calage pour montrer l'attente
    const maintenant = new Date()
    const minutesDepuisCalage = Math.round((maintenant - calageDate) / (1000 * 60))
    const slaMin = sla.premierBagage
    const ratio = minutesDepuisCalage / slaMin

    // Seulement pertinent si le CRV est encore en cours
    if (['EN_COURS', 'BROUILLON'].includes(crv.statut)) {
      result.premierBagage = {
        saisi: false,
        minutes: minutesDepuisCalage,
        slaMinutes: slaMin,
        source,
        ratio,
        niveau: 'ATTENTE',
        label: 'en attente de saisie',
        cssClass: 'sla-attente',
        enAttente: true
      }
    }
  }

  // Dernier bagage
  const dernierBagageAt = crv.horaire.heureLivraisonBagagesFin
  if (dernierBagageAt) {
    const minutesEcoulees = Math.round((new Date(dernierBagageAt) - calageDate) / (1000 * 60))
    const slaMin = sla.dernierBagage
    const ratio = minutesEcoulees / slaMin

    result.dernierBagage = {
      saisi: true,
      minutes: minutesEcoulees,
      slaMinutes: slaMin,
      source,
      ratio,
      ...qualifierNiveau(ratio, minutesEcoulees, slaMin)
    }
  } else if (premierBagageAt && ['EN_COURS', 'BROUILLON'].includes(crv.statut)) {
    // Premier saisi, dernier non encore → attente
    const maintenant = new Date()
    const minutesDepuisCalage = Math.round((maintenant - calageDate) / (1000 * 60))
    const slaMin = sla.dernierBagage
    const ratio = minutesDepuisCalage / slaMin

    result.dernierBagage = {
      saisi: false,
      minutes: minutesDepuisCalage,
      slaMinutes: slaMin,
      source,
      ratio,
      niveau: 'ATTENTE',
      label: 'en attente de saisie',
      cssClass: 'sla-attente',
      enAttente: true
    }
  }

  return Object.keys(result).length > 0 ? result : null
}

/**
 * Qualifie un ratio en niveau/label/cssClass
 */
function qualifierNiveau(ratio, minutes, slaMin) {
  if (ratio >= SEUILS.EXCEEDED) {
    return { niveau: 'EXCEEDED', label: `${minutes}/${slaMin} min — Dépassé`, cssClass: 'sla-exceeded' }
  } else if (ratio >= SEUILS.CRITICAL) {
    return { niveau: 'CRITICAL', label: `${minutes}/${slaMin} min`, cssClass: 'sla-critical' }
  } else if (ratio >= SEUILS.WARNING) {
    return { niveau: 'WARNING', label: `${minutes}/${slaMin} min`, cssClass: 'sla-warning' }
  }
  return { niveau: 'OK', label: `${minutes}/${slaMin} min`, cssClass: 'sla-ok' }
}

// ── SLA Boarding defaults (minutes AVANT ETD/STD) ──
const BOARDING_DEFAULTS = {
  debut: 40,          // boarding commence 40 min avant ETD
  fermetureGate: 15   // gate fermée 15 min avant ETD
}

/**
 * Résout les SLA boarding pour une compagnie donnée.
 * Utilise SLAConfig.boarding si configuré, sinon BOARDING_DEFAULTS.
 */
function resoudreSLABoarding(codeIATA) {
  const defaults = BOARDING_DEFAULTS
  if (!codeIATA || !slaCompagnies?.has(codeIATA.toUpperCase())) {
    return { sla: defaults, source: 'standard' }
  }

  const config = slaCompagnies.get(codeIATA.toUpperCase())
  const boarding = config.boarding || {}

  return {
    sla: {
      debut: boarding.debut ?? defaults.debut,
      fermetureGate: boarding.fermetureGate ?? defaults.fermetureGate
    },
    source: `contrat ${config.compagnieNom || codeIATA}`
  }
}

/**
 * Calcule le statut SLA boarding pour un CRV.
 *
 * Logique INVERSÉE par rapport aux bagages :
 * - Boarding = X minutes AVANT ETD (pas après calage)
 * - Le SLA dit "boarding doit commencer 40 min avant ETD"
 * - On compare l'horodatage réel à l'heure attendue
 *
 * Source temporelle :
 * - ETD/STD = horaire.heureDecollagePrevue
 * - debutBoardingAt = horaire.debutBoardingAt
 * - fermetureGateAt = horaire.fermetureGateAt
 *
 * @param {Object} crv - CRV avec .vol.codeIATA et .horaire peuplé
 * @returns {Object|null} { debut, fermetureGate } avec statut SLA
 */
function calculerSLABoarding(crv) {
  if (!crv?.horaire) return null
  // Pas de boarding sur une arrivée
  if (crv.vol?.typeOperation === 'ARRIVEE') return null

  // ETD = heureDecollagePrevue (si retard, cette valeur est mise à jour)
  const etd = crv.horaire.heureDecollagePrevue
  if (!etd) return null

  const etdDate = new Date(etd)
  const codeIATA = crv.vol?.codeIATA || null
  const { sla, source } = resoudreSLABoarding(codeIATA)

  const result = {}
  const maintenant = new Date()

  // ── Début boarding ──
  // SLA : boarding doit commencer X min avant ETD
  // Heure attendue = ETD - sla.debut minutes
  const heureAttendueBoardingDebut = new Date(etdDate.getTime() - sla.debut * 60000)

  if (crv.horaire.debutBoardingAt) {
    const boardingReel = new Date(crv.horaire.debutBoardingAt)
    // Positif = en retard (boarding a commencé après l'heure attendue)
    // Négatif = en avance
    const ecartMinutes = Math.round((boardingReel - heureAttendueBoardingDebut) / 60000)

    result.debut = {
      saisi: true,
      ecartMinutes,
      slaMinutes: sla.debut,
      source,
      heureAttendue: heureAttendueBoardingDebut,
      ...qualifierBoarding(ecartMinutes, sla.debut)
    }
  } else if (['EN_COURS', 'BROUILLON'].includes(crv.statut)) {
    // Non saisi — montrer l'état d'attente, PAS un faux retard
    const ecartMinutes = Math.round((maintenant - heureAttendueBoardingDebut) / 60000)
    if (ecartMinutes > -sla.debut) {
      result.debut = {
        saisi: false,
        ecartMinutes,
        slaMinutes: sla.debut,
        source,
        heureAttendue: heureAttendueBoardingDebut,
        // En attente de saisie : pas de faux "retard"
        niveau: 'ATTENTE',
        label: 'en attente de saisie',
        cssClass: 'sla-attente',
        enAttente: true
      }
    }
  }

  // ── Fermeture gate ──
  const heureAttendueFermeture = new Date(etdDate.getTime() - sla.fermetureGate * 60000)

  if (crv.horaire.fermetureGateAt) {
    const fermetureReelle = new Date(crv.horaire.fermetureGateAt)
    const ecartMinutes = Math.round((fermetureReelle - heureAttendueFermeture) / 60000)

    result.fermetureGate = {
      saisi: true,
      ecartMinutes,
      slaMinutes: sla.fermetureGate,
      source,
      heureAttendue: heureAttendueFermeture,
      ...qualifierBoarding(ecartMinutes, sla.fermetureGate)
    }
  } else if (crv.horaire.debutBoardingAt && ['EN_COURS', 'BROUILLON'].includes(crv.statut)) {
    const ecartMinutes = Math.round((maintenant - heureAttendueFermeture) / 60000)
    if (ecartMinutes > -sla.fermetureGate) {
      result.fermetureGate = {
        saisi: false,
        ecartMinutes,
        slaMinutes: sla.fermetureGate,
        source,
        heureAttendue: heureAttendueFermeture,
        niveau: 'ATTENTE',
        label: 'en attente de saisie',
        cssClass: 'sla-attente',
        enAttente: true
      }
    }
  }

  return Object.keys(result).length > 0 ? result : null
}

/**
 * Qualifie un écart boarding en niveau/label/cssClass.
 * Logique inversée : boarding est "avant ETD".
 * - ecartMinutes <= 0 = à l'heure ou en avance → OK
 * - ecartMinutes > 0 = en retard sur l'heure attendue
 */
function qualifierBoarding(ecartMinutes, slaMinutes) {
  if (ecartMinutes <= 0) {
    return { niveau: 'OK', label: `à l'heure`, cssClass: 'sla-ok' }
  }

  // En retard : ratio = retard / tolérance (tolérance = 25% du SLA)
  const tolerance = slaMinutes * 0.25
  const ratio = ecartMinutes / tolerance

  if (ratio >= 2) {
    return { niveau: 'EXCEEDED', label: `+${ecartMinutes} min retard`, cssClass: 'sla-exceeded' }
  } else if (ratio >= 1.5) {
    return { niveau: 'CRITICAL', label: `+${ecartMinutes} min`, cssClass: 'sla-critical' }
  } else if (ratio >= 1) {
    return { niveau: 'WARNING', label: `+${ecartMinutes} min`, cssClass: 'sla-warning' }
  }
  return { niveau: 'OK', label: `+${ecartMinutes} min`, cssClass: 'sla-ok' }
}

// ── SLA Check-in defaults (minutes AVANT STD) ──
const CHECKIN_DEFAULTS = {
  ouverture: 120,     // comptoir ouvert 120 min (2h) avant STD
  fermeture: 45       // comptoir fermé 45 min avant STD
}

/**
 * Résout les SLA check-in pour une compagnie donnée.
 */
function resoudreSLACheckin(codeIATA) {
  const defaults = CHECKIN_DEFAULTS
  if (!codeIATA || !slaCompagnies?.has(codeIATA.toUpperCase())) {
    return { sla: defaults, source: 'standard' }
  }

  const config = slaCompagnies.get(codeIATA.toUpperCase())
  const checkin = config.checkin || {}

  return {
    sla: {
      ouverture: checkin.ouverture ?? defaults.ouverture,
      fermeture: checkin.fermeture ?? defaults.fermeture
    },
    source: `contrat ${config.compagnieNom || codeIATA}`
  }
}

/**
 * Calcule le statut SLA check-in pour un CRV.
 *
 * Même logique que boarding (AVANT STD) :
 * - Le SLA dit "comptoir doit ouvrir 120 min avant STD"
 * - Le SLA dit "comptoir doit fermer 45 min avant STD"
 * - On compare l'horodatage réel à l'heure attendue
 *
 * Source temporelle : STD = horaire.heureDecollagePrevue (décision Q2)
 *
 * @param {Object} crv - CRV avec .vol.codeIATA et .horaire peuplé
 * @returns {Object|null} { ouverture, fermeture }
 */
function calculerSLACheckin(crv) {
  if (!crv?.horaire) return null
  // Pas de check-in sur une arrivée
  if (crv.vol?.typeOperation === 'ARRIVEE') return null

  const std = crv.horaire.heureDecollagePrevue
  if (!std) return null

  const stdDate = new Date(std)
  const codeIATA = crv.vol?.codeIATA || null
  const { sla, source } = resoudreSLACheckin(codeIATA)

  const result = {}
  const maintenant = new Date()

  // ── Ouverture comptoir ──
  // SLA : comptoir doit ouvrir X min avant STD
  const heureAttendueOuverture = new Date(stdDate.getTime() - sla.ouverture * 60000)

  if (crv.horaire.ouvertureComptoirAt) {
    const ouvertureReelle = new Date(crv.horaire.ouvertureComptoirAt)
    const ecartMinutes = Math.round((ouvertureReelle - heureAttendueOuverture) / 60000)

    result.ouverture = {
      saisi: true,
      ecartMinutes,
      slaMinutes: sla.ouverture,
      source,
      heureAttendue: heureAttendueOuverture,
      ...qualifierBoarding(ecartMinutes, sla.ouverture)
    }
  } else if (['EN_COURS', 'BROUILLON'].includes(crv.statut)) {
    const ecartMinutes = Math.round((maintenant - heureAttendueOuverture) / 60000)
    if (ecartMinutes > -sla.ouverture) {
      result.ouverture = {
        saisi: false,
        ecartMinutes,
        slaMinutes: sla.ouverture,
        source,
        heureAttendue: heureAttendueOuverture,
        niveau: 'ATTENTE',
        label: 'en attente de saisie',
        cssClass: 'sla-attente',
        enAttente: true
      }
    }
  }

  // ── Fermeture comptoir ──
  const heureAttendueFermeture = new Date(stdDate.getTime() - sla.fermeture * 60000)

  if (crv.horaire.fermetureComptoirAt) {
    const fermetureReelle = new Date(crv.horaire.fermetureComptoirAt)
    const ecartMinutes = Math.round((fermetureReelle - heureAttendueFermeture) / 60000)

    result.fermeture = {
      saisi: true,
      ecartMinutes,
      slaMinutes: sla.fermeture,
      source,
      heureAttendue: heureAttendueFermeture,
      ...qualifierBoarding(ecartMinutes, sla.fermeture)
    }
  } else if (crv.horaire.ouvertureComptoirAt && ['EN_COURS', 'BROUILLON'].includes(crv.statut)) {
    const ecartMinutes = Math.round((maintenant - heureAttendueFermeture) / 60000)
    if (ecartMinutes > -sla.fermeture) {
      result.fermeture = {
        saisi: false,
        ecartMinutes,
        slaMinutes: sla.fermeture,
        source,
        heureAttendue: heureAttendueFermeture,
        niveau: 'ATTENTE',
        label: 'en attente de saisie',
        cssClass: 'sla-attente',
        enAttente: true
      }
    }
  }

  return Object.keys(result).length > 0 ? result : null
}

export function useSLA() {
  const loaded = ref(false)

  async function init() {
    await loadSLAConfigs()
    loaded.value = true
  }

  return {
    loaded,
    init,
    calculerSLACRV,
    calculerSLABagages,
    calculerSLABoarding,
    calculerSLACheckin,
    resolveAircraftCategory,
    resoudreDureePhase
  }
}
