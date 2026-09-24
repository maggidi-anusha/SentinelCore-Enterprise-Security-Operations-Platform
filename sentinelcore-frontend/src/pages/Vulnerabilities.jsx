import { useEffect, useState } from "react";
import { Plus, X, Wrench } from "lucide-react";

import {
  getVulnerabilities,
  createVulnerability,
  markVulnerabilityPatched,
  formatDateTime,
  apiErrorMessage,
} from "../api/securityOpsApi";
import { useAuth } from "../context/AuthContext";

const EMPTY_FORM = {
  cveId: "",
  title: "",
  affectedSystem: "",
  severity: "HIGH",
  riskScore: "",
  patchVersion: "",
  description: "",
};

const CVE_PATTERN = /^CVE-\d{4}-\d{4,}$/i;

function riskClass(score) {
  if (score == null) return "";
  if (score >= 9) return "ops-risk-critical";
  if (score >= 7) return "ops-risk-high";
  if (score >= 4) return "ops-risk-medium";
  return "ops-risk-low";
}

function Vulnerabilities() {
  const { canOperate } = useAuth();

  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadVulnerabilities = async () => {
    try {
      setError("");
      const response = await getVulnerabilities();
      setVulnerabilities(response.data);
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, "Unable to load vulnerabilities."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVulnerabilities();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cveId = formData.cveId.trim().toUpperCase();
    const riskScore = formData.riskScore === "" ? null : Number(formData.riskScore);

    if (!CVE_PATTERN.test(cveId)) {
      setFormError("CVE ID must look like CVE-2026-12345.");
      return;
    }

    if (riskScore != null && (riskScore < 0 || riskScore > 10)) {
      setFormError("Risk score must be between 0 and 10.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await createVulnerability({ ...formData, cveId, riskScore });

      setFormData(EMPTY_FORM);
      setShowForm(false);
      await loadVulnerabilities();
    } catch (err) {
      console.error(err);
      setFormError(apiErrorMessage(err, "Failed to report vulnerability."));
    } finally {
      setSaving(false);
    }
  };

  const handlePatch = async (v) => {
    if (!window.confirm(`Mark ${v.cveId} on ${v.affectedSystem || "this system"} as patched?`)) {
      return;
    }

    try {
      setError("");
      await markVulnerabilityPatched(v.id);
      await loadVulnerabilities();
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, "Unable to mark as patched."));
    }
  };

  const open = vulnerabilities.filter((v) => v.patchStatus !== "PATCHED");
  const openCriticalHigh = open.filter(
    (v) => v.severity === "CRITICAL" || v.severity === "HIGH"
  ).length;
  const scored = open.filter((v) => v.riskScore != null);
  const avgRisk = scored.length
    ? (scored.reduce((sum, v) => sum + v.riskScore, 0) / scored.length).toFixed(1)
    : "—";

  const visible = [...vulnerabilities]
    .filter((v) => filter === "ALL" || v.patchStatus === filter)
    .sort((a, b) => (b.riskScore ?? -1) - (a.riskScore ?? -1));

  return (
    <div className="page-container">
      <div className="assets-page-header">
        <div>
          <h1 className="assets-page-title">Vulnerabilities</h1>
          <p className="assets-page-description">
            Known CVEs across your systems, ordered by risk score.
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
            {showForm ? "Cancel" : "Report Vulnerability"}
          </button>
        )}
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Open</div>
          <div className="metric-value">{open.length}</div>
          <div className="metric-meta">Not yet patched</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Open Critical / High</div>
          <div className={`metric-value ${openCriticalHigh > 0 ? "metric-danger" : ""}`}>
            {openCriticalHigh}
          </div>
          <div className="metric-meta">Patch these first</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Patched</div>
          <div className="metric-value">{vulnerabilities.length - open.length}</div>
          <div className="metric-meta">Of {vulnerabilities.length} total</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Open Risk</div>
          <div className="metric-value">{avgRisk}</div>
          <div className="metric-meta">CVSS score, 0 – 10</div>
        </div>
      </div>

      {showForm && (
        <form className="ops-form-card" onSubmit={handleSubmit}>
          <div className="ops-form-title">Report a vulnerability</div>

          <div className="ops-form-grid">
            <div className="ops-form-field">
              <label>
                CVE ID<span className="required-star">*</span>
              </label>
              <input
                name="cveId"
                value={formData.cveId}
                onChange={handleChange}
                placeholder="CVE-2026-12345"
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
              <label>Risk Score (0 – 10)</label>
              <input
                type="number"
                name="riskScore"
                min="0"
                max="10"
                step="0.1"
                value={formData.riskScore}
                onChange={handleChange}
                placeholder="8.2"
              />
            </div>

            <div className="ops-form-field">
              <label>Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Remote code execution in OpenSSL"
              />
            </div>

            <div className="ops-form-field">
              <label>Affected System</label>
              <input
                name="affectedSystem"
                value={formData.affectedSystem}
                onChange={handleChange}
                placeholder="e.g. API Server"
              />
            </div>

            <div className="ops-form-field">
              <label>Fixed In Version</label>
              <input
                name="patchVersion"
                value={formData.patchVersion}
                onChange={handleChange}
                placeholder="e.g. 2.1.0"
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
              />
            </div>
          </div>

          {formError && <div className="ops-inline-error">{formError}</div>}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Saving..." : "Report Vulnerability"}
            </button>
          </div>
        </form>
      )}

      <div className="assets-toolbar">
        <div className="ops-filter-chips">
          {["ALL", "OPEN", "PATCHED"].map((s) => (
            <button
              key={s}
              type="button"
              className={`ops-chip ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="asset-result-count">
          {visible.length} {visible.length === 1 ? "vulnerability" : "vulnerabilities"}
        </div>
      </div>

      {error && <div className="ops-inline-error">{error}</div>}

      {loading ? (
        <div className="assets-loading-card">
          <div className="assets-loading-spinner"></div>
          Loading vulnerabilities...
        </div>
      ) : visible.length === 0 ? (
        <div className="assets-empty-state">
          <div className="assets-empty-icon">✓</div>
          <h3>No vulnerabilities</h3>
          <p>
            {filter === "ALL"
              ? "No vulnerabilities have been reported."
              : `No ${filter.toLowerCase()} vulnerabilities.`}
          </p>
        </div>
      ) : (
        <div className="assets-table-container">
          <table className="assets-table">
            <thead>
              <tr>
                <th>CVE</th>
                <th>Affected System</th>
                <th>Severity</th>
                <th>Risk</th>
                <th>Fixed In</th>
                <th>Status</th>
                <th>Discovered</th>
                {canOperate && <th></th>}
              </tr>
            </thead>

            <tbody>
              {visible.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="asset-name-cell">
                      <div>
                        <strong className="asset-ip">{v.cveId}</strong>
                        {v.title && (
                          <span className="ops-description" title={v.description || v.title}>
                            {v.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>{v.affectedSystem || "—"}</td>

                  <td>
                    <span className={`ops-severity ops-severity-${v.severity?.toLowerCase()}`}>
                      {v.severity || "—"}
                    </span>
                  </td>

                  <td>
                    {v.riskScore != null ? (
                      <span className={`ops-risk ${riskClass(v.riskScore)}`}>
                        {v.riskScore.toFixed(1)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="asset-ip">{v.patchVersion || "—"}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        v.patchStatus === "PATCHED" ? "status-online" : "status-warning"
                      }`}
                    >
                      <span className="status-badge-dot"></span>
                      {v.patchStatus}
                    </span>
                    {v.patchedAt && (
                      <div className="ops-muted ops-subline">{formatDateTime(v.patchedAt)}</div>
                    )}
                  </td>

                  <td>{formatDateTime(v.discoveredAt)}</td>

                  {canOperate && (
                    <td>
                      {v.patchStatus !== "PATCHED" && (
                        <button
                          type="button"
                          className="secondary-button ops-small-button"
                          onClick={() => handlePatch(v)}
                        >
                          <Wrench size={13} />
                          Mark Patched
                        </button>
                      )}
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

export default Vulnerabilities;
