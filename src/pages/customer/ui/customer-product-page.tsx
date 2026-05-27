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
    return <p className="text-sm text-ink/60">{t('common.loading')}</p>
  }

  if (!product) {
    return (
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">{t('customer.pages.product.notFound')}</h1>
        <Link
          to={`/shops/${shopId}/products`}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-market px-4 py-2 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('common.back')}
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <Link
        to={`/shops/${shopId}/products`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-market"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t('common.back')}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
          <div className="grid min-h-96 place-items-center overflow-hidden rounded-md bg-paper">
            {product.photoUrl ? (
              <img className="h-full max-h-96 w-full object-contain" src={product.photoUrl} alt="" />
            ) : (
              <span className="text-7xl font-semibold text-ink/20">{product.title.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
        </section>

        <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-market">{product.shopTitle}</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">{product.title}</h1>
          <p className="mt-4 text-2xl font-semibold text-market">{formatCurrency(product.price)}</p>
          <p className="mt-2 text-sm text-ink/55">
            {t('customer.pages.product.available')}: {product.quantity}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-market hover:text-market"
              onClick={addToBasket}
            >
              <ShoppingBasket size={16} aria-hidden="true" />
              {t('customer.basket.add')}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-market px-4 py-2 text-sm font-semibold text-white transition hover:bg-market/90"
              onClick={buyNow}
            >
              <Zap size={16} aria-hidden="true" />
              {t('customer.pages.product.buy')}
            </button>
          </div>

          {message && <p className="mt-4 text-sm text-market">{message}</p>}
        </section>
      </div>

      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <h2 className="text-sm font-semibold uppercase text-ink/45">{t('merchant.products.description')}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70">{product.description}</p>
      </section>
    </div>
  )
}
