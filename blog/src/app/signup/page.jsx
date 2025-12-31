"use client";
import axios from "axios";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Form, FormGroup, Input, Label } from "reactstrap";
import base_url from "../api/base_url";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {
    const router = useRouter();
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
    const postUserToServer = () => {
        const formData = new FormData();
        formData.append("user", new Blob([JSON.stringify({
            username: user.username,
            email: user.email,
            password: user.password,
            phoneNumber: user.phoneNumber,
            description: user.description,
        })], { type: "application/json" }))
        formData.append("image", user.image)
        
        axios.post(`${base_url}/register`, formData).then(
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
        <div className="min-h-screen py-10 flex items-center  justify-center bg-gradient-to-r from-blue-300 to-purple-400">
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
            <div className="bg-white max-w-lg w-full  py-6 px-8 rounded-lg shadow-lg">
                <Form noValidate onSubmit={handleForm} className=" space-y-4 ">
                    <h3 className="text-center text-xl font-semibold mb-4">Create your account</h3>

                    <FormGroup>
                        <Label htmlFor="username" className="block text-xs font-semibold text-gray-600">Username</Label>
                        
                            <Input
                                type="text"
                                id="username"
                                name="username"
                                value={user.username}
                                onChange={(e) => setUser({ ...user, username: e.target.value })}
                                invalid={!!validationError.username}
                                placeholder="Enter username"
                                className="w-full border rounded-lg py-2 px-3 text-sm" 
                            />
                        
                        <p  className="text-red-500 text-sm mt-1">{validationError.username}</p>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="email" className="block text-xs font-semibold text-gray-600">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            invalid={!!validationError.email}
                            placeholder="Enter email"
                            className="w-full  border rounded-lg py-2 px-3 text-sm "
                        />
                        <p  className="text-red-500 text-sm mt-1">{validationError.email}</p>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="password" className="block text-xs font-semibold text-gray-600">Password</Label>
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            value={user.password}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                            invalid={!!validationError.password}
                            placeholder="Enter password"
                            className="w-full  border rounded-lg py-2 px-3 text-sm"
                        />
                        <p  className="text-red-500 text-sm mt-1">{validationError.password}</p>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="phoneNumber" className="block text-xs font-semibold text-gray-600">Phone Number</Label>
                        <Input
                            type="text"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={user.phoneNumber}
                            onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
                            invalid={!!validationError.phoneNumber}
                            placeholder="Enter 10-digit phone number"
                            className="w-full  border rounded-lg py-2 px-3 text-sm "
                        />
                        <p  className="text-red-500 text-sm mt-1">{validationError.phoneNumber}</p>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="image" className="block text-xs font-semibold text-gray-600">Image</Label>
                        <div className="flex items-center space-x-4">
                            {user.image &&
                                <img src={URL.createObjectURL(user.image)} alt="" className="h-16 w-16 rounded-full border object-cover" />
                            }
                            <Input
                                type="file"
                                name="image"
                                id="image"
                                invalid={validationError.image}
                                onChange={handleFileChange}
                                className="py-2 px-3 w-full text-sm"
                            />
                        </div>
                        <p  className="text-red-500 text-sm mt-1">{validationError.image}</p>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="description" className="block text-xs font-semibold text-gray-600">About Yourself</Label>
                        <Input
                            type="textarea"
                            id="description"
                            name="description"
                            value={user.description}
                            onChange={(e) => setUser({ ...user, description: e.target.value })}
                            invalid={!!validationError.description}
                            placeholder="Tell us a little about yourself"
                            className="w-full  border rounded-lg py-2 px-3 text-sm "
                        />
                        <p  className="text-red-500 text-sm mt-1">{validationError.description}</p>
                    </FormGroup>

                    <FormGroup>
                        <button type="Submit" className="bg-blue-500 px-6 py-2 text-white font-semibold rounded-xl shadow-md transition-transform hover:bg-blue-700 hover:scale-110">
                            Signup
                        </button>
                    </FormGroup>
                    <p className="mt-2 font-semibold text-sm text-center">
                        <Link className="no-underline text-blue-500 hover:text-blue-300 hover:underline" href="/">Already have an account?</Link>
                    </p>
                   
                </Form>
            </div>
        </div>
    );
}
