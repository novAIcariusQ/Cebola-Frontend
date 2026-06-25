import { useEffect, useState } from 'react'
import { ArrowLeft, ShoppingBasket, Zap } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CustomerProduct } from '@entities/customer'
import { customerApi } from '@shared/api'
import { addCustomerBasketProduct, formatCurrency, getDemoCustomerProduct } from '@shared/lib'

export function CustomerProductPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { shopId = '', productId = '' } = useParams()
  const [product, setProduct] = useState<CustomerProduct | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      setIsLoading(true)

      try {
        const apiProduct = await customerApi.getProduct(shopId, productId)

        if (!isMounted) return

        setProduct(apiProduct?.isAvailable && apiProduct.quantity > 0 ? apiProduct : null)
      } catch {
        if (isMounted) {
          setProduct(getDemoCustomerProduct(shopId, productId))
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

  const addToBasket = () => {
    if (!product) return

    addCustomerBasketProduct(product)
    setMessage(t('customer.basket.added'))
  }

  const buyNow = () => {
    if (!product) return

    addCustomerBasketProduct(product)
    navigate('/basket')
  }

  if (isLoading) {
    return <p className="text-sm text-sub">{t('common.loading')}</p>
  }

  if (!product) {
    return (
      <section className="sticker p-8">
        <h1 className="display text-4xl text-ink">{t('customer.pages.product.notFound')}</h1>
        <Link
          to={`/shops/${shopId}/products`}
          className="mt-5 btn-primary"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('common.back')}
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/shops/${shopId}/products`}
        className="inline-flex items-center gap-1 text-sm font-medium text-sub hover:text-ink"
      >
        ← {t('common.back')}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Poster image */}
        <section className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-muted">
          {product.photoUrl ? (
            <img className="h-full w-full object-cover" src={product.photoUrl} alt="" />
          ) : (
            <div className="grid h-full place-items-center">
              <span className="display text-9xl text-ink/15">{product.title.slice(0, 1).toUpperCase()}</span>
            </div>
          )}
        </section>

        {/* Info */}
        <section className="flex flex-col">
          <p className="text-sm font-medium text-sub">{product.shopTitle}</p>
          <h1 className="display mt-2 text-5xl text-ink">{product.title}</h1>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="display text-5xl text-base">{formatCurrency(product.price)}</span>
            <span className="text-sm text-sub">/ unidade</span>
          </div>

          <p className="mt-2 text-sm text-sub">
            {t('customer.pages.product.available')}: <strong className="font-semibold text-ink">{product.quantity}</strong>
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="btn-secondary" onClick={addToBasket}>
              <ShoppingBasket size={16} aria-hidden="true" />
              {t('customer.basket.add')}
            </button>
            <button type="button" className="btn-primary" onClick={buyNow}>
              <Zap size={16} aria-hidden="true" />
              {t('customer.pages.product.buy')}
            </button>
          </div>

          {message && (
            <div className="mt-4 inline-flex w-fit items-center rounded-full bg-lime-100 px-4 py-2 text-sm text-base">
              ✓ {message}
            </div>
          )}

          <section className="mt-10 rounded-3xl border border-line bg-white p-6">
            <h2 className="font-mono text-xs uppercase tracking-wider text-sub">
              {t('customer.pages.product.description')}
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-ink/80">{product.description}</p>
          </section>
        </section>
      </div>
    </div>
  )
}
