import React from 'react';
import '../App.css';
import heroBg from '../assets/hero-bg.JPG'; 
import './Home.css';     // A kezdőlap egyedi stílusa miatt

// ... a többi kód változatlan

// --- KOMPONENSEK IMPORTÁLÁSA ---
// (Ellenőrizd, hogy a components mappában vannak-e. Ha ugyanott, akkor './Navbar' kell)
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer';

function Home() {
  return (
    <>
      {/* ÚJ: A gyönyörű, okos navigációs sáv betöltése */}
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

      {/* Szolgáltatások szekció */}
      <section id="szolgaltatasok" className="services">
        <h2>Szolgáltatások és Árak</h2>
        <div className="divider center"></div>
        <div className="services-grid">
          
          <div className="service-card popular">
            <div className="badge">Legnépszerűbb</div>
            <div className="icon">🌿</div>
            <h3>Svédmasszázs</h3>
            <p className="description">Klasszikus, teljes testet átmozgató frissítő masszázs, amely oldja az izomfeszültséget.</p>
            <div className="card-footer">
              <span className="duration">60 perc</span>
              <span className="price">12.000 Ft</span>
            </div>
          </div>

          <div className="service-card">
            <div className="icon">👣</div>
            <h3>Talpmasszázs</h3>
            <p className="description">A reflexzónák stimulálásával beindítja a szervezet öngyógyító folyamatait.</p>
            <div className="card-footer">
              <span className="duration">30 perc</span>
              <span className="price">8.000 Ft</span>
            </div>
          </div>

          <div className="service-card">
            <div className="icon">✨</div>
            <h3>Hátmasszázs</h3>
            <p className="description">Célzott kezelés a nyak, a váll és a hátizmok fájdalmainak enyhítésére.</p>
            <div className="card-footer">
              <span className="duration">45 perc</span>
              <span className="price">10.000 Ft</span>
            </div>
          </div>

        </div>
      </section>

      {/* ÚJ: Galéria szekció */}
      <section id="galeria" style={{ padding: '100px 5%', textAlign: 'center', backgroundColor: '#fff' }}>
        <h2>Galéria</h2>
        <div className="divider center"></div>
        <p style={{ color: '#7f8c8d', marginBottom: '40px', fontSize: '1.1rem' }}>
          Tekints be a szalon nyugtató és harmonikus környezetébe.
        </p>
        
        {/* Ideiglenes képtartók - Ide jönnek majd a valódi fotóid */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '300px', height: '250px', backgroundColor: '#f4f6f8', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bdc3c7', fontWeight: 'bold' }}>Kép 1 helye</div>
          <div style={{ width: '300px', height: '250px', backgroundColor: '#f4f6f8', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bdc3c7', fontWeight: 'bold' }}>Kép 2 helye</div>
          <div style={{ width: '300px', height: '250px', backgroundColor: '#f4f6f8', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bdc3c7', fontWeight: 'bold' }}>Kép 3 helye</div>
        </div>
      </section>

      {/* ÚJ: Az egységesített lábléc betöltése */}
      <Footer />
    </>
  );
}

export default Home;