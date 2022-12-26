import { createRouter, createWebHashHistory } from "vue-router";
import Home from "@/views/HomeView.vue";
import { useMainStore } from "@/stores/main.js";
import Axios from "@/models/axios.js";

const axios = new Axios();

const ifAuthenticated = async (to, from, next) => {
  const response = await axios.get("/api/main/data");
  if (response.data.status == "error") {
    router.push({
      name: "register",
      params: {
        returnTo: to.path,
        query: to.query,
      },
    });
    return;
  }

  const mainStore = useMainStore();
  if (mainStore.token) {
    next();
    return;
  }
  router.push({
    name: "login",
    params: {
      returnTo: to.path,
      query: to.query,
    },
  });
};

const ifSetup = async (to, from, next) => {
  const response = await axios.get("/api/main/data");
  if (response.data.status != "success") {
    router.push({
      name: "register",
      params: {
        returnTo: to.path,
        query: to.query,
      },
    });
    return;
  }
  next();
};

const ifNotSetup = async (to, from, next) => {
  const response = await axios.get("/api/main/data");
  if (response.data.status != "success") {
    next();
    return;
  }
  router.push({
    name: "login",
    params: {
      returnTo: to.path,
      query: to.query,
    },
  });
};

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
    beforeEnter: ifAuthenticated,
  },
  {
    meta: {
      title: "Accounts",
    },
    path: "/accounts",
    name: "accounts",
    component: () => import("@/views/AccountsView.vue"),
    beforeEnter: ifAuthenticated,
  },
  {
    meta: {
      title: "Configs",
    },
    path: "/configs",
    name: "configs",
    component: () => import("@/views/ConfigsView.vue"),
    beforeEnter: ifAuthenticated,
  },
  {
    meta: {
      title: "Login",
    },
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
    beforeEnter: ifSetup,
  },
  {
    meta: {
      title: "Register",
    },
    path: "/register",
    name: "register",
    component: () => import("@/views/RegisterView.vue"),
    beforeEnter: ifNotSetup,
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
