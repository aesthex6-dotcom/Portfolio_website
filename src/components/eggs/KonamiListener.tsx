import { useEffect } from 'react'
import { useKonami } from '@/hooks/useKonami'
import { useUI } from '@/store/ui'
import { useToast } from '@/store/toast'

/**
 * Global easter-egg listeners: the Konami code toggles Hacker Mode,
 * and `?` opens the shortcuts cheat-sheet.
 */
export function KonamiListener() {
  const { hackerMode, setHackerMode, unlockBadge, openTerminal } = useUI()
  const { push } = useToast()

  useKonami(() => {
    const next = !hackerMode
    setHackerMode(next)
    unlockBadge('konami')
    push(next ? '⌁ HACKER MODE ENGAGED' : '⌁ hacker mode disengaged', 'accent')
  })

  // Keyboard shortcut cheat-sheet
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ignore when typing in an input/textarea or when an overlay is open
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      )
        return

      if (e.key === '?') {
        e.preventDefault()
        openTerminal()
        push('Tip: type "eggs" in the terminal for secrets', 'warn')
      }
      if (e.key.toLowerCase() === 't' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        openTerminal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openTerminal, push])

  return null
}
