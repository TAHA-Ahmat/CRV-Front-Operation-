/**
 * =====================================================
 * DONNÉES DE TEST - APPLICATION CRV
 * =====================================================
 *
 * Ce fichier contient toutes les données de test pour
 * initialiser l'application en mode développement.
 *
 * Usage:
 * - Import: import { seedData } from '@/data/seed'
 * - Utilisateurs: seedData.utilisateurs
 * - Vols: seedData.vols
 * - CRV: seedData.crv
 */

import { utilisateurs } from './utilisateurs'
import { vols } from './vols'
import { crv } from './crv'
import { compagnies } from './compagnies'
import { aeroports } from './aeroports'
import { avions } from './avions'

export const seedData = {
  utilisateurs,
  vols,
  crv,
  compagnies,
  aeroports,
  avions
}

export {
  utilisateurs,
  vols,
  crv,
  compagnies,
  aeroports,
  avions
}

// Helper pour réinitialiser les données
export function resetToSeedData() {
  return { ...seedData }
}

// Helper pour obtenir un utilisateur par email
export function getUserByEmail(email) {
  return utilisateurs.find(u => u.email === email)
}

// Helper pour obtenir un vol par numéro
export function getVolByNumero(numero) {
  return vols.find(v => v.numeroVol === numero)
}

// Helper pour obtenir les CRV d'un utilisateur
export function getCRVByUser(userId) {
  return crv.filter(c => c.agentId === userId)
}
