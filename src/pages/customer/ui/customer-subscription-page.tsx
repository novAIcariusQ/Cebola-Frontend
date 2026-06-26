import { useEffect, useState } from 'react'
import { ArrowLeft, Check, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi, subscriptionApi } from '@shared/api'
import type { SubscriptionPlan } from '@shared/api'
import type { User } from '@entities/user'
import { getDemoUser, setDemoUser, tokenStorage } from '@shared/lib'

export function CustomerSubscriptionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const userRole = tokenStorage.getUserRole()
  const isMerchant = userRole === 'merchant'
  const currentPlan = user?.subscription?.plan ?? 'free'

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (!tokenStorage.getToken()) return
      try {
        const [apiUser, sub, fetchedPlans] = await Promise.all([
          authApi.me(),
          subscriptionApi.getSubscription().catch(() => null),
          subscriptionApi.getPlans().catch(() => [] as SubscriptionPlan[]),
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
            expiresAt: sub?.expiresAt ? sub.expiresAt.split('T')[0] : undefined,
          },
        }

        if (isMounted) {
          setUser(userWithSub)
          setDemoUser(userWithSub)
          setPlans(fetchedPlans)
        }
      } catch {
        if (isMounted) setUser(getDemoUser())
      }
    }

    void loadData()
    return () => { isMounted = false }
  }, [])

  const handleUpgrade = async (plan: 'premium' | 'basic' | 'pro') => {
    if (!tokenStorage.getToken()) {
      navigate('/login/sign-in')
      return
    }
    if (!user) return

    setIsSubmitting(true)
    try {
      const planId = plan === 'pro' ? 'plan-pro' : 'plan-basic'
      const sub = await subscriptionApi.subscribe(planId)

      const updatedUser: User = {
        ...user,
        subscription: {
          plan,
          status: 'active',
          expiresAt: sub.expiresAt ? sub.expiresAt.split('T')[0] : undefined,
        },
      }

      setDemoUser(updatedUser)
      setUser(updatedUser)
      setSuccess(true)
    } catch (err) {
      console.error('Failed to subscribe:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!user) return
    setIsSubmitting(true)
    try {
      await subscriptionApi.cancel()

      const updatedUser: User = {
        ...user,
        subscription: { plan: 'free', status: 'inactive' },
      }

      setDemoUser(updatedUser)
      setUser(updatedUser)
    } catch (err) {
      console.error('Failed to cancel subscription:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper: get price from fetched plans or fall back to hardcoded value
  const getPlanPrice = (planId: string, fallback: string): string => {
    const found = plans.find(p => p.id === planId)
    return found ? `€${found.price.toFixed(2)}` : fallback
  }

  if (success) {
    return (
      <section className="mx-auto max-w-md rounded-md border border-ink/10 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-market/10 text-market">
          <Sparkles size={32} />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-ink">{t('customer.pages.subscription.successTitle')}</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          {isMerchant
            ? t('customer.pages.subscription.successSubtitleMerchant')
            : t('customer.pages.subscription.successSubtitle')}
        </p>
        <button
          type="button"
          onClick={() => navigate(isMerchant ? '/merchant/shops' : '/')}
          className="mt-8 inline-flex w-full justify-center rounded-md bg-market px-4 py-3 text-sm font-semibold text-white transition hover:bg-market/90"
        >
          {isMerchant ? t('merchant.navigation.home') : t('customer.pages.subscription.backHome')}
        </button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-5xl rounded-md border border-ink/10 bg-white p-6 shadow-soft">
      <Link
        to={isMerchant ? '/merchant/shops' : '/'}
        className="inline-flex items-center gap-1 text-sm font-medium text-ink/65 transition hover:text-market mb-6"
      >
        <ArrowLeft size={16} />
        {isMerchant ? t('common.back') : t('customer.pages.basket.continueShopping')}
      </Link>

      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-market/10 px-3 py-1 text-xs font-semibold text-market">
          <Sparkles size={12} />
          {isMerchant ? t('customer.pages.subscription.merchantTitle') : t('customer.pages.subscription.title')}
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {isMerchant ? t('customer.pages.subscription.merchantTitle') : t('customer.pages.subscription.title')}
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          {isMerchant ? t('customer.pages.subscription.merchantSubtitle') : t('customer.pages.subscription.subtitle')}
        </p>
      </div>

      {isMerchant ? (
        /* Merchant Subscriptions Tiers */
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {/* Basic Plan */}
          <div className={`relative flex flex-col justify-between rounded-lg border p-6 transition-all ${currentPlan === 'basic'
              ? 'border-market bg-market/5 shadow-sm'
              : 'border-ink/10 hover:border-ink/20'
            }`}>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">{t('customer.pages.subscription.basicPlan')}</h2>
                {currentPlan === 'basic' && (
                  <span className="rounded bg-market px-2 py-0.5 text-[10px] font-semibold text-white">
                    {t('customer.pages.subscription.activeStatus')}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold tracking-tight text-ink">{getPlanPrice('plan-basic', '€9.99')}</span>
                <span className="ml-1 text-sm font-medium text-ink/65">/mo</span>
              </div>
              <div className="mt-6 border-t border-ink/10 pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/65">
                  {t('customer.pages.subscription.featuresTitleMerchant')}
                </h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-2.5 text-sm text-ink/75">
                    <Check size={16} className="mt-0.5 text-market" />
                    <span>{t('customer.pages.subscription.merchantBasicFeature1')}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-ink/75">
                    <Check size={16} className="mt-0.5 text-market" />
                    <span>{t('customer.pages.subscription.merchantBasicFeature2')}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-ink/75">
                    <Check size={16} className="mt-0.5 text-market" />
                    <span>{t('customer.pages.subscription.merchantBasicFeature3')}</span>
                  </li>
                </ul>
              </div>
            </div>
            {currentPlan === 'basic' ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCancel}
                className="mt-8 w-full rounded-md border border-clay px-4 py-2 text-sm font-semibold text-clay transition hover:bg-clay/5 disabled:opacity-50"
              >
                {isSubmitting ? t('common.loading') : t('customer.pages.subscription.cancelBtn')}
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleUpgrade('basic')}
                className="mt-8 w-full rounded-md bg-market/10 px-4 py-2 text-sm font-semibold text-market transition hover:bg-market/20 disabled:opacity-50"
              >
                {isSubmitting ? t('common.loading') : t('customer.pages.subscription.upgradeBtnBasic')}
              </button>
            )}
          </div>

          {/* Pro Plan */}
          <div className={`relative flex flex-col justify-between rounded-lg border p-6 transition-all ${currentPlan === 'pro'
              ? 'border-market bg-market/5 shadow-sm'
              : 'border-ink/10 hover:border-ink/20'
            }`}>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">{t('customer.pages.subscription.proPlan')}</h2>
                {currentPlan === 'pro' && (
                  <span className="rounded bg-market px-2 py-0.5 text-[10px] font-semibold text-white">
                    {t('customer.pages.subscription.activeStatus')}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold tracking-tight text-ink">{getPlanPrice('plan-pro', '€29.99')}</span>
                <span className="ml-1 text-sm font-medium text-ink/65">/mo</span>
              </div>
              <div className="mt-6 border-t border-ink/10 pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/65">
                  {t('customer.pages.subscription.featuresTitleMerchant')}
                </h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-2.5 text-sm text-ink/75">
                    <Check size={16} className="mt-0.5 text-market" />
                    <span>{t('customer.pages.subscription.merchantProFeature1')}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-ink/75">
                    <Check size={16} className="mt-0.5 text-market" />
                    <span>{t('customer.pages.subscription.merchantProFeature2')}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-ink/75">
                    <Check size={16} className="mt-0.5 text-market" />
                    <span>{t('customer.pages.subscription.merchantProFeature3')}</span>
                  </li>
                </ul>
              </div>
            </div>
            {currentPlan === 'pro' ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCancel}
                className="mt-8 w-full rounded-md border border-clay px-4 py-2 text-sm font-semibold text-clay transition hover:bg-clay/5 disabled:opacity-50"
              >
                {isSubmitting ? t('common.loading') : t('customer.pages.subscription.cancelBtn')}
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleUpgrade('pro')}
                className="mt-8 w-full rounded-md bg-market/10 px-4 py-2 text-sm font-semibold text-market transition hover:bg-market/20 disabled:opacity-50"
              >
                {isSubmitting ? t('common.loading') : t('customer.pages.subscription.upgradeBtnPro')}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Customer Subscription Plans */
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className={`relative flex flex-col justify-between rounded-lg border p-6 transition-all ${currentPlan === 'free'
              ? 'border-ink/20 bg-paper/30 shadow-sm'
              : 'border-ink/10 hover:border-ink/20'
            }`}>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-ink">{t('customer.pages.subscription.freePlan')}</h2>
                {currentPlan === 'free' && (
                  <span className="rounded bg-ink/10 px-2.5 py-0.5 text-xs font-semibold text-ink">
                    {t('customer.pages.subscription.currentPlan')}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold tracking-tight text-ink">€0</span>
                <span className="ml-1 text-sm font-medium text-ink/65">/mo</span>
              </div>
              <ul className="mt-6 space-y-3.5">
                <li className="flex items-start gap-3.5 text-sm text-ink/75">
                  <Check size={18} className="mt-0.5 text-ink/40" />
                  <span>{t('customer.pages.subscription.feature4')}</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              disabled
              className="mt-8 w-full rounded-md border border-ink/10 py-2.5 text-sm font-semibold text-ink/40 disabled:cursor-not-allowed"
            >
              {currentPlan === 'free' ? t('customer.pages.subscription.currentPlan') : t('customer.pages.subscription.freePlan')}
            </button>
          </div>

          {/* Premium Plan */}
          <div className={`relative flex flex-col justify-between rounded-lg border-2 p-6 transition-all shadow-sm ${currentPlan === 'premium'
              ? 'border-market bg-market/5'
              : 'border-market/40 hover:border-market'
            }`}>
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-bold text-ink">{t('customer.pages.subscription.premiumPlan')}</h2>
                  <Sparkles size={16} className="text-market" />
                </div>
                {currentPlan === 'premium' && (
                  <span className="rounded bg-market px-2.5 py-0.5 text-xs font-semibold text-white">
                    {t('customer.pages.subscription.activeStatus')}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold tracking-tight text-ink">{getPlanPrice('plan-basic', '€9.99')}</span>
                <span className="ml-1 text-sm font-medium text-ink/65">/mo</span>
              </div>
              <p className="mt-3 text-xs text-ink/50">{t('customer.pages.subscription.adDescription')}</p>
              <div className="mt-6 border-t border-ink/10 pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/65">
                  {t('customer.pages.subscription.featuresTitle')}
                </h3>
                <ul className="mt-4 space-y-3.5">
                  <li className="flex items-start gap-3.5 text-sm text-ink/75">
                    <Check size={18} className="mt-0.5 text-market" />
                    <span>{t('customer.pages.subscription.feature1')}</span>
                  </li>
                  <li className="flex items-start gap-3.5 text-sm text-ink/75">
                    <Check size={18} className="mt-0.5 text-market" />
                    <span>{t('customer.pages.subscription.feature2')}</span>
                  </li>
                  <li className="flex items-start gap-3.5 text-sm text-ink/75">
                    <Check size={18} className="mt-0.5 text-market" />
                    <span>{t('customer.pages.subscription.feature3')}</span>
                  </li>
                  <li className="flex items-start gap-3.5 text-sm text-ink/75">
                    <Check size={18} className="mt-0.5 text-market" />
                    <span>{t('customer.pages.subscription.feature4')}</span>
                  </li>
                </ul>
              </div>
            </div>
            {currentPlan === 'premium' ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCancel}
                className="mt-8 w-full rounded-md border border-clay px-4 py-2.5 text-sm font-semibold text-clay transition hover:bg-clay/5 disabled:opacity-50"
              >
                {isSubmitting ? t('common.loading') : t('customer.pages.subscription.cancelBtn')}
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleUpgrade('premium')}
                className="mt-8 w-full rounded-md bg-market px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-market/90 disabled:opacity-50"
              >
                {isSubmitting ? t('common.loading') : t('customer.pages.subscription.upgradeBtn')}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
