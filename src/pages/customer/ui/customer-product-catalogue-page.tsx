import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, ShoppingBasket } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CustomerProduct, CustomerShop } from '@entities/customer'
import { customerApi } from '@shared/api'
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

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wide text-market">
          {t('customer.pages.catalogue.eyebrow')}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">{shop?.title ?? t('customer.pages.catalogue.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
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
              <div className="mb-4 grid aspect-[4/3] place-items-center overflow-hidden rounded-md bg-paper">
                {product.photoUrl ? (
                  <img className="h-full w-full object-cover" src={product.photoUrl} alt="" />
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
