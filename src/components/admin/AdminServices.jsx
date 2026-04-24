import { useState } from 'react';
import './AdminServices.css'; // <-- CSS IMPORTÁLÁSA

function AdminServices({ services, fetchServices }) {
  const [newService, setNewService] = useState({ name: '', duration: '', price: '' });
  const [editServiceId, setEditServiceId] = useState(null);
  const [editServiceData, setEditServiceData] = useState({ name: '', duration: '', price: '' });

  const handleAddService = (e) => {
    e.preventDefault();
    fetch('http://localhost:5001/api/services', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(newService) 
    })
    .then(res => res.json())
    .then(data => { 
      if (data.success) { 
        setNewService({ name: '', duration: '', price: '' }); 
        fetchServices();
      }
    });
  };

  const handleDeleteService = (id) => {
    if (window.confirm("Biztosan törlöd?")) {
      fetch(`http://localhost:5001/api/services/${id}`, { method: 'DELETE' })
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
    fetch(`http://localhost:5001/api/services/${id}`, { 
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
      <h1 className="services-title">💆‍♀️ Szolgáltatások</h1>
      
      <form onSubmit={handleAddService} className="services-form">
          <input type="text" placeholder="Masszázs neve" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required className="service-input input-name" />
          <input type="number" placeholder="Perc" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} required className="service-input input-duration" />
          <input type="number" placeholder="Ár (Ft)" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} required className="service-input input-price" />
          <button type="submit" className="btn-add-service">+ Új hozzáadása</button>
      </form>

      <div className="table-wrapper">
          <div className="table-card">
            <table className="services-table">
              <thead>
                <tr className="table-header-row">
                  <th>Név</th>
                  <th>Időtartam</th>
                  <th>Ár</th>
                  <th className="th-actions">Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td className="td-name">
                      {editServiceId === s.id ? 
                        <input type="text" value={editServiceData.name} onChange={e => setEditServiceData({...editServiceData, name: e.target.value})} className="edit-input" /> 
                        : s.name}
                    </td>
                    <td>
                      {editServiceId === s.id ? 
                        <input type="number" value={editServiceData.duration} onChange={e => setEditServiceData({...editServiceData, duration: e.target.value})} className="edit-input" /> 
                        : `${s.duration} perc`}
                    </td>
                    <td className="td-price">
                      {editServiceId === s.id ? 
                        <input type="number" value={editServiceData.price} onChange={e => setEditServiceData({...editServiceData, price: e.target.value})} className="edit-input" /> 
                        : `${s.price} Ft`}
                    </td>
                    <td className="td-actions">
                       {editServiceId === s.id ? (
                          <>
                            <button onClick={() => handleSaveService(s.id)} className="btn-table btn-save">Ment</button>
                            <button onClick={() => setEditServiceId(null)} className="btn-table btn-cancel">X</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditServiceClick(s)} className="btn-table btn-edit">Szerkeszt</button>
                            <button onClick={() => handleDeleteService(s.id)} className="btn-table btn-delete">Töröl</button>
                          </>
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