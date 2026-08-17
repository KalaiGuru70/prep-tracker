import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddEntry from "./pages/AddEntry";
import History from "./pages/History";
import Stats from "./pages/Stats";
import "./style.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="navbar">
          <div className="navbar-brand">
          <span className="navbar-brand-icon">🎯</span> Prep Tracker
          </div>
          <div className="navbar-links">
            <NavLink to="/" end className="nav-link">Dashboard</NavLink>
            <NavLink to="/add" className="nav-link">Add Entry</NavLink>
            <NavLink to="/history" className="nav-link">History</NavLink>
            <NavLink to="/stats" className="nav-link">Stats</NavLink>
          </div>
        </nav>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddEntry />} />
            <Route path="/history" element={<History />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;