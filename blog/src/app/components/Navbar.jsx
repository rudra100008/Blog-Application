"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import base_url from '../api/base_url';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faInfoCircle, faListSquares, faSignInAlt, faSignOutAlt, faCog, faUser, faSignOut } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ user }) => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current path
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const getUserImageFromServer = async () => {
    await axios.get(`${base_url}${user.image}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      responseType: "blob",
    }).then((response) => {
      const url = URL.createObjectURL(response.data);
      setImageUrl(url);
    }).catch((error) => {
      console.log(error.response.data);
      if (!user.image) {
        toast.error("No image found for this user.");
      }
    });
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${base_url}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('isTokenExpired')
        setLoggedIn(false);
        toast.success("Logout Successful");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        console.log("Logout failed");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    if (user.image) {
      getUserImageFromServer();
    }
  }, [user]);

  return (
    <nav className="bg-gray-600 p-4">
      <div className="container  flex justify-between ">
        <div className="flex ">
          {/* Dropdown Menu for Smaller Screens */}
          <div className="relative py-1 px-4 ">
            <button
              className="text-gray-300 hover:text-white focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <FontAwesomeIcon icon={faListSquares} className="w-5 h-5" />
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 bg-white rounded-2xl shadow-lg w-32">
                <Link href="/home" 
                className={`block px-4 py-2 rounded-2xl hover:bg-gray-200 no-underline ${pathname === "/home" ? "text-amber-300" : "text-gray-400"}`}>
                    <FontAwesomeIcon icon={faHome} /> Home
                </Link>
                <Link href="/about" 
                 className={`${pathname === "/about" ? "text-amber-300" : "text-gray-700"} block px-4 py-2  rounded-2xl hover:bg-gray-200 no-underline`} >
                    <FontAwesomeIcon icon={faInfoCircle} /> About
                </Link>
                {loggedIn && (
                  <Link href="/" onClick={handleLogout} className="block px-4 py-2 text-gray-700  hover:bg-gray-200  rounded-2xl no-underline">
                    <FontAwesomeIcon icon={faSignOut} /> LogOut
                  </Link>
                )}
                {!loggedIn && (
                  <Link href="/signup" className="block px-4 py-2 text-gray-700 hover:bg-gray-200  rounded-2xl no-underline">
                  <FontAwesomeIcon icon={faSignInAlt} /> Sign Up
                </Link>
                )}
                <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-2xl no-underline">
                  <FontAwesomeIcon icon={faCog} /> Settings
                </Link>
                <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-2xl no-underline">
                  <FontAwesomeIcon icon={faUser} /> Profile
                </Link>
              </div>
            )}
          </div>
            <Link href="/home" className='no-underline text-2xl font-bold text-white   '>
              BlogApp
            </Link>
        </div>

        {/* Desktop Menu */}
        <div className="flex  items-center  space-x-9">
          <Link href="/home" className={`hover:text-white no-underline ${pathname === "/home" ? "text-amber-300" : "text-gray-400"}`}>
              <FontAwesomeIcon icon={faHome} className=" mr-1" /> Home
          </Link>
          <Link href="/about" className={`hover:text-white no-underline ${pathname === "/about" ? "text-amber-300" : "text-gray-400"}`}>
            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" /> About
          </Link>
          {loggedIn ? (
            <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 flex items-center">
              <FontAwesomeIcon icon={faSignOutAlt} /> Logout
            </button>
          ) : (
            <Link href="/signup" className="text-gray-300 no-underline hover:text-white">
              <FontAwesomeIcon icon={faSignInAlt} />
            </Link>
          )}
          <Link href="/profile" className="font-medium flex no-underline items-center space-x-2 ">
            <div className="w-8 h-8 rounded-full overflow-hidden shadow-lg">
              <img src={imageUrl} alt={user.username} className="w-full h-full object-cover" />
            </div>
            <span className="text-gray-200 font-medium hover:text-blue-400 no-underline  hover:underline hover:underline-offset-8 decoration-2">
              @{user.username.toUpperCase()}
            </span>
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
