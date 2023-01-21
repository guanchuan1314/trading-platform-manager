import Axios from "@/models/axios.js";

export default class Account extends Axios{
    constructor(){
        super("config")
    }
}