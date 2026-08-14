import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/assetApi";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                username,
                password,
            });

            const { token, role } = response.data;

            // Store JWT and role
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("username", response.data.username);

            // Go to dashboard after successful login
            navigate("/");
        } catch (err) {
            console.error("Login failed:", err);

            if (err.response?.status === 401 ||
                err.response?.status === 403) {
                setError("Invalid username or password.");
            } else {
                setError("Unable to connect to the server.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-header">
                    <h1>SentinelCore</h1>
                    <p>Security Operations Platform</p>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="form-group">
                        <label>Username</label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;