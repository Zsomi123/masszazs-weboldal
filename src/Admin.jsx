import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './App.css';
import logoImg from './assets/logo.png';

function Admin() {
  const [appointments, setAppointments] = useState([]);
  
  // Állapotok a belépéshez
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Csak akkor töltjük le a titkos adatokat, ha már beléptünk!
  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:5001/api/admin/appointments')
        .then(res => res.json())
        .then(data => setAppointments(data))
        .catch(err => console.error("Hiba az adatok letöltésekor:", err));
    }
  }, [isLoggedIn]);

  // Belépés gomb megnyomása
  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    fetch('http://localhost:5001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setIsLoggedIn(true); // Siker! Kinyitjuk az oldalt.
      } else {
        setErrorMsg(data.message); // Hibaüzenet (pl. Rossz jelszó)
      }
    })
    .catch(err => setErrorMsg('Hiba a szerver kapcsolatban.'));
  };

  // 1. KÉPERNYŐ: BEJELENTKEZŐ FORM (Ha még nincs belépve)
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src={logoImg} alt="Logo" style={{ height: '60px', borderRadius: '5px' }} />
            <h2 style={{ marginTop: '10px', color: '#2c3e50' }}>Admin Belépés</h2>
          </div>
          
          {errorMsg && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>❌ {errorMsg}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Felhasználónév" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              required 
            />
            <input 
              type="password" 
              placeholder="Jelszó" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              required 
            />
            <button type="submit" style={{ padding: '12px', backgroundColor: '#E67E22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              Belépés a Főnöki Pultba
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
             <Link to="/" style={{ color: '#7f8c8d', textDecoration: 'none', fontSize: '0.9rem' }}>← Vissza a weboldalra</Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. KÉPERNYŐ: A TITKOS TÁBLÁZAT (Ha már belépett)
  return (
    <div className="admin-page" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', paddingBottom: '50px' }}>
      <nav className="navbar" style={{ position: 'relative' }}>
        <Link to="/" className="logo-link">
          <img src={logoImg} alt="Emi Logo" className="logo-img" />
          <span className="logo-text">Massage <span style={{color: 'red', fontSize: '1rem'}}>| ADMIN</span></span>
        </Link>
        <button onClick={() => setIsLoggedIn(false)} className="nav-btn" style={{ backgroundColor: '#e74c3c', color: 'white' }}>Kijelentkezés</button>
      </nav>

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
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center' }}>Jelenleg nincs foglalásod.</td></tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px 20px', fontWeight: 'bold', color: '#E67E22' }}>
                      {format(new Date(appt.start_time), 'yyyy. MM. dd. - HH:mm')}
                    </td>
                    <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{appt.customer_name}</td>
                    <td style={{ padding: '15px 20px' }}>{appt.customer_phone}</td>
                    <td style={{ padding: '15px 20px' }}>{appt.service_name}</td>
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