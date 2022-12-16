import { createRouter, createWebHashHistory } from "vue-router";
import Style from "@/views/StyleView.vue";
import Home from "@/views/HomeView.vue";

const routes = [
  {
    // Document title tag
    // We combine it with defaultDocumentTitle set in `src/main.js` on router.afterEach hook
    meta: {
      title: "Dashboard",
    },
    path: "/",
    name: "dashboard",
    component: Home,
  },
  {
    meta: {
      title: "Accounts",
    },
    path: "/accounts",
    name: "accounts",
    component: () => import("@/views/AccountsView.vue"),
  },
  {
    meta: {
      title: "Updates",
    },
    path: "/updates",
    name: "updates",
    component: () => import("@/views/UpdatesView.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

export default router;
