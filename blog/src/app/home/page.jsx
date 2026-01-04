"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AllPost from "../components/AllPost";
import Navbar from "../components/Navbar";
import Link from "next/link";
import axios from "axios"; // Import axios
import base_url from "../api/base_url";
import { ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

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
export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    id: null,
    username: "",
    email: "",
    image: "",
    phoneNumber: "",
    description: ""
  });

  const getUserDetails = async () => {
    setLoading(true);
    const userId = getUserId();
    if (!userId) {
      console.log("No user ID found");
      return;
    }

    try {
      const response = await axios.get(`${base_url}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const { id, username, email, image, phoneNumber, description ,imageUrl,publicId} = response.data;
      setUserDetails({ id, username, email, image, phoneNumber, description,imageUrl,publicId });
    } catch (error) {
      console.log(error.response?.data || error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (token && !userDetails.id) {
      getUserDetails();
    }
  }, [userDetails.id]); // Add userDetails.id as a dependency

 return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading your feed...</p>
          </div>
        </div>
      ) : (
        <>
          <Navbar user={userDetails} />
          
          {/* Hero Section with CTA */}
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="text-white mb-6 md:mb-0">
                  <div className="flex items-center space-x-2 mb-3">
                    <FontAwesomeIcon icon={faLightbulb} className="w-6 h-6 animate-pulse" />
                    <h2 className="text-2xl font-bold">Got something to share?</h2>
                  </div>
                  <p className="text-white/90 text-lg">
                    Share your thoughts, ideas, and stories with the community
                  </p>
                </div>
                
                <Link
                  href="/addPost"
                  className="no-underline flex items-center space-x-3 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200 group"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Create Post</span>
                </Link>
              </div>
            </div>
          </div>

          <AllPost />
        </>
      )}
    </div>
  );
}
