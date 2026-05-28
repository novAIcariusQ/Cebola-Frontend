import type { CustomerBasketItem, CustomerOrderPayload, CustomerProduct } from '@entities/customer'

const CUSTOMER_BASKET_KEY = 'cebola.customerBasket'
const CUSTOMER_BASKET_EVENT = 'cebola.customerBasket.updated'

function notifyCustomerBasketUpdated() {
  window.dispatchEvent(new Event(CUSTOMER_BASKET_EVENT))
}

export function getCustomerBasketItems() {
  const stored = localStorage.getItem(CUSTOMER_BASKET_KEY)

  if (!stored) {
    return []
  }

  try {
    const parsed = JSON.parse(stored) as CustomerBasketItem[]
    return parsed.filter(item => item.shopId && item.productId && item.quantity > 0 && item.availableQuantity > 0)
  } catch {
    return []
  }
}

export function setCustomerBasketItems(items: CustomerBasketItem[]) {
  localStorage.setItem(CUSTOMER_BASKET_KEY, JSON.stringify(items))
  notifyCustomerBasketUpdated()
  return items
}

export function clearCustomerBasket() {
  localStorage.removeItem(CUSTOMER_BASKET_KEY)
  notifyCustomerBasketUpdated()
  return []
}

export function addCustomerBasketProduct(product: CustomerProduct, quantity = 1) {
  const currentItems = getCustomerBasketItems()
  const sameShopItems = currentItems.filter(item => item.shopId === product.shopId)
  const existingItem = sameShopItems.find(item => item.productId === product.id)
  const nextQuantity = Math.min(product.quantity, (existingItem?.quantity ?? 0) + quantity)

  const nextItem: CustomerBasketItem = {
    productId: product.id,
    shopId: product.shopId,
    shopTitle: product.shopTitle,
    title: product.title,
    price: product.price,
    quantity: Math.max(1, nextQuantity),
    availableQuantity: product.quantity,
    photoUrl: product.photoUrl,
  }

  const nextItems = existingItem
    ? sameShopItems.map(item => (item.productId === product.id ? nextItem : item))
    : [...sameShopItems, nextItem]

  return setCustomerBasketItems(nextItems)
}

export function updateCustomerBasketItemQuantity(productId: string, quantity: number) {
  const nextItems = getCustomerBasketItems()
    .map(item =>
      item.productId === productId
        ? { ...item, quantity: Math.min(item.availableQuantity, Math.max(1, quantity)) }
        : item,
    )
    .filter(item => item.quantity > 0)

  return setCustomerBasketItems(nextItems)
}

export function increaseCustomerBasketItem(productId: string) {
  const item = getCustomerBasketItems().find(basketItem => basketItem.productId === productId)

  if (!item) {
    return getCustomerBasketItems()
  }

  return updateCustomerBasketItemQuantity(productId, item.quantity + 1)
}

export function decreaseCustomerBasketItem(productId: string) {
  const item = getCustomerBasketItems().find(basketItem => basketItem.productId === productId)

  if (!item) {
    return getCustomerBasketItems()
  }

  if (item.quantity <= 1) {
    return removeCustomerBasketItem(productId)
  }

  return updateCustomerBasketItemQuantity(productId, item.quantity - 1)
}

export function removeCustomerBasketItem(productId: string) {
  return setCustomerBasketItems(getCustomerBasketItems().filter(item => item.productId !== productId))
}

export function getCustomerBasketTotal(items = getCustomerBasketItems()) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

export function getCustomerBasketQuantity(items = getCustomerBasketItems()) {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export function getCustomerBasketShopId(items = getCustomerBasketItems()) {
  return items[0]?.shopId ?? null
}

export function createCustomerOrderPayload(items = getCustomerBasketItems()): CustomerOrderPayload | null {
  const shopId = getCustomerBasketShopId(items)

  if (!shopId || items.length === 0) {
    return null
  }

  return {
    shopId,
    items: items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  }
}

export { CUSTOMER_BASKET_EVENT }
