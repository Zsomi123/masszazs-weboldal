import { useState, useEffect } from 'react';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import { format, isBefore, addMinutes } from 'date-fns';
import '../App.css';
import './Booking.css'; // <-- AZ ÚJ CSS IMPORTÁLÁSA
import Navbar from '../components/Navbar';
import { useSearchParams } from 'react-router-dom';

function Booking() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', serviceId: '' });
  const [searchParams] = useSearchParams();
  const preSelectedId = searchParams.get('serviceId'); // Kiolvassuk a "serviceId" értéket

  // Figyeljük, ha van előre kiválasztott ID az URL-ben
  useEffect(() => {
    if (preSelectedId) {
      // Beállítjuk a formban a szolgáltatást (számmá alakítva)
      setFormData(prev => ({ ...prev, serviceId: parseInt(preSelectedId) }));
    }
  }, [preSelectedId]);
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);

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
    setSelectedTime(null);
  };

  const generateTimeSlots = () => {
    const slots = [];
    let currentTime = new Date(selectedDate);
    currentTime.setHours(8, 0, 0, 0);
    const endTime = new Date(selectedDate);
    endTime.setHours(18, 0, 0, 0);
    const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
    const duration = selectedService ? selectedService.duration : 0;

    while (currentTime <= endTime) {
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
          setFormData({ name: '', email: '', phone: '', serviceId: '' }); 
          setSelectedTime(null);
          setSelectedDate(new Date(selectedDate)); 
        } else {
            setMessage(`❌ ${data.message}`);
        }
    })
    .catch(err => {
        console.error("Hiba:", err);
        setMessage('❌ Hiba történt a foglalás során.');
    });
  };

  return (
    <div className="booking-page">
      <Navbar />

      <div className="booking-container">
        <h1 className="booking-title">Időpontfoglalás</h1>
        
        {message && (
          <div className={`alert-message ${message.includes('❌') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <div className="booking-layout">
          
          {/* 1. SZOLGÁLTATÁS VÁLASZTÁS */}
          <section className="booking-section">
            <h2 className="section-title title-services">1. Válaszd ki a szolgáltatást</h2>
            <div className="services-list">
              {services.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => selectService(s.id)}
                  className={`service-item ${formData.serviceId === s.id ? 'selected' : ''}`}
                >
                  {formData.serviceId === s.id && <div className="check-mark">✓</div>}
                  <h3>{s.name}</h3>
                  <div className="service-info">
                    <span className="duration">🕒 {s.duration} perc</span>
                    <span className="price">{s.price} Ft</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="booking-flex-container">
            
            {/* 2. ADATOK */}
            <section className="booking-section details-section">
              <h2 className="section-title title-details">2. Adataid</h2>
              <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group">
                  <label>Teljes név</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Minta Aladár" className="form-input" />
                </div>
                <div className="form-group">
                  <label>Telefonszám</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+36 30 123 4567" className="form-input" />
                </div>
                <div className="form-group">
                  <label>Email cím</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="pelda@email.hu" className="form-input" />
                </div>
                
                <button type="submit" disabled={!selectedTime || !formData.serviceId} className="submit-btn">
                  {selectedTime ? `Foglalás: ${selectedTime}` : 'Válassz időpontot!'}
                </button>
              </form>
            </section>

            {/* 3. NAPTÁR ÉS IDŐPONTOK */}
            <section className="booking-section calendar-section">
              <h2 className="section-title title-calendar">3. Időpont választás</h2>
              <div className="calendar-flex">
                <div>
                  <Calendar 
                    onChange={setSelectedDate}
                    value={selectedDate} 
                    minDate={minAllowedDateObj} 
                    tileDisabled={({ date }) => date.getDay() === 0 || date.getDay() === 6}
                  />
                </div>
                <div className="time-slots-container">
                  <h4 style={{ margin: '0 0 15px 0', color: '#7f8c8d' }}>Szabad sávok: {format(selectedDate, 'yyyy. MM. dd.')}</h4>
                  {!formData.serviceId ? (
                    <div style={{ padding: '20px', color: '#e67e22', fontWeight: 'bold' }}>Válassz masszázst felül!</div>
                  ) : (
                    <div className="time-slots-grid">
                      {generateTimeSlots().map(time => (
                        <button 
                          key={time} 
                          onClick={() => setSelectedTime(time)}
                          className={`time-slot-btn ${selectedTime === time ? 'selected' : ''}`}
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