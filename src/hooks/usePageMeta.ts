import { useEffect } from 'react'
import { setPageDescription, setPageTitle } from '@/lib/seo'

/** Set <title> + meta description for a route. */
export function usePageMeta(title: string, description?: string): void {
  useEffect(() => {
    setPageTitle(title)
    if (description) setPageDescription(description)
  }, [title, description])
}
