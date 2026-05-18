type StatusPillProps = {
  children: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

const toneClassName = {
  neutral: 'bg-ink/5 text-ink/70',
  success: 'bg-market/10 text-market',
  warning: 'bg-onion/15 text-onion',
  danger: 'bg-clay/10 text-clay',
}

export function StatusPill({ children, tone = 'neutral' }: StatusPillProps) {
  return (
    <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${toneClassName[tone]}`}>
      {children}
    </span>
  )
}
