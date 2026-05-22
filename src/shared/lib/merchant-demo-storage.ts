import type { Shop } from '@entities/shop'

const DEMO_SHOPS_KEY = 'cebola.demoMerchantShops'

export const fallbackShops: Shop[] = [
  {
    id: 'shop-demo',
    name: 'Mercearia Cebola',
    description: 'Fresh shelf products, daily reservations, and in-store pickup.',
    logoUrl: null,
    isActive: true,
  },
]

export function getDemoMerchantShops() {
  const stored = localStorage.getItem(DEMO_SHOPS_KEY)

  if (!stored) {
    return fallbackShops
  }

  try {
    const parsed = JSON.parse(stored) as Shop[]
    return parsed.length > 0 ? parsed : fallbackShops
  } catch {
    return fallbackShops
  }
}

export function getDemoMerchantShop(shopId: string) {
  return getDemoMerchantShops().find(shop => shop.id === shopId) ?? null
}

export function upsertDemoMerchantShop(shop: Shop) {
  const shops = getDemoMerchantShops()
  const nextShops = shops.some(item => item.id === shop.id)
    ? shops.map(item => (item.id === shop.id ? shop : item))
    : [shop, ...shops]

  localStorage.setItem(DEMO_SHOPS_KEY, JSON.stringify(nextShops))
  return nextShops
}
