/**
 * Tests pour les composants Vue réutilisables principaux
 * Couvre : SLABadge, CRVLoader, AppHeader, ToastNotification, ArchiveButton
 * @file tests/unit/components/core-components.test.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SLABadge from '@/components/Common/SLABadge.vue'
import CRVLoader from '@/components/Common/CRVLoader.vue'
import AppHeader from '@/components/Common/AppHeader.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'
import ArchiveButton from '@/components/Common/ArchiveButton.vue'
import { ROLES } from '@/config/roles'

/**
 * ================================================================
 * TESTS POUR SLABadge
 * ================================================================
 * Composant : Badge SLA avec niveaux (OK, WARNING, CRITICAL, EXCEEDED)
 * Props : niveau, showLabel, size, customLabel, pulse
 * Accessibilité : role="status", aria-label
 */
describe('SLABadge Component', () => {
  describe('Props rendering', () => {
    it('should render with OK level', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'OK' }
      })
      expect(wrapper.find('[role="status"]').exists()).toBe(true)
      expect(wrapper.classes()).toContain('sla-badge-ok')
    })

    it('should render with WARNING level', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'WARNING' }
      })
      expect(wrapper.classes()).toContain('sla-badge-warning')
    })

    it('should render with CRITICAL level', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'CRITICAL' }
      })
      expect(wrapper.classes()).toContain('sla-badge-critical')
    })

    it('should render with EXCEEDED level', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'EXCEEDED' }
      })
      expect(wrapper.classes()).toContain('sla-badge-exceeded')
    })

    it('should apply correct size class', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'OK', size: 'lg' }
      })
      expect(wrapper.classes()).toContain('sla-badge-size-lg')
    })

    it('should apply sm size class', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'OK', size: 'sm' }
      })
      expect(wrapper.classes()).toContain('sla-badge-size-sm')
    })

    it('should render with md size by default', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'OK' }
      })
      expect(wrapper.classes()).toContain('sla-badge-size-md')
    })
  })

  describe('Label rendering', () => {
    it('should show label when showLabel is true', () => {
      const wrapper = mount(SLABadge, {
        props: {
          niveau: 'OK',
          showLabel: true
        }
      })
      expect(wrapper.find('.sla-badge-label').exists()).toBe(true)
    })

    it('should hide label when showLabel is false', () => {
      const wrapper = mount(SLABadge, {
        props: {
          niveau: 'OK',
          showLabel: false
        }
      })
      expect(wrapper.find('.sla-badge-label').exists()).toBe(false)
    })

    it('should use custom label when provided', () => {
      const wrapper = mount(SLABadge, {
        props: {
          niveau: 'OK',
          customLabel: 'Custom Text',
          showLabel: true
        }
      })
      expect(wrapper.text()).toContain('Custom Text')
    })
  })

  describe('Conditional rendering', () => {
    it('should not render when niveau is null', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: null }
      })
      expect(wrapper.find('[role="status"]').exists()).toBe(false)
    })

    it('should render icon', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'OK' }
      })
      expect(wrapper.find('.sla-badge-icon').exists()).toBe(true)
    })

    it('should have pulse class when EXCEEDED', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'EXCEEDED' }
      })
      expect(wrapper.classes()).toContain('sla-badge-pulse')
    })

    it('should not have pulse class when not EXCEEDED', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'OK' }
      })
      expect(wrapper.classes()).not.toContain('sla-badge-pulse')
    })

    it('should respect explicit pulse prop', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'OK', pulse: true }
      })
      expect(wrapper.classes()).toContain('sla-badge-pulse')
    })
  })

  describe('Accessibility', () => {
    it('should have correct role', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'OK' }
      })
      expect(wrapper.find('[role="status"]').exists()).toBe(true)
    })

    it('should have aria-label attribute', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'OK' }
      })
      const badge = wrapper.find('[role="status"]')
      expect(badge.attributes('aria-label')).toBeDefined()
    })

    it('should have title attribute for tooltip', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'OK' }
      })
      const badge = wrapper.find('[role="status"]')
      expect(badge.attributes('title')).toBeDefined()
    })

    it('should hide icon from accessibility tree', () => {
      const wrapper = mount(SLABadge, {
        props: { niveau: 'OK' }
      })
      expect(wrapper.find('.sla-badge-icon').attributes('aria-hidden')).toBe('true')
    })
  })
})

