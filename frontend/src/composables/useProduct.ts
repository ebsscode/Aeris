import { ref } from 'vue'
import { getProductDetail } from '../api/mockApi'
import type { Product } from '../api/types'

/**
 * Encapsulates fetching the product and the three async states
 * (loading / error / data) so components stay declarative.
 */
export function useProduct() {
  const product = ref<Product | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load(productId: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      product.value = await getProductDetail(productId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Something went wrong.'
      product.value = null
    } finally {
      loading.value = false
    }
  }

  return { product, loading, error, load }
}
