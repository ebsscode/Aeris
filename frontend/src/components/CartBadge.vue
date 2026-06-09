<script setup lang="ts">
defineProps<{ count: number }>()
</script>

<template>
  <div class="cart" aria-label="Cart">
    <span class="cart__icon" aria-hidden="true">🛒</span>
    <span class="cart__count" data-testid="cart-count">{{ count }}</span>
  </div>
</template>

<style scoped>
.cart {
  position: relative;
  display: inline-flex;
  align-items: center;
  font-size: 1.5rem;
}
.cart__count {
  position: absolute;
  top: -6px;
  right: -12px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  background: #ef4444;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
}
</style>
