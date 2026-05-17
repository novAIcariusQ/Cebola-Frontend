export type Product = {
  id: string
  shopId: string
  title: string
  description: string
  price: number
  photoUrl?: string | null
  isAvailable: boolean
  createdAt?: string
}

export type ProductFormValues = {
  title: string
  description: string
  price: number
  photoUrl?: string
  isAvailable: boolean
}
