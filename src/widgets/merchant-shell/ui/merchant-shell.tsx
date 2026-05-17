import type { ReactNode } from 'react'
import { LogOut, Store } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@widgets/language-switcher'

export type MerchantShellTab = {
  id: string
  label: string
  onClick: () => void
}

type MerchantShellProps = {
  tabs: MerchantShellTab[]
  children: ReactNode
  onLogout: () => void
}

export function MerchantShell({ tabs, children, onLogout }: MerchantShellProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-market text-white">
              <Store size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">{t('merchant.title')}</h1>
              <p className="truncate text-sm text-ink/60">{t('merchant.subtitle')}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 bg-white text-ink shadow-sm transition hover:border-clay hover:text-clay"
              onClick={onLogout}
              title={t('common.logout')}
              aria-label={t('common.logout')}
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        <nav className="border-t border-ink/10 bg-white">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className="h-12 shrink-0 border-b-2 border-transparent px-4 text-sm font-medium text-ink/65 transition hover:border-market hover:text-market"
                onClick={tab.onClick}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
