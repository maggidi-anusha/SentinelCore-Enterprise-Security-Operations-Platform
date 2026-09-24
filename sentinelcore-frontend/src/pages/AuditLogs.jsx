import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { getAuditLogs, formatDateTime, apiErrorMessage } from "../api/securityOpsApi";
import { useAuth } from "../context/AuthContext";

function actionClass(action = "") {
  if (action.includes("FAILED") || action.includes("DELETED")) return "status-critical";
  if (action === "LOGIN") return "status-online";
  return "status-offline";
}

function AuditLogs() {
  const { isAdmin } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [resource, setResource] = useState("ALL");

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAuditLogs();
      setLogs(response.data);
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, "Unable to load audit logs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadLogs();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="page-container">
        <div className="assets-error-state">
          <div className="assets-state-icon">!</div>
          <h3>Administrators only</h3>
          <p>The audit trail is restricted to users with the Administrator role.</p>
        </div>
      </div>
    );
  }

  const resources = [...new Set(logs.map((l) => l.resource).filter(Boolean))].sort();
  const term = search.trim().toLowerCase();

  const visible = logs.filter(
    (l) =>
      (resource === "ALL" || l.resource === resource) &&
      (!term ||
        [l.username, l.action, l.details, l.ipAddress].some((field) =>
          field?.toLowerCase().includes(term)
        ))
  );

  const failedLogins = logs.filter((l) => l.action === "LOGIN_FAILED").length;

  return (
    <div className="page-container">
      <div className="assets-page-header">
        <div>
          <h1 className="assets-page-title">Audit Logs</h1>
          <p className="assets-page-description">
            Append-only record of who did what, and from where. Entries cannot be edited or
            deleted.
          </p>
        </div>

        <button type="button" className="secondary-button" onClick={loadLogs}>
          <RefreshCw size={14} />
          &nbsp;Refresh
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Events</div>
          <div className="metric-value">{logs.length}</div>
          <div className="metric-meta">Recorded actions</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Distinct Users</div>
          <div className="metric-value">{new Set(logs.map((l) => l.username)).size}</div>
          <div className="metric-meta">Including failed login names</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Failed Logins</div>
          <div className={`metric-value ${failedLogins > 0 ? "metric-danger" : ""}`}>
            {failedLogins}
          </div>
          <div className="metric-meta">Possible brute-force signal</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Latest Event</div>
          <div className="metric-value ops-metric-small">
            {logs[0] ? formatDateTime(logs[0].createdAt) : "—"}
          </div>
          <div className="metric-meta">{logs[0]?.action || "No activity yet"}</div>
        </div>
      </div>

      <div className="assets-toolbar">
        <div className="asset-search-container">
          <span className="asset-search-icon">⌕</span>
          <input
            type="text"
            className="asset-search-input"
            placeholder="Search user, action, IP or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="asset-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="ops-filter-chips">
          {["ALL", ...resources].map((r) => (
            <button
              key={r}
              type="button"
              className={`ops-chip ${resource === r ? "active" : ""}`}
              onClick={() => setResource(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="ops-inline-error">{error}</div>}

      {loading ? (
        <div className="assets-loading-card">
          <div className="assets-loading-spinner"></div>
          Loading audit logs...
        </div>
      ) : visible.length === 0 ? (
        <div className="assets-empty-state">
          <div className="assets-empty-icon">⌕</div>
          <h3>No matching events</h3>
          <p>Try a different search term or resource filter.</p>
        </div>
      ) : (
        <div className="assets-table-container">
          <table className="assets-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((log) => (
                <tr key={log.id}>
                  <td className="ops-nowrap">{formatDateTime(log.createdAt)}</td>
                  <td>
                    <strong>{log.username}</strong>
                  </td>
                  <td>
                    <span className={`status-badge ${actionClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span className="asset-type">{log.resource}</span>
                  </td>
                  <td className="ops-remarks">{log.details || "—"}</td>
                  <td className="asset-ip">{log.ipAddress || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;
