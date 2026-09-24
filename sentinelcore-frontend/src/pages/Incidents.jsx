import { useEffect, useState } from "react";
import { Plus, X, UserCheck, Trash2 } from "lucide-react";

import {
  getIncidents,
  createIncident,
  assignIncident,
  updateIncidentStatus,
  deleteIncident,
  formatDateTime,
  apiErrorMessage,
} from "../api/securityOpsApi";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const EMPTY_FORM = {
  title: "",
  description: "",
  severity: "MEDIUM",
  assignedTo: "",
  slaDueAt: "",
};

function isOverdue(incident) {
  return (
    incident.slaDueAt &&
    (incident.status === "OPEN" || incident.status === "IN_PROGRESS") &&
    new Date(incident.slaDueAt) < new Date()
  );
}

function Incidents() {
  const { username, isAdmin, canOperate } = useAuth();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadIncidents = async () => {
    try {
      setError("");
      const response = await getIncidents();
      setIncidents(response.data);
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, "Unable to load incidents."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const runAction = async (action, fallback) => {
    try {
      setError("");
      await action();
      await loadIncidents();
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, fallback));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await createIncident({
        ...formData,
        assignedTo: formData.assignedTo.trim() || null,
        slaDueAt: formData.slaDueAt || null,
      });

      setFormData(EMPTY_FORM);
      setShowForm(false);
      await loadIncidents();
    } catch (err) {
      console.error(err);
      setFormError(apiErrorMessage(err, "Failed to create incident."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (incident) => {
    if (window.confirm(`Delete incident #${incident.id} "${incident.title}"?`)) {
      runAction(() => deleteIncident(incident.id), "Unable to delete incident.");
    }
  };

  const count = (status) => incidents.filter((i) => i.status === status).length;
  const activeCritical = incidents.filter(
    (i) => i.severity === "CRITICAL" && i.status !== "RESOLVED" && i.status !== "CLOSED"
  ).length;

  const visible = [...incidents]
    .filter((i) => statusFilter === "ALL" || i.status === statusFilter)
    .sort((a, b) => b.id - a.id);

  return (
    <div className="page-container">
      <div className="assets-page-header">
        <div>
          <h1 className="assets-page-title">Incidents</h1>
          <p className="assets-page-description">
            Track, assign and resolve security incidents.
          </p>
        </div>

        {canOperate && (
          <button
            type="button"
            className={showForm ? "secondary-button" : "primary-button"}
            onClick={() => {
              setShowForm(!showForm);
              setFormError("");
            }}
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? "Cancel" : "New Incident"}
          </button>
        )}
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Open</div>
          <div className="metric-value">{count("OPEN")}</div>
          <div className="metric-meta">Awaiting triage</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">In Progress</div>
          <div className="metric-value">{count("IN_PROGRESS")}</div>
          <div className="metric-meta">Assigned and being worked on</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Resolved / Closed</div>
          <div className="metric-value">{count("RESOLVED") + count("CLOSED")}</div>
          <div className="metric-meta">Of {incidents.length} total</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active Critical</div>
          <div className={`metric-value ${activeCritical > 0 ? "metric-danger" : ""}`}>
            {activeCritical}
          </div>
          <div className="metric-meta">Critical and not yet resolved</div>
        </div>
      </div>

      {showForm && (
        <form className="ops-form-card" onSubmit={handleSubmit}>
          <div className="ops-form-title">Report a new incident</div>

          <div className="ops-form-grid">
            <div className="ops-form-field ops-form-wide">
              <label>
                Title<span className="required-star">*</span>
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Suspicious login activity on API server"
              />
            </div>

            <div className="ops-form-field">
              <label>Severity</label>
              <select name="severity" value={formData.severity} onChange={handleChange}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="ops-form-field">
              <label>Assign To</label>
              <input
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                placeholder="username (optional)"
              />
            </div>

            <div className="ops-form-field">
              <label>SLA Due</label>
              <input
                type="datetime-local"
                name="slaDueAt"
                value={formData.slaDueAt}
                onChange={handleChange}
              />
            </div>

            <div className="ops-form-field ops-form-wide">
              <label>Description</label>
              <textarea
                name="description"
                rows="3"
                maxLength="2000"
                value={formData.description}
                onChange={handleChange}
                placeholder="What happened, which systems are affected, first observations..."
              />
            </div>
          </div>

          {formError && <div className="ops-inline-error">{formError}</div>}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Creating..." : "Create Incident"}
            </button>
          </div>
        </form>
      )}

      <div className="assets-toolbar">
        <div className="ops-filter-chips">
          {["ALL", ...STATUSES].map((s) => (
            <button
              key={s}
              type="button"
              className={`ops-chip ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="asset-result-count">
          {visible.length} {visible.length === 1 ? "incident" : "incidents"}
        </div>
      </div>

      {error && <div className="ops-inline-error">{error}</div>}

      {loading ? (
        <div className="assets-loading-card">
          <div className="assets-loading-spinner"></div>
          Loading incidents...
        </div>
      ) : visible.length === 0 ? (
        <div className="assets-empty-state">
          <div className="assets-empty-icon">✓</div>
          <h3>No incidents</h3>
          <p>
            {statusFilter === "ALL"
              ? "No security incidents have been reported."
              : `No incidents with status ${statusFilter.replace("_", " ")}.`}
          </p>
        </div>
      ) : (
        <div className="assets-table-container">
          <table className="assets-table">
            <thead>
              <tr>
                <th>Incident</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>SLA Due</th>
                <th>Created</th>
                {canOperate && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {visible.map((incident) => (
                <tr key={incident.id}>
                  <td>
                    <div className="asset-name-cell">
                      <div className="asset-icon">#{incident.id}</div>
                      <div>
                        <strong>{incident.title}</strong>
                        {incident.description && (
                          <span className="ops-description" title={incident.description}>
                            {incident.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`ops-severity ops-severity-${incident.severity?.toLowerCase()}`}>
                      {incident.severity}
                    </span>
                  </td>

                  <td>
                    <span className={`status-badge ops-status-${incident.status?.toLowerCase()}`}>
                      <span className="status-badge-dot"></span>
                      {incident.status?.replace("_", " ")}
                    </span>
                  </td>

                  <td>{incident.assignedTo || <span className="ops-muted">Unassigned</span>}</td>

                  <td className={isOverdue(incident) ? "metric-danger" : ""}>
                    {formatDateTime(incident.slaDueAt)}
                    {isOverdue(incident) && <div className="ops-overdue">Overdue</div>}
                  </td>

                  <td>{formatDateTime(incident.createdAt)}</td>

                  {canOperate && (
                    <td>
                      <div className="ops-actions">
                        {incident.assignedTo !== username &&
                          incident.status !== "CLOSED" && (
                            <button
                              type="button"
                              className="secondary-button ops-small-button"
                              title="Assign to me"
                              onClick={() =>
                                runAction(
                                  () => assignIncident(incident.id, username),
                                  "Unable to assign incident."
                                )
                              }
                            >
                              <UserCheck size={13} />
                              Take
                            </button>
                          )}

                        <select
                          className="ops-status-select"
                          value={incident.status}
                          aria-label="Change status"
                          onChange={(e) =>
                            runAction(
                              () => updateIncidentStatus(incident.id, e.target.value),
                              "Unable to update status."
                            )
                          }
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ))}
                        </select>

                        {isAdmin && (
                          <button
                            type="button"
                            className="ops-icon-danger"
                            title="Delete incident"
                            aria-label="Delete incident"
                            onClick={() => handleDelete(incident)}
                          >
                            <Trash2 size={14} />
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

export default Incidents;
