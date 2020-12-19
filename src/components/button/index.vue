<template>
  <button class="m-el-button" @click="handleClick" :disabled="buttonDisabled || loading" :class="[
      type ? 'm-el-button--' + type : '',
      size ? 'm-el-button--' + size : '',
      {
        'is-disabled': buttonDisabled,
        'is-loading': loading,
        'is-plain': plain,
        'is-round': round,
        'is-circle': circle
      }
    ]">
    <span v-if="$slots.default">
      <slot></slot>
    </span>
  </button>
</template>

<script>
export default {
  name: 'm-button',
  props: {
    loading: Boolean,
    disabled: Boolean,
    size: String,
    plain: Boolean,
    autofocus: Boolean,
    round: Boolean,
    circle: Boolean,
    type: {
      type: String,
      default: 'default'
    }
  },
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  computed: {
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize
    },
    buttonSize() {
      return this.size || this._elFormItemSize
    },
    buttonDisabled() {
      return this.disabled || (this.elForm || {}).disabled
    }
  },
  methods: {
    handleClick(evt) {
      this.$emit('click', evt)
    }
  }
}
</script>
<style lang="scss" scoped>
.m-el-button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: 0.1s;
  font-weight: 500;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
  user-select: none;
}
.m-el-button.is-disabled {
  cursor: not-allowed;
}
.m-el-button:focus,
.m-el-button:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.m-el-button:active {
  color: #3a8ee6;
  border-color: #3a8ee6;
  outline: none;
}
.m-el-button--primary {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}
</style>