import { defineStore } from "pinia";
import Axios from "@/models/axios.js";
const axios = new Axios()
export const useAccountStore = defineStore("account", {
  state: () => ({
    accounts: []
  }),
  actions: {
    async list(){
        let response = await axios.get('/api/account/list');
        if (response.data.status == "success") {
            this.accounts = response.data.accounts;
        } else {
            this.accounts = []
        }
    },
    async deploy(){
        let response = await axios.post("/api/account/deploy");
        if(response.data.status == "success"){
            this.list()
            return true;
        }
        return false;
    },
    async stop(params){
        let response = await axios.post("/api/account/stop", params);
        if(response.data.status == "success"){
            this.list()
            return true;
        }
        return false;
    },
    async start(params){
        let response = await axios.post("/api/account/start", params);
        if(response.data.status == "success"){
            this.list()
            return true;
        }
        return false;
    },
    async add(object){
        let response = await axios.post('/api/account/add', object);
        if(response.data.status == "success"){
            this.list()
            return true;
        }
        return false;
    },
    async delete(params){
        let response = await axios.post('/api/account/delete', params);
        if(response.data.status == "success"){
            this.list()
            return true;
        }
        return false;
    },
    async updateConfig(params){
        let response = await axios.post("/api/account/configs", params);
        if(response.data.status == "success"){
            this.list()
            return true;
        }
        return false;
    }
  },
});
