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
      <section className="sticker p-10 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-muted">
          <ShoppingBag className="text-sub/60" size={36} aria-hidden="true" />
        </div>
        <h1 className="display mt-6 text-5xl text-ink">{t('customer.pages.basket.title')}</h1>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-sub">
          {t('customer.pages.basket.empty')}
        </p>
        <Link to="/" className="mt-8 btn-primary">
          {t('customer.pages.basket.continueShopping')}
        </Link>
      </section>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-sub">Cesto</p>
            <h1 className="display mt-1 text-5xl text-ink">{t('customer.pages.basket.title')}</h1>
            <p className="mt-2 text-sm text-sub">{items[0]?.shopTitle}</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-rust transition hover:bg-rust hover:text-white"
            onClick={() => applyItems(clearCustomerBasket())}
          >
            <Trash2 size={16} aria-hidden="true" />
            {t('customer.pages.basket.clear')}
          </button>
        </div>

        <div className="sticker divide-y divide-line overflow-hidden p-0">
          {items.map(item => (
            <article key={item.productId} className="flex items-center gap-4 p-4">
              <Link
                to={`/shops/${item.shopId}/products/${item.productId}`}
                className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-muted"
              >
                {item.photoUrl ? (
                  <img className="h-full w-full object-cover" src={item.photoUrl} alt="" />
                ) : (
                  <span className="display text-2xl text-ink/30">
                    {item.title.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/shops/${item.shopId}/products/${item.productId}`}
                  className="block truncate font-semibold text-ink hover:text-base"
                >
                  {item.title}
                </Link>
                <p className="mt-0.5 font-mono text-xs text-sub">{formatCurrency(item.price)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink transition hover:border-base"
                  onClick={() => applyItems(decreaseCustomerBasketItem(item.productId))}
                  aria-label={t('customer.pages.basket.decrease')}
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <span className="w-8 text-center font-mono text-sm font-semibold text-ink">{item.quantity}</span>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink transition hover:border-base disabled:opacity-30"
                  disabled={item.quantity >= item.availableQuantity}
                  onClick={() => applyItems(increaseCustomerBasketItem(item.productId))}
                  aria-label={t('customer.pages.basket.increase')}
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>

              <strong className="w-20 text-right font-mono text-sm font-semibold text-ink">
                {formatCurrency(item.price * item.quantity)}
              </strong>

              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full text-rust transition hover:bg-rust hover:text-white"
                onClick={() => applyItems(removeCustomerBasketItem(item.productId))}
                aria-label={t('common.remove')}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="sticker p-6">
          <h2 className="font-mono text-xs uppercase tracking-wider text-sub">
            {t('customer.pages.basket.summary')}
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 text-sub">
              <span>{t('customer.pages.basket.items')}</span>
              <strong className="font-mono text-ink">
                {items.reduce((count, item) => count + item.quantity, 0)}
              </strong>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-4">
              <span className="font-semibold text-ink">{t('customer.pages.basket.total')}</span>
              <strong className="display text-3xl text-base">{formatCurrency(total)}</strong>
            </div>
          </div>

          <Link to="/checkout" className="mt-6 w-full btn-primary">
            {t('customer.pages.basket.buy')}
          </Link>

          <p className="mt-3 text-center text-xs text-sub">
            Pague no levantamento · Sem cartão online
          </p>
        </section>

        {firstShopId && (
          <Link to={`/shops/${firstShopId}/products`} className="w-full btn-secondary">
            {t('customer.pages.basket.continueShopping')}
          </Link>
        )}
      </aside>
    </div>
  )
}
