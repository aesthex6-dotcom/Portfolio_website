import { motion } from 'framer-motion'
import { skills } from '@/data/skills'
import { SectionHeading } from '@/components/ui/SectionHeading'

/** House ease — cinematic, settled. Content entrances never pop. */
const EASE = [0.16, 1, 0.3, 1] as const

/** Recruiter-friendly skills — the real categories from `src/data/skills.ts`, as compact chips. */
export function RecruiterSkills() {
  return (
    <section id="skills" className="relative scroll-mt-20 py-16 md:py-20">
      <div className="container-site">
        <SectionHeading
          eyebrow="Skills"
          title="Tools I work with"
          description="Honest categories pulled straight from the skills data; no fancy layouts, just what I use."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.07, ease: EASE }}
              className="panel p-6"
            >
              <h3 className="font-display text-[15px] font-semibold text-ink">{cat.name}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cat.skills.map((s) => (
                  <span key={s.name} className="chip">
                    {s.name}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
