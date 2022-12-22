<template>
  <Modal
    v-model:visible="isModalVisible"
    title="Назначить права"
    :cancelButton="{ text: 'Отмена', onclick: clearModal }"
    :okButton="{ text: 'Назначить', onclick: onConfirmButtonClick }"
  >
    <v-select
      v-model="selectedObject"
      :items="objectsNames"
      outlined
      label="Объект"
      v-on:update:modelValue="getSelectedUserRights"
    ></v-select>
    <v-select
      v-model="selectedUser"
      :items="users"
      label="Пользователь"
      outlined
      v-on:update:modelValue="getSelectedUserRights"
    ></v-select>
    <v-checkbox
      v-model="readCheck"
      v-on:update:modelValue="onCanReadButtonUpdate"
      label="Чтение"
    ></v-checkbox>
    <v-checkbox
      v-model="writeCheck"
      :disabled="!readCheck"
      label="Запись"
    ></v-checkbox>
    <v-checkbox
      v-model="grantCheck"
      :disabled="!readCheck"
      label="Передача прав"
    ></v-checkbox>
  </Modal>
  <v-app>
    <v-app-bar color="#F0F0F0">
      <v-tabs color="black">
        <v-tab to="/main"> Объекты </v-tab>
        <v-tab to="/admin"> Панель админа </v-tab>
      </v-tabs>
      <v-spacer></v-spacer>
      <v-btn color="error" v-on:click="logout">Выйти</v-btn>
    </v-app-bar>
    <li>
      <v-card width="800">
        <v-btn v-on:click="onSetRightsButtonClick" class="grantRightsButton"
          >Назначить права</v-btn
        >
        <v-btn v-on:click="randomizeRights" class="grantRightsButton"
          >Выдать случайные права</v-btn
        >
        <table-lite
          :is-loading="isLoading"
          :columns="columns"
          :rows="rows"
          :is-hide-paging="true"
        ></table-lite>
      </v-card>
    </li>
  </v-app>
</template>

<script>
import { Modal } from "usemodal-vue3";
import TableLite from "vue3-table-lite";
import AuthService from "../services/AuthService";
import DataService from "../services/DataService";

export default {
  components: { Modal, TableLite },
  data() {
    return {
      isModalVisible: false,
      objectsNames: [],
      selectedObject: "",
      selectedUser: "",
      users: [],
      readCheck: false,
      writeCheck: false,
      grantCheck: false,
      columns: [
        {
          label: "Пользователь",
          field: "user",
          width: "10%",
        },
      ],
      rows: [],
      isLoading: false,
    };
  },
  mounted() {
    this.setObjectNames();
    this.setUsers();
  },
  methods: {
    logout: async function () {
      let result = await AuthService.logout();
      if (result) {
        this.$router.replace("/");
      }
    },

    onSetRightsButtonClick: function () {
      this.isModalVisible = true;
    },

    setObjectNames: async function () {
      let result = await DataService.getAllRights();

      result.forEach((element) => {
        this.objectsNames.push(element.name);
      });

      this.loadColumns().then(() => {
        this.loadRows();
      });
    },

    onConfirmButtonClick: async function () {
      const config = {
        objectName: this.selectedObject,
        userName: this.selectedUser,
        rights: this.getSelectedRights(),
        isForceUpdate: true
      };

      let result = await DataService.updateRights(config);

      if (result.success) {
        this.loadRows();
        this.clearModal();
      } else {
        alert("Необходимо выбрать объект или пользователя!");
      }
    },

    getSelectedRights: function () {
      let rightsArray = [];
      if (this.readCheck) rightsArray.push("read");
      if (this.writeCheck) rightsArray.push("write");
      if (this.grantCheck) rightsArray.push("grant");

      return rightsArray;
    },

    clearModal: function () {
      this.isModalVisible = false;
      this.selectedUser = "";
      this.selectedObject = "";
      this.readCheck = false;
      this.writeCheck = false;
      this.grantCheck = false;
    },

    loadColumns: async function () {
      const width = 100 / (this.objectsNames.length + 1);
      this.objectsNames.forEach((name) => {
        this.columns.push({
          label: name,
          field: name.replace(" ", ""),
          width: Math.round(width) + "%",
        });
      });
    },

    setUsers: async function () {
      let users = await AuthService.getAllUsers();

      this.users = users.filter((name) => name != "admin");
    },

    loadRows: async function () {
      let allUsers = await AuthService.getAllUsers();
      let data = await DataService.getAllRights();

      if (!data) return;

      let rows = [];

      allUsers.forEach((userName) => {
        let row = {
          user: userName,
        };

        data.forEach((object) => {
          const objName = object.name.replace(" ", "");
          const rightsArray = object.rights[userName];

          row[objName] = AuthService.rightsToLczString(rightsArray);
        });

        rows.push(row);
      });

      this.rows = rows;
    },

    getSelectedUserRights: async function () {
      if (!this.selectedObject || !this.selectedUser) {
        return;
      }
      let result = await DataService.getRightsOnObjectByUser(
        this.selectedObject,
        this.selectedUser
      );

      const rights = result[0].rights;
      this.readCheck = rights.includes("read");
      this.writeCheck = rights.includes("write");
      this.grantCheck = rights.includes("grant");
    },

    onCanReadButtonUpdate: function () {
      if (!this.readCheck) {
        this.writeCheck = false;
        this.grantCheck = false;
      }
    },

    randomizeRights: async function() {
      let result = await AuthService.randomizeRights();
      this.loadRows();

      alert(result);
    }
  },
};
</script>

<style>
.grantRightsButton {
  margin: 20px;
}
</style>