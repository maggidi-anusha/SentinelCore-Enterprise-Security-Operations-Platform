import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAsset } from "../api/assetApi";

function RegisterAsset() {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        assetName: "",
        assetType: "",
        ipAddress: "",
        location: "",
        address: "",
        memoryUsage: "",
        cpuUsage: "",
        diskUsage: "",
        networkUsage: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        if (!formData.assetName ||
            !formData.assetType ||
            !formData.ipAddress) {

            setError(
                "Asset name, asset type and IP address are required."
            );

            return;
        }

        try {

            setLoading(true);

            const payload = {
                assetName: formData.assetName,
                assetType: formData.assetType,
                ipAddress: formData.ipAddress,
                location: formData.location,
                address: formData.address,
                memoryUsage: Number(formData.memoryUsage) || 0,
                cpuUsage: Number(formData.cpuUsage) || 0,
                diskUsage: Number(formData.diskUsage) || 0,
                networkUsage: Number(formData.networkUsage) || 0
            };

            await createAsset(payload);

            navigate("/assets");

        } catch (err) {

            console.error("Failed to create asset:", err);

            setError(
                err.response?.data?.message ||
                "Failed to register asset."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <h1>Register Asset</h1>

                    <p>
                        Add a new infrastructure asset to SentinelCore.
                    </p>
                </div>

            </div>

            <div className="form-card">

                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        <div className="form-group">
                            <label>Asset Name *</label>

                            <input
                                type="text"
                                name="assetName"
                                value={formData.assetName}
                                onChange={handleChange}
                                placeholder="e.g. Production Server"
                            />
                        </div>


                        <div className="form-group">
                            <label>Asset Type *</label>

                            <select
                                name="assetType"
                                value={formData.assetType}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select asset type
                                </option>

                                <option value="SERVER">
                                    Server
                                </option>

                                <option value="DATABASE">
                                    Database
                                </option>

                                <option value="NETWORK">
                                    Network
                                </option>

                                <option value="WORKSTATION">
                                    Workstation
                                </option>

                            </select>
                        </div>


                        <div className="form-group">
                            <label>IP Address *</label>

                            <input
                                type="text"
                                name="ipAddress"
                                value={formData.ipAddress}
                                onChange={handleChange}
                                placeholder="192.168.1.100"
                            />
                        </div>


                        <div className="form-group">
                            <label>Location</label>

                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Hyderabad"
                            />
                        </div>


                        <div className="form-group">
                            <label>Address</label>

                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Data Center / Office"
                            />
                        </div>


                        <div className="form-group">
                            <label>CPU Usage (%)</label>

                            <input
                                type="number"
                                name="cpuUsage"
                                min="0"
                                max="100"
                                value={formData.cpuUsage}
                                onChange={handleChange}
                                placeholder="45"
                            />
                        </div>


                        <div className="form-group">
                            <label>Memory Usage (%)</label>

                            <input
                                type="number"
                                name="memoryUsage"
                                min="0"
                                max="100"
                                value={formData.memoryUsage}
                                onChange={handleChange}
                                placeholder="60"
                            />
                        </div>


                        <div className="form-group">
                            <label>Disk Usage (%)</label>

                            <input
                                type="number"
                                name="diskUsage"
                                min="0"
                                max="100"
                                value={formData.diskUsage}
                                onChange={handleChange}
                                placeholder="50"
                            />
                        </div>


                        <div className="form-group">
                            <label>Network Usage (%)</label>

                            <input
                                type="number"
                                name="networkUsage"
                                min="0"
                                max="100"
                                value={formData.networkUsage}
                                onChange={handleChange}
                                placeholder="30"
                            />
                        </div>

                    </div>


                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}


                    <div className="form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => navigate("/assets")}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Registering..."
                                : "Register Asset"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default RegisterAsset;