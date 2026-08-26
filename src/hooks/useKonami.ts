import { useEffect, useRef } from 'react'

export type KonamiKey = 'up' | 'down' | 'left' | 'right' | 'a' | 'b'

const KEY_MAP: Record<string, KonamiKey> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  a: 'a',
  b: 'b',
}

const DEFAULT_SEQUENCE: KonamiKey[] = [
  'up',
  'up',
  'down',
  'down',
  'left',
  'right',
  'left',
  'right',
  'b',
  'a',
]

/** Fires `onMatch` when the given key sequence is typed (Konami by default). */
export function useKonami(onMatch: () => void, sequence: KonamiKey[] = DEFAULT_SEQUENCE): void {
  const pos = useRef(0)
  const handler = useRef(onMatch)
  handler.current = onMatch

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = KEY_MAP[e.key.toLowerCase()]
      if (!key) {
        pos.current = 0
        return
      }
      pos.current = key === sequence[pos.current] ? pos.current + 1 : 0
      if (pos.current === sequence.length) {
        pos.current = 0
        handler.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sequence])
}
