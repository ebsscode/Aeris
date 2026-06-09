<script setup lang="ts">
// A generic single-dimension variant picker (e.g. Color or Size).
// Renders one button per option and emits the chosen value.

defineProps<{
  label: string
  options: string[]
  modelValue: string
  /** Options that cannot be selected in any in-stock combination. */
  unavailable?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function select(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="variant">
    <span class="variant__label">{{ label }}:</span>
    <div class="variant__options">
      <button
        v-for="option in options"
        :key="option"
        type="button"
        class="variant__option"
        :class="{
          'variant__option--active': option === modelValue,
          'variant__option--unavailable': unavailable?.includes(option),
        }"
        :aria-pressed="option === modelValue"
        @click="select(option)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.variant {
  margin-bottom: 1.25rem;
}
.variant__label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}
.variant__options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.variant__option {
  padding: 0.5rem 1rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.15s ease;
}
.variant__option:hover {
  border-color: #6366f1;
}
.variant__option--active {
  border-color: #4f46e5;
  background: #eef2ff;
  color: #4338ca;
  font-weight: 600;
}
.variant__option--unavailable {
  position: relative;
  color: #9ca3af;
}
.variant__option--unavailable::after {
  content: '';
  position: absolute;
  left: 10%;
  right: 10%;
  top: 50%;
  border-top: 1px solid #d1d5db;
}
</style>
