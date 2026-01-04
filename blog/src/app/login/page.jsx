import { Fragment, useEffect, useState } from "react";
import { Form, FormGroup, Input, Label } from "reactstrap";
import base_url from "../api/base_url";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faLock,
  faSignIn,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export default function Login() {
  const router = useRouter();
  const [sessionMessage, setSessionMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const newUser = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const postFromServer = () => {
    setIsLoading(true)
    axios
      .post(`${base_url}/login`, user)
      .then((response) => {
        if (response && response.data) {
          setUser({ username: "", password: "" });
          console.log(response.data);
          const { token, userId} = response.data;
          localStorage.setItem("token", token);
          localStorage.setItem("userId", userId);
          toast.success("Login Successful");
        } else {
          console.error("No data received from server");
        }
        router.push("/home");
      })
      .catch((err) => {
        console.log("Error in postFromServer()",err.response?.data);
        const message = err.response?.data?.message || "Unknown error";
        if (err.response?.status === 401) {
          toast.error("Invalid username or password");
        } else if (err.response?.status === 500) {
          toast.error(message);
        } else {
          toast.error("Something went wrong");
        }
      }).finally(
        setIsLoading(false)
      );
  };

  const handleForm = (e) => {
    e.preventDefault();
    postFromServer();
  };

  useEffect(() => {
    const message = localStorage.getItem("message");
    if (message) {
      setSessionMessage(message);
      localStorage.removeItem("message"); // Clear the message
    }
  }, []);
  useEffect(() => {
    if (sessionMessage) {
      toast.info(sessionMessage);
    }
  }, [sessionMessage]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="absolute inset-0 bg-black opacity-20"></div>

      <div className="relative w-full max-w-md">
        {/* Decorative blur circles */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>

        <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <FontAwesomeIcon icon={faLock} className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500">Sign in to continue to your account</p>
          </div>

          {/* Session Message */}
          {sessionMessage && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              {sessionMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleForm} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={user.username}
                  onChange={newUser}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={user.password}
                  onChange={newUser}
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FontAwesomeIcon
                      icon={faEyeSlash}
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faEye}
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSignIn} className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>


    

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-semibold text-purple-600 hover:text-purple-700 hover:underline"
            >
              Create one now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
