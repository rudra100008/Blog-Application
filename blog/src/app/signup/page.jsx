"use client";
import axios from "axios";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Form, FormGroup, Input, Label } from "reactstrap";
import base_url from "../api/base_url";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faEye, faEyeSlash, faFileText, faLock, faMailBulk, faPhone, faUser } from "@fortawesome/free-solid-svg-icons";

export default function Signup() {
    const router = useRouter();
     const [showPassword, setShowPassword] = useState(false);
     const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        description: "",
        image: null
    });

    const [validationError, setValidationError] = useState({
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        description: "",
        image: ""
    });


    const handleFileChange = (e) => {
        setUser({ ...user, image: e.target.files[0] })
    }
    const postUserToServer = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("user", new Blob([JSON.stringify({
            username: user.username,
            email: user.email,
            password: user.password,
            phoneNumber: user.phoneNumber,
            description: user.description,
        })], { type: "application/json" }))
        formData.append("image", user.image)
        
       await axios.post(`${base_url}/register`, formData).then(
            (response) => {
                console.log(response.data);
                setUser({ username: "", email: "", password: "", phoneNumber: "", description: "" });
                toast.success(response.data.message);
                setValidationError({});
                setTimeout(() => {
                    router.push("/")
                }, 1000);
            }).catch((error) => {
                console.log(error.response.data);
                if (error.response.status === 400) {
                    const { message } = error.response.data;
                    if (typeof message === 'string') {
                        toast.error(message);
                    } else if (typeof message === 'object') {
                        setValidationError(message);
                    }
                    setValidationError(message);
                } else {
                    toast.error("Unexpected error occurred.");
                }
            });
    };

    const handleForm = (e) => {
        e.preventDefault();
        postUserToServer();
    };

    return (
    <div className=" min-h-screen py-12 px-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="fixed inset-0 bg-black opacity-20"></div>
      
      <div className="relative w-full max-w-2xl mx-auto">

        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        
        <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
        
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <FontAwesomeIcon icon={faUser} className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-500">Join our community today</p>
          </div>

          {/* form section*/}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative text-gray-700 ">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={user.username}
                  onChange={(e) => setUser({ ...user, username: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleForm(e)}
                  placeholder="Enter username"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                />
              </div>
              {validationError.username && (
                <p className="text-red-500 text-xs mt-1">{validationError.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative text-gray-700">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faMailBulk} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleForm(e)}
                  placeholder="Enter email"
                  className="block w-full pl-10 pr-3 py-3  border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                />
              </div>
              {validationError.email && (
                <p className="text-red-500 text-xs mt-1">{validationError.email}</p>
              )}
            </div>

            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative text-gray-700 ">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                   icon={faLock} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleForm(e)}
                  placeholder="Enter password"
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FontAwesomeIcon icon={faEyeSlash} className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FontAwesomeIcon icon={faEye} className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {validationError.password && (
                <p className="text-red-500 text-xs mt-1">{validationError.password}</p>
              )}
            </div>

            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative text-gray-700">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faPhone} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={user.phoneNumber}
                  onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleForm(e)}
                  placeholder="Enter 10-digit phone number"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                />
              </div>
              {validationError.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{validationError.phoneNumber}</p>
              )}
            </div>

            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Profile Image
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {user.image ? (
                    <img
                      src={URL.createObjectURL(user.image)}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-4 border-purple-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                      <FontAwesomeIcon icon={faCamera} className="w-8 h-8 text-purple-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faCamera} className="w-4 h-4 mr-2" />
                    Choose Image
                  </label>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                </div>
              </div>
              {validationError.image && (
                <p className="text-red-500 text-xs mt-1">{validationError.image}</p>
              )}
            </div>

        
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                About Yourself
              </label>
              <div className="relative text-gray-700 ">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FontAwesomeIcon icon={faFileText} className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={user.description}
                  onChange={(e) => setUser({ ...user, description: e.target.value })}
                  placeholder="Tell us a little about yourself"
                  rows={3}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none resize-none"
                />
              </div>
              {validationError.description && (
                <p className="text-red-500 text-xs mt-1">{validationError.description}</p>
              )}
            </div>

            
            <button
              onClick={handleForm}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </div>


          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/" className="font-semibold text-purple-600 hover:text-purple-700 hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
