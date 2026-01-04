"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faInfoCircle,
  faBars,
  faSignOut,
  faUser,
  faTimes,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = ({ user }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const handleLogout = async () => {
    // Your existing logout logic here
    alert("Logout functionality");
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, []);

  const mockUser = {
    username: user?.username || "john_doe",
    imageUrl: user?.imageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              <FontAwesomeIcon 
                icon={isDropdownOpen ? faTimes : faBars} 
                className="w-5 h-5 text-gray-700" 
              />
            </button>

            {/* Logo */}
            <Link
              href="/home"
              className="flex items-center space-x-2 no-underline group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                BlogApp
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              href="/home"
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 no-underline ${
                pathname === "/home"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Home
            </Link>
            
            <Link
              href="/about"
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 no-underline ${
                pathname === "/about"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              About
            </Link>
          </div>

          {/* Right side - User Profile & Logout */}
          <div className="flex items-center space-x-3">
            {loggedIn ? (
              <>
                {/* User Profile Link */}
                <Link
                  href="/profile"
                  className="hidden lg:flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200 no-underline group"
                >
                  <img
                    src={mockUser.imageUrl}
                    alt={mockUser.username}
                    className="w-9 h-9 rounded-full object-cover border-2 border-indigo-100 group-hover:border-indigo-300 transition-all duration-200"
                  />
                  <span className="text-gray-700 font-semibold group-hover:text-indigo-600 transition-colors">
                    @{mockUser.username.toUpperCase()}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/signup"
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 no-underline"
              >
                <span>Sign Up</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-50 lg:hidden">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {/* Mobile Profile Section */}
              {loggedIn && (
                <Link
                  href="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors no-underline"
                >
                  <img
                    src={mockUser.imageUrl}
                    alt={mockUser.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      @{mockUser.username.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">View Profile</p>
                  </div>
                </Link>
              )}

              <div className="border-t border-gray-100 my-2" />

              {/* Mobile Navigation Links */}
              <Link
                href="/home"
                onClick={() => setIsDropdownOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors no-underline ${
                  pathname === "/home"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
                <span>Home</span>
              </Link>

              <Link
                href="/about"
                onClick={() => setIsDropdownOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors no-underline ${
                  pathname === "/about"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5" />
                <span>About</span>
              </Link>

              {loggedIn && (
                <>
                  <div className="border-t border-gray-100 my-2" />
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faSignOut} className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;