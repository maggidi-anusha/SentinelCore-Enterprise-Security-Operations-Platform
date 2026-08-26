import {
    CircleUserRound,
    LogOut
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function TopBar() {

    const navigate = useNavigate();

    const {
        logout,
        username,
        role
    } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const displayRole =
        role === "ROLE_ADMIN"
            ? "Administrator"
            : role === "ROLE_OPERATOR"
            ? "Operator"
            : role === "ROLE_VIEWER"
            ? "Viewer"
            : "User";

    return (
        <header className="topbar">

            <div className="topbar-left">

                <div className="topbar-title">
                    Enterprise Security Operations
                </div>

                <div className="topbar-subtitle">
                    Cloud Security Monitoring System with Incident Management Assistance
                </div>

            </div>

            <div className="topbar-right">

                <div className="user-profile">

                    <div className="user-avatar">
                        <CircleUserRound size={22} />
                    </div>

                    <div>
                        <div className="user-name">
                            {username || "User"}
                        </div>

                        <div className="user-role">
                            {displayRole}
                        </div>
                    </div>

                </div>

                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    <LogOut size={17} />
                    <span>Logout</span>
                </button>

            </div>

        </header>
    );
}

export default TopBar;