import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';

function CancelAppointment() {
    const { id } = useParams(); // Kiolvassuk az ID-t a linkből
    const [status, setStatus] = useState('confirm'); // Állapotok: 'confirm', 'loading', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');

    const handleCancel = async () => {
        setStatus('loading');
        try {
            // Itt hívjuk meg a backend lemondó végpontját
            const response = await fetch(`http://localhost:5001/api/appointments/cancel/${id}`, {
                method: 'DELETE',
            });
            
            const data = await response.json();

            if (response.ok) {
                setStatus('success');
            } else {
                setErrorMessage(data.message);
                setStatus('error');
            }
        } catch (error) {
            setErrorMessage("Hálózati hiba történt. Kérlek, próbáld újra később.");
            setStatus('error');
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '500px', textAlign: 'center' }}>
                
                {/* 1. KÉRDÉS ÁLLAPOT */}
                {status === 'confirm' && (
                    <>
                        <h2 style={{ color: '#2c3e50', marginTop: 0 }}>Időpont lemondása</h2>
                        <p style={{ color: '#7f8c8d', fontSize: '1.1rem', marginBottom: '30px' }}>
                            Biztosan szeretnéd lemondani ezt a foglalást? Ezt a műveletet nem lehet visszavonni.
                        </p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <Link to="/" style={{ padding: '12px 25px', backgroundColor: '#ecf0f1', color: '#2c3e50', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                                Nem, mégsem
                            </Link>
                            <button onClick={handleCancel} style={{ padding: '12px 25px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Igen, lemondom
                            </button>
                        </div>
                    </>
                )}

                {/* 2. TÖLTÉS ÁLLAPOT */}
                {status === 'loading' && (
                    <>
                        <h2>Feldolgozás...</h2>
                        <p>Kérlek várj, a lemondás folyamatban van.</p>
                    </>
                )}

                {/* 3. SIKERES ÁLLAPOT */}
                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '50px', marginBottom: '10px' }}>✅</div>
                        <h2 style={{ color: '#27ae60', marginTop: 0 }}>Sikeres lemondás!</h2>
                        <p style={{ color: '#7f8c8d' }}>A foglalásodat töröltük a rendszerünkből. Reméljük, hamarosan újra láthatunk!</p>
                        <Link to="/" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', backgroundColor: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                            Vissza a főoldalra
                        </Link>
                    </>
                )}

                {/* 4. HIBA ÁLLAPOT (pl. 24 órán belül van) */}
                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '50px', marginBottom: '10px' }}>⚠️</div>
                        <h2 style={{ color: '#e74c3c', marginTop: 0 }}>Nem sikerült lemondani</h2>
                        <p style={{ color: '#7f8c8d', fontWeight: 'bold' }}>{errorMessage}</p>
                        <Link to="/" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', backgroundColor: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                            Vissza a főoldalra
                        </Link>
                    </>
                )}

            </div>
        </div>
    );
}

export default CancelAppointment;