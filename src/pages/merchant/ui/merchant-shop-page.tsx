import { type ChangeEvent, type ReactNode, useEffect, useState } from 'react'
import { ImagePlus, Package, Pencil, Receipt, Save, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Shop } from '@entities/shop'
import { merchantApi, uploadApi } from '@shared/api'
import { getDemoMerchantShop, upsertDemoMerchantShop } from '@shared/lib'

type EditableField = 'name' | 'description' | null

const emptyShop: Shop = {
  id: '',
  name: '',
  description: '',
  logoUrl: null,
  isActive: true,
}

export function MerchantShopPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { shopId = 'shop-demo' } = useParams()
  const [shop, setShop] = useState<Shop>(emptyShop)
  const [draftShop, setDraftShop] = useState<Shop>(emptyShop)
  const [editingField, setEditingField] = useState<EditableField>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadShop = async () => {
      setIsLoading(true)

      try {
        const apiShop = await merchantApi.getShop(shopId)

        if (!isMounted) return

        if (apiShop) {
          setShop(apiShop)
          setDraftShop(apiShop)
          upsertDemoMerchantShop(apiShop)
          return
        }

        throw new Error('Shop not found')
      } catch {
        if (!isMounted) return

        const fallbackShop = getDemoMerchantShop(shopId)

        if (fallbackShop) {
          setShop(fallbackShop)
          setDraftShop(fallbackShop)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadShop()

    return () => {
      isMounted = false
    }
  }, [shopId])

  const saveShop = async (nextShop: Shop) => {
    setIsSaving(true)
    setMessage(null)

    try {
      const savedShop = await merchantApi.updateShop(nextShop.id, {
        name: nextShop.name,
        description: nextShop.description,
        logoUrl: nextShop.logoUrl ?? '',
        isActive: nextShop.isActive,
      })

      setShop(savedShop)
      setDraftShop(savedShop)
      upsertDemoMerchantShop(savedShop)
    } catch {
      setShop(nextShop)
      setDraftShop(nextShop)
      upsertDemoMerchantShop(nextShop)
    } finally {
      setEditingField(null)
      setMessage(t('merchant.shop.saved'))
      setIsSaving(false)
    }
  }

  const saveEditingField = () => {
    void saveShop(draftShop)
  }

  const cancelEditing = () => {
    setDraftShop(shop)
    setEditingField(null)
  }

  const uploadLogo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    const nextShop = { ...shop, logoUrl: previewUrl }
    setDraftShop(nextShop)

    try {
      const response = await uploadApi.uploadImage(file)
      await saveShop({ ...shop, logoUrl: response.url })
    } catch {
      await saveShop(nextShop)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-ink/60">{t('common.loading')}</p>
  }

  if (!shop.id) {
    return (
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">{t('merchant.pages.shop.notFound')}</h1>
        <button
          type="button"
          className="mt-4 rounded-md bg-market px-4 py-2 text-sm font-semibold text-white"
          onClick={() => navigate('/merchant/shops')}
        >
          {t('merchant.navigation.home')}
        </button>
      </section>
    )
  }

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-6 lg:grid-cols-[420px_1fr]">
      <section className="flex flex-col rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <div className="relative grid min-h-80 place-items-center overflow-hidden rounded-md bg-paper">
          {shop.logoUrl ? (
            <img className="h-full max-h-80 w-full object-contain" src={shop.logoUrl} alt="" />
          ) : (
            <span className="text-7xl font-semibold text-ink/20">{shop.name.slice(0, 1).toUpperCase()}</span>
          )}
          <label className="absolute right-4 top-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-white text-ink shadow-soft transition hover:text-market">
            <ImagePlus size={18} aria-hidden="true" />
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={uploadLogo}
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <div className="space-y-6">
          <EditableBlock
            label={t('merchant.shop.name')}
            isEditing={editingField === 'name'}
            onEdit={() => setEditingField('name')}
            onSave={saveEditingField}
            onCancel={cancelEditing}
            isSaving={isSaving}
          >
            {editingField === 'name' ? (
              <input
                className="w-full rounded-md border border-ink/15 px-3 py-2 text-xl font-semibold outline-none transition focus:border-market"
                value={draftShop.name}
                onChange={event => setDraftShop(current => ({ ...current, name: event.target.value }))}
                required
              />
            ) : (
              <h1 className="text-3xl font-semibold text-ink">{shop.name}</h1>
            )}
          </EditableBlock>

          <EditableBlock
            label={t('merchant.shop.description')}
            isEditing={editingField === 'description'}
            onEdit={() => setEditingField('description')}
            onSave={saveEditingField}
            onCancel={cancelEditing}
            isSaving={isSaving}
          >
            {editingField === 'description' ? (
              <textarea
                className="min-h-40 w-full resize-y rounded-md border border-ink/15 px-3 py-2 text-sm leading-6 outline-none transition focus:border-market"
                value={draftShop.description}
                onChange={event => setDraftShop(current => ({ ...current, description: event.target.value }))}
                required
              />
            ) : (
              <p className="text-sm leading-6 text-ink/70">{shop.description}</p>
            )}
          </EditableBlock>

          {message && <p className="text-sm text-market">{message}</p>}
        </div>

        <div className="mt-auto flex flex-wrap justify-between gap-3 pt-10">
          <Link
            to={`/merchant/shops/${shop.id}/products`}
            className="inline-flex items-center gap-2 rounded-md bg-market px-4 py-3 text-sm font-semibold text-white transition hover:bg-market/90"
          >
            <Package size={16} aria-hidden="true" />
            {t('merchant.pages.shop.products')}
          </Link>
          <Link
            to={`/merchant/shops/${shop.id}/orders`}
            className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-market hover:text-market"
          >
            <Receipt size={16} aria-hidden="true" />
            {t('merchant.pages.shop.orders')}
          </Link>
        </div>
      </section>
    </div>
  )
}

type EditableBlockProps = {
  label: string
  isEditing: boolean
  isSaving: boolean
  children: ReactNode
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}

function EditableBlock({ label, isEditing, isSaving, children, onEdit, onSave, onCancel }: EditableBlockProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-md border border-ink/10 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase text-ink/45">{label}</span>
        {isEditing ? (
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink transition hover:border-clay hover:text-clay"
              onClick={onCancel}
              title={t('common.cancel')}
              aria-label={t('common.cancel')}
            >
              <X size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-market text-white disabled:cursor-wait disabled:opacity-60"
              onClick={onSave}
              disabled={isSaving}
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
            onClick={onEdit}
            title={t('merchant.products.edit')}
            aria-label={t('merchant.products.edit')}
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}
