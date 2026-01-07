'use client'
import { useCallback, useState } from "react"
import { fetchUserDataById, login } from "../services/AuthService"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

export const useAuthHook = () => {
    const router = useRouter();
    
    const [userId, setUserId] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedUserId = localStorage.getItem('userId');
            console.log("Initializing userId:", storedUserId); 
            return storedUserId;
        }
        return null;
    });
    
    const [user, setUser] = useState({
        username: '',
        password: ''
    })

    const [validationErr, setValidationErr] = useState({
        username: '',
        password: ''
    });

    const [userDetails,setUserDetails] = useState({});

    const loginUser = async() => {
        try {
            console.log("UserInput: ", user)
            const data = await login(user);
            console.log("Response of loginUser: ", data);
            
            localStorage.setItem('userId', data.userId);
            setUserId(data.userId);
            
            router.push('/home');
        } catch(err) {
            console.log("Error in loginUser: ", err.response.data);
            if(err.response) {
                const {message} = err.response.data;
                if(err.response.status === 401) {
                    toast.error(message);
                }
                if(err.response.status === 400) {
                    const {username, password} = err.response.data;
                    setValidationErr({
                        username: username,
                        password: password
                    })
                }
            }
        }
    }


    const fetchUserById =useCallback(async()=>{
        if(!userId){
            console.log("UserId not found",userId);
            return;
        }
        try{
            const data = await fetchUserDataById(userId);
            console.log("data: ",data);
            setUserDetails(data);
        }catch(err){
            console.log("Error in fetchUserById: ",err.response.data);

        }
    },[]);

    return {
        userId,
        user,
        validationErr,
        userDetails,

        setUserDetails,
        setUserId,
        setUser,
        setValidationErr,
        loginUser,
        fetchUserById,
    }
}