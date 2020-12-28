<template>
  <div :class="[
    type === 'textarea' ? 'el-textarea' : 'el-input',
    inputSize ? 'el-input--' + inputSize : '',
     {
      'is-disabled': inputDisabled,
       'is-exceed': inputExceed,
      'el-input-group': $slots.prepend || $slots.append,
      'el-input-group--append': $slots.append,
      'el-input-group--prepend': $slots.prepend,
      'el-input--prefix': $slots.prefix || prefixIcon,
      'el-input--suffix': $slots.suffix || suffixIcon || clearable || showPassword
    }
  ]" @mouseenter="hovering = true" @mouseleave="hovering = false">
    <template v-if="type !== 'textarea'">
      <div class="el-input-group__prepend" v-if="$slots.prepend">
        <slot name="prepend"></slot>
      </div>
      <input :tabindex="tabindex" class="el-input__inner" v-bind="$attrs" :type="showPassword ? (passwordVisible ? 'text': 'password') : type" :disabled="inputDisabled" :readonly="readonly" :autocomplete="autocomplete" ref="input" @compositionstart="handleCompositionStart" @compositionupdate="handleCompositionUpdate" @compositionend="handleCompositionEnd" @input="handleInput" @focus="handleFocus" @blur="handleBlur" @change="handleChange">
      <span class="el-input__prefix" v-if="$slots.prefix || prefixIcon">
        <slot name="prefix"></slot>
        <i class="el-input__icon" v-if="prefixIcon" :class="prefixIcon">
        </i>
      </span>
      <span class="el-input__suffix" v-if="getSuffixVisible">
        <span class="el-input__suffix-inner">
          <template v-if="!showClear || !showPwdVisible ">
            <slot name="suffix"></slot>
            <i class="el-input__icon" v-if="suffixIcon" :class="suffixIcon">
            </i>
          </template>
          <i v-if="showClear" class="el-input__icon el-icon-circle-close el-input__clear" @click="clear" @mousedown.prevent></i>
          <i v-if="showPwdVisible" class="el-input__icon el-icon-view el-input__clear" @click="handlePasswordVisible"></i>
          <span v-if="isWordLimitVisible" class="el-input__count">
            <span class="el-input__count-inner">
              {{ textLength }}/{{ upperLimit }}
            </span>
          </span>
          <i class="el-input__icon" v-if="validateState" :class="['el-input__validateIcon', validateIcon]"></i>
        </span>
      </span>
      <div class="el-input-group__append" v-if="$slots.append">
        <slot name="append"></slot>
      </div>
    </template>
    <textarea v-else :tabindex="tabindex" class="el-textarea__inner" @compositionstart="handleCompositionStart" @compositionupdate="handleCompositionUpdate" @compositionend="handleCompositionEnd" @input="handleInput" ref="textarea" v-bind="$attrs" :disabled="inputDisabled" :readonly="readonly" :autocomplete="autocomplete" :style="textareaStyle" @focus="handleFocus" @blur="handleBlur" @change="handleChange" :aria-label="label">
    </textarea>
    <span v-if="isWordLimitVisible && type === 'textarea'" class="el-input__count">{{ textLength }}/{{ upperLimit }}</span>
  </div>
</template>

