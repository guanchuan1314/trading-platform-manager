<script setup>
import { ref } from "vue";
import {
  mdiCogOutline,
  mdiTrashCanOutline,
  mdiPlayOutline,
  mdiStop,
} from "@mdi/js";
import CardBoxModal from "@/components/CardBoxModal.vue";
import BaseLevel from "@/components/BaseLevel.vue";
import BaseButtons from "@/components/BaseButtons.vue";
import BaseButton from "@/components/BaseButton.vue";

defineProps({
  checkable: Boolean,
  accounts: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "confirm",
  "startAccount",
  "stopAccount",
  "selectConfigs",
]);

const isModalActive = ref(false);

const showConfirmDeleteAccountModal = ref(false);

const selectedAccountName = ref("");
const selectAccountToDelete = (name) => {
  selectedAccountName.value = name;
  showConfirmDeleteAccountModal.value = true;
};

const startAccount = (name) => {
  emit("startAccount", name);
};

const stopAccount = (name) => {
  emit("stopAccount", name);
};

const confirmDelete = () => {
  emit("confirm", selectedAccountName.value);
};

const selectAccountToUpdateConfig = (name) => {
  emit("selectConfigs", name);
};
</script>

<template>
  <CardBoxModal
    v-model="showConfirmDeleteAccountModal"
    title="Please confirm"
    button="danger"
    button-label="Delete now"
    has-cancel
    @confirm="confirmDelete"
  >
    <p>Are you sure you want to delete?</p>
  </CardBoxModal>

  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Account</th>
        <th>Broker</th>
        <th>Status</th>
        <th />
      </tr>
    </thead>
    <tbody v-if="accounts.length == 0">
      <div class="text-center py-24 text-gray-500 dark:text-slate-400">
        <p>
          You haven't add any accounts. Please the add button on the top right
          to add account.
        </p>
      </div>
    </tbody>
    <tbody v-if="accounts.length > 0">
      <tr v-for="account in accounts" :key="account.name">
        <td data-label="Name">
          {{ account.name }}
        </td>
        <td data-label="Account">
          {{ account.account }}
        </td>
        <td data-label="Broker">
          {{ account.broker }}
        </td>
        <td data-label="Status" class="lg:w-32">
          {{ account.status }}
        </td>
        <td class="before:hidden lg:w-1 whitespace-nowrap">
          <BaseButtons type="justify-start lg:justify-end" no-wrap>
            <BaseButton
              color="info"
              :icon="mdiCogOutline"
              small
              @click="selectAccountToUpdateConfig(account)"
            />
            <BaseButton
              v-if="account.status == 'Terminal Not Started'"
              color="info"
              :icon="mdiPlayOutline"
              small
              @click="startAccount(account.name)"
            />
            <BaseButton
              v-if="account.status != 'Terminal Not Started'"
              color="danger"
              :icon="mdiStop"
              small
              @click="stopAccount(account.name)"
            />
            <BaseButton
              color="danger"
              :icon="mdiTrashCanOutline"
              small
              @click="selectAccountToDelete(account.name)"
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
