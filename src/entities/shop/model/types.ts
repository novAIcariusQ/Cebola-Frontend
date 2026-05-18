export type Shop = {
  id: string
  ownerId?: string
  name: string
  description: string
  logoUrl?: string | null
  isActive: boolean
  createdAt?: string
}

export type ShopFormValues = {
  name: string
  description: string
  logoUrl?: string
  isActive: boolean
}
