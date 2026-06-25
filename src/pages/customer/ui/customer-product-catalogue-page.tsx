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
      // Reload ratings
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
      // Reload ratings
      await loadRatings()
    } catch (err) {
      console.error(err)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const ratingsTotalPages = Math.max(1, Math.ceil(ratingsTotal / 5))

  // Determine if user can leave a review:
  // Must be logged in, and NOT the shop owner
  const isOwner = currentUser && shop && (shop.ownerId === currentUser.id)
  const canLeaveReview = tokenStorage.getToken() && !isOwner

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wide text-market">
          {t('customer.pages.catalogue.eyebrow')}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">{shop?.title ?? t('customer.pages.catalogue.title')}</h1>
        
        {reviewCount > 0 ? (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(averageRating) ? 'fill-current' : 'text-ink/20'}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-ink">
              {(averageRating || 0).toFixed(1)}
            </span>
            <span className="text-xs text-ink/65">
              ({reviewCount} {reviewCount === 1 ? t('customer.pages.ratings.reviewCount') : t('customer.pages.ratings.reviewCountPlural')})
            </span>
          </div>
        ) : (
          <p className="mt-2 text-xs text-ink/65">
            {t('customer.pages.ratings.empty')}
          </p>
        )}

        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
          {shop?.description || t('customer.pages.catalogue.description')}
        </p>
      </section>

      <label className="flex items-center gap-3 rounded-md border border-ink/10 bg-white px-4 py-3 shadow-soft">
        <Search size={18} className="text-ink/45" aria-hidden="true" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          placeholder={t('customer.pages.catalogue.search')}
          value={query}
          onChange={event => {
            setQuery(event.target.value)
            setPage(1)
          }}
        />
      </label>

      {message && <p className="rounded-md border border-ink/10 bg-white p-3 text-sm text-market">{message}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map(product => (
          <article
            key={product.id}
            className="rounded-md border border-ink/10 bg-white p-4 shadow-soft transition hover:border-market"
          >
            <Link to={`/shops/${shopId}/products/${product.id}`} className="block">
              <div className="mb-4 overflow-hidden rounded-md bg-paper aspect-[4/3]">
                {product.photoUrl ? (
                  <img className="h-full w-full object-cover object-center" src={product.photoUrl} alt="" />
                ) : (
                  <span className="text-4xl font-semibold text-ink/20">
                    {product.title.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <h2 className="font-semibold text-ink">{product.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">{product.description}</p>
            </Link>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-market">{formatCurrency(product.price)}</span>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-market px-3 py-2 text-sm font-semibold text-white transition hover:bg-market/90"
                onClick={() => addToBasket(product)}
              >
                <ShoppingBasket size={16} aria-hidden="true" />
                {t('customer.basket.add')}
              </button>
            </div>
          </article>
        ))}
      </div>

      {!isLoading && products.length === 0 && (
        <p className="rounded-md border border-ink/10 bg-white p-5 text-sm text-ink/60">{t('common.empty')}</p>
      )}

      {products.length > 0 && (
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

      {/* Reviews & Feedback Section */}
      <section className="grid gap-6 md:grid-cols-3 border-t border-ink/10 pt-6">
        {/* Reviews List */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-ink">{t('customer.pages.ratings.title')}</h2>

            {ratingsLoading ? (
              <p className="mt-4 text-sm text-ink/50">{t('common.loading')}</p>
            ) : ratings.length === 0 ? (
              <p className="mt-4 text-sm text-ink/50">{t('customer.pages.ratings.empty')}</p>
            ) : (
              <div className="mt-4 divide-y divide-ink/10">
                {ratings.map(rating => (
                  <div key={rating.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="font-semibold text-ink">{rating.userName}</span>
                        <div className="flex items-center text-amber-500 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= rating.rating ? 'fill-current' : 'text-ink/20'}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-ink/45">
                          {rating.createdAt ? rating.createdAt.split('T')[0] : ''}
                        </span>
                        {currentUser && (rating.userId === currentUser.id || shop?.ownerId === currentUser.id) && (
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 transition"
                            onClick={() => handleDeleteReview(rating.id)}
                            title={t('customer.pages.ratings.deleteConfirm')}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    {rating.comment && (
                      <p className="mt-2 text-sm text-ink/75 leading-relaxed">{rating.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Ratings Pagination */}
            {ratingsTotal > 5 && (
              <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
                <span className="text-xs text-ink/60">
                  {t('customer.pagination.page')} {ratingsPage} / {ratingsTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-ink/10 disabled:opacity-40"
                    disabled={ratingsPage <= 1}
                    onClick={() => setRatingsPage(current => Math.max(1, current - 1))}
                    aria-label={t('customer.pagination.previous')}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-ink/10 disabled:opacity-40"
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

        {/* Leave Review Form */}
        <div className="space-y-4">
          <div className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">{t('customer.pages.ratings.writeReview')}</h3>

            {canLeaveReview ? (
              <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    {t('customer.pages.ratings.yourRating')}
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="text-amber-500 hover:scale-110 transition duration-150"
                        onClick={() => setRatingValue(star)}
                      >
                        <Star
                          size={24}
                          className={star <= ratingValue ? 'fill-current' : 'text-ink/20'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    className="w-full min-h-[100px] p-3 rounded-md border border-ink/10 text-sm bg-transparent outline-none focus:border-market transition"
                    placeholder={t('customer.pages.ratings.commentPlaceholder')}
                    value={commentValue}
                    onChange={e => setCommentValue(e.target.value)}
                    required
                  />
                </div>

                {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
                {reviewSuccess && <p className="text-xs text-market">{reviewSuccess}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center items-center rounded-md bg-market py-2.5 text-sm font-semibold text-white transition hover:bg-market/90 disabled:opacity-50"
                >
                  {isSubmitting ? t('customer.pages.ratings.submitting') : t('customer.pages.ratings.submit')}
                </button>
              </form>
            ) : isOwner ? (
              <p className="mt-4 text-sm text-ink/50 italic">
                You cannot rate your own shop.
              </p>
            ) : (
              <div className="mt-4 text-center">
                <Link
                  to="/login/sign-in"
                  className="inline-flex justify-center items-center rounded-md border border-market text-market px-4 py-2 text-sm font-semibold transition hover:bg-market/5"
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
