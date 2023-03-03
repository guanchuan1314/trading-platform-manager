import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { useStyleStore } from "@/stores/style.js";
import { useMainStore } from "@/stores/main.js";
import { useAccountStore } from "@/stores/account.js";
import { useConfigStore } from "@/stores/config.js";

import "./css/main.css";

/* Init Pinia */
const pinia = createPinia();

/* Create Vue app */
createApp(App).use(router).use(pinia).mount("#app");

/* Init Pinia stores */
const styleStore = useStyleStore(pinia);
const mainStore = useMainStore(pinia);
const accountStore = useAccountStore(pinia);
const configStore = useConfigStore(pinia);

mainStore.preload()
accountStore.list();
configStore.list();

/* Dark mode */
styleStore.setDarkMode(true);
if (localStorage.getItem("token")) {
  mainStore.setToken(localStorage.getItem("token"));
}

/* Default title tag */
const defaultDocumentTitle = "Trading Platform Manager";

/* Set document title from route meta */
router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} — ${defaultDocumentTitle}`
    : defaultDocumentTitle;
});
