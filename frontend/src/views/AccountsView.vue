<script setup>
import { mdiAccountGroupOutline, mdiPlus, mdiRefresh } from "@mdi/js";
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
import Axios from "@/models/axios.js";

const axios = new Axios();
const accounts = ref([]);
const configs = ref([]);
const selectedAccount = ref(null);

let showAddAccount = ref(false);
let showSelectConfigs = ref(false);
let form = reactive({
  name: "",
  account: "",
  password: "",
  broker: "",
  platform: "mt5",
});
let updateConfigForm = reactive({
  name: "",
  configs: [],
});

const platformOptions = [
  { id: "mt4", label: "Metatrader 4 (Not supported at the moment)" },
  { id: "mt5", label: "Metatrader 5" },
];

let addAccountErrorMessage = ref("");

const saveConfigs = async () => {
  let response = await axios.post("/api/account/configs", updateConfigForm);
  if (response.data.status == "success") {
    showSelectConfigs.value = false;
    await listAccounts();
  }
};

const selectConfigs = async (account) => {
  await listConfigs();
  selectedAccount.value = account;
  updateConfigForm.name = account.name;
  updateConfigForm.configs = []
  for (let config of configs.value) {
    if (account.configs.includes(config.name)) {
      updateConfigForm.configs.push(config.name);
    }
  }
  showSelectConfigs.value = true;
};

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

const cancelAddAccount = () => {
  form.name = "";
  form.account = "";
  form.password = "";
  form.broker = "";
};

const displayAddAccountError = (message) => {
  showAddAccount.value = true;
  addAccountErrorMessage.value = message;
};

const addAccount = async () => {
  try {
    if (form.name == "") {
      displayAddAccountError("Name is required");
      return;
    }
    if (form.account == "") {
      displayAddAccountError("Account is required");
      return;
    }
    if (form.password == "") {
      displayAddAccountError("Password is required");
      return;
    }
    if (form.broker == "") {
      displayAddAccountError("Broker is required");
      return;
    }
    if (form.platform == "") {
      displayAddAccountError("Platform is required");
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
  } catch (e) {
    displayAddAccountError(
      e.response && e.response.data ? e.response.data.message : e.message
    );
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

const listConfigs = async () => {
  let response = await axios.get("/api/config/list");
  if (response.data.status == "success") {
    configs.value = response.data.configs;
  }
};

const listAccounts = async () => {
  let response = await axios.get("/api/account/list");
  if (response.data.status == "success") {
    accounts.value = response.data.accounts;
  }
};
listAccounts();

const deployAccounts = async () => {
  let response = await axios.post("/api/account/deploy");
  if (response.data.status == "success") {
    await listAccounts();
  }
};
</script>

<template>
  <LayoutAuthenticated>
    <CardBoxModal
      v-model="showSelectConfigs"
      button-label="Save"
      title="Select Configs"
      has-cancel
      :message="addAccountErrorMessage"
      @confirm="saveConfigs()"
      @cancel="cancelAddAccount()"
    >
      <div class="h-100" style="height: 300px; overflow: auto">
        <table>
          <tr v-for="config in configs" :key="config.name">
            <td width="10">
              <input
                v-model="updateConfigForm.configs"
                type="checkbox"
                :value="config.name"
              />
            </td>
            <td>{{ config.name }}</td>
          </tr>
        </table>
      </div>
    </CardBoxModal>
    <CardBoxModal
      v-model="showAddAccount"
      button-label="Add Account"
      title="Accounts"
      has-cancel
      :message="addAccountErrorMessage"
      @confirm="addAccount()"
      @cancel="cancelAddAccount()"
    >
      <FormField label="Name" help="">
        <FormControl v-model="form.name" type="text" autocomplete="nofill" />
      </FormField>
      <FormField class="py-3" label="Select platform">
        <FormControl v-model="form.platform" :options="platformOptions" />
      </FormField>
      <FormField
        label="Broker Server"
        help="Broker Server, eg: MetaQuotes-Demo"
      >
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
      <SectionTitleLineWithButton
        :icon="mdiAccountGroupOutline"
        title="Accounts"
        main
      >
        <div>
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
          <BaseButton
            class="ml-2"
            :icon="mdiRefresh"
            color="danger"
            label="Deploy"
            @click="deployAccounts"
          />
        </div>
      </SectionTitleLineWithButton>
      <CardBox class="mb-6" has-table>
        <AccountsTable
          :accounts="accounts"
          @confirm="deleteAccount"
          @start-account="startAccount"
          @stop-account="stopAccount"
          @select-configs="selectConfigs"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
