import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import { format, isBefore, addMinutes } from 'date-fns';
import '../App.css';
import logoImg from '../assets/logo.png';

function Booking() {
  const [services, setServices] = useState([]);
const [formData, setFormData] = useState({ name: '', email: '', phone: '', serviceId: '' });
  const [message, setMessage] = useState('');
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);

  // Kiszámoljuk a "holnapután" dátumát a naptár korlátozásához
// Kiszámoljuk a "holnapután" dátumát (Objektumként, ahogy a react-calendar szereti)
  const today = new Date();
  const minAllowedDateObj = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

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

  const selectService = (id) => {
    setFormData({ ...formData, serviceId: id });
    setSelectedTime(null); // Ha váltunk szolgáltatást, az időpontot újra kell választani a hossza miatt
  };

  const generateTimeSlots = () => {
    const slots = [];
    let currentTime = new Date(selectedDate);
    currentTime.setHours(8, 0, 0, 0); // Kezdés reggel 8:00-kor
    
    const endTime = new Date(selectedDate);
    endTime.setHours(18, 0, 0, 0); // Befejezés 18:00-kor

    const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
    const duration = selectedService ? selectedService.duration : 0;

    // A "currentTime <= endTime" biztosítja, hogy a 18:00 is bekerüljön a listába
    while (currentTime <= endTime) {
      const slotStart = new Date(currentTime);
      const slotEnd = addMinutes(slotStart, duration);
      
      let isBooked = false;
      for (let booking of bookedSlots) {
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);
        
        // Ütközésvizsgálat
        if (slotStart < bookingEnd && slotEnd > bookingStart) {
          isBooked = true;
          break;
        }
      }

      const isPast = isBefore(slotStart, new Date());
      
      // Csak akkor adjuk hozzá, ha nem foglalt, nem múlt el, és van választott szolgáltatás
      if (!isBooked && !isPast && duration > 0) {
        slots.push(format(slotStart, 'HH:mm'));
      }

      // LÉPÉSKÖZ MÓDOSÍTÁSA: 30-ról 60 percre (így csak egész órák lesznek)
      currentTime = addMinutes(currentTime, 60);
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
        customer_email: formData.email,
        customer_phone: formData.phone,
        start_time: start_time,
        source: 'online'
      })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success || data.message === "Sikeres foglalás!") {
    setMessage('🎉 Sikeres foglalás! Hamarosan várunk.');
    // ITT A JAVÍTÁS: add hozzá az email: ''-t is!
    setFormData({ name: '', email: '', phone: '', serviceId: '' }); 
    setSelectedTime(null);
    setSelectedDate(new Date(selectedDate)); 
}else {
            setMessage(`❌ ${data.message}`);
        }
    })
    .catch(err => {
        console.error("Hiba:", err);
        setMessage('❌ Hiba történt a foglalás során.');
    });
  };

  return (
    <div className="booking-page" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', paddingBottom: '50px' }}>
      <nav className="navbar" style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Link to="/" className="logo-link" style={{ textDecoration: 'none', color: '#2c3e50', display: 'flex', alignItems: 'center' }}>
          <img src={logoImg} alt="Emi Logo" className="logo-img" style={{ height: '40px', marginRight: '10px' }} />
          <span className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Massage</span>
        </Link>
        <Link to="/" className="nav-btn" style={{ textDecoration: 'none', backgroundColor: '#34495e', color: 'white', padding: '8px 15px', borderRadius: '5px', fontSize: '0.9rem' }}>Vissza a főoldalra</Link>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
        <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '40px' }}>Időpontfoglalás</h1>
        
        {message && <div style={{ maxWidth: '600px', margin: '0 auto 20px auto', padding: '15px', backgroundColor: message.includes('❌') ? '#f8d7da' : '#d4edda', color: message.includes('❌') ? '#721c24' : '#155724', borderRadius: '10px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>{message}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* 1. SZOLGÁLTATÁS VÁLASZTÁS KÁRTYÁKKAL */}
          <section style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#2c3e50', fontSize: '1.4rem', marginBottom: '20px', borderLeft: '5px solid #E67E22', paddingLeft: '15px' }}>1. Válaszd ki a szolgáltatást</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
              {services.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => selectService(s.id)}
                  style={{ 
                    padding: '20px', 
                    borderRadius: '12px', 
                    border: formData.serviceId === s.id ? '3px solid #E67E22' : '1px solid #eee',
                    backgroundColor: formData.serviceId === s.id ? '#fff9f2' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    boxShadow: formData.serviceId === s.id ? '0 5px 15px rgba(230, 126, 34, 0.15)' : 'none'
                  }}
                >
                  {formData.serviceId === s.id && <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#E67E22', fontWeight: 'bold' }}>✓</div>}
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#2c3e50' }}>{s.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>🕒 {s.duration} perc</span>
                    <span style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.1rem' }}>{s.price} Ft</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
            
            {/* 2. ADATOK ÉS FOGLALÁS */}
            <section style={{ flex: '1 1 350px', backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.4rem', marginBottom: '20px', borderLeft: '5px solid #3498db', paddingLeft: '15px' }}>2. Adataid</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Teljes név</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Minta Aladár" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Telefonszám</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+36 30 123 4567" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Email cím</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="pelda@email.hu" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
                
                <button type="submit" disabled={!selectedTime || !formData.serviceId} style={{ 
                  marginTop: '10px', width: '100%', padding: '15px', backgroundColor: '#E67E22', color: 'white', 
                  border: 'none', borderRadius: '8px', cursor: (selectedTime && formData.serviceId) ? 'pointer' : 'not-allowed', 
                  fontWeight: 'bold', fontSize: '1.1rem', opacity: (selectedTime && formData.serviceId) ? 1 : 0.5 
                }}>
                  {selectedTime ? `Foglalás: ${selectedTime}` : 'Válassz időpontot!'}
                </button>
              </form>
            </section>

            {/* 3. NAPTÁR ÉS IDŐPONTOK */}
            <section style={{ flex: '2 1 450px', backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <h2 style={{ color: '#2c3e50', fontSize: '1.4rem', marginBottom: '20px', borderLeft: '5px solid #27ae60', paddingLeft: '15px', textAlign: 'left' }}>3. Időpont választás</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                <div style={{ flex: '0 0 auto' }}>
                  <Calendar 
  onChange={setSelectedDate}
  value={selectedDate} 
  minDate={minAllowedDateObj} /* <-- ITT ADJUK ÁT AZ ÚJ, HOLNAPUTÁNI DÁTUMOT */
  tileDisabled={({ date }) => date.getDay() === 0 || date.getDay() === 6}
/>
                </div>
                <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#7f8c8d' }}>Szabad sávok: {format(selectedDate, 'yyyy. MM. dd.')}</h4>
                  {!formData.serviceId ? (
                    <div style={{ padding: '20px', color: '#e67e22', fontWeight: 'bold' }}>Válassz masszázst felül!</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                      {generateTimeSlots().map(time => (
                        <button 
                          key={time} 
                          onClick={() => setSelectedTime(time)}
                          style={{ 
                            padding: '10px 5px', border: selectedTime === time ? '2px solid #E67E22' : '1px solid #eee',
                            backgroundColor: selectedTime === time ? '#FFF5E6' : 'white',
                            color: selectedTime === time ? '#E67E22' : '#333',
                            borderRadius: '6px', cursor: 'pointer', transition: '0.2s'
                          }}
                        >
                          {time}
                        </button>
                      ))}
                      {generateTimeSlots().length === 0 && <p style={{ color: '#e74c3c', fontSize: '0.9rem' }}>Nincs szabad hely.</p>}
                    </div>
                  )}
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;