import type { ReactNode } from 'react'
import { SoundtrackProvider } from '@/store/soundtrackStore'
import { useAudio } from '@/hooks/useAudio'
import { SoundtrackPlayer } from './SoundtrackPlayer'

/** Lives under the provider — owns the singleton audio element + the player panel. */
function SoundtrackRoot() {
  useAudio() // singleton audio element — synced with the store
  return <SoundtrackPlayer />
}

/**
 * The Soundtrack — self-contained barrel.
 * Mount once near the top of the app. Children are rendered inside the
 * provider so the utility dock (which owns the music trigger) can read the
 * soundtrack store.
 */
export function Soundtrack({ children }: { children?: ReactNode }) {
  return (
    <SoundtrackProvider>
      <SoundtrackRoot />
      {children}
    </SoundtrackProvider>
  )
}
