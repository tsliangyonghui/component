<template>
  <div class="el-checkbox-group" role="group">
    <slot></slot>
  </div>
</template>

<script>
import Emitter from '@/mixins/emitter'
export default {
  name: 'MCheckboxGroup',
  componentName: 'MCheckboxGroup',
  mixins: [Emitter],
  inject: {
    mFormItem: {
      default: ''
    }
  },
  props: {
    value: {},
    disabled: Boolean,
    min: Number,
    max: Number,
    size: String,
    fill: String,
    textColor: String
  },

  computed: {
    _elFormItemSize() {
      return (this.mFormItem || {}).mFormItemSize
    },
    checkboxGroupSize() {
      return this.size || this._mFormItemSize
    }
  },

  watch: {
    value(value) {
      this.dispatch('MFormItem', 'm.form.change', [value])
    }
  }
}
</script>

<style>
</style>