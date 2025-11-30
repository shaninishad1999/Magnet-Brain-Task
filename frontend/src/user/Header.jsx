import React, { useState, useEffect, useRef } from 'react';
import ProfileModal from './ProfileModal';

const Header = ({ userName, userData, userLogout }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {userName}</p>
        </div>
        
        <div ref={dropdownRef} className="relative">
          <button 
            onClick={toggleProfileDropdown}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="flex flex-col items-end mr-3">
              <span className="text-sm font-medium text-gray-900">{userData.name}</span>
              <span className="text-xs text-gray-500">{userData.role}</span>
            </div>
            <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-lg font-bold">
              {userData.name ? userData.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
          </button>
          
          {showProfileDropdown && (
            <ProfileModal 
              userData={userData}
              onClose={() => setShowProfileDropdown(false)}
              userLogout={userLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;