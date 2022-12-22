<template>
    <Modal
    v-model:visible="isModalVisible"
    title="Назначение прав"
    :cancelButton="{ text: 'Отмена' }"
    :okButton="{ text: 'Подтвердить', onclick: onConfirmButtonClick }"
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
    <v-checkbox v-model="readCheck" label="Чтение"></v-checkbox>
    <v-checkbox v-model="writeCheck" label="Изменение"></v-checkbox>
    <v-checkbox v-model="grantCheck" label="Передача прав"></v-checkbox>
  </Modal>
</template>