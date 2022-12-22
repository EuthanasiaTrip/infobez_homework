<template>
  <v-app>
    <v-app-bar color="#F0F0F0">
      <v-tabs color="black">
        <v-tab to="/main"> Объекты </v-tab>
        <v-tab v-show="isCurrentUserAdmin" to="/admin"> Панель админа </v-tab>
      </v-tabs>
      <v-spacer></v-spacer>
      <v-btn color="error" v-on:click="logout">Выйти</v-btn>
    </v-app-bar>
    <li v-for="item in objectList" :key="item.name">
      <object-row :name="item.name" :rights="item.rights"/>
    </li>
  </v-app>
</template>

<script>
import ObjectRow from './ObjectRow.vue';
import DataService from '../services/DataService';
import AuthService from '../services/AuthService';

export default {
  components: { ObjectRow },
  name: "MainPage",
  data() {
    return {
        objectList: [],
        isCurrentUserAdmin: false
    }
  },
  mounted() {
    this.getRightsOnObjectByUser().then(value => {
      this.objectList = value;
    });
    this.setIsCurrentUserAdmin();
  },
  methods: {
    getRightsOnObjectByUser: async function(){
        let result = await DataService.getRightsOnObjectByUser();
        return result
    },

    logout: async function(){
        let result = await AuthService.logout();
        if(result){
          this.$router.replace("/");
        }
    },

    setIsCurrentUserAdmin: function() {
      AuthService.getCurrentUser().then((result) => {
        this.isCurrentUserAdmin = result == "admin";
      })
    }
  }
};
</script>

<style>
.v-application {
  background-color: #fff5e3;
}
li {
  list-style-type: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-block: 15px;
}
</style>