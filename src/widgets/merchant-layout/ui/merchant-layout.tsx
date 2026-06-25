import { useEffect, useState } from 'react'
import { Home, Settings, Sparkles } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@shared/api'
import type { User } from '@entities/user'
import { getDemoUser, tokenStorage } from '@shared/lib'
import { LanguageSwitcher } from '@widgets/language-switcher'

export function MerchantLayout() {
  const { t } = useTranslation()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      if (!tokenStorage.getToken()) return

      try {
        const apiUser = await authApi.me()
        if (isMounted) {
          setUser(apiUser)
        }
      } catch {
        if (isMounted) {
          setUser(getDemoUser())
        }
      }
    }

    void loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-muted text-ink">
      <div className="sticky top-4 z-40 px-4">
        <nav className="pill mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full px-3 py-2">
          <div className="flex items-center gap-4 pl-2">
            <NavLink to="/merchant/shops" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-base font-display text-lg font-bold text-lime-300">
                C
              </span>
              <span className="font-semibold tracking-tight text-ink">Cebola · Merchant</span>
            </NavLink>
          </div>

          <div className="hidden items-center gap-1 text-sm md:flex">
            <NavLink
              to="/merchant/shops"
              end
              className={({ isActive }) =>
                isActive
                  ? 'rounded-full bg-base px-3 py-1.5 font-semibold text-white'
                  : 'rounded-full px-3 py-1.5 font-medium text-ink/80 hover:bg-muted'
              }
            >
              {t('merchant.navigation.home')}
            </NavLink>
          </div>

          <div className="flex items-center gap-2 pr-1">
            {user?.name && <span className="hidden text-sm font-medium text-ink/80 sm:inline">{user.name}</span>}

            <NavLink
              to="/subscription"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-muted"
              title={t('customer.pages.subscription.title')}
              aria-label={t('customer.pages.subscription.title')}
            >
              <Sparkles size={18} className="text-lime-500" aria-hidden="true" />
            </NavLink>
            <NavLink
              to="/merchant/settings"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-muted"
              title={t('merchant.navigation.settings')}
              aria-label={t('merchant.navigation.settings')}
            >
              <Settings size={18} aria-hidden="true" />
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
