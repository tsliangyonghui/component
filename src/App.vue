<template>
  <div id="app">
    <m-form ref="form" :model="form" label-width="80px">
      <m-form-item label="名称" prop="name" :rules="[
          
            { validator: validatePass, trigger: 'blur' }
          ]">
        <m-input v-model="form.name" placeholder="请选择日期"></m-input>
      </m-form-item>
      <m-form-item label="名称名称" prop="type" :rules="[
            { required: true, message: '请输入活动名称', trigger: 'change' }
          ]">
        <m-checkbox-group v-model="form.type">
          <m-checkbox label="美食/餐厅线上活动" name="type"></m-checkbox>
          <m-checkbox label="地推活动" name="type"></m-checkbox>
        </m-checkbox-group>
      </m-form-item>
      <!-- <m-form-item label="名称名称">
         <m-radio-group v-model="form.resource">
          <m-radio label="线上品牌商赞助"></m-radio>
          <m-radio label="线下场地免费"></m-radio>
        </m-radio-group>
      </m-form-item> -->
    </m-form>
    <m-button @click="onClick">确定</m-button>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      form: {
        name: '',
        type: []
      }
    }
  },
  computed: {

  },
  watch: {
  },
  methods: {
    onClick() {
      this.$refs.form.validate((a, b) => {
      })
    },
    validatePass(rule, value, callback) {
      callback('www')
    }
  },
  mounted() {
  }
}
</script>
<style lang="scss" scoped>
</style>
