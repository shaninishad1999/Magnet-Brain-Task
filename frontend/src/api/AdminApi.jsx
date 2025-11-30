import axios from "axios";

const baseURL = "http://localhost:5000/admin"; // Fixed API base URL
// const baseURL = "https://task-management-system-backend-ksft.onrender.com/admin"; // Fixed API base URL

export const adminLogin = async (email, password) => {
    try {
        const response = await axios.post(
            `${baseURL}/login`,
            { email, password }
        );

        // Save token (if backend returns one)
        if (response.data?.token) {
            localStorage.setItem("token", response.data.token);
        }

        return response.data; // Return the response data
    } catch (error) {
        console.error("Error logging in:", error);
        throw new Error(error.response?.data?.msg || error.response?.data?.message || "Authentication failed");
    }
};
