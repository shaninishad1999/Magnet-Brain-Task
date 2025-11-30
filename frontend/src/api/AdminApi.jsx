import axios from "axios";

const baseURL = "http://localhost:5000/admin"; // Fixed API base URL
// const baseURL = "https://task-management-system-backend-ksft.onrender.com/admin"; // Fixed API base URL

export const adminLogin = async (email, password) => {
    try {
        const response = await axios.post(
            `${baseURL}/login`,
            { email, password },
            // { withCredentials: true } // Includes cookies for authentication
          
        );  

        return response.data; // Return the response data
    } catch (error) {
        console.error("Error logging in:", error);

        // Extracts error message from backend response
        throw new Error(error.response?.data?.msg || "Authentication failed");
    }
};