<script>
import Emitter from '@/mixins/emitter'
import merge from '@/mixins/merge'
import calcTextareaHeight from './calcTextareaHeight'
export default {
  name: 'MInput',
  componentName: 'MInput',
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
    value: [String, Number],
    size: String,
    resize: String,
    form: String,
    disabled: Boolean,
    readonly: Boolean,
    type: {
      type: String,
      default: 'text'
    },
    autosize: {
      type: [Boolean, Object],
      default: false
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    validateEvent: {
      type: Boolean,
      default: true
    },
    suffixIcon: String,
    prefixIcon: String,
    label: String,
    clearable: {
      type: Boolean,
      default: false
    },
    showPassword: {
      type: Boolean,
      default: false
    },
    showWordLimit: {
      type: Boolean,
      default: false
    },
    tabindex: String
  },
  data() {
    return {
      hovering: false,
      focused: false,
      isOnComposition: false,
      passwordVisible: false,
      isComposing: false,
      textareaCalcStyle: {},
      currentValue: this.value == null ? '' : this.value
    }
  },
  computed: {
    getSuffixVisible() {
      return this.$slots.suffix ||
        this.suffixIcon ||
        this.showClear ||
        this.showPassword ||
        this.isWordLimitVisible ||
        (this.validateState && this.needStatusIcon)
    },
    inputExceed() {
      return this.isWordLimitVisible &&
        (this.textLength > this.upperLimit)
    },
    upperLimit() {
      return this.$attrs.maxlength
    },
    textLength() {
      if (typeof this.value === 'number') {
        return String(this.value).length
      }

      return (this.value || '').length
    },
    isWordLimitVisible() {
      return this.showWordLimit &&
        this.$attrs.maxlength &&
        (this.type === 'text' || this.type === 'textarea') &&
        !this.inputDisabled &&
        !this.readonly &&
        !this.showPassword
    },
    nativeInputValue() {
      return this.value === null || this.value === undefined ? '' : String(this.value)
    },
    showPwdVisible() {
      return this.showPassword &&
        !this.inputDisabled &&
        !this.readonly &&
        (!!this.nativeInputValue || this.focused)
    },
    validateState() {
      return this.elFormItem ? this.elFormItem.validateState : ''
    },
    inputSize() {
      return this.size || this._elFormItemSize
    },
    inputDisabled() {
      return this.disabled || (this.elForm || {}).disabled
    },
    showClear() {
      return this.clearable &&
        !this.inputDisabled &&
        !this.readonly &&
        this.currentValue !== '' &&
        (this.focused || this.hovering)
    },
    textareaStyle() {
      return merge({}, this.textareaCalcStyle, { resize: this.resize })
    }
  },
  mounted() {
    this.resizeTextarea()
  },
  methods: {
    resizeTextarea() {
      const { autosize, type } = this
      if (type !== 'textarea') return
      if (!autosize) {
        this.textareaCalcStyle = {
          minHeight: calcTextareaHeight(this.$refs.textarea).minHeight
        }
        return
      }
      const minRows = autosize.minRows
      const maxRows = autosize.maxRows

      this.textareaCalcStyle = calcTextareaHeight(this.$refs.textarea, minRows, maxRows)
    },
    getInput() {
      return this.$refs.input || this.$refs.textarea
    },
    focus() {
      this.getInput().focus()
    },
    blur() {
      this.getInput().blur()
    },
    handleBlur(event) {
      this.focused = false
      this.$emit('blur', event)
      if (this.validateEvent) {
        this.dispatch('ElFormItem', 'el.form.blur', [this.currentValue])
      }
    },
    handleFocus(event) {
      this.focused = true
      this.$emit('focus', event)
    },
    handleComposition(event) {
      if (event.type === 'compositionend') {
        this.isOnComposition = false
        this.currentValue = this.valueBeforeComposition
        this.valueBeforeComposition = null
        this.handleInput(event)
      } else {
        const text = event.target.value
        this.isOnComposition = true
        if (this.isOnComposition && event.type === 'compositionstart') {
          this.valueBeforeComposition = text
        }
      }
    },
    setCurrentValue(value) {
      if (this.isOnComposition && value === this.valueBeforeComposition) return
      this.currentValue = value
      if (this.isOnComposition) return
      this.$nextTick(this.resizeTextarea)
      if (this.validateEvent && this.currentValue === this.value) {
        this.dispatch('ElFormItem', 'el.form.change', [value])
      }
    },
    handleInput(event) {
      const value = event.target.value
      this.setCurrentValue(value)
      if (this.isOnComposition) return
      this.$emit('input', value)
    },
    handleChange(event) {
      this.$emit('change', event.target.value)
    },
    handlePasswordVisible() {
      this.passwordVisible = !this.passwordVisible
      this.focus()
    },
    handleCompositionStart() {
      this.isComposing = true
    },
    handleCompositionUpdate(event) {
      this.isComposing = true
    },
    handleCompositionEnd(event) {
      if (this.isComposing) {
        this.isComposing = false
        this.handleInput(event)
      }
    },
    clear() {
      this.$emit('input', '')
      this.$emit('change', '')
      this.$emit('clear')
      this.setCurrentValue('')
    }
  }
}
</script>

<style>
.el-input {
  position: relative;
  font-size: 14px;
  display: inline-block;
  width: 100%;
}
.el-input__inner {
  -webkit-appearance: none;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}
.el-input__inner::placeholder {
  color: #c0c4cc;
}

.el-input__inner:hover {
  border-color: #c0c4cc;
}

.el-input__inner:focus {
  border-color: #409eff;
}
.el-input.is-disabled .el-input__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}
.el-input--suffix .el-input__inner {
  padding-right: 30px;
}
.el-input__suffix {
  position: absolute;
  height: 100%;
  right: 5px;
  top: 0;
  text-align: center;
  color: #c0c4cc;
  transition: all 0.3s;
  pointer-events: none;
}

.el-input__suffix-inner {
  pointer-events: all;
}

.el-input__prefix {
  position: absolute;
  left: 5px;
  top: 0;
  color: #c0c4cc;
}
.el-input__icon,
.el-input__prefix {
  height: 100%;
  text-align: center;
  transition: all 0.3s;
}

.el-input__icon {
  width: 25px;
  line-height: 40px;
}

.el-input__icon:after {
  content: "";
  height: 100%;
  width: 0;
  display: inline-block;
  vertical-align: middle;
}
.el-input-group {
  line-height: normal;
  display: inline-table;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.el-input-group__append,
.el-input-group__prepend {
  background-color: #f5f7fa;
  color: #909399;
  vertical-align: middle;
  display: table-cell;
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 20px;
  width: 1px;
  white-space: nowrap;
}
.el-input-group__prepend {
  border-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.el-input-group--prepend .el-input__inner,
.el-input-group__append {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.el-input-group--append .el-input__inner {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.el-input-group__append {
  border-left: 0;
}
.el-input .el-input__count {
  height: 100%;
  display: inline-flex;
  align-items: center;
  color: #909399;
  font-size: 12px;
}
.el-textarea {
  position: relative;
  display: inline-block;
  width: 100%;
  vertical-align: bottom;
  font-size: 14px;
}

.el-textarea__inner {
  display: block;
  resize: vertical;
  padding: 5px 15px;
  line-height: 1.5;
  box-sizing: border-box;
  width: 100%;
  font-size: inherit;
  color: #606266;
  background-color: #fff;
  background-image: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.el-textarea__inner::placeholder {
  color: #c0c4cc;
}

.el-textarea__inner:hover {
  border-color: #c0c4cc;
}

.el-textarea__inner:focus {
  outline: none;
  border-color: #409eff;
}

.el-textarea .el-input__count {
  color: #909399;
  background: #fff;
  position: absolute;
  font-size: 12px;
  bottom: 5px;
  right: 10px;
}

.el-textarea.is-disabled .el-textarea__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

.el-textarea.is-disabled .el-textarea__inner::placeholder {
  color: #c0c4cc;
}

.el-textarea.is-exceed .el-textarea__inner {
  border-color: #f56c6c;
}

.el-textarea.is-exceed .el-input__count {
  color: #f56c6c;
}
</style>