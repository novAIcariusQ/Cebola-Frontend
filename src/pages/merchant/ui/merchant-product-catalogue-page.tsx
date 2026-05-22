import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, FileJson, FileSpreadsheet, Plus, Search } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Product } from '@entities/product'
import { merchantApi, type MerchantListResponse } from '@shared/api/merchant.api'
import { formatCurrency, getDemoMerchantShopProducts, upsertDemoMerchantProducts } from '@shared/lib'

export function MerchantProductCataloguePage() {
  const { t } = useTranslation()
  const { shopId = 'shop-demo' } = useParams()
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const limit = 12

  const fallbackProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const shopProducts = getDemoMerchantShopProducts(shopId)

    if (!normalizedQuery) {
      return shopProducts
    }

    return shopProducts.filter(product =>
      [product.title, product.description].some(value => value.toLowerCase().includes(normalizedQuery)),
    )
  }, [query, shopId])

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      setIsLoading(true)

      try {
        const response = await merchantApi.getProducts(shopId, { page, limit, q: query || undefined })
        const normalizedResponse = Array.isArray(response)
          ? { items: response, total: response.length }
          : (response as MerchantListResponse<Product>)

        if (!isMounted) return

        setProducts(normalizedResponse.items)
        setTotal(normalizedResponse.total ?? normalizedResponse.items.length)
      } catch {
        if (!isMounted) return

        const start = (page - 1) * limit
        setProducts(fallbackProducts.slice(start, start + limit))
        setTotal(fallbackProducts.length)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      isMounted = false
    }
  }, [fallbackProducts, limit, page, query, shopId])

  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    try {
      const parsed = JSON.parse(await file.text()) as Partial<Product>[]
      const importedProducts = parsed
        .filter(item => item.title && typeof item.price === 'number')
        .map<Product>((item, index) => ({
          id: item.id ?? `import-${Date.now()}-${index}`,
          shopId,
          title: item.title ?? '',
          description: item.description ?? '',
          price: item.price ?? 0,
          quantity: item.quantity ?? 0,
          photoUrl: item.photoUrl ?? null,
          isAvailable: item.isAvailable ?? (item.quantity ?? 0) > 0,
          createdAt: item.createdAt,
        }))

      upsertDemoMerchantProducts(importedProducts)
      setProducts(current => [...importedProducts, ...current])
      setTotal(current => current + importedProducts.length)
      setMessage(`${t('merchant.imports.imported')}: ${file.name}`)
    } catch {
      setMessage(t('common.error'))
    }
  }

  const handleXlsxImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (file) {
      setMessage(`${t('merchant.imports.imported')}: ${file.name}`)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              to={`/merchant/shops/${shopId}`}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-market"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {t('common.back')}
            </Link>
            <h1 className="text-2xl font-semibold text-ink">{t('merchant.pages.productCatalogue.title')}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
              {t('merchant.pages.productCatalogue.description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold transition hover:border-market hover:text-market">
              <FileJson size={16} aria-hidden="true" />
              {t('merchant.pages.productCatalogue.importJson')}
              <input className="sr-only" type="file" accept=".json,application/json" onChange={importJson} />
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold transition hover:border-market hover:text-market">
              <FileSpreadsheet size={16} aria-hidden="true" />
              {t('merchant.pages.productCatalogue.importXlsx')}
              <input
                className="sr-only"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleXlsxImport}
              />
            </label>
            <Link
              to={`/merchant/shops/${shopId}/products/new`}
              className="inline-flex items-center gap-2 rounded-md bg-market px-4 py-2 text-sm font-semibold text-white transition hover:bg-market/90"
            >
              <Plus size={16} aria-hidden="true" />
              {t('merchant.pages.productCatalogue.createProduct')}
            </Link>
          </div>
        </div>
      </section>

      <label className="flex items-center gap-3 rounded-md border border-ink/10 bg-white px-4 py-3 shadow-soft">
        <Search size={18} className="text-ink/45" aria-hidden="true" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          placeholder={t('merchant.pages.productCatalogue.search')}
          value={query}
          onChange={event => {
            setQuery(event.target.value)
            setPage(1)
          }}
        />
      </label>

      {message && <p className="rounded-md border border-ink/10 bg-white p-3 text-sm text-market">{message}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map(product => (
          <Link
            key={product.id}
            to={`/merchant/shops/${shopId}/products/${product.id}`}
            className="rounded-md border border-ink/10 bg-white p-4 shadow-soft transition hover:border-market"
          >
            <div className="mb-4 grid aspect-[4/3] place-items-center overflow-hidden rounded-md bg-paper">
              {product.photoUrl ? (
                <img className="h-full w-full object-cover" src={product.photoUrl} alt="" />
              ) : (
                <span className="text-4xl font-semibold text-ink/20">{product.title.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-ink">{product.title}</h2>
              <span className="shrink-0 text-sm font-semibold text-market">{formatCurrency(product.price)}</span>
            </div>
            <p className="mt-2 text-sm text-ink/60">
              {t('merchant.products.quantity')}: {product.quantity}
            </p>
          </Link>
        ))}
      </div>

      {!isLoading && products.length === 0 && (
        <p className="rounded-md border border-ink/10 bg-white p-5 text-sm text-ink/60">{t('common.empty')}</p>
      )}

      <div className="flex items-center justify-between rounded-md border border-ink/10 bg-white px-4 py-3 shadow-soft">
        <span className="text-sm text-ink/60">
          {t('merchant.pages.landing.page')} {page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage(current => Math.max(1, current - 1))}
            aria-label={t('merchant.pages.landing.previous')}
            title={t('merchant.pages.landing.previous')}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage(current => Math.min(totalPages, current + 1))}
            aria-label={t('merchant.pages.landing.next')}
            title={t('merchant.pages.landing.next')}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
