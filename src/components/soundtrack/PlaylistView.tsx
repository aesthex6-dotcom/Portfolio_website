import { motion } from 'framer-motion'
import { useSoundtrack } from '@/store/soundtrackStore'
import { cn, formatTime } from '@/lib/utils'
import type { Track } from '@/types'

/** Tiny animated equalizer — shown beside the currently playing track. */
function PlayingBars() {
  return (
    <span className="flex h-3 shrink-0 items-end gap-[2px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-accent"
          style={{ height: '30%' }}
          animate={{ height: ['30%', '100%', '30%'] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
        />
      ))}
    </span>
  )
}

/** Scrollable track list inside the player, grouped by mood. */
export function PlaylistView() {
  const { currentTrack, isPlaying, playlist, play } = useSoundtrack()

  if (playlist.length === 0) {
    return (
      <p className="px-3 py-4 text-center text-[13px] text-faint">
        Still building this playlist.
      </p>
    )
  }

  // Preserve playlist order while grouping consecutive tracks by mood.
  const moods: { name: string; tracks: Track[] }[] = []
  for (const track of playlist) {
    const last = moods[moods.length - 1]
    if (last && last.name === track.mood) {
      last.tracks.push(track)
    } else {
      moods.push({ name: track.mood, tracks: [track] })
    }
  }

  return (
    <div className="no-scrollbar max-h-48 space-y-2 overflow-y-auto">
      {moods.map((group) => (
        <div key={group.name}>
          <p className="px-3 pb-1 pt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
            {group.name}
          </p>
          <div className="space-y-1">
            {group.tracks.map((track) => {
              const isActive = currentTrack?.id === track.id
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => play(track)}
                  title={track.title}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                    isActive
                      ? 'border-l-2 border-accent bg-accent/5'
                      : 'border-l-2 border-transparent hover:bg-raised/60 active:bg-raised',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'flex items-center gap-1.5 text-[13px] font-medium',
                        isActive ? 'text-accent' : 'text-ink',
                      )}
                    >
                      <span className="truncate">{track.title}</span>
                      {isActive && isPlaying && <PlayingBars />}
                    </p>
                    <p className="truncate text-[11px] text-faint">{track.artist}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-faint">
                    {formatTime(track.duration)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
