<template>
  <div :class="[
    type === 'textarea' ? 'el-textarea' : 'el-input',
    inputSize ? 'el-input--' + inputSize : '',
     {
      'is-disabled': inputDisabled,
      'el-input-group': $slots.prepend || $slots.append,
      'el-input-group--append': $slots.append,
      'el-input-group--prepend': $slots.prepend,
      'el-input--prefix': $slots.prefix || prefixIcon,
      'el-input--suffix': $slots.suffix || suffixIcon || clearable
    }
  ]" @mouseenter="hovering = true" @mouseleave="hovering = false">
    <template v-if="type !== 'textarea'">
      <input :tabindex="tabindex" class="el-input__inner" v-bind="$attrs" :type="type" :disabled="inputDisabled" :readonly="readonly" :autocomplete="autocomplete" :value="currentValue" ref="input" @compositionstart="handleComposition" @compositionupdate="handleComposition" @compositionend="handleComposition" @input="handleInput" @focus="handleFocus" @blur="handleBlur" @change="handleChange">
      <span class="el-input__suffix" v-if="$slots.suffix || suffixIcon || showClear">
        <span class="el-input__suffix-inner">
          <template v-if="!showClear">
            <slot name="suffix"></slot>
            <i class="el-input__icon" v-if="suffixIcon" :class="suffixIcon">
            </i>
          </template>
          <i v-else class="el-input__icon el-icon-circle-close el-input__clear" @click="clear"></i>
          <i class="el-input__icon" v-if="validateState" :class="['el-input__validateIcon', validateIcon]"></i>
        </span>
      </span>
    </template>
  </div>
</template>

<script>
import Emitter from '@/mixins/emitter'
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
    tabindex: String
  },
  data() {
    return {
      hovering: false,
      isOnComposition: false,
      currentValue: this.value === undefined || this.value === null
        ? ''
        : this.value
    }
  },
  computed: {
    validateState() {
      // debugger

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
    }
  },
  methods: {
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
        const lastCharacter = text[text.length - 1] || ''
        this.isOnComposition = !isKorean(lastCharacter)
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
</style>