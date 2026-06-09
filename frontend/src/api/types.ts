// Shared types for the product / cart domain.

export interface Variant {
  skuId: string
  color: string
  size: string
  price: number
  stock: number
}

export interface Product {
  productId: string
  name: string
  description: string
  images: string[]
  variants: Variant[]
}

export interface AddToCartPayload {
  productId: string
  skuId: string
  quantity: number
}

export interface AddToCartResult {
  success: boolean
  cartCount?: number
  message?: string
}
