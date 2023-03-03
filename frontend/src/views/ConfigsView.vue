<script setup>
import { mdiCogOutline, mdiDownload, mdiPlus } from "@mdi/js";
import SectionMain from "@/components/SectionMain.vue";
import ConfigsTable from "@/components/ConfigsTable.vue";
import CardBox from "@/components/CardBox.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import BaseButton from "@/components/BaseButton.vue";
import CardBoxModal from "@/components/CardBoxModal.vue";
import FormField from "@/components/FormField.vue";
import FormControl from "@/components/FormControl.vue";
import { reactive, ref, computed } from "vue";
import { useConfigStore } from "@/stores/config.js";

const configStore = useConfigStore();
let searchText = ref("");
const configs = computed(() => configStore.configs);
const searchConfigs = computed(() =>
  configs.value.filter((config) => {
    if (!searchText.value) return true;
    let combinedText = config.name + config.platform + config.symbol;
    return combinedText.toLowerCase().includes(searchText.value.toLowerCase());
  })
);
const showAddConfigs = ref(false);
const showAddFromURL = ref(false);
const form = reactive({
  name: "",
  remark: "",
  platform: "mt5",
  timeframe: "60",
  symbol: "EURUSD",
});
const addConfigForm = reactive({
  url: "",
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

const cancelAddConfig = () => {
  form.name = "";
  form.remark = "";
  form.file = "";
};

const addConfig = async () => {
  if (!form.name) {
    return;
  }
  if (!form.platform) {
    return;
  }
  if (!form.timeframe) {
    return;
  }
  if (!form.symbol) {
    return;
  }

  let success = await configStore.add(form);
  if (success) {
    showAddConfigs.value = false;
    resetForm();
  }
};

const cancelConfigFromURL = () => {
  addConfigForm.url = "";
};

const importConfigFromURL = async () => {
  if (!addConfigForm.url) {
    return;
  }
  let success = await configStore.importFromURL(addConfigForm);
  if (success) {
    addConfigForm.url = "";
  }
};

const deleteConfig = async (name) => {
  let success = await configStore.delete({
    name: name,
  });
};
</script>

<template>
  <LayoutAuthenticated>
    <CardBoxModal
      v-model="showAddConfigs"
      button-label="Add Config"
      title="Config"
      has-cancel
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
    <CardBoxModal
      v-model="showAddFromURL"
      button-label="Import Now"
      title="Import Config from URL"
      has-cancel
      @confirm="importConfigFromURL()"
      @cancel="cancelConfigFromURL()"
    >
      <FormField class="py-3" label="URL">
        <FormControl
          v-model="addConfigForm.url"
          type="text"
          autocomplete="nofill"
        />
      </FormField>
    </CardBoxModal>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiCogOutline" title="Configs" main>
        <div>
          <BaseButton
            :icon="mdiDownload"
            color="info"
            style="margin-right: 10px"
            @click="showAddFromURL = true"
          />
          <BaseButton
            :icon="mdiPlus"
            color="info"
            @click="showAddConfigs = true"
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
