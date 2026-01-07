import api from "../api/api";

export const fetchAllCategories = async()=>{
    try{
        const response = await api.get(`/category`);
        console.log("Response of fetchAllCategories: ",response);
        return response.data
    }catch(err){
        console.log("Error in CategoryService:",err);
        throw err;
    }
}