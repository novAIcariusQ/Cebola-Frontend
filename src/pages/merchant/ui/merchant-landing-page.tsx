import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Shop } from '@entities/shop'
import type { User } from '@entities/user'
import { merchantApi, authApi, type MerchantListResponse } from '@shared/api'
import { getDemoMerchantShops, getDemoUser, USER_PROFILE_EVENT, tokenStorage } from '@shared/lib'

export function MerchantLandingPage() {
  const { t } = useTranslation()
  const [shops, setShops] = useState<Shop[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const limit = 9

  useEffect(() => {
    let isMounted = true
    const loadUser = async () => {
      if (!tokenStorage.getToken()) return
      try {
        const apiUser = await authApi.me()
        if (isMounted) setUser(apiUser)
      } catch {
        if (isMounted) setUser(getDemoUser())
      }
    }

    const handleProfileUpdate = () => {
      if (isMounted) void loadUser()
    }

    void loadUser()
    window.addEventListener(USER_PROFILE_EVENT, handleProfileUpdate)

    return () => {
      isMounted = false
      window.removeEventListener(USER_PROFILE_EVENT, handleProfileUpdate)
    }
  }, [])

  const currentPlan = user?.subscription?.plan ?? 'free'
  const hasMerchantSubscription = ['basic', 'standard', 'pro'].includes(currentPlan)

  const filteredFallbackShops = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const demoShops = getDemoMerchantShops()

    if (!normalizedQuery) {
      return demoShops
    }

    return demoShops.filter(shop =>
      [shop.name, shop.description].some(value => value.toLowerCase().includes(normalizedQuery)),
    )
  }, [query])

  useEffect(() => {
    let isMounted = true

    const loadShops = async () => {
      setIsLoading(true)

      try {
        const response = await merchantApi.getShops({ page, limit, q: query || undefined })
        const normalizedResponse = Array.isArray(response)
          ? { items: response, total: response.length }
          : (response as MerchantListResponse<Shop>)

        if (!isMounted) return

        setShops(normalizedResponse.items)
        setTotal(normalizedResponse.total ?? normalizedResponse.items.length)
      } catch {
        if (!isMounted) return

        const start = (page - 1) * limit
        const fallbackPage = filteredFallbackShops.slice(start, start + limit)
        setShops(fallbackPage)
        setTotal(filteredFallbackShops.length)
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
  }, [filteredFallbackShops, page, query])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-6">
      {!hasMerchantSubscription && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-md border border-clay/20 bg-clay/5 p-4 text-clay">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-block">⚠️</span>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {t('customer.pages.subscription.noSubscriptionAlert')}
              </p>
            </div>
          </div>
          <Link
            to="/subscription"
            className="inline-flex items-center justify-center rounded-md bg-clay px-4 py-2 text-xs font-semibold text-white transition hover:bg-clay/90 whitespace-nowrap"
          >
            {t('customer.pages.subscription.upgradeBtn')}
          </Link>
        </div>
      )}

      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{t('merchant.pages.landing.title')}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
              {t('merchant.pages.landing.description')}
            </p>
          </div>
          <Link
            to={hasMerchantSubscription ? "/merchant/shops/new" : "/subscription"}
            className="inline-flex items-center gap-2 rounded-md bg-market px-4 py-2 text-sm font-semibold text-white transition hover:bg-market/90"
          >
            <Plus size={16} aria-hidden="true" />
            {t('merchant.pages.landing.createShop')}
          </Link>
        </div>
      </section>
      <label className="flex items-center gap-3 rounded-md border border-ink/10 bg-white px-4 py-3 shadow-soft">
        <Search size={18} className="text-ink/45" aria-hidden="true" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          placeholder={t('merchant.pages.landing.search')}
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
            to={`/merchant/shops/${shop.id}`}
            className="rounded-md border border-ink/10 bg-white p-4 shadow-soft transition hover:border-market"
          >
            <div className="mb-4 grid h-28 place-items-center overflow-hidden rounded-md bg-paper">
              {shop.logoUrl ? (
                <img className="h-full w-full object-cover" src={shop.logoUrl} alt="" />
              ) : (
                <span className="text-3xl font-semibold text-ink/25">{shop.name.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <h2 className="font-semibold text-ink">{shop.name}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-ink/60">{shop.description}</p>
          </Link>
        ))}
      </div>
      {!isLoading && shops.length === 0 && (
        <p className="rounded-md border border-ink/10 bg-white p-5 text-sm text-ink/60">{t('common.empty')}</p>
      )}
      <div className="flex items-center justify-between rounded-md border border-ink/10 bg-white px-4 py-3 shadow-soft">
        <span className="text-sm text-ink/60">
          {t('merchant.pages.landing.page')} {page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage(current => Math.max(1, current - 1))}
            aria-label={t('merchant.pages.landing.previous')}
            title={t('merchant.pages.landing.previous')}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage(current => Math.min(totalPages, current + 1))}
            aria-label={t('merchant.pages.landing.next')}
            title={t('merchant.pages.landing.next')}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
