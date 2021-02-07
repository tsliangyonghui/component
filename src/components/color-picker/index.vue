<template>
  <div :class="[
      'el-color-picker',
      colorDisabled ? 'is-disabled' : '',
      colorSize ? `el-color-picker--${ colorSize }` : ''
    ]" v-clickoutside="hide">
    <div class="el-color-picker__mask" v-if="colorDisabled"></div>
    <div class="el-color-picker__trigger" @click="handleTrigger">
      <span class="el-color-picker__color" :class="{ 'is-alpha': showAlpha }">
        <span class="el-color-picker__color-inner" :style="{
            backgroundColor: displayedColor
          }"></span>
        <span class="el-color-picker__empty el-icon-close" v-if="!value && !showPanelColor"></span>
      </span>
      <span class="el-color-picker__icon el-icon-arrow-down" v-show="value || showPanelColor"></span>
    </div>
    <picker-dropdown ref="dropdown" :class="['el-color-picker__panel', popperClass || '']" v-model="showPicker" @pick="confirmValue" @clear="clearValue" :color="color" :show-alpha="showAlpha" :predefine="predefine">
    </picker-dropdown>
  </div>
</template>

<script>
import Emitter from '@/mixins/emitter'
import PickerDropdown from './components/picker-dropdown.vue'
import Clickoutside from '@/utils/clickoutside'
import Color from './color'
export default {
  name: 'MColorPicker',
  mixins: [Emitter],
  props: {
    value: String,
    showAlpha: Boolean,
    colorFormat: String,
    disabled: Boolean,
    size: String,
    popperClass: String,
    predefine: Array
  },
  components: {
    PickerDropdown
  },
  inject: {
    mForm: {
      default: ''
    },
    mFormItem: {
      default: ''
    }
  },
  directives: { Clickoutside },
  data() {
    const color = new Color({
      enableAlpha: this.showAlpha,
      format: this.colorFormat
    })
    return {
      color,
      showPicker: false,
      showPanelColor: false
    }
  },
  computed: {
    displayedColor() {
      if (!this.value && !this.showPanelColor) {
        return 'transparent'
      }

      return this.displayedRgb(this.color, this.showAlpha)
    },

    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize
    },

    colorSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size
    },

    colorDisabled() {
      return this.disabled || (this.elForm || {}).disabled
    }
  },
  methods: {
    confirmValue() {
      const value = this.color.value
      this.$emit('input', value)
      this.$emit('change', value)
      this.dispatch('ElFormItem', 'el.form.change', value)
      this.showPicker = false
    },
    clearValue() {
      this.$emit('input', null)
      this.$emit('change', null)
      if (this.value !== null) {
        this.dispatch('ElFormItem', 'el.form.change', null)
      }
      this.showPanelColor = false
      this.showPicker = false
      this.resetColor()
    },
    handleTrigger() {
      if (this.colorDisabled) return
      this.showPicker = !this.showPicker
    },
    hide() {
      this.showPicker = false
      this.resetColor()
    }
  },
  mounted() {
    const value = this.value
    if (value) {
      this.color.fromString(value)
    }
    this.popperElm = this.$refs.dropdown.$el
  }
}
</script>
<style>
.el-color-predefine {
  display: flex;
  font-size: 12px;
  margin-top: 8px;
  width: 280px;
}

.el-color-predefine__colors {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
}

.el-color-predefine__color-selector {
  margin: 0 0 8px 8px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
}

.el-color-predefine__color-selector:nth-child(10n + 1) {
  margin-left: 0;
}

.el-color-predefine__color-selector.selected {
  box-shadow: 0 0 3px 2px #409eff;
}

.el-color-predefine__color-selector > div {
  display: flex;
  height: 100%;
  border-radius: 3px;
}

.el-color-predefine__color-selector.is-alpha {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
}

.el-color-hue-slider {
  position: relative;
  box-sizing: border-box;
  width: 280px;
  height: 12px;
  background-color: red;
  padding: 0 2px;
}

.el-color-hue-slider__bar {
  position: relative;
  background: linear-gradient(
    90deg,
    red 0,
    #ff0 17%,
    #0f0 33%,
    #0ff 50%,
    #00f 67%,
    #f0f 83%,
    red
  );
  height: 100%;
}

.el-color-hue-slider__thumb {
  position: absolute;
  cursor: pointer;
  box-sizing: border-box;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  border-radius: 1px;
  background: #fff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.el-color-hue-slider.is-vertical {
  width: 12px;
  height: 180px;
  padding: 2px 0;
}

.el-color-hue-slider.is-vertical .el-color-hue-slider__bar {
  background: linear-gradient(
    180deg,
    red 0,
    #ff0 17%,
    #0f0 33%,
    #0ff 50%,
    #00f 67%,
    #f0f 83%,
    red
  );
}

.el-color-hue-slider.is-vertical .el-color-hue-slider__thumb {
  left: 0;
  top: 0;
  width: 100%;
  height: 4px;
}

.el-color-svpanel {
  position: relative;
  width: 280px;
  height: 180px;
}

.el-color-svpanel__black,
.el-color-svpanel__white {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.el-color-svpanel__white {
  background: linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0));
}

