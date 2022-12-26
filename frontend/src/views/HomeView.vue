<script setup>
import {
  mdiAccountMultiple,
  mdiCartOutline,
  mdiChartTimelineVariant,
} from "@mdi/js";
import { ref } from "vue";
import SectionMain from "@/components/SectionMain.vue";
import CardBoxWidget from "@/components/CardBoxWidget.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import Axios from "@/models/axios.js";

const axios = new Axios();
const memoryUsage = ref(0);
const cpuUsage = ref(0);
const storageUsage = ref(0);
const terminalCount = ref(0);

const getData = async () => {
  const response = await axios.get("/api/stat/all");
  if (response.data.status == "success") {
    memoryUsage.value = response.data.memoryUsage;
    cpuUsage.value = response.data.cpuUsage;
    storageUsage.value = response.data.storageUsage;
    terminalCount.value = response.data.terminalCount;
  }
};
getData();
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <CardBoxWidget
          :icon="mdiAccountMultiple"
          :number="cpuUsage"
          suffix=" %"
          label="CPU"
        />
        <CardBoxWidget
          color="text-blue-500"
          :icon="mdiCartOutline"
          :number="memoryUsage"
          suffix=" %"
          label="Memory"
        />
        <CardBoxWidget
          color="text-blue-500"
          :icon="mdiCartOutline"
          :number="storageUsage"
          suffix=" %"
          label="Storage"
        />
        <CardBoxWidget
          color="text-red-500"
          :icon="mdiChartTimelineVariant"
          :number="terminalCount"
          label="Terminals"
        />
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>
