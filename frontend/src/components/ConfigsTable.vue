<script setup>
import { ref, reactive } from "vue";
import {
  mdiTrashCanOutline,
  mdiCheck,
  mdiAlphaXCircleOutline,
  mdiCloudUploadOutline,
  mdiCogOutline,
} from "@mdi/js";
import CardBoxModal from "@/components/CardBoxModal.vue";
import BaseLevel from "@/components/BaseLevel.vue";
import BaseButtons from "@/components/BaseButtons.vue";
import BaseButton from "@/components/BaseButton.vue";
import IconRounded from "@/components/IconRounded.vue";
import Axios from "@/models/axios.js";
import { useConfigStore } from "@/stores/config.js";

const configStore = useConfigStore();
const axios = new Axios();
const showConfirmDeleteConfigModal = ref(false);
const selectedConfigName = ref("");
const emit = defineEmits(["reloadConfigs", "confirm"]);

const form = reactive({
  name: "",
  type: "",
  platform: "",
  file: "",
});

const resetForm = () => {
  form.name = "";
  form.type = "";
  form.platform = "";
  form.file = "";
};

const fileSelected = async (e) => {
  form.file = e.target.files[0];
  e.target.value = "";
  let success = await configStore.upload(form);
  if(success){
    resetForm();
  }
};

const inputClicked = async (name, type, platform) => {
  form.type = type;
  form.platform = platform;
  form.name = name;
  let input = "";
  if (type == "expert" && platform == "mt5") {
    input = document.getElementById("ex5");
  } else if (type == "expert" && platform == "mt4") {
    input = document.getElementById("ex4");
  } else if (type == "set") {
    input = document.getElementById("set");
  }
  if (input) {
    input.click();
  }
};

const platforms = {
  mt4: "Metatrader 4 (Not supported at the moment)",
  mt5: "Metatrader 5",
};

const timeframes = {
  1: "M1",
  5: "M5",
  15: "M15",
  30: "M30",
  60: "H1",
  240: "H4",
  1440: "D1",
  10080: "W1",
  43200: "MN1",
};

defineProps({
  configs: {
    type: Array,
    default: () => [],
  },
});

const selectConfigToDelete = (name) => {
  selectedConfigName.value = name;
  showConfirmDeleteConfigModal.value = true;
};

const confirmDelete = () => {
  emit("confirm", selectedConfigName.value);
};
</script>

<template>
  <CardBoxModal
    v-model="showConfirmDeleteConfigModal"
    title="Please confirm"
    button="danger"
    button-label="Delete now"
    has-cancel
    @confirm="confirmDelete"
  >
    <p>Are you sure you want to delete?</p>
  </CardBoxModal>
  <input
    id="ex5"
    type="file"
    style="display: none"
    accept=".ex5"
    @change="fileSelected($event)"
  />
  <input
    id="ex4"
    type="file"
    style="display: none"
    accept=".ex4"
    @change="fileSelected($event)"
  />
  <input
    id="set"
    type="file"
    style="display: none"
    accept=".set"
    @change="fileSelected($event)"
  />
  <table>
    <thead>
      <tr>
        <th />
        <th>Name</th>
        <th>Symbol</th>
        <th>Timeframe</th>
        <th>Platform</th>
        <th>Uploaded</th>
        <th>Remark</th>
        <th />
      </tr>
    </thead>
    <tbody v-if="configs.length == 0">
      <tr>
        <td colspan="8">
          <div class="text-center py-24 text-gray-500 dark:text-slate-400">
            <p>
              You haven't add any configs. Please the add button on the top
              right to add config.
            </p>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-if="configs.length > 0">
      <tr v-for="(config, index) in configs" :key="config.name">
        <td class="border-b-0 lg:w-6 before:hidden">
          {{ index + 1 }}
        </td>
        <td data-label="Name">
          {{ config.name }}
        </td>
        <td data-label="Symbol">
          {{ config.symbol }}
        </td>
        <td data-label="Timeframe">
          {{ timeframes[config.timeframe] }}
        </td>
        <td data-label="Platform">
          {{ platforms[config.platform] }}
        </td>
        <td data-label="Uploaded">
          <BaseLevel
            v-for="uploadedAttribute of config.uploadedAttributes"
            :key="uploadedAttribute.name"
            class="mb-2"
          >
            {{ uploadedAttribute.name }}
            <BaseLevel>
              <BaseLevel>
                <IconRounded
                  v-if="uploadedAttribute.value"
                  :icon="mdiCheck"
                  color="info"
                  :w="10"
                  :h="10"
                />
                <IconRounded
                  v-if="!uploadedAttribute.value"
                  :icon="mdiAlphaXCircleOutline"
                  color="danger"
                  :w="10"
                  :h="10"
                />
              </BaseLevel>
              <IconRounded
                style="cursor: pointer"
                class="ml-2"
                :icon="mdiCloudUploadOutline"
                color="contrast"
                :w="10"
                :h="10"
                @click="
                  inputClicked(
                    config.name,
                    uploadedAttribute.type,
                    config.platform
                  )
                "
              />
            </BaseLevel>
          </BaseLevel>
        </td>
        <td data-label="Remark">
          {{ config.remark }}
        </td>
        <td class="before:hidden lg:w-1 whitespace-nowrap">
          <BaseButtons type="justify-start lg:justify-end" no-wrap>
            <BaseButton
              color="info"
              :icon="mdiCogOutline"
              small
              @click="isModalActive = true"
            />
            <BaseButton
              color="danger"
              :icon="mdiTrashCanOutline"
              small
              @click="selectConfigToDelete(config.name)"
            />
          </BaseButtons>
        </td>
      </tr>
    </tbody>
  </table>
  <div class="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
    <BaseLevel>
      <BaseButtons>
        <BaseButton
          v-for="page in pagesList"
          :key="page"
          :active="page === currentPage"
          :label="page + 1"
          :color="page === currentPage ? 'lightDark' : 'whiteDark'"
          small
          @click="currentPage = page"
        />
      </BaseButtons>
    </BaseLevel>
  </div>
</template>
