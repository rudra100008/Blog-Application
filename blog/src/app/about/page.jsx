"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios"; // Import axios
import base_url from "../api/base_url";

export default function About(){
    const getUserId = () => {
        return localStorage.getItem('userId');
      }
      
      const getToken = () => {
        return localStorage.getItem('token');
      }
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
      const id = getUserId(); // Get user ID from utility function or state
      if (!id) {
        console.log("No user ID found");
        return;
      }
  
      axios.get(`${base_url}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }).then((response) => {
        console.log(response.data);
      const { id, username, email, image, phoneNumber, description ,imageUrl,publicId} = response.data;
      setUserDetails({ id, username, email, image, phoneNumber, description,imageUrl,publicId });
      }).catch((error) => {
        console.log(error.response?.data || error.message);
      });
    };
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push("/");
      } else {
        getUserDetails(); // Fetch user details if token is present
      }
      
    }, [router]);
    return(
        <div>
            <Navbar user={userDetails} />
            <p>this is about page</p>
        </div>
    )
}