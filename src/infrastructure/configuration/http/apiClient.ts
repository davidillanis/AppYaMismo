import axios, { AxiosInstance } from "axios";

export const baseURL =
  //process.env.API_BASE_URL || "http://192.168.1.104:8080/api/v1";
  //process.env.API_BASE_URL || "https://app-delivery-6w97.onrender.com/api/v1";
  process.env.API_BASE_URL || "https://frightened-dell-abel-issora-d3e90825.koyeb.app/api/v1";

let authToken: string | undefined;

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000, // 15 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token?: string) {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}
apiClient.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
