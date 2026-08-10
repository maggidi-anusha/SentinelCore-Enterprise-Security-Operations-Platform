import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

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