import { defineStore } from "pinia";
import Config from "@/models/config.js";

export const useMainStore = defineStore("main", {
  state: () => ({
    token: null,
    configs: []
  }),
  actions: {
    setToken(token) {
      this.token = token;
    },
    async getConfigs(){
      let config = new Config();
      this.configs = await config.list();
    },
    async preload(){
      this.getConfigs()
    }
  },
});
