<template>
  <label class="el-radio-button" :class="[
      size ? 'el-radio-button--' + size : '',
      { 'is-active': value === label },
      { 'is-disabled': isDisabled },
      { 'is-focus': focus }
    ]" role="radio" :tabindex="tabIndex" @keydown.space.stop.prevent="value = isDisabled ? value : label">
    <input class="el-radio-button__orig-radio" :value="label" type="radio" v-model="value" :name="name" @change="handleChange" :disabled="isDisabled" tabindex="-1" @focus="focus = true" @blur="focus = false">
    <span class="el-radio-button__inner" :style="value === label ? activeStyle : null" @keydown.stop>
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>

<script>
import Emitter from '@/mixins/emitter'
export default {
  name: 'MRadioButton',
  mixins: [Emitter],
  props: {
    label: {},
    disabled: Boolean,
    name: String
  },
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  data() {
    return {
      focus: false
    }
  },
  computed: {
    value: {
      get() {
        return this._radioGroup.value
      },
      set(value) {
        this._radioGroup.$emit('input', value)
      }
    },
    _radioGroup() {
      let parent = this.$parent
      while (parent) {
        if (parent.$options.componentName !== 'MRadioGroup') {
          parent = parent.$parent
        } else {
          return parent
        }
      }
      return false
    },
    activeStyle() {
      return {
        backgroundColor: this._radioGroup.fill || '',
        borderColor: this._radioGroup.fill || '',
        boxShadow: this._radioGroup.fill ? `-1px 0 0 0 ${this._radioGroup.fill}` : '',
        color: this._radioGroup.textColor || ''
      }
    },
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize
    },
    size() {
      return this._radioGroup.radioGroupSize || this._elFormItemSize
    },
    isDisabled() {
      return this.disabled || this._radioGroup.disabled || (this.elForm || {}).disabled
    },
    tabIndex() {
      return (this.isDisabled || (this._radioGroup && this.value !== this.label)) ? -1 : 0
    }
  },
  methods: {
    handleChange() {
      this.$nextTick(() => {
        this.dispatch('MRadioGroup', 'handleChange', this.value)
      })
    }
  }
}
</script>
<style>
.el-radio-button,
.el-radio-button__inner {
  position: relative;
  display: inline-block;
  outline: none;
}
.el-radio-button__orig-radio {
  opacity: 0;
  outline: none;
  position: absolute;
  z-index: -1;
}
.el-radio-button:first-child .el-radio-button__inner {
  border-left: 1px solid #dcdfe6;
  border-radius: 4px 0 0 4px;
  box-shadow: none !important;
}
.el-radio-button:last-child .el-radio-button__inner {
  border-radius: 0 4px 4px 0;
}
.el-radio-button__inner {
  line-height: 1;
  white-space: nowrap;
  vertical-align: middle;
  background: #fff;
  border: 1px solid #dcdfe6;
  font-weight: 500;
  border-left: 0;
  color: #606266;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  margin: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 0;
}
.el-radio-button__orig-radio:checked + .el-radio-button__inner {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
  box-shadow: -1px 0 0 0 #409eff;
}
</style>