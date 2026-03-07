/**
 * Tests pour le système de permissions
 * @file tests/unit/utils/permissions.test.js
 */

import { describe, it, expect } from 'vitest'
import {
  ACTIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRole,
  getRolesForAction,
  canOperateCRV,
  canViewCRV,
  canDeleteCRV,
  canManageUsers,
  canValidateProgramme,
  canDeleteProgramme,
  isReadOnlyRole,
  isAdminRole,
  PERMISSION_MESSAGES,
  getPermissionDeniedMessage
} from '@/utils/permissions'
import { ROLES } from '@/config/roles'

describe('Système de Permissions', () => {

  describe('Constantes ACTIONS', () => {
    it('devrait contenir toutes les actions CRV', () => {
      expect(ACTIONS.CRV_CREER).toBe('CRV_CREER')
      expect(ACTIONS.CRV_MODIFIER).toBe('CRV_MODIFIER')
      expect(ACTIONS.CRV_LIRE).toBe('CRV_LIRE')
      expect(ACTIONS.CRV_SUPPRIMER).toBe('CRV_SUPPRIMER')
      expect(ACTIONS.CRV_ARCHIVER).toBe('CRV_ARCHIVER')
    })

    it('devrait contenir les actions utilisateurs (ADMIN)', () => {
      expect(ACTIONS.USER_CREER).toBe('USER_CREER')
      expect(ACTIONS.USER_LIRE).toBe('USER_LIRE')
      expect(ACTIONS.USER_MODIFIER).toBe('USER_MODIFIER')
      expect(ACTIONS.USER_SUPPRIMER).toBe('USER_SUPPRIMER')
    })

    it('devrait être gelé', () => {
      expect(Object.isFrozen(ACTIONS)).toBe(true)
    })
  })

  describe('hasPermission()', () => {
    describe('Permissions CRV', () => {
      it('AGENT_ESCALE peut créer un CRV', () => {
        expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.CRV_CREER)).toBe(true)
      })

      it('QUALITE ne peut PAS créer de CRV', () => {
        expect(hasPermission(ROLES.QUALITE, ACTIONS.CRV_CREER)).toBe(false)
      })

      it('QUALITE peut lire les CRV', () => {
        expect(hasPermission(ROLES.QUALITE, ACTIONS.CRV_LIRE)).toBe(true)
      })

      it('ADMIN ne peut PAS créer de CRV', () => {
        expect(hasPermission(ROLES.ADMIN, ACTIONS.CRV_CREER)).toBe(false)
      })

      it('Seuls SUPERVISEUR et MANAGER peuvent supprimer un CRV', () => {
        expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.CRV_SUPPRIMER)).toBe(false)
        expect(hasPermission(ROLES.CHEF_EQUIPE, ACTIONS.CRV_SUPPRIMER)).toBe(false)
        expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.CRV_SUPPRIMER)).toBe(true)
        expect(hasPermission(ROLES.MANAGER, ACTIONS.CRV_SUPPRIMER)).toBe(true)
      })
    })

    describe('Permissions Programmes Vol', () => {
      it('Seuls SUPERVISEUR et MANAGER peuvent valider un programme', () => {
        expect(hasPermission(ROLES.AGENT_ESCALE, ACTIONS.PROGRAMME_VALIDER)).toBe(false)
        expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.PROGRAMME_VALIDER)).toBe(true)
        expect(hasPermission(ROLES.MANAGER, ACTIONS.PROGRAMME_VALIDER)).toBe(true)
      })

      it('Seul MANAGER peut supprimer un programme', () => {
        expect(hasPermission(ROLES.SUPERVISEUR, ACTIONS.PROGRAMME_SUPPRIMER)).toBe(false)
        expect(hasPermission(ROLES.MANAGER, ACTIONS.PROGRAMME_SUPPRIMER)).toBe(true)
      })
    })

    describe('Permissions Utilisateurs', () => {
      it('Seul ADMIN peut gérer les utilisateurs', () => {
        expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_CREER)).toBe(true)
        expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_MODIFIER)).toBe(true)
        expect(hasPermission(ROLES.ADMIN, ACTIONS.USER_SUPPRIMER)).toBe(true)
        expect(hasPermission(ROLES.MANAGER, ACTIONS.USER_CREER)).toBe(false)
      })
    })

    describe('Cas limites', () => {
      it('devrait retourner false pour rôle null', () => {
        expect(hasPermission(null, ACTIONS.CRV_CREER)).toBe(false)
      })

      it('devrait retourner false pour action null', () => {
        expect(hasPermission(ROLES.MANAGER, null)).toBe(false)
      })

      it('devrait retourner false pour action inexistante', () => {
        expect(hasPermission(ROLES.MANAGER, 'ACTION_INEXISTANTE')).toBe(false)
      })
    })
  })

  describe('hasAnyPermission()', () => {
    it('devrait retourner true si le rôle a au moins une permission', () => {
      expect(hasAnyPermission(ROLES.QUALITE, [ACTIONS.CRV_CREER, ACTIONS.CRV_LIRE])).toBe(true)
    })

    it('devrait retourner false si le rôle n\'a aucune des permissions', () => {
      expect(hasAnyPermission(ROLES.QUALITE, [ACTIONS.CRV_CREER, ACTIONS.CRV_MODIFIER])).toBe(false)
    })

    it('devrait retourner false pour entrées invalides', () => {
      expect(hasAnyPermission(null, [ACTIONS.CRV_LIRE])).toBe(false)
      expect(hasAnyPermission(ROLES.MANAGER, null)).toBe(false)
      expect(hasAnyPermission(ROLES.MANAGER, 'not-array')).toBe(false)
    })
  })

  describe('hasAllPermissions()', () => {
    it('devrait retourner true si le rôle a toutes les permissions', () => {
      expect(hasAllPermissions(ROLES.MANAGER, [ACTIONS.CRV_CREER, ACTIONS.CRV_MODIFIER, ACTIONS.CRV_LIRE])).toBe(true)
    })

    it('devrait retourner false si le rôle n\'a pas toutes les permissions', () => {
      expect(hasAllPermissions(ROLES.QUALITE, [ACTIONS.CRV_CREER, ACTIONS.CRV_LIRE])).toBe(false)
    })

    it('devrait retourner false pour entrées invalides', () => {
      expect(hasAllPermissions(null, [ACTIONS.CRV_LIRE])).toBe(false)
      expect(hasAllPermissions(ROLES.MANAGER, null)).toBe(false)
    })
  })

  describe('getPermissionsForRole()', () => {
    it('devrait retourner les permissions de ADMIN', () => {
      const permissions = getPermissionsForRole(ROLES.ADMIN)
      expect(permissions).toContain(ACTIONS.USER_CREER)
      expect(permissions).toContain(ACTIONS.USER_MODIFIER)
      expect(permissions).toContain(ACTIONS.PROFIL_LIRE)
      expect(permissions).not.toContain(ACTIONS.CRV_CREER)
    })

    it('devrait retourner les permissions de QUALITE (lecture seule)', () => {
      const permissions = getPermissionsForRole(ROLES.QUALITE)
      expect(permissions).toContain(ACTIONS.CRV_LIRE)
      expect(permissions).toContain(ACTIONS.VOL_LIRE)
      expect(permissions).not.toContain(ACTIONS.CRV_CREER)
      expect(permissions).not.toContain(ACTIONS.CRV_MODIFIER)
    })

    it('devrait retourner un tableau vide pour rôle null', () => {
      expect(getPermissionsForRole(null)).toEqual([])
    })
  })

  describe('getRolesForAction()', () => {
    it('devrait retourner les rôles autorisés pour CRV_CREER', () => {
      const roles = getRolesForAction(ACTIONS.CRV_CREER)
      expect(roles).toContain(ROLES.AGENT_ESCALE)
      expect(roles).toContain(ROLES.MANAGER)
      expect(roles).not.toContain(ROLES.QUALITE)
      expect(roles).not.toContain(ROLES.ADMIN)
    })

    it('devrait retourner uniquement ADMIN pour USER_CREER', () => {
      const roles = getRolesForAction(ACTIONS.USER_CREER)
      expect(roles).toEqual([ROLES.ADMIN])
    })

    it('devrait retourner tableau vide pour action inexistante', () => {
      expect(getRolesForAction('INEXISTANT')).toEqual([])
    })
  })

  describe('Fonctions métier spécifiques', () => {
    describe('canOperateCRV()', () => {
      it('devrait retourner true pour les rôles opérationnels', () => {
        expect(canOperateCRV(ROLES.AGENT_ESCALE)).toBe(true)
        expect(canOperateCRV(ROLES.MANAGER)).toBe(true)
      })

      it('devrait retourner false pour QUALITE et ADMIN', () => {
        expect(canOperateCRV(ROLES.QUALITE)).toBe(false)
        expect(canOperateCRV(ROLES.ADMIN)).toBe(false)
      })
    })

    describe('canViewCRV()', () => {
      it('devrait retourner true pour tous sauf ADMIN', () => {
        expect(canViewCRV(ROLES.AGENT_ESCALE)).toBe(true)
        expect(canViewCRV(ROLES.QUALITE)).toBe(true)
        expect(canViewCRV(ROLES.ADMIN)).toBe(false)
      })
    })

    describe('canDeleteCRV()', () => {
      it('devrait retourner true uniquement pour SUPERVISEUR et MANAGER', () => {
        expect(canDeleteCRV(ROLES.SUPERVISEUR)).toBe(true)
        expect(canDeleteCRV(ROLES.MANAGER)).toBe(true)
        expect(canDeleteCRV(ROLES.AGENT_ESCALE)).toBe(false)
      })
    })

    describe('canManageUsers()', () => {
      it('devrait retourner true uniquement pour ADMIN', () => {
        expect(canManageUsers(ROLES.ADMIN)).toBe(true)
        expect(canManageUsers(ROLES.MANAGER)).toBe(false)
      })
    })

    describe('canValidateProgramme()', () => {
      it('devrait retourner true pour SUPERVISEUR et MANAGER', () => {
        expect(canValidateProgramme(ROLES.SUPERVISEUR)).toBe(true)
        expect(canValidateProgramme(ROLES.MANAGER)).toBe(true)
        expect(canValidateProgramme(ROLES.CHEF_EQUIPE)).toBe(false)
      })
    })

    describe('canDeleteProgramme()', () => {
      it('devrait retourner true uniquement pour MANAGER', () => {
        expect(canDeleteProgramme(ROLES.MANAGER)).toBe(true)
        expect(canDeleteProgramme(ROLES.SUPERVISEUR)).toBe(false)
      })
    })

    describe('isReadOnlyRole()', () => {
      it('devrait retourner true uniquement pour QUALITE', () => {
        expect(isReadOnlyRole(ROLES.QUALITE)).toBe(true)
        expect(isReadOnlyRole(ROLES.MANAGER)).toBe(false)
      })
    })

    describe('isAdminRole()', () => {
      it('devrait retourner true uniquement pour ADMIN', () => {
        expect(isAdminRole(ROLES.ADMIN)).toBe(true)
        expect(isAdminRole(ROLES.MANAGER)).toBe(false)
      })
    })
  })

  describe('Messages d\'erreur', () => {
    it('devrait avoir tous les messages définis', () => {
      expect(PERMISSION_MESSAGES.QUALITE_READ_ONLY).toBeDefined()
      expect(PERMISSION_MESSAGES.ADMIN_NO_CRV).toBeDefined()
      expect(PERMISSION_MESSAGES.INSUFFICIENT_PERMISSIONS).toBeDefined()
      expect(PERMISSION_MESSAGES.VALIDATION_RESERVED).toBeDefined()
      expect(PERMISSION_MESSAGES.SUPPRESSION_RESERVED).toBeDefined()
      expect(PERMISSION_MESSAGES.ADMIN_ONLY).toBeDefined()
    })

    describe('getPermissionDeniedMessage()', () => {
      it('devrait retourner le message QUALITE pour le rôle QUALITE', () => {
        const message = getPermissionDeniedMessage(ROLES.QUALITE, ACTIONS.CRV_CREER)
        expect(message).toBe(PERMISSION_MESSAGES.QUALITE_READ_ONLY)
      })

      it('devrait retourner le message ADMIN_NO_CRV pour ADMIN sur action CRV', () => {
        const message = getPermissionDeniedMessage(ROLES.ADMIN, ACTIONS.CRV_CREER)
        expect(message).toBe(PERMISSION_MESSAGES.ADMIN_NO_CRV)
      })

      it('devrait retourner le message VALIDATION_RESERVED pour validation programme', () => {
        const message = getPermissionDeniedMessage(ROLES.AGENT_ESCALE, ACTIONS.PROGRAMME_VALIDER)
        expect(message).toBe(PERMISSION_MESSAGES.VALIDATION_RESERVED)
      })

      it('devrait retourner le message SUPPRESSION_RESERVED pour suppression programme', () => {
        const message = getPermissionDeniedMessage(ROLES.SUPERVISEUR, ACTIONS.PROGRAMME_SUPPRIMER)
        expect(message).toBe(PERMISSION_MESSAGES.SUPPRESSION_RESERVED)
      })

      it('devrait retourner le message ADMIN_ONLY pour actions utilisateur', () => {
        const message = getPermissionDeniedMessage(ROLES.MANAGER, ACTIONS.USER_CREER)
        expect(message).toBe(PERMISSION_MESSAGES.ADMIN_ONLY)
      })

      it('devrait retourner le message générique pour autres cas', () => {
        const message = getPermissionDeniedMessage(ROLES.AGENT_ESCALE, ACTIONS.PHASE_DEMARRER)
        expect(message).toBe(PERMISSION_MESSAGES.INSUFFICIENT_PERMISSIONS)
      })
    })
  })

  describe('Matrice de permissions complète - Tests de non-régression', () => {
    const testMatrix = [
      // [role, action, expected]
      // CRV
      [ROLES.AGENT_ESCALE, ACTIONS.CRV_CREER, true],
      [ROLES.CHEF_EQUIPE, ACTIONS.CRV_CREER, true],
      [ROLES.SUPERVISEUR, ACTIONS.CRV_CREER, true],
      [ROLES.MANAGER, ACTIONS.CRV_CREER, true],
      [ROLES.QUALITE, ACTIONS.CRV_CREER, false],
      [ROLES.ADMIN, ACTIONS.CRV_CREER, false],

      // Phases
      [ROLES.AGENT_ESCALE, ACTIONS.PHASE_DEMARRER, true],
      [ROLES.QUALITE, ACTIONS.PHASE_DEMARRER, false],

      // Programmes
      [ROLES.MANAGER, ACTIONS.PROGRAMME_SUPPRIMER, true],
      [ROLES.SUPERVISEUR, ACTIONS.PROGRAMME_SUPPRIMER, false],

      // Stats
      [ROLES.QUALITE, ACTIONS.STATS_LIRE, true],
      [ROLES.ADMIN, ACTIONS.STATS_LIRE, false],
    ]

    testMatrix.forEach(([role, action, expected]) => {
      it(`${role} ${expected ? 'PEUT' : 'NE PEUT PAS'} effectuer ${action}`, () => {
        expect(hasPermission(role, action)).toBe(expected)
      })
    })
  })
})
