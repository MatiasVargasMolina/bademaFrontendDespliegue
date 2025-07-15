import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://146.190.115.47:8090", // cambia si corresponde
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para token inválido
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.warn("Token inválido o expirado, limpiando y redirigiendo...");
      localStorage.removeItem("_auth");
      localStorage.removeItem("_auth_state");
      window.location.href = "/login";  // redirige
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
