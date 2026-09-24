import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import {
  getComplianceChecks,
  createComplianceCheck,
  formatDateTime,
  apiErrorMessage,
} from "../api/securityOpsApi";
import { useAuth } from "../context/AuthContext";

const FRAMEWORK_SUGGESTIONS = ["PCI DSS", "ISO 27001", "SOC 2", "HIPAA", "GDPR", "NIST CSF"];

const STATUS_CLASS = {
  COMPLIANT: "status-online",
  NON_COMPLIANT: "status-critical",
  REVIEW_REQUIRED: "status-warning",
};

const EMPTY_FORM = {
  framework: "",
  controlId: "",
  controlName: "",
  status: "COMPLIANT",
  remarks: "",
};

function Compliance() {
  const { isAdmin } = useAuth();

  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [framework, setFramework] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadChecks = async () => {
    try {
      setError("");
      const response = await getComplianceChecks();
      setChecks(response.data);
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, "Unable to load compliance checks."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecks();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.framework.trim() || !formData.controlId.trim()) {
      setFormError("Framework and Control ID are required.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await createComplianceCheck({
        ...formData,
        framework: formData.framework.trim(),
        controlId: formData.controlId.trim(),
      });

      setFormData(EMPTY_FORM);
      setShowForm(false);
      await loadChecks();
    } catch (err) {
      console.error(err);
      setFormError(apiErrorMessage(err, "Failed to record compliance check."));
    } finally {
      setSaving(false);
    }
  };

  const frameworks = [...new Set(checks.map((c) => c.framework).filter(Boolean))].sort();

  const inScope = checks.filter((c) => framework === "ALL" || c.framework === framework);
  const count = (status) => inScope.filter((c) => c.status === status).length;
  const score = inScope.length
    ? Math.round((count("COMPLIANT") / inScope.length) * 100)
    : null;

  const visible = [...inScope].sort((a, b) => b.id - a.id);

  return (
    <div className="page-container">
      <div className="assets-page-header">
        <div>
          <h1 className="assets-page-title">Compliance</h1>
          <p className="assets-page-description">
            Control checks against security frameworks such as PCI DSS and ISO 27001.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className={showForm ? "secondary-button" : "primary-button"}
            onClick={() => {
              setShowForm(!showForm);
              setFormError("");
            }}
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? "Cancel" : "Record Check"}
          </button>
        )}
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Compliance Score</div>
          <div
            className={`metric-value ${score != null && score < 80 ? "metric-danger" : ""}`}
          >
            {score != null ? `${score}%` : "—"}
          </div>
          <div className="metric-meta">
            {framework === "ALL" ? "Across all frameworks" : framework}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Compliant</div>
          <div className="metric-value">{count("COMPLIANT")}</div>
          <div className="metric-meta">Controls passing</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Non-Compliant</div>
          <div className={`metric-value ${count("NON_COMPLIANT") > 0 ? "metric-danger" : ""}`}>
            {count("NON_COMPLIANT")}
          </div>
          <div className="metric-meta">Need remediation</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Review Required</div>
          <div className="metric-value">{count("REVIEW_REQUIRED")}</div>
          <div className="metric-meta">Pending assessment</div>
        </div>
      </div>

      {showForm && (
        <form className="ops-form-card" onSubmit={handleSubmit}>
          <div className="ops-form-title">Record a compliance check</div>

          <div className="ops-form-grid">
            <div className="ops-form-field">
              <label>
                Framework<span className="required-star">*</span>
              </label>
              <input
                name="framework"
                list="framework-suggestions"
                value={formData.framework}
                onChange={handleChange}
                placeholder="e.g. PCI DSS"
              />
              <datalist id="framework-suggestions">
                {FRAMEWORK_SUGGESTIONS.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>

            <div className="ops-form-field">
              <label>
                Control ID<span className="required-star">*</span>
              </label>
              <input
                name="controlId"
                value={formData.controlId}
                onChange={handleChange}
                placeholder="e.g. A-01 or 8.3.1"
              />
            </div>

            <div className="ops-form-field">
              <label>Result</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="COMPLIANT">Compliant</option>
                <option value="NON_COMPLIANT">Non-compliant</option>
                <option value="REVIEW_REQUIRED">Review required</option>
              </select>
            </div>

            <div className="ops-form-field ops-form-wide">
              <label>Control Name</label>
              <input
                name="controlName"
                value={formData.controlName}
                onChange={handleChange}
                placeholder="e.g. Multi-factor authentication for admin access"
              />
            </div>

            <div className="ops-form-field ops-form-wide">
              <label>Remarks</label>
              <textarea
                name="remarks"
                rows="2"
                maxLength="255"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Evidence reviewed, gaps found..."
              />
            </div>
          </div>

          {formError && <div className="ops-inline-error">{formError}</div>}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Saving..." : "Record Check"}
            </button>
          </div>
        </form>
      )}

      <div className="assets-toolbar">
        <div className="ops-filter-chips">
          {["ALL", ...frameworks].map((f) => (
            <button
              key={f}
              type="button"
              className={`ops-chip ${framework === f ? "active" : ""}`}
              onClick={() => setFramework(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="asset-result-count">
          {visible.length} {visible.length === 1 ? "check" : "checks"}
        </div>
      </div>

      {error && <div className="ops-inline-error">{error}</div>}

      {loading ? (
        <div className="assets-loading-card">
          <div className="assets-loading-spinner"></div>
          Loading compliance checks...
        </div>
      ) : visible.length === 0 ? (
        <div className="assets-empty-state">
          <div className="assets-empty-icon">+</div>
          <h3>No compliance checks yet</h3>
          <p>Record a control check to start tracking your compliance posture.</p>
        </div>
      ) : (
        <div className="assets-table-container">
          <table className="assets-table">
            <thead>
              <tr>
                <th>Framework</th>
                <th>Control</th>
                <th>Result</th>
                <th>Remarks</th>
                <th>Checked</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="asset-type">{c.framework}</span>
                  </td>

                  <td>
                    <div className="asset-name-cell">
                      <div>
                        <strong className="asset-ip">{c.controlId}</strong>
                        {c.controlName && <span>{c.controlName}</span>}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`status-badge ${STATUS_CLASS[c.status] || "status-offline"}`}>
                      <span className="status-badge-dot"></span>
                      {c.status?.replace("_", " ")}
                    </span>
                  </td>

                  <td className="ops-remarks">{c.remarks || "—"}</td>

                  <td>{formatDateTime(c.checkedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Compliance;
