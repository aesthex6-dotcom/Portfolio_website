import { useEffect, useState } from 'react';
export function useBrightPhase(): boolean {
  const [bright, setBright] = useState(false);
  useEffect(() => {
    const tick = () => {
      setBright(document.documentElement.classList.contains('bright-phase'));
    };
    tick();
    const obs = new MutationObserver(tick);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return bright;
}
