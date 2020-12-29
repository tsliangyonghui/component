<template>
  <div v-if="isAutoWidth" class="el-form-item__label-wrap" :style="style">
    <slot></slot>
  </div>
  <div v-else>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'MLabelWrap',
  props: {
    isAutoWidth: Boolean,
    updateAll: Boolean
  },
  inject: ['mForm', 'mFormItem'],
  computed: {
    style() {
      const autoLabelWidth = this.mForm.autoLabelWidth
      const style = {}
      if (autoLabelWidth && autoLabelWidth !== 'auto') {
        debugger
        const marginLeft = parseInt(autoLabelWidth, 10) - this.computedWidth
        if (marginLeft) {
          style.marginLeft = marginLeft + 'px'
        }
      }
      return style
    }
  },
  watch: {
    computedWidth(val, oldVal) {
      debugger
      if (this.updateAll) {
        this.mForm.registerLabelWidth(val, oldVal)
        this.mFormItem.updateComputedLabelWidth(val)
      }
    }
  },
  methods: {
    getLabelWidth() {
      if (this.$el && this.$el.firstElementChild) {
        const computedWidth = window.getComputedStyle(this.$el.firstElementChild).width
        return Math.ceil(parseFloat(computedWidth))
      } else {
        return 0
      }
    },
    updateLabelWidth(action = 'update') {
      if (this.$slots.default && this.isAutoWidth && this.$el.firstElementChild) {
        debugger
        if (action === 'update') {
          this.computedWidth = this.getLabelWidth()
        } else if (action === 'remove') {
          this.mForm.deregisterLabelWidth(this.computedWidth)
        }
      }
    }
  },
  mounted() {
    debugger
    this.updateLabelWidth('update')
  },

  updated() {
    debugger
    this.updateLabelWidth('update')
  },

  beforeDestroy() {
    debugger
    this.updateLabelWidth('remove')
  }
}
</script>

<style>
</style>