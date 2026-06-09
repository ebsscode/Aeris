// Mock API service layer.
//
// No real backend is required. These functions simulate network latency and
// behave like a tiny in-memory server: stock is decremented on a successful
// add-to-cart, and a running cart count is kept. This lets the UI exercise all
// the required states (loading, error, out-of-stock, success, failure).

import type {
  Product,
  AddToCartPayload,
  AddToCartResult,
} from './types'

// Simulated network latency (ms). Kept small so tests stay fast.
const LATENCY = 500

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// SVG placeholder so the demo works fully offline (no external image host).
function placeholderImage(label: string, bg: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
      <rect width="100%" height="100%" fill="${bg}"/>
      <text x="50%" y="50%" fill="#ffffff" font-family="Arial, sans-serif"
            font-size="40" text-anchor="middle" dominant-baseline="middle">
        ${label}
      </text>
    </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// The canonical product "stored on the server". Note one SKU is intentionally
// out of stock and one has low stock, to demonstrate the edge cases.
function createProduct(): Product {
  return {
    productId: 'P001',
    name: 'Aurora Wireless Headphones',
    description:
      'Premium over-ear wireless headphones with active noise cancellation, ' +
      '40-hour battery life and ultra-low-latency audio. Choose your colour and storage tier.',
    images: [
      placeholderImage('Aurora — Black', '#1f2937'),
      placeholderImage('Aurora — White', '#9ca3af'),
    ],
    variants: [
      { skuId: 'SKU-BLK-128', color: 'Black', size: '128GB', price: 1299, stock: 10 },
      { skuId: 'SKU-BLK-256', color: 'Black', size: '256GB', price: 1599, stock: 3 },
      { skuId: 'SKU-WHT-128', color: 'White', size: '128GB', price: 1299, stock: 0 },
      { skuId: 'SKU-WHT-256', color: 'White', size: '256GB', price: 1599, stock: 5 },
    ],
  }
}

// Mutable server-side state.
let serverProduct: Product = createProduct()
let cartCount = 0

/**
 * GET /api/product/:productId
 *
 * Pass productId `"ERROR"` to force a failure (useful for demoing the error
 * state in the UI and for tests).
 */
export async function getProductDetail(productId: string): Promise<Product> {
  await delay(LATENCY)

  if (productId === 'ERROR') {
    throw new Error('Failed to load product. Please try again later.')
  }
  if (productId !== serverProduct.productId) {
    throw new Error('Product not found.')
  }

  // Return a deep copy so the UI can never mutate server state directly.
  return structuredCloneSafe(serverProduct)
}

/**
 * POST /api/cart
 *
 * Validates against the live server stock. On success the stock is decremented
 * and the new cart count is returned. On failure the cart count is unchanged.
 */
export async function addToCart(payload: AddToCartPayload): Promise<AddToCartResult> {
  await delay(LATENCY)

  const variant = serverProduct.variants.find((v) => v.skuId === payload.skuId)

  if (!variant) {
    return { success: false, message: 'Selected variant does not exist.' }
  }
  if (!Number.isInteger(payload.quantity) || payload.quantity < 1) {
    return { success: false, message: 'Quantity must be at least 1.' }
  }
  if (variant.stock < payload.quantity) {
    return { success: false, message: 'Insufficient stock' }
  }

  variant.stock -= payload.quantity
  cartCount += payload.quantity
  return { success: true, cartCount }
}

/** Reset server state. Used by tests; harmless in the app. */
export function _resetMock(): void {
  serverProduct = createProduct()
  cartCount = 0
}

// structuredClone is available in modern runtimes; fall back to JSON for older
// jsdom/node versions used in tests.
function structuredCloneSafe<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value))
}
