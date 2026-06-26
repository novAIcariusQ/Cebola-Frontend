import { DragEvent, FormEvent, useEffect, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Shop } from '@entities/shop'
import type { User } from '@entities/user'
import { merchantApi, uploadApi, authApi } from '@shared/api'
import { upsertDemoMerchantShop, getDemoUser, tokenStorage } from '@shared/lib'

export function MerchantShopCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadUser = async () => {
      try {
        const apiUser = await authApi.me()
        if (isMounted) setUser(apiUser)
      } catch {
        if (isMounted) setUser(getDemoUser())
      }
    }
    void loadUser()
    return () => {
      isMounted = false
    }
  }, [])

  const currentPlan = user?.subscription?.plan ?? 'free'
  const hasMerchantSubscription = ['basic', 'standard', 'pro'].includes(currentPlan)

  useEffect(() => {
    if (user && !hasMerchantSubscription) {
      navigate('/subscription')
    }
  }, [user, hasMerchantSubscription, navigate])

  const applyLogoFile = async (file: File) => {
    setMessage(null)
    const previewUrl = URL.createObjectURL(file)
    setLogoPreview(previewUrl)

    try {
      const response = await uploadApi.uploadImage(file)
      setLogoUrl(response.url)
    } catch {
      setLogoUrl(previewUrl)
    }
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]

    if (file) {
      void applyLogoFile(file)
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const fallbackShop: Shop = {
      id: `shop-${Date.now()}`,
      name,
      description,
      logoUrl: logoUrl || null,
      isActive: true,
    }

    try {
      const shop = await merchantApi.createShop({
        name,
        description,
        logoUrl,
        isActive: true,
      })

      upsertDemoMerchantShop(shop)
      navigate(`/merchant/shops/${shop.id}`)
    } catch {
      setMessage(t('common.error'))
      upsertDemoMerchantShop(fallbackShop)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[360px_1fr]" onSubmit={submit}>
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">{t('merchant.pages.createShop.title')}</h1>
        <p className="mt-2 text-sm leading-6 text-ink/65">{t('merchant.pages.createShop.description')}</p>
        <label
          className="mt-6 grid min-h-64 cursor-pointer place-items-center rounded-md border border-dashed border-ink/20 bg-paper p-4 text-center transition hover:border-market"
          onDragOver={event => event.preventDefault()}
          onDrop={handleDrop}
        >
          {logoPreview || logoUrl ? (
            <img className="max-h-56 w-full rounded-md object-contain" src={logoPreview || logoUrl} alt="" />
          ) : (
            <span className="grid gap-3 text-sm text-ink/60">
              <ImagePlus className="mx-auto text-market" size={28} aria-hidden="true" />
              {t('merchant.pages.createShop.logoDrop')}
            </span>
          )}
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={event => {
              const file = event.target.files?.[0]
              if (file) void applyLogoFile(file)
              event.target.value = ''
            }}
          />
        </label>
      </section>
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <div className="grid gap-4">
          <label className="block text-sm font-medium text-ink">
            {t('merchant.shop.name')}
            <input
              className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
              value={name}
              placeholder={t('merchant.shop.placeholderName')}
              onChange={event => setName(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            {t('merchant.shop.description')}
            <textarea
              className="mt-1 min-h-40 w-full resize-y rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
              value={description}
              placeholder={t('merchant.shop.placeholderDescription')}
              onChange={event => setDescription(event.target.value)}
              required
            />
          </label>
          {message && <p className="text-sm text-clay">{message}</p>}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay"
            onClick={() => navigate('/merchant/shops')}
          >
            <X size={16} aria-hidden="true" />
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="rounded-md bg-market px-4 py-2 text-sm font-semibold text-white transition hover:bg-market/90 disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.saving') : t('merchant.pages.createShop.create')}
          </button>
        </div>
      </section>
    </form>
  )
}
