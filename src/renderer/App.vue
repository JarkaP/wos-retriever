<template>
    <div id="app">
        <Navigation class="mb-5"></Navigation>

        <div class="container-fluid">
            <div class="row justify-content-md-center">
                <div class="col-md-auto mx-3">
                    <router-view></router-view>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Navigation from './components/Navigation';

export default {
    components: { Navigation },
    name: 'wos-retriever'
};
</script>
