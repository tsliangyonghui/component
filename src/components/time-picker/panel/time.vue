<template>
  <transition name="el-zoom-in-top" @after-leave="$emit('dodestroy')">
    <div v-show="visible" class="el-time-panel el-popper" :class="popperClass">
      <div class="el-time-panel__content" :class="{ 'has-seconds': showSeconds }">
        <time-spinner ref="spinner" @change="handleChange" :arrow-control="useArrow" :show-seconds="showSeconds" :am-pm-mode="amPmMode" @select-range="setSelectionRange" :date="date">
        </time-spinner>
      </div>
      <div class="el-time-panel__footer">
        <button type="button" class="el-time-panel__btn cancel" @click="handleCancel">{{ t('el.datepicker.cancel') }}</button>
        <button type="button" class="el-time-panel__btn" :class="{confirm: !disabled}" @click="handleConfirm()">{{ t('el.datepicker.confirm') }}</button>
      </div>
    </div>
  </transition>
</template>

<script>
import { limitTimeRange, isDate, clearMilliseconds, timeWithinRange } from '@/utils/date-util'
import Locale from '@/mixins/locale'
import TimeSpinner from '../basic/time-spinner'

export default {
  mixins: [Locale],

  components: {
    TimeSpinner
  },

  props: {
    visible: Boolean,
    timeArrowControl: Boolean
  },

  watch: {
    visible(val) {
      if (val) {
        this.oldValue = this.value
        this.$nextTick(() => this.$refs.spinner.emitSelectRange('hours'))
      } else {
        this.needInitAdjust = true
      }
    },

    value(newVal, oldVal) {
      debugger
      let date
      if (newVal instanceof Date) {
        date = limitTimeRange(newVal, this.selectableRange, this.format)
      } else if (!newVal) {
        date = this.defaultValue ? new Date(this.defaultValue) : new Date()
      }

      this.date = date
      if (this.visible && this.needInitAdjust) {
        this.$nextTick(_ => this.adjustSpinners())
        this.needInitAdjust = false
      }
    },

    selectableRange(val) {
      this.$refs.spinner.selectableRange = val
    },

    defaultValue(val) {
      if (!isDate(this.value)) {
        this.date = val ? new Date(val) : new Date()
      }
    }
  },

  data() {
    return {
      popperClass: '',
      format: 'HH:mm:ss',
      value: '',
      defaultValue: null,
      date: new Date(),
      oldValue: new Date(),
      selectableRange: [],
      selectionRange: [0, 2],
      disabled: false,
      arrowControl: false,
      needInitAdjust: true
    }
  },

  computed: {
    showSeconds() {
      return (this.format || '').indexOf('ss') !== -1
    },
    useArrow() {
      return this.arrowControl || this.timeArrowControl || false
    },
    amPmMode() {
      if ((this.format || '').indexOf('A') !== -1) return 'A'
      if ((this.format || '').indexOf('a') !== -1) return 'a'
      return ''
    }
  },

  methods: {
    handleCancel() {
      this.$emit('pick', this.oldValue, false)
    },

    handleChange(date) {
      // this.visible avoids edge cases, when use scrolls during panel closing animation
      if (this.visible) {
        this.date = clearMilliseconds(date)
        // if date is out of range, do not emit
        if (this.isValidValue(this.date)) {
          this.$emit('pick', this.date, true)
        }
      }
    },

    setSelectionRange(start, end) {
      this.$emit('select-range', start, end)
      this.selectionRange = [start, end]
    },

    handleConfirm(visible = false, first) {
      if (first) return
      const date = clearMilliseconds(limitTimeRange(this.date, this.selectableRange, this.format))
      this.$emit('pick', date, visible, first)
    },

    handleKeydown(event) {
      const keyCode = event.keyCode
      const mapping = { 38: -1, 40: 1, 37: -1, 39: 1 }

      // Left or Right
      if (keyCode === 37 || keyCode === 39) {
        const step = mapping[keyCode]
        this.changeSelectionRange(step)
        event.preventDefault()
        return
      }

      // Up or Down
      if (keyCode === 38 || keyCode === 40) {
        const step = mapping[keyCode]
        this.$refs.spinner.scrollDown(step)
        event.preventDefault()
        return
      }
    },

    isValidValue(date) {
      return timeWithinRange(date, this.selectableRange, this.format)
    },

    adjustSpinners() {
      return this.$refs.spinner.adjustSpinners()
    },

    changeSelectionRange(step) {
      const list = [0, 3].concat(this.showSeconds ? [6] : [])
      const mapping = ['hours', 'minutes'].concat(this.showSeconds ? ['seconds'] : [])
      const index = list.indexOf(this.selectionRange[0])
      const next = (index + step + list.length) % list.length
      this.$refs.spinner.emitSelectRange(mapping[next])
    }
  },

  mounted() {
    this.$nextTick(() => this.handleConfirm(true, true))
    this.$emit('mounted')
  }
}
</script>
<style>
.el-date-editor {
  position: relative;
  display: inline-block;
  text-align: left;
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 220px;
}
.el-time-panel {
  margin: 5px 0;
  border: 1px solid #e4e7ed;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  position: absolute;
  width: 180px;
  left: 0;
  z-index: 1000;
  user-select: none;
  box-sizing: content-box;
}
.el-time-panel__content {
  font-size: 0;
  position: relative;
  overflow: hidden;
}
.el-time-panel__content::after,
.el-time-panel__content::before {
  content: "";
  top: 50%;
  position: absolute;
  margin-top: -15px;
  height: 32px;
  z-index: -1;
  left: 0;
  right: 0;
  box-sizing: border-box;
  padding-top: 6px;
  text-align: left;
  border-top: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
}
.el-time-panel__content::after {
  left: 50%;
  margin-left: 12%;
  margin-right: 12%;
}
.el-time-panel__content::before {
  padding-left: 50%;
  margin-right: 12%;
  margin-left: 12%;
}
.el-time-panel__content.has-seconds::after {
  left: calc(100% / 3 * 2);
}
.el-time-panel__content.has-seconds::before {
  padding-left: calc(100% / 3);
}
.el-time-panel__footer {
  border-top: 1px solid #e4e4e4;
  padding: 4px;
  height: 36px;
  line-height: 25px;
  text-align: right;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.el-time-panel__btn {
  border: none;
  line-height: 28px;
  padding: 0 5px;
  margin: 0 5px;
  cursor: pointer;
  background-color: transparent;
  outline: 0;
  font-size: 12px;
  color: #303133;
}
.el-time-panel__btn.confirm {
  font-weight: 800;
  color: #409eff;
}
.el-time-spinner.has-seconds .el-time-spinner__wrapper {
  width: 33.3%;
}
.el-time-spinner__wrapper {
  max-height: 190px;
  overflow: auto;
  display: inline-block;
  width: 50%;
  vertical-align: top;
  position: relative;
}
.el-time-spinner__wrapper
  .el-scrollbar__wrap:not(.el-scrollbar__wrap--hidden-default) {
  padding-bottom: 15px;
}
.el-time-spinner__input.el-input .el-input__inner,
.el-time-spinner__list {
  padding: 0;
  text-align: center;
}
.el-time-spinner__wrapper.is-arrow {
  box-sizing: border-box;
  text-align: center;
  overflow: hidden;
}
.el-time-spinner__wrapper.is-arrow .el-time-spinner__list {
  transform: translateY(-32px);
}
.el-time-spinner__wrapper.is-arrow
  .el-time-spinner__item:hover:not(.disabled):not(.active) {
  background: #fff;
  cursor: default;
}
.el-time-spinner__arrow {
  font-size: 12px;
  color: #909399;
  position: absolute;
  left: 0;
  width: 100%;
  z-index: 1;
  text-align: center;
  height: 30px;
  line-height: 30px;
  cursor: pointer;
}
.el-time-spinner__arrow:hover {
  color: #409eff;
}
.el-time-spinner__arrow.el-icon-arrow-up {
  top: 10px;
}
.el-time-spinner__arrow.el-icon-arrow-down {
  bottom: 10px;
}
.el-time-spinner__input.el-input {
  width: 70%;
}
.el-time-spinner__list {
  margin: 0;
  list-style: none;
}
.el-time-spinner__list::after,
.el-time-spinner__list::before {
  content: "";
  display: block;
  width: 100%;
  height: 80px;
}
.el-time-spinner__item {
  height: 32px;
  line-height: 32px;
  font-size: 12px;
  color: #606266;
}
.el-time-spinner__item:hover:not(.disabled):not(.active) {
  background: #f5f7fa;
  cursor: pointer;
}
.el-time-spinner__item.active:not(.disabled) {
  color: #303133;
  font-weight: 700;
}
.el-time-spinner__item.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}
</style>
