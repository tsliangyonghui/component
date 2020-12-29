<template>
  <div id="app">
    <m-form ref="form" :model="form" label-width="80px">
      <m-form-item label="活动名称">
        <m-input v-model="form.name" placeholder="请选择日期"></m-input>
      </m-form-item>
    </m-form>
  </div>
</template>

<script>
import MForm from './components/form'
import MFormItem from './components/form/form-item'
import MInput from './components/input'
export default {
  name: 'App',
  components: { MInput, MForm, MFormItem },
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
