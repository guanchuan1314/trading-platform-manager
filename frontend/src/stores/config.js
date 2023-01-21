import { defineStore } from "pinia";
import Axios from "@/models/axios.js";
const axios = new Axios()
export const useConfigStore = defineStore("config", {
  state: () => ({
    configs: []
  }),
  actions: {
    async list(){
        let response = await axios.get('/api/config/list');
        if (response.data.status == "success") {
            this.configs = response.data.configs;
        } else {
            this.configs = []
        }
    },
    async add(object){
        let response = await axios.post('/api/config/add', object);
        if(response.data.status == "success"){
            this.list()
            return true;
        }
        return false;
    },
    async delete(params){
        let response = await axios.post('/api/config/delete', params);
        if(response.data.status == "success"){
            this.list()
            return true;
        }
        return false;
    },
    async upload(params){
        let response = await axios.post("/api/config/upload", params, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        if (response.data.status == "success") {
            this.list()
            return true;
        }
        return false;
    }
  },
});
