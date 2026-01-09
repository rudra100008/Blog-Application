"use client"
import {  createContext, useContext } from "react"
import { useAuthHook } from "../hooks/useAuthHook";


const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const value = useAuthHook();
    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=>{
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuth must be used withing AuthProvider");
    }
    return context;
}