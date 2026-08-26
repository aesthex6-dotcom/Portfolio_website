import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { scrollToId } from '@/lib/utils'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useUI } from '@/store/ui'
import { Hero } from '@/components/hero/Hero'
import { About } from '@/components/about/About'
import { Skills } from '@/components/skills/Skills'
import { Projects } from '@/components/projects/Projects'
import { Mission } from '@/components/mission/Mission'
import { StatsBand } from '@/components/statistics/StatsBand'
import { Certifications } from '@/components/certifications/Certifications'
import { Achievements } from '@/components/achievements/Achievements'
import { BlogSection } from '@/components/blog/BlogSection'
import { Contact } from '@/components/contact/Contact'
import { RecruiterHero } from '@/components/recruiter/RecruiterHero'
import { RecruiterAbout } from '@/components/recruiter/RecruiterAbout'
import { RecruiterSkills } from '@/components/recruiter/RecruiterSkills'
import { RecruiterProjects } from '@/components/recruiter/RecruiterProjects'
import { RecruiterResumeCTA } from '@/components/recruiter/RecruiterResumeCTA'
import { profile } from '@/data/profile'

export function Home() {
  const location = useLocation()
  const { recruiterMode } = useUI()

  usePageMeta(
    `${profile.name} · ${profile.roles[0]} & AI Developer`,
    `Portfolio of ${profile.name}, a ${profile.roles.join(', ')} learning and building with machine learning, LLMs, AI agents, and full-stack development.`,
  )

  // Deep-link scroll (e.g. navbar → section while not on home).
  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (scrollTo) {
      const t = setTimeout(() => scrollToId(scrollTo), 120)
      return () => clearTimeout(t)
    }
  }, [location.state])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={recruiterMode ? 'recruiter' : 'standard'}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {recruiterMode ? (
          <>
            <RecruiterHero />
            <RecruiterAbout />
            <RecruiterSkills />
            <RecruiterProjects />
            <Mission />
            <RecruiterResumeCTA />
            <Contact />
          </>
        ) : (
          <>
            <Hero />
            <About />
            <Skills />
            <Projects />
            <Mission />
            <StatsBand />
            <Certifications />
            <Achievements />
            <BlogSection />
            <Contact />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
