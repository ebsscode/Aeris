import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import QuantityControl from '../src/components/QuantityControl.vue'

describe('QuantityControl', () => {
  it('increments and emits the new value', async () => {
    const wrapper = mount(QuantityControl, {
      props: { modelValue: 1, max: 5 },
    })
    await wrapper.find('[aria-label="Increase quantity"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
  })

  it('disables the decrease button at the minimum', () => {
    const wrapper = mount(QuantityControl, {
      props: { modelValue: 1, max: 5 },
    })
    const dec = wrapper.find('[aria-label="Decrease quantity"]')
    expect((dec.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('disables the increase button at the max stock', () => {
    const wrapper = mount(QuantityControl, {
      props: { modelValue: 5, max: 5 },
    })
    const inc = wrapper.find('[aria-label="Increase quantity"]')
    expect((inc.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('disables both buttons when disabled', () => {
    const wrapper = mount(QuantityControl, {
      props: { modelValue: 1, max: 5, disabled: true },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.every((b) => (b.element as HTMLButtonElement).disabled)).toBe(true)
  })
})
