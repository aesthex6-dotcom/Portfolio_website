import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useUI } from '@/store/ui'
import { Icon } from '@/components/ui/Icon'

/** House ease — cinematic, settled. Content entrances never pop. */
const EASE = [0.16, 1, 0.3, 1] as const

/** Slim premium band pointing recruiters to the full résumé. */
export function RecruiterResumeCTA() {
  const { setChatOpen } = useUI()

  return (
    <section className="relative py-16 md:py-20">
      <div className="container-site">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="panel relative overflow-hidden p-8 md:p-12"
        >
          <span className="absolute inset-y-0 left-0 w-px bg-edge-strong" aria-hidden />

          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                Want the full picture?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                My résumé is generated from the same data that powers this site, always up to
                date, ready to download or print.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/resume" className="btn-primary">
                <Icon name="file-down" size={15} />
                View Resume
              </Link>
              <button type="button" onClick={() => setChatOpen(true)} className="btn-ghost">
                <Icon name="bot" size={15} />
                Ask AI
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
