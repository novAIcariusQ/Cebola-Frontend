import { apiClient } from './base'

export interface Rating {
  id: string
  shopId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export interface RatingsResponse {
  items: Rating[]
  averageRating: number
  count: number
}

export const ratingApi = {
  getShopRatings: async (
    shopId: string,
    page = 1,
    limit = 10
  ): Promise<RatingsResponse> => {
    const { data } = await apiClient.get<RatingsResponse>(
      `/shops/${shopId}/ratings`,
      { params: { page, limit } }
    )
    return data
  },

  submitRating: async (
    shopId: string,
    rating: number,
    comment: string
  ): Promise<Rating> => {
    const { data } = await apiClient.post<Rating>(
      `/shops/${shopId}/ratings`,
      { rating, comment }
    )
    return data
  },

  deleteRating: async (shopId: string, ratingId: string): Promise<void> => {
    await apiClient.delete(`/shops/${shopId}/ratings/${ratingId}`)
  },

  getMerchantRatings: async (
    shopId: string,
    page = 1,
    limit = 10
  ): Promise<RatingsResponse> => {
    const { data } = await apiClient.get<RatingsResponse>(
      `/merchant/shops/${shopId}/ratings`,
      { params: { page, limit } }
    )
    return data
  },
}
