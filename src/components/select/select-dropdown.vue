<template>
  <div class="el-select-dropdown el-popper" :class="[{ 'is-multiple': $parent.multiple }, popperClass]" :style="{ minWidth: minWidth }">
    <slot></slot>
  </div>
</template>

<script>
import Popper from '@/utils/vue-popper'
export default {
  name: 'MSelectDropdown',
  componentName: 'MSelectDropdown',
  mixins: [Popper],
  data() {
    return {
      minWidth: ''
    }
  },
  computed: {
    popperClass() {
      return this.$parent.popperClass
    }
  },
  watch: {
    '$parent.inputWidth'() {
      debugger
      this.minWidth = this.$parent.$el.getBoundingClientRect().width + 'px'
    }
  },
  mounted() {
    this.referenceElm = this.$parent.$refs.reference.$el
    this.$parent.popperElm = this.popperElm = this.$el
    this.$on('updatePopper', () => {
      if (this.$parent.visible) this.updatePopper()
    })
    this.$on('destroyPopper', this.destroyPopper)
  }
}
</script>
<style lang="scss" scoped>
</style>