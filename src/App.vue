<template>
  <div id="app">
    <m-input v-model="input" placeholder="请输入内容" clearable></m-input>
  </div>
</template>

<script>
import MInput from './components/input'
export default {
  name: 'App',
  components: { MInput },
  provide() {
    return {
      foo: this.foo,
      boo: this.boo
    }
  },
  data() {
    return {
      input: ''
    }
  },
  computed: {

  },
  watch: {
  },
  methods: {

  }
}
</script>
<style lang="scss" scoped>
</style>
