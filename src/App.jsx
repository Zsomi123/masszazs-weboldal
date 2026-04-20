import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Booking from './Booking';
import Admin from './Admin'; // Ezt adtuk hozzá
import './App.css';

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