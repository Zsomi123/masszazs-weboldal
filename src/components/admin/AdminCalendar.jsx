import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { hu } from 'date-fns/locale';

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
    customer_email: '', // Új mező
    customer_phone: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00'
  });

  // 1. Foglalások lekérése az új útvonalon
  const fetchAppointments = () => {
    const start = format(currentWeekStart, 'yyyy-MM-dd');
    const end = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
    // JAVÍTOTT URL: /api/appointments/admin/range
    fetch(`http://localhost:5001/api/appointments/admin/range?start=${start}&end=${end}`)
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error("Hiba a foglalások letöltésekor:", err));
  };

  // 2. Blokkolások lekérése az új útvonalon
  const fetchBlocks = () => {
    const start = format(currentWeekStart, 'yyyy-MM-dd');
    const end = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
    // JAVÍTOTT URL: /api/appointments/admin/blocks/range
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

    // JAVÍTOTT URL: /api/appointments/admin/blocks
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

    // URL: /api/appointments (POST)
    fetch('http://localhost:5001/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            service_id: newAdminAppt.service_id,
            customer_name: newAdminAppt.customer_name,
            customer_email: newAdminAppt.customer_email, // Email küldése
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
      // JAVÍTOTT URL: /api/appointments/admin/:id
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
      // JAVÍTOTT URL: /api/appointments/admin/blocks/:id
      fetch(`http://localhost:5001/api/appointments/admin/blocks/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          if (data.success) fetchBlocks(); 
        });
    }
  };

  // Naptár rács generálás adatai
  const startHour = 8;
  const endHour = 20;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <>
      {/* NAPTÁR FEJLÉC */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
          <h1 style={{ color: '#2c3e50', margin: 0, fontSize: '1.8rem' }}>🗓️ Heti Naptár</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
              <button onClick={() => setShowAddForm(!showAddForm)} style={{ flex: 1, padding: '10px', borderRadius: '5px', backgroundColor: '#3498db', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                {showAddForm ? 'X Mégse' : '+ Új foglalás'}
              </button>
              <button onClick={() => setShowBlockForm(!showBlockForm)} style={{ flex: 1, padding: '10px', borderRadius: '5px', backgroundColor: '#7f8c8d', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                {showBlockForm ? 'X Mégse' : '🚫 Időpont kihúzása'}
              </button>
          </div>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', backgroundColor: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', alignItems: 'center' }}>
              <button onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))} style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}>←</button>
              <span style={{ fontWeight: 'bold' }}>
                  {format(currentWeekStart, 'MMM. dd.', { locale: hu })} - {format(addDays(currentWeekStart, 6), 'MMM. dd.', { locale: hu })}
              </span>
              <button onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))} style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}>→</button>
              <button onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} style={{ padding: '8px 15px', borderRadius: '5px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer' }}>Ma</button>
          </div>
      </div>

      {/* ÚJ FOGLALÁS ŰRLAP */}
      {showAddForm && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderLeft: '5px solid #27ae60' }}>
              <h3 style={{ marginTop: 0 }}>Új időpont rögzítése</h3>
              <form onSubmit={handleAdminAddAppt} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                  <input type="date" value={newAdminAppt.date} onChange={e => setNewAdminAppt({...newAdminAppt, date: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: '1 1 150px' }} />
                  <input type="time" value={newAdminAppt.time} onChange={e => setNewAdminAppt({...newAdminAppt, time: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: '1 1 100px' }} />
                  <select value={newAdminAppt.service_id} onChange={e => setNewAdminAppt({...newAdminAppt, service_id: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: '1 1 200px' }}>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} perc)</option>)}
                  </select>
                  <input type="text" placeholder="Vendég neve" value={newAdminAppt.customer_name} onChange={e => setNewAdminAppt({...newAdminAppt, customer_name: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: '1 1 200px' }} />
                  <input type="email" placeholder="Email cím" value={newAdminAppt.customer_email} onChange={e => setNewAdminAppt({...newAdminAppt, customer_email: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: '1 1 200px' }} />
                  <input type="text" placeholder="Telefonszám" value={newAdminAppt.customer_phone} onChange={e => setNewAdminAppt({...newAdminAppt, customer_phone: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: '1 1 150px' }} />
                  <button type="submit" style={{ width: '100%', backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Mentés</button>
              </form>
          </div>
      )}

      {/* BLOKKOLÁS ŰRLAP */}
      {showBlockForm && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderLeft: '5px solid #7f8c8d' }}>
              <h3 style={{ marginTop: 0 }}>🚫 Idősáv blokkolása</h3>
              <form onSubmit={handleAddBlock} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                  <input type="date" value={newBlock.date} onChange={e => setNewBlock({...newBlock, date: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                  <label><input type="checkbox" checked={newBlock.isFullDay} onChange={e => setNewBlock({...newBlock, isFullDay: e.target.checked})} /> Egész nap</label>
                  {!newBlock.isFullDay && (
                      <>
                        <input type="time" value={newBlock.startTime} onChange={e => setNewBlock({...newBlock, startTime: e.target.value})} style={{ padding: '10px' }} />
                        <input type="time" value={newBlock.endTime} onChange={e => setNewBlock({...newBlock, endTime: e.target.value})} style={{ padding: '10px' }} />
                      </>
                  )}
                  <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#7f8c8d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Blokkolás mentése</button>
              </form>
          </div>
      )}

      {/* KIJELÖLT FOGLALÁS ADATAI */}
      {selectedAppt && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', borderLeft: `8px solid ${selectedAppt.source === 'admin' ? '#3498db' : '#27ae60'}`, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ margin: '0 0 10px 0' }}>{selectedAppt.customer_name}</h2>
                    <p style={{ margin: '5px 0' }}>📞 {selectedAppt.customer_phone}</p>
                    <p style={{ margin: '5px 0' }}>✉️ {selectedAppt.customer_email || 'Nincs megadva'}</p>
                    <p style={{ margin: '5px 0' }}>💆‍♀️ {selectedAppt.service_name} ({selectedAppt.duration} perc)</p>
                    <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#E67E22' }}>
                        {format(new Date(selectedAppt.start_time), 'HH:mm')} - {format(new Date(selectedAppt.end_time), 'HH:mm')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setSelectedAppt(null)} style={{ padding: '8px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer' }}>Bezárás</button>
                      <button onClick={() => handleDeleteAppt(selectedAppt.id)} style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Törlés</button>
                  </div>
              </div>
          </div>
      )}

      {/* NAPTÁR RÁCS */}
      <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '800px', backgroundColor: 'white', display: 'flex', border: '1px solid #ddd', borderRadius: '8px' }}>
              <div style={{ width: '60px', backgroundColor: '#f9f9f9', borderRight: '1px solid #ddd' }}>
                  <div style={{ height: '50px' }}></div>
                  {hours.map(h => (
                      <div key={h} style={{ height: '60px', borderBottom: '1px solid #eee', fontSize: '0.75rem', textAlign: 'center', color: '#999', paddingTop: '5px' }}>{h}:00</div>
                  ))}
              </div>
              {weekDays.map(day => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={day.toString()} style={{ flex: 1, borderRight: '1px solid #eee', position: 'relative' }}>
                        <div style={{ height: '50px', borderBottom: '1px solid #ddd', textAlign: 'center', backgroundColor: isToday ? '#e8f4fd' : 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: '#999' }}>{format(day, 'EEEE', { locale: hu })}</span>
                            <span style={{ fontWeight: 'bold' }}>{format(day, 'dd')}</span>
                        </div>
                        {hours.map(h => <div key={h} style={{ height: '60px', borderBottom: '1px solid #fafafa' }}></div>)}

                        {/* BLOKKOLÁSOK MEGJELENÍTÉSE */}
                        {blocks.filter(b => isSameDay(new Date(b.start_time), day)).map(block => {
                            const start = new Date(block.start_time);
                            const end = new Date(block.end_time);
                            const top = ((start.getHours() - startHour) * 60) + start.getMinutes() + 50;
                            const height = (end.getTime() - start.getTime()) / 60000;
                            return (
                                <div key={block.id} onClick={() => handleDeleteBlock(block.id)} style={{ position: 'absolute', top: `${top}px`, left: 0, right: 0, height: `${height}px`, background: 'repeating-linear-gradient(45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)', opacity: 0.7, zIndex: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>ZÁRVA</span>
                                </div>
                            );
                        })}

                        {/* FOGLALÁSOK MEGJELENÍTÉSE */}
                        {appointments.filter(a => isSameDay(new Date(a.start_time), day)).map(appt => {
                            const start = new Date(appt.start_time);
                            const top = ((start.getHours() - startHour) * 60) + start.getMinutes() + 50;
                            const height = appt.duration;
                            return (
                                <div key={appt.id} onClick={() => setSelectedAppt(appt)} style={{ position: 'absolute', top: `${top}px`, left: '2px', right: '2px', height: `${height}px`, backgroundColor: appt.source === 'admin' ? '#3498db' : '#27ae60', color: 'white', borderRadius: '4px', padding: '2px 5px', fontSize: '0.7rem', cursor: 'pointer', zIndex: 10, border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden' }}>
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