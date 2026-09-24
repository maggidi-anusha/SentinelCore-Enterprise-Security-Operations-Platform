import api from "./assetApi";

// ==================== INCIDENT APIs ====================

export const getIncidents = () => {
    return api.get("/incidents");
};

export const createIncident = (incident) => {
    return api.post("/incidents", incident);
};

export const assignIncident = (id, user) => {
    return api.put(`/incidents/${id}/assign`, null, {
        params: { user },
    });
};

export const updateIncidentStatus = (id, status) => {
    return api.put(`/incidents/${id}/status`, null, {
        params: { status },
    });
};

export const deleteIncident = (id) => {
    return api.delete(`/incidents/${id}`);
};


// ==================== VULNERABILITY APIs ====================

export const getVulnerabilities = () => {
    return api.get("/vulnerabilities");
};

export const createVulnerability = (vulnerability) => {
    return api.post("/vulnerabilities", vulnerability);
};

export const markVulnerabilityPatched = (id) => {
    return api.put(`/vulnerabilities/${id}/patch`);
};


// ==================== COMPLIANCE APIs ====================

export const getComplianceChecks = () => {
    return api.get("/compliance");
};

export const createComplianceCheck = (check) => {
    return api.post("/compliance", check);
};


// ==================== AUDIT LOG APIs ====================

export const getAuditLogs = () => {
    return api.get("/audit");
};

export const getAuditLogsByUser = (username) => {
    return api.get(`/audit/user/${encodeURIComponent(username)}`);
};


// ==================== HELPERS ====================

// Backend returns LocalDateTime strings (no timezone) - show them in local time.
export const formatDateTime = (value) => {
    return value ? new Date(value).toLocaleString() : "—";
};

export const apiErrorMessage = (err, fallback) => {
    if (err.response?.status === 403) {
        return "You don't have permission to perform this action.";
    }

    return err.response?.data?.message || fallback;
};
