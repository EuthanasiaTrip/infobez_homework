<template>
  <Modal
    v-model:visible="isModalVisible"
    title="Передача прав"
    :cancelButton="{ text: 'Отмена' }"
    :okButton="{ text: 'Передать', onclick: onConfirmButtonClick }"
  >
    <v-text-field v-model="fileName" outlined disabled label="Объект">
    </v-text-field>
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
      v-show="isReadButtonVisible"
      label="Чтение"
    ></v-checkbox>
    <v-checkbox
      v-model="writeCheck"
      :disabled="!readCheck"
      v-show="isWriteButtonVisible"
      label="Запись"
    ></v-checkbox>
    <v-checkbox
      v-model="grantCheck"
      v-show="isGrantButtonVisible"
      :disabled="!readCheck"
      label="Передача прав"
    ></v-checkbox>
  </Modal>
  <Modal
    v-model:visible="isReadWriteModalVisible"
    title="Значение объекта"
    :cancelButton="{ text: 'Отмена' }"
    :okButton="{ text: 'ОК', onclick: onConfirmReadWriteModalClick }"
  >
    <v-textarea
      bg-color="amber-lighten-4"
      color="orange orange-darken-4"
      label="Значение"
      :disabled="!isModalInWriteMode"
      v-model="fileValue"
    ></v-textarea>
  </Modal>
  <v-card width="800">
    <v-list-item>
      <v-list-item-title>
        {{ name }}
      </v-list-item-title>
      <v-list-item-subtitle>
        {{ this.getItemRights() }}
      </v-list-item-subtitle>
    </v-list-item>

    <v-card-actions class="justify-center">
      <v-btn v-if="isReadButtonVisible" v-on:click="getObjectValue(false)">
        Прочитать значение
      </v-btn>
      <v-btn v-if="isWriteButtonVisible" v-on:click="getObjectValue(true)">
        Записать значение
      </v-btn>
      <v-btn v-if="isGrantButtonVisible" v-on:click="onGrantRightsButtonClick">
        Передать права
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { Modal } from "usemodal-vue3";
import DataService from "../services/DataService";
import AuthService from "../services/AuthService";

export default {
  name: "ObjectRow",
  components: { Modal },
  props: ["name", "rights"],
  data() {
    return {
      isReadButtonVisible: false,
      isWriteButtonVisible: false,
      isGrantButtonVisible: false,
      isModalVisible: false,
      readCheck: false,
      writeCheck: false,
      grantCheck: false,
      users: [],
      selectedUser: "",
      fileName: this.name,
      isReadWriteModalVisible: false,
      fileValue: "",
      isModalInWriteMode: false
    };
  },
  mounted() {
    this.setButtonsVisibility();
    this.setUsers();
  },
  methods: {
    getItemRights: function () {
      return AuthService.rightsToLczString(this.rights);
    },

    setButtonsVisibility: function () {
      this.isReadButtonVisible = this.rights.includes("read");
      this.isWriteButtonVisible = this.rights.includes("write");
      this.isGrantButtonVisible = this.rights.includes("grant");
    },

    onGrantRightsButtonClick: function () {
      this.isModalVisible = true;
    },

    onConfirmButtonClick: function () {
      const config = {
        objectName: this.name,
        userName: this.selectedUser,
        rights: this.getSelectedRights(),
      };

      this.clearModal();

      DataService.updateRights(config);
    },

    getSelectedRights: function () {
      let rightsArray = [];
      if (this.isReadButtonVisible) rightsArray.push("read");
      if (this.isWriteButtonVisible) rightsArray.push("write");
      if (this.isGrantButtonVisible) rightsArray.push("grant");

      return rightsArray;
    },

    clearModal: function () {
      this.isModalVisible = false;
      this.isReadWriteModalVisible = false;
      this.selectedUser = "";
      this.readCheck = false;
      this.writeCheck = false;
      this.grantCheck = false;
    },

    getSelectedUserRights: async function () {
      let result = await DataService.getRightsOnObjectByUser(
        this.name,
        this.selectedUser
      );

      const rights = result[0].rights;
      this.readCheck = rights.includes("read");
      this.writeCheck = rights.includes("write");
      this.grantCheck = rights.includes("grant");
    },

    setUsers: async function () {
      let users = await AuthService.getAllUsers();
      let usersWithoutAdmin = users.filter(name => name != "admin");
      let currentUser = await AuthService.getCurrentUser();

      this.users = usersWithoutAdmin.filter((item) => item != currentUser);
    },

    getObjectValue: async function (isWriteMode) {
      let result = await DataService.readValue(this.name);
      this.isModalInWriteMode = isWriteMode;
      this.fileValue = result.value;    
      this.isReadWriteModalVisible = true;
    },

    onConfirmReadWriteModalClick: function() {
      this.clearModal();
      if(this.isModalInWriteMode){
        const data = {
          objectName: this.name,
          value: this.fileValue
        }

        DataService.updateValue(data)
      }
    },

    onCanReadButtonUpdate: function () {
      if (!this.readCheck) {
        this.writeCheck = false;
        this.grantCheck = false;
      }
    },
  },
};
</script>