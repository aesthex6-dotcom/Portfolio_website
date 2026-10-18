import { motion } from 'framer-motion'
import { useUI } from '@/store/ui'
import { Icon } from '@/components/ui/Icon'
import { profile } from '@/data/profile'

const EASE = [0.16, 1, 0.3, 1] as const

export function ExperienceSelector() {
  const { mode, setMode, setExperienceMode, setRecruiterMode } = useUI()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ground/90 p-4 backdrop-blur-2xl md:p-8">
      <div
        className="absolute inset-0 bg-grid-faint bg-[size:44px_44px] opacity-20"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-edge bg-surface/95 p-6 shadow-lift backdrop-blur-2xl md:p-12"
      >
        {/* Top header & language toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-edge pb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              {profile.name} · Portfolio 2026
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              {mode === 'ja' ? 'エクスペリエンスを選択してください' : 'Choose Your Experience'}
            </h1>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-edge bg-raised/60 p-1">
            <button
              type="button"
              onClick={() => setMode('en')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                mode === 'en' ? 'bg-accent text-base font-semibold' : 'text-ink hover:text-accent'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setMode('ja')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                mode === 'ja' ? 'bg-accent text-base font-semibold' : 'text-ink hover:text-accent'
              }`}
            >
              日本語
            </button>
          </div>
        </div>

        {/* Experience Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Professional Card */}
          <motion.button
            type="button"
            onClick={() => {
              setRecruiterMode(true)
              setExperienceMode('professional')
            }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-edge bg-raised/40 p-6 text-left transition-all duration-300 hover:border-accent hover:bg-raised/80 hover:shadow-lg md:p-8"
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-accent/5 rounded-bl-full transition-transform duration-500 group-hover:scale-110" aria-hidden />

            <div>
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon name="gauge" size={20} />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink bg-accent/10 px-2.5 py-1 rounded-full">
                  {mode === 'ja' ? '高速・プロ' : 'Recruiter Ready'}
                </span>
              </div>

              <h2 className="mt-6 font-display text-xl font-semibold text-ink md:text-2xl">
                {mode === 'ja' ? 'プロフェッショナル モード' : 'Professional Experience'}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-ink">
                {mode === 'ja'
                  ? '採用担当者やエンジニア向けに最適化された、クリーンで高速なポートフォリオ。シネマティックアニメーションを省き、スキル、プロジェクト、経歴をダイレクトに提示します。'
                  : 'A clean, high-signal, recruiter-friendly portfolio optimized for speed and clarity. Features complete technical projects, skills, education, and experience with zero cinematic runtime overhead.'}
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 font-display text-sm font-medium text-ink">
              <span>{mode === 'ja' ? 'プロフェッショナルで開始' : 'Launch Professional'}</span>
              <Icon name="arrow-right" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </motion.button>

          {/* Chill / Cinematic Card */}
          <motion.button
            type="button"
            onClick={() => {
              setRecruiterMode(false)
              setExperienceMode('chill')
            }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-edge bg-raised/40 p-6 text-left transition-all duration-300 hover:border-accent hover:bg-raised/80 hover:shadow-lg md:p-8"
          >
            <div className="absolute top-0 right-0 h-32 w-32 bg-accent/5 rounded-bl-full transition-transform duration-500 group-hover:scale-110" aria-hidden />

            <div>
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon name="eye" size={20} />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink bg-edge/40 px-2.5 py-1 rounded-full">
                  {mode === 'ja' ? '没入型・シネマティック' : 'Immersive Experience'}
                </span>
              </div>

              <h2 className="mt-6 font-display text-xl font-semibold text-ink md:text-2xl">
                {mode === 'ja' ? 'シネマティック モード' : 'Chill & Cinematic Experience'}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-ink">
                {mode === 'ja'
                  ? 'ナイト（英語）およびサムライ（日本語）のスクロール駆動型シネマティックシーケンス、サウンドトラック、没入型の雰囲気をフルで体験できるポートフォリオ。'
                  : 'The signature atmospheric experience featuring scroll-driven Knight (English) and Samurai (Japanese) cinematic frame sequences, ambient audio, and rich visual storytelling.'}
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 font-display text-sm font-medium text-ink">
              <span>{mode === 'ja' ? 'シネマティックで開始' : 'Launch Cinematic'}</span>
              <Icon name="arrow-right" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </motion.button>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center font-mono text-[11px] text-ink">
          {mode === 'ja'
            ? '※ ユーティリティドックからいつでもエクスペリエンスや言語を切り替えることができます。'
            : 'You can switch between experiences or languages at any time using the utility dock.'}
        </p>
      </motion.div>
    </div>
  )
}
