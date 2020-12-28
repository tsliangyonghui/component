<template>
  <div id="app">
    <m-input v-model="input" placeholder="请选择日期" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"></m-input>
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
      input: '',
      header: 'header'
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
