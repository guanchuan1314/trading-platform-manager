<script setup>
import { ref } from "vue";
import { mdiClose, mdiDotsVertical } from "@mdi/js";
import { containerMaxW } from "@/config.js";
import BaseIcon from "@/components/BaseIcon.vue";
import NavBarMenuList from "@/components/NavBarMenuList.vue";
import NavBarItemPlain from "@/components/NavBarItemPlain.vue";

defineProps({
  menu: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["menu-click"]);

const menuClick = (event, item) => {
  emit("menu-click", event, item);
};

const isMenuNavBarActive = ref(false);
</script>

<template>
  <nav
    class="top-0 inset-x-0 fixed bg-gray-50 h-14 z-30 transition-position w-screen lg:w-auto dark:bg-slate-800"
  >
    <div class="flex lg:items-stretch" :class="containerMaxW">
      <div class="flex flex-1 items-stretch h-14">
        <slot />
      </div>
    </div>
  </nav>
</template>
