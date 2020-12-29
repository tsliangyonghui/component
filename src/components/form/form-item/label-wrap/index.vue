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
  computed: {
    style() {
      const autoLabelWidth = this.elForm.autoLabelWidth
      const style = {}
      if (autoLabelWidth && autoLabelWidth !== 'auto') {
        const marginLeft = parseInt(autoLabelWidth, 10) - this.computedWidth
        if (marginLeft) {
          style.marginLeft = marginLeft + 'px'
        }
      }
      return style
    }
  }
}
</script>

<style>
</style>