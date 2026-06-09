<script setup lang="ts">
import { ref } from 'vue'
import ProductDetail from './components/ProductDetail.vue'
import CartBadge from './components/CartBadge.vue'

// Product to show. Change to "ERROR" to demo the API error state.
const productId = ref('P001')
const cartCount = ref(0)

function onCartUpdated(count: number) {
  cartCount.value = count
}
</script>

<template>
  <div class="page">
    <header class="page__header">
      <span class="page__brand">CargoCraft Store</span>
      <CartBadge :count="cartCount" />
    </header>

    <main class="page__main">
      <ProductDetail :product-id="productId" @cart-updated="onCartUpdated" />
    </main>
  </div>
</template>

<style scoped>
.page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}
.page__brand {
  font-weight: 700;
  font-size: 1.15rem;
  color: #111827;
}
.page__main {
  max-width: 980px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
}
</style>
