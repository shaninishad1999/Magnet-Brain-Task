// src/admin/AdminDashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardTab from "./DashboardTab";
import TasksTab from "./TasksTab";
import TeamTab from "./TeamTab";
import SettingsTab from "./SettingsTab";

// Sample data for tasks and teams moved to their respective components

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // default to dashboard; we'll override from URL if present
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef(null);
  const logoutConfirmRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (logoutConfirmRef.current && !logoutConfirmRef.current.contains(event.target)) {
        setShowLogoutConfirm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, logoutConfirmRef]);

  const adminName = localStorage.getItem("adminName");
  const adminEmail = localStorage.getItem("adminEmail");
  const adminProfile = localStorage.getItem("adminProfile");

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    // Handle logout logic here
    localStorage.clear();
    window.location.href = "/";
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // When URL query ?tab=... changes, update activeTab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get("tab");
    if (tabFromUrl && ["dashboard", "tasks", "team", "settings"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Handle tab selection, close menu AND update URL so back-navigation/share works
  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
    // update URL query param without adding extra history entries
    // assume this component is mounted at /admin-dashboard
    navigate(`/admin-dashboard?tab=${tab}`, { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Improved Sidebar - Always visible on desktop */}
      <div className="hidden md:block w-64 bg-indigo-800 text-white">
        <div className="p-6 h-full flex flex-col">
          <h1 className="text-2xl font-bold mb-8">TaskMaster Admin</h1>
          <nav className="flex-grow">
            <ul>
              <li className="mb-2">
                <button
                  className={`flex items-center w-full p-3 rounded transition-all ${
                    activeTab === "dashboard" ? "bg-indigo-700" : "hover:bg-indigo-700"
                  }`}
                  onClick={() => handleTabSelect("dashboard")}
                >
                  <span className="mr-3">📊</span> Dashboard
                </button>
              </li>
              <li className="mb-2">
                <button
                  className={`flex items-center w-full p-3 rounded transition-all ${
                    activeTab === "tasks" ? "bg-indigo-700" : "hover:bg-indigo-700"
                  }`}
                  onClick={() => handleTabSelect("tasks")}
                >
                  <span className="mr-3">📝</span> Tasks
                </button>
              </li>
              <li className="mb-2">
                <button
                  className={`flex items-center w-full p-3 rounded transition-all ${
                    activeTab === "team" ? "bg-indigo-700" : "hover:bg-indigo-700"
                  }`}
                  onClick={() => handleTabSelect("team")}
                >
                  <span className="mr-3">👥</span> Team
                </button>
              </li>
              <li className="mb-2">
                <button
                  className={`flex items-center w-full p-3 rounded transition-all ${
                    activeTab === "settings" ? "bg-indigo-700" : "hover:bg-indigo-700"
                  }`}
                  onClick={() => handleTabSelect("settings")}
                >
                  <span className="mr-3">⚙️</span> Settings
                </button>
              </li>
            </ul>
          </nav>
          <div className="pt-6 border-t border-indigo-700">
            <div className="flex items-center mb-4 ">
              <img
                src={adminProfile}
                alt=""
                className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mr-3"
              />

              <div className="flex flex-col items-center mt-3">
                <span className="font-medium">{adminName}</span>
                <p className="text-sm text-indigo-300">{adminEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="flex items-center text-sm text-indigo-300 hover:text-white transition-colors"
            >
              <span className="mr-2">🚪</span> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Improved header with single hamburger menu */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center">
              <div className="relative md:hidden" ref={menuRef}>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                >
                  ☰
                </button>

                {/* Dropdown menu instead of fullscreen */}
                {menuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="py-1 bg-indigo-800 text-white">
                      <h2 className="px-4 py-2 font-semibold">TaskMaster {adminName}</h2>
                    </div>
                    <div className="py-1">
                      <button
                        className={`flex items-center px-4 py-2 w-full text-left ${
                          activeTab === "dashboard" ? "bg-indigo-100 text-indigo-800" : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleTabSelect("dashboard")}
                      >
                        <span className="mr-3">📊</span> Dashboard
                      </button>
                      <button
                        className={`flex items-center px-4 py-2 w-full text-left ${
                          activeTab === "tasks" ? "bg-indigo-100 text-indigo-800" : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleTabSelect("tasks")}
                      >
                        <span className="mr-3">📝</span> Tasks
                      </button>
                      <button
                        className={`flex items-center px-4 py-2 w-full text-left ${
                          activeTab === "team" ? "bg-indigo-100 text-indigo-800" : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleTabSelect("team")}
                      >
                        <span className="mr-3">👥</span> Team
                      </button>
                      <button
                        className={`flex items-center px-4 py-2 w-full text-left ${
                          activeTab === "settings" ? "bg-indigo-100 text-indigo-800" : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleTabSelect("settings")}
                      >
                        <span className="mr-3">⚙️</span> Settings
                      </button>
                    </div>
                    <div className="py-1 border-t border-gray-200">
                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-100"
                      >
                        <span className="mr-2">🚪</span> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <h2 className="lg:text-xl text-sm md:text-xl font-semibold text-gray-800 ml-2">
                {activeTab === "dashboard" && "Dashboard Overview"}
                {activeTab === "tasks" && "Task Management"}
                {activeTab === "team" && "Team Members"}
                {activeTab === "settings" && "System Settings"}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">🔔</button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">📧</button>
              <div className="md:hidden">
                <img
                  src={adminProfile}
                  alt=""
                  className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mr-3"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "tasks" && <TasksTab />}
          {activeTab === "team" && <TeamTab />}
          {activeTab === "settings" && <SettingsTab adminEmail={adminEmail} />}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={logoutConfirmRef} className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Do you want to logout?</h3>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
