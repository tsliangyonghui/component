<template>
  <div id="app">
    <m-button>按键</m-button>
    <m-radio-group v-model="radio1">
      <m-radio-button label="上海"></m-radio-button>
      <m-radio-button label="北京"></m-radio-button>
      <m-radio-button label="广州"></m-radio-button>
      <m-radio-button label="深圳"></m-radio-button>
    </m-radio-group>
  </div>
</template>

<script>
import MButton from './components/button'
import MRadio from './components/radio'
import MRadioGroup from './components/radio/radio-group'
import MRadioButton from './components/radio/radio-button'
export default {
  name: 'App',
  components: { MButton, MRadio, MRadioGroup, MRadioButton },
  provide() {
    return {
      foo: this.foo,
      boo: this.boo
    }
  },
  data() {
    return {
      radio1: '上海'
    }
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
</style>
