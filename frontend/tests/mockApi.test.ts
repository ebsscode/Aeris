import { beforeEach, describe, expect, it } from 'vitest'
import { getProductDetail, addToCart, _resetMock } from '../src/api/mockApi'

beforeEach(() => {
  _resetMock()
})

describe('getProductDetail', () => {
  it('returns the product with variants', async () => {
    const product = await getProductDetail('P001')
    expect(product.productId).toBe('P001')
    expect(product.variants.length).toBeGreaterThanOrEqual(4)
  })

  it('throws on a forced error id', async () => {
    await expect(getProductDetail('ERROR')).rejects.toThrow()
  })

  it('throws on an unknown product', async () => {
    await expect(getProductDetail('NOPE')).rejects.toThrow('not found')
  })
})

describe('addToCart', () => {
  it('succeeds and increments the cart count', async () => {
    const r1 = await addToCart({ productId: 'P001', skuId: 'SKU-BLK-128', quantity: 2 })
    expect(r1.success).toBe(true)
    expect(r1.cartCount).toBe(2)

    const r2 = await addToCart({ productId: 'P001', skuId: 'SKU-BLK-128', quantity: 1 })
    expect(r2.cartCount).toBe(3)
  })

  it('fails when stock is insufficient and does not change the count', async () => {
    // SKU-BLK-256 has stock 3.
    const r = await addToCart({ productId: 'P001', skuId: 'SKU-BLK-256', quantity: 4 })
    expect(r.success).toBe(false)
    expect(r.message).toBe('Insufficient stock')
    expect(r.cartCount).toBeUndefined()
  })

  it('fails for an out-of-stock SKU', async () => {
    // SKU-WHT-128 has stock 0.
    const r = await addToCart({ productId: 'P001', skuId: 'SKU-WHT-128', quantity: 1 })
    expect(r.success).toBe(false)
  })

  it('decrements server stock so later requests see the change', async () => {
    await addToCart({ productId: 'P001', skuId: 'SKU-BLK-256', quantity: 3 })
    const r = await addToCart({ productId: 'P001', skuId: 'SKU-BLK-256', quantity: 1 })
    expect(r.success).toBe(false) // now sold out
  })
})
