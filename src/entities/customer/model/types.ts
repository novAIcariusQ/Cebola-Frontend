export type CustomerShop = {
  id: string
  title: string
  description?: string
  logoUrl?: string | null
  isAvailable?: boolean
}

export type CustomerProduct = {
  id: string
  shopId: string
  shopTitle: string
  title: string
  description: string
  price: number
  quantity: number
  photoUrl?: string | null
  isAvailable: boolean
}

export type CustomerBasketItem = {
  productId: string
  shopId: string
  shopTitle: string
  title: string
  price: number
  quantity: number
  availableQuantity: number
  photoUrl?: string | null
}

export type CustomerOrderPayload = {
  shopId: string
  items: Array<{
    productId: string
    quantity: number
  }>
}

export type CustomerOrderResponse = {
  id: string
  guestOrderId?: string | null
  paymentUrl?: string | null
}

