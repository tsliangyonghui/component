<template>
  <div id="app">
    <m-checkbox v-model="checked">备选项</m-checkbox>
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
