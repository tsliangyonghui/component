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
        <m-scrollbar tag="ul" wrap-class="el-select-dropdown__wrap" view-class="el-select-dropdown__list" ref="scrollbar" :class="{ 'is-empty': !allowCreate && query && filteredOptionsCount === 0 }" v-show="showScrollbar">
          <m-option :value="query" created v-if="showNewOption">
          </m-option>
          <slot></slot>
        </m-scrollbar>
      </m-select-menu>
    </transition>
  </div>
</template>

<script>
import Emitter from '@/mixins/emitter'
import Locale from '@/mixins/locale'
import { t } from '@/locale'
import Focus from '@/mixins/focus'
import Clickoutside from '@/utils/clickoutside'
import debounce from 'throttle-debounce/debounce'
import MSelectMenu from './select-dropdown'
import { getValueByPath, isIE, isEdge } from '@/utils/util'
import scrollIntoView from '@/utils/scroll-into-view'
export default {
  name: 'MSelect',
  componentName: 'MSelect',
  mixins: [Emitter, Locale, Focus('reference')],
  components: { MSelectMenu },
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
      createdSelected: false,
      menuVisibleOnFocus: false,
      currentPlaceholder: '',
      cachedPlaceHolder: '',
      selectedLabel: '',
      options: [],
      cachedOptions: [],
      optionsCount: 0,
      filteredOptionsCount: 0,
      selected: this.multiple ? [] : {},
      query: '',
      inputWidth: 0,
      initialInputHeight: 0,
      isSilentBlur: false
    }
  },
  computed: {
    showScrollbar() {
      return this.options.length > 0 && !this.loading
    },
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
    },
    visible(val) {
      if (!val) {
        this.broadcast('ElSelectDropdown', 'destroyPopper')
        if (this.$refs.input) {
          this.$refs.input.blur()
        }
        this.query = ''
        this.previousQuery = null
        this.selectedLabel = ''
        this.inputLength = 20
        this.menuVisibleOnFocus = false
        this.resetHoverIndex()
        this.$nextTick(() => {
          if (this.$refs.input &&
            this.$refs.input.value === '' &&
            this.selected.length === 0) {
            this.currentPlaceholder = this.cachedPlaceHolder
          }
        })
        if (!this.multiple) {
          if (this.selected) {
            if (this.filterable && this.allowCreate &&
              this.createdSelected && this.createdLabel) {
              this.selectedLabel = this.createdLabel
            } else {
              this.selectedLabel = this.selected.currentLabel
            }
            if (this.filterable) this.query = this.selectedLabel
          }

          if (this.filterable) {
            this.currentPlaceholder = this.cachedPlaceHolder
          }
        }
      } else {
        this.broadcast('MSelectDropdown', 'updatePopper')
        if (this.filterable) {
          this.query = this.remote ? '' : this.selectedLabel
          this.handleQueryChange(this.query)
          if (this.multiple) {
            this.$refs.input.focus()
          } else {
            if (!this.remote) {
              this.broadcast('ElOption', 'queryChange', '')
              this.broadcast('ElOptionGroup', 'queryChange')
            }

            if (this.selectedLabel) {
              this.currentPlaceholder = this.selectedLabel
              this.selectedLabel = ''
            }
          }
        }
      }
      this.$emit('visible-change', val)
    }
  },
  methods: {
    resetHoverIndex() {
      setTimeout(() => {
        if (!this.multiple) {
          this.hoverIndex = this.options.indexOf(this.selected)
        } else {
          if (this.selected.length > 0) {
            this.hoverIndex = Math.min.apply(null, this.selected.map(item => this.options.indexOf(item)))
          } else {
            this.hoverIndex = -1
          }
        }
      }, 300)
    },
    doDestroy() {
      this.$refs.popper && this.$refs.popper.doDestroy()
    },
    scrollToOption(option) {
      const target = Array.isArray(option) && option[0] ? option[0].$el : option.$el
      if (this.$refs.popper && target) {
        const menu = this.$refs.popper.$el.querySelector('.el-select-dropdown__wrap')
        scrollIntoView(menu, target)
      }
      this.$refs.scrollbar && this.$refs.scrollbar.handleScroll()
    },
    handleMenuEnter() {
      this.$nextTick(() => this.scrollToOption(this.selected))
    },
    toggleMenu() {
      if (!this.selectDisabled) {
        if (this.menuVisibleOnFocus) {
          this.menuVisibleOnFocus = false
        } else {
          this.visible = !this.visible
        }
        if (this.visible) {
          (this.$refs.input || this.$refs.reference).focus()
        }
      }
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
    },
    resetInputHeight() {
      if (this.collapseTags && !this.filterable) return
      this.$nextTick(() => {
        if (!this.$refs.reference) return
        const inputChildNodes = this.$refs.reference.$el.childNodes
        const input = [].filter.call(inputChildNodes, item => item.tagName === 'INPUT')[0]
        const tags = this.$refs.tags
        const sizeInMap = this.initialInputHeight || 40
        input.style.height = this.selected.length === 0
          ? sizeInMap + 'px'
          : Math.max(
            tags ? (tags.clientHeight + (tags.clientHeight > sizeInMap ? 6 : 0)) : 0,
            sizeInMap
          ) + 'px'
        if (this.visible && this.emptyText !== false) {
          this.broadcast('ElSelectDropdown', 'updatePopper')
        }
      })
    },
    getOption(value) {
      let option
      const isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]'
      const isNull = Object.prototype.toString.call(value).toLowerCase() === '[object null]'
      const isUndefined = Object.prototype.toString.call(value).toLowerCase() === '[object undefined]'

      for (let i = this.cachedOptions.length - 1; i >= 0; i--) {
        const cachedOption = this.cachedOptions[i]
        const isEqual = isObject
          ? getValueByPath(cachedOption.value, this.valueKey) === getValueByPath(value, this.valueKey)
          : cachedOption.value === value
        if (isEqual) {
          option = cachedOption
          break
        }
      }
      if (option) return option
      const label = (!isObject && !isNull && !isUndefined)
        ? value : ''
      const newOption = {
        value: value,
        currentLabel: label
      }
      if (this.multiple) {
        newOption.hitState = false
      }
      return newOption
    },
    setSelected() {
      if (!this.multiple) {
        const option = this.getOption(this.value)
        if (option.created) {
          this.createdLabel = option.currentLabel
          this.createdSelected = true
        } else {
          this.createdSelected = false
        }
        this.selectedLabel = option.currentLabel
        this.selected = option
        if (this.filterable) this.query = this.selectedLabel
        return
      }
      const result = []
      if (Array.isArray(this.value)) {
        this.value.forEach(value => {
          result.push(this.getOption(value))
        })
      }
      this.selected = result
      this.$nextTick(() => {
        this.resetInputHeight()
      })
    },
    emitChange(val) {
      if (!valueEquals(this.value, val)) {
        this.$emit('change', val)
      }
    },
    setSoftFocus() {
      this.softFocus = true
      const input = this.$refs.input || this.$refs.reference
      if (input) {
        input.focus()
      }
    },
    handleOptionSelect(option, byClick) {
      if (this.multiple) {
        const value = (this.value || []).slice()
        const optionIndex = this.getValueIndex(value, option.value)
        if (optionIndex > -1) {
          value.splice(optionIndex, 1)
        } else if (this.multipleLimit <= 0 || value.length < this.multipleLimit) {
          value.push(option.value)
        }
        this.$emit('input', value)
        this.emitChange(value)
        if (option.created) {
          this.query = ''
          this.handleQueryChange('')
          this.inputLength = 20
        }
        if (this.filterable) this.$refs.input.focus()
      } else {
        this.$emit('input', option.value)
        this.emitChange(option.value)
        this.visible = false
      }
      this.isSilentBlur = byClick
      this.setSoftFocus()
      if (this.visible) return
      this.$nextTick(() => {
        this.scrollToOption(option)
      })
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
      this.onInputChange()
    })
    this.$on('handleOptionClick', this.handleOptionSelect)
  },
  mounted() {
    if (this.multiple && Array.isArray(this.value) && this.value.length > 0) {
      this.currentPlaceholder = ''
    }

    const reference = this.$refs.reference
    if (reference && reference.$el) {
      const sizeMap = {
        medium: 36,
        small: 32,
        mini: 28
      }
      const input = reference.$el.querySelector('input')
      this.initialInputHeight = input.getBoundingClientRect().height || sizeMap[this.selectSize]
    }
    if (this.remote && this.multiple) {
      this.resetInputHeight()
    }
    this.$nextTick(() => {
      if (reference && reference.$el) {
        this.inputWidth = reference.$el.getBoundingClientRect().width
      }
    })
    this.setSelected()
  },

  beforeDestroy() {
    if (this.$el && this.handleResize) removeResizeListener(this.$el, this.handleResize)
  }
}
</script>

<style>
.el-select {
  display: inline-block;
  position: relative;
}
</style>