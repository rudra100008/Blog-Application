import axios from "axios";
import base_url from "../api/base_url";
import api from "../api/api";

export const logout = async (router) => {
  try {
    const response = await api.get(`/logout`);
    console.log("Reponse of logout:", response.data);
    router.push("/");
    return response.data;
  } catch (err) {
    console.log("Error in logout: ", err);
    throw err;
  }
};

export const login = async (user) => {
  try {
    const response = await api.post("/login", user);
    console.log("Response of login: ", response);
    return response.data;
  } catch (err) {
    console.log("Error in login: ", err);
    throw err;
  }
};

export const fetchUserDataById = async (userId = null) => {
 try {
    const response = await api.get(`/users/${userId}`);
    console.log("Response od fetchUserDataById: ",response);
    return response.data;
  } catch (err) {
    console.error("Error fetching user details:", err);
   throw err;
  } 
};
