import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// A korábbi oldalaid:
import Home from './pages/Home';
import Booking from './pages/Booking';
import Admin from './pages/Admin'; 
// ÚJ: A lemondási oldal importálása
import CancelAppointment from './pages/CancelAppointment'; 

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/foglalas" element={<Booking />} />
        
        {/* A Titkos Admin Útvonal: */}
        <Route path="/admin" element={<Admin />} />

        {/* ÚJ: A lemondási oldal útvonala az egyedi ID-val */}
        <Route path="/cancel-appointment/:id" element={<CancelAppointment />} />
      </Routes>
    </Router>
  );
}

export default App;