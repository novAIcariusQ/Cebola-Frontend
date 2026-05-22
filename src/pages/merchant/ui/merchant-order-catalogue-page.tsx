import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, PackageSearch, Search } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Order } from '@entities/order'
import { merchantApi, type MerchantListResponse } from '@shared/api/merchant.api'
import { formatCurrency, getDemoMerchantShopOrders } from '@shared/lib'
import { StatusPill } from '@shared/ui/status-pill'

export function MerchantOrderCataloguePage() {
  const { t } = useTranslation()
  const { shopId = 'shop-demo' } = useParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const limit = 12

  const fallbackOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const shopOrders = getDemoMerchantShopOrders(shopId)

    if (!normalizedQuery) {
      return shopOrders
    }

    return shopOrders.filter(order =>
      [order.id, order.guestOrderId ?? '', order.status].some(value => value.toLowerCase().includes(normalizedQuery)),
    )
  }, [query, shopId])

  useEffect(() => {
    let isMounted = true

    const loadOrders = async () => {
      setIsLoading(true)

      try {
        const response = await merchantApi.getOrders(shopId, { page, limit, q: query || undefined })
        const normalizedResponse = Array.isArray(response)
          ? { items: response, total: response.length }
          : (response as MerchantListResponse<Order>)

        if (!isMounted) return

        setOrders(normalizedResponse.items)
        setTotal(normalizedResponse.total ?? normalizedResponse.items.length)
      } catch {
        if (!isMounted) return

        const start = (page - 1) * limit
        setOrders(fallbackOrders.slice(start, start + limit))
        setTotal(fallbackOrders.length)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      isMounted = false
    }
  }, [fallbackOrders, limit, page, query, shopId])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <Link
          to={`/merchant/shops/${shopId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-market"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('common.back')}
        </Link>
        <h1 className="text-2xl font-semibold text-ink">{t('merchant.pages.orderCatalogue.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
          {t('merchant.pages.orderCatalogue.description')}
        </p>
      </section>

      <label className="flex items-center gap-3 rounded-md border border-ink/10 bg-white px-4 py-3 shadow-soft">
        <Search size={18} className="text-ink/45" aria-hidden="true" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          placeholder={t('merchant.pages.orderCatalogue.search')}
          value={query}
          onChange={event => {
            setQuery(event.target.value)
            setPage(1)
          }}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orders.map(order => (
          <Link
            key={order.id}
            to={`/merchant/shops/${shopId}/orders/${order.id}`}
            className="rounded-md border border-ink/10 bg-white p-4 shadow-soft transition hover:border-market"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-ink">{order.guestOrderId ?? order.id.slice(0, 8)}</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-ink/60">
                  <Calendar size={14} aria-hidden="true" />
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusPill tone={order.status === 'completed' ? 'success' : 'warning'}>{order.status}</StatusPill>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 rounded-md bg-paper p-3">
              <span className="flex items-center gap-2 text-sm text-ink/70">
                <PackageSearch size={16} aria-hidden="true" />
                {t('merchant.orders.items')}: {order.totalQuantity}
              </span>
              <strong className="text-sm text-market">{formatCurrency(order.totalAmount)}</strong>
            </div>
          </Link>
        ))}
      </div>

      {!isLoading && orders.length === 0 && (
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
