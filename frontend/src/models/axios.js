import axios from "axios";

export default class Axios {
  get(url) {
    return axios.get(url + "?token=" + localStorage.getItem("token"));
  }

  post(url, data, config = {}) {
    data.token = localStorage.getItem("token");
    return axios.post(url, data, config);
  }
}
