import type { Order } from '@entities/order'
import type { Product, ProductFormValues } from '@entities/product'
import type { Shop, ShopFormValues } from '@entities/shop'
import { apiClient } from './base'

type MerchantListParams = {
  page?: number
  limit?: number
  q?: string
}

export type MerchantListResponse<T> = {
  items: T[]
  page?: number
  limit?: number
  total?: number
}

export const merchantApi = {
  getShops(params?: MerchantListParams) {
    return apiClient
      .get<Shop[] | MerchantListResponse<Shop>>('/merchant/shops', { params })
      .then(response => response.data)
  },
  getShop(shopId?: string) {
    if (shopId) {
      return apiClient.get<Shop | null>(`/merchant/shops/${shopId}`).then(response => response.data)
    }

    return apiClient.get<Shop | null>('/merchant/shop').then(response => response.data)
  },
  createShop(payload: ShopFormValues) {
    return apiClient.post<Shop>('/merchant/shop', payload).then(response => response.data)
  },
  updateShop(shopId: string, payload: ShopFormValues) {
    return apiClient.put<Shop>(`/merchant/shops/${shopId}`, payload).then(response => response.data)
  },
  getProducts() {
    return apiClient.get<Product[]>('/merchant/products').then(response => response.data)
  },
  createProduct(payload: ProductFormValues) {
    return apiClient.post<Product>('/merchant/products', payload).then(response => response.data)
  },
  updateProduct(productId: string, payload: ProductFormValues) {
    return apiClient.put<Product>(`/merchant/products/${productId}`, payload).then(response => response.data)
  },
  deleteProduct(productId: string) {
    return apiClient.delete<void>(`/merchant/products/${productId}`).then(response => response.data)
  },
  getOrders() {
    return apiClient.get<Order[]>('/merchant/orders').then(response => response.data)
  },
}