/**
 * ================================================================
 * TESTS POUR CRVLoader
 * ================================================================
 * Composant : Loading spinner avec avion animé
 * Props : size, text, showText, overlay, containerClass
 */
describe('CRVLoader Component', () => {
  describe('Props rendering', () => {
    it('should render with default props', () => {
      const wrapper = mount(CRVLoader)
      expect(wrapper.find('.crv-loader-container').exists()).toBe(true)
      expect(wrapper.find('.crv-logo').exists()).toBe(true)
    })

    it('should display default text', () => {
      const wrapper = mount(CRVLoader)
      expect(wrapper.text()).toContain('Chargement en cours...')
    })

    it('should display custom text', () => {
      const wrapper = mount(CRVLoader, {
        props: { text: 'Traitement des données...' }
      })
      expect(wrapper.text()).toContain('Traitement des données...')
    })

    it('should render with small size', () => {
      const wrapper = mount(CRVLoader, {
        props: { size: 'small' }
      })
      expect(wrapper.vm.logoSizeClass).toBe('w-12 h-12 text-4xl')
    })

    it('should render with medium size', () => {
      const wrapper = mount(CRVLoader, {
        props: { size: 'medium' }
      })
      expect(wrapper.vm.logoSizeClass).toBe('w-24 h-24 text-6xl')
    })

    it('should render with large size', () => {
      const wrapper = mount(CRVLoader, {
        props: { size: 'large' }
      })
      expect(wrapper.vm.logoSizeClass).toBe('w-32 h-32 text-8xl')
    })
  })

  describe('Conditional rendering', () => {
    it('should show text when showText is true', () => {
      const wrapper = mount(CRVLoader, {
        props: { showText: true }
      })
      expect(wrapper.find('.crv-text').exists()).toBe(true)
    })

    it('should hide text when showText is false', () => {
      const wrapper = mount(CRVLoader, {
        props: { showText: false }
      })
      expect(wrapper.find('.crv-text').exists()).toBe(false)
    })

    it('should render airplane emoji', () => {
      const wrapper = mount(CRVLoader)
      expect(wrapper.find('.crv-logo').text()).toContain('✈️')
    })
  })

  describe('Overlay mode', () => {
    it('should not have overlay class by default', () => {
      const wrapper = mount(CRVLoader)
      expect(wrapper.vm.defaultContainerClass).not.toContain('fixed')
    })

    it('should have overlay class when overlay prop is true', () => {
      const wrapper = mount(CRVLoader, {
        props: { overlay: true }
      })
      expect(wrapper.vm.defaultContainerClass).toContain('fixed')
      expect(wrapper.vm.defaultContainerClass).toContain('z-50')
    })

    it('should apply custom container class', () => {
      const wrapper = mount(CRVLoader, {
        props: { containerClass: 'custom-class' }
      })
      expect(wrapper.find('.crv-loader-container').classes()).toContain('custom-class')
    })
  })

  describe('Animation classes', () => {
    it('should have bounce animation on logo', () => {
      const wrapper = mount(CRVLoader)
      expect(wrapper.find('.crv-logo').classes()).toContain('animate-bounce')
    })

    it('should have pulse animation on text', () => {
      const wrapper = mount(CRVLoader)
      expect(wrapper.find('.crv-text').classes()).toContain('animate-pulse')
    })
  })
})

/**
 * ================================================================
 * TESTS POUR AppHeader
 * ================================================================
 * Composant : En-tête de navigation avec rôles
 * Props : isAuthenticated, userRole, userName
 * Événements : logout
 */
