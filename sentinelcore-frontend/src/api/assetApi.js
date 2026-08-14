import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Automatically attach JWT to every API request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getAssets = () => {
    return api.get("/assets");
};

export const getDashboardSummary = () => {
    return api.get("/assets/dashboard/summary");
};

export const getAssetById = (id) => {
    return api.get(`/assets/${id}`);
};

export const createAsset = (asset) => {
    return api.post("/assets", asset);
};

export const updateAsset = (id, asset) => {
    return api.put(`/assets/${id}`, asset);
};

export const deleteAsset = (id) => {
    return api.delete(`/assets/${id}`);
};

export default api;