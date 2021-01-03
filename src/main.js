import Vue from 'vue'
import MForm from './components/form'
import MFormItem from './components/form/form-item'
import MInput from './components/input'
import MButton from './components/button'
Vue.component(MForm.name, MForm)
Vue.component(MFormItem.name, MFormItem)
Vue.component(MInput.name, MInput)
Vue.component(MButton.name, MButton)
import './styles/font.css'
import App from './App'

new Vue({
  el: '#app',
  render: h => h(App)
})
