import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';

import App from './App';
import router from './router';

import 'bootswatch/dist/solar/bootstrap.min.css';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;

Vue.use(BootstrapVue);

/* eslint-disable no-new */
new Vue({
    components: { App },
    router,
    template: '<App/>'
}).$mount('#app');
