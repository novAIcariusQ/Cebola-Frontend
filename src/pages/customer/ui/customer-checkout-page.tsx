import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { customerApi } from '@shared/api'
import {
  clearCustomerBasket,
  createCustomerOrderPayload,
  formatCurrency,
  getCustomerBasketItems,
  getCustomerBasketTotal,
} from '@shared/lib'

export function CustomerCheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const hasSubmittedRef = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const basketItems = getCustomerBasketItems()
  const total = getCustomerBasketTotal(basketItems)

  useEffect(() => {
    if (hasSubmittedRef.current) {
      return
    }

    hasSubmittedRef.current = true

    const submitOrder = async () => {
      const payload = createCustomerOrderPayload(basketItems)

      if (!payload) {
        setIsSubmitting(false)
        setError(t('customer.pages.checkout.empty'))
        return
      }

      try {
        const order = await customerApi.createOrder(payload)

        if (!order.paymentUrl) {
          setError(t('customer.pages.checkout.missingPaymentLink'))
          return
        }

        clearCustomerBasket()
        setPaymentUrl(order.paymentUrl)
        window.location.assign(order.paymentUrl)
      } catch {
        setError(t('customer.pages.checkout.error'))
      } finally {
        setIsSubmitting(false)
      }
    }

    void submitOrder()
  }, [basketItems, t])

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6">
      <section className="mx-auto max-w-xl rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-market"
          onClick={() => navigate('/basket')}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('common.back')}
        </button>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-market">
            {t('customer.pages.checkout.eyebrow')}
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-ink">{t('customer.pages.checkout.title')}</h1>
          <p className="mt-2 text-sm leading-6 text-ink/60">{t('customer.pages.checkout.description')}</p>
        </div>

        <div className="mt-6 rounded-md bg-paper p-4">
          <div className="flex justify-between gap-4 text-sm text-ink/70">
            <span>{t('customer.pages.basket.items')}</span>
            <strong className="text-ink">{basketItems.reduce((count, item) => count + item.quantity, 0)}</strong>
          </div>
          <div className="mt-3 flex justify-between gap-4 border-t border-ink/10 pt-3">
            <span className="font-semibold text-ink">{t('customer.pages.basket.total')}</span>
            <strong className="text-market">{formatCurrency(total)}</strong>
          </div>
        </div>

        {isSubmitting && (
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-ink/60">
            <Loader2 className="animate-spin" size={16} aria-hidden="true" />
            {t('customer.pages.checkout.creating')}
          </p>
        )}

        {error && <p className="mt-6 rounded-md border border-clay/20 bg-clay/5 p-3 text-sm text-clay">{error}</p>}

        {paymentUrl && (
          <a
            href={paymentUrl}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-market px-4 py-2 text-sm font-semibold text-white transition hover:bg-market/90"
          >
            <ExternalLink size={16} aria-hidden="true" />
            {t('customer.pages.checkout.openPayment')}
          </a>
        )}

        {!isSubmitting && !paymentUrl && (
          <Link
            to="/basket"
            className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-market hover:text-market"
          >
            {t('customer.navigation.basket')}
          </Link>
        )}
      </section>
    </main>
  )
}
