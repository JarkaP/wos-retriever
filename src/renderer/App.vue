<template>
  <div id="app" class="container-fluid px-0">
      <div class="row">
          <div class="col">
              <Navigation class="mb-5"></Navigation>
          </div>
      </div>
      <div class="row justify-content-md-center">
          <div class="col-md-auto mx-3">
              <router-view></router-view>
          </div>
      </div>

  </div>
</template>

<script>
  import Navigation from './components/Navigation';

  export default {
      components: { Navigation },
      name: 'wos-retriever'
  }
</script>
