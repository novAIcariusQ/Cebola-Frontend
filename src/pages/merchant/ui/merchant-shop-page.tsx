import { type ChangeEvent, type ReactNode, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ImagePlus, Package, Pencil, Receipt, Save, Star, Trash2, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Shop } from '@entities/shop'
import { merchantApi, uploadApi, ratingApi } from '@shared/api'
import { getDemoMerchantShop, upsertDemoMerchantShop } from '@shared/lib'

type EditableField = 'name' | 'description' | 'operatingHours' | null

const emptyShop: Shop = {
  id: '',
  name: '',
  description: '',
  logoUrl: null,
  isActive: true,
  openTime: '08:00',
  closeTime: '20:00',
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

  // Tabs and ratings state
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details')
  const [ratings, setRatings] = useState<any[]>([])
  const [ratingsPage, setRatingsPage] = useState(1)
  const [ratingsTotal, setRatingsTotal] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [ratingsLoading, setRatingsLoading] = useState(false)

  const loadRatings = async () => {
    setRatingsLoading(true)
    try {
      const res = await ratingApi.getMerchantRatings(shopId, ratingsPage, 5)
      setRatings(res.items)
      setAverageRating(res.averageRating)
      setReviewCount(res.count)
      setRatingsTotal(res.count)
    } catch (err) {
      console.error(err)
    } finally {
      setRatingsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'reviews') {
      void loadRatings()
    }
  }, [shopId, ratingsPage, activeTab])

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
        openTime: nextShop.openTime,
        closeTime: nextShop.closeTime,
      })

      setShop(savedShop)
      setDraftShop(savedShop)
      upsertDemoMerchantShop(savedShop)
      setMessage(t('merchant.shop.saved'))
    } catch {
      setShop(nextShop)
      setDraftShop(nextShop)
      upsertDemoMerchantShop(nextShop)
      setMessage(t('common.error'))
    } finally {
      setEditingField(null)
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

  const handleDeleteRating = async (ratingId: string) => {
    if (!window.confirm(t('merchant.pages.shopRatings.deleteConfirm'))) {
      return
    }

    try {
      await ratingApi.deleteRating(shop.id, ratingId)
      void loadRatings()
    } catch (err) {
      console.error(err)
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
        {/* Tab Selector */}
        <div className="mb-6 flex gap-4 border-b border-ink/10 pb-4">
          <button
            type="button"
            className={`text-sm font-semibold pb-2 border-b-2 transition ${
              activeTab === 'details'
                ? 'border-market text-market'
                : 'border-transparent text-ink/60 hover:text-ink'
            }`}
            onClick={() => setActiveTab('details')}
          >
            {t('merchant.tabs.shop')}
          </button>
          <button
            type="button"
            className={`text-sm font-semibold pb-2 border-b-2 transition ${
              activeTab === 'reviews'
                ? 'border-market text-market'
                : 'border-transparent text-ink/60 hover:text-ink'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            {t('merchant.pages.shopRatings.title')}
          </button>
        </div>

        {activeTab === 'details' ? (
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

            <EditableBlock
              label={t('merchant.shop.operatingHours') || 'Operating Hours'}
              isEditing={editingField === 'operatingHours'}
              onEdit={() => setEditingField('operatingHours')}
              onSave={saveEditingField}
              onCancel={cancelEditing}
              isSaving={isSaving}
            >
              {editingField === 'operatingHours' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Opening Time
                    <input
                      type="time"
                      className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market font-mono"
                      value={draftShop.openTime ?? '08:00'}
                      onChange={event => setDraftShop(current => ({ ...current, openTime: event.target.value }))}
                      required
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Closing Time
                    <input
                      type="time"
                      className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition focus:border-market font-mono"
                      value={draftShop.closeTime ?? '20:00'}
                      onChange={event => setDraftShop(current => ({ ...current, closeTime: event.target.value }))}
                      required
                    />
                  </label>
                </div>
              ) : (
                <p className="text-sm leading-6 text-ink/70">
                  {shop.openTime ?? '08:00'} - {shop.closeTime ?? '20:00'}
                </p>
              )}
            </EditableBlock>

            {message && <p className="text-sm text-market">{message}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-ink/10 p-4 bg-paper/30">
              <div>
                <span className="text-xs font-semibold uppercase text-ink/45">
                  {t('merchant.pages.shopRatings.averageRating')}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-ink">{(averageRating || 0).toFixed(1)}</span>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= Math.round(averageRating) ? 'fill-current' : 'text-ink/20'}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-ink/45">
                  {t('merchant.pages.shopRatings.totalReviews')}
                </span>
                <p className="text-2xl font-bold text-ink mt-1">{reviewCount}</p>
              </div>
            </div>

            {ratingsLoading ? (
              <p className="text-sm text-ink/60">{t('common.loading')}</p>
            ) : ratings.length === 0 ? (
              <p className="text-sm text-ink/60">{t('merchant.pages.shopRatings.empty')}</p>
            ) : (
              <div className="divide-y divide-ink/10 border-t border-b border-ink/10">
                {ratings.map((rating) => (
                  <div key={rating.id} className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink">{rating.userName}</span>
                          <span className="text-xs text-ink/45">
                            {t('merchant.pages.shopRatings.postedOn')}{' '}
                            {rating.createdAt ? rating.createdAt.split('T')[0] : ''}
                          </span>
                        </div>
                        <div className="flex items-center text-amber-500 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={star <= rating.rating ? 'fill-current' : 'text-ink/20'}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        onClick={() => handleDeleteRating(rating.id)}
                      >
                        <Trash2 size={12} className="mr-1" />
                        {t('merchant.pages.shopRatings.deleteBtn')}
                      </button>
                    </div>
                    {rating.comment && (
                      <p className="mt-2 text-sm text-ink/75 leading-relaxed">{rating.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {ratingsTotal > 5 && (
              <div className="flex items-center justify-between border-t border-ink/10 pt-4 mt-6">
                <span className="text-xs text-ink/60">
                  {t('customer.pagination.page')} {ratingsPage} / {Math.ceil(ratingsTotal / 5)}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-ink/10 disabled:opacity-40"
                    disabled={ratingsPage <= 1}
                    onClick={() => setRatingsPage(current => Math.max(1, current - 1))}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-ink/10 disabled:opacity-40"
                    disabled={ratingsPage >= Math.ceil(ratingsTotal / 5)}
                    onClick={() => setRatingsPage(current => Math.min(Math.ceil(ratingsTotal / 5), current + 1))}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-wrap justify-between gap-3 pt-10 border-t border-ink/10">
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
