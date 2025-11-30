import React, { useState, useEffect, useRef } from "react"; 
import { Link } from "react-router-dom";
import UserForm from "../pages/UserForm";
import AdminForm from "../pages/AdminForm";
import { Menu, Home, CheckSquare, LogIn, UserCog, X } from "lucide-react";

const Navbar = () => {
  const [modalType, setModalType] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-700 shadow-sm text-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-400">
                Task<span className="text-white">Manager</span>
              </span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="flex items-center text-gray-300 hover:text-blue-400 transition">
                <Home size={18} className="mr-1" />
                <span>Dashboard</span>
              </Link>
              <Link to="/tasks" className="flex items-center text-gray-300 hover:text-blue-400 transition">
                <CheckSquare size={18} className="mr-1" />
                <span>Tasks</span>
              </Link>
            </div>
            
            {/* Login Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => setModalType("user")}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition shadow-sm"
              >
                <LogIn size={18} className="mr-2" />
                <span>User Login</span>
              </button>
              
              <button
                onClick={() => setModalType("admin")}
                className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition shadow-sm"
              >
                <UserCog size={18} className="mr-2" />
                <span>Admin</span>
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="text-gray-300 hover:text-blue-400 focus:outline-none p-2"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu - Improved Dropdown */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden fixed top-16 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg z-10 max-h-screen overflow-y-auto transition-all duration-300 ease-in-out"
          style={{ transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)', opacity: mobileMenuOpen ? 1 : 0 }}
        >
          <div className="py-3 space-y-1">
            <Link 
              to="/" 
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-blue-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={18} className="mr-3" />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/tasks" 
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-blue-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <CheckSquare size={18} className="mr-3" />
              <span>Tasks</span>
            </Link>
            <div className="border-t border-gray-700 my-2"></div>
            <div className="flex flex-col space-y-3 p-4">
              <button
                onClick={() => {
                  setModalType("user");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition w-full"
              >
                <LogIn size={18} className="mr-2" />
                <span>User Login</span>
              </button>
              
              <button
                onClick={() => {
                  setModalType("admin");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition w-full"
              >
                <UserCog size={18} className="mr-2" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* UserForm Modal */}
      {modalType === "user" && (
        <UserForm show={true} type="user" handleClose={() => setModalType(null)} />
      )}
      
      {/* AdminForm Modal */}
      {modalType === "admin" && (
        <AdminForm show={true} handleClose={() => setModalType(null)} />
      )}
    </>
  );
};

export default Navbar;