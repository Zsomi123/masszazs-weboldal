import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { hu } from 'date-fns/locale';
import './App.css';
import logoImg from './assets/logo.png';

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedAppt, setSelectedAppt] = useState(null);

  // --- ÚJ ÁLLAPOTOK A KÉZI BESZÚRÁSHOZ ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminAppt, setNewAdminAppt] = useState({
    service_id: '',
    customer_name: '',
    customer_phone: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00'
  });

  const [newService, setNewService] = useState({ name: '', duration: '', price: '' });
  const [editServiceId, setEditServiceId] = useState(null);
  const [editServiceData, setEditServiceData] = useState({ name: '', duration: '', price: '' });

  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:5001/api/services')
        .then(res => res.json())
        .then(data => {
            setServices(data);
            // Ha letöltöttük a masszázsokat, alapból kiválasztjuk az elsőt az új foglalás formban
            if (data.length > 0) setNewAdminAppt(prev => ({ ...prev, service_id: data[0].id }));
        });
      fetchAppointments();
    }
  }, [isLoggedIn, currentWeekStart]);

  const fetchAppointments = () => {
    const start = format(currentWeekStart, 'yyyy-MM-dd');
    const end = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
    fetch(`http://localhost:5001/api/admin/appointments/range?start=${start}&end=${end}`)
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error(err));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    fetch('http://localhost:5001/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
    }).then(res => res.json()).then(data => {
      if (data.success) setIsLoggedIn(true);
      else setErrorMsg(data.message);
    });
  };

  const handleDeleteAppt = (id) => {
    if (window.confirm("Biztosan törlöd ezt a foglalást?")) {
      fetch(`http://localhost:5001/api/admin/appointments/${id}`, { method: 'DELETE' })
      .then(res => res.json()).then(data => {
        if (data.success) {
          setAppointments(appointments.filter(a => a.id !== id));
          setSelectedAppt(null);
        }
      });
    }
  };

  // --- ÚJ FÜGGVÉNY: KÉZI BESZÚRÁS A NAPTÁRBA ---
  const handleAdminAddAppt = (e) => {
    e.preventDefault();
    const start_time = `${newAdminAppt.date}T${newAdminAppt.time}:00`;

    // Ugyanazt az okos végpontot hívjuk, amit a publikus weboldal is használ!
    fetch('http://localhost:5001/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            service_id: newAdminAppt.service_id,
            customer_name: newAdminAppt.customer_name,
            customer_phone: newAdminAppt.customer_phone,
            start_time: start_time
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === "Sikeres foglalás!") {
            setShowAddForm(false); // Bezárjuk az űrlapot
            fetchAppointments(); // Újratöltjük a naptárat, hogy megjelenjen a blokk!
            setNewAdminAppt({ ...newAdminAppt, customer_name: '', customer_phone: '' }); // Kiürítjük a neveket
        } else {
            alert(data.message); // Pl. "Ez az időpont már foglalt!"
        }
    })
    .catch(err => console.error("Hiba:", err));
  };

  // --- CMS ---
  // --- CMS ---
  const handleAddService = (e) => {
    e.preventDefault();
    fetch('http://localhost:5001/api/admin/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newService) })
    .then(res => res.json()).then(data => { if (data.success) { setNewService({ name: '', duration: '', price: '' }); fetch('http://localhost:5001/api/services').then(res => res.json()).then(data => setServices(data)); }});
  };

  const handleDeleteService = (id) => {
    if (window.confirm("Biztosan törlöd?")) {
      fetch(`http://localhost:5001/api/admin/services/${id}`, { method: 'DELETE' }).then(res => res.json()).then(data => { if (data.success) setServices(services.filter(s => s.id !== id)); else alert(data.message); });
    }
  };

  const handleSaveService = (id) => {
    fetch(`http://localhost:5001/api/admin/services/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editServiceData) })
    .then(res => res.json()).then(data => { if (data.success) { setServices(services.map(s => s.id === id ? { ...s, ...editServiceData } : s)); setEditServiceId(null); }});
  };

  // Ezt a függvényt kellett pótolni a Szerkeszt gomb működéséhez!
  const handleEditServiceClick = (service) => {
    setEditServiceId(service.id);
    setEditServiceData({
      name: service.name,
      duration: service.duration,
      price: service.price
    });
  };

  const startHour = 8;
  const endHour = 20;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}><img src={logoImg} alt="Logo" style={{ height: '60px', borderRadius: '5px' }} /><h2 style={{ marginTop: '10px', color: '#2c3e50' }}>Admin Belépés</h2></div>
          {errorMsg && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>❌ {errorMsg}</div>}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Felhasználónév" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} required />
            <input type="password" placeholder="Jelszó" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} required />
            <button type="submit" style={{ padding: '12px', backgroundColor: '#E67E22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Belépés a Főnöki Pultba</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', paddingBottom: '50px' }}>
      <nav className="navbar" style={{ position: 'relative' }}>
        <Link to="/" className="logo-link">
          <img src={logoImg} alt="Emi Logo" className="logo-img" />
          <span className="logo-text">Massage <span style={{color: 'red', fontSize: '1rem'}}>| ADMIN</span></span>
        </Link>
        <button onClick={() => setIsLoggedIn(false)} className="nav-btn" style={{ backgroundColor: '#e74c3c', color: 'white' }}>Kijelentkezés</button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* NAPTÁR FEJLÉC ÉS GOMBOK */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: '#2c3e50', margin: 0 }}>🗓️ Heti Naptár</h1>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                
                {/* ÚJ: FOGLALÁS HOZZÁADÁSA GOMB */}
                <button 
                  onClick={() => setShowAddForm(!showAddForm)} 
                  style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px', backgroundColor: '#27ae60', color: 'white', border: 'none', fontWeight: 'bold', marginRight: '15px' }}>
                  {showAddForm ? 'X Mégse' : '+ Új foglalás beszúrása'}
                </button>

                <button onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc' }}>← Előző</button>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {format(currentWeekStart, 'yyyy. MMM. dd.', { locale: hu })} - {format(addDays(currentWeekStart, 6), 'MMM. dd.', { locale: hu })}
                </span>
                <button onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc' }}>Következő →</button>
                <button onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px', backgroundColor: '#3498db', color: 'white', border: 'none', marginLeft: '10px' }}>Ma</button>
            </div>
        </div>

        {/* ÚJ: FOGLALÁS BESZÚRÁSA ŰRLAP (Csak akkor látszik, ha rányomtak a zöld gombra) */}
        {showAddForm && (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderLeft: '5px solid #27ae60' }}>
                <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Új időpont rögzítése</h3>
                <form onSubmit={handleAdminAddAppt} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '150px' }}>
                        <label style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Dátum</label>
                        <input type="date" value={newAdminAppt.date} onChange={e => setNewAdminAppt({...newAdminAppt, date: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '120px' }}>
                        <label style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Időpont</label>
                        <input type="time" value={newAdminAppt.time} onChange={e => setNewAdminAppt({...newAdminAppt, time: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 2, minWidth: '200px' }}>
                        <label style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Szolgáltatás</label>
                        <select value={newAdminAppt.service_id} onChange={e => setNewAdminAppt({...newAdminAppt, service_id: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                            {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} perc)</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 2, minWidth: '200px' }}>
                        <label style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Vendég neve</label>
                        <input type="text" placeholder="Pl. Kiss Anna" value={newAdminAppt.customer_name} onChange={e => setNewAdminAppt({...newAdminAppt, customer_name: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 2, minWidth: '150px' }}>
                        <label style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Telefonszám</label>
                        <input type="text" placeholder="+36 30..." value={newAdminAppt.customer_phone} onChange={e => setNewAdminAppt({...newAdminAppt, customer_phone: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    </div>

                    <button type="submit" style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', height: '40px' }}>Mentés a naptárba</button>
                </form>
            </div>
        )}

        {/* KIVÁLASZTOTT FOGLALÁS TÖRLÉSE */}
        {selectedAppt && (
            <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '5px solid #f39c12', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <strong>Kiválasztott foglalás: </strong> 
                    {selectedAppt.customer_name} ({selectedAppt.customer_phone}) - {selectedAppt.service_name} 
                    <span style={{ color: '#E67E22', marginLeft: '10px' }}>🕒 {format(new Date(selectedAppt.start_time), 'HH:mm')}</span>
                </div>
                <button onClick={() => handleDeleteAppt(selectedAppt.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Törlés</button>
            </div>
        )}

        {/* A NAPTÁR RÁCS */}
        <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
            <div style={{ width: '60px', borderRight: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
                <div style={{ height: '50px', borderBottom: '1px solid #e0e0e0' }}></div>
                {hours.map(h => (
                    <div key={`time-${h}`} style={{ height: '60px', borderBottom: '1px solid #e0e0e0', textAlign: 'center', fontSize: '0.8rem', color: '#7f8c8d', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '-10px', left: '10px', backgroundColor: '#fafafa', padding: '0 2px' }}>{h}:00</span>
                    </div>
                ))}
            </div>

            {weekDays.map(day => {
                const isToday = isSameDay(day, new Date());
                return (
                <div key={day.toString()} style={{ flex: 1, borderRight: '1px solid #e0e0e0', position: 'relative' }}>
                    <div style={{ height: '50px', borderBottom: '1px solid #e0e0e0', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: isToday ? '#e8f4fd' : 'white' }}>
                        <span style={{ fontSize: '0.8rem', color: '#7f8c8d', textTransform: 'uppercase' }}>{format(day, 'EEEE', { locale: hu })}</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isToday ? '#3498db' : '#2c3e50' }}>{format(day, 'dd')}</span>
                    </div>

                    {hours.map(h => <div key={`line-${h}`} style={{ height: '60px', borderBottom: '1px solid #f5f5f5' }}></div>)}

                    {/* Foglalások (Blokkok) rajzolása az adott napra */}
{/* Foglalások (Blokkok) rajzolása az adott napra */}
{appointments.filter(a => isSameDay(new Date(a.start_time), day)).map(appt => {
    const start = new Date(appt.start_time);
    
    const topPosition = ((start.getHours() - startHour) * 60) + start.getMinutes() + 50;
    
    // VISSZAÁLLÍTVA: A magasság újra a masszázs pontos hossza (1 perc = 1 pixel)
    const height = appt.duration; 
    
    // ÚJ LOGIKA: Ha a masszázs 35 perces vagy annál rövidebb, ezt "rövidnek" számítjuk
    const isShort = height <= 35;
    
    return (
        <div 
            key={appt.id} 
            onClick={() => setSelectedAppt(appt)}
            style={{ 
                position: 'absolute', 
                top: `${topPosition}px`, 
                left: '2px', 
                right: '2px', 
                height: `${height}px`, 
                backgroundColor: selectedAppt?.id === appt.id ? '#f39c12' : '#3498db', 
                color: 'white', 
                borderRadius: '4px', 
                padding: isShort ? '0 6px' : '4px 6px', // Rövidnél kivesszük a felső/alsó margót
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)', 
                cursor: 'pointer', 
                overflow: 'hidden', 
                zIndex: 10,
                border: '1px solid rgba(0,0,0,0.1)',
                display: 'flex',
                // OKOS ELRENDEZÉS: Ha rövid, akkor egymás mellé (row), ha hosszú, egymás alá (column)
                flexDirection: isShort ? 'row' : 'column',
                alignItems: isShort ? 'center' : 'flex-start',
                gap: isShort ? '8px' : '2px', // Két szöveg közötti távolság
                lineHeight: '1.1'
            }}
        >
            <div style={{ fontWeight: 'bold', fontSize: '0.75rem', opacity: 0.9 }}>
                {format(start, 'HH:mm')}
            </div>
            <div style={{ 
                fontWeight: 'bold', 
                fontSize: isShort ? '0.75rem' : '0.85rem', // Rövid doboznál icipicit kisebb betű
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden' 
            }}>
                {appt.customer_name}
            </div>
        </div>
    );
})}
                </div>
            )})}
        </div>

        {/* CMS RÉSZ */}
        <h1 style={{ marginTop: '60px', marginBottom: '20px', color: '#2c3e50', borderTop: '2px solid #ccc', paddingTop: '30px' }}>💆‍♀️ Szolgáltatások és Árlista</h1>
        <form onSubmit={handleAddService} style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <input type="text" placeholder="Masszázs neve" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required style={{flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}} />
            <input type="number" placeholder="Perc" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} required style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}} />
            <input type="number" placeholder="Ár" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} required style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}} />
            <button type="submit" style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>+ Új hozzáadása</button>
        </form>

        <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                <th style={{ padding: '15px 20px' }}>Név</th>
                <th style={{ padding: '15px 20px' }}>Időtartam</th>
                <th style={{ padding: '15px 20px' }}>Ár</th>
                <th style={{ padding: '15px 20px', textAlign: 'center' }}>Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{editServiceId === s.id ? <input type="text" value={editServiceData.name} onChange={e => setEditServiceData({...editServiceData, name: e.target.value})} style={{ padding: '8px', width: '100%' }} /> : s.name}</td>
                  <td style={{ padding: '15px 20px' }}>{editServiceId === s.id ? <input type="number" value={editServiceData.duration} onChange={e => setEditServiceData({...editServiceData, duration: e.target.value})} style={{ padding: '8px', width: '100%' }} /> : `${s.duration} perc`}</td>
                  <td style={{ padding: '15px 20px', color: '#27ae60', fontWeight: 'bold' }}>{editServiceId === s.id ? <input type="number" value={editServiceData.price} onChange={e => setEditServiceData({...editServiceData, price: e.target.value})} style={{ padding: '8px', width: '100%' }} /> : `${s.price} Ft`}</td>
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