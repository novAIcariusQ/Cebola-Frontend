import { useEffect, useState } from 'react'
import { Home, ShoppingBasket } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CUSTOMER_BASKET_EVENT, getCustomerBasketItems } from '@shared/lib'
import { LanguageSwitcher } from '@widgets/language-switcher'

export function CustomerLayout() {
  const { t } = useTranslation()
  const [basketItemsCount, setBasketItemsCount] = useState(() =>
    getCustomerBasketItems().reduce((total, item) => total + item.quantity, 0),
  )

  useEffect(() => {
    const updateBasketItemsCount = () => {
      setBasketItemsCount(getCustomerBasketItems().reduce((total, item) => total + item.quantity, 0))
    }

    window.addEventListener(CUSTOMER_BASKET_EVENT, updateBasketItemsCount)

    return () => {
      window.removeEventListener(CUSTOMER_BASKET_EVENT, updateBasketItemsCount)
    }
  }, [])

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <NavLink
            to="/"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
          >
            <Home size={18} aria-hidden="true" />
            {t('customer.navigation.home')}
          </NavLink>
          <div className="flex items-center gap-2">
            <NavLink
              to="/basket"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 bg-white text-ink transition hover:border-market hover:text-market"
              title={t('customer.navigation.basket')}
              aria-label={t('customer.navigation.basket')}
            >
              <ShoppingBasket size={18} aria-hidden="true" />
              {basketItemsCount > 0 && (
                <span className="absolute -right-2 -top-2 grid min-h-5 min-w-5 place-items-center rounded-full bg-market px-1 text-xs font-semibold text-white">
                  {basketItemsCount}
                </span>
              )}
            </NavLink>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
