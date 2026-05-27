import { useState } from 'react'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CustomerBasketItem } from '@entities/customer'
import {
  clearCustomerBasket,
  decreaseCustomerBasketItem,
  formatCurrency,
  getCustomerBasketItems,
  getCustomerBasketTotal,
  increaseCustomerBasketItem,
  removeCustomerBasketItem,
} from '@shared/lib'

export function CustomerBasketPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<CustomerBasketItem[]>(() => getCustomerBasketItems())
  const total = getCustomerBasketTotal(items)

  const applyItems = (nextItems: CustomerBasketItem[]) => {
    setItems(nextItems)
  }

  const firstShopId = items[0]?.shopId

  if (items.length === 0) {
    return (
      <section className="rounded-md border border-ink/10 bg-white p-6 text-center shadow-soft">
        <ShoppingBag className="mx-auto text-ink/25" size={44} aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-semibold text-ink">{t('customer.pages.basket.title')}</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink/60">{t('customer.pages.basket.empty')}</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-market px-4 py-2 text-sm font-semibold text-white transition hover:bg-market/90"
        >
          {t('customer.pages.basket.continueShopping')}
        </Link>
      </section>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{t('customer.pages.basket.title')}</h1>
            <p className="mt-2 text-sm text-ink/60">{items[0]?.shopTitle}</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-clay/30 px-4 py-2 text-sm font-semibold text-clay transition hover:bg-clay hover:text-white"
            onClick={() => applyItems(clearCustomerBasket())}
          >
            <Trash2 size={16} aria-hidden="true" />
            {t('customer.pages.basket.clear')}
          </button>
        </div>

        <div className="mt-6 divide-y divide-ink/10 rounded-md border border-ink/10">
          {items.map(item => (
            <article key={item.productId} className="grid gap-4 p-4 sm:grid-cols-[72px_1fr_auto] sm:items-center">
              <Link
                to={`/shops/${item.shopId}/products/${item.productId}`}
                className="grid h-18 w-18 place-items-center overflow-hidden rounded-md bg-paper"
              >
                {item.photoUrl ? (
                  <img className="h-full w-full object-cover" src={item.photoUrl} alt="" />
                ) : (
                  <span className="text-2xl font-semibold text-ink/25">{item.title.slice(0, 1).toUpperCase()}</span>
                )}
              </Link>

              <div>
                <Link
                  to={`/shops/${item.shopId}/products/${item.productId}`}
                  className="font-semibold text-ink transition hover:text-market"
                >
                  {item.title}
                </Link>
                <p className="mt-1 text-sm text-ink/60">{formatCurrency(item.price)}</p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="inline-flex items-center rounded-md border border-ink/10">
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center text-ink transition hover:text-market"
                    onClick={() => applyItems(decreaseCustomerBasketItem(item.productId))}
                    aria-label={t('customer.pages.basket.decrease')}
                    title={t('customer.pages.basket.decrease')}
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold text-ink">{item.quantity}</span>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center text-ink transition hover:text-market disabled:opacity-35"
                    disabled={item.quantity >= item.availableQuantity}
                    onClick={() => applyItems(increaseCustomerBasketItem(item.productId))}
                    aria-label={t('customer.pages.basket.increase')}
                    title={t('customer.pages.basket.increase')}
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </div>
                <strong className="w-20 text-right text-sm text-market">
                  {formatCurrency(item.price * item.quantity)}
                </strong>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-clay transition hover:bg-clay hover:text-white"
                  onClick={() => applyItems(removeCustomerBasketItem(item.productId))}
                  aria-label={t('common.remove')}
                  title={t('common.remove')}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold uppercase text-ink/45">{t('customer.pages.basket.summary')}</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4 text-ink/70">
              <span>{t('customer.pages.basket.items')}</span>
              <strong className="text-ink">{items.reduce((count, item) => count + item.quantity, 0)}</strong>
            </div>
            <div className="flex justify-between gap-4 border-t border-ink/10 pt-3 text-base">
              <span className="font-semibold text-ink">{t('customer.pages.basket.total')}</span>
              <strong className="text-market">{formatCurrency(total)}</strong>
            </div>
          </div>
          <Link
            to="/checkout"
            className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-market px-4 py-2 text-sm font-semibold text-white transition hover:bg-market/90"
          >
            {t('customer.pages.basket.buy')}
          </Link>
        </section>

        {firstShopId && (
          <Link
            to={`/shops/${firstShopId}/products`}
            className="inline-flex w-full items-center justify-center rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-market hover:text-market"
          >
            {t('customer.pages.basket.continueShopping')}
          </Link>
        )}
      </aside>
    </div>
  )
}
