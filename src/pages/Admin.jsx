import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// ÚJ: Az egybeépített logó importálása!
import logoImg from "../assets/osszerakva_es_massage.png"; 

import AdminLogin from "../components/admin/AdminLogin";
import AdminCalendar from "../components/admin/AdminCalendar";
import AdminServices from "../components/admin/AdminServices"; 

// ÚJ: A stíluslap importálása
import './Admin.css';

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [services, setServices] = useState([]);

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
    <div className="admin-page-bg">
      <nav className="admin-navbar">
        <Link to="/" className="admin-logo-wrapper">
          {/* A profi logó, és mellette egy kis piros "ADMIN" jelvény */}
          <img src={logoImg} alt="Emi Massage" className="logo-img" style={{ maxHeight: '55px' }} />
          <span className="admin-badge">ADMIN</span>
        </Link>
        <button onClick={() => setIsLoggedIn(false)} className="btn-logout">
          Kijelentkezés
        </button>
      </nav>

      <div className="admin-container">
        {/* Komponensek */}
        <AdminCalendar services={services} />
        <AdminServices services={services} fetchServices={fetchServices} />
      </div>
    </div>
  );
}

export default Admin;