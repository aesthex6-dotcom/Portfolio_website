import { useEffect, useRef } from 'react'

type EventMap = WindowEventMap & DocumentEventMap

/** Attach a typed event listener that always calls the latest handler. */
export function useEventListener<K extends keyof EventMap>(
  event: K,
  handler: (e: EventMap[K]) => void,
  element: Window | Document | HTMLElement | null = window,
  options?: AddEventListenerOptions,
): void {
  const saved = useRef(handler)

  useEffect(() => {
    saved.current = handler
  }, [handler])

  useEffect(() => {
    if (!element) return
    const fn = (e: Event) => saved.current(e as EventMap[K])
    element.addEventListener(event, fn as EventListener, options)
    return () => element.removeEventListener(event, fn as EventListener, options)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, element])
}
