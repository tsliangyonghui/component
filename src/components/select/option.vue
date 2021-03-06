<template>
  <li @mouseenter="hoverItem" @click.stop="selectOptionClick" class="el-select-dropdown__item" v-show="visible" :class="{
      'selected': itemSelected,
      'is-disabled': disabled || groupDisabled || limitReached,
      'hover': hover
    }">
    <slot>
      <span>{{ currentLabel }}</span>
    </slot>
  </li>
</template>

<script>
import Emitter from '@/mixins/emitter'
import { getValueByPath, escapeRegexpString } from '@/utils/util'
export default {
  name: 'MOption',
  componentName: 'MOption',
  mixins: [Emitter],
  props: {
    value: {
      required: true
    },
    label: [String, Number],
    created: Boolean,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  inject: ['select'],
  data() {
    return {
      hover: false,
      visible: true,
      groupDisabled: false
    }
  },
  computed: {
    isObject() {
      return Object.prototype.toString.call(this.value).toLowerCase() === '[object object]'
    },
    currentLabel() {
      return this.label || (this.isObject ? '' : this.value)
    },
    limitReached() {
      if (this.select.multiple) {
        return !this.itemSelected &&
          (this.select.value || []).length >= this.select.multipleLimit &&
          this.select.multipleLimit > 0
      } else {
        return false
      }
    },
    itemSelected() {
      if (!this.select.multiple) {
        return this.isEqual(this.value, this.select.value)
      } else {
        return this.contains(this.select.value, this.value)
      }
    }
  },
  methods: {
    isEqual(a, b) {
      if (!this.isObject) {
        return a === b
      } else {
        const valueKey = this.select.valueKey
        return getValueByPath(a, valueKey) === getValueByPath(b, valueKey)
      }
    },

    contains(arr = [], target) {
      if (!this.isObject) {
        return arr && arr.indexOf(target) > -1
      } else {
        const valueKey = this.select.valueKey
        return arr && arr.some(item => {
          return getValueByPath(item, valueKey) === getValueByPath(target, valueKey)
        })
      }
    },
    hoverItem() {
      if (!this.disabled && !this.groupDisabled) {
        this.select.hoverIndex = this.select.options.indexOf(this)
      }
    },
    selectOptionClick() {
      if (this.disabled !== true && this.groupDisabled !== true) {
        this.dispatch('MSelect', 'handleOptionClick', [this, true])
      }
    },
    queryChange(query) {
      this.visible = new RegExp(escapeRegexpString(query), 'i').test(this.currentLabel) || this.created
      if (!this.visible) {
        this.select.filteredOptionsCount--
      }
    }
  },
  created() {
    this.select.options.push(this)
    this.select.cachedOptions.push(this)
    this.select.optionsCount++
    this.select.filteredOptionsCount++

    this.$on('queryChange', this.queryChange)
    this.$on('handleGroupDisabled', this.handleGroupDisabled)
  },

  beforeDestroy() {
    const { selected, multiple } = this.select
    const selectedOptions = multiple ? selected : [selected]
    const index = this.select.cachedOptions.indexOf(this)
    const selectedIndex = selectedOptions.indexOf(this)

    // if option is not selected, remove it from cache
    if (index > -1 && selectedIndex < 0) {
      this.select.cachedOptions.splice(index, 1)
    }
    this.select.onOptionDestroy(this.select.options.indexOf(this))
  }
}
</script>
<style lang="scss" scoped>
.el-select-dropdown__item {
  font-size: 14px;
  padding: 0 20px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #606266;
  height: 34px;
  line-height: 34px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  cursor: pointer;
}
.el-select-dropdown__item.is-disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}
.el-select-dropdown__item.is-disabled:hover {
  background-color: #fff;
}
.el-select-dropdown__item:hover {
  background-color: #f5f7fa;
}
.el-select-dropdown__item.selected {
  color: #409eff;
  font-weight: 700;
}
</style>