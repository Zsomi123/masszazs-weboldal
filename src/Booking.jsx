import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import logoImg from './assets/logo.png';

function Booking() {
  const [services, setServices] = useState([]);
  
  // 1. Állapotok (dobozok) az űrlap adatainak tárolására
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceId: '',
    date: '',
    time: ''
  });

  // Üzenet a felhasználónak (pl. Sikeres foglalás!)
  const [message, setMessage] = useState('');

  // Szolgáltatások betöltése (Ez már megvolt és működik)
  useEffect(() => {
    fetch('http://localhost:5001/api/services')
      .then(response => response.json())
      .then(data => setServices(data))
      .catch(error => console.error(error));
  }, []);

  // 2. Ez a függvény fut le, amikor valaki gépel az űrlapba
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 3. Ez fut le, amikor rányomnak a "Foglalás" gombra
  const handleSubmit = (e) => {
    e.preventDefault(); // Megakadályozza, hogy az oldal újratöltsön
    
    // Összerakjuk a dátumot és az időt egy formátumba a MySQL-nek (ÉÉÉÉ-HH-NN ÓÓ:PP:00)
    const start_time = `${formData.date} ${formData.time}:00`;

    // Elküldjük az adatokat a Backendnek
    fetch('http://localhost:5001/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: formData.serviceId,
        customer_name: formData.name,
        customer_phone: formData.phone,
        start_time: start_time
      })
    })
    .then(response => response.json())
    .then(data => {
        setMessage('🎉 Sikeres foglalás! Hamarosan várunk.');
        // Opcionális: Űrlap kiürítése sikeres foglalás után
        setFormData({ name: '', phone: '', serviceId: '', date: '', time: '' });
    })
    .catch(error => {
        console.error('Hiba:', error);
        setMessage('❌ Hiba történt a foglalás során.');
    });
  };

  return (
    <div className="booking-page">
      <nav className="navbar">
        <Link to="/" className="logo-link">
          <img src={logoImg} alt="Emi Logo" className="logo-img" />
          <span className="logo-text">Massage</span>
        </Link>
        <Link to="/" className="nav-btn">Vissza a főoldalra</Link>
      </nav>

      <div className="booking-container" style={{ marginTop: '100px', padding: '20px', textAlign: 'center' }}>
        <h2>Időpontfoglalás</h2>
        <p>Kérlek, add meg az adataidat és a kívánt szolgáltatást!</p>

        {/* Ha van üzenet (siker/hiba), azt kiírjuk ide */}
        {message && <div style={{ padding: '15px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '20px' }}>{message}</div>}

        {/* Fontos: Itt hívjuk meg a handleSubmit-et */}
        <form onSubmit={handleSubmit} className="booking-form" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Teljes név:</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Telefonszám:</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '10px' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Választott masszázs:</label>
            <select name="serviceId" value={formData.serviceId} onChange={handleInputChange} required style={{ width: '100%', padding: '10px' }}>
              <option value="">Válassz szolgáltatást...</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.duration} perc) - {service.price} Ft
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
                <label>Dátum:</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required style={{ width: '100%', padding: '10px' }} />
            </div>
            <div style={{ flex: 1 }}>
                <label>Időpont (óra:perc):</label>
                <input type="time" name="time" value={formData.time} onChange={handleInputChange} required style={{ width: '100%', padding: '10px' }} />
            </div>
          </div>

          <button type="submit" className="cta-button submit-btn" style={{ width: '100%' }}>
            Foglalás véglegesítése
          </button>
        </form>
      </div>
    </div>
  );
}

export default Booking;