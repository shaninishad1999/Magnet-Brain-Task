import React, { useState } from "react";
import { LogIn, UserCog } from "lucide-react";
import UserForm from "../pages/UserForm";
import AdminForm from "../pages/AdminForm";

const HeroSection = () => {
  const [modalType, setModalType] = useState(null);

  return (
    <section className="bg-gray-900 text-white flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] px-6 md:px-12 lg:px-20">
      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-center">
        Welcome to <span className="text-blue-500">Task Manager</span>
      </h1>
      
      {/* Subtext */}
      <p className="text-gray-400 text-lg max-w-2xl text-center mb-6">
        Organize, track, and complete your tasks effortlessly. Start managing your workflow today!
      </p>
      
      {/* Call-to-Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => setModalType("user")}
          className="flex items-center justify-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition shadow-lg text-lg"
        >
          <LogIn size={20} className="mr-2" />
          User Login
        </button>

        <button
          onClick={() => setModalType("admin")}
          className="flex items-center justify-center bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition shadow-lg text-lg"
        >
          <UserCog size={20} className="mr-2" />
          Admin Access
        </button>
      </div>

      {/* UserForm Modal */}
      {modalType === "user" && (
        <UserForm show={true} handleClose={() => setModalType(null)} />
      )}

      {/* AdminForm Modal */}
      {modalType === "admin" && (
        <AdminForm show={true} handleClose={() => setModalType(null)} />
      )}
    </section>
  );
};

export default HeroSection;
