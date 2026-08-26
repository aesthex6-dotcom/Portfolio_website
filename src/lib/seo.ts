/**
 * Tiny SEO helpers — keep titles/descriptions in sync on route change.
 * (Static meta lives in index.html; these handle SPA updates.)
 */

export function setPageTitle(title: string): void {
  document.title = title
}

export function setPageDescription(description: string): void {
  const el = document.querySelector('meta[name="description"]')
  if (el) el.setAttribute('content', description)
}

export function setCanonical(path: string): void {
  const url = `${window.location.origin}${path}`
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = url
}
