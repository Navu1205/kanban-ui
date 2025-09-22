import axios from "axios";

const httpClient = axios.create({
  baseURL: "https://kanban-server-o4s0.onrender.com/",
});

httpClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      console.log("Axios Interceptor: Token found in localStorage?", !!token);
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

export default httpClient;
