import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

let authToken = null;

instance.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export function setToken(token) {
  authToken = token;
}

export default Object.assign(instance, { setToken });
