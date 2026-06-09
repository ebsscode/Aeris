<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useProduct } from '../composables/useProduct'
import { addToCart } from '../api/mockApi'
import type { Variant } from '../api/types'
import VariantSelector from './VariantSelector.vue'
import QuantityControl from './QuantityControl.vue'

const props = defineProps<{ productId: string }>()
const emit = defineEmits<{ (e: 'cart-updated', count: number): void }>()

const { product, loading, error, load } = useProduct()

// ---- Selection state -------------------------------------------------------
const selectedColor = ref('')
const selectedSize = ref('')
const quantity = ref(1)

// ---- Add-to-cart state -----------------------------------------------------
const adding = ref(false)
const feedback = ref<{ type: 'success' | 'error'; text: string } | null>(null)

// ---- Derived data ----------------------------------------------------------
function unique(values: string[] | undefined): string[] {
  return [...new Set(values ?? [])]
}

const colors = computed(() => unique(product.value?.variants.map((v) => v.color)))
const sizes = computed(() => unique(product.value?.variants.map((v) => v.size)))

const selectedVariant = computed<Variant | undefined>(() =>
  product.value?.variants.find(
    (v) => v.color === selectedColor.value && v.size === selectedSize.value,
  ),
)

const inStock = computed(() => (selectedVariant.value?.stock ?? 0) > 0)
const maxQuantity = computed(() => Math.max(selectedVariant.value?.stock ?? 0, 1))

// Sizes that are out of stock for the currently selected colour (for UI hint).
const unavailableSizes = computed(() =>
  sizes.value.filter((size) => {
    const variant = product.value?.variants.find(
      (v) => v.color === selectedColor.value && v.size === size,
    )
    return variant !== undefined && variant.stock === 0
  }),
)

// ---- Lifecycle / reactions -------------------------------------------------
onMounted(async () => {
  await load(props.productId)
  const first = product.value?.variants[0]
  if (first) {
    selectedColor.value = first.color
    selectedSize.value = first.size
  }
})

// When the selected SKU changes, reset/clamp quantity and clear stale feedback.
watch(selectedVariant, () => {
  quantity.value = 1
  feedback.value = null
})

// ---- Actions ---------------------------------------------------------------
async function handleAddToCart() {
  const variant = selectedVariant.value
  if (!variant || !inStock.value || adding.value) return

  adding.value = true
  feedback.value = null
  try {
    const result = await addToCart({
      productId: props.productId,
      skuId: variant.skuId,
      quantity: quantity.value,
    })

    if (result.success) {
      feedback.value = {
        type: 'success',
        text: `Added ${quantity.value} × ${variant.color} / ${variant.size} to your cart.`,
      }
      emit('cart-updated', result.cartCount ?? 0)
      // Reflect the reduced stock locally so the UI stays consistent.
      variant.stock = Math.max(variant.stock - quantity.value, 0)
      quantity.value = 1
    } else {
      feedback.value = {
        type: 'error',
        text: result.message ?? 'Could not add to cart.',
      }
    }
  } catch (e) {
    feedback.value = {
      type: 'error',
      text: e instanceof Error ? e.message : 'Could not add to cart. Please try again.',
    }
  } finally {
    adding.value = false
  }
}

function formatPrice(value: number): string {
  return `$${value.toLocaleString('en-US')}`
}

const currentImage = computed(() => {
  const images = product.value?.images ?? []
  return selectedColor.value === 'White' && images[1] ? images[1] : images[0]
})
</script>

<template>
  <!-- Loading state -->
  <div v-if="loading" class="state" data-testid="loading">
    <div class="spinner" aria-hidden="true"></div>
    <p>Loading product…</p>
  </div>

  <!-- API error state -->
  <div v-else-if="error" class="state state--error" data-testid="error">
    <p>⚠️ {{ error }}</p>
    <button class="btn btn--secondary" @click="load(props.productId)">Retry</button>
  </div>

  <!-- Product -->
  <div v-else-if="product" class="product" data-testid="product">
    <div class="product__media">
      <img :src="currentImage" :alt="product.name" class="product__image" />
    </div>

    <div class="product__info">
      <h1 class="product__name">{{ product.name }}</h1>

      <p class="product__price" data-testid="price">
        {{ selectedVariant ? formatPrice(selectedVariant.price) : '—' }}
      </p>

      <p
        class="product__stock"
        :class="inStock ? 'product__stock--in' : 'product__stock--out'"
        data-testid="stock"
      >
        <template v-if="!selectedVariant">Combination unavailable</template>
        <template v-else-if="inStock">In stock: {{ selectedVariant.stock }}</template>
        <template v-else>Out of stock</template>
      </p>

      <p class="product__description">{{ product.description }}</p>

      <VariantSelector
        label="Color"
        :options="colors"
        v-model="selectedColor"
      />
      <VariantSelector
        label="Size"
        :options="sizes"
        :unavailable="unavailableSizes"
        v-model="selectedSize"
      />

      <QuantityControl
        v-model="quantity"
        :max="maxQuantity"
        :disabled="!inStock"
      />

      <button
        class="btn btn--primary"
        data-testid="add-to-cart"
        :disabled="!inStock || adding || !selectedVariant"
        @click="handleAddToCart"
      >
        <template v-if="adding">Adding…</template>
        <template v-else-if="!inStock">Out of stock</template>
        <template v-else>Add to cart</template>
      </button>

      <!-- Add-to-cart feedback -->
      <p
        v-if="feedback"
        class="feedback"
        :class="`feedback--${feedback.type}`"
        :data-testid="`feedback-${feedback.type}`"
        role="status"
      >
        {{ feedback.text }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 1rem;
  color: #4b5563;
}
.state--error {
  color: #b91c1c;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.product {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
}
@media (max-width: 720px) {
  .product {
    grid-template-columns: 1fr;
  }
}
.product__image {
  width: 100%;
  border-radius: 12px;
  background: #f3f4f6;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}
.product__name {
  margin: 0 0 0.5rem;
  font-size: 1.6rem;
  color: #111827;
}
.product__price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4f46e5;
  margin: 0 0 0.25rem;
}
.product__stock {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 1rem;
}
.product__stock--in {
  color: #059669;
}
.product__stock--out {
  color: #dc2626;
}
.product__description {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn--primary {
  background: #4f46e5;
  color: #fff;
  width: 100%;
}
.btn--primary:not(:disabled):hover {
  background: #4338ca;
}
.btn--primary:disabled {
  background: #c7c9d9;
  cursor: not-allowed;
}
.btn--secondary {
  background: #fff;
  border: 1.5px solid #d1d5db;
  color: #374151;
}

.feedback {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
}
.feedback--success {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}
.feedback--error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
</style>
