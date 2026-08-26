import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'

interface CopyButtonProps {
  value: string
  className?: string
  label?: string
}

export function CopyButton({ value, className, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink',
        className,
      )}
      aria-label={label}
    >
      {copied ? <Icon name="check" size={15} className="text-ok" /> : <Icon name="copy" size={15} />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  )
}
