import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ShelterList from "./components/ShelterList/ShelterList";
import HomePage from "./pages/HomePage/HomePage";
import SheltersMapPage from "./pages/SheltersMapPage/SheltersMapPage";
import ResourcesPage from "./pages/ResourcesPage/ResourcesPage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shelters" element={<ShelterList />} />
        <Route path='/shelter-map' element={<SheltersMapPage/>} />
       <Route path="/resources" element={<ResourcesPage />} /> 
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;