"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import base_url from "../api/base_url"
import { ToastContainer } from 'react-toastify'
import UpdateProfileComponent from '../components/UpdateProfileComponent'

export default function UpdateProfilePage() {
  const router = useRouter()
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)


const getUserId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId');
  }
  return null;
};

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

  useEffect(() => {
    const fetchUserDetails = async () => {
       if (typeof window === 'undefined') return;
      const token = getToken()
      const userId = getUserId()
      
      if (!token || !userId) {
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
          localStorage.removeItem('token')
          localStorage.removeItem('userId')
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!userDetails) {
    return null
  }

  const handleCloseModal = () => {
    router.back()
  }

  return (
    <>
      <ToastContainer />
      <UpdateProfileComponent 
        userDetails={userDetails} 
        onClose={handleCloseModal}
      />
    </>
  )
}