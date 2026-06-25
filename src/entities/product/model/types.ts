export type Product = {
  id: string
  shopId: string
  title: string
  description: string
  price: number
  quantity: number
  photoUrl?: string | null
  isAvailable: boolean
  createdAt?: string
  tags?: string
}

export type ProductFormValues = {
  title: string
  description: string
  price: number
  quantity: number
  photoUrl?: string
  isAvailable: boolean
  tags?: string
}
