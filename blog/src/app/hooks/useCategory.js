import { useEffect, useState } from "react"
import { fetchAllCategories } from "../services/CategoryServices";

export const useCategory = ()=>{
    const [categories,setCategories] = useState([]);
    const token = localStorage.getItem("token");
    const setAllCategories  = async()=>{
        try{
            const data = await fetchAllCategories(token);
            setCategories(data);
        }catch(err){
            console.error("Error in setAllCategories: ",err.response?.data)
        }
    }

    useEffect(()=>{
        setAllCategories();
    },[])
    return {
        categories,
        setCategories,
        setAllCategories,
    }
}