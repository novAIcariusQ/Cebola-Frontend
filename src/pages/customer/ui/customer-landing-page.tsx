import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CustomerShop } from '@entities/customer'
import { customerApi } from '@shared/api'
import { getDemoCustomerShopsPage } from '@shared/lib'

export function CustomerLandingPage() {
  const { t } = useTranslation()
  const [shops, setShops] = useState<CustomerShop[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const limit = 9

  useEffect(() => {
    let isMounted = true

    const loadShops = async () => {
      setIsLoading(true)

      try {
        const response = await customerApi.getShops({ page, limit, q: query || undefined })

        if (!isMounted) return

        setShops(response.items)
        setTotal(response.total)
      } catch {
        if (!isMounted) return

        const fallbackResponse = getDemoCustomerShopsPage({ page, limit, q: query || undefined })
        setShops(fallbackResponse.items)
        setTotal(fallbackResponse.total)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadShops()

    return () => {
      isMounted = false
    }
  }, [page, query])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-soft">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-market">{t('common.appName')}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              {t('customer.pages.landing.title')}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">{t('customer.pages.landing.description')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/login/sign-in"
              className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-market hover:text-market"
            >
              {t('login.signIn')}
            </Link>
            <Link
              to="/login/sign-up"
              className="rounded-md bg-market px-4 py-2 text-sm font-semibold text-white transition hover:bg-market/90"
            >
              {t('login.createAccount')}
            </Link>
          </div>
        </div>
      </section>

      <label className="flex items-center gap-3 rounded-md border border-ink/10 bg-white px-4 py-3 shadow-soft">
        <Search size={18} className="text-ink/45" aria-hidden="true" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          placeholder={t('customer.pages.landing.search')}
          value={query}
          onChange={event => {
            setQuery(event.target.value)
            setPage(1)
          }}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shops.map(shop => (
          <Link
            key={shop.id}
            to={`/shops/${shop.id}/products`}
            className="group rounded-md border border-ink/10 bg-white p-4 shadow-soft transition hover:border-market"
          >
            <div className="mb-4 grid h-32 place-items-center overflow-hidden rounded-md bg-paper">
              {shop.logoUrl ? (
                <img className="h-full w-full object-cover" src={shop.logoUrl} alt="" />
              ) : (
                <Store className="text-ink/25 transition group-hover:text-market" size={36} aria-hidden="true" />
              )}
            </div>
            <h2 className="font-semibold text-ink">{shop.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink/60">{shop.description}</p>
          </Link>
        ))}
      </div>

      {!isLoading && shops.length === 0 && (
        <p className="rounded-md border border-ink/10 bg-white p-5 text-sm text-ink/60">{t('common.empty')}</p>
      )}

      <div className="flex items-center justify-between rounded-md border border-ink/10 bg-white px-4 py-3 shadow-soft">
        <span className="text-sm text-ink/60">
          {t('customer.pagination.page')} {page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage(current => Math.max(1, current - 1))}
            aria-label={t('customer.pagination.previous')}
            title={t('customer.pagination.previous')}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage(current => Math.min(totalPages, current + 1))}
            aria-label={t('customer.pagination.next')}
            title={t('customer.pagination.next')}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
