import { FormEvent, useState } from 'react'
import { KeyRound, LogIn, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@shared/api'
import { setDemoUser, tokenStorage } from '@shared/lib'
import { LanguageSwitcher } from '@widgets/language-switcher'

type LoginFormProps = {
  mode?: 'sign-in' | 'sign-up'
}

export function LoginForm({ mode = 'sign-in' }: LoginFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isRegister = mode === 'sign-up'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [nickname, setNickname] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (isRegister && password !== passwordConfirmation) {
      setError(t('login.passwordMismatch'))
      return
    }

    setIsSubmitting(true)

    try {
      const response = isRegister
        ? await authApi.register({ email, password, nickname })
        : await authApi.login({ email, password })

      tokenStorage.setToken(response.token)
      setDemoUser(response.user)
      navigate('/merchant/shops')
    } catch {
      setError(t('common.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const useDemoAccess = () => {
    tokenStorage.setToken('local-demo-token')
    navigate('/merchant/shops')
  }

  return (
    <section className="w-full max-w-md rounded-md border border-ink/10 bg-white p-6 shadow-soft">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            {isRegister ? t('login.signUpTitle') : t('login.signInTitle')}
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            {isRegister ? t('login.signUpSubtitle') : t('login.signInSubtitle')}
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      <form className="space-y-4" onSubmit={submit}>
        {isRegister && (
          <label className="block text-sm font-medium text-ink">
            {t('login.nickname')}
            <input
              className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
              value={nickname}
              onChange={event => setNickname(event.target.value)}
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
        {isRegister && (
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
        )}
        {error && <p className="text-sm text-clay">{error}</p>}
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
          className="rounded-md border border-ink/10 px-4 py-2 text-sm font-medium text-market transition hover:border-market"
          onClick={() => navigate(isRegister ? '/login/sign-in' : '/login/sign-up')}
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
