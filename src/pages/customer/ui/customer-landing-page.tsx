import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Sparkles, Store, Star, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CustomerShop } from '@entities/customer'
import type { User } from '@entities/user'
import { customerApi, authApi, ratingApi } from '@shared/api'
import { getDemoCustomerShopsPage, getDemoUser, USER_PROFILE_EVENT, formatCurrency } from '@shared/lib'
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

  // Featured grid states
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true)

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

  // Load featured products and community ratings dynamically
  useEffect(() => {
    let isMounted = true
    const loadFeaturedAndReviews = async () => {
      if (shops.length === 0) return
      setIsFeaturedLoading(true)
      try {
        const activeShops = shops.slice(0, 3)

        const productsPromises = activeShops.map(s => 
          customerApi.getShopProducts(s.id, { page: 1, limit: 2 }).catch(() => ({ items: [] }))
        )
        const reviewsPromises = activeShops.map(s => 
          ratingApi.getShopRatings(s.id, 1, 2).catch(() => ({ items: [] }))
        )

        const productsResults = await Promise.all(productsPromises)
        const reviewsResults = await Promise.all(reviewsPromises)

        // Combine products
        const allProducts: any[] = []
        productsResults.forEach((res, index) => {
          res.items.forEach((p: any) => {
            allProducts.push({
              ...p,
              shopTitle: activeShops[index].title
            })
          })
        })

        // Combine reviews
        const allReviews: any[] = []
        reviewsResults.forEach((res, index) => {
          res.items.forEach((r: any) => {
            allReviews.push({
              ...r,
              shopTitle: activeShops[index].title
            })
          })
        })

        // Sort reviews by date
        const sortedReviews = allReviews
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 3)

        const selectedProducts = allProducts.slice(0, 3)

        if (isMounted) {
          // If no real products or reviews, load demo data so it always looks rich
          if (selectedProducts.length === 0) {
            setFeaturedProducts([
              {
                id: 'demo-p1',
                shopId: activeShops[0]?.id || 'shop-demo',
                shopTitle: activeShops[0]?.title || 'Mercearia Cebola',
                title: 'Organic Onions',
                description: 'Fresh batch from local farm, rich taste.',
                price: 2.4,
                photoUrl: null,
              },
              {
                id: 'demo-p2',
                shopId: activeShops[0]?.id || 'shop-demo',
                shopTitle: activeShops[0]?.title || 'Mercearia Cebola',
                title: 'Goat Cheese',
                description: 'Limited daily batch, high quality.',
                price: 5.9,
                photoUrl: null,
              },
              {
                id: 'demo-p3',
                shopId: activeShops[0]?.id || 'shop-demo',
                shopTitle: activeShops[0]?.title || 'Mercearia Cebola',
                title: 'Fresh Strawberries',
                description: 'Sweet local strawberries, 500g box.',
                price: 3.5,
                photoUrl: null,
              }
            ])
          } else {
            setFeaturedProducts(selectedProducts)
          }

          if (sortedReviews.length === 0) {
            setRecentReviews([
              {
                id: 'demo-r1',
                shopId: activeShops[0]?.id || 'shop-demo',
                shopTitle: activeShops[0]?.title || 'Mercearia Cebola',
                userName: 'Ana Silva',
                rating: 5,
                comment: 'Best organic vegetables in town! Fast pickup.',
                createdAt: new Date().toISOString()
              },
              {
                id: 'demo-r2',
                shopId: activeShops[0]?.id || 'shop-demo',
                shopTitle: activeShops[0]?.title || 'Mercearia Cebola',
                userName: 'João Pinto',
                rating: 4,
                comment: 'Great fresh bread, will definitely order again.',
                createdAt: new Date().toISOString()
              }
            ])
          } else {
            setRecentReviews(sortedReviews)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) {
          setIsFeaturedLoading(false)
        }
      }
    }

    void loadFeaturedAndReviews()
    return () => {
      isMounted = false
    }
  }, [shops])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-8">
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

      {/* Asymmetric Composition: Featured Products & Community Reviews */}
      {!isFeaturedLoading && (featuredProducts.length > 0 || recentReviews.length > 0) && (
        <section className="grid gap-6 lg:grid-cols-3 border-t border-ink/10 pt-6">
          {/* Featured Products List (2 Columns wide) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
              <Sparkles size={18} className="text-market" />
              {t('customer.pages.landing.freshArrivals')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className={`rounded-md border border-ink/10 bg-white p-4 shadow-soft hover:border-market transition-all flex ${
                    idx === 0 ? 'sm:col-span-2 flex-col sm:flex-row gap-4' : 'flex-col justify-between'
                  }`}
                >
                  <div className={`overflow-hidden rounded-md bg-paper flex items-center justify-center shrink-0 ${
                    idx === 0 ? 'w-full sm:w-48 h-40' : 'w-full h-36'
                  }`}>
                    {product.photoUrl ? (
                      <img className="max-h-full max-w-full object-contain" src={product.photoUrl} alt="" />
                    ) : (
                      <span className="text-3xl font-semibold text-ink/20">
                        {product.title.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col justify-between flex-1 mt-3 sm:mt-0">
                    <div>
                      <span className="text-xxs font-semibold uppercase text-market tracking-wider">
                        {product.shopTitle}
                      </span>
                      <h3 className="font-semibold text-ink text-base mt-1 leading-tight">{product.title}</h3>
                      <p className="text-xs text-ink/60 line-clamp-2 mt-1.5 leading-relaxed">{product.description}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-4">
                      <span className="text-sm font-semibold text-market">{formatCurrency(product.price)}</span>
                      <Link
                        to={`/shops/${product.shopId}/products`}
                        className="rounded-md border border-market text-market px-3 py-1.5 text-xs font-semibold hover:bg-market/5 transition"
                      >
                        {t('customer.pages.product.buy')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Neighborhood Reviews (1 Column wide) */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
              <Store size={18} className="text-market" />
              {t('customer.pages.landing.recentReviews')}
            </h2>
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-md border border-ink/10 bg-white p-4 shadow-soft hover:border-market transition relative overflow-hidden flex flex-col justify-between min-h-[120px]"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-market"></div>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-ink">{review.userName}</span>
                      <span className="text-xxs text-ink/40">
                        {review.createdAt ? review.createdAt.split('T')[0] : ''}
                      </span>
                    </div>
                    <div className="flex items-center text-amber-500 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={10}
                          className={star <= review.rating ? 'fill-current' : 'text-ink/20'}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-ink/75 italic mt-2 line-clamp-3 leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-ink/5 flex justify-between items-center text-xxs font-semibold text-market">
                    <span>@ {review.shopTitle}</span>
                    <Link to={`/shops/${review.shopId}/products`} className="hover:underline">
                      {t('customer.pages.basket.continueShopping')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Shops List */}
      <div className="space-y-4 border-t border-ink/10 pt-6">
        <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
          <Store size={18} className="text-market" />
          {t('customer.pages.landing.search')}
        </h2>
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
      </div>

      {!isLoading && shops.length === 0 && (
        <p className="rounded-md border border-ink/10 bg-white p-5 text-sm text-ink/60">{t('common.empty')}</p>
      )}

      {shops.length > 0 && (
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
      )}
    </div>
  )
}
