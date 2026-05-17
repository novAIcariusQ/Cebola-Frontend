import { FormEvent, useEffect, useState } from 'react'
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Product, ProductFormValues } from '@entities/product'
import { formatCurrency } from '@shared/lib'
import { StatusPill } from '@shared/ui/status-pill'

type ProductsManagerProps = {
  products: Product[]
  isSaving?: boolean
  message?: string | null
  onSave: (values: ProductFormValues, productId?: string) => void
  onDelete: (productId: string) => void
  onPhotoUpload: (file: File) => Promise<string>
}

const emptyForm: ProductFormValues = {
  title: '',
  description: '',
  price: 0,
  photoUrl: '',
  isAvailable: true,
}

export function ProductsManager({
  products,
  isSaving = false,
  message,
  onSave,
  onDelete,
  onPhotoUpload,
}: ProductsManagerProps) {
  const { t } = useTranslation()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<ProductFormValues>(emptyForm)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  useEffect(() => {
    if (!editingProduct) {
      setForm(emptyForm)
      return
    }

    setForm({
      title: editingProduct.title,
      description: editingProduct.description,
      price: editingProduct.price,
      photoUrl: editingProduct.photoUrl ?? '',
      isAvailable: editingProduct.isAvailable,
    })
  }, [editingProduct])

  const openCreate = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSave(form, editingProduct?.id)
    closeModal()
  }

  const uploadPhoto = async (file: File) => {
    setIsUploadingPhoto(true)
    try {
      const photoUrl = await onPhotoUpload(file)
      setForm(current => ({ ...current, photoUrl }))
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 p-4">
        {message ? <p className="text-sm text-market">{message}</p> : <span />}
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-market px-3 py-2 text-sm font-semibold text-white transition hover:bg-market/90"
          onClick={openCreate}
        >
          <Plus size={16} aria-hidden="true" />
          {t('merchant.products.add')}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-paper text-left text-ink/60">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('merchant.products.photo')}</th>
              <th className="px-4 py-3 font-semibold">{t('merchant.products.product')}</th>
              <th className="px-4 py-3 font-semibold">{t('merchant.products.description')}</th>
              <th className="px-4 py-3 font-semibold">{t('merchant.products.price')}</th>
              <th className="px-4 py-3 font-semibold">{t('merchant.products.availability')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('merchant.products.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-t border-ink/10">
                <td className="px-4 py-3">
                  <div className="h-12 w-12 rounded-md bg-paper object-cover">
                    {product.photoUrl && (
                      <img className="h-full w-full rounded-md object-cover" src={product.photoUrl} alt="" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-ink">{product.title}</td>
                <td className="max-w-sm px-4 py-3 text-ink/65">{product.description}</td>
                <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                <td className="px-4 py-3">
                  <StatusPill tone={product.isAvailable ? 'success' : 'neutral'}>
                    {product.isAvailable ? t('merchant.products.available') : t('merchant.products.unavailable')}
                  </StatusPill>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/70 transition hover:border-market hover:text-market"
                      aria-label={t('merchant.products.edit')}
                      title={t('merchant.products.edit')}
                      onClick={() => openEdit(product)}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/70 transition hover:border-clay hover:text-clay"
                      aria-label={t('merchant.products.remove')}
                      title={t('merchant.products.remove')}
                      onClick={() => onDelete(product.id)}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && <p className="p-5 text-sm text-ink/60">{t('common.empty')}</p>}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4" role="dialog" aria-modal="true">
          <form className="w-full max-w-lg rounded-md bg-white p-5 shadow-soft" onSubmit={submit}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">
                {editingProduct ? t('merchant.products.modalEdit') : t('merchant.products.modalAdd')}
              </h3>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10"
                onClick={closeModal}
                aria-label={t('common.close')}
                title={t('common.close')}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-4">
              <label className="block text-sm font-medium">
                {t('merchant.products.titleField')}
                <input
                  className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
                  value={form.title}
                  onChange={event => setForm(current => ({ ...current, title: event.target.value }))}
                  required
                />
              </label>
              <label className="block text-sm font-medium">
                {t('merchant.products.descriptionField')}
                <textarea
                  className="mt-1 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
                  value={form.description}
                  onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
                  required
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
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
                <label className="block text-sm font-medium">
                  {t('merchant.products.photoUrlField')}
                  <input
                    className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market"
                    value={form.photoUrl ?? ''}
                    onChange={event => setForm(current => ({ ...current, photoUrl: event.target.value }))}
                  />
                </label>
              </div>
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:border-market hover:text-market">
                <ImagePlus size={16} aria-hidden="true" />
                {isUploadingPhoto ? t('common.loading') : t('merchant.products.uploadPhoto')}
                <input
                  className="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={isUploadingPhoto}
                  onChange={event => {
                    const file = event.target.files?.[0]
                    if (file) void uploadPhoto(file)
                    event.target.value = ''
                  }}
                />
              </label>
              {form.photoUrl && (
                <img
                  className="h-28 w-28 rounded-md border border-ink/10 object-cover"
                  src={form.photoUrl}
                  alt=""
                />
              )}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-market"
                  checked={form.isAvailable}
                  onChange={event => setForm(current => ({ ...current, isAvailable: event.target.checked }))}
                />
                {t('merchant.products.available')}
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-md border border-ink/10 px-4 py-2 text-sm" onClick={closeModal}>
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="rounded-md bg-market px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
