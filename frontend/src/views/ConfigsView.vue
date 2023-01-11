<script setup>
import { mdiCogOutline, mdiPlus } from "@mdi/js";
import SectionMain from "@/components/SectionMain.vue";
import ConfigsTable from "@/components/ConfigsTable.vue";
import CardBox from "@/components/CardBox.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import BaseButton from "@/components/BaseButton.vue";
import CardBoxModal from "@/components/CardBoxModal.vue";
import FormField from "@/components/FormField.vue";
import FormControl from "@/components/FormControl.vue";
import { reactive, ref, watch } from "vue";
import Axios from "@/models/axios.js";
import NotificationBar from "@/components/NotificationBar.vue";

const axios = new Axios();
const configs = ref([]);
const searchConfigs = ref([]);
const showAddConfigs = ref(false);
const addConfigErrorMessage = ref("");
const errorMessage = ref("");
let searchText = ref("");
const form = reactive({
  name: "",
  remark: "",
  platform: "mt5",
  timeframe: "60",
  symbol: "EURUSD",
});
watch(searchText, () => {
  filterConfigs();
});

const platformOptions = [
  { id: "mt4", label: "Metatrader 4 (Not supported at the moment)" },
  { id: "mt5", label: "Metatrader 5" },
];

const timeframeOptions = [
  { id: "1", label: "M1" },
  { id: "5", label: "M5" },
  { id: "15", label: "M15" },
  { id: "30", label: "M30" },
  { id: "60", label: "H1" },
  { id: "240", label: "H4" },
  { id: "1440", label: "D1" },
  { id: "10080", label: "W1" },
  { id: "43200", label: "MN1" },
];

const resetForm = () => {
  form.name = "";
  form.remark = "";
  form.platform = "mt5";
  form.timeframe = "60";
  form.symbol = "EURUSD";
};

const displayAddConfigError = (message) => {
  showAddConfigs.value = true;
  addConfigErrorMessage.value = message;
};

const displayGlobalConfigError = (message) => {
  errorMessage.value = message;
};

const cancelAddConfig = () => {
  form.name = "";
  form.remark = "";
  form.file = "";
};

const addConfig = async () => {
  try {
    if (!form.name) {
      displayAddConfigError("Please enter a name for the config.");
      return;
    }
    if (!form.platform) {
      displayAddConfigError("Please select a platform.");
      return;
    }
    if (!form.timeframe) {
      displayAddConfigError("Please select a timeframe.");
      return;
    }
    if (!form.symbol) {
      displayAddConfigError("Please enter a symbol.");
      return;
    }

    let response = await axios.post("/api/config/add", form);
    if (response.data.status == "success") {
      showAddConfigs.value = false;
      resetForm();
      listConfigs();
    } else {
      displayAddConfigError(response.message);
    }
  } catch (e) {
    displayAddConfigError(
      e.response && e.response.data ? e.response.data.message : e.message
    );
  }
};

const deleteConfig = async (name) => {
  try {
    let response = await axios.post("/api/config/delete", {
      name: name,
    });
    if (response.data.status == "success") {
      await listConfigs();
      displayGlobalConfigError(`${name} has been deleted.`);
    }
  } catch (e) {
    displayGlobalConfigError(
      e.response && e.response.data ? e.response.data.message : e.message
    );
  }
};

const filterConfigs = () => {
  searchConfigs.value = configs.value.filter((config) => {
    let combinedText = config.name + config.platform + config.symbol;
    return combinedText.toLowerCase().includes(searchText.value.toLowerCase());
  });
};

const listConfigs = async () => {
  try {
    let response = await axios.get("/api/config/list");
    if (response.data.status == "success") {
      configs.value = response.data.configs;
    }
    filterConfigs();
  } catch (e) {
    displayGlobalConfigError(
      e.response && e.response.data ? e.response.data.message : e.message
    );
  }
};
listConfigs();
</script>

<template>
  <LayoutAuthenticated>
    <CardBoxModal
      v-model="showAddConfigs"
      button-label="Add Config"
      title="Config"
      has-cancel
      :message="addConfigErrorMessage"
      @confirm="addConfig()"
      @cancel="cancelAddConfig()"
    >
      <FormField class="py-3" label="Name">
        <FormControl v-model="form.name" type="text" autocomplete="nofill" />
      </FormField>
      <FormField class="py-3" label="Select platform">
        <FormControl v-model="form.platform" :options="platformOptions" />
      </FormField>
      <FormField class="py-3" label="Symbol">
        <FormControl v-model="form.symbol" type="text" autocomplete="nofill" />
      </FormField>
      <FormField class="py-3" label="Select timeframe">
        <FormControl v-model="form.timeframe" :options="timeframeOptions" />
      </FormField>
      <FormField class="py-3" label="Remark">
        <FormControl
          v-model="form.remark"
          type="textarea"
          autocomplete="nofill"
        />
      </FormField>
    </CardBoxModal>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiCogOutline" title="Configs" main>
        <BaseButton
          :icon="mdiPlus"
          color="info"
          @click="showAddConfigs = true"
        />
      </SectionTitleLineWithButton>
      <NotificationBar
        v-if="errorMessage"
        :show-dismiss="false"
        color="danger"
        :icon="mdiMonitorCellphone"
      >
        {{ errorMessage }}
      </NotificationBar>
      <FormField label="" help="">
        <FormControl
          v-model="searchText"
          type="text"
          autocomplete="nofill"
          placeholder="Type in text to search..."
        />
      </FormField>
      <CardBox class="mb-6" has-table>
        <ConfigsTable
          checkable
          :configs="searchConfigs"
          @confirm="deleteConfig"
          @reload-configs="listConfigs"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
