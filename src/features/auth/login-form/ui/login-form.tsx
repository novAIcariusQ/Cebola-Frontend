import { FormEvent, useState } from 'react'
import { KeyRound, LogIn, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@shared/api'
import { tokenStorage } from '@shared/lib/token-storage'
import { LanguageSwitcher } from '@widgets/language-switcher'

export function LoginForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [remember, setRemember] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = isRegister
        ? await authApi.register({ email, password, name })
        : await authApi.login({ email, password })

      tokenStorage.setToken(response.token, remember)
      navigate('/merchant')
    } finally {
      setIsSubmitting(false)
    }
  }

  const useDemoAccess = () => {
    tokenStorage.setToken('local-demo-token')
    navigate('/merchant')
  }

  return (
    <section className="w-full max-w-md rounded-md border border-ink/10 bg-white p-6 shadow-soft">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{t('login.title')}</h1>
          <p className="mt-2 text-sm leading-6 text-ink/65">{t('login.subtitle')}</p>
        </div>
        <LanguageSwitcher />
      </div>

      <form className="space-y-4" onSubmit={submit}>
        {isRegister && (
          <label className="block text-sm font-medium text-ink">
            {t('login.name')}
            <input
              className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
              value={name}
              onChange={event => setName(event.target.value)}
              required
            />
          </label>
        )}
        <label className="block text-sm font-medium text-ink">
          {t('login.email')}
          <input
            className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          {t('login.password')}
          <input
            className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            required
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            className="h-4 w-4 accent-market"
            checked={remember}
            onChange={event => setRemember(event.target.checked)}
          />
          {t('login.remember')}
        </label>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-market px-4 py-3 text-sm font-semibold text-white transition hover:bg-market/90 disabled:cursor-wait disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isRegister ? <UserPlus size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
          {isRegister ? t('login.createAccount') : t('login.signIn')}
        </button>
      </form>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          className="text-sm font-medium text-market"
          onClick={() => setIsRegister(value => !value)}
        >
          {isRegister ? t('login.switchToLogin') : t('login.switchToRegister')}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/10 px-4 py-2 text-sm text-ink/75 transition hover:border-market hover:text-market"
          onClick={useDemoAccess}
        >
          <KeyRound size={16} aria-hidden="true" />
          {t('login.demoToken')}
        </button>
      </div>
    </section>
  )
}
