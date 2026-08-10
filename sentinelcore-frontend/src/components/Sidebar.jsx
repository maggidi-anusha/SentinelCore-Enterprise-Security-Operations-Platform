import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Server,
  PlusCircle,
  Activity,
  ShieldAlert,
  Settings,
  ShieldCheck,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <ShieldCheck size={22} />
        </div>

        <div>
          <div className="brand-name">SentinelCore</div>
          <div className="brand-subtitle">SECURITY OPERATIONS</div>
        </div>
      </div>

      <div className="sidebar-section">
        <span className="section-label">OPERATIONS</span>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/assets"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <Server size={18} />
            <span>Assets</span>
          </NavLink>

          <NavLink
            to="/assets/register"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <PlusCircle size={18} />
            <span>Register Asset</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-section">
        <span className="section-label">SECURITY</span>

        <div className="nav-item disabled-item">
          <Activity size={18} />
          <span>Monitoring</span>
          <span className="coming-soon">Soon</span>
        </div>

        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <ShieldAlert size={18} />
          <span>Alerts</span>
        </NavLink>
      </div>

      <div className="sidebar-bottom">
        <div className="system-status">
          <span className="status-dot"></span>

          <div>
            <div className="status-title">System Online</div>

            <div className="status-subtitle">Core services operational</div>
          </div>
        </div>

        <div className="nav-item">
          <Settings size={18} />
          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
