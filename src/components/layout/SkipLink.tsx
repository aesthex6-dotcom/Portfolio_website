/** Accessible skip-to-content link — first focusable element. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-transform focus:translate-y-0"
    >
      Skip to content
    </a>
  )
}
