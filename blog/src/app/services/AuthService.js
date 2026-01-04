import axios from "axios";
import base_url from "../api/base_url";

export const logout=async(token,router)=>{
    if(!token) return;
    try{
        const  response = await axios.get(`${base_url}/logout`,{
            headers:{Authorization:`Bearer ${token}`}
        })
        console.log("Reponse of logout:",response.data);
        router.push("/")
        throw response.data;
    }catch(err){
        console.log("Error in logout: ",err);
        throw err;
    }
}