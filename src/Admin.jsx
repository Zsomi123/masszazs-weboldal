import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './App.css';
import logoImg from './assets/logo.png';

function Admin() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]); // ÚJ: Szolgáltatások listája
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // --- ÁLLAPOTOK A FOGLALÁSOK SZERKESZTÉSÉHEZ ---
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({ customer_name: '', customer_phone: '' });

  // --- ÚJ: ÁLLAPOTOK A SZOLGÁLTATÁSOK KEZELÉSÉHEZ ---
  const [newService, setNewService] = useState({ name: '', duration: '', price: '' });
  const [editServiceId, setEditServiceId] = useState(null);
  const [editServiceData, setEditServiceData] = useState({ name: '', duration: '', price: '' });

  // Adatok letöltése belépés után (Foglalások ÉS Szolgáltatások)
  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:5001/api/admin/appointments')
        .then(res => res.json())
        .then(data => setAppointments(data));
        
      fetch('http://localhost:5001/api/services') // A weboldal is ezt használja!
        .then(res => res.json())
        .then(data => setServices(data));
    }
  }, [isLoggedIn]);

  // --- BEJELENTKEZÉS LÓGIKA ---
  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    fetch('http://localhost:5001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }).then(res => res.json()).then(data => {
      if (data.success) setIsLoggedIn(true);
      else setErrorMsg(data.message);
    }).catch(() => setErrorMsg('Hiba a szerver kapcsolatban.'));
  };

  // ==========================================
  // FOGLALÁSOK KEZELÉSE (A korábbi kód)
  // ==========================================
  const handleDelete = (id) => {
    if (window.confirm("Biztosan törölni szeretnéd ezt a foglalást?")) {
      fetch(`http://localhost:5001/api/admin/appointments/${id}`, { method: 'DELETE' })
      .then(res => res.json()).then(data => {
        if (data.success) setAppointments(appointments.filter(appt => appt.id !== id));
      });
    }
  };

  const handleEditClick = (appt) => {
    setEditId(appt.id);
    setEditFormData({ customer_name: appt.customer_name, customer_phone: appt.customer_phone });
  };

  const handleSave = (id) => {
    fetch(`http://localhost:5001/api/admin/appointments/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editFormData)
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setAppointments(appointments.map(appt => appt.id === id ? { ...appt, ...editFormData } : appt));
        setEditId(null);
      }
    });
  };

  // ==========================================
  // ÚJ: SZOLGÁLTATÁSOK KEZELÉSE 
  // ==========================================
  
  // 1. Új szolgáltatás hozzáadása
  const handleAddService = (e) => {
    e.preventDefault();
    fetch('http://localhost:5001/api/admin/services', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newService)
    }).then(res => res.json()).then(data => {
      if (data.success) {
        alert("Sikeresen hozzáadva!");
        setNewService({ name: '', duration: '', price: '' });
        // Újratöltjük a listát a szerverről
        fetch('http://localhost:5001/api/services').then(res => res.json()).then(data => setServices(data));
      }
    });
  };

  // 2. Szolgáltatás törlése
  const handleDeleteService = (id) => {
    if (window.confirm("Biztosan törlöd ezt a szolgáltatást?")) {
      fetch(`http://localhost:5001/api/admin/services/${id}`, { method: 'DELETE' })
      .then(res => res.json()).then(data => {
        if (data.success) {
          setServices(services.filter(s => s.id !== id));
        } else {
          alert(data.message); // Kiírjuk, ha nem lehet törölni a foglalások miatt!
        }
      });
    }
  };

  // 3. Szolgáltatás szerkesztése
  const handleEditServiceClick = (service) => {
    setEditServiceId(service.id);
    setEditServiceData({ name: service.name, duration: service.duration, price: service.price });
  };

  const handleSaveService = (id) => {
    fetch(`http://localhost:5001/api/admin/services/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editServiceData)
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setServices(services.map(s => s.id === id ? { ...s, ...editServiceData } : s));
        setEditServiceId(null);
      }
    });
  };

  // --- KÉPERNYŐK ---
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
              <input type="text" placeholder="Felhasználónév" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} required />
              <input type="password" placeholder="Jelszó" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} required />
              <button type="submit" style={{ padding: '12px', backgroundColor: '#E67E22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Belépés a Főnöki Pultba</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '15px' }}><Link to="/" style={{ color: '#7f8c8d', textDecoration: 'none', fontSize: '0.9rem' }}>← Vissza a weboldalra</Link></div>
          </div>
        </div>
      );
  }

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
        
        {/* 1. SZEKCIÓ: FOGLALÁSOK (Régi rész) */}
        <h1 style={{ marginBottom: '20px', color: '#2c3e50' }}>🗓️ Közelgő Foglalások</h1>
        <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '50px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                <th style={{ padding: '15px 20px' }}>Dátum és Időpont</th>
                <th style={{ padding: '15px 20px' }}>Vendég neve</th>
                <th style={{ padding: '15px 20px' }}>Telefonszám</th>
                <th style={{ padding: '15px 20px' }}>Szolgáltatás</th>
                <th style={{ padding: '15px 20px', textAlign: 'center' }}>Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center' }}>Jelenleg nincs foglalásod.</td></tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid #eee', backgroundColor: editId === appt.id ? '#fdf8e3' : 'transparent' }}>
                    <td style={{ padding: '15px 20px', fontWeight: 'bold', color: '#E67E22' }}>{format(new Date(appt.start_time), 'yyyy. MM. dd. - HH:mm')}</td>
                    <td style={{ padding: '15px 20px' }}>
                      {editId === appt.id ? <input type="text" value={editFormData.customer_name} onChange={(e) => setEditFormData({...editFormData, customer_name: e.target.value})} style={{ padding: '8px', width: '100%' }} /> : <span style={{ fontWeight: 'bold' }}>{appt.customer_name}</span>}
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      {editId === appt.id ? <input type="text" value={editFormData.customer_phone} onChange={(e) => setEditFormData({...editFormData, customer_phone: e.target.value})} style={{ padding: '8px', width: '100%' }} /> : appt.customer_phone}
                    </td>
                    <td style={{ padding: '15px 20px' }}>{appt.service_name}</td>
                    <td style={{ padding: '15px 20px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {editId === appt.id ? (
                        <><button onClick={() => handleSave(appt.id)} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Mentés</button><button onClick={() => setEditId(null)} style={{ backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Mégse</button></>
                      ) : (
                        <><button onClick={() => handleEditClick(appt)} style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Szerkeszt</button><button onClick={() => handleDelete(appt.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Törlés</button></>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 2. SZEKCIÓ: SZOLGÁLTATÁSOK KEZELÉSE (Új rész) */}
        <h1 style={{ marginBottom: '20px', color: '#2c3e50', borderTop: '2px solid #ccc', paddingTop: '30px' }}>💆‍♀️ Szolgáltatások és Árlista</h1>
        
        {/* Új Hozzáadása Form */}
        <form onSubmit={handleAddService} style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <input type="text" placeholder="Masszázs neve (pl. Lávaköves)" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required style={{flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}} />
            <input type="number" placeholder="Perc (pl. 60)" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} required style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}} />
            <input type="number" placeholder="Ár (pl. 15000)" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} required style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}} />
            <button type="submit" style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>+ Új hozzáadása</button>
        </form>

        {/* Szolgáltatások Táblázata */}
        <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                <th style={{ padding: '15px 20px' }}>Név</th>
                <th style={{ padding: '15px 20px' }}>Időtartam (perc)</th>
                <th style={{ padding: '15px 20px' }}>Ár (Ft)</th>
                <th style={{ padding: '15px 20px', textAlign: 'center' }}>Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #eee', backgroundColor: editServiceId === s.id ? '#fdf8e3' : 'transparent' }}>
                  
                  {/* NÉV */}
                  <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>
                    {editServiceId === s.id ? <input type="text" value={editServiceData.name} onChange={e => setEditServiceData({...editServiceData, name: e.target.value})} style={{ padding: '8px', width: '100%' }} /> : s.name}
                  </td>
                  
                  {/* IDŐTARTAM */}
                  <td style={{ padding: '15px 20px' }}>
                     {editServiceId === s.id ? <input type="number" value={editServiceData.duration} onChange={e => setEditServiceData({...editServiceData, duration: e.target.value})} style={{ padding: '8px', width: '100%' }} /> : `${s.duration} perc`}
                  </td>

                  {/* ÁR */}
                  <td style={{ padding: '15px 20px', color: '#27ae60', fontWeight: 'bold' }}>
                     {editServiceId === s.id ? <input type="number" value={editServiceData.price} onChange={e => setEditServiceData({...editServiceData, price: e.target.value})} style={{ padding: '8px', width: '100%' }} /> : `${s.price} Ft`}
                  </td>

                  {/* GOMBOK */}
                  <td style={{ padding: '15px 20px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                     {editServiceId === s.id ? (
                        <><button onClick={() => handleSaveService(s.id)} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Mentés</button><button onClick={() => setEditServiceId(null)} style={{ backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Mégse</button></>
                      ) : (
                        <><button onClick={() => handleEditServiceClick(s)} style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Szerkeszt</button><button onClick={() => handleDeleteService(s.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Törlés</button></>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Admin;