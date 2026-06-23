// P2_LOGS_CLEANUP_001: Conditional logging (dev only)
const isDev = () => process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true'

export const log = (...args) => isDev() ? console.log('[CRV]', ...args) : null
export const warn = (...args) => console.warn('[CRV]', ...args)
export const error = (...args) => console.error('[CRV]', ...args)
