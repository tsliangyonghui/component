<template>
  <div id="app">
    <m-form ref="form" :model="form" label-width="80px">
      <m-input v-model="form.name" placeholder="请选择日期"></m-input>
    </m-form >
  </div>
</template>

<script>
import MForm from './components/form'
import MInput from './components/input'
export default {
  name: 'App',
  components: { MInput, MForm },
  data() {
    return {
      form: {}
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
