<template>
  <form class="el-form" :class="[
    labelPosition ? 'el-form--label-' + labelPosition : '',
    { 'el-form--inline': inline }
  ]">
    <slot></slot>
  </form>
</template>

<script>
import objectAssign from '@/utils/merge'
export default {
  name: 'MForm',
  componentName: 'MForm',
  provide() {
    return {
      mForm: this
    }
  },
  props: {
    model: Object,
    rules: Object,
    labelPosition: String,
    labelWidth: String,
    labelSuffix: {
      type: String,
      default: ''
    },
    inline: Boolean,
    inlineMessage: Boolean,
    statusIcon: Boolean,
    showMessage: {
      type: Boolean,
      default: true
    },
    size: String,
    disabled: Boolean,
    validateOnRuleChange: {
      type: Boolean,
      default: true
    },
    hideRequiredAsterisk: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fields: [],
      potentialLabelWidthArr: []
    }
  },
  computed: {
    autoLabelWidth() {
      if (!this.potentialLabelWidthArr.length) return 0
      const max = Math.max(...this.potentialLabelWidthArr)
      return max ? `${max}px` : ''
    }
  },
  watch: {
    rules() {
      // remove then add event listeners on form-item after form rules change
      this.fields.forEach(field => {
        field.removeValidateEvents()
        field.addValidateEvents()
      })

      if (this.validateOnRuleChange) {
        this.validate(() => {})
      }
    }
  },
  methods: {
    resetFields() {
      if (!this.model) {
        console.warn('[Element Warn][Form]model is required for resetFields to work.')
        return
      }
      this.fields.forEach(field => {
        field.resetField()
      })
    },
    validate(callback) {
      if (!this.model) {
        console.warn('[Element Warn][Form]model is required for validate to work!')
        return
      }

      let promise
      // if no callback, return promise
      if (typeof callback !== 'function' && window.Promise) {
        promise = new window.Promise((resolve, reject) => {
          callback = function (valid) {
            valid ? resolve(valid) : reject(valid)
          }
        })
      }

      let valid = true
      let count = 0
      // 如果需要验证的fields为空，调用验证时立刻返回callback
      if (this.fields.length === 0 && callback) {
        callback(true)
      }
      let invalidFields = {}
      this.fields.forEach(field => {
        field.validate('', (message, field) => {
          if (message) {
            valid = false
          }
          invalidFields = objectAssign({}, invalidFields, field)
          if (typeof callback === 'function' && ++count === this.fields.length) {
            callback(valid, invalidFields)
          }
        })
      })

      if (promise) {
        return promise
      }
    },
    getLabelWidthIndex(width) {
      const index = this.potentialLabelWidthArr.indexOf(width)
      if (index === -1) {
        throw new Error('[ElementForm]unpected width ', width)
      }
      return index
    },
    registerLabelWidth(val, oldVal) {
      if (val && oldVal) {
        const index = this.getLabelWidthIndex(oldVal)
        this.potentialLabelWidthArr.splice(index, 1, val)
      } else if (val) {
        this.potentialLabelWidthArr.push(val)
      }
    },
    deregisterLabelWidth(val) {
      const index = this.getLabelWidthIndex(val)
      this.potentialLabelWidthArr.splice(index, 1)
    },
    validateField(props, cb) {
      props = [].concat(props)
      const fields = this.fields.filter(field => {
        return props.indexOf(field.prop) !== -1
      })
      if (!fields.length) {
        console.warn('[Element Warn]please pass correct props!')
        return
      }

      fields.forEach(field => {
        field.validate('', cb)
      })
    },
    clearValidate(props = []) {
      const fields = props.length
        ? (typeof props === 'string'
          ? this.fields.filter(field => props === field.prop)
          : this.fields.filter(field => props.indexOf(field.prop) > -1)
        ) : this.fields
      fields.forEach(field => {
        field.clearValidate()
      })
    }
  },
  created() {
    this.$on('m.form.addField', (field) => {
      if (field) {
        this.fields.push(field)
      }
    })
    this.$on('m.form.removeField', (field) => {
      if (field.prop) {
        this.fields.splice(this.fields.indexOf(field), 1)
      }
    })
  }
}
</script>

<style>
.el-form--inline .el-form-item {
  display: inline-block;
  margin-right: 10px;
  vertical-align: top;
}

.el-form--inline .el-form-item__label {
  float: none;
  display: inline-block;
}

.el-form--inline .el-form-item__content {
  display: inline-block;
  vertical-align: top;
}

.el-form--inline.el-form--label-top .el-form-item__content {
  display: block;
}
</style>