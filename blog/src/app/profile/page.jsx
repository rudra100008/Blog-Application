"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import base_url from "../api/base_url";
import { toast } from "react-toastify";
import UserPost from "../components/UserPost";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRightFromBracket,
  faCamera,
  faClose,
  faEdit,
  faMailBulk,
  faPhone,
  faPlus,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";
import UpdateProfile from "../updateprofile/page";

const getUserId = () => {
  return localStorage.getItem("userId");
};

const getToken = () => {
  return localStorage.getItem("token");
};

const Profile = () => {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [active, setActive] = useState("posts");
  const [showModel, setShowModel] = useState(false);
  const [userDetails, setUserDetails] = useState({
    id: null,
    username: "",
    email: "",
    image: "",
    phoneNumber: "",
    description: "",
  });

  const handleGoBack = () => {
    router.back();
  };
  const handleLogout = () => {
    const token = getToken();
    axios
      .get(`${base_url}/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        router.push("/");
      })
      .catch((error) => {
        console.log(error.response);
      });
  };

  const getUserDetails = () => {
    const id = getUserId();

    if (!id) {
      console.log("No user ID found");
      return;
    }

    axios
      .get(`${base_url}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((response) => {
        const { id, username, email, image, phoneNumber, description,imageUrl } =
          response.data;
        setUserDetails({
          id,
          username,
          email,
          image,
          phoneNumber,
          description,
          imageUrl
        });
      })
      .catch((error) => {
        console.log(error.response?.data || error.message);
        if (error.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          router.push("/");
        }
      });
  };

  // const getUserImageFromServer = async () => {
  //   await axios
  //     .get(`${base_url}${userDetails.image}`, {
  //       headers: {
  //         Authorization: `Bearer ${getToken()}`,
  //       },
  //       responseType: "blob",
  //     })
  //     .then((response) => {
  //       const url = URL.createObjectURL(response.data);
  //       setImageUrl(url);
  //     })
  //     .catch((error) => {
  //       console.log(error.response.data);
  //       if (!userDetails.image) {
  //         toast.error("No image found for this user.");
  //       }
  //       if (error.response.status === 401) {
  //         localStorage.removeItem("token");
  //         localStorage.removeItem("userId");
  //         router.push("/");
  //       }
  //     });
  // };

  const handleAddPost = () => {
    router.push("/addPost");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      getUserDetails();
    }
  }, [router]);

  // useEffect(() => {
  //   if (userDetails.image) {
  //     getUserImageFromServer();
  //   }
  // }, [userDetails]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 text-gray-700"
            onClick={handleGoBack}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            <span className=""> Back</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors duration-200 text-red-600"
          >
            <FontAwesomeIcon icon={faSignOut} className="w-5 h-5" />
            <span className="font-medium"> Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <img
                  src={userDetails.imageUrl}
                  alt={userDetails.username}
                  className="w-40 h-40 rounded-full border-8 border-white shadow-2xl object-cover"
                />
                <button className="absolute bottom-2 right-2 bg-indigo-600 p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200">
                  <FontAwesomeIcon
                    icon={faCamera}
                    className="w-5 h-5 text-white"
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="pt-24 pb-8 px-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {userDetails.username.toUpperCase()}
              </h1>
              <p className="text-gray-600 text-lg">{userDetails.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                <div className="bg-blue-500 p-3 rounded-xl">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="w-5 h-5 text-white"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">
                    Mobile Number
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {userDetails.phoneNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
                <div className="bg-purple-500 p-3 rounded-xl">
                  <FontAwesomeIcon
                    icon={faMailBulk}
                    className="w-5 h-5 text-white"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-gray-800 font-semibold text-sm">
                    {userDetails.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setShowModel(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <FontAwesomeIcon icon={faEdit} className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={handleAddPost}
                className="flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
                <span>Create Post</span>
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md mb-6 p-2">
          <div className="flex space-x-2">
            <button
              href="/userPost"
              onClick={() => setActive("posts")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                active === "posts"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Posts
            </button>
            <button
              href="/"
              onClick={() => setActive("details")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                active === "details"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              More Details
            </button>
          </div>
        </div>
        {active === "posts" ? <UserPost /> : null}
      </div>

      {showModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <UpdateProfile
            userDetails={userDetails}
            model={() => setShowModel(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Profile;
