/**
 * Configuration globale des tests Vitest
 */

import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    localStorageMock.store[key] = String(value)
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock.store[key]
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {}
  })
}

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

// Mock console.warn et console.error pour éviter le bruit dans les tests
vi.spyOn(console, 'warn').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})
vi.spyOn(console, 'log').mockImplementation(() => {})

// Reset des mocks avant chaque test
beforeEach(() => {
  localStorageMock.store = {}
  vi.clearAllMocks()
})
