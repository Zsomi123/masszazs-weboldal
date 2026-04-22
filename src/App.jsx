import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Figyeld meg: most már a pages mappából importáljuk őket!
import Home from './pages/Home';
import Booking from './pages/Booking';
import Admin from './pages/Admin'; 
import './App.css'; // Ez maradt ugyanaz

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/foglalas" element={<Booking />} />
        
        {/* A Titkos Admin Útvonal: */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;