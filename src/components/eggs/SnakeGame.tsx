import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useUI } from '@/store/ui'
import { Icon } from '@/components/ui/Icon'

const GRID = 20
const CELL = 16
const SIZE = GRID * CELL

interface Point {
  x: number
  y: number
}

function randFood(snake: Point[]): Point {
  let p: Point
  do {
    p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }
  } while (snake.some((s) => s.x === p.x && s.y === p.y))
  return p
}

/**
 * NEURAL SNAKE — a retro easter egg. Reach a score of 10 to
 * permanently unlock the "Snake Charmer" badge.
 */
export function SnakeGame() {
  const { snakeOpen, setSnakeOpen, unlockBadge } = useUI()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Point>({ x: 14, y: 10 })
  const [dir, setDir] = useState<Point>({ x: 1, y: 0 })
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const [won, setWon] = useState(false)

  const snakeRef = useRef(snake)
  const dirRef = useRef(dir)
  const foodRef = useRef(food)
  const overRef = useRef(over)
  snakeRef.current = snake
  dirRef.current = dir
  foodRef.current = food
  overRef.current = over

  const reset = useCallback(() => {
    setSnake([{ x: 10, y: 10 }])
    setFood({ x: 14, y: 10 })
    setDir({ x: 1, y: 0 })
    setScore(0)
    setOver(false)
    setWon(false)
  }, [])

  // Step the game
  useEffect(() => {
    if (!snakeOpen || over) return
    const iv = setInterval(() => {
      const s = snakeRef.current
      const d = dirRef.current
      const head = { x: s[0].x + d.x, y: s[0].y + d.y }

      // wall collision → wrap (classic is game over, wrapping is friendlier)
      const wx = (head.x + GRID) % GRID
      const wy = (head.y + GRID) % GRID
      if (s.some((seg) => seg.x === wx && seg.y === wy)) {
        setOver(true)
        return
      }

      const ate = wx === foodRef.current.x && wy === foodRef.current.y
      const next = ate ? [head, ...s] : [head, ...s.slice(0, -1)]
      setSnake(next)

      if (ate) {
        const newScore = score + 1
        setScore(newScore)
        setFood(randFood(next))
        if (newScore >= 10) {
          setWon(true)
          setOver(true)
          unlockBadge('snake')
        }
      }
    }, 110)
    return () => clearInterval(iv)
  }, [snakeOpen, over, score, unlockBadge])

  // Keyboard controls
  useEffect(() => {
    if (!snakeOpen) return
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'escape') setSnakeOpen(false)
      const map: Record<string, Point> = {
        arrowup: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      }
      const nd = map[k]
      if (!nd) return
      e.preventDefault()
      const cur = dirRef.current
      // prevent 180° turns
      if (nd.x === -cur.x && nd.y === -cur.y) return
      setDir(nd)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [snakeOpen, setSnakeOpen])

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.fillStyle = '#07070b'
    ctx.fillRect(0, 0, SIZE, SIZE)

    // faint grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL, 0)
      ctx.lineTo(i * CELL, SIZE)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL)
      ctx.lineTo(SIZE, i * CELL)
      ctx.stroke()
    }

    // food — the functional target, lit in the accent
    ctx.fillStyle = '#c7ff38'
    ctx.beginPath()
    ctx.arc(
      foodRef.current.x * CELL + CELL / 2,
      foodRef.current.y * CELL + CELL / 2,
      5,
      0,
      Math.PI * 2,
    )
    ctx.fill()

    // snake — a lit head (active element) with a neutral mechanical body
    snakeRef.current.forEach((seg, i) => {
      const grad = i === 0 ? '#c7ff38' : i % 2 === 0 ? '#8a8a8a' : '#6f6f6f'
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4)
      ctx.fill()
    })
  }, [snake]) // re-render whenever the snake moves

  return (
    <AnimatePresence>
      {snakeOpen && (
        <motion.div
          className="no-print fixed inset-0 z-[85] flex items-center justify-center bg-ground/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && setSnakeOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Retro snake game"
        >
          <motion.div
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-edge bg-surface shadow-lift"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
          >
            <div className="flex items-center justify-between border-b border-edge px-4 py-3">
              <p className="font-mono text-[12px] text-faint">NEURAL SNAKE · score {score}</p>
              <button
                type="button"
                onClick={() => setSnakeOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-full text-faint hover:bg-raised hover:text-ink"
                aria-label="Close game"
              >
                <Icon name="x" size={15} />
              </button>
            </div>

            <div className="p-4">
              <canvas
                ref={canvasRef}
                width={SIZE}
                height={SIZE}
                className="mx-auto w-full max-w-[320px] rounded-xl border border-edge"
              />

              <div className="mt-3 flex items-center justify-between">
                <p className="font-mono text-[11px] text-faint">
                  arrows / wasd to move · esc to close
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-full border border-edge px-3 py-1.5 text-[12px] text-muted hover:text-ink"
                >
                  <Icon name="rotate-ccw" size={14} />
                  Retry
                </button>
              </div>

              {over && (
                <div className="mt-3 rounded-xl border border-edge bg-raised/50 p-4 text-center">
                  <p className="font-display text-lg font-semibold text-ink">
                    {won
                      ? '🐍 You tamed the snake · badge unlocked!'
                      : `Game over · score ${score}`}
                  </p>
                  <p className="mt-1 text-[12px] text-faint">
                    {won ? 'Check the Achievements section.' : 'Reach 10 to earn a secret badge.'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
