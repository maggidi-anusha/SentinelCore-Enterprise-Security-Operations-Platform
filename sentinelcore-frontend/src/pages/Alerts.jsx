import { useEffect, useState } from "react";

import {
    getAlerts,
    acknowledgeAlert,
    resolveAlert,
} from "../api/alertApi";

function Alerts() {

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAlerts = async () => {

        try {
            setLoading(true);
            setError("");

            const response = await getAlerts();

            setAlerts(response.data);

        } catch (err) {

            console.error(err);

            setError("Unable to load alerts.");

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    const handleAcknowledge = async (id) => {

        try {

            await acknowledgeAlert(id);

            await loadAlerts();

        } catch (err) {

            console.error(err);
            setError("Unable to acknowledge alert.");

        }
    };

    const handleResolve = async (id) => {

        try {

            await resolveAlert(id);

            await loadAlerts();

        } catch (err) {

            console.error(err);
            setError("Unable to resolve alert.");

        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <h1>Alerts</h1>
                <p>Loading alerts...</p>
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Security Alerts</h1>
                    <p>
                        Monitor and manage infrastructure security alerts.
                    </p>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="table-card">

                <table>

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Asset</th>
                            <th>Severity</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {alerts.length === 0 ? (

                            <tr>
                                <td colSpan="7">
                                    No alerts found.
                                </td>
                            </tr>

                        ) : (

                            alerts.map((alert) => (

                                <tr key={alert.id}>

                                    <td>
                                        #{alert.id}
                                    </td>

                                    <td>
                                        {alert.assetName}
                                    </td>

                                    <td>
                                        <span
                                            className={`severity-badge ${alert.severity?.toLowerCase()}`}
                                        >
                                            {alert.severity}
                                        </span>
                                    </td>

                                    <td>
                                        {alert.message}
                                    </td>

                                    <td>
                                        <span
                                            className={`status-badge ${alert.status?.toLowerCase()}`}
                                        >
                                            {alert.status}
                                        </span>
                                    </td>

                                    <td>
                                        {alert.createdAt
                                            ? new Date(
                                                alert.createdAt
                                            ).toLocaleString()
                                            : "-"}
                                    </td>

                                    <td>
    <div className="alert-actions">

        {alert.status === "OPEN" && (
            <button
                className="secondary-button"
                onClick={() =>
                    handleAcknowledge(alert.id)
                }
            >
                Acknowledge
            </button>
        )}

        {alert.status !== "RESOLVED" && (
            <button
                className="primary-button"
                onClick={() =>
                    handleResolve(alert.id)
                }
            >
                Resolve
            </button>
        )}

    </div>
</td>

                                </tr>

                            ))
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Alerts;