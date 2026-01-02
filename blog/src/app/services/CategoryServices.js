import axios from "axios";
import base_url from "../api/base_url";

export const fetchAllCategories = async(token)=>{
    try{
        const response = await axios.get(`${base_url}/category`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
        console.log("Response of fetchAllCategories: ",response);
        return response.data
    }catch(err){
        console.log("Error in CategoryService:",err.response.data);
        throw err;
    }
}