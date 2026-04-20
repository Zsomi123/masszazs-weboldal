import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './App.css';
import logoImg from './assets/logo.png';

function Admin() {
  const [appointments, setAppointments] = useState([]);

  // Adatok letöltése, amikor megnyitod az oldalt
  useEffect(() => {
    fetch('http://localhost:5001/api/admin/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error("Hiba az adatok letöltésekor:", err));
  }, []);

  return (
    <div className="admin-page" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* Fejléc */}
      <nav className="navbar" style={{ position: 'relative' }}>
        <Link to="/" className="logo-link">
          <img src={logoImg} alt="Emi Logo" className="logo-img" />
          <span className="logo-text">Massage <span style={{color: 'red', fontSize: '1rem'}}>| ADMIN</span></span>
        </Link>
        <Link to="/" className="nav-btn">Vissza a weboldalra</Link>
      </nav>

      {/* Tartalom */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>🗓️ Közelgő Foglalások</h1>

        <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                <th style={{ padding: '15px 20px' }}>Dátum és Időpont</th>
                <th style={{ padding: '15px 20px' }}>Vendég neve</th>
                <th style={{ padding: '15px 20px' }}>Telefonszám</th>
                <th style={{ padding: '15px 20px' }}>Szolgáltatás</th>
                <th style={{ padding: '15px 20px' }}>Ár</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>
                    Jelenleg nincs egyetlen foglalásod sem.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px 20px', fontWeight: 'bold', color: '#E67E22' }}>
                      {format(new Date(appt.start_time), 'yyyy. MM. dd. - HH:mm')}
                    </td>
                    <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{appt.customer_name}</td>
                    <td style={{ padding: '15px 20px' }}>
                      {/* Ide csinálunk egy kattintható telefon linket, hogy mobilon azonnal hívhasd! */}
                      <a href={`tel:${appt.customer_phone}`} style={{ color: '#3498db', textDecoration: 'none' }}>
                        {appt.customer_phone}
                      </a>
                    </td>
                    <td style={{ padding: '15px 20px' }}>{appt.service_name}</td>
                    <td style={{ padding: '15px 20px' }}>{appt.price} Ft</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
        </div>
      </div>
    </div>
  );
}

export default Admin;