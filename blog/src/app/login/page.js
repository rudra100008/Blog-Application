"use client";
import { Fragment, useState } from "react";
import Navbar from "../components/Navbar";
import { Form, FormGroup, Input, Label } from "reactstrap";
import base_url from "../api/base_url";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";

export default function Login() {
    const [user, setUser] = useState({
        username: "",
        password: ""
    });

    const newUser = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const postFromServer = () => {
        axios.post(`${base_url}/login`, user)
        .then((response) => {
            if (response && response.data) {
                setUser({ username: "", password: "" });
                const { token } = response.data;
                console.log(token);
                localStorage.setItem("token", token);
                toast.success("Login Successful");
                setTimeout(() => {
                    window.location.href="/home"
                }, 2000);
            } else {
                console.error("No data received from server");
            }
        })
        .catch((err) => {
            console.log(err.response?.data);
            const message = err.response?.data?.message || "Unknown error";
            if (err.response?.status === 500) {
                toast.error(message);
            }
        });
    };
    

    const handleForm = (e) => {
        e.preventDefault();
        postFromServer();
    };

    return (
        <div className="min-h-screen items-center flex justify-center bg-gradient-to-r from-blue-300 to-purple-400">
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
            <Fragment>
                <Form noValidate onSubmit={handleForm} className="bg-white max-w-md w-full p-8 rounded-lg shadow-lg">
                    <h3 className="text-center text-2xl text-gray-600 font-semibold  mb-6 ">Login to your account</h3>
                    <FormGroup>
                        <Label htmlFor="username" className="block text-sm text-gray-500 ">
                            Username:
                        </Label>
                        <Input
                            type="text"
                            placeholder="Enter your username"
                            name="username"
                            value={user.username}
                            onChange={newUser}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="password" className="block text-sm text-gray-500 ">
                            Password:
                        </Label>
                        <Input
                            type="password"
                            placeholder="Enter your password"
                            name="password"
                            value={user.password}
                            onChange={newUser}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <button type="submit" className="bg-blue-400 p-2 text-white font-semibold rounded-xl shadow-lg transition-transform hover:bg-blue-500 hover:scale-110">
                            Submit
                        </button>
                    </FormGroup>
                    <p className="mt-4 font-semibold text-sm text-center ">
                        Don't have an account <Link className="no-underline text-blue-500 hover:text-blue-300 hover:underline" href="/signup">Register here?</Link>
                    </p>
                </Form>
            </Fragment>
        </div>
    );
}
