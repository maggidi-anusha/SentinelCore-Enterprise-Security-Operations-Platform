import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Alerts from "./pages/Alerts";
import RegisterAsset from "./pages/RegisterAsset";
import AssetDetails from "./pages/AssetDetails";
import Incidents from "./pages/Incidents";
import Vulnerabilities from "./pages/Vulnerabilities";
import Compliance from "./pages/Compliance";
import AuditLogs from "./pages/AuditLogs";

function AppLayout({ children }) {
    return (
        <div className="app-layout">

            <Sidebar />

            <div className="main-area">

                <TopBar />

                <main className="page-content">
                    {children}
                </main>

            </div>

        </div>
    );
}

function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* Login has NO sidebar or topbar */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Dashboard />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/assets"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Assets />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/alerts"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Alerts />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/assets/register"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <RegisterAsset />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/assets/:id"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <AssetDetails />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/incidents"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Incidents />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vulnerabilities"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Vulnerabilities />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/compliance"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Compliance />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/audit-logs"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <AuditLogs />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;