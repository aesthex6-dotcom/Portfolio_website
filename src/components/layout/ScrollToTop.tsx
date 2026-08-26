import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Restore scroll position on route change (not for hash navigations). */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
