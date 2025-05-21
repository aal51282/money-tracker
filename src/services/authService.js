import axios from "axios";

// Hardcoded API URL since the environment variable may not be available
const API_URL = "http://localhost:4040/api";

export const register = async (username, password) => {
  console.log("Attempting to register:", username, "API_URL:", API_URL);
  const response = await axios.post(
    `${API_URL}/register`,
    {
      username: username,
      password: password,
    },
    {
      withCredentials: true,
    }
  );
  console.log("Registration response:", response.data);
  return response.data;
};

export const login = async (username, password) => {
  const response = await axios.post(
    `${API_URL}/login`,
    { username, password },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const demoLogin = async () => {
  console.log("Attempting demo login, API URL:", API_URL);
  try {
    const response = await axios.post(
      `${API_URL}/demo-login`,
      {},
      {
        withCredentials: true,
      }
    );
    console.log("Demo login successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Demo login error:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
  }
};
