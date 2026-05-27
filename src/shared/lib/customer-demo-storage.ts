import type { CustomerProduct, CustomerShop } from '@entities/customer'
import { getDemoMerchantShops } from './merchant-demo-storage'
import { getDemoMerchantShopProducts } from './merchant-product-demo-storage'

type DemoListParams = {
  page?: number
  limit?: number
  q?: string
}

function paginateDemoList<T>(items: T[], params?: DemoListParams) {
  const page = params?.page ?? 1
  const limit = params?.limit ?? items.length
  const start = (page - 1) * limit

  return {
    items: items.slice(start, start + limit),
    total: items.length,
  }
}

export function getDemoCustomerShops(): CustomerShop[] {
  return getDemoMerchantShops()
    .filter(shop => shop.isActive)
    .map(shop => ({
      id: shop.id,
      title: shop.name,
      description: shop.description,
      logoUrl: shop.logoUrl,
      isAvailable: shop.isActive,
    }))
}

export function getDemoCustomerShopsPage(params?: DemoListParams) {
  const normalizedQuery = params?.q?.trim().toLowerCase()
  const shops = getDemoCustomerShops()
  const filteredShops = normalizedQuery
    ? shops.filter(shop =>
        [shop.title, shop.description ?? ''].some(value => value.toLowerCase().includes(normalizedQuery)),
      )
    : shops

  return paginateDemoList(filteredShops, params)
}

export function getDemoCustomerShop(shopId: string) {
  return getDemoCustomerShops().find(shop => shop.id === shopId) ?? null
}

export function getDemoCustomerShopProducts(shopId: string): CustomerProduct[] {
  const shop = getDemoCustomerShop(shopId)

  return getDemoMerchantShopProducts(shopId)
    .filter(product => product.isAvailable && product.quantity > 0)
    .map(product => ({
      id: product.id,
      shopId: product.shopId,
      shopTitle: shop?.title ?? '',
      title: product.title,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      photoUrl: product.photoUrl,
      isAvailable: product.isAvailable,
    }))
}

export function getDemoCustomerShopProductsPage(shopId: string, params?: DemoListParams) {
  const normalizedQuery = params?.q?.trim().toLowerCase()
  const products = getDemoCustomerShopProducts(shopId)
  const filteredProducts = normalizedQuery
    ? products.filter(product =>
        [product.title, product.description].some(value => value.toLowerCase().includes(normalizedQuery)),
      )
    : products

  return paginateDemoList(filteredProducts, params)
}

export function getDemoCustomerProduct(shopId: string, productId: string) {
  return getDemoCustomerShopProducts(shopId).find(product => product.id === productId) ?? null
}
