import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8020",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// If the saved token is rejected, clear it and go back to the login page
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthRequest = url.includes("/login") || url.includes("/register");

    // Ignore wrong-password errors on the login/register forms themselves
    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default API;
