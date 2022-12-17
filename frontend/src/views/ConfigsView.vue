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
import { reactive, ref } from "vue";
import axios from "axios";

const configs = ref([]);
const showAddConfigs = ref(false);
const addConfigErrorMessage = ref("");
const form = reactive({
  name: "",
  remark: "",
  platform: "mt5",
  timeframe: "60",
  symbol: "EURUSD",
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

const cancelAddConfig = () => {
  form.name = "";
  form.remark = "";
  form.file = "";
};

const addConfig = async () => {
  try {
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
  let response = await axios.post("/api/config/delete", {
    name: name,
  });
  if (response.data.status == "success") {
    await listConfigs();
  }
};

const listConfigs = async () => {
  let response = await axios.get("/api/config/list");
  if (response.data.status == "success") {
    configs.value = response.data.configs;
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
      <CardBox class="mb-6" has-table>
        <ConfigsTable
          checkable
          :configs="configs"
          @confirm="deleteConfig"
          @start-account="startAccount"
          @stop-account="stopAccount"
        />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
