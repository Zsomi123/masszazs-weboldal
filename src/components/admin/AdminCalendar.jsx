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
    customer_phone: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00'
  });

  const fetchAppointments = () => {
    const start = format(currentWeekStart, 'yyyy-MM-dd');
    const end = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
    fetch(`http://localhost:5001/api/admin/appointments/range?start=${start}&end=${end}`)
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error("Hiba a foglalások letöltésekor:", err));
  };

  const fetchBlocks = () => {
    const start = format(currentWeekStart, 'yyyy-MM-dd');
    const end = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
    fetch(`http://localhost:5001/api/admin/blocks/range?start=${start}&end=${end}`)
      .then(res => res.json())
      .then(data => setBlocks(data))
      .catch(err => console.error("Hiba a blokkolások letöltésekor:", err));
  };

  useEffect(() => {
    fetchAppointments();
    fetchBlocks(); 
  }, [currentWeekStart]);

  // Ha betöltődtek a szolgáltatások, beállítjuk az elsőt alapértelmezettnek
  useEffect(() => {
    if (services.length > 0 && !newAdminAppt.service_id) {
        setNewAdminAppt(prev => ({ ...prev, service_id: services[0].id }));
    }
  }, [services]);

  const handleAddBlock = (e) => {
    e.preventDefault();
    const start_time = `${newBlock.date}T${newBlock.isFullDay ? '08:00' : newBlock.startTime}:00`;
    const end_time = `${newBlock.date}T${newBlock.isFullDay ? '20:00' : newBlock.endTime}:00`;

    fetch('http://localhost:5001/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_time, end_time })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success || data.message === "Sikeres mentés" || data.id) { 
            setShowBlockForm(false);
            fetchBlocks(); 
        } else {
            alert("Hiba történt a mentéskor: " + (data.message || "Ismeretlen hiba"));
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
            customer_phone: newAdminAppt.customer_phone,
            start_time: start_time,
            source: 'admin'
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success || data.message === "Sikeres foglalás!") {
            setShowAddForm(false); 
            fetchAppointments(); 
            setNewAdminAppt({ ...newAdminAppt, customer_name: '', customer_phone: '' }); 
            alert("Foglalás sikeresen rögzítve!");
        } else {
            alert("Hiba: " + (data.message || "Ismeretlen hiba történt.")); 
        }
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

  const handleDeleteBlock = (id) => {
    if (window.confirm("Biztosan visszavonod ezt a kihúzást?")) {
      fetch(`http://localhost:5001/api/admin/blocks/${id}`, { method: 'DELETE' })
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
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
          <h1 style={{ color: '#2c3e50', margin: 0, fontSize: '1.8rem' }}>🗓️ Heti Naptár</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', width: '100%', justifyContent: 'flex-start' }}>
              <button onClick={() => setShowAddForm(!showAddForm)} style={{ flex: '1 1 auto', padding: '10px 15px', cursor: 'pointer', borderRadius: '5px', backgroundColor: '#27ae60', color: 'white', border: 'none', fontWeight: 'bold' }}>
                {showAddForm ? 'X Mégse' : '+ Új foglalás'}
              </button>
              <button onClick={() => setShowBlockForm(!showBlockForm)} style={{ flex: '1 1 auto', padding: '10px 15px', cursor: 'pointer', borderRadius: '5px', backgroundColor: '#7f8c8d', color: 'white', border: 'none', fontWeight: 'bold' }}>
                {showBlockForm ? 'X Mégse' : '🚫 Időpont kihúzása'}
              </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', width: '100%', justifyContent: 'space-between', backgroundColor: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <button onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))} style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff' }}>← Előző</button>
              <span style={{ fontWeight: 'bold', fontSize: '1rem', textAlign: 'center', flex: 1 }}>
                  {format(currentWeekStart, 'MMM. dd.', { locale: hu })} - {format(addDays(currentWeekStart, 6), 'MMM. dd.', { locale: hu })}
              </span>
              <button onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))} style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff' }}>Következő →</button>
              <button onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px', backgroundColor: '#3498db', color: 'white', border: 'none' }}>Ma</button>
          </div>
      </div>

      {showAddForm && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderLeft: '5px solid #27ae60' }}>
              <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Új időpont rögzítése</h3>
              <form onSubmit={handleAdminAddAppt} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 150px' }}>
                      <label style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Dátum</label>
                      <input type="date" value={newAdminAppt.date} onChange={e => setNewAdminAppt({...newAdminAppt, date: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 120px' }}>
                      <label style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Időpont</label>
                      <input type="time" value={newAdminAppt.time} onChange={e => setNewAdminAppt({...newAdminAppt, time: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: '2 1 200px' }}>
                      <label style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Szolgáltatás</label>
                      <select value={newAdminAppt.service_id} onChange={e => setNewAdminAppt({...newAdminAppt, service_id: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                          {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} perc)</option>)}
                      </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: '2 1 200px' }}>
                      <label style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Vendég neve</label>
                      <input type="text" placeholder="Pl. Kiss Anna" value={newAdminAppt.customer_name} onChange={e => setNewAdminAppt({...newAdminAppt, customer_name: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: '2 1 150px' }}>
                      <label style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Telefonszám</label>
                      <input type="text" placeholder="+36 30..." value={newAdminAppt.customer_phone} onChange={e => setNewAdminAppt({...newAdminAppt, customer_phone: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                  </div>
                  <button type="submit" style={{ flex: '1 1 100%', backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Mentés a naptárba</button>
              </form>
          </div>
      )}

      {showBlockForm && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderLeft: '5px solid #7f8c8d' }}>
              <h3 style={{ marginTop: 0, color: '#2c3e50' }}>🚫 Nap vagy idősáv blokkolása</h3>
              <form onSubmit={handleAddBlock} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 150px' }}>
                      <label style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Dátum</label>
                      <input type="date" value={newBlock.date} onChange={e => setNewBlock({...newBlock, date: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px', flex: '1 1 100%' }}>
                      <input type="checkbox" id="fullday" checked={newBlock.isFullDay} onChange={e => setNewBlock({...newBlock, isFullDay: e.target.checked})} style={{ transform: 'scale(1.2)' }} />
                      <label htmlFor="fullday" style={{ fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}>Egész napos kihúzás</label>
                  </div>
                  {!newBlock.isFullDay && (
                      <>
                          <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 120px' }}>
                              <label style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Kezdés</label>
                              <input type="time" value={newBlock.startTime} onChange={e => setNewBlock({...newBlock, startTime: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 120px' }}>
                              <label style={{ fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Befejezés</label>
                              <input type="time" value={newBlock.endTime} onChange={e => setNewBlock({...newBlock, endTime: e.target.value})} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                          </div>
                      </>
                  )}
                  <button type="submit" style={{ flex: '1 1 100%', backgroundColor: '#7f8c8d', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Blokkolás mentése</button>
              </form>
          </div>
      )}

      {selectedAppt && (
          <div style={{ 
              backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '25px', 
              borderLeft: `10px solid ${selectedAppt.source === 'admin' ? '#3498db' : '#27ae60'}`, 
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)', display: 'flex', flexWrap: 'wrap', gap: '20px', 
              justifyContent: 'space-between', alignItems: 'center'
          }}>
              <div style={{ flex: '1 1 350px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                      <span style={{ 
                          backgroundColor: selectedAppt.source === 'admin' ? '#ebf5fb' : '#eafaf1', 
                          color: selectedAppt.source === 'admin' ? '#3498db' : '#27ae60', 
                          padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
                      }}>
                          {selectedAppt.source === 'admin' ? '👤 Admin rögzítette' : '🌐 Online foglalás'}
                      </span>
                      <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.4rem' }}>{selectedAppt.customer_name}</h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px', fontSize: '1rem' }}>
                      <span style={{ color: '#7f8c8d' }}>📞 Telefonszám:</span>
                      <span style={{ fontWeight: '600', color: '#2c3e50' }}>{selectedAppt.customer_phone}</span>
                      <span style={{ color: '#7f8c8d' }}>💆‍♀️ Szolgáltatás:</span>
                      <span style={{ fontWeight: '600', color: '#2c3e50' }}>{selectedAppt.service_name} ({selectedAppt.duration} perc)</span>
                  </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button onClick={() => setSelectedAppt(null)} style={{ backgroundColor: '#ecf0f1', color: '#7f8c8d', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Bezárás</button>
                  <button onClick={() => handleDeleteAppt(selectedAppt.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Foglalás törlése</button>
              </div>
          </div>
      )}

      <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '10px' }}>
          <div style={{ minWidth: '800px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
              <div style={{ width: '60px', borderRight: '1px solid #e0e0e0', backgroundColor: '#fafafa', flexShrink: 0 }}>
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

                      {blocks.filter(b => isSameDay(new Date(b.start_time), day)).map(block => {
                          const start = new Date(block.start_time);
                          const end = new Date(block.end_time);
                          const topPosition = ((start.getHours() - startHour) * 60) + start.getMinutes() + 50;
                          const height = ((end.getTime() - start.getTime()) / 1000 / 60);
                          
                          return (
                              <div key={`block-${block.id}`} onClick={() => handleDeleteBlock(block.id)}
                                  style={{ position: 'absolute', top: `${topPosition}px`, left: '2px', right: '2px', height: `${height}px`, background: 'repeating-linear-gradient(45deg, #e0e0e0, #e0e0e0 10px, #cccccc 10px, #cccccc 20px)', borderRadius: '4px', cursor: 'pointer', zIndex: 5, border: '1px solid #bbb', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.8 }} title="Kattints a törléshez"
                              >
                                  <span style={{ fontWeight: 'bold', fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 5px', borderRadius: '4px' }}>🚫 Törlés</span>
                              </div>
                          );
                      })}

                      {appointments.filter(a => isSameDay(new Date(a.start_time), day)).map(appt => {
                          const start = new Date(appt.start_time);
                          const topPosition = ((start.getHours() - startHour) * 60) + start.getMinutes() + 50;
                          const height = appt.duration; 
                          const isShort = height <= 35; 
                          
                          return (
                              <div key={appt.id} onClick={() => setSelectedAppt(appt)}
                                  style={{ position: 'absolute', top: `${topPosition}px`, left: '2px', right: '2px', height: `${height}px`, backgroundColor: selectedAppt?.id === appt.id ? '#f39c12' : (appt.source === 'admin' ? '#3498db' : '#27ae60'), color: 'white', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', zIndex: 10, border: '1px solid rgba(0,0,0,0.1)', display: 'flex', flexDirection: isShort ? 'row' : 'column', alignItems: isShort ? 'center' : 'flex-start', gap: isShort ? '8px' : '2px', overflow: 'hidden' }}
                              >
                                  <div style={{ fontWeight: 'bold', fontSize: '0.75rem', opacity: 0.9, flexShrink: 0 }}>{format(start, 'HH:mm')}</div>
                                  <div style={{ fontWeight: 'bold', fontSize: '0.75rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{appt.customer_name}</div>
                              </div>
                          );
                      })}
                  </div>
              )})}
          </div>
      </div>
    </>
  );
}

export default AdminCalendar;