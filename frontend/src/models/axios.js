import axios from "axios";

export default class Axios {
  constructor(name){
    this.name = name;
    this.items = []
  }

  get(url) {
    return axios.get(url + "?token=" + localStorage.getItem("token"));
  }

  post(url, data, config = {}) {
    data.token = localStorage.getItem("token");
    return axios.post(url, data, config);
  }

  async list(){
    let response = await this.get(`/api/${this.name}/list`);
    if (response.data.status == "success") {
        return response.data.accounts;
    }
    return []
  }

  async add(object){
    let response = await axios.post(`/api/${this.name}/add`, object);
    return (response.data.status == 'success')
  }

  async delete(params){
    let response = await axios.post(`/api/${this.name}/delete`, params);
    return response.data.status == 'success'
  }
}
