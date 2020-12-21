<template>
  <div id="app">
    <m-button>按键</m-button>
    <m-radio-group v-model="radio" size="small">
      <div>
        <m-radio :label="3" border>333</m-radio>
        <m-radio :label="6">666</m-radio>
        <m-radio :label="9">999</m-radio>
      </div>
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
      radio: 9,
    }
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
</style>
