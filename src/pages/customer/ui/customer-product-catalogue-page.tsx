import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, ShoppingBasket, Star, Trash2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CustomerProduct, CustomerShop } from '@entities/customer'
import { customerApi, ratingApi, authApi, type Rating } from '@shared/api'
import { tokenStorage } from '@shared/lib'
import {
  addCustomerBasketProduct,
  formatCurrency,
  getDemoCustomerShop,
  getDemoCustomerShopProductsPage,
} from '@shared/lib'

const POSTER_BGS = ['bg-muted', 'bg-lime-100', 'bg-base', 'bg-lime-50', 'bg-muted', 'bg-lime-200']

export function CustomerProductCataloguePage() {
  const { t } = useTranslation()
  const { shopId = '' } = useParams()
  const [shop, setShop] = useState<CustomerShop | null>(null)
  const [products, setProducts] = useState<CustomerProduct[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const limit = 12

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<any | null>(null)

  // Ratings state
  const [ratings, setRatings] = useState<Rating[]>([])
  const [ratingsPage, setRatingsPage] = useState(1)
  const [ratingsTotal, setRatingsTotal] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [ratingsLoading, setRatingsLoading] = useState(true)

  // Rating submission form state
  const [ratingValue, setRatingValue] = useState(5)
  const [commentValue, setCommentValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      if (tokenStorage.getToken()) {
        try {
          const user = await authApi.me()
          if (isMounted) setCurrentUser(user)
        } catch {
          if (isMounted) setCurrentUser(null)
        }
      } else {
        if (isMounted) setCurrentUser(null)
      }
    }

    void loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  const loadRatings = async () => {
    setRatingsLoading(true)
    try {
      const res = await ratingApi.getShopRatings(shopId, ratingsPage, 5)
      setRatings(res.items)
      setAverageRating(res.averageRating)
      setReviewCount(res.count)
      setRatingsTotal(res.count)
    } catch (err) {
      console.error(err)
    } finally {
      setRatingsLoading(false)
    }
  }

  useEffect(() => {
    void loadRatings()
  }, [shopId, ratingsPage])

  useEffect(() => {
    let isMounted = true

    const loadShop = async () => {
      try {
        const apiShop = await customerApi.getShop(shopId)

        if (!isMounted) return

        setShop(apiShop ?? getDemoCustomerShop(shopId))
      } catch {
        if (isMounted) {
          setShop(getDemoCustomerShop(shopId))
        }
      }
    }

    void loadShop()

    return () => {
      isMounted = false
    }
  }, [shopId])

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      setIsLoading(true)

      try {
        const response = await customerApi.getShopProducts(shopId, { page, limit, q: query || undefined })

        if (!isMounted) return

        setProducts(response.items.filter(product => product.isAvailable && product.quantity > 0))
        setTotal(response.total)
      } catch {
        if (!isMounted) return

        const fallbackResponse = getDemoCustomerShopProductsPage(shopId, { page, limit, q: query || undefined })
        setProducts(fallbackResponse.items)
        setTotal(fallbackResponse.total)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      isMounted = false
    }
  }, [page, query, shopId])

  const addToBasket = (product: CustomerProduct) => {
    addCustomerBasketProduct({
      ...product,
      shopTitle: product.shopTitle || shop?.title || '',
    })
    setMessage(t('customer.basket.added'))
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setReviewError(null)
    setReviewSuccess(null)

    try {
      await ratingApi.submitRating(shopId, ratingValue, commentValue)
      setReviewSuccess(t('customer.pages.ratings.successMessage'))
      setCommentValue('')
      await loadRatings()
    } catch (err: any) {
      setReviewError(err.response?.data?.detail || t('customer.pages.ratings.errorMessage'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteReview = async (ratingId: string) => {
    if (!window.confirm(t('customer.pages.ratings.deleteConfirm'))) {
      return
    }

    try {
      await ratingApi.deleteRating(shopId, ratingId)
      await loadRatings()
    } catch (err) {
      console.error(err)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const ratingsTotalPages = Math.max(1, Math.ceil(ratingsTotal / 5))

  const isOwner = currentUser && shop && (shop.ownerId === currentUser.id)
  const canLeaveReview = tokenStorage.getToken() && !isOwner

  return (
    <div className="space-y-10">
      {/* Shop header */}
      <section className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-sub hover:text-ink"
        >
          ← {t('common.back')}
        </Link>

        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-sub">{t('customer.pages.catalogue.eyebrow')}</p>
            <h1 className="display mt-1 text-5xl text-ink sm:text-6xl">{shop?.title ?? t('customer.pages.catalogue.title')}</h1>

            {reviewCount > 0 ? (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs">
                <Star size={12} className="fill-lime-500 text-lime-500" />
                <strong className="font-semibold text-ink">{(averageRating || 0).toFixed(1)}</strong>
                <span className="text-sub">({reviewCount})</span>
              </div>
            ) : (
              <p className="mt-2 text-xs text-sub">{t('customer.pages.ratings.empty')}</p>
            )}
          </div>
        </div>

        <p className="max-w-2xl text-base leading-7 text-sub">
          {shop?.description || t('customer.pages.catalogue.description')}
        </p>
      </section>

      {/* Search */}
      <label className="pill flex items-center gap-3 rounded-full px-5 py-3">
        <Search size={18} className="text-sub" aria-hidden="true" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-sub"
          placeholder={t('customer.pages.catalogue.search')}
          value={query}
          onChange={event => {
            setQuery(event.target.value)
            setPage(1)
          }}
        />
      </label>

      {message && (
        <div className="rounded-full bg-lime-100 px-5 py-3 text-sm text-base">
          ✓ {message}
        </div>
      )}

      {/* Products — poster grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, idx) => (
          <article
            key={product.id}
            className="group relative aspect-[3/4] overflow-hidden rounded-3xl transition hover:shadow-pop"
          >
            <div className={`absolute inset-0 grid place-items-center ${POSTER_BGS[idx % POSTER_BGS.length]}`}>
              {product.photoUrl ? (
                <img className="h-full w-full object-cover" src={product.photoUrl} alt="" />
              ) : (
                <span className={`display text-8xl ${idx % POSTER_BGS.length === 2 ? 'text-lime-300/40' : 'text-ink/15'}`}>
                  {product.title.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>

            <Link
              to={`/shops/${shopId}/products/${product.id}`}
              className="absolute inset-0 z-10"
              aria-label={product.title}
            />

            <div className="absolute inset-x-3 bottom-3 z-20 rounded-2xl bg-white/95 p-3 backdrop-blur">
              <p className="truncate text-xs text-sub">{shop?.title}</p>
              <p className="truncate font-semibold text-ink">{product.title}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-ink">{formatCurrency(product.price)}</span>
                <button
                  type="button"
                  className="grid h-7 w-7 place-items-center rounded-full bg-base text-lg leading-none text-white transition hover:bg-ink"
                  onClick={() => addToBasket(product)}
                  aria-label={t('customer.basket.add')}
                >
                  +
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!isLoading && products.length === 0 && (
        <div className="sticker p-8 text-center">
          <p className="text-sm text-sub">{t('common.empty')}</p>
        </div>
      )}

      {products.length > 0 && (
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
      )}

      {/* Reviews & Feedback Section */}
      <section className="grid gap-6 border-t border-line pt-10 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="sticker p-6">
            <h2 className="display text-3xl text-ink">{t('customer.pages.ratings.title')}</h2>

            {ratingsLoading ? (
              <p className="mt-4 text-sm text-sub">{t('common.loading')}</p>
            ) : ratings.length === 0 ? (
              <p className="mt-4 text-sm text-sub">{t('customer.pages.ratings.empty')}</p>
            ) : (
              <div className="mt-4 divide-y divide-line">
                {ratings.map(rating => (
                  <div key={rating.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="font-semibold text-ink">{rating.userName}</span>
                        <div className="mt-1 flex items-center gap-0.5 text-lime-500">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= rating.rating ? 'fill-current' : 'text-line'}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-sub">
                          {rating.createdAt ? rating.createdAt.split('T')[0] : ''}
                        </span>
                        {currentUser && (rating.userId === currentUser.id || shop?.ownerId === currentUser.id) && (
                          <button
                            type="button"
                            className="text-rust transition hover:opacity-70"
                            onClick={() => handleDeleteReview(rating.id)}
                            title={t('customer.pages.ratings.deleteConfirm')}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    {rating.comment && (
                      <p className="mt-2 text-sm leading-relaxed text-ink/80">{rating.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {ratingsTotal > 5 && (
              <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                <span className="text-xs text-sub">
                  {t('customer.pagination.page')} {ratingsPage} / {ratingsTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line disabled:opacity-40"
                    disabled={ratingsPage <= 1}
                    onClick={() => setRatingsPage(current => Math.max(1, current - 1))}
                    aria-label={t('customer.pagination.previous')}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line disabled:opacity-40"
                    disabled={ratingsPage >= ratingsTotalPages}
                    onClick={() => setRatingsPage(current => Math.min(ratingsTotalPages, current + 1))}
                    aria-label={t('customer.pagination.next')}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="sticker p-6">
            <h3 className="font-display text-xl text-ink">{t('customer.pages.ratings.writeReview')}</h3>

            {canLeaveReview ? (
              <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">
                    {t('customer.pages.ratings.yourRating')}
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className="text-lime-500 transition hover:scale-110"
                        onClick={() => setRatingValue(star)}
                      >
                        <Star
                          size={24}
                          className={star <= ratingValue ? 'fill-current' : 'text-line'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    className="w-full min-h-[100px] rounded-2xl border border-line bg-white p-3 text-sm outline-none transition focus:border-base"
                    placeholder={t('customer.pages.ratings.commentPlaceholder')}
                    value={commentValue}
                    onChange={e => setCommentValue(e.target.value)}
                    required
                  />
                </div>

                {reviewError && <p className="text-xs text-rust">{reviewError}</p>}
                {reviewSuccess && <p className="text-xs text-base">{reviewSuccess}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center items-center rounded-full bg-base py-2.5 text-sm font-semibold text-white transition hover:bg-ink disabled:opacity-50"
                >
                  {isSubmitting ? t('customer.pages.ratings.submitting') : t('customer.pages.ratings.submit')}
                </button>
              </form>
            ) : isOwner ? (
              <p className="mt-4 text-sm italic text-sub">You cannot rate your own shop.</p>
            ) : (
              <div className="mt-4 text-center">
                <Link
                  to="/login/sign-in"
                  className="inline-flex items-center justify-center rounded-full border border-base px-4 py-2 text-sm font-semibold text-ink transition hover:bg-base hover:text-white"
                >
                  {t('customer.pages.ratings.loginPrompt')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
