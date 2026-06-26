import { useEffect, useState } from 'react'
import { Home, Settings, ShoppingBasket, Sparkles } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi, subscriptionApi } from '@shared/api'
import type { User } from '@entities/user'
import {
  CUSTOMER_BASKET_EVENT,
  getCustomerBasketQuantity,
  getDemoUser,
  setDemoUser,
  tokenStorage,
  USER_PROFILE_EVENT,
} from '@shared/lib'
import { LanguageSwitcher } from '@widgets/language-switcher'

export function CustomerLayout() {
  const { t } = useTranslation()
  const [basketItemsCount, setBasketItemsCount] = useState(() => getCustomerBasketQuantity())
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!tokenStorage.getToken())
  const [userRole, setUserRole] = useState(() => tokenStorage.getUserRole())
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      if (!tokenStorage.getToken()) {
        if (isMounted) setUser(null)
        return
      }

      try {
        const [apiUser, sub] = await Promise.all([
          authApi.me(),
          subscriptionApi.getSubscription().catch(() => null),
        ])

        let planName: 'free' | 'premium' | 'basic' | 'pro' = 'free'
        if (sub && sub.status === 'active') {
          const rawPlan = sub.planId.replace('plan-', '')
          if (rawPlan === 'pro') {
            planName = 'pro'
          } else if (rawPlan === 'basic') {
            planName = userRole === 'customer' ? 'premium' : 'basic'
          }
        }

        const userWithSub: User = {
          ...apiUser,
          subscription: {
            plan: planName,
            status: planName === 'free' ? 'inactive' : 'active',
            expiresAt: sub && sub.expiresAt ? sub.expiresAt.split('T')[0] : undefined,
          },
        }

        if (isMounted) {
          setUser(userWithSub)
          setDemoUser(userWithSub)
        }
      } catch {
        if (isMounted) {
          setUser(getDemoUser())
        }
      }
    }

    const handleProfileUpdate = () => {
      if (isMounted) {
        setIsAuthenticated(!!tokenStorage.getToken())
        setUserRole(tokenStorage.getUserRole())
        void loadUser()
      }
    }

    void loadUser()

    const updateBasketItemsCount = () => {
      setBasketItemsCount(getCustomerBasketQuantity())
    }

    window.addEventListener(CUSTOMER_BASKET_EVENT, updateBasketItemsCount)
    window.addEventListener(USER_PROFILE_EVENT, handleProfileUpdate)

    return () => {
      isMounted = false
      window.removeEventListener(CUSTOMER_BASKET_EVENT, updateBasketItemsCount)
      window.removeEventListener(USER_PROFILE_EVENT, handleProfileUpdate)
    }
  }, [])

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <NavLink
              to="/"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
            >
              <Home size={18} aria-hidden="true" />
              {t('customer.navigation.home')}
            </NavLink>

            {(!isAuthenticated || userRole !== 'customer') && (
              <div className="flex items-center gap-2 border-l border-ink/10 pl-4">
                <NavLink
                  to="/login/sign-in"
                  className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
                >
                  {t('login.signInTitle')}
                </NavLink>
                <NavLink
                  to="/login/sign-up"
                  className="inline-flex items-center justify-center rounded-md bg-market px-3 py-2 text-sm font-semibold text-white transition hover:bg-market/90"
                >
                  {t('login.createAccount')}
                </NavLink>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && userRole === 'customer' && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-ink">
                  {user?.name || ''}
                </span>
                <NavLink
                  to="/subscription"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 bg-white text-ink transition hover:border-market hover:text-market"
                  title={t('customer.pages.subscription.title')}
                  aria-label={t('customer.pages.subscription.title')}
                >
                  <Sparkles size={18} className="text-market" aria-hidden="true" />
                </NavLink>
                <NavLink
                  to="/settings"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 bg-white text-ink transition hover:border-market hover:text-market"
                  title={t('merchant.navigation.settings')}
                  aria-label={t('merchant.navigation.settings')}
                >
                  <Settings size={18} aria-hidden="true" />
                </NavLink>
              </div>
            )}

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
