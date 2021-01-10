<template>
<div
    class="el-select"
    :class="[selectSize ? 'el-select--' + selectSize : '']"
    @click.stop="toggleMenu"
    v-clickoutside="handleClose">
    aa
  </div>
</template>

<script>
import Locale from '@/mixins/locale'
import Focus from '@/mixins/focus'
import Clickoutside from '@/utils/clickoutside'
export default {
  name: 'MSelect',
  componentName: 'MSelect',
  mixins: [Locale, Focus('reference')],
  directives: { Clickoutside },
  inject: {
    mForm: {
      default: ''
    },
    mFormItem: {
      default: ''
    }
  },
  provide() {
    return {
      'select': this
    }
  },
  props: {
    name: String,
    id: String,
    value: {
      required: true
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    automaticDropdown: Boolean,
    size: String,
    disabled: Boolean,
    clearable: Boolean,
    filterable: Boolean,
    allowCreate: Boolean,
    loading: Boolean,
    popperClass: String,
    remote: Boolean,
    loadingText: String,
    noMatchText: String,
    noDataText: String,
    remoteMethod: Function,
    filterMethod: Function,
    multiple: Boolean,
    multipleLimit: {
      type: Number,
      default: 0
    },
    placeholder: {
      type: String,
      default() {
        debugger
        return t('el.select.placeholder')
      }
    },
    defaultFirstOption: Boolean,
    reserveKeyword: Boolean,
    valueKey: {
      type: String,
      default: 'value'
    },
    collapseTags: Boolean,
    popperAppendToBody: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: false,
      currentPlaceholder: '',
      selectedLabel: '',
      options: [],
      query: ''
    }
  },
  computed: {
    emptyText() {
      if (this.loading) {
        return this.loadingText || this.t('el.select.loading')
      } else {
        if (this.remote && this.query === '' && this.options.length === 0) return false
        if (this.filterable && this.query && this.options.length > 0 && this.filteredOptionsCount === 0) {
          return this.noMatchText || this.t('el.select.noMatch')
        }
        if (this.options.length === 0) {
          return this.noDataText || this.t('el.select.noData')
        }
      }
      return null
    },
    showNewOption() {
      const hasExistingOption = this.options.filter(option => !option.created)
        .some(option => option.currentLabel === this.query)
      return this.filterable && this.allowCreate && this.query !== '' && !hasExistingOption
    },
    iconClass() {
      return this.remote && this.filterable ? '' : (this.visible ? 'arrow-up is-reverse' : 'arrow-up')
    },
    showClose() {
      const hasValue = this.multiple
        ? Array.isArray(this.value) && this.value.length > 0
        : this.value !== undefined && this.value !== null && this.value !== ''
      const criteria = this.clearable &&
          !this.selectDisabled &&
          this.inputHovering &&
          hasValue
      return criteria
    },
    readonly() {
      return !this.filterable || this.multiple || (!isIE() && !isEdge() && !this.visible)
    },
    selectSize() {
      return this.size || this._mFormItemSize
    },
    selectDisabled() {
      return this.disabled || (this.mForm || {}).disabled
    }
  },
  watch: {
    selectDisabled() {
      this.$nextTick(() => {
        this.resetInputHeight()
      })
    }
  },
  methods: {
    toggleMenu() {
      debugger
      // if (!this.selectDisabled) {
      //   if (this.menuVisibleOnFocus) {
      //     this.menuVisibleOnFocus = false
      //   } else {
      //     this.visible = !this.visible
      //   }
      //   if (this.visible) {
      //     (this.$refs.input || this.$refs.reference).focus()
      //   }
      // }
    },
    handleClose() {
      debugger
      this.visible = false
    },
    handleFocus(event) {
      if (!this.softFocus) {
        if (this.automaticDropdown || this.filterable) {
          this.visible = true
          if (this.filterable) {
            this.menuVisibleOnFocus = true
          }
        }
        this.$emit('focus', event)
      } else {
        this.softFocus = false
      }
    },
    handleBlur(event) {
      setTimeout(() => {
        if (this.isSilentBlur) {
          this.isSilentBlur = false
        } else {
          this.$emit('blur', event)
        }
      }, 50)
      this.softFocus = false
    },
    handleMenuEnter() {
      this.$nextTick(() => this.scrollToOption(this.selected))
    },
    doDestroy() {
      this.$refs.popper && this.$refs.popper.doDestroy()
    }
  }
}
</script>

<style>
.el-select {
    display: inline-block;
    position: relative
}

</style>