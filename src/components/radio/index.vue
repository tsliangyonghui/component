<template>
  <label class="m-el-radio" :class="[
      border && radioSize ? 'el-radio--' + radioSize : '',
      { 'is-disabled': isDisabled },
      { 'is-focus': focus },
      { 'is-bordered': border },
      { 'is-checked': model === label }
    ]">
  </label>
</template>

<script>
import Emitter from '@/mixins/emitter'
export default {
  name: 'm-radio',
  componentName: 'MRadio',
  mixins: [Emitter],
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  props: {
    value: {},
    label: {},
    disabled: Boolean,
    name: String,
    border: Boolean,
    size: String
  },
  data() {
    return {
    }
  },
  computed: {
    isGroup() {
      let parent = this.$parent
      while (parent) {
        if (parent.$options.componentName !== 'ElRadioGroup') {
          parent = parent.$parent
        } else {
          this._radioGroup = parent
          return true
        }
      }
      return false
    },
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize
    },
    radioSize() {
      const temRadioSize = this.size || this._elFormItemSize
      return this.isGroup
        ? this._radioGroup.radioGroupSize || temRadioSize
        : temRadioSize
    }
  },
  mounted() {
    debugger
    this.disabled
  },
  methods: {
    foo() {}
  }
}
</script>
<style lang="scss" scoped>
.m-el-radio {
  color: #606266;
  font-weight: 500;
  line-height: 1;
  position: relative;
  cursor: pointer;
  display: inline-block;
  white-space: nowrap;
  outline: none;
  font-size: 14px;
  margin-right: 30px;
  user-select: none;
}
</style>