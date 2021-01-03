<script>
export default {
  name: 'MLabelWrap',
  props: {
    isAutoWidth: Boolean,
    updateAll: Boolean
  },
  inject: ['mForm', 'mFormItem'],
  render() {
    const slots = this.$slots.default
    if (!slots) return null
    if (this.isAutoWidth) {
      const autoLabelWidth = this.elForm.autoLabelWidth
      const style = {}
      if (autoLabelWidth && autoLabelWidth !== 'auto') {
        const marginLeft = parseInt(autoLabelWidth, 10) - this.computedWidth
        if (marginLeft) {
          style.marginLeft = marginLeft + 'px'
        }
      }
      return (<div class='el-form-item__label-wrap' style={style}>
        { slots }
      </div>)
    } else {
      return slots[0]
    }
  },
  data() {
    return {
      computedWidth: 0
    }
  },
  computed: {
    style() {
      const autoLabelWidth = this.mForm.autoLabelWidth
      const style = {}
      if (autoLabelWidth && autoLabelWidth !== 'auto') {
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
        if (action === 'update') {
          this.computedWidth = this.getLabelWidth()
        } else if (action === 'remove') {
          this.mForm.deregisterLabelWidth(this.computedWidth)
        }
      }
    }
  },
  mounted() {
    this.updateLabelWidth('update')
  },

  updated() {
    this.updateLabelWidth('update')
  },

  beforeDestroy() {
    this.updateLabelWidth('remove')
  }
}
</script>

<style>
</style>