<template>
  <div id="app">
    <m-button>按键</m-button>
    <m-radio v-model="radio" label="1">备选项</m-radio>
    <m-radio-group v-model="radio">
      <m-radio :label="3">备选项</m-radio>
      <m-radio :label="6">备选项</m-radio>
    </m-radio-group>
  </div>
</template>

<script>
import MButton from './components/button'
import MRadio from './components/radio'
import MRadioGroup from './components/radio/radio-group'
export default {
  name: 'App',
  components: { MButton, MRadio, MRadioGroup },
  provide() {
    return {
      foo: this.foo,
      boo: this.boo
    }
  },
  data() {
    return {
      radio: '3',
      boo: { a: 1, b: 2 }
    }
  },
  methods: {
    foo(a) {

    }
  }
}
</script>
<style lang="scss" scoped>
</style>
