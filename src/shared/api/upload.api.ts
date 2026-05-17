import { apiClient } from './base'

type UploadResponse = {
  url: string
}

type AiProductResponse = {
  title: string
  description: string
  [key: string]: unknown
}

export const uploadApi = {
  uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient
      .post<UploadResponse>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(response => response.data)
  },
  describeProduct(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient
      .post<AiProductResponse>('/ai', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(response => response.data)
  },
}
