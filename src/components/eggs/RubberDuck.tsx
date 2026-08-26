import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useUI } from '@/store/ui'
import { Icon } from '@/components/ui/Icon'

const THOUGHTS = [
  'Have you tried turning it off and on again?',
  'Did you check the vector shapes?',
  'Maybe the gradients are too steep.',
  'Have you tried asking Claude?',
  'It worked on my machine…',
  'That looks like a caching problem.',
  'Do you have a golden test for that?',
  'git blame yourself before blaming the data.',
]

/**
 * The rubber duck. Summon it with `duck` in the terminal. It's draggable,
 * it quacks on click, and it dispenses debugging wisdom.
 */
export function RubberDuck() {
  const { duckVisible, setDuckVisible } = useUI()
  const [thought, setThought] = useState(THOUGHTS[0])
  const [thoughtVisible, setThoughtVisible] = useState(false)

  useEffect(() => {
    if (!duckVisible) return
    const t = setTimeout(() => setThoughtVisible(true), 1200)
    const iv = setInterval(() => {
      setThought(THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)])
    }, 9000)
    return () => {
      clearTimeout(t)
      clearInterval(iv)
    }
  }, [duckVisible])

  const quack = () => {
    setThought('QUACK! 🦆')
    setThoughtVisible(true)
    setTimeout(() => {
      setThought(THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)])
    }, 1800)
  }

  return (
    <AnimatePresence>
      {duckVisible && (
        <motion.div
          className="no-print fixed bottom-5 left-5 z-[65]"
          initial={{ opacity: 0, y: 40, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <div className="relative flex items-end">
            {/* speech bubble */}
            <AnimatePresence>
              {thoughtVisible && (
                <motion.div
                  className="absolute bottom-16 left-2 max-w-[220px] rounded-2xl rounded-bl-sm border border-edge bg-raised px-3.5 py-2 text-[12px] leading-snug text-muted shadow-lift"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                >
                  {thought}
                  <button
                    type="button"
                    onClick={() => setThoughtVisible(false)}
                    className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full border border-edge bg-ground text-faint hover:text-ink"
                    aria-label="Dismiss thought"
                  >
                    <Icon name="x" size={12} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* duck */}
            <motion.div
              drag
              dragMomentum={false}
              whileDrag={{ scale: 1.1 }}
              className="cursor-grab select-none text-[42px] leading-none active:cursor-grabbing"
              onClick={quack}
              whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
              role="button"
              aria-label="Rubber duck · click to quack, drag to move"
            >
              🦆
            </motion.div>

            {/* dismiss */}
            <button
              type="button"
              onClick={() => setDuckVisible(false)}
              className="ml-2 grid h-6 w-6 place-items-center rounded-full border border-edge bg-surface text-faint transition-colors hover:text-ink"
              aria-label="Dismiss the duck"
            >
              <Icon name="x" size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
