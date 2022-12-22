<template>
  <v-form>
    <v-card class="pa-8 mx-auto" width="500" align="center">
      <v-text-field
        v-model="userName"
        label="Логин"
        @keydown.enter.prevent="login"
      />
      <v-btn v-on:click="login">Войти</v-btn>
    </v-card>
  </v-form>
</template>

<script>
import AuthService from "../services/AuthService.js";

export default {
  name: "Login",
  data() {
    return {
      userName: "",
    };
  },
  methods: {
    login: async function () {
      const result = await AuthService.login(this.userName);
      if (!result.success) {
        alert("Ошибка входа в систему");
      } else {
        this.$router.replace("/main");
      }
    },
  },
};
</script>