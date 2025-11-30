import axios from "axios";

// Base URL for Task Management API
const TASK_API_URL = "http://localhost:5000/tasks";
// const TASK_API_URL = "https://task-management-system-backend-ksft.onrender.com/tasks";

// Axios instance
const API = axios.create({
  baseURL: TASK_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request (if available)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle API errors centrally
const handleApiError = (error) => {
  return error.response?.data?.message || "An error occurred!";
};

// 🔹 **CREATE TASK**
export const createTask = async (taskData) => {
  try {
    const response = await API.post("/create", taskData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// 🔹 **GET ALL TASKS**
export const getAllTasks = async (page = 1, limit = 10, status = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status && status !== 'All') {
      params.append('status', status);
    }
    
    const response = await API.get(`/getalltasks?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};


// 🔹 **UPDATE TASK**
export const updateTask = async (taskId, updatedData) => {
  try {
    const response = await API.put(`/updatetask/${taskId}`, updatedData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// 🔹 **DELETE TASK**
export const deleteTask = async (taskId) => {
  try {

    const response = await API.delete(`/deletetask/${taskId}`);

    return response.data;
  } catch (error) {
    console.error("❌ API Error deleting task:", error);
    throw handleApiError(error);
  }
};


// 🔹 **GET TASK METRICS**

export const getTaskMetrics = async () => {
  try {
    const response = await API.get("/gettaskmetrics");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// 🔹 **GET RECENT TASKS**
export const getRecentTasks = async () => {
  try {
    const response = await API.get("/getrecenttasks");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export const getRecentActivities = async () => {
  const response = await axios.get("/api/activity/recent");
  return response.data;
};

// Get all tasks for a specific user
export const getUserTasks = async (id) => {
  try {
   

    const response = await axios.get(`${TASK_API_URL}/getusertasks/${id}`)

    

    return response.data;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    throw error;
  }
};


// Get all tasks for a specific user
export const getUserTaskDisplay = async (id) => {
  try {
    const response = await axios.get(`${TASK_API_URL}/usertaskdisplay?id=${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    throw error;
  }
};

// add near other API helpers
export const getTaskById = async (id) => {
  try {
    const response = await API.get(`/gettaskbyid/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
