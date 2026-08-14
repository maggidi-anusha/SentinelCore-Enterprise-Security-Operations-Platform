import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Alerts from "./pages/Alerts";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import RegisterAsset from "./pages/RegisterAsset";
import AssetDetails from "./pages/AssetDetails";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <div className="main-area">
          <TopBar />

          <main className="page-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<Dashboard />} />

              <Route path="/assets" element={<Assets />} />

              <Route path="/alerts" element={<Alerts />} />

              <Route path="/assets/register" element={<RegisterAsset />} />

              <Route path="/assets/:id" element={<AssetDetails />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
