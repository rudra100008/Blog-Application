"use client";
import axios from "axios";
import { Fragment, useState, useEffect } from "react";
import { Form, FormGroup, Input, Label } from "reactstrap";
import base_url from "../api/base_url";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useCategory } from "../hooks/useCategory";
import api from "../api/api";
import { useAuth } from "../contexts/useAuth";

export default function AddPost() {
  const { categories } = useCategory();
  const router = useRouter();
  const { userId, isHydrated } = useAuth();
  const [postData, setPostData] = useState({
    postTitle: "",
    content: "",
    image: null,
    categoryId: "",
  });

  const [validationError, setValidationError] = useState({
    postTitle: "",
    content: "",
    image: "",
    categoryId: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !userId) {
      toast.error("Please login to create a post");
      router.push('/login');
    }
  }, [userId, isHydrated, router]);

  const handleChange = (e) => {
    setPostData({ ...postData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPostData({ ...postData, image: e.target.files[0] });
  };

  const postDataToServer = async() => {
    if (!userId) {
      toast.error("Please login to create a post");
      return;
    }

    const formData = new FormData();
    formData.append(
      "postDTO",
      new Blob(
        [
          JSON.stringify({
            postTitle: postData.postTitle,
            content: postData.content,
          }),
        ],
        { type: "application/json" }
      )
    );
    formData.append("image", postData.image);
    formData.append("userId", userId);
    formData.append("categoryId", postData.categoryId);

    await api
      .post(`/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response.data);
        setPostData({
          postTitle: "",
          content: "",
          image: null,
          categoryId: "",
        });
        setValidationError({
          postTitle: "",
          content: "",
          image: "",
          categoryId: "",
        });
        toast.success("Post created successfully!");
        router.push('/home'); // Redirect after success
      })
      .catch((error) => {
        console.error(error.response.data);
        if (error.response.status === 400) {
          const { message } = error.response.data;
          if (typeof message === "object") {
            setValidationError({
              postTitle: message.postTitle,
              content: message.content,
              image: message.image,
            });
          }
        } else {
          toast.error("Unexpected error occurred");
        }
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postData.categoryId) {
      setValidationError({
        ...validationError,
        categoryId: "Please select a category",
      });
      return;
    }
     await postDataToServer();
  };

  const handleCancel = () => {
    router.back();
  };

  // Don't render form if not hydrated or not logged in
  if (!isHydrated) {
    return null;
  }

  if (!userId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center bg-gray-50 min-h-screen">
      <Fragment>
        <Form
          noValidate
          onSubmit={handleSubmit}
          className="max-w-xl px-8 py-3 w-full rounded-lg shadow-lg bg-white border border-gray-200 mt-5"
        >
          <h1 className="text-center mb-4 text-3xl font-semibold text-gray-700">
            Share Your Thoughts
          </h1>

          <FormGroup>
            <Label
              htmlFor="postTitle"
              className="text-base text-gray-600 font-medium"
            >
              Title
            </Label>
            <Input
              type="text"
              name="postTitle"
              id="postTitle"
              value={postData.postTitle}
              onChange={handleChange}
              placeholder="Enter your post title"
              invalid={validationError.postTitle}
              required
              className="rounded-lg"
            />
            <p className="text-red-500 text-sm mt-1">
              {validationError.postTitle}
            </p>
          </FormGroup>

          <FormGroup className="mt-4">
            <Label
              htmlFor="content"
              className="text-base text-gray-600 font-medium"
            >
              Content
            </Label>
            <Input
              type="textarea"
              name="content"
              id="content"
              value={postData.content}
              onChange={handleChange}
              placeholder="Write your content here"
              className="h-32 rounded-lg"
              required
              invalid={validationError.content}
            />
            <p className="text-red-500 text-sm mt-1">
              {validationError.content}
            </p>
          </FormGroup>

          <FormGroup className="mt-4">
            <Label
              htmlFor="image"
              className="text-base text-gray-600 font-medium"
            >
              Image
            </Label>
            <div className="flex items-center justify-center space-x-4">
              {postData.image && (
                <img
                  src={URL.createObjectURL(postData.image)}
                  alt="Preview"
                  className="w-16 h-16 rounded-full border object-cover"
                />
              )}
              <Input
                type="file"
                name="image"
                id="image"
                invalid={validationError.image}
                onChange={handleFileChange}
                className="rounded-lg"
              />
            </div>
            <p className="text-red-500 text-sm mt-1">{validationError.image}</p>
          </FormGroup>

          <FormGroup className="mt-4">
            <Label
              htmlFor="category"
              className="text-base text-gray-600 font-medium"
            >
              Category
            </Label>
            <Input
              type="select"
              id="category"
              name="categoryId"
              value={postData.categoryId}
              onChange={handleChange}
              invalid={validationError.categoryId}
              required
              className="rounded-lg"
            >
              <option value="" disabled>
                Choose a category
              </option>
              {categories && categories.length > 0 && categories.map((category,index) => (
                <option key={index} value={category.categoryId}>
                  {category.categoryTitle}
                </option>
              ))}
            </Input>
            <p className="text-red-500 text-sm mt-1">
              {validationError.categoryId}
            </p>
          </FormGroup>

          <FormGroup className="mt-6 flex justify-between">
            <button
              type="submit"
              className="bg-blue-500 text-white px-5 py-2 font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105"
            >
              Post
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-red-500 text-white px-5 py-2 font-semibold rounded-lg shadow-md hover:bg-red-600 transition-transform transform hover:scale-105"
            >
              Cancel
            </button>
          </FormGroup>
        </Form>
      </Fragment>
    </div>
  );
}