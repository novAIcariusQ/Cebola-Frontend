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

function normalizeRatingsResponse(data: any): RatingsResponse {
  return {
    items: data?.items || [],
    averageRating: data?.avgRating ?? data?.averageRating ?? 0,
    count: data?.ratingCount ?? data?.total ?? data?.count ?? 0,
  }
}

export const ratingApi = {
  getShopRatings: async (
    shopId: string,
    page = 1,
    limit = 10
  ): Promise<RatingsResponse> => {
    const { data } = await apiClient.get<any>(
      `/shops/${shopId}/ratings`,
      { params: { page, limit } }
    )
    return normalizeRatingsResponse(data)
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
    const { data } = await apiClient.get<any>(
      `/merchant/shops/${shopId}/ratings`,
      { params: { page, limit } }
    )
    return normalizeRatingsResponse(data)
  },
}
