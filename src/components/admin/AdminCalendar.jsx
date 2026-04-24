import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { hu } from 'date-fns/locale';
import './AdminCalendar.css'; // <-- CSS IMPORTÁLÁSA

function AdminCalendar({ services }) {
  const [appointments, setAppointments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedAppt, setSelectedAppt] = useState(null);
  
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [newBlock, setNewBlock] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    isFullDay: false,
    startTime: '08:00',
    endTime: '20:00'
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminAppt, setNewAdminAppt] = useState({
    service_id: services.length > 0 ? services[0].id : '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00'
  });

  const fetchAppointments = () => {
    const start = format(currentWeekStart, 'yyyy-MM-dd');
    const end = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
    fetch(`http://localhost:5001/api/appointments/admin/range?start=${start}&end=${end}`)
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error("Hiba a foglalások letöltésekor:", err));
  };

  const fetchBlocks = () => {
    const start = format(currentWeekStart, 'yyyy-MM-dd');
    const end = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
    fetch(`http://localhost:5001/api/appointments/admin/blocks/range?start=${start}&end=${end}`)
      .then(res => res.json())
      .then(data => setBlocks(data))
      .catch(err => console.error("Hiba a blokkolások letöltésekor:", err));
  };

  useEffect(() => {
    fetchAppointments();
    fetchBlocks(); 
  }, [currentWeekStart]);

  useEffect(() => {
    if (services.length > 0 && !newAdminAppt.service_id) {
        setNewAdminAppt(prev => ({ ...prev, service_id: services[0].id }));
    }
  }, [services]);

  const handleAddBlock = (e) => {
    e.preventDefault();
    const start_time = `${newBlock.date}T${newBlock.isFullDay ? '08:00' : newBlock.startTime}:00`;
    const end_time = `${newBlock.date}T${newBlock.isFullDay ? '20:00' : newBlock.endTime}:00`;

    fetch('http://localhost:5001/api/appointments/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_time, end_time })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) { 
            setShowBlockForm(false);
            fetchBlocks(); 
        } else {
            alert("Hiba: " + data.message);
        }
    });
  };

  const handleAdminAddAppt = (e) => {
    e.preventDefault();
    const start_time = `${newAdminAppt.date} ${newAdminAppt.time}:00`;

    fetch('http://localhost:5001/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            service_id: newAdminAppt.service_id,
            customer_name: newAdminAppt.customer_name,
            customer_email: newAdminAppt.customer_email,
            customer_phone: newAdminAppt.customer_phone,
            start_time: start_time,
            source: 'admin'
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === "Sikeres foglalás!") {
            setShowAddForm(false); 
            fetchAppointments(); 
            setNewAdminAppt({ ...newAdminAppt, customer_name: '', customer_email: '', customer_phone: '' }); 
            alert("Foglalás rögzítve!");
        } else {
            alert("Hiba: " + data.message);
        }
    });
  };

  const handleDeleteAppt = (id) => {
    if (window.confirm("Biztosan törlöd ezt a foglalást?")) {
      fetch(`http://localhost:5001/api/appointments/admin/${id}`, { method: 'DELETE' })
      .then(res => res.json()).then(data => {
        if (data.success) {
          setAppointments(appointments.filter(a => a.id !== id));
          setSelectedAppt(null);
        }
      });
    }
  };

  const handleDeleteBlock = (id) => {
    if (window.confirm("Biztosan visszavonod ezt a kihúzást?")) {
      fetch(`http://localhost:5001/api/appointments/admin/blocks/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          if (data.success) fetchBlocks(); 
        });
    }
  };

  const startHour = 8;
  const endHour = 20;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <>
      {/* NAPTÁR FEJLÉC */}
      <div className="admin-calendar-header">
          <h1 className="admin-title">🗓️ Heti Naptár</h1>
          <div className="admin-actions">
              <button onClick={() => setShowAddForm(!showAddForm)} className="btn-action btn-primary">
                {showAddForm ? 'X Mégse' : '+ Új foglalás'}
              </button>
              <button onClick={() => setShowBlockForm(!showBlockForm)} className="btn-action btn-secondary">
                {showBlockForm ? 'X Mégse' : '🚫 Időpont kihúzása'}
              </button>
          </div>
          <div className="calendar-controls">
              <button onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))} className="btn-nav">←</button>
              <span className="week-label">
                  {format(currentWeekStart, 'MMM. dd.', { locale: hu })} - {format(addDays(currentWeekStart, 6), 'MMM. dd.', { locale: hu })}
              </span>
              <button onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))} className="btn-nav">→</button>
              <button onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="btn-today">Ma</button>
          </div>
      </div>

      {/* ÚJ FOGLALÁS ŰRLAP */}
      {showAddForm && (
          <div className="admin-form-card card-appt">
              <h3>Új időpont rögzítése</h3>
              <form onSubmit={handleAdminAddAppt} className="admin-form-row">
                  <input type="date" value={newAdminAppt.date} onChange={e => setNewAdminAppt({...newAdminAppt, date: e.target.value})} required className="admin-input" />
                  <input type="time" value={newAdminAppt.time} onChange={e => setNewAdminAppt({...newAdminAppt, time: e.target.value})} required className="admin-input" style={{flexBasis: '100px'}} />
                  <select value={newAdminAppt.service_id} onChange={e => setNewAdminAppt({...newAdminAppt, service_id: e.target.value})} required className="admin-input" style={{flexBasis: '200px'}}>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} perc)</option>)}
                  </select>
                  <input type="text" placeholder="Vendég neve" value={newAdminAppt.customer_name} onChange={e => setNewAdminAppt({...newAdminAppt, customer_name: e.target.value})} required className="admin-input" style={{flexBasis: '200px'}} />
                  <input type="email" placeholder="Email cím (opcionális)" value={newAdminAppt.customer_email} onChange={e => setNewAdminAppt({...newAdminAppt, customer_email: e.target.value})} className="admin-input" style={{flexBasis: '200px'}} />
                  <input type="text" placeholder="Telefonszám" value={newAdminAppt.customer_phone} onChange={e => setNewAdminAppt({...newAdminAppt, customer_phone: e.target.value})} required className="admin-input" />
                  
                  <button type="submit" className="btn-submit-appt">Mentés</button>
              </form>
          </div>
      )}

      {/* BLOKKOLÁS ŰRLAP */}
      {showBlockForm && (
          <div className="admin-form-card card-block">
              <h3>🚫 Idősáv blokkolása</h3>
              <form onSubmit={handleAddBlock} className="admin-form-row">
                  <input type="date" value={newBlock.date} onChange={e => setNewBlock({...newBlock, date: e.target.value})} required className="admin-input" />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newBlock.isFullDay} onChange={e => setNewBlock({...newBlock, isFullDay: e.target.checked})} /> 
                    Egész nap
                  </label>
                  {!newBlock.isFullDay && (
                      <>
                        <input type="time" value={newBlock.startTime} onChange={e => setNewBlock({...newBlock, startTime: e.target.value})} className="admin-input" style={{flexBasis: '100px'}} />
                        <input type="time" value={newBlock.endTime} onChange={e => setNewBlock({...newBlock, endTime: e.target.value})} className="admin-input" style={{flexBasis: '100px'}} />
                      </>
                  )}
                  <button type="submit" className="btn-submit-block">Blokkolás mentése</button>
              </form>
          </div>
      )}

      {/* KIJELÖLT FOGLALÁS ADATAI (A keret színe dinamikus marad az admin/online miatt) */}
      {selectedAppt && (
          <div className="selected-appt-card" style={{ borderLeft: `8px solid ${selectedAppt.source === 'admin' ? '#3498db' : '#27ae60'}` }}>
              <div className="selected-header">
                  <div className="selected-details">
                    <h2>{selectedAppt.customer_name}</h2>
                    <p>📞 {selectedAppt.customer_phone}</p>
                    <p>✉️ {selectedAppt.customer_email || 'Nincs megadva'}</p>
                    <p>💆‍♀️ {selectedAppt.service_name} ({selectedAppt.duration} perc)</p>
                    <p className="selected-time">
                        {format(new Date(selectedAppt.start_time), 'HH:mm')} - {format(new Date(selectedAppt.end_time), 'HH:mm')}
                    </p>
                  </div>
                  <div className="selected-actions">
                      <button onClick={() => setSelectedAppt(null)} className="btn-close">Bezárás</button>
                      <button onClick={() => handleDeleteAppt(selectedAppt.id)} className="btn-delete">Törlés</button>
                  </div>
              </div>
          </div>
      )}

      {/* NAPTÁR RÁCS */}
      <div className="calendar-wrapper">
          <div className="calendar-grid">
              
              {/* Órák oldalsáv */}
              <div className="time-sidebar">
                  <div className="time-header-spacer"></div>
                  {hours.map(h => (
                      <div key={h} className="time-label">{h}:00</div>
                  ))}
              </div>
              
              {/* Napok oszlopai */}
              {weekDays.map(day => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={day.toString()} className="day-column">
                        <div className={`day-header ${isToday ? 'today' : ''}`}>
                            <span className="day-name">{format(day, 'EEEE', { locale: hu })}</span>
                            <span className="day-number">{format(day, 'dd')}</span>
                        </div>
                        
                        {/* Üres rács cellák */}
                        {hours.map(h => <div key={h} className="grid-cell"></div>)}

                        {/* BLOKKOLÁSOK MEGJELENÍTÉSE (Top és height dinamikus marad!) */}
                        {blocks.filter(b => isSameDay(new Date(b.start_time), day)).map(block => {
                            const start = new Date(block.start_time);
                            const end = new Date(block.end_time);
                            const top = ((start.getHours() - startHour) * 60) + start.getMinutes() + 50;
                            const height = (end.getTime() - start.getTime()) / 60000;
                            return (
                                <div key={block.id} onClick={() => handleDeleteBlock(block.id)} className="block-event" style={{ position: 'absolute', top: `${top}px`, left: 0, right: 0, height: `${height}px` }}>
                                    <span className="block-text">ZÁRVA</span>
                                </div>
                            );
                        })}

                        {/* FOGLALÁSOK MEGJELENÍTÉSE (Top, height és szín dinamikus!) */}
                        {appointments.filter(a => isSameDay(new Date(a.start_time), day)).map(appt => {
                            const start = new Date(appt.start_time);
                            const top = ((start.getHours() - startHour) * 60) + start.getMinutes() + 50;
                            const height = appt.duration;
                            return (
                                <div key={appt.id} onClick={() => setSelectedAppt(appt)} className={`appt-event ${appt.source === 'admin' ? 'appt-admin' : 'appt-online'}`} style={{ position: 'absolute', top: `${top}px`, left: '2px', right: '2px', height: `${height}px` }}>
                                    <strong>{format(start, 'HH:mm')}</strong> {appt.customer_name}
                                </div>
                            );
                        })}
                    </div>
                  );
              })}
          </div>
      </div>
    </>
  );
}

export default AdminCalendar;