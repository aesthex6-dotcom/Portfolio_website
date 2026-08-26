import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Toast {
  id: number
  message: string
  tone: 'ok' | 'accent' | 'warn'
}

interface ToastContextValue {
  push: (message: string, tone?: Toast['tone']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((message: string, tone: Toast['tone'] = 'ok') => {
    const id = ++counter
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400)
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast stack */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[99] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className={cn(
                'pointer-events-auto flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] shadow-lift backdrop-blur',
                t.tone === 'ok' && 'border-ok/30 bg-ground/90 text-ok',
                t.tone === 'accent' && 'border-accent/40 bg-ground/90 text-accent',
                t.tone === 'warn' && 'border-warn/30 bg-ground/90 text-warn',
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// Same standard context pattern as useUI — Fast Refresh hint doesn't apply.
// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
