import axios from "axios";

const AUTH_API_BASE_URL = "http://localhost:8080/api/auth";

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