import { type RefObject, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { Order, OrderStatus } from '@entities/order'
import type { Product, ProductFormValues } from '@entities/product'
import type { Shop, ShopFormValues } from '@entities/shop'
import { InventoryImport, MerchantOverview, OrdersTable, ProductsManager, ShopSettings } from '@features/merchant'
import { merchantApi, uploadApi } from '@shared/api'
import { tokenStorage } from '@shared/lib/token-storage'
import { Section } from '@shared/ui/section'
import type { MerchantShellTab } from '@widgets/merchant-shell'
import { MerchantShell } from '@widgets/merchant-shell'

const demoShop: Shop = {
  id: 'shop-demo',
  name: 'Mercearia Cebola',
  description: 'Fresh shelf products, daily reservations, and in-store pickup.',
  logoUrl: null,
  isActive: true,
}

const demoProducts: Product[] = [
  {
    id: 'prod-1',
    shopId: demoShop.id,
    title: 'Organic onions',
    description: 'Small batch from a nearby farm, packed in 1 kg bags.',
    price: 2.4,
    photoUrl: null,
    isAvailable: true,
  },
  {
    id: 'prod-2',
    shopId: demoShop.id,
    title: 'Goat cheese',
    description: 'Soft cheese with limited daily availability.',
    price: 5.9,
    photoUrl: null,
    isAvailable: true,
  },
  {
    id: 'prod-3',
    shopId: demoShop.id,
    title: 'Fig jam',
    description: 'Seasonal jar, ideal for pickup bundles.',
    price: 4.2,
    photoUrl: null,
    isAvailable: false,
  },
]

const demoOrders: Order[] = [
  {
    id: 'c7ed1d87-58c1-4f76-8c71-97720f22fd38',
    shopId: demoShop.id,
    guestOrderId: '48291375',
    customerName: 'Maria Silva',
    customerEmail: 'maria@example.com',
    totalAmount: 10.7,
    status: 'paid',
    qrCodeData: 'order:c7ed1d87-58c1-4f76-8c71-97720f22fd38',
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 'item-1',
        orderId: 'c7ed1d87-58c1-4f76-8c71-97720f22fd38',
        productId: 'prod-1',
        productTitle: 'Organic onions',
        quantity: 2,
        priceAtTime: 2.4,
      },
      {
        id: 'item-2',
        orderId: 'c7ed1d87-58c1-4f76-8c71-97720f22fd38',
        productId: 'prod-2',
        productTitle: 'Goat cheese',
        quantity: 1,
        priceAtTime: 5.9,
      },
    ],
  },
]

