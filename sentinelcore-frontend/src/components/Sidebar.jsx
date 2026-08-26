import { LayoutDashboard, Server, PlusCircle, ShieldAlert } from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <ShieldAlert size={23} />
        </div>

        <div className="brand-text">
          <div className="brand-name">SentinelCore</div>

          <div className="brand-subtitle">Security Operations</div>
        </div>
      </div>

      <div className="sidebar-divider"></div>

      <div className="sidebar-section-title">WORKSPACE</div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/assets"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Server size={20} />
          <span>Assets</span>
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/assets/register"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <PlusCircle size={20} />
            <span>Register Asset</span>
          </NavLink>
        )}

        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <ShieldAlert size={20} />
          <span>Alerts</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
