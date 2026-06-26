import { apiClient } from './base'
import { compressImageForUpload } from '@shared/lib'

type UploadResponse = {
  url: string
}

type AiProductResponse = {
  title: string
  description: string
  [key: string]: unknown
}

export const uploadApi = {
  async uploadImage(file: File) {
    const prepared = await compressImageForUpload(file)
    const formData = new FormData()
    formData.append('file', prepared)

    return apiClient
      .post<UploadResponse>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(response => response.data)
  },
  async describeProduct(file: File) {
    const prepared = await compressImageForUpload(file)
    const formData = new FormData()
    formData.append('file', prepared)

    return apiClient
      .post<AiProductResponse>('/ai', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(response => response.data)
  },
}
