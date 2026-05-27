import type { CustomerOrderPayload, CustomerOrderResponse, CustomerProduct, CustomerShop } from '@entities/customer'
import { apiClient } from './base'

export type CustomerListParams = {
  page?: number
  limit?: number
  q?: string
}

export type CustomerListResponse<T> = {
  items: T[]
  total: number
}

type CustomerShopDto = Partial<CustomerShop> & {
  name?: string
  logo?: string | null
  logo_url?: string | null
  is_active?: boolean
  is_avalible?: boolean
  is_available?: boolean
}

type CustomerProductDto = Partial<CustomerProduct> & {
  cost?: number
  amount?: number
  logo?: string | null
  photo_url?: string | null
  shop_id?: string
  shop_name?: string
  shop_title?: string
  is_avalible?: boolean
  is_available?: boolean
}

type CustomerOrderResponseDto = Partial<CustomerOrderResponse> & {
  guest_order_id?: string | null
  payment_url?: string | null
  stripe_url?: string | null
  checkout_url?: string | null
}

type ListDto<T> = T[] | CustomerListResponse<T> | { data: T[]; total?: number }

export function normalizeCustomerListResponse<T>(response: ListDto<T>): CustomerListResponse<T> {
  if (Array.isArray(response)) {
    return {
      items: response,
      total: response.length,
    }
  }

  if ('data' in response) {
    return {
      items: response.data,
      total: response.total ?? response.data.length,
    }
  }

  return {
    items: response.items,
    total: response.total ?? response.items.length,
  }
}

export function normalizeCustomerShop(shop: CustomerShopDto): CustomerShop {
  return {
    id: shop.id ?? '',
    title: shop.title ?? shop.name ?? '',
    description: shop.description ?? '',
    logoUrl: shop.logoUrl ?? shop.logo_url ?? shop.logo ?? null,
    isAvailable: shop.isAvailable ?? shop.is_available ?? shop.is_avalible ?? shop.is_active ?? true,
  }
}

export function normalizeCustomerProduct(product: CustomerProductDto): CustomerProduct {
  const quantity = product.quantity ?? product.amount ?? 0

  return {
    id: product.id ?? '',
    shopId: product.shopId ?? product.shop_id ?? '',
    shopTitle: product.shopTitle ?? product.shop_title ?? product.shop_name ?? '',
    title: product.title ?? '',
    description: product.description ?? '',
    price: product.price ?? product.cost ?? 0,
    quantity,
    photoUrl: product.photoUrl ?? product.photo_url ?? product.logo ?? null,
    isAvailable: product.isAvailable ?? product.is_available ?? product.is_avalible ?? quantity > 0,
  }
}

export function normalizeCustomerOrderResponse(order: CustomerOrderResponseDto): CustomerOrderResponse {
  return {
    id: order.id ?? '',
    guestOrderId: order.guestOrderId ?? order.guest_order_id ?? null,
    paymentUrl: order.paymentUrl ?? order.payment_url ?? order.stripe_url ?? order.checkout_url ?? null,
  }
}

export const customerApi = {
  getShops(params?: CustomerListParams) {
    return apiClient
      .get<ListDto<CustomerShopDto>>('/shops', { params })
      .then(response => normalizeCustomerListResponse(response.data))
      .then(response => ({
        ...response,
        items: response.items.map(normalizeCustomerShop),
      }))
  },

  getShop(shopId: string) {
    return apiClient.get<CustomerShopDto | null>(`/shops/${shopId}`).then(response => (
      response.data ? normalizeCustomerShop(response.data) : null
    ))
  },

  getShopProducts(shopId: string, params?: CustomerListParams) {
    return apiClient
      .get<ListDto<CustomerProductDto>>(`/shops/${shopId}/products`, { params })
      .then(response => normalizeCustomerListResponse(response.data))
      .then(response => ({
        ...response,
        items: response.items.map(normalizeCustomerProduct),
      }))
  },

  getProduct(shopId: string, productId: string) {
    return apiClient
      .get<CustomerProductDto | null>(`/shops/${shopId}/products/${productId}`)
      .then(response => (response.data ? normalizeCustomerProduct(response.data) : null))
  },

  createOrder(payload: CustomerOrderPayload) {
    return apiClient
      .post<CustomerOrderResponseDto>('/orders', payload)
      .then(response => normalizeCustomerOrderResponse(response.data))
  },

  getGuestOrder(orderId: string) {
    return apiClient
      .get<CustomerOrderResponseDto>(`/orders/${orderId}`)
      .then(response => normalizeCustomerOrderResponse(response.data))
  },
}
