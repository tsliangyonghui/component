<template>
  <div id="app">
    <m-button>按键</m-button>
    <m-radio disabled v-model="radio" label="1">备选项</m-radio>
    <m-radio v-model="radio" label="2">备选项</m-radio>
  </div>
</template>

<script>
import MButton from './components/button'
import MRadio from './components/radio'
export default {
  name: 'App',
  components: { MButton, MRadio },
  provide() {
    return {
      foo: this.foo,
      boo: this.boo
    }
  },
  data() {
    return {
      radio: '1',
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
