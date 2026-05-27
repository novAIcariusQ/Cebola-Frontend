import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type CustomerRoutePlaceholderProps = {
  title: string
  description: string
}

export function CustomerRoutePlaceholder({ title, description }: CustomerRoutePlaceholderProps) {
  const { t } = useTranslation()

  return (
    <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-market">{t('customer.placeholder.eyebrow')}</p>
      <h1 className="mt-3 text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/"
          className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-market hover:text-market"
        >
          {t('customer.placeholder.landing')}
        </Link>
        <Link
          to="/basket"
          className="rounded-md bg-market px-4 py-2 text-sm font-semibold text-white transition hover:bg-market/90"
        >
          {t('customer.navigation.basket')}
        </Link>
      </div>
    </section>
  )
}
