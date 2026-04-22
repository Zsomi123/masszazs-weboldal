import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import { format, parseISO, isBefore, addMinutes, startOfDay } from 'date-fns';
import './App.css';
import logoImg from './assets/logo.png';

function Booking() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', serviceId: '' });
  const [message, setMessage] = useState('');
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd'); 
    
    fetch(`http://localhost:5001/api/appointments/${formattedDate}`)
      .then(res => res.json())
      .then(data => setBookedSlots(data))
      .catch(err => console.error("Hiba a napi foglalások letöltésekor:", err));
      
    setSelectedTime(null); 
  }, [selectedDate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateTimeSlots = () => {
    const slots = [];
    let currentTime = new Date(selectedDate);
    currentTime.setHours(8, 0, 0, 0); 
    const endTime = new Date(selectedDate);
    endTime.setHours(18, 0, 0, 0); 

    const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
    const duration = selectedService ? selectedService.duration : 0;

    while (currentTime < endTime) {
      const slotStart = new Date(currentTime);
      const slotEnd = addMinutes(slotStart, duration);
      
      let isBooked = false;
      for (let booking of bookedSlots) {
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);
        if (slotStart < bookingEnd && slotEnd > bookingStart) {
          isBooked = true;
          break;
        }
      }

      const isPast = isBefore(slotStart, new Date());
      
      if (!isBooked && !isPast && duration > 0) {
        slots.push(format(slotStart, 'HH:mm'));
      }
      
      currentTime = addMinutes(currentTime, 30);
    }
    return slots;
  };

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
        start_time: start_time,
        source: 'online'
      })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success || data.message === "Sikeres foglalás!") {
            setMessage('🎉 Sikeres foglalás! Hamarosan várunk.');
            setFormData({ name: '', phone: '', serviceId: '' });
            setSelectedTime(null);
            setSelectedDate(new Date(selectedDate)); 
        } else {
            setMessage(`❌ ${data.message}`);
        }
    })
    .catch(err => {
        console.error("Hiba:", err);
        setMessage('❌ Hiba történt a foglalás során. Ellenőrizd az internetkapcsolatot!');
    });
  };

  return (
    <div className="booking-page" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      {/* Reszponzív Navbar */}
      <nav className="navbar" style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Link to="/" className="logo-link" style={{ textDecoration: 'none', color: '#2c3e50', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <img src={logoImg} alt="Emi Logo" className="logo-img" style={{ height: '40px', marginRight: '10px' }} />
          <span className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Massage</span>
        </Link>
        <Link to="/" className="nav-btn" style={{ textDecoration: 'none', backgroundColor: '#34495e', color: 'white', padding: '8px 15px', borderRadius: '5px', fontSize: '0.9rem' }}>Vissza a főoldalra</Link>
      </nav>

      {/* Fő tartalom */}
      <div className="booking-container" style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center', boxSizing: 'border-box' }}>
        
        {/* BAL OLDAL: Személyes adatok */}
        <div style={{ flex: '1 1 300px', backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
          <h2 style={{ color: '#2c3e50', marginTop: 0, fontSize: '1.5rem', borderBottom: '2px solid #E67E22', paddingBottom: '10px' }}>1. Adataid és Szolgáltatás</h2>
          
          {message && <div style={{ padding: '15px', backgroundColor: message.includes('❌') ? '#f8d7da' : '#d4edda', color: message.includes('❌') ? '#721c24' : '#155724', borderRadius: '5px', marginBottom: '20px', fontWeight: 'bold' }}>{message}</div>}

          <form id="bookingForm" onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label style={{ fontWeight: 'bold', color: '#34495e', marginBottom: '5px', display: 'block' }}>Teljes név:</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem' }} />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 'bold', color: '#34495e', marginBottom: '5px', display: 'block' }}>Telefonszám:</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem' }} />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 'bold', color: '#34495e', marginBottom: '5px', display: 'block' }}>Választott masszázs:</label>
              <select name="serviceId" value={formData.serviceId} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem', backgroundColor: 'white' }}>
                <option value="">Válassz szolgáltatást...</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.duration} perc) - {s.price} Ft</option>
                ))}
              </select>
            </div>
            
            <button type="submit" disabled={!selectedTime} className="cta-button" style={{ 
                width: '100%', padding: '15px', marginTop: '10px', backgroundColor: '#E67E22', color: 'white', 
                border: 'none', borderRadius: '5px', cursor: selectedTime ? 'pointer' : 'not-allowed', 
                fontWeight: 'bold', fontSize: '1.1rem', boxSizing: 'border-box', transition: 'all 0.3s',
                opacity: selectedTime ? 1 : 0.5 
              }}>
              {selectedTime ? `Foglalás véglegesítése ${selectedTime}-ra` : 'Válassz időpontot a naptárból'}
            </button>
          </form>
        </div>

        {/* JOBB OLDAL: Naptár és Időpontok */}
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
          <h2 style={{ color: '#2c3e50', marginTop: 0, fontSize: '1.5rem', width: '100%', borderBottom: '2px solid #3498db', paddingBottom: '10px', textAlign: 'left' }}>2. Dátum és Időpont</h2>
          
          {/* Naptár tároló - a 100% szélesség miatt mobilon is befér */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden', width: '100%', maxWidth: '350px' }}>
              <Calendar 
                onChange={setSelectedDate} 
                value={selectedDate} 
                minDate={new Date()} 
                tileDisabled={({ date }) => date.getDay() === 0 || date.getDay() === 6} // Hétvégék kikapcsolva
              />
            </div>
          </div>

          {/* Időpont Gombok */}
          <div style={{ width: '100%', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', color: '#34495e' }}>
              Szabad időpontok ekkor: {format(selectedDate, 'yyyy. MM. dd.')}
            </h3>
            
            {!formData.serviceId ? (
               <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '5px', borderLeft: '5px solid #f39c12' }}>
                   <p style={{ color: '#e67e22', fontWeight: 'bold', margin: 0 }}>Kérlek előbb válassz masszázst a bal oldalon!</p>
               </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', width: '100%' }}>
                {generateTimeSlots().length > 0 ? (
                  generateTimeSlots().map(time => (
                    <button 
                      key={time} 
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      style={{ 
                        padding: '12px 5px', 
                        border: selectedTime === time ? '2px solid #E67E22' : '1px solid #ccc',
                        backgroundColor: selectedTime === time ? '#FFF5E6' : 'white',
                        color: selectedTime === time ? '#E67E22' : '#333',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: selectedTime === time ? 'bold' : 'normal',
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        width: '100%'
                      }}
                    >
                      {time}
                    </button>
                  ))
                ) : (
                  <p style={{ gridColumn: '1 / -1', color: '#e74c3c', fontWeight: 'bold', padding: '10px', backgroundColor: '#fdfaef', borderRadius: '5px' }}>
                    Sajnos erre a napra már nincs szabad időpontunk.
                  </p>
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