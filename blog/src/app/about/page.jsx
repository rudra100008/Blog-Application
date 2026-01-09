"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios"; // Import axios
import base_url from "../api/base_url";
import api from "../api/api";
import { useAuthHook } from "../hooks/useAuthHook";
import { useAuth } from "../contexts/useAuth";

export default function About(){
    const {userId} = useAuth();  
    const router = useRouter();
    const [userDetails, setUserDetails] = useState({
      id: null,
      username: "",
      email: "",
      image: "",
      phoneNumber:"",
      description:""
    });
  
    const getUserDetails = () => {
       // Get user ID from utility function or state
      if (!userId) {
        console.log("No user ID found");
        return;
      }
  
      api.get(`/users/${userId}`, {
      }).then((response) => {
        console.log(response.data);
      const { id, username, email, image, phoneNumber, description ,imageUrl,publicId} = response.data;
      setUserDetails({ id, username, email, image, phoneNumber, description,imageUrl,publicId });
      }).catch((error) => {
        console.log(error.response?.data || error.message);
      });
    };
  
    useEffect(() => {
      if(userId){
        getUserDetails();
      }
    }, [router,userId]);
    return(
        <div>
            <Navbar user={userDetails} />
            <p>this is about page</p>
        </div>
    )
}