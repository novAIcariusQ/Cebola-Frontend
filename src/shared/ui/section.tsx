import type { ReactNode } from 'react'

type SectionProps = {
  title: string
  children: ReactNode
  action?: ReactNode
}

export function Section({ title, children, action }: SectionProps) {
  return (
    <section className="scroll-mt-32 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {action}
      </div>
      <div className="rounded-md border border-ink/10 bg-white shadow-soft">{children}</div>
    </section>
  )
}
