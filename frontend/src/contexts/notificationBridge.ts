let notifier: null | ((message: string, type?: 'success' | 'error' | 'info') => void) = null

export function setGlobalNotifier(fn: typeof notifier) {
  notifier = fn
}

export function notify(message: string, type: 'success' | 'error' | 'info' = 'info') {
  notifier?.(message, type)
}
