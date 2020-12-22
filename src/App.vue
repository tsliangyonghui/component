<template>
  <div id="app">
    <m-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</m-checkbox>
    <m-checkbox-group v-model="checkedCities">
      <m-checkbox v-for="city in cities" :label="city" :key="city">{{city}}</m-checkbox>
    </m-checkbox-group>
  </div>
</template>

<script>
import MCheckbox from './components/checkbox'
import MCheckboxGroup from './components/checkbox/checkbox-group'
const cityOptions = ['上海', '北京', '广州', '深圳']
export default {
  name: 'App',
  components: { MCheckboxGroup, MCheckbox },
  provide() {
    return {
      foo: this.foo,
      boo: this.boo
    }
  },
  data() {
    return {
      checkAll: false,
      checkedCities: [],
      cities: cityOptions
    }
  },
  computed: {
    isIndeterminate() {
      this.checkAll = this.checkedCities.length === 4
      return this.checkedCities.length && this.checkedCities.length !== 4
    }
  },
  watch: {
  },
  methods: {
    handleCheckAllChange(val) {
      this.checkedCities = val ? cityOptions : []
      this.isIndeterminate = false
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
