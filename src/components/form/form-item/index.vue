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
import AsyncValidator from 'async-validator'
import Emitter from '@/mixins/emitter'
import { getPropByPath, noop } from '@/utils/util'
import objectAssign from '@/utils/merge'
import LabelWrap from './label-wrap'
export default {
  name: 'MFormItem',
  componentName: 'MFormItem',
  mixins: [Emitter],
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
      isNested: false,
      validateDisabled: false
    }
  },
  computed: {
    isRequired() {
      const rules = this.getRules()
      let isRequired = false

      if (rules && rules.length) {
        rules.every(rule => {
          if (rule.required) {
            isRequired = true
            return false
          }
          return true
        })
      }
      return isRequired
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
    },
    fieldValue() {
      const model = this.form.model
      if (!model || !this.prop) { return }

      let path = this.prop
      if (path.indexOf(':') !== -1) {
        path = path.replace(/:/, '.')
      }
      return getPropByPath(model, path, true).v
    }
  },
  methods: {
    resetField() {
      this.validateState = ''
      this.validateMessage = ''

      const model = this.form.model
      const value = this.fieldValue
      let path = this.prop
      if (path.indexOf(':') !== -1) {
        path = path.replace(/:/, '.')
      }

      const prop = getPropByPath(model, path, true)

      this.validateDisabled = true
      if (Array.isArray(value)) {
        prop.o[prop.k] = [].concat(this.initialValue)
      } else {
        prop.o[prop.k] = this.initialValue
      }

      // reset validateDisabled after onFieldChange triggered
      this.$nextTick(() => {
        this.validateDisabled = false
      })

      this.broadcast('MTimeSelect', 'fieldReset', this.initialValue)
    },
    clearValidate() {
      this.validateState = ''
      this.validateMessage = ''
      this.validateDisabled = false
    },
    getFilteredRule(trigger) {
      const rules = this.getRules()

      return rules.filter(rule => {
        if (!rule.trigger || trigger === '') return true
        if (Array.isArray(rule.trigger)) {
          return rule.trigger.indexOf(trigger) > -1
        } else {
          return rule.trigger === trigger
        }
      }).map(rule => objectAssign({}, rule))
    },
    validate(trigger, callback = noop) {
      this.validateDisabled = false
      const rules = this.getFilteredRule(trigger)
      if ((!rules || rules.length === 0) && this.required === undefined) {
        callback()
        return true
      }
      this.validateState = 'validating'
      const descriptor = {}
      if (rules && rules.length > 0) {
        rules.forEach(rule => {
          delete rule.trigger
        })
      }
      descriptor[this.prop] = rules
      const validator = new AsyncValidator(descriptor)
      const model = {}
      model[this.prop] = this.fieldValue
      validator.validate(model, { firstFields: true }, (errors, invalidFields) => {
        this.validateState = !errors ? 'success' : 'error'
        this.validateMessage = errors ? errors[0].message : ''
        callback(this.validateMessage, invalidFields)
        this.mForm && this.mForm.$emit('validate', this.prop, !errors, this.validateMessage || null)
      })
    },
    getRules() {
      let formRules = this.form.rules
      const selfRules = this.rules
      const requiredRule = this.required !== undefined ? { required: !!this.required } : []

      const prop = getPropByPath(formRules, this.prop || '')
      formRules = formRules ? (prop.o[this.prop || ''] || prop.v) : []

      var ret = [].concat(selfRules || formRules || []).concat(requiredRule)
      return ret
    },
    onFieldBlur() {
      this.validate('blur')
    },
    onFieldChange() {
      if (this.validateDisabled) {
        this.validateDisabled = false
        return
      }
      this.validate('change')
    },
    removeValidateEvents() {
      this.$off()
    },
    addValidateEvents() {
      const rules = this.getRules()
      if (rules.length || this.required !== undefined) {
        this.$on('m.form.blur', this.onFieldBlur)
        this.$on('m.form.change', this.onFieldChange)
      }
    },
    updateComputedLabelWidth(width) {
      this.computedLabelWidth = width ? `${width}px` : ''
    }
  },
  mounted() {
    if (this.prop) {
      this.dispatch('MForm', 'm.form.addField', [this])
      let initialValue = this.fieldValue
      if (Array.isArray(initialValue)) {
        initialValue = [].concat(initialValue)
      }
      Object.defineProperty(this, 'initialValue', {
        value: initialValue
      })
      this.addValidateEvents()
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
  float: left;
}
.el-form-item__label-wrap .el-form-item__label {
  display: inline-block;
  float: none;
}
.el-form-item__label {
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 0;
  box-sizing: border-box;
}
.el-form-item__content {
  line-height: 40px;
  position: relative;
  font-size: 14px;
}
.el-form-item__content:after,
.el-form-item__content:before {
  display: table;
  content: "";
}
.el-form-item__content:after {
  clear: both;
}
.el-form-item__content .el-input-group {
  vertical-align: top;
}
.el-form-item.is-required:not(.is-no-asterisk)
  .el-form-item__label-wrap
  > .el-form-item__label:before,
.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label:before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}

.el-form-item.is-error .el-input__inner,
.el-form-item.is-error .el-input__inner:focus,
.el-form-item.is-error .el-textarea__inner,
.el-form-item.is-error .el-textarea__inner:focus {
  border-color: #f56c6c;
}
.el-form-item__error {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  position: absolute;
  top: 100%;
  left: 0;
}

.el-form-item__error--inline {
  position: relative;
  top: auto;
  left: auto;
  display: inline-block;
  margin-left: 10px;
}
.el-zoom-in-top-enter-active,
.el-zoom-in-top-leave-active {
  opacity: 1;
  transform: scaleY(1);
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1),
    opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: center top;
}

.el-zoom-in-top-enter,
.el-zoom-in-top-leave-active {
  opacity: 0;
  transform: scaleY(0);
}
</style>