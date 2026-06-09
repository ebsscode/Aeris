<script setup lang="ts">
import { computed } from 'vue'

// Stepper for quantity. Clamps to [min, max] and disables the +/- buttons at
// the bounds. `max` is the available stock of the selected SKU.

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max: number
    disabled?: boolean
  }>(),
  { min: 1, disabled: false },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const canDecrease = computed(() => !props.disabled && props.modelValue > props.min)
const canIncrease = computed(() => !props.disabled && props.modelValue < props.max)

function decrease() {
  if (canDecrease.value) emit('update:modelValue', props.modelValue - 1)
}
function increase() {
  if (canIncrease.value) emit('update:modelValue', props.modelValue + 1)
}
function onInput(event: Event) {
  const raw = Number((event.target as HTMLInputElement).value)
  if (Number.isNaN(raw)) return
  const clamped = Math.min(Math.max(Math.trunc(raw), props.min), Math.max(props.max, props.min))
  emit('update:modelValue', clamped)
}
</script>

<template>
  <div class="qty">
    <span class="qty__label">Quantity:</span>
    <div class="qty__control">
      <button
        type="button"
        class="qty__btn"
        :disabled="!canDecrease"
        aria-label="Decrease quantity"
        @click="decrease"
      >
        −
      </button>
      <input
        class="qty__input"
        type="number"
        :min="min"
        :max="max"
        :value="modelValue"
        :disabled="disabled"
        @input="onInput"
      />
      <button
        type="button"
        class="qty__btn"
        :disabled="!canIncrease"
        aria-label="Increase quantity"
        @click="increase"
      >
        +
      </button>
    </div>
  </div>
</template>

<style scoped>
.qty {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.25rem 0;
}
.qty__label {
  font-weight: 600;
  color: #374151;
}
.qty__control {
  display: inline-flex;
  align-items: stretch;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}
.qty__btn {
  width: 2.5rem;
  border: none;
  background: #f9fafb;
  font-size: 1.25rem;
  cursor: pointer;
  color: #374151;
}
.qty__btn:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}
.qty__btn:not(:disabled):hover {
  background: #eef2ff;
}
.qty__input {
  width: 3.5rem;
  text-align: center;
  border: none;
  border-left: 1.5px solid #e5e7eb;
  border-right: 1.5px solid #e5e7eb;
  font-size: 1rem;
}
.qty__input:disabled {
  background: #f3f4f6;
}
/* Hide native number spinners for a cleaner look. */
.qty__input::-webkit-outer-spin-button,
.qty__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.qty__input {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
