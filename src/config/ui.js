// COPIÉ ET ADAPTÉ DEPUIS STOCK THS POUR CRV

export const COLORS = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  secondary: '#64748b',
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626',
  dark: '#1f2937',
  darker: '#111827',
}

export const BUTTON_CLASSES = {
  primary: 'bg-crv-blue hover:bg-crv-blue-dark text-white px-4 py-2 rounded font-medium transition-all duration-200',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-all duration-200',
  success: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-all duration-200',
  danger: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-all duration-200',
  outline: 'border-2 border-crv-blue text-crv-blue hover:bg-crv-blue hover:text-white px-4 py-2 rounded font-medium transition-all duration-200',
}

export const STATUS_BADGES = {
  validated: 'bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
  pending: 'bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
  in_progress: 'bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
  rejected: 'bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
  closed: 'bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
}

export const MODAL_CLASSES = {
  overlay: 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50',
  container: 'bg-gray-900 rounded-lg shadow-2xl border border-gray-700 max-w-2xl w-full mx-4',
  header: 'bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center',
  body: 'px-6 py-4',
  footer: 'px-6 py-4 border-t border-gray-700 flex justify-end gap-3',
}
