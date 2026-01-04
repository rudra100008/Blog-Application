import React, { useState } from "react";
import { Form, FormGroup, Label, Input } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import axios from "axios";
import base_url from "../api/base_url";
import { toast, ToastContainer } from "react-toastify";

const UpdatePost = ({ post, model }) => {
    const router = useRouter();
    const [postData, setPostData] = useState({
        postTitle: post.postTitle,
        content: post.content,
        image: null,
        categoryId: post.categoryId,
    });
    const [validationError, setValidationError] = useState({
        postTitle: "",
        content: "",
        image: "",
        categoryId: "",
    });

    const handleChange = (e) => {
        setPostData({ ...postData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setPostData({ ...postData, image: e.target.files[0] });
    };

    const updatePostData= async()=>{
         if (typeof window === 'undefined') return;
        const token =localStorage.getItem('token');
        const userId =localStorage.getItem('userId')
        const formData = new FormData();
        formData.append("postDTO",new Blob([JSON.stringify({
            postTitle : postData.postTitle,
            content :postData.content
        })],{type :"application/json"}));
        formData.append("image",postData.image)
        await axios.put(`${base_url}/posts/${post.postId}/users/${userId}?categoryId=${postData.categoryId}`,formData,{
            headers:{
                Authorization : `Bearer ${token}`,
                "Content-Type" :"multipart/form-data"
            }
        }).then((response)=>{
            console.log(response.data)
            setPostData({
                postTitle: "",
                content: "",
                image: null,
                categoryId: ""
            });
            setValidationError({
                postTitle: "",
                content: "",
                image: "",
                categoryId: ""
            })
            toast.success("Post updated successfully!");
            
        }) .catch((error) => {
            console.error(error.response.data);
            if (error.response.status === 400) {
                const { message } = error.response.data;
                if (typeof message === 'object') {
                    setValidationError({
                        postTitle: message.postTitle,
                        content: message.content,
                        image: message.image
                    })
                }
            } else {
                toast.error("Unexpected error occurred");
            }
        });
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!postData.categoryId) {
            setValidationError({ ...validationError, categoryId: "Please select a category" });
            return;
        }
        updatePostData();
    };

    return (
        <div className="min-h-screen items-center flex justify-center">
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="relative bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
                    <button onClick={model} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                        <FontAwesomeIcon icon={faClose} />
                    </button>
                    <h3 className="text-xl font-semibold text-gray-700 text-center mb-4">Update Your Post</h3>
                    <Form noValidate onSubmit={handleSubmit} className="space-y-3">
                        <FormGroup>
                            <Label htmlFor="postTitle" className="text-md text-gray-600 font-medium">Title</Label>
                            <Input
                                type="text"
                                name="postTitle"
                                id="postTitle"
                                value={postData.postTitle}
                                onChange={handleChange}
                                placeholder="Post title"
                                invalid={!!validationError.postTitle}
                                required
                                className="border-gray-300 rounded-md p-1.5"
                            />
                            <p className="text-red-500 text-xs mt-1">{validationError.postTitle}</p>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="content" className="text-md text-gray-600 font-medium">Content</Label>
                            <Input
                                type="textarea"
                                name="content"
                                id="content"
                                value={postData.content}
                                onChange={handleChange}
                                placeholder="Write here..."
                                className="h-32 border-gray-300 rounded-md p-1.5"
                                required
                                invalid={!!validationError.content}
                            />
                            <p className="text-red-500 text-xs mt-1">{validationError.content}</p>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="image" className="text-md text-gray-600 font-medium">Image</Label>
                            <div className="flex items-center space-x-3">
                                {postData.image && (
                                     <img
                                     src={URL.createObjectURL(postData.image)}
                                     alt="Post preview"
                                     className="h-12 w-12 rounded-full border object-cover"/>
                                   
                                )}
                                <Input
                                    type="file"
                                    name="image"
                                    id="image"
                                    invalid={!!validationError.image}
                                    onChange={handleFileChange}
                                    className="border-gray-300 rounded-md p-1.5"
                                />
                            </div>
                            <p className="text-red-500 text-xs mt-1">{validationError.image}</p>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="categoryId" className="text-md text-gray-600 font-medium">Category</Label>
                            <Input
                                type="select"
                                id="categoryId"
                                name="categoryId"
                                value={postData.categoryId}
                                onChange={handleChange}
                                invalid={!!validationError.categoryId}
                                required
                                className="border-gray-300 rounded-md p-1.5"
                            >
                                <option value="" disabled>Choose a category</option>
                                <option value="1">Music</option>
                                <option value="2">Movie</option>
                                <option value="3">Food</option>
                                <option value="4">Others</option>
                            </Input>
                            <p className="text-red-500 text-xs mt-1">{validationError.categoryId}</p>
                        </FormGroup>
                        <div className="mt-5 flex justify-between">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-1.5 font-medium rounded-md shadow-sm hover:bg-blue-600 transition ease-in-out"
                            >
                                Update Post
                            </button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default UpdatePost;
