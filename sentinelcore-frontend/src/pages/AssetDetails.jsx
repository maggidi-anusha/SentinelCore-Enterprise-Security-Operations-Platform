import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAssetById } from "../api/assetApi";

function AssetDetails() {
    const { id } = useParams();

    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadAsset = async () => {
            try {
                setLoading(true);

                const response = await getAssetById(id);

                setAsset(response.data);
                setError("");
            } catch (err) {
                console.error("Failed to load asset:", err);
                setError("Unable to load asset details.");
            } finally {
                setLoading(false);
            }
        };

        loadAsset();
    }, [id]);

    const formatDate = (value) => {
        if (!value) {
            return "Not available";
        }

        return new Date(value).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const getMetricClass = (value) => {
        const usage = Number(value ?? 0);

        if (usage >= 90) {
            return "asset-metric-critical";
        }

        if (usage >= 75) {
            return "asset-metric-warning";
        }

        return "asset-metric-normal";
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="asset-details-loading">
                    <div className="assets-loading-spinner"></div>

                    <p>Loading asset information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">

                <div className="asset-details-error">
                    <div className="asset-details-error-icon">
                        !
                    </div>

                    <h3>Unable to load asset</h3>

                    <p>{error}</p>

                    <Link
                        to="/assets"
                        className="secondary-button"
                    >
                        ← Back to Assets
                    </Link>
                </div>

            </div>
        );
    }

    if (!asset) {
        return (
            <div className="page-container">

                <div className="asset-details-error">
                    <div className="asset-details-error-icon">
                        !
                    </div>

                    <h3>Asset not found</h3>

                    <p>
                        The requested infrastructure asset
                        could not be found.
                    </p>

                    <Link
                        to="/assets"
                        className="secondary-button"
                    >
                        ← Back to Assets
                    </Link>
                </div>

            </div>
        );
    }

    const status =
        asset.status || "ONLINE";

    return (
        <div className="page-container">

            {/* PAGE HEADER */}
            <div className="asset-details-page-header">

                <div>
                    <div className="asset-details-breadcrumb">
                        <Link to="/assets">
                            Assets
                        </Link>

                        <span>/</span>

                        <span>
                            {asset.assetName}
                        </span>
                    </div>

                    <h1 className="asset-details-title">
                        Asset Details
                    </h1>

                    <p className="asset-details-description">
                        Infrastructure information and
                        current resource utilization.
                    </p>
                </div>

                <Link
                    to="/assets"
                    className="secondary-button"
                >
                    ← Back to Assets
                </Link>

            </div>


            {/* ASSET SUMMARY */}
            <div className="asset-summary-card">

                <div className="asset-summary-left">

                    <div className="asset-summary-icon">
                        {asset.assetName
                            ?.charAt(0)
                            ?.toUpperCase() || "A"}
                    </div>

                    <div>
                        <div className="asset-summary-name-row">

                            <h2>
                                {asset.assetName}
                            </h2>

                            <span
                                className={`status-badge status-${status.toLowerCase()}`}
                            >
                                <span className="status-badge-dot"></span>

                                {status}
                            </span>

                        </div>

                        <p className="asset-summary-type">
                            {asset.assetType || "Infrastructure Asset"}
                        </p>

                        <div className="asset-summary-id">
                            Asset ID #{asset.id}
                        </div>
                    </div>

                </div>

                <div className="asset-summary-network">

                    <span className="asset-summary-label">
                        IP ADDRESS
                    </span>

                    <strong>
                        {asset.ipAddress || "Not available"}
                    </strong>

                </div>

            </div>


            {/* METRICS */}
            <div className="asset-details-section-header">
                <div>
                    <h3>Resource Utilization</h3>

                    <p>
                        Current infrastructure monitoring values.
                    </p>
                </div>
            </div>


            <div className="asset-metrics-grid">

                <div className="asset-usage-card">

                    <div className="asset-usage-card-header">
                        <span>CPU Usage</span>

                        <strong
                            className={getMetricClass(
                                asset.cpuUsage
                            )}
                        >
                            {asset.cpuUsage ?? 0}%
                        </strong>
                    </div>

                    <div className="usage-progress-track">
                        <div
                            className={`usage-progress-fill ${getMetricClass(
                                asset.cpuUsage
                            )}`}
                            style={{
                                width: `${Math.min(
                                    asset.cpuUsage ?? 0,
                                    100
                                )}%`,
                            }}
                        ></div>
                    </div>

                    <p>Processor utilization</p>

                </div>


                <div className="asset-usage-card">

                    <div className="asset-usage-card-header">
                        <span>Memory Usage</span>

                        <strong
                            className={getMetricClass(
                                asset.memoryUsage
                            )}
                        >
                            {asset.memoryUsage ?? 0}%
                        </strong>
                    </div>

                    <div className="usage-progress-track">
                        <div
                            className={`usage-progress-fill ${getMetricClass(
                                asset.memoryUsage
                            )}`}
                            style={{
                                width: `${Math.min(
                                    asset.memoryUsage ?? 0,
                                    100
                                )}%`,
                            }}
                        ></div>
                    </div>

                    <p>Memory utilization</p>

                </div>


                <div className="asset-usage-card">

                    <div className="asset-usage-card-header">
                        <span>Disk Usage</span>

                        <strong
                            className={getMetricClass(
                                asset.diskUsage
                            )}
                        >
                            {asset.diskUsage ?? 0}%
                        </strong>
                    </div>

                    <div className="usage-progress-track">
                        <div
                            className={`usage-progress-fill ${getMetricClass(
                                asset.diskUsage
                            )}`}
                            style={{
                                width: `${Math.min(
                                    asset.diskUsage ?? 0,
                                    100
                                )}%`,
                            }}
                        ></div>
                    </div>

                    <p>Storage utilization</p>

                </div>


                <div className="asset-usage-card">

                    <div className="asset-usage-card-header">
                        <span>Network Usage</span>

                        <strong
                            className={getMetricClass(
                                asset.networkUsage
                            )}
                        >
                            {asset.networkUsage ?? 0}%
                        </strong>
                    </div>

                    <div className="usage-progress-track">
                        <div
                            className={`usage-progress-fill ${getMetricClass(
                                asset.networkUsage
                            )}`}
                            style={{
                                width: `${Math.min(
                                    asset.networkUsage ?? 0,
                                    100
                                )}%`,
                            }}
                        ></div>
                    </div>

                    <p>Network utilization</p>

                </div>

            </div>


            {/* INFRASTRUCTURE DETAILS */}
            <div className="asset-information-grid">

                <div className="asset-info-panel">

                    <div className="asset-info-panel-header">
                        <div>
                            <h3>
                                Infrastructure Information
                            </h3>

                            <p>
                                Registered asset configuration.
                            </p>
                        </div>
                    </div>

                    <div className="asset-info-list">

                        <div className="asset-info-row">
                            <span>Asset Name</span>

                            <strong>
                                {asset.assetName || "—"}
                            </strong>
                        </div>

                        <div className="asset-info-row">
                            <span>Asset Type</span>

                            <strong>
                                {asset.assetType || "—"}
                            </strong>
                        </div>

                        <div className="asset-info-row">
                            <span>IP Address</span>

                            <strong className="asset-code-value">
                                {asset.ipAddress || "—"}
                            </strong>
                        </div>

                        <div className="asset-info-row">
                            <span>Location</span>

                            <strong>
                                {asset.location || "—"}
                            </strong>
                        </div>

                        <div className="asset-info-row">
                            <span>Address</span>

                            <strong>
                                {asset.address || "—"}
                            </strong>
                        </div>

                    </div>

                </div>


                {/* SYSTEM INFO */}
                <div className="asset-info-panel">

                    <div className="asset-info-panel-header">
                        <div>
                            <h3>System Information</h3>

                            <p>
                                Monitoring and registration metadata.
                            </p>
                        </div>
                    </div>

                    <div className="asset-info-list">

                        <div className="asset-info-row">
                            <span>Status</span>

                            <strong>
                                <span
                                    className={`status-badge status-${status.toLowerCase()}`}
                                >
                                    <span className="status-badge-dot"></span>

                                    {status}
                                </span>
                            </strong>
                        </div>

                        <div className="asset-info-row">
                            <span>Asset ID</span>

                            <strong>
                                #{asset.id}
                            </strong>
                        </div>

                        <div className="asset-info-row">
                            <span>Created At</span>

                            <strong>
                                {formatDate(asset.createdAt)}
                            </strong>
                        </div>

                        <div className="asset-info-row">
                            <span>Monitoring</span>

                            <strong className="monitoring-active">
                                <span></span>
                                Active
                            </strong>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AssetDetails;