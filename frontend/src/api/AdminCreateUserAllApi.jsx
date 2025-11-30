import axios from "axios";

const CREATED_ADMIN_API = "http://localhost:5000/admin";
// const CREATED_ADMIN_API = "https://task-management-system-backend-ksft.onrender.com/admin";

// CREATE
const createUser = async (userData) => {
  try {
    const response = await axios.post(`${CREATED_ADMIN_API}/create-user`, userData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error(error.response?.data?.msg || "User creation failed");
  }
};

// READ
const userDisplay = async () => {
  try {
    const response = await axios.get(`${CREATED_ADMIN_API}/user-display`);
    const data = response.data;
    const users = Array.isArray(data) ? data : [data];
    return users;
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return [];
  }
};


// UPDATE (Submit updated user data)
// First, let's fix the userUpdate API function
const userUpdate = async (id, updatedData) => {
  try {
    const response = await axios.put(`${CREATED_ADMIN_API}/user-update/${id}`, updatedData, {
      headers: { "Content-Type": "multipart/form-data" }, // for formData, else use application/json
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error updating user:", error);
    throw new Error("Failed to update user");
  }
};

// DELETE
const userDelete = async (id) => {
  try {
   
    const response = await axios.delete(`${CREATED_ADMIN_API}/user-delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
};


export { createUser, userDisplay, userUpdate, userDelete };
