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
  const [role, setRole] = useState<'customer' | 'merchant'>('customer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [name, setName] = useState('')
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
        ? await authApi.register({ email, password, name })
        : await authApi.login({ email, password })

      tokenStorage.setToken(response.token)
      tokenStorage.setUserRole(role)
      setDemoUser(response.user)
      if (role === 'merchant') {
        navigate('/merchant/shops')
      } else {
        navigate('/')
      }
    } catch {
      setError(t('common.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const useDemoAccess = () => {
    tokenStorage.setToken('local-demo-token')
    tokenStorage.setUserRole(role)
    if (role === 'customer') {
      setDemoUser({
        id: 'local-demo-user',
        email: 'customer@example.com',
        name: 'Customer User',
      })
      navigate('/')
    } else {
      setDemoUser({
        id: 'local-demo-user',
        email: 'merchant@example.com',
        name: 'Merchant User',
      })
      navigate('/merchant/shops')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-6 flex items-start justify-between gap-4">
          <a href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-base font-display text-lg font-bold text-lime-300">
              C
            </span>
            <span className="font-display text-2xl text-ink">Cebola</span>
          </a>
          <LanguageSwitcher />
        </div>

        <div className="sticker grain p-7">
          <h1 className="display text-4xl text-ink">
            {isRegister ? t('login.signUpTitle') : t('login.signInTitle')}
          </h1>
          <p className="mt-2 text-sm leading-6 text-sub">
            {isRegister ? t('login.signUpSubtitle') : t('login.signInSubtitle')}
          </p>

          <div className="mt-6 inline-flex rounded-full bg-muted p-1">
            <button
              type="button"
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                role === 'customer' ? 'bg-base text-white shadow-sm' : 'text-sub hover:text-ink'
              }`}
              onClick={() => setRole('customer')}
            >
              {t('login.customer')}
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                role === 'merchant' ? 'bg-base text-white shadow-sm' : 'text-sub hover:text-ink'
              }`}
              onClick={() => setRole('merchant')}
            >
              {t('login.merchant')}
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {isRegister && (
              <label className="block text-sm font-medium text-ink">
                {t('login.nickname')}
                <input
                  className="mt-1 w-full rounded-full border border-line bg-white px-4 py-2.5 outline-none transition focus:border-base"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  required
                />
              </label>
            )}
            <label className="block text-sm font-medium text-ink">
              {t('login.email')}
              <input
                className="mt-1 w-full rounded-full border border-line bg-white px-4 py-2.5 outline-none transition focus:border-base"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              {t('login.password')}
              <input
                className="mt-1 w-full rounded-full border border-line bg-white px-4 py-2.5 outline-none transition focus:border-base"
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
                  className="mt-1 w-full rounded-full border border-line bg-white px-4 py-2.5 outline-none transition focus:border-base"
                  type="password"
                  value={passwordConfirmation}
                  onChange={event => setPasswordConfirmation(event.target.value)}
                  required
                />
              </label>
            )}

            {error && <p className="text-sm text-rust">{error}</p>}

            <button
              type="submit"
              className="w-full btn-primary disabled:cursor-wait disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isRegister ? <UserPlus size={16} aria-hidden="true" /> : <LogIn size={16} aria-hidden="true" />}
              {isRegister ? t('login.createAccount') : t('login.signIn')}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            <button
              type="button"
              className="w-full btn-secondary"
              onClick={() => navigate(isRegister ? '/login/sign-in' : '/login/sign-up')}
            >
              {isRegister
                ? t('login.switchToLogin')
                : role === 'customer'
                  ? t('login.createAccount')
                  : t('login.switchToRegister')}
            </button>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm text-sub transition hover:border-base hover:text-ink"
              onClick={useDemoAccess}
            >
              <KeyRound size={14} aria-hidden="true" />
              {t('login.demoToken')}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
