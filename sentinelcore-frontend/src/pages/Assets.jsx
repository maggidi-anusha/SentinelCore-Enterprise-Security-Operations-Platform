import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAssets,
  searchAssets
} from "../api/assetApi";
import { useAuth } from "../context/AuthContext";

function Assets() {
  const { isAdmin } = useAuth();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [hasRegisteredAssets, setHasRegisteredAssets] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);

      const response = await getAssets();
      const data = response.data || [];

      setAssets(data);
      setHasRegisteredAssets(data.length > 0);
      setError("");
    } catch (err) {
      console.error("Failed to load assets:", err);
      setError("Unable to load assets.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;

    setSearch(value);
    setError("");

    try {
      if (!value.trim()) {
        await loadAssets();
        return;
      }

      const data = await searchAssets(value);
      setAssets(data || []);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Unable to search assets.");
    }
  };

  const clearSearch = async () => {
    setSearch("");
    await loadAssets();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="assets-loading-card">
          <div className="assets-loading-spinner"></div>
          <p>Loading infrastructure assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="assets-page-header">
        <div>
          <h1 className="assets-page-title">Assets</h1>

          <p className="assets-page-description">
            Monitor and manage registered infrastructure assets.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/assets/register"
            className="primary-button"
          >
            + Register Asset
          </Link>
        )}
      </div>

      {/* SEARCH */}
      <div className="assets-toolbar">
        <div className="asset-search-container">
          <span className="asset-search-icon">
            ⌕
          </span>

          <input
            type="text"
            className="asset-search-input"
            placeholder="Search by asset name or ID..."
            value={search}
            onChange={handleSearch}
          />

          {search && (
            <button
              type="button"
              className="asset-search-clear"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {assets.length > 0 && (
          <div className="asset-result-count">
            {assets.length}{" "}
            {assets.length === 1 ? "asset" : "assets"}
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="assets-error-state">
          <div className="assets-state-icon">
            !
          </div>

          <div>
            <h3>Unable to load assets</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* SEARCH RETURNED ZERO RESULTS */}
      {!error &&
        search.trim() &&
        assets.length === 0 && (
          <div className="assets-empty-state">
            <div className="assets-empty-icon">
              ⌕
            </div>

            <h3>No matching assets found</h3>

            <p>
              We couldn't find an asset matching
              <strong> “{search}”</strong>.
              Try another asset name or ID.
            </p>

            <button
              type="button"
              className="secondary-button"
              onClick={clearSearch}
            >
              Clear Search
            </button>
          </div>
        )}

      {/* DATABASE ACTUALLY HAS NO ASSETS */}
      {!error &&
        !search.trim() &&
        !hasRegisteredAssets && (
          <div className="assets-empty-state">
            <div className="assets-empty-icon">
              +
            </div>

            <h3>No assets registered</h3>

            <p>
              Register your first infrastructure asset
              to begin monitoring its health and usage.
            </p>

            {isAdmin && (
              <Link
                to="/assets/register"
                className="primary-button"
              >
                + Register Asset
              </Link>
            )}
          </div>
        )}

      {/* ASSET TABLE */}
      {!error && assets.length > 0 && (
        <div className="assets-table-container">
          <table className="assets-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>IP Address</th>
                <th>Location</th>
                <th>CPU</th>
                <th>Memory</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <div className="asset-name-cell">
                      <div className="asset-icon">
                        {asset.assetName
                          ?.charAt(0)
                          ?.toUpperCase() || "A"}
                      </div>

                      <div>
                        <strong>
                          {asset.assetName}
                        </strong>

                        <span>
                          ID #{asset.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="asset-type">
                      {asset.assetType}
                    </span>
                  </td>

                  <td className="asset-ip">
                    {asset.ipAddress}
                  </td>

                  <td>
                    {asset.location || "—"}
                  </td>

                  <td>
                    <span
                      className={
                        (asset.cpuUsage ?? 0) >= 90
                          ? "metric-danger"
                          : ""
                      }
                    >
                      {asset.cpuUsage ?? 0}%
                    </span>
                  </td>

                  <td>
                    {asset.memoryUsage ?? 0}%
                  </td>

                  <td>
                    <span
                      className={`status-badge status-${(
                        asset.status || "ONLINE"
                      ).toLowerCase()}`}
                    >
                      <span className="status-badge-dot"></span>

                      {asset.status || "ONLINE"}
                    </span>
                  </td>

                  <td>
                    <Link
                      to={`/assets/${asset.id}`}
                      className="view-link"
                    >
                      View details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Assets;
