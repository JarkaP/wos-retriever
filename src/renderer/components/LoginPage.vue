<template>
  <div style="max-width:400px">
    <b-form @submit="onSubmit">
      <b-form-group id="username" label="Username:" label-for="username">
        <b-form-input
          id="username"
          type="text"
          v-model="form.username"
          required
        >
        </b-form-input>
      </b-form-group>
      <b-form-group id="password" label="Password:" label-for="password">
        <b-form-input
          id="password"
          type="password"
          v-model="form.password"
          required
        >
        </b-form-input>
      </b-form-group>

      <b-button type="submit" variant="primary">Submit</b-button>
    </b-form>
  </div>
</template>

<script>
export default {
    name: 'login-page',
    data() {
        return {
            form: {
                username: '',
                password: ''
            }
        };
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault();
            alert(JSON.stringify(this.form));
        }
    }
};
</script>
