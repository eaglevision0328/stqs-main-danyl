import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import "./App.css";
import NewGame from "./quickstart/newgame/NewGame";
import FirstMission from "./quickstart/firstmission/FirstMission";
import PurchaseShip from "./quickstart/purchaseship/PurchaseShip";
import MineAsteroids from "./quickstart/mineAsteroids/MineAsteroids";
import SellCargo from "./quickstart/sellCargo/SellCargo";
import LastSteps from "./quickstart/lastStep/LastSteps";
import { AsteroidProvider } from "./context/AsteroidContext";
import { ShipProvider } from "./context/ShipContext";

const App = () => (
  <>
    <h1>STQS</h1>
    <ShipProvider>
      <AsteroidProvider>
        <Router>
          <div className="flex">
            <nav className="nav">
              <ul className="nav-list">
                {[
                  { path: "/", label: "New game" },
                  { path: "/first-mission", label: "First mission" },
                  { path: "/purchase-ship", label: "Purchase ship" },
                  { path: "/mine-asteroids", label: "Mine asteroids" },
                  { path: "/sell-cargo", label: "Sell cargo" },
                  { path: "/last-steps", label: "Last steps" },
                ].map(({ path, label }) => (
                  <li key={path}>
                    <NavLink to={path} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="content">
              <Routes>
                <Route path="/" element={<NewGame />} />
                <Route path="/first-mission" element={<FirstMission />} />
                <Route path="/purchase-ship" element={<PurchaseShip />} />
                <Route path="/mine-asteroids" element={<MineAsteroids />} />
                <Route path="/sell-cargo" element={<SellCargo />} />
                <Route path="/last-steps" element={<LastSteps />} />
              </Routes>
            </div>
          </div>
        </Router>
      </AsteroidProvider>
    </ShipProvider>
  </>
);

export default App;