<script setup>
import { mdiTableBorder, mdiPlus } from "@mdi/js";
import SectionMain from "@/components/SectionMain.vue";
import AccountsTable from "@/components/AccountsTable.vue";
import CardBox from "@/components/CardBox.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import BaseButton from "@/components/BaseButton.vue";
import CardBoxModal from "@/components/CardBoxModal.vue";
import FormField from "@/components/FormField.vue";
import FormControl from "@/components/FormControl.vue";
import { reactive, ref } from "vue";
import axios from "axios";

const accounts = ref([]);

let showAddAccount = ref(false);
let form = reactive({
  name: "",
  account: "",
  password: "",
  broker: "",
});

let addAccountErrorMessage = ref("");

const startAccount = async (name) => {
  let response = await axios.post("/api/account/start", {
    name: name,
  });
  if (response.data.status == "success") {
    await listAccounts();
  }
};

const stopAccount = async (name) => {
  let response = await axios.post("/api/account/stop", {
    name: name,
  });
  if (response.data.status == "success") {
    await listAccounts();
  }
};

const addAccount = async () => {
  if (form.name == "") {
    addAccountErrorMessage.value = "Name is required";
    showAddAccount.value = true;
    return;
  }
  if (form.account == "") {
    addAccountErrorMessage.value = "Account is required";
    showAddAccount.value = true;
    return;
  }
  if (form.password == "") {
    addAccountErrorMessage.value = "Password is required";
    showAddAccount.value = true;
    return;
  }

  let response = await axios.post("/api/account/add", form);
  if (response.data.status == "success") {
    showAddAccount.value = false;
    form.name = "";
    form.account = "";
    form.password = "";
    form.broker = "";
    await listAccounts();
  } else {
    addAccountErrorMessage.value = response.data.message;
    showAddAccount.value = true;
  }
};

const deleteAccount = async (name) => {
  let response = await axios.post("/api/account/delete", {
    name: name,
  });
  if (response.data.status == "success") {
    await listAccounts();
  }
};

const listAccounts = async () => {
  let response = await axios.get("/api/account/list");
  if (response.data.status == "success") {
    accounts.value = response.data.accounts;
  }
};
listAccounts();
</script>

<template>
  <LayoutAuthenticated>
    <CardBoxModal
      v-model="showAddAccount"
      button-label="Add Account"
      title="Updates"
      has-cancel
      :message="addAccountErrorMessage"
      @confirm="addAccount()"
    >
      <FormField label="Name" help="">
        <FormControl v-model="form.name" type="text" autocomplete="nofill" />
      </FormField>
      <FormField label="Broker" help="">
        <FormControl v-model="form.broker" type="text" autocomplete="nofill" />
      </FormField>
      <FormField label="Account" help="MT5 account">
        <FormControl v-model="form.account" type="text" autocomplete="nofill" />
      </FormField>
      <FormField label="Password" help="MT5 account's password">
        <FormControl
          v-model="form.password"
          type="password"
          autocomplete="nofill"
        />
      </FormField>
    </CardBoxModal>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Accounts" main>
        <BaseButton
          :icon="mdiPlus"
          color="info"
          @click="
            showAddAccount = true;
            addAccountErrorMessage = '';
            form.name = '';
            form.account = '';
            form.password = '';
            form.broker = '';
          "
        />
      </SectionTitleLineWithButton>
      <CardBox class="mb-6" has-table>
        <AccountsTable
          :accounts="accounts"
          @confirm="deleteAccount"
          @start-account="startAccount"
          @stop-account="stopAccount"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
