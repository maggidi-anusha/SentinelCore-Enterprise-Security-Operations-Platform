import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCheck, Eye } from "lucide-react";

import { getAlerts, acknowledgeAlert, resolveAlert } from "../api/alertApi";
import { formatDateTime, apiErrorMessage } from "../api/securityOpsApi";
import { useAuth } from "../context/AuthContext";

const STATUS_FILTERS = ["ALL", "OPEN", "ACKNOWLEDGED", "RESOLVED"];

const STATUS_CLASS = {
  OPEN: "ops-status-open",
  ACKNOWLEDGED: "ops-status-in_progress",
  RESOLVED: "ops-status-resolved",
};

function Alerts() {
  const { isAdmin } = useAuth();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadAlerts = async () => {
    try {
      setError("");
      const response = await getAlerts();
      setAlerts(response.data);
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, "Unable to load alerts."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const runAction = async (action, fallback) => {
    try {
      setError("");
      await action();
      await loadAlerts();
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, fallback));
    }
  };

  const count = (status) => alerts.filter((a) => a.status === status).length;
  const openCritical = alerts.filter(
    (a) => a.severity === "CRITICAL" && a.status !== "RESOLVED"
  ).length;

  const visible = [...alerts]
    .filter((a) => statusFilter === "ALL" || a.status === statusFilter)
    .sort((a, b) => b.id - a.id);

  return (
    <div className="page-container">
      <div className="assets-page-header">
        <div>
          <h1 className="assets-page-title">Security Alerts</h1>
          <p className="assets-page-description">
            Monitor and manage infrastructure security alerts.
          </p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Open</div>
          <div className="metric-value">{count("OPEN")}</div>
          <div className="metric-meta">Not yet acknowledged</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Acknowledged</div>
          <div className="metric-value">{count("ACKNOWLEDGED")}</div>
          <div className="metric-meta">Seen, not yet resolved</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Resolved</div>
          <div className="metric-value">{count("RESOLVED")}</div>
          <div className="metric-meta">Of {alerts.length} total</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active Critical</div>
          <div className={`metric-value ${openCritical > 0 ? "metric-danger" : ""}`}>
            {openCritical}
          </div>
          <div className="metric-meta">Critical and unresolved</div>
        </div>
      </div>

      <div className="assets-toolbar">
        <div className="ops-filter-chips">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              className={`ops-chip ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="asset-result-count">
          {visible.length} {visible.length === 1 ? "alert" : "alerts"}
        </div>
      </div>

      {error && <div className="ops-inline-error">{error}</div>}

      {loading ? (
        <div className="assets-loading-card">
          <div className="assets-loading-spinner"></div>
          Loading alerts...
        </div>
      ) : visible.length === 0 ? (
        <div className="assets-empty-state">
          <div className="assets-empty-icon">✓</div>
          <h3>No alerts</h3>
          <p>
            {statusFilter === "ALL"
              ? "No security alerts have been raised."
              : `No ${statusFilter.toLowerCase()} alerts.`}
          </p>
        </div>
      ) : (
        <div className="assets-table-container">
          <table className="assets-table">
            <thead>
              <tr>
                <th>Alert</th>
                <th>Asset</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Raised</th>
                <th>Resolved</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {visible.map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <div className="asset-name-cell">
                      <div className="asset-icon">#{alert.id}</div>
                      <div>
                        <strong className="ops-alert-message" title={alert.message}>
                          {alert.message}
                        </strong>
                      </div>
                    </div>
                  </td>

                  <td>
                    <Link to={`/assets/${alert.assetId}`} className="view-link">
                      {alert.assetName}
                    </Link>
                  </td>

                  <td>
                    <span className={`ops-severity ops-severity-${alert.severity?.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                  </td>

                  <td>
                    <span className={`status-badge ${STATUS_CLASS[alert.status] || "status-offline"}`}>
                      <span className="status-badge-dot"></span>
                      {alert.status}
                    </span>
                  </td>

                  <td className="ops-nowrap">{formatDateTime(alert.createdAt)}</td>

                  <td className="ops-nowrap">{formatDateTime(alert.resolvedAt)}</td>

                  {isAdmin && (
                    <td>
                      <div className="ops-actions">
                        {alert.status === "OPEN" && (
                          <button
                            type="button"
                            className="secondary-button ops-small-button"
                            onClick={() =>
                              runAction(
                                () => acknowledgeAlert(alert.id),
                                "Unable to acknowledge alert."
                              )
                            }
                          >
                            <Eye size={13} />
                            Acknowledge
                          </button>
                        )}

                        {alert.status !== "RESOLVED" && (
                          <button
                            type="button"
                            className="primary-button ops-small-button"
                            onClick={() =>
                              runAction(() => resolveAlert(alert.id), "Unable to resolve alert.")
                            }
                          >
                            <CheckCheck size={13} />
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Alerts;
