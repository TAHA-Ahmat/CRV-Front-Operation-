/**
 * Tests pour la configuration des rôles
 * @file tests/unit/config/roles.test.js
 */

import { describe, it, expect } from 'vitest'
import {
  ROLES,
  ROLES_OPERATIONNELS,
  ROLES_ACCES_CRV,
  ROLES_VALIDATION_PROGRAMME,
  ROLES_SUPPRESSION_CRV,
  ROLES_SUPPRESSION_PROGRAMME,
  ROLES_LABELS,
  normalizeRole,
  isRoleOperationnel,
  hasAccessCRV,
  isReadOnly,
  isAdmin,
  canValidateProgramme,
  canDeleteCRV,
  canDeleteProgramme,
  getRoleLabel,
  getRolesForSelect
} from '@/config/roles'

describe('Configuration des Rôles', () => {

  describe('Constantes ROLES', () => {
    it('devrait contenir tous les 6 rôles définis', () => {
      expect(Object.keys(ROLES)).toHaveLength(6)
      expect(ROLES.AGENT_ESCALE).toBe('AGENT_ESCALE')
      expect(ROLES.CHEF_EQUIPE).toBe('CHEF_EQUIPE')
      expect(ROLES.SUPERVISEUR).toBe('SUPERVISEUR')
      expect(ROLES.MANAGER).toBe('MANAGER')
      expect(ROLES.QUALITE).toBe('QUALITE')
      expect(ROLES.ADMIN).toBe('ADMIN')
    })

    it('devrait être gelé (immutable)', () => {
      expect(Object.isFrozen(ROLES)).toBe(true)
    })
  })

  describe('Groupes de rôles', () => {
    it('ROLES_OPERATIONNELS devrait contenir 4 rôles', () => {
      expect(ROLES_OPERATIONNELS).toHaveLength(4)
      expect(ROLES_OPERATIONNELS).toContain(ROLES.AGENT_ESCALE)
      expect(ROLES_OPERATIONNELS).toContain(ROLES.CHEF_EQUIPE)
      expect(ROLES_OPERATIONNELS).toContain(ROLES.SUPERVISEUR)
      expect(ROLES_OPERATIONNELS).toContain(ROLES.MANAGER)
      expect(ROLES_OPERATIONNELS).not.toContain(ROLES.QUALITE)
      expect(ROLES_OPERATIONNELS).not.toContain(ROLES.ADMIN)
    })

    it('ROLES_ACCES_CRV devrait inclure QUALITE mais pas ADMIN', () => {
      expect(ROLES_ACCES_CRV).toContain(ROLES.QUALITE)
      expect(ROLES_ACCES_CRV).not.toContain(ROLES.ADMIN)
      expect(ROLES_ACCES_CRV).toHaveLength(5)
    })

    it('ROLES_VALIDATION_PROGRAMME devrait être SUPERVISEUR et MANAGER uniquement', () => {
      expect(ROLES_VALIDATION_PROGRAMME).toEqual([ROLES.SUPERVISEUR, ROLES.MANAGER])
    })

    it('ROLES_SUPPRESSION_CRV devrait être SUPERVISEUR et MANAGER uniquement', () => {
      expect(ROLES_SUPPRESSION_CRV).toEqual([ROLES.SUPERVISEUR, ROLES.MANAGER])
    })

    it('ROLES_SUPPRESSION_PROGRAMME devrait être MANAGER uniquement', () => {
      expect(ROLES_SUPPRESSION_PROGRAMME).toEqual([ROLES.MANAGER])
    })
  })

  describe('normalizeRole()', () => {
    it('devrait retourner le rôle en majuscules si valide', () => {
      expect(normalizeRole('AGENT_ESCALE')).toBe('AGENT_ESCALE')
      expect(normalizeRole('agent_escale')).toBe('AGENT_ESCALE')
      expect(normalizeRole('Agent_Escale')).toBe('AGENT_ESCALE')
    })

    it('devrait extraire le rôle depuis un objet utilisateur', () => {
      expect(normalizeRole({ fonction: 'MANAGER' })).toBe('MANAGER')
      expect(normalizeRole({ role: 'SUPERVISEUR' })).toBe('SUPERVISEUR')
      expect(normalizeRole({ function: 'ADMIN' })).toBe('ADMIN')
    })

    it('devrait retourner null pour une entrée invalide', () => {
      expect(normalizeRole(null)).toBeNull()
      expect(normalizeRole(undefined)).toBeNull()
      expect(normalizeRole('')).toBeNull()
      expect(normalizeRole('ROLE_INEXISTANT')).toBeNull()
      expect(normalizeRole({})).toBeNull()
    })

    it('devrait gérer les rôles legacy avec mapping', () => {
      expect(normalizeRole('AGENT_OPS')).toBe('AGENT_ESCALE')
      expect(normalizeRole('AGENT')).toBe('AGENT_ESCALE')
    })
  })

  describe('isRoleOperationnel()', () => {
    it('devrait retourner true pour les rôles opérationnels', () => {
      expect(isRoleOperationnel(ROLES.AGENT_ESCALE)).toBe(true)
      expect(isRoleOperationnel(ROLES.CHEF_EQUIPE)).toBe(true)
      expect(isRoleOperationnel(ROLES.SUPERVISEUR)).toBe(true)
      expect(isRoleOperationnel(ROLES.MANAGER)).toBe(true)
    })

    it('devrait retourner false pour les rôles non-opérationnels', () => {
      expect(isRoleOperationnel(ROLES.QUALITE)).toBe(false)
      expect(isRoleOperationnel(ROLES.ADMIN)).toBe(false)
    })
  })

  describe('hasAccessCRV()', () => {
    it('devrait retourner true pour les rôles avec accès CRV', () => {
      expect(hasAccessCRV(ROLES.AGENT_ESCALE)).toBe(true)
      expect(hasAccessCRV(ROLES.CHEF_EQUIPE)).toBe(true)
      expect(hasAccessCRV(ROLES.SUPERVISEUR)).toBe(true)
      expect(hasAccessCRV(ROLES.MANAGER)).toBe(true)
      expect(hasAccessCRV(ROLES.QUALITE)).toBe(true)
    })

    it('devrait retourner false pour ADMIN', () => {
      expect(hasAccessCRV(ROLES.ADMIN)).toBe(false)
    })
  })

  describe('isReadOnly()', () => {
    it('devrait retourner true uniquement pour QUALITE', () => {
      expect(isReadOnly(ROLES.QUALITE)).toBe(true)
      expect(isReadOnly(ROLES.AGENT_ESCALE)).toBe(false)
      expect(isReadOnly(ROLES.MANAGER)).toBe(false)
      expect(isReadOnly(ROLES.ADMIN)).toBe(false)
    })
  })

  describe('isAdmin()', () => {
    it('devrait retourner true uniquement pour ADMIN', () => {
      expect(isAdmin(ROLES.ADMIN)).toBe(true)
      expect(isAdmin(ROLES.MANAGER)).toBe(false)
      expect(isAdmin(ROLES.QUALITE)).toBe(false)
    })
  })

  describe('canValidateProgramme()', () => {
    it('devrait retourner true pour SUPERVISEUR et MANAGER', () => {
      expect(canValidateProgramme(ROLES.SUPERVISEUR)).toBe(true)
      expect(canValidateProgramme(ROLES.MANAGER)).toBe(true)
    })

    it('devrait retourner false pour les autres rôles', () => {
      expect(canValidateProgramme(ROLES.AGENT_ESCALE)).toBe(false)
      expect(canValidateProgramme(ROLES.CHEF_EQUIPE)).toBe(false)
      expect(canValidateProgramme(ROLES.QUALITE)).toBe(false)
      expect(canValidateProgramme(ROLES.ADMIN)).toBe(false)
    })
  })

  describe('canDeleteCRV()', () => {
    it('devrait retourner true pour SUPERVISEUR et MANAGER', () => {
      expect(canDeleteCRV(ROLES.SUPERVISEUR)).toBe(true)
      expect(canDeleteCRV(ROLES.MANAGER)).toBe(true)
    })

    it('devrait retourner false pour les autres rôles', () => {
      expect(canDeleteCRV(ROLES.AGENT_ESCALE)).toBe(false)
      expect(canDeleteCRV(ROLES.CHEF_EQUIPE)).toBe(false)
      expect(canDeleteCRV(ROLES.QUALITE)).toBe(false)
      expect(canDeleteCRV(ROLES.ADMIN)).toBe(false)
    })
  })

  describe('canDeleteProgramme()', () => {
    it('devrait retourner true uniquement pour MANAGER', () => {
      expect(canDeleteProgramme(ROLES.MANAGER)).toBe(true)
    })

    it('devrait retourner false pour tous les autres rôles', () => {
      expect(canDeleteProgramme(ROLES.SUPERVISEUR)).toBe(false)
      expect(canDeleteProgramme(ROLES.AGENT_ESCALE)).toBe(false)
      expect(canDeleteProgramme(ROLES.ADMIN)).toBe(false)
    })
  })

  describe('getRoleLabel()', () => {
    it('devrait retourner le label correct pour chaque rôle', () => {
      expect(getRoleLabel(ROLES.AGENT_ESCALE)).toBe("Agent d'escale")
      expect(getRoleLabel(ROLES.CHEF_EQUIPE)).toBe("Chef d'équipe")
      expect(getRoleLabel(ROLES.SUPERVISEUR)).toBe('Superviseur')
      expect(getRoleLabel(ROLES.MANAGER)).toBe('Manager')
      expect(getRoleLabel(ROLES.QUALITE)).toBe('Qualité')
      expect(getRoleLabel(ROLES.ADMIN)).toBe('Administrateur')
    })

    it('devrait retourner "Rôle inconnu" pour un rôle invalide', () => {
      expect(getRoleLabel('INEXISTANT')).toBe('Rôle inconnu')
      expect(getRoleLabel(null)).toBe('Rôle inconnu')
    })
  })

  describe('getRolesForSelect()', () => {
    it('devrait retourner un tableau avec tous les rôles', () => {
      const roles = getRolesForSelect()
      expect(roles).toHaveLength(6)
    })

    it('devrait retourner des objets avec value et label', () => {
      const roles = getRolesForSelect()
      roles.forEach(role => {
        expect(role).toHaveProperty('value')
        expect(role).toHaveProperty('label')
        expect(typeof role.value).toBe('string')
        expect(typeof role.label).toBe('string')
      })
    })

    it('devrait contenir le rôle MANAGER avec le bon label', () => {
      const roles = getRolesForSelect()
      const manager = roles.find(r => r.value === ROLES.MANAGER)
      expect(manager).toBeDefined()
      expect(manager.label).toBe('Manager')
    })
  })
})
