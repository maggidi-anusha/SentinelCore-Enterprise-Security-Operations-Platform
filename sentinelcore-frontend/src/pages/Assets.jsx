import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAssets } from "../api/assetApi";

function Assets() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            setLoading(true);

            const response = await getAssets();

            setAssets(response.data);
            setError("");
        } catch (err) {
            console.error("Failed to load assets:", err);
            setError("Unable to load assets.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <h1>Assets</h1>
                <p>Loading assets...</p>
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Assets</h1>
                    <p>Monitor and manage registered infrastructure assets.</p>
                </div>

                <Link
                    to="/assets/register"
                    className="primary-button"
                >
                    + Register Asset
                </Link>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {!error && assets.length === 0 && (
                <div className="empty-state">
                    <h3>No assets registered</h3>
                    <p>
                        Register your first infrastructure asset to start
                        monitoring it.
                    </p>

                    <Link
                        to="/assets/register"
                        className="primary-button"
                    >
                        Register Asset
                    </Link>
                </div>
            )}

            {assets.length > 0 && (
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
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {assets.map((asset) => (
                                <tr key={asset.id}>

                                    <td>
                                        <strong>
                                            {asset.assetName}
                                        </strong>
                                    </td>

                                    <td>
                                        {asset.assetType}
                                    </td>

                                    <td>
                                        {asset.ipAddress}
                                    </td>

                                    <td>
                                        {asset.location}
                                    </td>

                                    <td>
                                        {asset.cpuUsage ?? 0}%
                                    </td>

                                    <td>
                                        {asset.memoryUsage ?? 0}%
                                    </td>

                                    <td>
                                        <span className="status-badge">
                                            {asset.status || "ONLINE"}
                                        </span>
                                    </td>

                                    <td>
                                        <Link
                                            to={`/assets/${asset.id}`}
                                            className="view-link"
                                        >
                                            View
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