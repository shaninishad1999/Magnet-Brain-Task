import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import TaskForm from "./components/TaskForm";
import Home from "./pages/Home";
import UserForm from "./pages/UserForm";
import AdminForm from "./pages/AdminForm";
import AdminDashboard from "./admin/AdminDashboard";
import { Toaster } from "react-hot-toast";
import UserDashboard from "./user/UserDashboard";
import TaskDetails from "./admin/TaskDetails";

const App = () => {
  return (
    <>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          {/* Layout route that wraps nested routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="task-form" element={<TaskForm />} />
            <Route path="user-login" element={<UserForm />} />
            <Route path="user-dashboard" element={<UserDashboard />} />
            {/* other nested routes under Layout if needed */}
          </Route>

          {/* Top-level routes (not wrapped by Layout) */}
          <Route path="admin-login" element={<AdminForm />} />
          <Route path="admin-dashboard" element={<AdminDashboard />} />
           <Route path="admin-dashboard/task-details/:id" element={<TaskDetails />} />
          
          {/* fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
