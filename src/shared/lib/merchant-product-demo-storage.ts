import type { Product } from '@entities/product'

const DEMO_PRODUCTS_KEY = 'cebola.demoMerchantProducts'

export const fallbackProducts: Product[] = [
  {
    id: 'prod-1',
    shopId: 'shop-demo',
    title: 'Organic onions',
    description: 'Small batch from a nearby farm, packed in 1 kg bags.',
    price: 2.4,
    quantity: 32,
    photoUrl: null,
    isAvailable: true,
    tags: '100% Organic, Local Craft',
  },
  {
    id: 'prod-2',
    shopId: 'shop-demo',
    title: 'Goat cheese',
    description: 'Soft cheese with limited daily availability.',
    price: 5.9,
    quantity: 8,
    photoUrl: null,
    isAvailable: true,
    tags: 'Local Craft, Freshly Picked',
  },
  {
    id: 'prod-3',
    shopId: 'shop-demo',
    title: 'Fig jam',
    description: 'Seasonal jar, ideal for pickup bundles.',
    price: 4.2,
    quantity: 0,
    photoUrl: null,
    isAvailable: false,
    tags: 'Homemade, Zero Waste',
  },
]

export function getDemoMerchantProducts() {
  const stored = localStorage.getItem(DEMO_PRODUCTS_KEY)

  if (!stored) {
    return fallbackProducts
  }

  try {
    const parsed = JSON.parse(stored) as Product[]
    return parsed.length > 0 ? parsed : fallbackProducts
  } catch {
    return fallbackProducts
  }
}

export function getDemoMerchantShopProducts(shopId: string) {
  return getDemoMerchantProducts().filter(product => product.shopId === shopId)
}

export function getDemoMerchantProduct(shopId: string, productId: string) {
  return getDemoMerchantShopProducts(shopId).find(product => product.id === productId) ?? null
}

export function upsertDemoMerchantProduct(product: Product) {
  const existingProducts = getDemoMerchantProducts()
  const nextProducts = existingProducts.some(item => item.id === product.id)
    ? existingProducts.map(item => (item.id === product.id ? product : item))
    : [product, ...existingProducts]

  localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(nextProducts))
  return nextProducts
}

export function upsertDemoMerchantProducts(products: Product[]) {
  const existingProducts = getDemoMerchantProducts()
  const nextProducts = [
    ...products,
    ...existingProducts.filter(product => !products.some(item => item.id === product.id)),
  ]

  localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(nextProducts))
  return nextProducts
}

export function deleteDemoMerchantProduct(productId: string) {
  const nextProducts = getDemoMerchantProducts().filter(product => product.id !== productId)
  localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(nextProducts))
  return nextProducts
}
