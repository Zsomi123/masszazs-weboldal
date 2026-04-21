import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar'; // A naptár modul
import 'react-calendar/dist/Calendar.css'; // A naptár alap stílusai
import { format, parseISO, isBefore, addMinutes, startOfDay } from 'date-fns';
import './App.css';
import logoImg from './assets/logo.png';

function Booking() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', serviceId: '' });
  const [message, setMessage] = useState('');
  
  // ÚJ ÁLLAPOTOK A NAPTÁRHOZ
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);

  // 1. Szolgáltatások betöltése induláskor
  useEffect(() => {
    fetch('http://localhost:5001/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error(err));
  }, []);

  // 2. Foglalt időpontok letöltése, ha új napra kattintanak
  useEffect(() => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd'); // Pl. 2026-10-12
    
    fetch(`http://localhost:5001/api/appointments/${formattedDate}`)
      .then(res => res.json())
      .then(data => setBookedSlots(data))
      .catch(err => console.error("Hiba a napi foglalások letöltésekor:", err));
      
    setSelectedTime(null); // Új napnál töröljük a kiválasztott órát
  }, [selectedDate]);

  // Szöveges mezők kezelése
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. IDŐPONTOK GENERÁLÁSA (8:00-tól 18:00-ig, fél óránként)
  const generateTimeSlots = () => {
    const slots = [];
    let currentTime = new Date(selectedDate);
    currentTime.setHours(8, 0, 0, 0); // Kezdés: 08:00
    const endTime = new Date(selectedDate);
    endTime.setHours(18, 0, 0, 0); // Zárás: 18:00

    // Ha a felhasználó még nem választott masszázst, nem tudjuk mekkora hely kell neki
    const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
    const duration = selectedService ? selectedService.duration : 0;

    while (currentTime < endTime) {
      const slotStart = new Date(currentTime);
      const slotEnd = addMinutes(slotStart, duration);
      
      // Megnézzük, hogy ez az időpont ütközik-e valakivel az adatbázisból
      let isBooked = false;
      for (let booking of bookedSlots) {
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);
        // Ütközés logikája
        if (slotStart < bookingEnd && slotEnd > bookingStart) {
          isBooked = true;
          break;
        }
      }

      // Csak akkor rakjuk ki gombként, ha a jövőben van és nincs lefoglalva
      const isPast = isBefore(slotStart, new Date());
      
      if (!isBooked && !isPast && duration > 0) {
        slots.push(format(slotStart, 'HH:mm'));
      }
      
      // Fél órával ugrunk előre
      currentTime = addMinutes(currentTime, 30);
    }
    return slots;
  };

  // 4. Foglalás elküldése
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTime) {
      alert("Kérlek válassz egy szabad időpontot a naptárból!");
      return;
    }

    const start_time = `${format(selectedDate, 'yyyy-MM-dd')} ${selectedTime}:00`;

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
    .then(res => res.json())
    .then(data => {
        if(data.message.includes("foglalt")) {
            setMessage(`❌ ${data.message}`);
        } else {
            setMessage('🎉 Sikeres foglalás! Hamarosan várunk.');
            setFormData({ name: '', phone: '', serviceId: '' });
            setSelectedTime(null);
            // Frissítjük a naptárat, hogy rögtön eltűnjön a most lefoglalt időpont
            setSelectedDate(new Date(selectedDate)); 
        }
    })
    .catch(err => setMessage('❌ Hiba történt a foglalás során.'));
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

      <div className="booking-container" style={{ marginTop: '100px', padding: '20px', maxWidth: '1000px', margin: '100px auto', display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
        
        {/* BAL OLDAL: Személyes adatok */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h2>1. Adataid és Szolgáltatás</h2>
          {message && <div style={{ padding: '15px', backgroundColor: message.includes('❌') ? '#f8d7da' : '#d4edda', color: message.includes('❌') ? '#721c24' : '#155724', borderRadius: '5px', marginBottom: '20px' }}>{message}</div>}

          <form id="bookingForm" onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Teljes név:</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Telefonszám:</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Választott masszázs:</label>
              <select name="serviceId" value={formData.serviceId} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                <option value="">Válassz szolgáltatást...</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.duration} perc) - {s.price} Ft</option>
                ))}
              </select>
            </div>
            
            <button type="submit" disabled={!selectedTime || (selectedDate.getDay() === 0 || selectedDate.getDay() === 6)} className="cta-button" style={{ width: '100%', opacity: selectedTime ? 1 : 0.5 }}>
              {selectedTime ? `Foglalás ${selectedTime}-ra` : 'Válassz időpontot a naptárból'}
            </button>
          </form>
        </div>

        {/* JOBB OLDAL: Naptár és Időpontok */}
        <div style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2>2. Dátum és Időpont</h2>
          
          {/* Maga a Naptár */}
          <div style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
            <Calendar 
              onChange={setSelectedDate} 
              value={selectedDate} 
              minDate={new Date()} // Nem lehet a múltba foglalni!
              // ÚJ: Hétvégék kiszürkítése és letiltása
              tileDisabled={({ date, view }) => view === 'month' && (date.getDay() === 0 || date.getDay() === 6)}
            />
          </div>

          {/* Időpont Gombok vagy Figyelmeztetés */}
          <div style={{ width: '100%', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>
              Szabad időpontok ekkor: {format(selectedDate, 'yyyy. MM. dd.')}
            </h3>
            
            {/* ÚJ: Ha hétvége van kiválasztva (pl. ma szombat van, és az az alapértelmezett) */}
            {selectedDate && (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) ? (
               <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '15px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #f87171' }}>
                  Sajnáljuk, de hétvégén zárva tartunk! Kérjük, válassz egy hétköznapi napot a naptárban.
               </div>
            ) : !formData.serviceId ? (
               <p style={{ color: '#E67E22', fontWeight: 'bold' }}>Kérlek előbb válassz masszázst a bal oldalon!</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                {generateTimeSlots().length > 0 ? (
                  generateTimeSlots().map(time => (
                    <button 
                      key={time} 
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      style={{ 
                        padding: '10px', 
                        border: selectedTime === time ? '2px solid #E67E22' : '1px solid #ccc',
                        backgroundColor: selectedTime === time ? '#FFF5E6' : 'white',
                        color: selectedTime === time ? '#E67E22' : '#333',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: selectedTime === time ? 'bold' : 'normal',
                        transition: 'all 0.2s'
                      }}
                    >
                      {time}
                    </button>
                  ))
                ) : (
                  <p style={{ gridColumn: '1 / -1', color: 'red' }}>Sajnos erre a napra már nincs szabad időpontunk.</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Booking;