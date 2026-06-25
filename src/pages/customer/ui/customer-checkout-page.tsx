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
    <main className="min-h-screen bg-muted px-4 py-12 text-ink sm:px-6">
      <section className="mx-auto grid max-w-5xl gap-0 overflow-hidden rounded-3xl border border-line bg-white shadow-pop md:grid-cols-[1fr_360px]">
        <div className="p-8 sm:p-10">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-medium text-sub hover:text-ink"
            onClick={() => navigate('/basket')}
          >
            ← {t('common.back')}
          </button>

          <p className="mt-6 font-mono text-xs uppercase tracking-wider text-sub">
            {t('customer.pages.checkout.eyebrow')}
          </p>
          <h1 className="display mt-2 text-4xl text-ink sm:text-5xl">
            {t('customer.pages.checkout.title')}
          </h1>
          <p className="mt-3 text-base leading-7 text-sub">
            {t('customer.pages.checkout.description')}
          </p>

          <div className="mt-8 rounded-2xl bg-muted p-5">
            <div className="flex justify-between gap-4 text-sm text-sub">
              <span>{t('customer.pages.basket.items')}</span>
              <strong className="font-mono text-ink">
                {basketItems.reduce((count, item) => count + item.quantity, 0)}
              </strong>
            </div>
            <div className="mt-3 flex justify-between gap-4 border-t border-line pt-3">
              <span className="font-semibold text-ink">{t('customer.pages.basket.total')}</span>
              <strong className="display text-3xl text-base">{formatCurrency(total)}</strong>
            </div>
          </div>

          {isSubmitting && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-ink">
              <Loader2 className="animate-spin" size={14} aria-hidden="true" />
              {t('customer.pages.checkout.creating')}
            </p>
          )}

          {error && (
            <p className="mt-6 rounded-2xl border border-rust/30 bg-rust/5 p-4 text-sm text-rust">{error}</p>
          )}

          {paymentUrl && (
            <a href={paymentUrl} className="mt-6 w-full btn-primary">
              <ExternalLink size={16} aria-hidden="true" />
              {t('customer.pages.checkout.openPayment')}
            </a>
          )}

          {!isSubmitting && !paymentUrl && (
            <Link to="/basket" className="mt-6 w-full btn-secondary">
              {t('customer.navigation.basket')}
            </Link>
          )}
        </div>

        <aside className="relative bg-base p-8 text-white sm:p-10">
          <p className="font-mono text-xs uppercase tracking-widest text-lime-300">
            {t('customer.pages.checkout.eyebrow')}
          </p>
          <h3 className="display mt-4 text-3xl leading-tight text-white">
            Recolha em loja,<br />sem fila.
          </h3>
          <p className="mt-3 text-sm text-white/65">3 passos simples.</p>

          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-lime-300 text-xs font-bold text-base">1</span>
              Reserva criada
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-lime-300 text-xs font-bold text-base">2</span>
              Recebes QR
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-lime-300 text-xs font-bold text-base">3</span>
              Levantamento
            </li>
          </ul>

          <div className="pointer-events-none absolute -bottom-12 -right-12 hidden h-40 w-40 rounded-full bg-lime-300/20 md:block"></div>
        </aside>
      </section>
    </main>
  )
}
