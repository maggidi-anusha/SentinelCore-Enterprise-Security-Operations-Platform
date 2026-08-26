import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Automatically attach JWT to every API request
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            (error.response?.status === 401 ||
             error.response?.status === 403) &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            const refreshToken =
                localStorage.getItem("refreshToken");

            if (!refreshToken) {
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(
                    "http://localhost:8080/api/auth/refresh",
                    {
                        refreshToken,
                    }
                );

                const newAccessToken =
                    response.data.accessToken;

                localStorage.setItem(
                    "accessToken",
                    newAccessToken
                );

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);

            } catch (refreshError) {

                localStorage.clear();
                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

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