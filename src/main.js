import Vue from 'vue'
import MForm from './components/form'
import MFormItem from './components/form/form-item'
import MInput from './components/input'
import MButton from './components/button'
import MCheckbox from './components/checkbox'
import MCheckboxGroup from './components/checkbox/checkbox-group'
import MRadio from './components/radio'
import MRadioButton from './components/radio/radio-button'
import MRadioGroup from './components/radio/radio-group'
Vue.component(MForm.name, MForm)
Vue.component(MFormItem.name, MFormItem)
Vue.component(MInput.name, MInput)
Vue.component(MButton.name, MButton)
Vue.component(MCheckbox.name, MCheckbox)
Vue.component(MRadio.name, MRadio)
Vue.component(MCheckboxGroup.name, MCheckboxGroup)
Vue.component(MRadioButton.name, MRadioButton)
Vue.component(MRadioGroup.name, MRadioGroup)
import './styles/font.css'
import App from './App'

new Vue({
  el: '#app',
  render: h => h(App)
})
