import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { setGlobalNotifier } from './notificationBridge'

type NotificationType = 'success' | 'error' | 'info'

type Notification = {
  id: number
  type: NotificationType
  message: string
}

type NotificationContextValue = {
  notify: (message: string, type?: NotificationType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const remove = useCallback((id: number) => {
    setNotifications((current) => current.filter((item) => item.id !== id))
  }, [])

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setNotifications((current) => [...current, { id, type, message }])
    window.setTimeout(() => remove(id), 4000)
  }, [remove])

  const value = useMemo<NotificationContextValue>(() => ({
    notify,
    success: (message: string) => notify(message, 'success'),
    error: (message: string) => notify(message, 'error'),
    info: (message: string) => notify(message, 'info'),
  }), [notify])

  useEffect(() => {
    setGlobalNotifier((message, type) => notify(message, type))
    return () => setGlobalNotifier(null)
  }, [notify])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {notifications.map((notification) => {
          const styles = notification.type === 'success'
            ? 'border-emerald-500/40 bg-emerald-950/95 text-emerald-100'
            : notification.type === 'error'
              ? 'border-red-500/40 bg-red-950/95 text-red-100'
              : 'border-sky-500/40 bg-sky-950/95 text-sky-100'
          const Icon = notification.type === 'success'
            ? CheckCircle2
            : notification.type === 'error'
              ? AlertCircle
              : Info

          return (
            <div key={notification.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${styles}`}>
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm leading-5">{notification.message}</p>
              <button type="button" onClick={() => remove(notification.id)} className="rounded p-1 opacity-80 hover:bg-white/10 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
