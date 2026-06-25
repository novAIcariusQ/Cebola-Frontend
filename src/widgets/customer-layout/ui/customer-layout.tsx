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
    <div className="min-h-screen bg-muted text-ink">
      {/* Floating pill navigation */}
      <div className="sticky top-4 z-40 px-4">
        <nav className="pill mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full px-3 py-2">
          <div className="flex items-center gap-4 pl-2">
            <NavLink to="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-base font-display text-lg font-bold text-lime-300">
                C
              </span>
              <span className="font-semibold tracking-tight text-ink">Cebola</span>
            </NavLink>
          </div>

          <div className="hidden items-center gap-1 text-sm md:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? 'rounded-full bg-base px-3 py-1.5 font-semibold text-white'
                  : 'rounded-full px-3 py-1.5 font-medium text-ink/80 hover:bg-muted'
              }
            >
              {t('customer.navigation.home')}
            </NavLink>
          </div>

          <div className="flex items-center gap-2 pr-1">
            {(!isAuthenticated || userRole !== 'customer') && (
              <>
                <NavLink to="/login/sign-in" className="rounded-full px-3 py-1.5 text-sm font-medium text-ink/80 hover:bg-muted">
                  {t('login.signInTitle')}
                </NavLink>
                <NavLink to="/login/sign-up" className="rounded-full bg-base px-4 py-2 text-sm font-semibold text-white hover:bg-ink">
                  {t('login.createAccount')}
                </NavLink>
              </>
            )}

            {isAuthenticated && userRole === 'customer' && (
              <>
                <NavLink
                  to="/subscription"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-muted"
                  title={t('customer.pages.subscription.title')}
                  aria-label={t('customer.pages.subscription.title')}
                >
                  <Sparkles size={18} className="text-lime-500" aria-hidden="true" />
                </NavLink>
                <NavLink
                  to="/settings"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-muted"
                  title={t('merchant.navigation.settings')}
                  aria-label={t('merchant.navigation.settings')}
                >
                  <Settings size={18} aria-hidden="true" />
                </NavLink>
              </>
            )}

            <NavLink
              to="/basket"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-muted"
              title={t('customer.navigation.basket')}
              aria-label={t('customer.navigation.basket')}
            >
              <ShoppingBasket size={18} aria-hidden="true" />
              {basketItemsCount > 0 && (
                <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-lime-300 px-1 text-[10px] font-bold text-base">
                  {basketItemsCount}
                </span>
              )}
            </NavLink>

            <LanguageSwitcher />
          </div>
        </nav>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <Outlet />
      </main>
    </div>
  )
}
