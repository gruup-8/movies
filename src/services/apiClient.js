import axios from "axios";
//import { config } from "dotenv";
import { getToken, saveToken } from "./authService";
/*
const apiClient = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(async (config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
    const newToken = response.headers.authorization?.split(' ')[1];
    if (newToken) {
        saveToken(newToken);
    }
    return response;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;*/