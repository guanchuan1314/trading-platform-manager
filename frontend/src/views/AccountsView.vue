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
import { reactive, ref, computed } from "vue";
import { useAccountStore } from "@/stores/account.js";

const configs = ref([]);
const selectedAccount = ref(null);
const accountStore = useAccountStore();
const accounts = computed(() => accountStore.accounts)
const searchAccounts = computed(() => accounts.value.filter((account) => {
  if(!searchText.value) return true;
  const combined = account.name + account.account + account.broker;
  return combined.toLowerCase().includes(searchText.value.toLowerCase()); 
}));

let showAddAccount = ref(false);
let showSelectConfigs = ref(false);
let searchText = ref("");
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

const saveConfigs = async () => {
  let success = await accountStore.updateConfig(updateConfigForm)
  if(success){
    showSelectConfigs.value = false;
  }
};

const selectConfigs = async (account) => {
  await listConfigs();
  selectedAccount.value = account;
  updateConfigForm.name = account.name;
  updateConfigForm.configs = [];
  for (let config of configs.value) {
    if (account.configs.includes(config.name)) {
      updateConfigForm.configs.push(config.name);
    }
  }
  showSelectConfigs.value = true;
};

const startAccount = async (name) => {
  await accountStore.start({
    name: name,
  });
};

const stopAccount = async (name) => {
  await accountStore.stop({
    name: name,
  });
};

const cancelAddAccount = () => {
  form.name = "";
  form.account = "";
  form.password = "";
  form.broker = "";
};

const addAccount = async () => {
  if (form.name == "") {
    return;
  }
  if (form.account == "") {
    return;
  }
  if (form.password == "") {
    return;
  }
  if (form.broker == "") {
    return;
  }
  if (form.platform == "") {
    return;
  }

  let success = await accountStore.add(form);
  if(success){
    showAddAccount.value = false;
    form.name = "";
    form.account = "";
    form.password = "";
    form.broker = "";
  }
};

const deleteAccount = async (name) => {
  await accountStore.delete({
    name: name,
  });
};

const listConfigs = async () => {
  let response = await axios.get("/api/config/list");
  if (response.data.status == "success") {
    configs.value = response.data.configs;
  }
};

const deployAccounts = async () => {
  let success = await accountStore.deploy();
};
</script>

<template>
  <LayoutAuthenticated>
    <CardBoxModal
      v-model="showSelectConfigs"
      button-label="Save"
      title="Select Configs"
      has-cancel
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
      <FormField label="" help="">
        <FormControl
          v-model="searchText"
          type="text"
          autocomplete="nofill"
          placeholder="Type in text to search..."
        />
      </FormField>
      <CardBox class="mb-6" has-table>
        <AccountsTable
          :accounts="searchAccounts"
          @confirm="deleteAccount"
          @start-account="startAccount"
          @stop-account="stopAccount"
          @select-configs="selectConfigs"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
