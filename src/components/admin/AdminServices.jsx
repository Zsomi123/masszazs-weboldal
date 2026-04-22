import { useState } from 'react';

function AdminServices({ services, fetchServices }) {
  const [newService, setNewService] = useState({ name: '', duration: '', price: '' });
  const [editServiceId, setEditServiceId] = useState(null);
  const [editServiceData, setEditServiceData] = useState({ name: '', duration: '', price: '' });

  const handleAddService = (e) => {
    e.preventDefault();
    fetch('http://localhost:5001/api/admin/services', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(newService) 
    })
    .then(res => res.json())
    .then(data => { 
      if (data.success) { 
        setNewService({ name: '', duration: '', price: '' }); 
        fetchServices(); // Szólunk a szülőnek, hogy frissítse a listát
      }
    });
  };

  const handleDeleteService = (id) => {
    if (window.confirm("Biztosan törlöd?")) {
      fetch(`http://localhost:5001/api/admin/services/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => { 
        if (data.success) {
            fetchServices();
        } else {
            alert(data.message); 
        }
      });
    }
  };

  const handleEditServiceClick = (service) => {
    setEditServiceId(service.id);
    setEditServiceData({ name: service.name, duration: service.duration, price: service.price });
  };

  const handleSaveService = (id) => {
    fetch(`http://localhost:5001/api/admin/services/${id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(editServiceData) 
    })
    .then(res => res.json())
    .then(data => { 
      if (data.success) { 
        setEditServiceId(null);
        fetchServices();
      }
    });
  };

  return (
    <>
      <h1 style={{ marginTop: '40px', marginBottom: '20px', color: '#2c3e50', borderTop: '2px solid #ccc', paddingTop: '20px', fontSize: '1.5rem' }}>💆‍♀️ Szolgáltatások</h1>
      
      <form onSubmit={handleAddService} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <input type="text" placeholder="Masszázs neve" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required style={{flex: '1 1 200px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}} />
          <input type="number" placeholder="Perc" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} required style={{flex: '1 1 80px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}} />
          <input type="number" placeholder="Ár (Ft)" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} required style={{flex: '1 1 100px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}} />
          <button type="submit" style={{ flex: '1 1 100%', backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>+ Új hozzáadása</button>
      </form>

      <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', minWidth: '600px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                  <th style={{ padding: '15px' }}>Név</th>
                  <th style={{ padding: '15px' }}>Időtartam</th>
                  <th style={{ padding: '15px' }}>Ár</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{editServiceId === s.id ? <input type="text" value={editServiceData.name} onChange={e => setEditServiceData({...editServiceData, name: e.target.value})} style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }} /> : s.name}</td>
                    <td style={{ padding: '15px' }}>{editServiceId === s.id ? <input type="number" value={editServiceData.duration} onChange={e => setEditServiceData({...editServiceData, duration: e.target.value})} style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }} /> : `${s.duration} perc`}</td>
                    <td style={{ padding: '15px', color: '#27ae60', fontWeight: 'bold' }}>{editServiceId === s.id ? <input type="number" value={editServiceData.price} onChange={e => setEditServiceData({...editServiceData, price: e.target.value})} style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }} /> : `${s.price} Ft`}</td>
                    <td style={{ padding: '15px', textAlign: 'center', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                       {editServiceId === s.id ? (
                          <><button onClick={() => handleSaveService(s.id)} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Ment</button><button onClick={() => setEditServiceId(null)} style={{ backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>X</button></>
                        ) : (
                          <><button onClick={() => handleEditServiceClick(s)} style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Szerkeszt</button><button onClick={() => handleDeleteService(s.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Töröl</button></>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </>
  );
}

export default AdminServices;