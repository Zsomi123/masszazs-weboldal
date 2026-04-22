import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Figyeld a ../ kezdetet! (Feljebb lépünk egy mappát)
import logoImg from "../assets/logo.png"; 

// A komponenseknél is feljebb kell lépni a pages mappából!
import AdminLogin from "../components/admin/AdminLogin";
import AdminCalendar from "../components/admin/AdminCalendar";
import AdminServices from "../components/admin/AdminServices"; // (Gondolom ez is ott van)

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [services, setServices] = useState([]);

  // Ez a függvény tölti le a szolgáltatásokat, amit átadunk a gyerekeknek
  const fetchServices = () => {
    fetch('http://localhost:5001/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error("Hiba a szolgáltatások letöltésekor:", err));
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchServices();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', paddingBottom: '50px' }}>
      <nav className="navbar" style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
        <Link to="/" className="logo-link" style={{ marginBottom: '10px' }}>
          <img src={logoImg} alt="Emi Logo" className="logo-img" />
          <span className="logo-text" style={{ fontSize: '1.2rem' }}>Massage <span style={{color: 'red', fontSize: '1rem'}}>| ADMIN</span></span>
        </Link>
        <button onClick={() => setIsLoggedIn(false)} className="nav-btn" style={{ backgroundColor: '#e74c3c', color: 'white', padding: '8px 15px', fontSize: '0.9rem' }}>Kijelentkezés</button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 15px' }}>
        {/* Itt hívjuk meg a felvágott komponenseket, és átadjuk nekik az adatokat (props) */}
        <AdminCalendar services={services} />
        <AdminServices services={services} fetchServices={fetchServices} />
      </div>
    </div>
  );
}

export default Admin;