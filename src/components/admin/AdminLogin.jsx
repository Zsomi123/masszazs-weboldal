import { useState } from 'react';
import logoImg from '../../assets/logo.png'; // Útvonalra figyelj!

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    fetch('http://localhost:5001/api/login', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        onLogin(); // Szólunk az Admin.jsx-nek, hogy mehetünk befelé
      } else {
        setErrorMsg(data.message);
      }
    })
    .catch(() => setErrorMsg('Hiba a szerverhez való csatlakozáskor!'));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px 20px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src={logoImg} alt="Logo" style={{ height: '60px', borderRadius: '5px' }} />
          <h2 style={{ marginTop: '10px', color: '#2c3e50', fontSize: '1.5rem' }}>Admin Belépés</h2>
        </div>
        {errorMsg && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>❌ {errorMsg}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="Felhasználónév" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '1rem' }} required />
          <input type="password" placeholder="Jelszó" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '1rem' }} required />
          <button type="submit" style={{ padding: '14px', backgroundColor: '#E67E22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>Belépés</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;