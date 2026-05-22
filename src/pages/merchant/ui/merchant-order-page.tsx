import { useEffect, useState } from 'react'
import { ArrowLeft, Check, Clock, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Order, OrderStatus } from '@entities/order'
import { merchantApi } from '@shared/api'
import { formatCurrency, getDemoMerchantOrder, updateDemoMerchantOrderStatus, upsertDemoMerchantOrder } from '@shared/lib'
import { StatusPill } from '@shared/ui/status-pill'

export function MerchantOrderPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { shopId = 'shop-demo', orderId = '' } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadOrder = async () => {
      setIsLoading(true)

      try {
        const apiOrder = await merchantApi.getOrder(shopId, orderId)

        if (!isMounted) return

        if (apiOrder) {
          setOrder(apiOrder)
          upsertDemoMerchantOrder(apiOrder)
          return
        }

        throw new Error('Order not found')
      } catch {
        if (!isMounted) return
        setOrder(getDemoMerchantOrder(shopId, orderId))
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrder()

    return () => {
      isMounted = false
    }
  }, [orderId, shopId])

  const updateStatus = async (status: OrderStatus) => {
    if (!order) return

    setIsSaving(true)

    try {
      const updatedOrder = await merchantApi.updateOrderStatus(shopId, order.id, status)
      setOrder(updatedOrder)
      upsertDemoMerchantOrder(updatedOrder)
    } catch {
      const updatedOrder = updateDemoMerchantOrderStatus(shopId, order.id, status)
      if (updatedOrder) {
        setOrder(updatedOrder)
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-ink/60">{t('common.loading')}</p>
  }

  if (!order) {
    return (
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">{t('merchant.pages.order.notFound')}</h1>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-market px-4 py-2 text-sm font-semibold text-white"
          onClick={() => navigate(`/merchant/shops/${shopId}/orders`)}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('common.back')}
        </button>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-market"
        onClick={() => navigate(`/merchant/shops/${shopId}/orders`)}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t('common.back')}
      </button>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{order.guestOrderId ?? order.id}</h1>
            <p className="mt-2 text-sm text-ink/60">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <StatusPill tone={order.status === 'completed' ? 'success' : 'warning'}>{order.status}</StatusPill>
        </div>

        <div className="mt-6 divide-y divide-ink/10 rounded-md border border-ink/10">
          {order.items.map(item => (
            <article key={item.id} className="grid gap-4 p-4 sm:grid-cols-[64px_1fr_auto] sm:items-center">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-md bg-paper">
                {item.productLogo ? (
                  <img className="h-full w-full object-cover" src={item.productLogo} alt="" />
                ) : (
                  <span className="text-xl font-semibold text-ink/25">
                    {item.productTitle.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-ink">{item.productTitle}</h2>
                <p className="mt-1 text-sm text-ink/60">
                  {t('merchant.products.quantity')}: {item.quantity}
                </p>
              </div>
              <strong className="text-market">{formatCurrency(item.priceAtTime * item.quantity)}</strong>
            </article>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <div className="min-w-64 rounded-md bg-paper p-4">
            <div className="flex justify-between gap-6 text-sm text-ink/70">
              <span>{t('merchant.orders.items')}</span>
              <strong className="text-ink">{order.totalQuantity}</strong>
            </div>
            <div className="mt-3 flex justify-between gap-6 text-base">
              <span className="font-semibold text-ink">{t('merchant.orders.total')}</span>
              <strong className="text-market">{formatCurrency(order.totalAmount)}</strong>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold uppercase text-ink/45">{t('merchant.orders.updateStatus')}</h2>
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-market px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={isSaving}
              onClick={() => void updateStatus('ready')}
            >
              <Clock size={16} aria-hidden="true" />
              {t('merchant.orders.accept')}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
              disabled={isSaving}
              onClick={() => void updateStatus('completed')}
            >
              <Check size={16} aria-hidden="true" />
              {t('merchant.orders.done')}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-clay/30 px-4 py-2 text-sm font-semibold text-clay disabled:opacity-60"
              disabled={isSaving}
              onClick={() => void updateStatus('cancelled')}
            >
              <X size={16} aria-hidden="true" />
              {t('merchant.orders.cancel')}
            </button>
          </div>
        </section>

        <section className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold uppercase text-ink/45">{t('merchant.orders.contact')}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-ink/45">{t('login.name')}</dt>
              <dd className="font-medium text-ink">{order.customerName ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-ink/45">{t('login.email')}</dt>
              <dd className="font-medium text-ink">{order.customerEmail ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-ink/45">{t('merchant.orders.phone')}</dt>
              <dd className="font-medium text-ink">{order.customerPhone ?? '-'}</dd>
            </div>
          </dl>
        </section>
      </aside>
      </div>
    </div>
  )
}
