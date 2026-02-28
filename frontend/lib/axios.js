import axios from "axios";

const API = axios.create({
  baseURL: ,
  withCredentials: true, // if using cookies
});

export default API;