import axios from "axios";

const baseURL = "http://localhost:5000/user"; // Fixed API base URL

export const userLogin = async (identifier, password) => {
  try {
    const payload = identifier.includes("@")
      ? { email: identifier, password }
      : { userid: identifier, password };

    const response = await axios.post(`${baseURL}/login`, payload);

    // ⭐ Save token (if backend returns token)
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw new Error(error.response?.data?.msg || error.response?.data?.message || "Authentication failed");
  }
};
