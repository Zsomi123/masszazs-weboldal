import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Booking from './Booking';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ha a főoldalon vagyunk (/) */}
        <Route path="/" element={<Home />} />
        
        {/* Ha rákattintunk a foglalás gombra (/foglalas) */}
        <Route path="/foglalas" element={<Booking />} />
      </Routes>
    </Router>
  );
}

export default App;