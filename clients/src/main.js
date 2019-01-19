// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Notifications from 'vue-notification'
import socketio from 'vue-socket-io'

Vue.config.productionTip = false
Vue.use(Notifications)
Vue.use(socketio, 'ws://localhost:8085')

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
