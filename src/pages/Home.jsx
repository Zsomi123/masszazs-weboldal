import React, { useState, useEffect } from 'react';
import '../App.css';
import heroBg from '../assets/hero-bg.JPG'; 
import './Home.css';     

import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer';
import { Link } from 'react-router-dom'; // Ezt add hozzá, ha nincs ott

function Home() {
  // --- ÚJ RÉSZ: Szolgáltatások letöltése ---
  const [services, setServices] = useState([]);

  useEffect(() => {
    // Ugyanaz a végpont, amit a foglalási oldalon is használunk
    fetch('http://localhost:5001/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error("Hiba a szolgáltatások letöltésekor:", err));
  }, []);

  // Egy kis tömb ikonokkal, amiket sorban kiosztunk a kártyáknak
  const icons = ['🌿', '👣', '✨', '💆‍♀️', '🌸', '🧘‍♀️'];

  return (
    <>
      <Navbar />

      {/* Hero szekció */}
      <header id="kezdolap" className="hero" style={{ 
        backgroundImage: `linear-gradient(rgba(45, 55, 72, 0.6), rgba(45, 55, 72, 0.4)), url(${heroBg})` 
      }}>
        <div className="hero-content">
          <span className="subtitle">Lassulj le, és töltődj fel</span>
          <h1>Gyógyító érintés, <br />teljes ellazulás.</h1>
          <p>Személyre szabott masszázsélmény a testi-lelki egyensúlyért, egy nyugodt, harmonikus környezetben.</p>
          <a href="#szolgaltatasok" className="cta-button">Szolgáltatások megtekintése</a>
        </div>
      </header>

      {/* Rólam szekció */}
      <section id="rolam" className="about-section">
        <div className="about-content">
          <h2>Harmónia testnek és léleknek</h2>
          <div className="divider center"></div>
          <p>Több éves tapasztalattal a hátam mögött hiszem, hogy a masszázs nem csupán az izmok lazításáról szól, hanem egy mélyebb, belső béke megteremtéséről is. Célom, hogy minden vendégem felfrissülve, fájdalmaktól mentesen és mosolyogva távozzon a szalonomból.</p>
          <p>Kezeléseim során prémium minőségű, természetes olajokat használok, figyelembe véve a te egyedi igényeidet.</p>
        </div>
      </section>

      {/* Szolgáltatások szekció (DINAMIKUS) */}
      <section id="szolgaltatasok" className="services">
        <h2>Szolgáltatások és Árak</h2>
        <div className="divider center"></div>
        <div className="services-grid">
          
          {/* Ha még töltenek az adatok */}
          {services.length === 0 && <p style={{ gridColumn: '1 / -1', color: '#7f8c8d' }}>Szolgáltatások betöltése...</p>}

          {services.map((service, index) => (
  <div key={service.id} className={`service-card ${index === 0 ? 'popular' : ''}`}>
    {index === 0 && <div className="badge">Legnépszerűbb</div>}
    <div className="icon">{icons[index % icons.length]}</div>
    <h3>{service.name}</h3>
    <p className="description">
      Felfrissülés és relaxáció a testnek és a léleknek. Egyedi igényeidre szabott kezelés.
    </p>
    
    <div className="card-footer">
      <span className="duration">{service.duration} perc</span>
      <span className="price">{service.price} Ft</span>
    </div>

    {/* ÚJ: Foglalás gomb minden kártyához */}
    <Link to={`/foglalas?serviceId=${service.id}`} className="service-btn">
  Időpontot kérek
</Link>
  </div>
))}

        </div>
      </section>

      {/* Galéria szekció */}
      <section id="galeria" style={{ padding: '100px 5%', textAlign: 'center', backgroundColor: '#fff' }}>
        <h2>Galéria</h2>
        <div className="divider center"></div>
        <p style={{ color: '#7f8c8d', marginBottom: '40px', fontSize: '1.1rem' }}>
          Tekints be a szalon nyugtató és harmonikus környezetébe.
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '300px', height: '250px', backgroundColor: '#f4f6f8', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bdc3c7', fontWeight: 'bold' }}>Kép 1 helye</div>
          <div style={{ width: '300px', height: '250px', backgroundColor: '#f4f6f8', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bdc3c7', fontWeight: 'bold' }}>Kép 2 helye</div>
          <div style={{ width: '300px', height: '250px', backgroundColor: '#f4f6f8', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bdc3c7', fontWeight: 'bold' }}>Kép 3 helye</div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;