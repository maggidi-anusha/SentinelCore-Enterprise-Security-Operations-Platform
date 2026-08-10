import { useEffect, useState } from "react";
import { getAssets } from "../api/assetApi";

function Dashboard() {

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadAssets = async () => {

            try {
                const response = await getAssets();

                setAssets(response.data);

            } catch (err) {

                console.error("Failed to load assets:", err);

                setError("Unable to load infrastructure data.");

            } finally {

                setLoading(false);

            }
        };

        loadAssets();

    }, []);


    // -----------------------------
    // DASHBOARD CALCULATIONS
    // -----------------------------

    const totalAssets = assets.length;

    const serverAssets = assets.filter(
        asset =>
            asset.assetType?.toUpperCase() === "SERVER"
    ).length;


    const highUsageAssets = assets.filter(asset =>
        (asset.cpuUsage ?? 0) >= 80 ||
        (asset.memoryUsage ?? 0) >= 80 ||
        (asset.diskUsage ?? 0) >= 80 ||
        (asset.networkUsage ?? 0) >= 80
    ).length;


    const averageCpu =
        totalAssets === 0
            ? 0
            : assets.reduce(
                (sum, asset) =>
                    sum + (asset.cpuUsage ?? 0),
                0
            ) / totalAssets;


    const averageMemory =
        totalAssets === 0
            ? 0
            : assets.reduce(
                (sum, asset) =>
                    sum + (asset.memoryUsage ?? 0),
                0
            ) / totalAssets;


    // -----------------------------
    // LOADING STATE
    // -----------------------------

    if (loading) {

        return (
            <div>

                <h1 className="page-title">
                    Infrastructure Overview
                </h1>

                <p className="page-description">
                    Loading infrastructure data...
                </p>

            </div>
        );

    }


    // -----------------------------
    // ERROR STATE
    // -----------------------------

    if (error) {

        return (
            <div>

                <h1 className="page-title">
                    Infrastructure Overview
                </h1>

                <p className="page-description">
                    {error}
                </p>

            </div>
        );

    }


    // -----------------------------
    // DASHBOARD UI
    // -----------------------------

    return (
        <div>

            {/* HEADER */}

            <div className="dashboard-header">

                <div>

                    <h1 className="page-title">
                        Infrastructure Overview
                    </h1>

                    <p className="page-description">
                        Real-time visibility into registered infrastructure assets.
                    </p>

                </div>

                <span className="dashboard-date">
                    SentinelCore Monitoring
                </span>

            </div>


            {/* METRIC CARDS */}

            <div className="metrics-grid">

                <div className="metric-card">

                    <div className="metric-label">
                        Total Assets
                    </div>

                    <div className="metric-value">
                        {totalAssets}
                    </div>

                    <div className="metric-meta">
                        Registered infrastructure
                    </div>

                </div>


                <div className="metric-card">

                    <div className="metric-label">
                        Server Assets
                    </div>

                    <div className="metric-value">
                        {serverAssets}
                    </div>

                    <div className="metric-meta">
                        Registered servers
                    </div>

                </div>


                <div className="metric-card">

                    <div className="metric-label">
                        Average CPU
                    </div>

                    <div className="metric-value">
                        {averageCpu.toFixed(1)}%
                    </div>

                    <div className="metric-meta">
                        Across monitored assets
                    </div>

                </div>


                <div className="metric-card">

                    <div className="metric-label">
                        High Usage
                    </div>

                    <div className="metric-value">
                        {highUsageAssets}
                    </div>

                    <div className="metric-meta">
                        Assets above 80%
                    </div>

                </div>

            </div>


            {/* LOWER PANELS */}

            <div className="dashboard-grid">

                {/* INFRASTRUCTURE HEALTH */}

                <section className="panel">

                    <div className="panel-header">

                        <div>

                            <div className="panel-title">
                                Infrastructure Health
                            </div>

                            <div className="panel-subtitle">
                                Current resource utilization
                            </div>

                        </div>

                    </div>


                    <div>

                        <p className="panel-subtitle">
                            Average CPU usage
                        </p>

                        <h2>
                            {averageCpu.toFixed(1)}%
                        </h2>

                        <br />

                        <p className="panel-subtitle">
                            Average memory usage
                        </p>

                        <h2>
                            {averageMemory.toFixed(1)}%
                        </h2>

                    </div>

                </section>


                {/* SYSTEM STATUS */}

                <section className="panel">

                    <div className="panel-header">

                        <div>

                            <div className="panel-title">
                                System Status
                            </div>

                            <div className="panel-subtitle">
                                Platform overview
                            </div>

                        </div>

                    </div>


                    <div className="system-status">

                        <span className="status-dot"></span>

                        <div>

                            <div className="status-title">
                                Backend Connected
                            </div>

                            <div className="status-subtitle">
                                PostgreSQL data available
                            </div>

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}

export default Dashboard;