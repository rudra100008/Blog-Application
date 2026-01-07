"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Form, FormGroup, Input, Label } from "reactstrap";
import base_url from "../api/base_url";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import api from "../api/api";
import { userAgent } from "next/server";
import { useAuthHook } from "../hooks/useAuthHook";

export default function UpdateProfileComponent({onClose }) {
  const {userId,userDetails, fetchUserById} = useAuthHook();
  const handleFileChange = (e) => {
    setUser({ ...user, image: e.target.files[0] });
  };

  const [user, setUser] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    description: "",
    image: null,
  });

  const [validationError, setValidationError] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    description: "",
    image: "",
  });



  const updateProfile =async () => {
    const formData = new FormData();
    formData.append(
      "user",
      new Blob(
        [
          JSON.stringify({
            username: user.username || userDetails?.username || "",
            email: user.email || userDetails?.email || "",
            phoneNumber: user.phoneNumber || userDetails?.phoneNumber || "",
            description: user.description || userDetails?.description || "",
          }),
        ],
        { type: "application/json" }
      )
    );

    if (user.image) {
      formData.append("image", user.image);
    }

   await api
      .put(`/users/${userId}`, formData, )
      .then((response) => {
        console.log(response.data);
        setUser({
          username: "",
          email: "",
          phoneNumber: "",
          description: "",
          image: null,
        });
        toast.success("Profile Updated");
        setValidationError({});
        onClose?.();
      })
      .catch((error) => {
        console.log(error.response?.data);
        if (error.response?.status === 400) {
          const { message } = error.response.data;
          if (typeof message === "object") {
            setValidationError(message);
          } else {
            toast.error(message);
          }
        } else {
          toast.error("Unexpected error occurred");
        }
      });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateProfile();
  };

  useEffect(()=>{
    fetchUserById();
  },[])

  return (
    <div className="min-h-screen items-center flex justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full">
          <button
            onClick={onClose}
            className="absolute top-4 right-5 text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faClose} />
          </button>
          <h3 className="text-2xl font-bold text-gray-700 text-center mb-6">
            Edit Profile
          </h3>

          <Form noValidate onSubmit={handleUpdate} className="space-y-4">
            <FormGroup>
              <Label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-600"
              >
                Username
              </Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                invalid={!!validationError.username}
                placeholder={userDetails?.username || ""}
                className="w-full border rounded-lg py-2 px-3 text-sm"
              />
              <p className="text-red-500 text-xs">{validationError.username}</p>
            </FormGroup>

            <FormGroup>
              <Label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-600"
              >
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                invalid={!!validationError.email}
                placeholder={userDetails?.email || ""}
                className="w-full border rounded-lg py-2 px-3 text-sm"
              />
              <p className="text-red-500 text-xs">{validationError.email}</p>
            </FormGroup>

            <FormGroup>
              <Label
                htmlFor="phoneNumber"
                className="block text-sm font-semibold text-gray-600"
              >
                Phone Number
              </Label>
              <Input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={user.phoneNumber}
                onChange={(e) =>
                  setUser({ ...user, phoneNumber: e.target.value })
                }
                invalid={!!validationError.phoneNumber}
                placeholder={userDetails?.phoneNumber || ""}
                className="w-full border rounded-lg py-2 px-3 text-sm"
              />
              <p className="text-red-500 text-xs">
                {validationError.phoneNumber}
              </p>
            </FormGroup>

            <FormGroup>
              <Label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-600"
              >
                About Yourself
              </Label>
              <Input
                type="textarea"
                id="description"
                name="description"
                value={user.description}
                onChange={(e) =>
                  setUser({ ...user, description: e.target.value })
                }
                invalid={!!validationError.description}
                placeholder={
                  userDetails?.description || "Tell us about yourself..."
                }
                className="w-full border rounded-lg py-2 px-3 text-sm"
                rows="4"
              />
              <p className="text-red-500 text-xs">
                {validationError.description}
              </p>
            </FormGroup>

            <FormGroup>
              <Label
                htmlFor="image"
                className="block text-sm font-semibold text-gray-600"
              >
                Profile Image
              </Label>
              <div className="flex items-center space-x-4">
                {user.image ? (
                  <img
                    src={URL.createObjectURL(user.image)}
                    alt="Profile preview"
                    className="h-16 w-16 rounded-full border object-cover"
                  />
                ) : userDetails?.imageUrl ? (
                  <img
                    src={userDetails.imageUrl}
                    alt="Current profile"
                    className="h-16 w-16 rounded-full border object-cover"
                  />
                ) : null}

                <div className="flex-1">
                  <Input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    invalid={!!validationError.image}
                    className="w-full"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Leave empty to keep current image
                  </p>
                </div>
              </div>
              <p className="text-red-500 text-xs mt-1">
                {validationError.image}
              </p>
            </FormGroup>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition ease-in-out duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition ease-in-out duration-200"
              >
                Update Profile
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
