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

    if (loading) {
        return (
            <div className="page-container">
                <p>Loading asset details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="error-message">
                    {error}
                </div>

                <Link to="/assets" className="secondary-button">
                    Back to Assets
                </Link>
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="page-container">
                <p>Asset not found.</p>

                <Link to="/assets" className="secondary-button">
                    Back to Assets
                </Link>
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Asset Details</h1>
                    <p>Infrastructure asset information</p>
                </div>

                <Link
                    to="/assets"
                    className="secondary-button"
                >
                    ← Back to Assets
                </Link>
            </div>

            <div className="details-card">

                <div className="details-header">
                    <div>
                        <h2>{asset.assetName}</h2>
                        <p>{asset.assetType}</p>
                    </div>

                    <span className="status-badge">
                        {asset.status || "UNKNOWN"}
                    </span>
                </div>

                <div className="details-grid">

                    <div className="detail-item">
                        <span>IP Address</span>
                        <strong>{asset.ipAddress || "-"}</strong>
                    </div>

                    <div className="detail-item">
                        <span>Location</span>
                        <strong>{asset.location || "-"}</strong>
                    </div>

                    <div className="detail-item">
                        <span>Address</span>
                        <strong>{asset.address || "-"}</strong>
                    </div>

                    <div className="detail-item">
                        <span>CPU Usage</span>
                        <strong>
                            {asset.cpuUsage ?? 0}%
                        </strong>
                    </div>

                    <div className="detail-item">
                        <span>Memory Usage</span>
                        <strong>
                            {asset.memoryUsage ?? 0}%
                        </strong>
                    </div>

                    <div className="detail-item">
                        <span>Disk Usage</span>
                        <strong>
                            {asset.diskUsage ?? 0}%
                        </strong>
                    </div>

                    <div className="detail-item">
                        <span>Network Usage</span>
                        <strong>
                            {asset.networkUsage ?? 0}%
                        </strong>
                    </div>

                    <div className="detail-item">
                        <span>Created At</span>
                        <strong>
                            {asset.createdAt
                                ? new Date(asset.createdAt).toLocaleString()
                                : "-"}
                        </strong>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default AssetDetails;