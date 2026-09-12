import axios from "axios";

const AUTH_API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

export const login = (username, password) => {
    return axios.post(`${AUTH_API_BASE_URL}/login`, {
        username,
        password,
    });
};

export const refreshAccessToken = (refreshToken) => {
    return axios.post(`${AUTH_API_BASE_URL}/refresh`, {
        refreshToken,
    });
};