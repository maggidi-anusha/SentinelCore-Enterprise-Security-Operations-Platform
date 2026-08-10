import { Bell, CircleUserRound } from "lucide-react";

function TopBar() {

    return (
        <header className="topbar">

            <div className="topbar-left">
                <div>
                    <div className="topbar-title">
                        Enterprise Security Operations
                    </div>

                    <div className="topbar-subtitle">
                        Infrastructure monitoring and security management
                    </div>
                </div>
            </div>

            <div className="topbar-right">

                <div className="environment">
                    <span className="status-dot"></span>
                    Development
                </div>

                <button className="icon-button">
                    <Bell size={19} />
                </button>

                <div className="user-profile">
                    <CircleUserRound size={22} />

                    <div>
                        <div className="user-name">
                            Administrator
                        </div>

                        <div className="user-role">
                            Security Operations
                        </div>
                    </div>
                </div>

            </div>

        </header>
    );
}

export default TopBar;