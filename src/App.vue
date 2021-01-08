<template>
  <div id="app">
    <m-form ref="form" :model="form" label-width="80px">
      <m-form-item label="名称" prop="name" :rules="[
      { required: true, message: '年龄不能为空'},
      { type: 'number', message: '年龄必须为数字值'}
    ]">
        <m-input v-model.number="form.name" placeholder="请选择日期"></m-input>
      </m-form-item>
      <m-form-item label="名称名称" prop="type" :rules="[
            { required: true, message: '请输入活动名称', trigger: 'change' }
          ]">
        <m-checkbox-group v-model="form.type">
          <m-checkbox label="美食/餐厅线上活动" name="type"></m-checkbox>
          <m-checkbox label="地推活动" name="type"></m-checkbox>
        </m-checkbox-group>
      </m-form-item>
      <m-form-item label="数量">
        <m-input-number v-model="form.num"  :step="1.20"  :max="10" />
      </m-form-item>
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
        type: [],
        num: 3
      }
    }
  },
  computed: {

  },
  watch: {
    'form.num'(val) {
      console.log(val)
    }
  },
  methods: {
    onClick() {
      this.$refs.form.validateField('name', (a, b) => {
        setTimeout(() => {
          this.$refs.form.clearValidate('name')
        }, 1000)
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