export function MerchantPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [shop, setShop] = useState<Shop | null>(demoShop)
  const [products, setProducts] = useState<Product[]>(demoProducts)
  const [orders, setOrders] = useState<Order[]>(demoOrders)
  const [shopMessage, setShopMessage] = useState<string | null>(null)
  const [productMessage, setProductMessage] = useState<string | null>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [isSavingShop, setIsSavingShop] = useState(false)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [isProcessingImport, setIsProcessingImport] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const overviewRef = useRef<HTMLDivElement>(null)
  const shopRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)
  const ordersRef = useRef<HTMLDivElement>(null)
  const importsRef = useRef<HTMLDivElement>(null)

  const scrollTo = (ref: RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    let isMounted = true

    const loadMerchantData = async () => {
      try {
        const [apiShop, apiProducts, apiOrders] = await Promise.all([
          merchantApi.getShop(),
          merchantApi.getProducts(),
          merchantApi.getOrders(),
        ])

        if (!isMounted) return

        setShop(apiShop ?? demoShop)
        setProducts(apiProducts)
        setOrders(apiOrders)
      } catch {
        if (!isMounted) return

        setShop(demoShop)
        setProducts(demoProducts)
        setOrders(demoOrders)
      }
    }

    void loadMerchantData()

    return () => {
      isMounted = false
    }
  }, [])

  const tabs: MerchantShellTab[] = [
    { id: 'overview', label: t('merchant.tabs.overview'), onClick: () => scrollTo(overviewRef) },
    { id: 'shop', label: t('merchant.tabs.shop'), onClick: () => scrollTo(shopRef) },
    { id: 'products', label: t('merchant.tabs.products'), onClick: () => scrollTo(productsRef) },
    { id: 'orders', label: t('merchant.tabs.orders'), onClick: () => scrollTo(ordersRef) },
    { id: 'imports', label: t('merchant.tabs.imports'), onClick: () => scrollTo(importsRef) },
  ]

  const handleLogout = () => {
    tokenStorage.clearToken()
    navigate('/login')
  }

  const handleShopSave = async (values: ShopFormValues) => {
    setIsSavingShop(true)
    setShopMessage(null)

    const fallbackShop: Shop = {
      id: shop?.id ?? `shop-${Date.now()}`,
      name: values.name,
      description: values.description,
      logoUrl: values.logoUrl || null,
      isActive: values.isActive,
    }

    try {
      const savedShop = shop?.id
        ? await merchantApi.updateShop(shop.id, values)
        : await merchantApi.createShop(values)

      setShop(savedShop)
    } catch {
      setShop(fallbackShop)
    } finally {
      setShopMessage(t('merchant.shop.saved'))
      setIsSavingShop(false)
    }
  }

  const handleLogoUpload = async (file: File) => {
    setIsSavingShop(true)
    setShopMessage(null)

    try {
      const response = await uploadApi.uploadImage(file)
      setShop(current =>
        current
          ? { ...current, logoUrl: response.url }
          : { ...demoShop, id: `shop-${Date.now()}`, logoUrl: response.url },
      )
      setShopMessage(t('merchant.shop.saved'))
    } catch {
      const localUrl = URL.createObjectURL(file)
      setShop(current =>
        current
          ? { ...current, logoUrl: localUrl }
          : { ...demoShop, id: `shop-${Date.now()}`, logoUrl: localUrl },
      )
      setShopMessage(t('merchant.shop.saved'))
    } finally {
      setIsSavingShop(false)
    }
  }

  const handleProductSave = async (values: ProductFormValues, productId?: string) => {
    setIsSavingProduct(true)
    setProductMessage(null)

    const fallbackProduct: Product = {
      id: productId ?? `prod-${Date.now()}`,
      shopId: shop?.id ?? demoShop.id,
      title: values.title,
      description: values.description,
      price: values.price,
      photoUrl: values.photoUrl || null,
      isAvailable: values.isAvailable,
    }

    try {
      const savedProduct = productId
        ? await merchantApi.updateProduct(productId, values)
        : await merchantApi.createProduct(values)

      setProducts(current =>
        productId
          ? current.map(product => (product.id === productId ? savedProduct : product))
          : [savedProduct, ...current],
      )
    } catch {
      setProducts(current =>
        productId
          ? current.map(product => (product.id === productId ? fallbackProduct : product))
          : [fallbackProduct, ...current],
      )
    } finally {
      setProductMessage(t('merchant.products.saved'))
      setIsSavingProduct(false)
    }
  }

  const handleProductPhotoUpload = async (file: File) => {
    try {
      const response = await uploadApi.uploadImage(file)
      return response.url
    } catch {
      return URL.createObjectURL(file)
    }
  }

  const handleProductDelete = async (productId: string) => {
    const previousProducts = products
    setProducts(current => current.filter(product => product.id !== productId))
    setProductMessage(null)

    try {
      await merchantApi.deleteProduct(productId)
    } catch {
      setProducts(previousProducts.filter(product => product.id !== productId))
    } finally {
      setProductMessage(t('merchant.products.deleted'))
    }
  }

  const handleFileImport = async (file: File, kind: 'json' | 'xlsx' | 'image') => {
    setImportMessage(`${t('merchant.imports.selected')}: ${file.name}`)

    if (kind !== 'json') {
      setImportMessage(`${t('merchant.imports.imported')}: ${file.name}`)
      return
    }

    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as Partial<ProductFormValues>[]
      const importedProducts = parsed
        .filter(item => item.title && typeof item.price === 'number')
        .map<Product>((item, index) => ({
          id: `import-${Date.now()}-${index}`,
          shopId: shop?.id ?? demoShop.id,
          title: item.title ?? '',
          description: item.description ?? '',
          price: item.price ?? 0,
          photoUrl: item.photoUrl ?? null,
          isAvailable: item.isAvailable ?? true,
        }))

      if (importedProducts.length > 0) {
        setProducts(current => [...importedProducts, ...current])
      }

      setImportMessage(`${t('merchant.imports.imported')}: ${file.name}`)
    } catch {
      setImportMessage(t('common.error'))
    }
  }

  const handleAiDescribe = async (file: File) => {
    setIsProcessingImport(true)
    setImportMessage(`${t('merchant.imports.selected')}: ${file.name}`)

    try {
      const description = await uploadApi.describeProduct(file)
      setProducts(current => [
        {
          id: `ai-${Date.now()}`,
          shopId: shop?.id ?? demoShop.id,
          title: description.title,
          description: description.description,
          price: 0,
          photoUrl: URL.createObjectURL(file),
          isAvailable: true,
        },
        ...current,
      ])
      setImportMessage(t('merchant.imports.aiReady'))
    } catch {
      setProducts(current => [
        {
          id: `ai-${Date.now()}`,
          shopId: shop?.id ?? demoShop.id,
          title: file.name.replace(/\.[^.]+$/, ''),
          description: t('merchant.imports.aiReady'),
          price: 0,
          photoUrl: URL.createObjectURL(file),
          isAvailable: true,
        },
        ...current,
      ])
      setImportMessage(t('merchant.imports.aiReady'))
    } finally {
      setIsProcessingImport(false)
    }
  }

  const handleOrderStatusChange = (orderId: string, status: OrderStatus) => {
    setOrders(current => current.map(order => (order.id === orderId ? { ...order, status } : order)))
  }

  return (
    <MerchantShell tabs={tabs} onLogout={handleLogout}>
      <div className="space-y-8">
        <div ref={overviewRef}>
          <Section title={t('merchant.overview.title')}>
            <MerchantOverview products={products} orders={orders} />
          </Section>
        </div>
        <div ref={shopRef}>
          <Section title={t('merchant.shop.title')}>
            <ShopSettings
              shop={shop}
              isSaving={isSavingShop}
              message={shopMessage}
              onSave={handleShopSave}
              onLogoUpload={handleLogoUpload}
            />
          </Section>
        </div>
        <div ref={productsRef}>
          <Section title={t('merchant.products.title')}>
            <ProductsManager
              products={products}
              isSaving={isSavingProduct}
              message={productMessage}
              onSave={handleProductSave}
              onDelete={handleProductDelete}
              onPhotoUpload={handleProductPhotoUpload}
            />
          </Section>
        </div>
        <div ref={ordersRef}>
          <Section title={t('merchant.orders.title')}>
            <OrdersTable orders={orders} onShowQr={setSelectedOrder} onStatusChange={handleOrderStatusChange} />
          </Section>
        </div>
        <div ref={importsRef}>
          <Section title={t('merchant.imports.title')}>
            <InventoryImport
              message={importMessage}
              isProcessing={isProcessingImport}
              onFileImport={handleFileImport}
              onAiDescribe={handleAiDescribe}
            />
          </Section>
        </div>
      </div>
      {selectedOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-md bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{t('merchant.orders.qrTitle')}</h3>
              <button
                type="button"
                className="rounded-md border border-ink/10 px-3 py-1 text-sm"
                onClick={() => setSelectedOrder(null)}
              >
                {t('common.close')}
              </button>
            </div>
            <div className="rounded-md bg-paper p-4 font-mono text-sm text-ink">
              {selectedOrder.qrCodeData ?? selectedOrder.guestOrderId ?? selectedOrder.id}
            </div>
          </div>
        </div>
      )}
    </MerchantShell>
  )
}