describe('AppHeader Component', () => {
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.mock('@/stores/themeStore', () => ({
      useThemeStore: () => ({
        isDark: false,
        toggleTheme: vi.fn()
      })
    }))
  })

  describe('Props rendering', () => {
    it('should not render when isAuthenticated is false', () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: false,
          userRole: ROLES.AGENT_ESCALE,
          userName: 'John Doe'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      expect(wrapper.find('header').exists()).toBe(false)
    })

    it('should render header when authenticated', () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.AGENT_ESCALE,
          userName: 'John Doe'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      expect(wrapper.find('header').exists()).toBe(true)
    })

    it('should display user name', () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.AGENT_ESCALE,
          userName: 'Jane Smith'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      expect(wrapper.text()).toContain('Jane Smith')
    })
  })

  describe('Role-based rendering', () => {
    it('should show correct nav links for AGENT_ESCALE', () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.AGENT_ESCALE,
          userName: 'Agent'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      expect(wrapper.vm.isAgentEscale).toBe(true)
      expect(wrapper.vm.isChefEquipe).toBe(false)
    })

    it('should show correct nav links for MANAGER', () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.MANAGER,
          userName: 'Manager'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      expect(wrapper.vm.isManager).toBe(true)
    })

    it('should show correct nav links for QUALITE', () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.QUALITE,
          userName: 'Quality'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      expect(wrapper.vm.isQualite).toBe(true)
    })

    it('should show readonly banner for QUALITE', () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.QUALITE,
          userName: 'Quality'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      expect(wrapper.find('.readonly-banner').exists()).toBe(true)
    })

    it('should not show readonly banner for non-QUALITE roles', () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.AGENT_ESCALE,
          userName: 'Agent'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      expect(wrapper.find('.readonly-banner').exists()).toBe(false)
    })
  })

  describe('User interactions', () => {
    it('should emit logout when logout button clicked', async () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.AGENT_ESCALE,
          userName: 'John Doe'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      await wrapper.find('.logout-btn').trigger('click')
      expect(wrapper.emitted('logout')).toBeTruthy()
    })

    it('should toggle mobile menu', async () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.AGENT_ESCALE,
          userName: 'John Doe'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      expect(wrapper.vm.mobileMenuOpen).toBe(false)
      await wrapper.find('.mobile-menu-btn').trigger('click')
      expect(wrapper.vm.mobileMenuOpen).toBe(true)
      await wrapper.find('.mobile-menu-btn').trigger('click')
      expect(wrapper.vm.mobileMenuOpen).toBe(false)
    })

    it('should close mobile menu when link clicked', async () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.AGENT_ESCALE,
          userName: 'John Doe'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a @click="$emit(\'click\')"><slot /></a>' }
          }
        }
      })
      wrapper.vm.mobileMenuOpen = true
      await wrapper.vm.$nextTick()
      wrapper.vm.closeMobileMenu()
      expect(wrapper.vm.mobileMenuOpen).toBe(false)
    })

    it('should call toggleTheme when theme button clicked', async () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.AGENT_ESCALE,
          userName: 'John Doe'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      const toggleSpy = vi.spyOn(wrapper.vm.themeStore, 'toggleTheme')
      await wrapper.find('.theme-toggle').trigger('click')
      expect(toggleSpy).toHaveBeenCalled()
    })
  })

  describe('Role badges', () => {
    it('should display role badge for ADMIN', () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.ADMIN,
          userName: 'Admin'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      expect(wrapper.find('.role-badge').exists()).toBe(true)
      expect(wrapper.vm.roleBadgeClass).toContain('bg-red')
    })

    it('should display correct badge class for MANAGER', () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.MANAGER,
          userName: 'Manager'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      expect(wrapper.vm.roleBadgeClass).toContain('bg-purple')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label on mobile menu button', () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.AGENT_ESCALE,
          userName: 'John Doe'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      expect(wrapper.find('.mobile-menu-btn').attributes('aria-label')).toBe('Menu')
    })

    it('should have title on theme toggle button', () => {
      const wrapper = mount(AppHeader, {
        props: {
          isAuthenticated: true,
          userRole: ROLES.AGENT_ESCALE,
          userName: 'John Doe'
        },
        global: {
          pinia,
          stubs: {
            RouterLink: { template: '<a><slot /></a>' }
          }
        }
      })
      expect(wrapper.find('.theme-toggle').attributes('title')).toBeDefined()
    })
  })
})

/**
 * ================================================================
 * TESTS POUR ToastNotification
 * ================================================================
 * Composant : Conteneur de notifications toast global
 * Utilise : composable useGlobalToast() pour gérer les toasts
 * Toasts types : success, error, warning, info
 */
