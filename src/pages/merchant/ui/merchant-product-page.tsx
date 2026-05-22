import { type ChangeEvent, type ReactNode, useEffect, useState } from 'react'
import { ArrowLeft, ImagePlus, Pencil, Save, Trash2, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Product, ProductFormValues } from '@entities/product'
import { merchantApi, uploadApi } from '@shared/api'
import { deleteDemoMerchantProduct, formatCurrency, getDemoMerchantProduct, upsertDemoMerchantProduct } from '@shared/lib'

type EditableField = 'title' | 'price' | 'quantity' | 'description' | null

const emptyProduct: Product = {
  id: '',
  shopId: '',
  title: '',
  description: '',
  price: 0,
  quantity: 0,
  photoUrl: null,
  isAvailable: false,
}

export function MerchantProductPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { shopId = 'shop-demo', productId = '' } = useParams()
  const [product, setProduct] = useState<Product>(emptyProduct)
  const [draftProduct, setDraftProduct] = useState<Product>(emptyProduct)
  const [editingField, setEditingField] = useState<EditableField>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      setIsLoading(true)

      try {
        const apiProduct = await merchantApi.getProduct(shopId, productId)

        if (!isMounted) return

        if (apiProduct) {
          setProduct(apiProduct)
          setDraftProduct(apiProduct)
          upsertDemoMerchantProduct(apiProduct)
          return
        }

        throw new Error('Product not found')
      } catch {
        if (!isMounted) return

        const fallbackProduct = getDemoMerchantProduct(shopId, productId)

        if (fallbackProduct) {
          setProduct(fallbackProduct)
          setDraftProduct(fallbackProduct)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProduct()

    return () => {
      isMounted = false
    }
  }, [productId, shopId])

  const saveProduct = async (nextProduct: Product) => {
    setIsSaving(true)
    setMessage(null)

    const payload: ProductFormValues = {
      title: nextProduct.title,
      description: nextProduct.description,
      price: nextProduct.price,
      quantity: nextProduct.quantity,
      photoUrl: nextProduct.photoUrl ?? '',
      isAvailable: nextProduct.quantity > 0 && nextProduct.isAvailable,
    }

    const normalizedProduct = { ...nextProduct, isAvailable: payload.isAvailable }

    try {
      const savedProduct = await merchantApi.updateProduct(nextProduct.id, payload, shopId)
      setProduct(savedProduct)
      setDraftProduct(savedProduct)
      upsertDemoMerchantProduct(savedProduct)
    } catch {
      setProduct(normalizedProduct)
      setDraftProduct(normalizedProduct)
      upsertDemoMerchantProduct(normalizedProduct)
    } finally {
      setEditingField(null)
      setMessage(t('merchant.products.saved'))
      setIsSaving(false)
    }
  }

  const uploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    const previewUrl = URL.createObjectURL(file)

    try {
      const response = await uploadApi.uploadImage(file)
      await saveProduct({ ...product, photoUrl: response.url })
    } catch {
      await saveProduct({ ...product, photoUrl: previewUrl })
    }
  }

  const deleteProduct = async () => {
    try {
      await merchantApi.deleteProduct(product.id, shopId)
    } finally {
      deleteDemoMerchantProduct(product.id)
      navigate(`/merchant/shops/${shopId}/products`)
    }
  }

  const saveEditingField = () => {
    void saveProduct(draftProduct)
  }

  const cancelEditing = () => {
    setDraftProduct(product)
    setEditingField(null)
  }

  if (isLoading) {
    return <p className="text-sm text-ink/60">{t('common.loading')}</p>
  }

  if (!product.id) {
    return (
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">{t('merchant.pages.product.notFound')}</h1>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-market px-4 py-2 text-sm font-semibold text-white"
          onClick={() => navigate(`/merchant/shops/${shopId}/products`)}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('common.back')}
        </button>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-market"
        onClick={() => navigate(`/merchant/shops/${shopId}/products`)}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t('common.back')}
      </button>
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <div className="relative grid min-h-96 place-items-center overflow-hidden rounded-md bg-paper">
          {product.photoUrl ? (
            <img className="h-full max-h-96 w-full object-contain" src={product.photoUrl} alt="" />
          ) : (
            <span className="text-7xl font-semibold text-ink/20">{product.title.slice(0, 1).toUpperCase()}</span>
          )}
          <label className="absolute right-4 top-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-white text-ink shadow-soft transition hover:text-market">
            <ImagePlus size={18} aria-hidden="true" />
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={uploadPhoto}
            />
          </label>
        </div>
      </section>

      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <div className="space-y-4">
          <EditableBlock
            label={t('merchant.products.titleField')}
            isEditing={editingField === 'title'}
            isSaving={isSaving}
            onEdit={() => setEditingField('title')}
            onSave={saveEditingField}
            onCancel={cancelEditing}
          >
            {editingField === 'title' ? (
              <input
                className="w-full rounded-md border border-ink/15 px-3 py-2 text-xl font-semibold outline-none transition focus:border-market"
                value={draftProduct.title}
                onChange={event => setDraftProduct(current => ({ ...current, title: event.target.value }))}
              />
            ) : (
              <h1 className="text-3xl font-semibold text-ink">{product.title}</h1>
            )}
          </EditableBlock>

          <div className="grid gap-4 sm:grid-cols-2">
            <EditableBlock
              label={t('merchant.products.priceField')}
              isEditing={editingField === 'price'}
              isSaving={isSaving}
              onEdit={() => setEditingField('price')}
              onSave={saveEditingField}
              onCancel={cancelEditing}
            >
              {editingField === 'price' ? (
                <input
                  className="w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftProduct.price}
                  onChange={event => setDraftProduct(current => ({ ...current, price: Number(event.target.value) }))}
                />
              ) : (
                <p className="text-xl font-semibold text-market">{formatCurrency(product.price)}</p>
              )}
            </EditableBlock>

            <EditableBlock
              label={t('merchant.products.quantityField')}
              isEditing={editingField === 'quantity'}
              isSaving={isSaving}
              onEdit={() => setEditingField('quantity')}
              onSave={saveEditingField}
              onCancel={cancelEditing}
            >
              {editingField === 'quantity' ? (
                <input
                  className="w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
                  type="number"
                  min="0"
                  step="1"
                  value={draftProduct.quantity}
                  onChange={event => setDraftProduct(current => ({ ...current, quantity: Number(event.target.value) }))}
                />
              ) : (
                <p className="text-xl font-semibold text-ink">{product.quantity}</p>
              )}
            </EditableBlock>
          </div>

          <EditableBlock
            label={t('merchant.products.descriptionField')}
            isEditing={editingField === 'description'}
            isSaving={isSaving}
            onEdit={() => setEditingField('description')}
            onSave={saveEditingField}
            onCancel={cancelEditing}
          >
            {editingField === 'description' ? (
              <textarea
                className="min-h-44 w-full resize-y rounded-md border border-ink/15 px-3 py-2 text-sm leading-6 outline-none transition focus:border-market"
                value={draftProduct.description}
                onChange={event => setDraftProduct(current => ({ ...current, description: event.target.value }))}
              />
            ) : (
              <p className="text-sm leading-6 text-ink/70">{product.description}</p>
            )}
          </EditableBlock>

          {message && <p className="text-sm text-market">{message}</p>}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-clay/30 px-4 py-2 text-sm font-semibold text-clay transition hover:bg-clay hover:text-white"
            onClick={() => void deleteProduct()}
          >
            <Trash2 size={16} aria-hidden="true" />
            {t('merchant.products.remove')}
          </button>
        </div>
      </section>
      </div>
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
