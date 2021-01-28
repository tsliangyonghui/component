<template>
  <div class="el-slider" :class="{ 'is-vertical': vertical, 'el-slider--with-input': showInput }">
    <div class="el-slider__runway" :class="{ 'show-input': showInput, 'disabled': sliderDisabled }" :style="runwayStyle" @click="onSliderClick" ref="slider">
      <div class="el-slider__bar" :style="barStyle">
      </div>
      <slider-button :vertical="vertical" v-model="firstValue" :tooltip-class="tooltipClass" ref="button1">
      </slider-button>
      <slider-button :vertical="vertical" v-model="secondValue" :tooltip-class="tooltipClass" ref="button2" v-if="range">
      </slider-button>
      <div class="el-slider__stop" v-for="(item, key) in stops" :key="key" :style="getStopStyle(item)" v-if="showStops">
      </div>
      <template v-if="markList.length > 0">
        <div>
          <div v-for="(item, key) in markList" :style="getStopStyle(item.position)" class="el-slider__stop el-slider__marks-stop" :key="key">
          </div>
        </div>
        <div class="el-slider__marks">
          <slider-marker :mark="item.mark" v-for="(item, key) in markList" :key="key" :style="getStopStyle(item.position)">
          </slider-marker>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import SliderButton from './button.vue'
import SliderMarker from './marker'
import Emitter from '@/mixins/emitter'
export default {
  name: 'MSlider',
  componentName: 'MSlider',
  mixins: [Emitter],
  components: {
    SliderButton,
    SliderMarker
  },
  inject: {
    mForm: {
      default: ''
    }
  },
  props: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    step: {
      type: Number,
      default: 1
    },
    value: {
      type: [Number, Array],
      default: 0
    },
    showInput: {
      type: Boolean,
      default: false
    },
    showInputControls: {
      type: Boolean,
      default: true
    },
    inputSize: {
      type: String,
      default: 'small'
    },
    showStops: {
      type: Boolean,
      default: false
    },
    showTooltip: {
      type: Boolean,
      default: true
    },
    formatTooltip: Function,
    disabled: {
      type: Boolean,
      default: false
    },
    range: {
      type: Boolean,
      default: false
    },
    vertical: {
      type: Boolean,
      default: false
    },
    height: {
      type: String
    },
    debounce: {
      type: Number,
      default: 300
    },
    label: {
      type: String
    },
    tooltipClass: String,
    marks: Object
  },
  data() {
    return {
      firstValue: null,
      secondValue: null,
      oldValue: null,
      dragging: false,
      sliderSize: 1
    }
  },
  computed: {

    barSize() {
      return this.range
        ? `${100 * (this.maxValue - this.minValue) / (this.max - this.min)}%`
        : `${100 * (this.firstValue - this.min) / (this.max - this.min)}%`
    },

    barStart() {
      return this.range
        ? `${100 * (this.minValue - this.min) / (this.max - this.min)}%`
        : '0%'
    },
    markList() {
      if (!this.marks) {
        return []
      }

      const marksKeys = Object.keys(this.marks)
      return marksKeys.map(parseFloat)
        .sort((a, b) => a - b)
        .filter(point => point <= this.max && point >= this.min)
        .map(point => ({
          point,
          position: (point - this.min) * 100 / (this.max - this.min),
          mark: this.marks[point]
        }))
    },
    stops() {
      if (!this.showStops || this.min > this.max) return []
      if (this.step === 0) {
        process.env.NODE_ENV !== 'production' &&
          console.warn('[Element Warn][Slider]step should not be 0.')
        return []
      }
      const stopCount = (this.max - this.min) / this.step
      const stepWidth = 100 * this.step / (this.max - this.min)
      const result = []
      for (let i = 1; i < stopCount; i++) {
        result.push(i * stepWidth)
      }
      if (this.range) {
        return result.filter(step => {
          return step < 100 * (this.minValue - this.min) / (this.max - this.min) ||
            step > 100 * (this.maxValue - this.min) / (this.max - this.min)
        })
      } else {
        return result.filter(step => step > 100 * (this.firstValue - this.min) / (this.max - this.min))
      }
    },
    barStyle() {
      return this.vertical
        ? {
          height: this.barSize,
          bottom: this.barStart
        } : {
          width: this.barSize,
          left: this.barStart
        }
    },
    sliderDisabled() {
      return this.disabled || (this.elForm || {}).disabled
    },
    runwayStyle() {
      return this.vertical ? { height: this.height } : {}
    }
  },
  methods: {
    emitChange() {
      this.$nextTick(() => {
        this.$emit('change', this.range ? [this.minValue, this.maxValue] : this.value)
      })
    },
    onSliderClick(event) {
      if (this.sliderDisabled || this.dragging) return
      this.resetSize()
      if (this.vertical) {
        const sliderOffsetBottom = this.$refs.slider.getBoundingClientRect().bottom
        this.setPosition((sliderOffsetBottom - event.clientY) / this.sliderSize * 100)
      } else {
        const sliderOffsetLeft = this.$refs.slider.getBoundingClientRect().left
        this.setPosition((event.clientX - sliderOffsetLeft) / this.sliderSize * 100)
      }
      this.emitChange()
    },
    resetSize() {
      if (this.$refs.slider) {
        this.sliderSize = this.$refs.slider[`client${this.vertical ? 'Height' : 'Width'}`]
      }
    }
  },
  mounted() {
    if (this.range) {
      if (Array.isArray(this.value)) {
        this.firstValue = Math.max(this.min, this.value[0])
        this.secondValue = Math.min(this.max, this.value[1])
      } else {
        this.firstValue = this.min
        this.secondValue = this.max
      }
      this.oldValue = [this.firstValue, this.secondValue]
    } else {
      if (typeof this.value !== 'number' || isNaN(this.value)) {
        this.firstValue = this.min
      } else {
        this.firstValue = Math.min(this.max, Math.max(this.min, this.value))
      }
      this.oldValue = this.firstValue
    }
    this.resetSize()
    window.addEventListener('resize', this.resetSize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.resetSize)
  }
}
</script>
<style>
.el-slider:after,
.el-slider:before {
  display: table;
  content: "";
}

.el-slider:after {
  clear: both;
}

.el-slider__runway {
  width: 100%;
  height: 6px;
  margin: 16px 0;
  background-color: #e4e7ed;
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  vertical-align: middle;
}
.el-slider__bar {
  height: 6px;
  background-color: #409eff;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
  position: absolute;
}
</style>