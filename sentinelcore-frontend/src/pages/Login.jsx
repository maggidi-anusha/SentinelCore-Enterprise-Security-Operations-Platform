import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/assetApi";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

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

    loginUser(
    response.data.accessToken,
    response.data.refreshToken,
    response.data.username,
    response.data.role
);

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
    <div className="login-screen">

        <div className="login-panel">

            <div className="login-brand-block">
                <div className="login-logo-box">
                    SC
                </div>

                <h1 className="login-title">
                    SentinelCore
                </h1>

                <p className="login-project-title">
                    Cloud Security Monitoring System with Incident Management Assistance
                </p>

                <p className="login-description">
                    Secure access to infrastructure monitoring,
                    alerts and security operations.
                </p>
            </div>

            <form
                className="login-form"
                onSubmit={handleLogin}
            >

                <div className="login-field">
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

                <div className="login-field">
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
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="login-submit"
                    disabled={loading}
                >
                    {loading
                        ? "Signing in..."
                        : "Sign In"}
                </button>

            </form>

        </div>

    </div>
);
}

export default Login;