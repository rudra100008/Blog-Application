import axios from "axios";
import baseUrl from "./base_url";
import { toast } from "react-toastify";

const api = axios.create({ baseURL: baseUrl, withCredentials: true });

api.interceptors.request.use(
  (config) => {
    console.log('Request URL:', config.url);
    console.log('With credentials:', config.withCredentials);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (err) => {
    if (err.code === "ERR_NETWORK") {
      const message = "Server is down or unreachable";
      if (!toast.isActive("network-error")) {
        console.error(message);
        toast.error(message, { toastId: "network-error" });
      }
    } else if (err.response) {
      if (err.response.status === 403) {
        const { message } = err.response?.data;
        if(!toast.isActive("forbidden-error")){
            toast.error(message,{toastId:"forbidden-error"})
        }
        console.log("message: ", message);
      }
      if (err.response.status === 401) {
        const { message } = err.response?.data;
        console.log("message:", message);
        if(!toast.isActive("unauthorized-error")){
            toast.error(message,{toastId:"unauthorized-error"});
        }
        // setTimeout(()=>{
        //      document.location.href = "/"
        // },2000)
      }
    }
    return Promise.reject(err);
  }
);

export default api;
