import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Sparkles, Star, Store, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CustomerShop } from '@entities/customer'
import type { User } from '@entities/user'
import { customerApi, authApi } from '@shared/api'
import { getDemoCustomerShopsPage, getDemoUser, USER_PROFILE_EVENT, tokenStorage } from '@shared/lib'

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
  const featuredShop = shops[0]
  const otherShops = shops.slice(1)

  return (
    <div className="space-y-10">
      {/* Hero */}
      {!isCustomerLoggedIn ? (
        <section className="sticker grain relative overflow-hidden p-8 sm:p-14">
          <div className="flex items-center gap-2 text-xs font-medium text-sub">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-2.5 py-1 font-semibold text-base">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-500"></span>
              Novo
            </span>
            Cebola para Android e iOS
          </div>

          <h1 className="display mt-5 max-w-3xl text-5xl leading-[1.02] text-ink sm:text-7xl">
            A sua mercearia<br />de bairro, <span className="marker">sem fila</span>.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-sub">
            Reserve produtos frescos em segundos. Pague quando levantar.
            Sem cartões online — só a sua loja, agora no telemóvel.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/login/sign-up" className="btn-primary">
              Criar conta grátis
            </Link>
            <Link to="/login/sign-in" className="btn-secondary">
              Já tenho conta
            </Link>
          </div>

          {/* Floating stickers */}
          <div className="pointer-events-none absolute right-8 top-8 hidden rotate-3 rounded-2xl bg-lime-300 px-4 py-2 text-sm font-semibold text-base shadow-pop sm:block">
            +12 lojas hoje
          </div>
          <div className="pointer-events-none absolute -bottom-6 right-16 hidden -rotate-2 rounded-2xl bg-white px-4 py-3 shadow-pop sm:block">
            <p className="font-mono text-xs text-sub">Pedido #4829-1375</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">Pronto para recolha ✓</p>
          </div>
        </section>
      ) : (
        <section className="space-y-2">
          <p className="text-sm font-medium text-sub">Olá{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</p>
          <h1 className="display text-5xl text-ink sm:text-6xl">Onde vamos hoje?</h1>
        </section>
      )}

      {/* Search */}
      <label className="pill flex items-center gap-3 rounded-full px-5 py-3">
        <Search size={18} className="text-sub" aria-hidden="true" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-sub"
          placeholder={t('customer.pages.landing.search')}
          value={query}
          onChange={event => {
            setQuery(event.target.value)
            setPage(1)
          }}
        />
      </label>

      {/* Subscription ad — premium banner */}
      {showSubscriptionAd && (
        <div className="relative overflow-hidden rounded-3xl border border-line bg-base p-6 text-white shadow-pop sm:p-8">
          <button
            type="button"
            onClick={handleDismissAd}
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Dismiss advertisement"
          >
            <X size={16} aria-hidden="true" />
          </button>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-lime-300">
                <Sparkles size={14} />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                  {t('customer.pages.subscription.adTitle')}
                </span>
              </div>
              <h2 className="display text-3xl text-white sm:text-4xl">
                {t('customer.pages.subscription.title')}
              </h2>
              <p className="max-w-xl text-sm text-white/65">
                {t('customer.pages.subscription.adDescription')}
              </p>
            </div>
            <Link
              to="/subscription"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-lime-300 px-5 py-3 text-sm font-semibold text-base transition hover:bg-lime-400"
            >
              <Sparkles size={14} />
              {t('customer.pages.subscription.upgradeBtn')}
            </Link>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime-300/10"></div>
        </div>
      )}

      {/* Magazine-style shops grid */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-sub">{t('customer.pages.landing.title')}</p>
            <h2 className="display mt-1 text-4xl text-ink sm:text-5xl">Lojas a abrir agora</h2>
          </div>
        </div>

        {shops.length > 0 && featuredShop && (
          <div className="grid grid-cols-12 gap-4">
            {/* Big feature card */}
            <Link
              to={`/shops/${featuredShop.id}/products`}
              className="sticker group col-span-12 row-span-2 overflow-hidden transition hover:shadow-pop md:col-span-7"
            >
              <div className="flex h-full flex-col justify-between p-7">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-2.5 py-1 text-xs font-semibold text-base">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime-500"></span>
                    Em destaque
                  </span>
                  <h3 className="display mt-6 text-5xl leading-none text-ink">{featuredShop.title}</h3>
                  <p className="mt-3 max-w-sm text-sm text-sub">{featuredShop.description}</p>

                  {featuredShop.ratingCount && featuredShop.ratingCount > 0 && (
                    <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs">
                      <Star size={12} className="fill-lime-500 text-lime-500" />
                      <strong className="font-semibold text-ink">
                        {(featuredShop.avgRating || 0).toFixed(1)}
                      </strong>
                      <span className="text-sub">({featuredShop.ratingCount})</span>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="font-mono text-xs text-sub">#{featuredShop.id.slice(0, 6)}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink transition-all group-hover:gap-2">
                    Ver loja <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            </Link>

            {/* Smaller cards */}
            {otherShops.slice(0, 2).map((shop, idx) => (
              <Link
                key={shop.id}
                to={`/shops/${shop.id}/products`}
                className={`sticker group col-span-12 p-6 transition hover:shadow-pop sm:col-span-6 md:col-span-5 ${
                  idx === 1 ? 'bg-lime-100' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs text-sub">#{String(idx + 2).padStart(3, '0')}</span>
                  {idx === 0 ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-sub">
                      {t('common.active')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-base px-2 py-0.5 text-xs font-semibold text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime-300"></span>
                      {t('common.active')}
                    </span>
                  )}
                </div>
                <h3 className="display mt-12 text-3xl text-ink">{shop.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-sub">{shop.description}</p>
              </Link>
            ))}
          </div>
        )}

        {/* Remaining shops — uniform grid */}
        {otherShops.length > 2 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherShops.slice(2).map(shop => (
              <Link
                key={shop.id}
                to={`/shops/${shop.id}/products`}
                className="sticker group p-5 transition hover:shadow-pop"
              >
                <div className="mb-4 grid h-32 place-items-center overflow-hidden rounded-2xl bg-muted">
                  {shop.logoUrl ? (
                    <img className="h-full w-full object-cover" src={shop.logoUrl} alt="" />
                  ) : (
                    <Store className="text-sub/40 transition group-hover:text-ink" size={36} aria-hidden="true" />
                  )}
                </div>
                <h3 className="font-semibold text-ink">{shop.title}</h3>
                {shop.ratingCount && shop.ratingCount > 0 ? (
                  <div className="mt-1 flex items-center gap-1.5">
                    <Star size={12} className="fill-lime-500 text-lime-500" />
                    <span className="text-xs font-semibold text-ink">
                      {(shop.avgRating || 0).toFixed(1)}
                    </span>
                    <span className="text-xs text-sub">({shop.ratingCount})</span>
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-sub/60">{t('customer.pages.ratings.empty')}</div>
                )}
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-sub">{shop.description}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {!isLoading && shops.length === 0 && (
        <div className="sticker p-8 text-center">
          <p className="text-sm text-sub">{t('common.empty')}</p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between rounded-full border border-line bg-white px-5 py-3">
        <span className="text-sm text-sub">
          {t('customer.pagination.page')} {page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage(current => Math.max(1, current - 1))}
            aria-label={t('customer.pagination.previous')}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage(current => Math.min(totalPages, current + 1))}
            aria-label={t('customer.pagination.next')}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
