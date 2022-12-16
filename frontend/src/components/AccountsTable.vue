<script setup>
import { ref } from "vue";
import { mdiEye, mdiTrashCan, mdiPlay, mdiStop } from "@mdi/js";
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

const emit = defineEmits(["confirm", "startAccount", "stopAccount"]);

const isModalActive = ref(false);

const isModalDangerActive = ref(false);

const selectedAccountName = ref("");
const selectAccountToDelete = (name) => {
  selectedAccountName.value = name;
  isModalDangerActive.value = true;
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
</script>

<template>
  <CardBoxModal v-model="isModalActive" title="Sample modal">
    <p>Lorem ipsum dolor sit amet <b>adipiscing elit</b></p>
    <p>This is sample modal</p>
  </CardBoxModal>

  <CardBoxModal
    v-model="isModalDangerActive"
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
        <td data-label="Company">
          {{ account.account }}
        </td>
        <td data-label="City">
          {{ account.broker }}
        </td>
        <td data-label="Progress" class="lg:w-32">
          {{ account.status }}
        </td>
        <td class="before:hidden lg:w-1 whitespace-nowrap">
          <BaseButtons type="justify-start lg:justify-end" no-wrap>
            <BaseButton
              color="info"
              :icon="mdiEye"
              small
              @click="isModalActive = true"
            />
            <BaseButton
              v-if="account.status == 'Stopped'"
              color="info"
              :icon="mdiPlay"
              small
              @click="startAccount(account.name)"
            />
            <BaseButton
              v-if="account.status == 'Running'"
              color="danger"
              :icon="mdiStop"
              small
              @click="stopAccount(account.name)"
            />
            <BaseButton
              color="danger"
              :icon="mdiTrashCan"
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
