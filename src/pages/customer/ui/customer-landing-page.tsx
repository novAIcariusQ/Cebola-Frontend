import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Sparkles, Store, Star, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CustomerShop } from '@entities/customer'
import type { User } from '@entities/user'
import { customerApi, authApi } from '@shared/api'
import { getDemoCustomerShopsPage, getDemoUser, USER_PROFILE_EVENT } from '@shared/lib'

import { tokenStorage } from '@shared/lib'

export function CustomerLandingPage() {
  const { t } = useTranslation()
  const [shops, setShops] = useState<CustomerShop[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const limit = 9

  const isCustomerLoggedIn = !!tokenStorage.getToken() && tokenStorage.getUserRole() === 'customer'
  const userSubscriptionPlan = user?.subscription?.plan ?? 'free'
  const [isAdDismissed, setIsAdDismissed] = useState(() => localStorage.getItem('cebola.customerAdDismissed') === 'true')
  const showSubscriptionAd = userSubscriptionPlan !== 'premium' && !isAdDismissed

  const handleDismissAd = () => {
    setIsAdDismissed(true)
    localStorage.setItem('cebola.customerAdDismissed', 'true')
  }

  useEffect(() => {
    let isMounted = true
    const loadUser = async () => {
      if (!tokenStorage.getToken()) {
        if (isMounted) setUser(null)
        return
      }
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
      {!isCustomerLoggedIn && (
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
      )}

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

      {showSubscriptionAd && (
        <div className="relative overflow-hidden rounded-md border border-market/20 bg-gradient-to-r from-market/5 via-market/10 to-transparent p-6 shadow-sm">
          <button
            type="button"
            onClick={handleDismissAd}
            className="absolute right-3 top-3 text-ink/45 transition hover:text-market"
            aria-label="Dismiss advertisement"
          >
            <X size={16} aria-hidden="true" />
          </button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mr-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-market">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-wider text-market">
                  {t('customer.pages.subscription.adTitle')}
                </span>
              </div>
              <h2 className="text-lg font-bold text-ink">
                {t('customer.pages.subscription.title')}
              </h2>
              <p className="text-sm text-ink/65 max-w-xl">
                {t('customer.pages.subscription.adDescription')}
              </p>
            </div>
            <Link
              to="/subscription"
              className="inline-flex items-center justify-center rounded-md bg-market px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-market/90 whitespace-nowrap"
            >
              <Sparkles className="mr-1.5" size={14} />
              {t('customer.pages.subscription.upgradeBtn')}
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shops.map(shop => (
          <Link
            key={shop.id}
            to={`/shops/${shop.id}/products`}
            className="group rounded-md border border-ink/10 bg-white p-4 shadow-soft transition hover:border-market"
          >
            <div className="mb-4 overflow-hidden rounded-md bg-paper h-40">
              {shop.logoUrl ? (
                <img className="h-full w-full object-cover object-center" src={shop.logoUrl} alt="" />
              ) : (
                <Store className="text-ink/25 transition group-hover:text-market" size={36} aria-hidden="true" />
              )}
            </div>
            <h2 className="font-semibold text-ink">{shop.title}</h2>
            {shop.ratingCount && shop.ratingCount > 0 ? (
              <div className="mt-1 flex items-center gap-1.5">
                <div className="flex text-amber-500">
                  <Star size={14} className="fill-current" />
                </div>
                <span className="text-xs font-semibold text-ink">
                  {(shop.avgRating || 0).toFixed(1)}
                </span>
                <span className="text-xs text-ink/50">
                  ({shop.ratingCount} {shop.ratingCount === 1 ? t('customer.pages.ratings.reviewCount') : t('customer.pages.ratings.reviewCountPlural')})
                </span>
              </div>
            ) : (
              <div className="mt-1 text-xs text-ink/40">
                {t('customer.pages.ratings.empty')}
              </div>
            )}
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">{shop.description}</p>
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
