"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import base_url from "../api/base_url"
import { ToastContainer } from 'react-toastify'
import UpdateProfileComponent from '../components/UpdateProfileComponent'
import { useAuthHook } from '../hooks/useAuthHook'
import { logout } from '../services/AuthService'
import { useAuth } from '../contexts/useAuth'

export default function UpdateProfilePage({onClose}) {
  const router = useRouter();
  const {userId} = useAuth();
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserDetails = async () => {
       if (typeof window === 'undefined') return;
      
      if (!userId) {
        logout(router);
        router.push('/login')
        return
      }

      try {
        const response = await axios.get(`${base_url}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUserDetails(response.data)
      } catch (error) {
        console.error('Error fetching user details:', error)
        if (error.response?.status === 401) {
          localStorage.removeItem('userId')
          logout(router);
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [router,userId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const handleCloseModal = () => {
    router.back()
  }

  return (
    <>
      <ToastContainer />
      <UpdateProfileComponent 
        userDetails={userDetails} 
        onClose={onClose}
      />
    </>
  )
}