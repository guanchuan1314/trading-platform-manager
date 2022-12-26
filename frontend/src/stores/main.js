import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({
    token: null,
  }),
  actions: {
    setToken(token) {
      this.token = token;
    },
  },
});
