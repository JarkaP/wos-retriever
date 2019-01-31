import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'new-project-page',
            component: require('@/components/LandingPage').default
        },
        {
            path: '/login-page',
            name: 'login-page',
            component: require('@/components/LoginPage').default
        },
        {
            path: '/new-project-page',
            name: 'new-project-page',
            component: require('@/components/NewProjectPage').default
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
});
