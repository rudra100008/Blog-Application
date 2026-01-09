'use client'
import { useCallback, useEffect, useState } from "react"
import { fetchUserDataById, login, logout } from "../services/AuthService"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

export const useAuthHook = () => {
    const router = useRouter();
    
    const [userId, setUserId] = useState(null);
    const [isHydrated, setIsHydrated] = useState(false);
    
    const [user, setUser] = useState({
        username: '',
        password: ''
    });

    const [validationErr, setValidationErr] = useState({
        username: '',
        password: ''
    });

    const [userDetails, setUserDetails] = useState({});

    // This useEffect runs only on client side
    useEffect(() => {
        setIsHydrated(true);
        const storedUserId = localStorage.getItem('userId');
        console.log("Initializing userId from localStorage:", storedUserId);
        setUserId(storedUserId);
    }, []);

    const loginUser = async() => {
        try {
            console.log("UserInput: ", user);
            const data = await login(user);
            console.log("Response of loginUser: ", data);
            
            localStorage.setItem('userId', data.userId);
            setUserId(data.userId);
            
            router.push('/home');
        } catch(err) {
            console.log("Error in loginUser: ", err?.response?.data);
            if(err.response) {
                const {message} = err.response.data;
                if(err.response.status === 401) {
                    toast.error(message);
                }
                if(err.response.status === 400) {
                    const {username, password} = err.response.data;
                    setValidationErr({
                        username: username || '',
                        password: password || ''
                    });
                }
            } else {
                toast.error("An error occurred during login");
            }
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('userId');
        setUserId(null);
        setUserDetails({});
        router.push('/login');
    };

    const fetchUserById = useCallback(async() => {
        if(!userId) {
            console.log("UserId not found:", userId);
            return;
        }
        try {
            const data = await fetchUserDataById(userId);
            console.log("data: ", data);
            setUserDetails(data);
        } catch(err) {
            console.log("Error in fetchUserById: ", err?.response?.data);
            
            // If unauthorized, clear the userId
            if(err?.response?.status === 401) {
                localStorage.removeItem('userId');
                setUserId(null);
                toast.error("Session expired. Please login again.");
                router.push('/login');
            }
        }
    }, [userId, router]);

    return {
        userId,
        user,
        validationErr,
        userDetails,
        isHydrated,

        setUserDetails,
        setUserId,
        setUser,
        setValidationErr,
        loginUser,
        logoutUser,
        fetchUserById,
    }
}