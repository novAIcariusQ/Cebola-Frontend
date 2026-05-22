import { DragEvent, FormEvent, useRef, useState } from 'react'
import { ArrowLeft, Bot, ImagePlus, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Product, ProductFormValues } from '@entities/product'
import { merchantApi, uploadApi } from '@shared/api'
import { upsertDemoMerchantProduct } from '@shared/lib'

const emptyForm: ProductFormValues = {
  title: '',
  description: '',
  price: 0,
  quantity: 0,
  photoUrl: '',
  isAvailable: true,
}

export function MerchantProductCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { shopId = 'shop-demo' } = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<ProductFormValues>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [createMore, setCreateMore] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const applyImageFile = async (file: File) => {
    setImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    try {
      const response = await uploadApi.uploadImage(file)
      setForm(current => ({ ...current, photoUrl: response.url }))
    } catch {
      setForm(current => ({ ...current, photoUrl: previewUrl }))
    }
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]

    if (file) {
      void applyImageFile(file)
    }
  }

  const describeWithAi = async () => {
    if (!imageFile) {
      fileInputRef.current?.click()
      return
    }

    setIsAiLoading(true)
    setMessage(null)

    try {
      const description = await uploadApi.describeProduct(imageFile)
      setForm(current => ({
        ...current,
        title: description.title || current.title,
        description: description.description || current.description,
      }))
    } catch {
      setMessage(t('common.error'))
    } finally {
      setIsAiLoading(false)
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const normalizedForm = {
      ...form,
      isAvailable: form.quantity > 0 && form.isAvailable,
    }

    const fallbackProduct: Product = {
      id: `prod-${Date.now()}`,
      shopId,
      title: normalizedForm.title,
      description: normalizedForm.description,
      price: normalizedForm.price,
      quantity: normalizedForm.quantity,
      photoUrl: normalizedForm.photoUrl || null,
      isAvailable: normalizedForm.isAvailable,
    }

    try {
      const product = await merchantApi.createProduct(normalizedForm, shopId)
      upsertDemoMerchantProduct(product)

      if (createMore) {
        setForm(emptyForm)
        setImageFile(null)
        setImagePreview('')
        setMessage(t('merchant.products.saved'))
        return
      }

      navigate(`/merchant/shops/${shopId}/products/${product.id}`)
    } catch {
      upsertDemoMerchantProduct(fallbackProduct)

      if (createMore) {
        setForm(emptyForm)
        setImageFile(null)
        setImagePreview('')
        setMessage(t('merchant.products.saved'))
        return
      }

      navigate(`/merchant/shops/${shopId}/products/${fallbackProduct.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[420px_1fr]" onSubmit={submit}>
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <button
          type="button"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-market"
          onClick={() => navigate(`/merchant/shops/${shopId}/products`)}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('common.back')}
        </button>
        <h1 className="text-2xl font-semibold text-ink">{t('merchant.pages.createProduct.title')}</h1>
        <p className="mt-2 text-sm leading-6 text-ink/65">{t('merchant.pages.createProduct.description')}</p>
        <label
          className="mt-6 grid min-h-80 cursor-pointer place-items-center rounded-md border border-dashed border-ink/20 bg-paper p-4 text-center transition hover:border-market"
          onDragOver={event => event.preventDefault()}
          onDrop={handleDrop}
        >
          {imagePreview || form.photoUrl ? (
            <img className="max-h-72 w-full rounded-md object-contain" src={imagePreview || form.photoUrl} alt="" />
          ) : (
            <span className="grid gap-3 text-sm text-ink/60">
              <ImagePlus className="mx-auto text-market" size={28} aria-hidden="true" />
              {t('merchant.pages.createProduct.imageDrop')}
            </span>
          )}
          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={event => {
              const file = event.target.files?.[0]
              if (file) void applyImageFile(file)
              event.target.value = ''
            }}
          />
        </label>
        <button
          type="button"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-market hover:text-market disabled:cursor-wait disabled:opacity-60"
          disabled={isAiLoading}
          onClick={() => void describeWithAi()}
        >
          <Bot size={16} aria-hidden="true" />
          {isAiLoading ? t('common.loading') : t('merchant.imports.ai')}
        </button>
      </section>

      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <div className="grid gap-4">
          <label className="block text-sm font-medium text-ink">
            {t('merchant.products.titleField')}
            <input
              className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
              value={form.title}
              onChange={event => setForm(current => ({ ...current, title: event.target.value }))}
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              {t('merchant.products.priceField')}
              <input
                className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={event => setForm(current => ({ ...current, price: Number(event.target.value) }))}
                required
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              {t('merchant.products.quantityField')}
              <input
                className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={event => setForm(current => ({ ...current, quantity: Number(event.target.value) }))}
                required
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-ink">
            {t('merchant.products.descriptionField')}
            <textarea
              className="mt-1 min-h-44 w-full resize-y rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
              value={form.description}
              onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
              required
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/75">
            <input
              type="checkbox"
              className="h-4 w-4 accent-market"
              checked={createMore}
              onChange={event => setCreateMore(event.target.checked)}
            />
            {t('merchant.pages.createProduct.createMore')}
          </label>
          {message && <p className="text-sm text-market">{message}</p>}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay"
            onClick={() => navigate(`/merchant/shops/${shopId}/products`)}
          >
            <X size={16} aria-hidden="true" />
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="rounded-md bg-market px-4 py-2 text-sm font-semibold text-white transition hover:bg-market/90 disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.saving') : t('merchant.pages.createProduct.create')}
          </button>
        </div>
      </section>
    </form>
  )
}
