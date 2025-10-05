import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ShelterList from "./components/ShelterList/ShelterList";
import HomePage from "./pages/HomePage/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shelters" element={<ShelterList />} />
        {/* Optional: redirect unknown paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;