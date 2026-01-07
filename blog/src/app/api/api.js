
import axios from "axios";
import baseUrl from "./base_url";
import { toast } from "react-toastify";


const api = axios.create({ baseURL: baseUrl, withCredentials: true });

api.interceptors.request.use(
    (config)=>{
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
)

api.interceptors.response.use(
    (response)=>{
        return response;
    },
    (err)=>{
        if(err.code  === 'ERR_NETWORK'){
            const message = 'Server is down or unreachable';
            console.error(message);
        }else if(err.response){
            if(err.response.status === 403){
                const {message} =err.response?.data;
                console.log("message: ",message)
            }
            if(err.response.status === 401){
                const {message} = err.response?.data;
                console.log("message:",message);
                toast.error(message)
            }
        }
        return Promise.reject(err);
    }
)

export default api;