.el-color-svpanel__black {
  background: linear-gradient(0deg, #000, transparent);
}

.el-color-svpanel__cursor {
  position: absolute;
}

.el-color-svpanel__cursor > div {
  cursor: head;
  width: 4px;
  height: 4px;
  box-shadow: 0 0 0 1.5px #fff, inset 0 0 1px 1px rgba(0, 0, 0, 0.3),
    0 0 1px 2px rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  transform: translate(-2px, -2px);
}

.el-color-alpha-slider {
  position: relative;
  box-sizing: border-box;
  width: 280px;
  height: 12px;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
}

.el-color-alpha-slider__bar {
  position: relative;
  background: linear-gradient(90deg, hsla(0, 0%, 100%, 0) 0, #fff);
  height: 100%;
}

.el-color-alpha-slider__thumb {
  position: absolute;
  cursor: pointer;
  box-sizing: border-box;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  border-radius: 1px;
  background: #fff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.el-color-alpha-slider.is-vertical {
  width: 20px;
  height: 180px;
}

.el-color-alpha-slider.is-vertical .el-color-alpha-slider__bar {
  background: linear-gradient(180deg, hsla(0, 0%, 100%, 0) 0, #fff);
}

.el-color-alpha-slider.is-vertical .el-color-alpha-slider__thumb {
  left: 0;
  top: 0;
  width: 100%;
  height: 4px;
}

.el-color-dropdown {
  width: 300px;
}

.el-color-dropdown__main-wrapper {
  margin-bottom: 6px;
}

.el-color-dropdown__main-wrapper:after {
  content: "";
  display: table;
  clear: both;
}

.el-color-dropdown__btns {
  margin-top: 6px;
  text-align: right;
}

.el-color-dropdown__value {
  float: left;
  line-height: 26px;
  font-size: 12px;
  color: #000;
  width: 160px;
}

.el-color-dropdown__btn {
  border: 1px solid #dcdcdc;
  color: #333;
  line-height: 24px;
  border-radius: 2px;
  padding: 0 20px;
  cursor: pointer;
  background-color: transparent;
  outline: none;
  font-size: 12px;
}

.el-color-dropdown__btn[disabled] {
  color: #ccc;
  cursor: not-allowed;
}

.el-color-dropdown__btn:hover {
  color: #409eff;
  border-color: #409eff;
}

.el-color-dropdown__link-btn {
  cursor: pointer;
  color: #409eff;
  text-decoration: none;
  padding: 15px;
  font-size: 12px;
}

.el-color-dropdown__link-btn:hover {
  color: tint(#409eff, 20%);
}

.el-color-picker {
  display: inline-block;
  position: relative;
  line-height: normal;
  height: 40px;
}

.el-color-picker.is-disabled .el-color-picker__trigger {
  cursor: not-allowed;
}

.el-color-picker--medium {
  height: 36px;
}

.el-color-picker--medium .el-color-picker__trigger {
  height: 36px;
  width: 36px;
}

.el-color-picker--medium .el-color-picker__mask {
  height: 34px;
  width: 34px;
}

.el-color-picker--small {
  height: 32px;
}

.el-color-picker--small .el-color-picker__trigger {
  height: 32px;
  width: 32px;
}

.el-color-picker--small .el-color-picker__mask {
  height: 30px;
  width: 30px;
}

.el-color-picker--small .el-color-picker__empty,
.el-color-picker--small .el-color-picker__icon {
  transform: translate3d(-50%, -50%, 0) scale(0.8);
}

.el-color-picker--mini {
  height: 28px;
}

.el-color-picker--mini .el-color-picker__trigger {
  height: 28px;
  width: 28px;
}

.el-color-picker--mini .el-color-picker__mask {
  height: 26px;
  width: 26px;
}

.el-color-picker--mini .el-color-picker__empty,
.el-color-picker--mini .el-color-picker__icon {
  transform: translate3d(-50%, -50%, 0) scale(0.8);
}

.el-color-picker__mask {
  height: 38px;
  width: 38px;
  border-radius: 4px;
  position: absolute;
  top: 1px;
  left: 1px;
  z-index: 1;
  cursor: not-allowed;
  background-color: hsla(0, 0%, 100%, 0.7);
}

.el-color-picker__trigger {
  display: inline-block;
  box-sizing: border-box;
  height: 40px;
  width: 40px;
  padding: 4px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  font-size: 0;
  position: relative;
  cursor: pointer;
}

.el-color-picker__color {
  position: relative;
  display: block;
  box-sizing: border-box;
  border: 1px solid #999;
  border-radius: 2px;
  width: 100%;
  height: 100%;
  text-align: center;
}

.el-color-picker__color.is-alpha {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
}

.el-color-picker__color-inner {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.el-color-picker__empty {
  color: #999;
}

.el-color-picker__empty,
.el-color-picker__icon {
  font-size: 12px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
}

.el-color-picker__icon {
  display: inline-block;
  width: 100%;
  color: #fff;
  text-align: center;
}

.el-color-picker__panel {
  position: absolute;
  z-index: 10;
  padding: 6px;
  box-sizing: content-box;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>