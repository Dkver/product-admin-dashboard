import axios from "axios";

const api = axios.create({
  baseURL: "https://dummyjson.com",
  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * Add login token to every request
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
 * Centralized API error handling
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(
      "API ERROR:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      console.error("Unauthorized request");
    }

    if (error.response?.status === 404) {
      console.error("Resource not found");
    }

    if (error.response?.status >= 500) {
      console.error("Server error");
    }

    return Promise.reject(error);
  }
);

export default api;