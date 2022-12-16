<script setup>
import { mdiTableBorder, mdiPlus } from "@mdi/js";
import SectionMain from "@/components/SectionMain.vue";
import UpdatesTable from "@/components/UpdatesTable.vue";
import CardBox from "@/components/CardBox.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import BaseButton from "@/components/BaseButton.vue";
import CardBoxModal from "@/components/CardBoxModal.vue";
import FormField from "@/components/FormField.vue";
import FormControl from "@/components/FormControl.vue";
import FormFilePicker from "@/components/FormFilePicker.vue";
import PillTagClose from "@/components/PillTagClose.vue";
import { reactive, ref } from "vue";

const showAddUpdates = ref(false);
const form = reactive({
  file: "",
  account: "",
  accounts: [],
});
const selectOptions = [
  { id: 1, label: "Business development" },
  { id: 2, label: "Marketing" },
  { id: 3, label: "Sales" },
];

const accountChange = (account) => {
  let accounts = form.accounts.filter((filterAccount) => {
    return filterAccount.id == account.id;
  });
  if (accounts.length == 0) {
    form.accounts.push(account);
  }
  form.account = "";
};
</script>

<template>
  <LayoutAuthenticated>
    <CardBoxModal
      v-model="showAddUpdates"
      button-label="Deploy now"
      title="Updates"
      has-cancel
    >
      <FormFilePicker v-model="form.file" label="Select your zip file" />
      <FormField class="py-3" label="Select accounts (Multiple allowed)">
        <FormControl
          v-model="form.account"
          :options="selectOptions"
          @update:modelValue="accountChange"
        />
      </FormField>
      <div
        v-for="account of form.accounts"
        :key="account.id"
        class="px-1"
        style="display: inline-block"
      >
        <PillTagClose :label="account.label" big />
      </div>
    </CardBoxModal>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Updates" main>
        <BaseButton
          :icon="mdiPlus"
          color="info"
          @click="showAddUpdates = true"
        />
      </SectionTitleLineWithButton>
      <CardBox class="mb-6" has-table>
        <UpdatesTable checkable />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
