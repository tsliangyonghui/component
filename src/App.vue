<template>
  <div id="app">
    <m-form ref="form" :model="form" :inline="true">
      <m-form-item label="名称">
        <m-input v-model="form.name2" placeholder="请选择日期"></m-input>
      </m-form-item>
      <m-form-item :label="la">
        <m-input v-model="form.name" placeholder="请选择日期"></m-input>
      </m-form-item>
      <m-form-item label="la al ">
        <m-button @click.prevent="()=>{}">button</m-button>
      </m-form-item>
    </m-form>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      form: {},
      la: '活动名称'
    }
  },
  computed: {

  },
  watch: {
  },
  methods: {

  },
  mounted() {
    setTimeout(() => {
      this.la = '活动名称名称'
    }, 5000)
  }
}
</script>
<style lang="scss" scoped>
</style>
