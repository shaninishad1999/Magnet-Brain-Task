import React from 'react';

const ProfileModal = ({ userData, onClose, userLogout }) => {
  return (
    <div 
      className="fixed top-0 right-4 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-lg shadow-lg w-72 p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium text-gray-800">User Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-center mb-4">
          <div className="h-16 w-16 bg-gray-300 rounded-full mb-2 flex items-center justify-center text-gray-600 text-xl font-bold">
            {userData.name ? userData.name.split(' ').map(n => n[0]).join('') : 'U'}
          </div>
          <h3 className="text-base font-semibold">{userData.name || 'User'}</h3>
          <p className="text-sm text-gray-500">{userData.email}</p>
          <p className="text-sm text-gray-500">{userData.role}</p>
          <p className="text-xs text-gray-400 mt-1">User ID: {userData.userIdName}</p>
          
        </div>
        
        <div className="space-y-2">
          <button className="w-full bg-blue-600 text-white py-1.5 px-3 rounded text-sm hover:bg-blue-700">
            Edit Profile
          </button>
          <button onClick={userLogout} className="w-full bg-gray-100 text-gray-700 py-1.5 px-3 rounded text-sm hover:bg-gray-200">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;