<template>
  <div class="el-select" :class="[selectSize ? 'el-select--' + selectSize : '']" @click.stop="toggleMenu" v-clickoutside="handleClose">
    <m-input ref="reference" v-model="selectedLabel" type="text" :placeholder="currentPlaceholder" :name="name" :id="id" :autocomplete="autocomplete" :size="selectSize" :disabled="selectDisabled" :readonly="readonly" :validate-event="false" :class="{ 'is-focus': visible }" :tabindex="(multiple && filterable) ? '-1' : null" @focus="handleFocus" @blur="handleBlur" @keyup.native="debouncedOnInputChange" @keydown.native.down.stop.prevent="navigateOptions('next')" @keydown.native.up.stop.prevent="navigateOptions('prev')" @keydown.native.enter.prevent="selectOption" @keydown.native.esc.stop.prevent="visible = false" @keydown.native.tab="visible = false" @paste.native="debouncedOnInputChange" @mouseenter.native="inputHovering = true" @mouseleave.native="inputHovering = false">
      <template slot="prefix" v-if="$slots.prefix">
        <slot name="prefix"></slot>
      </template>
      <template slot="suffix">
        <i v-show="!showClose" :class="['el-select__caret', 'el-input__icon', 'el-icon-' + iconClass]"></i>
        <i v-if="showClose" class="el-select__caret el-input__icon el-icon-circle-close" @click="handleClearClick"></i>
      </template>
    </m-input>
    <transition name="el-zoom-in-top" @before-enter="handleMenuEnter" @after-leave="doDestroy">
      <m-select-menu ref="popper" :append-to-body="popperAppendToBody" v-show="visible && emptyText !== false">
        <m-option :value="query" created v-if="showNewOption">
        </m-option>
      </m-select-menu>
    </transition>
  </div>
</template>

<script>
import Locale from '@/mixins/locale'
import { t } from '@/locale'
import Focus from '@/mixins/focus'
import Clickoutside from '@/utils/clickoutside'
import debounce from 'throttle-debounce/debounce'
import MSelectMenu from './select-dropdown'
import MOption from './option.vue'
export default {
  name: 'MSelect',
  componentName: 'MSelect',
  mixins: [Locale, Focus('reference')],
  components: { MSelectMenu, MOption },
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
      cachedPlaceHolder: '',
      selectedLabel: '',
      options: [],
      query: ''
    }
  },
  computed: {
    debounce() {
      return this.remote ? 300 : 0
    },
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
    placeholder(val) {
      this.cachedPlaceHolder = this.currentPlaceholder = val
    },
    selectDisabled() {
      this.$nextTick(() => {
        this.resetInputHeight()
      })
    }
  },
  methods: {
    doDestroy() {
      this.$refs.popper && this.$refs.popper.doDestroy()
    },

    handleMenuEnter() {
      this.$nextTick(() => this.scrollToOption(this.selected))
    },
    toggleMenu() {
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
    onInputChange() {
      if (this.filterable && this.query !== this.selectedLabel) {
        this.query = this.selectedLabel
        this.handleQueryChange(this.query)
      }
    }
  },

  created() {
    this.cachedPlaceHolder = this.currentPlaceholder = this.placeholder
    if (this.multiple && !Array.isArray(this.value)) {
      this.$emit('input', [])
    }
    if (!this.multiple && Array.isArray(this.value)) {
      this.$emit('input', '')
    }
    this.debouncedOnInputChange = debounce(this.debounce, () => {
      console.log(1)
      // this.onInputChange()
    })
  }
}
</script>

<style>
.el-select {
  display: inline-block;
  position: relative;
}
</style>