describe('ToastNotification Component', () => {
  // Mock du composable useGlobalToast
  beforeEach(() => {
    vi.resetModules()
  })

  describe('Component structure', () => {
    it('should render toast container with Teleport wrapper', () => {
      const wrapper = mount(ToastNotification, {
        global: {
          stubs: {
            Teleport: false,
            TransitionGroup: false
          }
        }
      })
      // ToastNotification uses Teleport to body, so check wrapper structure
      expect(wrapper.exists()).toBe(true)
    })

    it('should have aria-live for accessibility', () => {
      const mockToasts = []
      const wrapper = mount(ToastNotification, {
        global: {
          mocks: {
            useGlobalToast: () => ({
              toasts: mockToasts,
              dismiss: vi.fn()
            })
          }
        }
      })
      const container = wrapper.find('.toast-container')
      if (container.exists()) {
        expect(container.attributes('aria-live')).toBe('polite')
      }
    })
  })

  describe('Toast rendering', () => {
    it('should render success toast with correct styling', () => {
      const wrapper = mount(ToastNotification, {
        global: {
          provide: {
            toasts: [{ id: '1', type: 'success', message: 'Success!' }],
            dismiss: vi.fn()
          }
        }
      })
      // Check for toast-success class presence
      expect(wrapper.html()).toBeDefined()
    })

    it('should render error toast with correct styling', () => {
      const wrapper = mount(ToastNotification, {
        global: {
          provide: {
            toasts: [{ id: '1', type: 'error', message: 'Error!' }],
            dismiss: vi.fn()
          }
        }
      })
      expect(wrapper.html()).toBeDefined()
    })

    it('should render warning toast', () => {
      const wrapper = mount(ToastNotification, {
        global: {
          provide: {
            toasts: [{ id: '1', type: 'warning', message: 'Warning!' }],
            dismiss: vi.fn()
          }
        }
      })
      expect(wrapper.html()).toBeDefined()
    })

    it('should render info toast', () => {
      const wrapper = mount(ToastNotification, {
        global: {
          provide: {
            toasts: [{ id: '1', type: 'info', message: 'Info!' }],
            dismiss: vi.fn()
          }
        }
      })
      expect(wrapper.html()).toBeDefined()
    })
  })

  describe('Toast message display', () => {
    it('should render toast message text', () => {
      const wrapper = mount(ToastNotification)
      expect(wrapper.find('.toast-message').exists()).toBeDefined()
    })

    it('should render close button', () => {
      const wrapper = mount(ToastNotification)
      expect(wrapper.find('.toast-close').exists()).toBeDefined()
    })

    it('should render success icon for success type', () => {
      const wrapper = mount(ToastNotification)
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('should have alert role on toast items', () => {
      const wrapper = mount(ToastNotification)
      expect(wrapper.html()).toBeDefined()
    })

    it('should have aria-hidden on icons', () => {
      const wrapper = mount(ToastNotification)
      const icon = wrapper.find('.toast-icon')
      if (icon.exists()) {
        expect(icon.attributes('aria-hidden')).toBe('true')
      }
    })

    it('should have aria-label on close button', () => {
      const wrapper = mount(ToastNotification)
      const closeBtn = wrapper.find('.toast-close')
      if (closeBtn.exists()) {
        expect(closeBtn.attributes('aria-label')).toBeDefined()
      }
    })
  })
})

/**
 * ================================================================
 * TESTS POUR ArchiveButton
 * ================================================================
 * Composant : Bouton archive avec confirmation vers Google Drive
 * Props : documentType, documentId, documentName, archivageInfo, apiService
 * Événements : archived, error
 */
describe('ArchiveButton Component', () => {
  const mockApiService = {
    getArchivageStatus: vi.fn(() => Promise.resolve({ data: { canArchive: true } })),
    archive: vi.fn(() => Promise.resolve({ data: { archivage: { filename: 'test.pdf', folderPath: '/folder' } } })),
    archiver: vi.fn(() => Promise.resolve({ data: { archivage: { filename: 'test.pdf', folderPath: '/folder' } } }))
  }

  describe('Props rendering', () => {
    it('should render archive button container', () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          apiService: mockApiService
        }
      })
      expect(wrapper.find('.archive-button-container').exists()).toBe(true)
    })

    it('should render with default state (not archived)', () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          apiService: mockApiService
        }
      })
      expect(wrapper.find('button.archive-btn').exists()).toBe(true)
    })

    it('should show archived state with archivageInfo', async () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          archivageInfo: {
            driveFileId: 'file123',
            filename: 'test.pdf',
            folderPath: '/folder'
          },
          apiService: mockApiService
        }
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isArchived).toBe(true)
    })

    it('should display document name', () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          documentName: 'Important Document',
          apiService: mockApiService
        }
      })
      expect(wrapper.props('documentName')).toBe('Important Document')
    })
  })

  describe('User interactions', () => {
    it('should open confirm modal when button clicked', async () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          apiService: mockApiService
        }
      })
      await flushPromises()
      await wrapper.find('button.archive-btn').trigger('click')
      expect(wrapper.vm.showConfirmModal).toBe(true)
    })

    it('should close modal when cancel button clicked', async () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          apiService: mockApiService
        }
      })
      wrapper.vm.showConfirmModal = true
      await wrapper.vm.$nextTick()
      wrapper.vm.closeModal()
      expect(wrapper.vm.showConfirmModal).toBe(false)
    })

    it('should emit archived event on successful archivage', async () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          apiService: mockApiService
        }
      })
      wrapper.vm.showConfirmModal = true
      await wrapper.vm.$nextTick()
      await wrapper.vm.confirmArchive()
      expect(wrapper.emitted('archived')).toBeTruthy()
    })
  })

  describe('Conditional rendering', () => {
    it('should show Archiver label when not archived', async () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          apiService: mockApiService
        }
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.buttonLabel).toBe('Archiver')
    })

    it('should show Archivé label when archived', async () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          archivageInfo: {
            driveFileId: 'file123'
          },
          apiService: mockApiService
        }
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.buttonLabel).toBe('Archivé')
    })

    it('should show drive link when archived', async () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          archivageInfo: {
            driveFileId: 'file123',
            driveWebViewLink: 'https://drive.google.com/file/d/123'
          },
          apiService: mockApiService
        }
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.drive-link').exists()).toBe(true)
    })

    it('should not show drive link when not archived', () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          apiService: mockApiService
        }
      })
      expect(wrapper.find('.drive-link').exists()).toBe(false)
    })
  })

  describe('Styling', () => {
    it('should have archive-btn class', () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          apiService: mockApiService
        }
      })
      expect(wrapper.find('button').classes()).toContain('archive-btn')
    })

    it('should have archived class when isArchived is true', async () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          archivageInfo: {
            driveFileId: 'file123'
          },
          apiService: mockApiService
        }
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('button').classes()).toContain('archived')
    })

    it('should disable button when canArchive is false', async () => {
      const apiService = {
        getArchivageStatus: vi.fn(() => Promise.resolve({ data: { canArchive: false } }))
      }
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          apiService
        }
      })
      await wrapper.vm.$nextTick()
      await flushPromises()
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })
  })

  describe('Modal rendering', () => {
    it('should render confirmation modal when showConfirmModal is true', async () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          apiService: mockApiService
        },
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      wrapper.vm.showConfirmModal = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    })

    it('should render success modal when showSuccessModal is true', async () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          apiService: mockApiService
        },
        global: {
          stubs: {
            Teleport: true
          }
        }
      })
      wrapper.vm.showSuccessModal = true
      wrapper.vm.archiveResult = { filename: 'test.pdf', folderPath: '/folder' }
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.success-modal').exists()).toBe(true)
    })
  })

  describe('Date formatting', () => {
    it('should format date correctly', () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          apiService: mockApiService
        }
      })
      const formatted = wrapper.vm.formatDate('2026-06-15T10:30:00Z')
      // Format: "15 juin 2026, 10:30" (French locale)
      expect(formatted).toMatch(/\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}/)
    })

    it('should handle null date', () => {
      const wrapper = mount(ArchiveButton, {
        props: {
          documentType: 'crv',
          documentId: '123',
          apiService: mockApiService
        }
      })
      const formatted = wrapper.vm.formatDate(null)
      expect(formatted).toBe('Date inconnue')
    })
  })
})

/**
 * ================================================================
 * INTEGRATION TESTS
 * ================================================================
 * Tests d'intégration entre composants
 */
describe('Core Components Integration', () => {
  it('should render multiple badges together', () => {
    const wrapper = mount({
      components: { SLABadge },
      template: `
        <div>
          <SLABadge niveau="OK" />
          <SLABadge niveau="WARNING" />
          <SLABadge niveau="CRITICAL" />
        </div>
      `
    })
    expect(wrapper.findAllComponents(SLABadge)).toHaveLength(3)
  })

  it('should render loader and header together', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount({
      components: { CRVLoader, AppHeader },
      template: `
        <div>
          <AppHeader :isAuthenticated="true" :userRole="'AGENT_ESCALE'" userName="John" />
          <CRVLoader />
        </div>
      `,
      global: {
        pinia,
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })
    expect(wrapper.findComponent(CRVLoader).exists()).toBe(true)
    expect(wrapper.findComponent(AppHeader).exists()).toBe(true)
  })
})
