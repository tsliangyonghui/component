<template>
  <div class="el-form-item" :class="[{
      'el-form-item--feedback': mForm && mForm.statusIcon,
      'is-error': validateState === 'error',
      'is-validating': validateState === 'validating',
      'is-success': validateState === 'success',
      'is-required': isRequired || required,
      'is-no-asterisk': mForm && mForm.hideRequiredAsterisk
    },
    sizeClass ? 'el-form-item--' + sizeClass : ''
  ]">
    <label-wrap :is-auto-width="labelStyle.width === 'auto'" :update-all="form.labelWidth === 'auto'">
      <label :for="labelFor" class="el-form-item__label" :style="labelStyle" v-if="label || $slots.label">
        <slot name="label">{{label + form.labelSuffix}}</slot>
      </label>
    </label-wrap>
    <div class="el-form-item__content" :style="contentStyle">
      <slot></slot>
      <transition name="el-zoom-in-top">
        <slot v-if="validateState === 'error' && showMessage && form.showMessage" name="error" :error="validateMessage">
          <div class="el-form-item__error" :class="{
              'el-form-item__error--inline': typeof inlineMessage === 'boolean'
                ? inlineMessage
                : (mForm && mForm.inlineMessage || false)
            }">
            {{validateMessage}}
          </div>
        </slot>
      </transition>
    </div>
  </div>
</template>

<script>
import LabelWrap from './label-wrap'
export default {
  name: 'MFormItem',
  componentName: 'MFormItem',
  components: { LabelWrap },
  provide() {
    return {
      mFormItem: this
    }
  },
  inject: ['mForm'],
  props: {
    label: String,
    labelWidth: String,
    prop: String,
    required: {
      type: Boolean,
      default: undefined
    },
    rules: [Object, Array],
    error: String,
    validateStatus: String,
    for: String,
    inlineMessage: {
      type: [String, Boolean],
      default: ''
    },
    showMessage: {
      type: Boolean,
      default: true
    },
    size: String
  },
  data() {
    return {
      validateState: '',
      computedLabelWidth: '',
      isNested: false
    }
  },
  computed: {
    isRequired() {
      return false
    },
    labelStyle() {
      const ret = {}
      if (this.form.labelPosition === 'top') return ret
      const labelWidth = this.labelWidth || this.form.labelWidth
      if (labelWidth) {
        ret.width = labelWidth
      }
      return ret
    },
    sizeClass() {
      return this.mFormItemSize
    },
    contentStyle() {
      const ret = {}
      const label = this.label
      if (this.form.labelPosition === 'top' || this.form.inline) return ret
      if (!label && !this.labelWidth && this.isNested) return ret
      const labelWidth = this.labelWidth || this.form.labelWidth
      if (labelWidth === 'auto') {
        if (this.labelWidth === 'auto') {
          ret.marginLeft = this.computedLabelWidth
        } else if (this.form.labelWidth === 'auto') {
          ret.marginLeft = this.mForm.autoLabelWidth
        }
      } else {
        ret.marginLeft = labelWidth
      }
      return ret
    },
    labelFor() {
      return this.for || this.prop
    },
    form() {
      let parent = this.$parent
      let parentName = parent.$options.componentName
      while (parentName !== 'MForm') {
        if (parentName === 'MFormItem') {
          this.isNested = true
        }
        parent = parent.$parent
        parentName = parent.$options.componentName
      }
      return parent
    }
  },
  methods: {
    updateComputedLabelWidth(width) {
      this.computedLabelWidth = width ? `${width}px` : ''
    }
  }
}
</script>

<style>
.el-form-item {
  margin-bottom: 22px;
}

.el-form-item:after,
.el-form-item:before {
  display: table;
  content: "";
}

.el-form-item:after {
  clear: both;
}

.el-form-item .el-form-item {
  margin-bottom: 0;
}
.el-form-item__label-wrap {
    float: left
}
.el-form-item__label-wrap .el-form-item__label {
    display: inline-block;
    float: none
}
.el-form-item__label {
    text-align: right;
    vertical-align: middle;
    float: left;
    font-size: 14px;
    color: #606266;
    line-height: 40px;
    padding: 0 12px 0 0;
    box-sizing: border-box
}
.el-form-item__content {
    line-height: 40px;
    position: relative;
    font-size: 14px
}
.el-form-item__content:after,.el-form-item__content:before {
    display: table;
    content: ""
}
.el-form-item__content:after {
    clear: both
}
.el-form-item__content .el-input-group {
    vertical-align: top
}
</style>