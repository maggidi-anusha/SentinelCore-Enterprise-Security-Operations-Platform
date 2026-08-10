import api from "./assetApi";

// ==================== ALERT APIs ====================

export const getAlerts = () => {
    return api.get("/alerts");
};

export const getAlertById = (id) => {
    return api.get(`/alerts/${id}`);
};

export const getAlertsByAsset = (assetId) => {
    return api.get(`/alerts/asset/${assetId}`);
};

export const createAlert = (alert) => {
    return api.post("/alerts", alert);
};

export const acknowledgeAlert = (id) => {
    return api.put(`/alerts/${id}/acknowledge`);
};

export const resolveAlert = (id) => {
    return api.put(`/alerts/${id}/resolve`);
};


// ==================== NOTIFICATION RULE APIs ====================

export const getNotificationRules = () => {
    return api.get("/notification-rules");
};

export const getNotificationRuleById = (id) => {
    return api.get(`/notification-rules/${id}`);
};

export const createNotificationRule = (rule) => {
    return api.post("/notification-rules", rule);
};

export const updateNotificationRule = (id, rule) => {
    return api.put(`/notification-rules/${id}`, rule);
};

export const deleteNotificationRule = (id) => {
    return api.delete(`/notification-rules/${id}`);
};

export const getRulesBySeverity = (severity) => {
    return api.get(`/notification-rules/severity/${severity}`);
};