import { FormEvent, useEffect, useState } from 'react'
import { ImagePlus, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Shop, ShopFormValues } from '@entities/shop'
import { StatusPill } from '@shared/ui/status-pill'

type ShopSettingsProps = {
  shop: Shop | null
  isSaving?: boolean
  message?: string | null
  onSave: (values: ShopFormValues) => void
  onLogoUpload: (file: File) => void
}

export function ShopSettings({ shop, isSaving = false, message, onSave, onLogoUpload }: ShopSettingsProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(shop?.name ?? '')
  const [description, setDescription] = useState(shop?.description ?? '')
  const [logoUrl, setLogoUrl] = useState(shop?.logoUrl ?? '')
  const [isActive, setIsActive] = useState(shop?.isActive ?? true)

  useEffect(() => {
    setName(shop?.name ?? '')
    setDescription(shop?.description ?? '')
    setLogoUrl(shop?.logoUrl ?? '')
    setIsActive(shop?.isActive ?? true)
  }, [shop])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSave({ name, description, logoUrl, isActive })
  }

  return (
    <form className="grid gap-5 p-5 lg:grid-cols-[1fr_260px]" onSubmit={submit}>
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
            className="mt-1 min-h-32 w-full resize-y rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
            value={description}
            placeholder={t('merchant.shop.placeholderDescription')}
            onChange={event => setDescription(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          {t('merchant.shop.logoUrl')}
          <input
            className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
            value={logoUrl}
            placeholder={t('merchant.shop.placeholderLogo')}
            onChange={event => setLogoUrl(event.target.value)}
          />
        </label>
        {message && <p className="text-sm text-market">{message}</p>}
      </div>
      <aside className="flex flex-col justify-between gap-5 rounded-md border border-ink/10 bg-paper p-4">
        <div>
          <p className="mb-3 text-sm font-medium text-ink">{t('merchant.shop.status')}</p>
          <StatusPill tone={isActive ? 'success' : 'neutral'}>
            {isActive ? t('common.active') : t('common.inactive')}
          </StatusPill>
          <label className="mt-5 flex items-center gap-2 text-sm text-ink/75">
            <input
              type="checkbox"
              className="h-4 w-4 accent-market"
              checked={isActive}
              onChange={event => setIsActive(event.target.checked)}
            />
            {t('merchant.shop.public')}
          </label>
          <label className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:border-market hover:text-market">
            <ImagePlus size={16} aria-hidden="true" />
            {t('merchant.shop.uploadLogo')}
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={event => {
                const file = event.target.files?.[0]
                if (file) onLogoUpload(file)
                event.target.value = ''
              }}
            />
          </label>
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-market px-4 py-3 text-sm font-semibold text-white transition hover:bg-market/90 disabled:cursor-wait disabled:opacity-60"
          disabled={isSaving}
        >
          <Save size={16} aria-hidden="true" />
          {isSaving ? t('common.saving') : t('merchant.shop.saveDraft')}
        </button>
      </aside>
    </form>
  )
}
