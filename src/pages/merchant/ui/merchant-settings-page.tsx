import { FormEvent, useEffect, useState } from 'react'
import { KeyRound, LogOut, Pencil, Save, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { User } from '@entities/user'
import { authApi } from '@shared/api'
import { getDemoUser, setDemoUser, tokenStorage } from '@shared/lib'

export function MerchantSettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [nameDraft, setNameDraft] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [isSavingName, setIsSavingName] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      try {
        const apiUser = await authApi.me()

        if (!isMounted) return

        setUser(apiUser)
        setNameDraft(apiUser.name)
        setDemoUser(apiUser)
      } catch {
        if (!isMounted) return

        const demoUser = getDemoUser()
        setUser(demoUser)
        setNameDraft(demoUser.name)
      }
    }

    void loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  const logout = () => {
    tokenStorage.clearToken()
    navigate('/login/sign-in')
  }

  const saveName = async () => {
    if (!user) return

    setIsSavingName(true)
    setMessage(null)
    setError(null)

    try {
      const updatedUser = await authApi.updateProfile({ name: nameDraft })
      setUser(updatedUser)
      setDemoUser(updatedUser)
    } catch {
      const updatedUser = setDemoUser({ ...user, name: nameDraft })
      setUser(updatedUser)
    } finally {
      setIsEditingName(false)
      setMessage(t('merchant.pages.settings.nameSaved'))
      setIsSavingName(false)
    }
  }

  const cancelNameEdit = () => {
    setNameDraft(user?.name ?? '')
    setIsEditingName(false)
  }

  const changePassword = async (event: FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setError(null)

    if (newPassword !== passwordConfirmation) {
      setError(t('login.passwordMismatch'))
      return
    }

    setIsChangingPassword(true)

    try {
      await authApi.changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setPasswordConfirmation('')
      setMessage(t('merchant.pages.settings.passwordChanged'))
    } catch {
      setError(t('common.error'))
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">{t('merchant.pages.settings.title')}</h1>
        <p className="mt-2 text-sm leading-6 text-ink/65">{t('merchant.pages.settings.description')}</p>

        <div className="mt-6 rounded-md border border-ink/10 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase text-ink/45">{t('login.name')}</span>
            {isEditingName ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink transition hover:border-clay hover:text-clay"
                  onClick={cancelNameEdit}
                  title={t('common.cancel')}
                  aria-label={t('common.cancel')}
                >
                  <X size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-market text-white disabled:cursor-wait disabled:opacity-60"
                  onClick={() => void saveName()}
                  disabled={isSavingName}
                  title={t('common.save')}
                  aria-label={t('common.save')}
                >
                  <Save size={16} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink transition hover:border-market hover:text-market"
                onClick={() => setIsEditingName(true)}
                title={t('merchant.products.edit')}
                aria-label={t('merchant.products.edit')}
              >
                <Pencil size={16} aria-hidden="true" />
              </button>
            )}
          </div>
          {isEditingName ? (
            <input
              className="w-full rounded-md border border-ink/15 px-3 py-2 text-xl font-semibold outline-none transition focus:border-market"
              value={nameDraft}
              onChange={event => setNameDraft(event.target.value)}
              required
            />
          ) : (
            <h2 className="text-2xl font-semibold text-ink">{user?.name ?? t('common.loading')}</h2>
          )}
        </div>

        {message && <p className="mt-4 text-sm text-market">{message}</p>}
        {error && <p className="mt-4 text-sm text-clay">{error}</p>}
      </section>

      <aside className="space-y-6">
        <form className="rounded-md border border-ink/10 bg-white p-5 shadow-soft" onSubmit={changePassword}>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase text-ink/45">
            <KeyRound size={16} aria-hidden="true" />
            {t('merchant.pages.settings.changePassword')}
          </h2>
          <div className="mt-4 grid gap-3">
            <label className="block text-sm font-medium text-ink">
              {t('merchant.pages.settings.currentPassword')}
              <input
                className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
                type="password"
                value={currentPassword}
                onChange={event => setCurrentPassword(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              {t('merchant.pages.settings.newPassword')}
              <input
                className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
                type="password"
                value={newPassword}
                onChange={event => setNewPassword(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              {t('login.passwordConfirmation')}
              <input
                className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
                type="password"
                value={passwordConfirmation}
                onChange={event => setPasswordConfirmation(event.target.value)}
                required
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-market px-4 py-2 text-sm font-semibold text-white transition hover:bg-market/90 disabled:cursor-wait disabled:opacity-60"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? t('common.saving') : t('merchant.pages.settings.changePassword')}
          </button>
        </form>

        <section className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold uppercase text-ink/45">{t('merchant.pages.settings.account')}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-ink/45">{t('login.email')}</dt>
              <dd className="font-medium text-ink">{user?.email ?? '-'}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-clay/30 px-4 py-2 text-sm font-semibold text-clay transition hover:bg-clay hover:text-white"
            onClick={logout}
          >
            <LogOut size={16} aria-hidden="true" />
            {t('common.logout')}
          </button>
        </section>
      </aside>
    </div>
  )
}
