import axios from "axios";

const CREATED_ADMIN_API = "http://localhost:5000/admin";

// helper to get token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// CREATE (expects FormData; do NOT set Content-Type manually)
const createUser = async (formData) => {
  try {
    const response = await axios.post(`${CREATED_ADMIN_API}/create-user`, formData, {
      headers: {
        ...getAuthHeader(),
        // don't set Content-Type; browser will set multipart boundary
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error(error.response?.data?.message || error.response?.data?.msg || "User creation failed");
  }
};

// READ
const userDisplay = async () => {
  try {
    const response = await axios.get(`${CREATED_ADMIN_API}/user-display`, {
      headers: { ...getAuthHeader() },
    });
    const data = response.data;
    const users = Array.isArray(data) ? data : [data];
    return users;
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return [];
  }
};

// UPDATE (FormData or JSON)
const userUpdate = async (id, formDataOrJson) => {
  try {
    const isForm = formDataOrJson instanceof FormData;
    const response = await axios.put(`${CREATED_ADMIN_API}/user-update/${id}`, formDataOrJson, {
      headers: {
        ...getAuthHeader(),
        // for FormData don't set Content-Type; for JSON axios will set application/json automatically
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error updating user:", error);
    throw new Error(error.response?.data?.message || "Failed to update user");
  }
};

// DELETE
const userDelete = async (id) => {
  try {
    const response = await axios.delete(`${CREATED_ADMIN_API}/user-delete/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    throw new Error(error.response?.data?.message || "Failed to delete user");
  }
};

export { createUser, userDisplay, userUpdate, userDelete };
