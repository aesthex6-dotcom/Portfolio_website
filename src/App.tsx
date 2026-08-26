import { Route, Routes } from 'react-router-dom'
import { ToastProvider } from '@/store/toast'
import { AtmosphereProvider } from '@/store/atmosphere'
import { SkipLink } from '@/components/layout/SkipLink'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { Lodestar } from '@/components/lodestar'
import { Footer } from '@/components/layout/Footer'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { Terminal } from '@/components/terminal/Terminal'
import { AIChat } from '@/components/ai/AIChat'
import { Soundtrack } from '@/components/soundtrack'
import { UtilityDock } from '@/components/layout/UtilityDock'
import { RecruiterToggle } from '@/components/recruiter/RecruiterToggle'
import { MatrixRain } from '@/components/eggs/MatrixRain'
import { RubberDuck } from '@/components/eggs/RubberDuck'
import { SnakeGame } from '@/components/eggs/SnakeGame'
import { KonamiListener } from '@/components/eggs/KonamiListener'
import { EngineeredField } from '@/components/background/EngineeredField'
import { Home } from '@/pages/Home'
import { BlogPostPage } from '@/pages/BlogPostPage'
import { ResumePage } from '@/pages/ResumePage'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  return (
    <ToastProvider>
      <AtmosphereProvider>
      <SkipLink />
      <ScrollToTop />
      <KonamiListener />
      <Lodestar />

      <main id="main" className="relative min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* EngineeredField — the one continuous blueprint mechanism behind every scene.
          Fixed to viewport, scroll-driven progressive draw, never uses accent. */}
      <EngineeredField />

      <Footer />

      {/* Global overlays / easter eggs */}
      <CommandPalette />
      <Terminal />
      <AIChat />
      <Soundtrack>
        <UtilityDock />
      </Soundtrack>
      <RecruiterToggle />
      <RubberDuck />
      <SnakeGame />
      <MatrixRain />
      {/* film grain + room vignette — the materiality the Atmosphere tunes */}
      <div className="noise" aria-hidden />
      <div className="vignette" aria-hidden />
      </AtmosphereProvider>
    </ToastProvider>
  )
}
