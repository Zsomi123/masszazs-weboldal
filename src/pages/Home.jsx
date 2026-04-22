import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import heroBg from '../assets/hero-bg.JPG'; 
import logoImg from '../assets/Logo.png'; // <-- Ezt a sort add hozzá!

function Home() {
  // Ez a változó figyeli, hogy nyitva van-e a menü mobilon
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Ez a függvény nyitja/zárja a menüt
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Ez a függvény bezárja a menüt, ha rákattintanak egy linkre
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Navigációs menü */}
      <nav className="navbar">
        {/* A logónál is érdemes Linket használni, hogy a főoldalon maradjon */}
        <Link to="/" className="logo-link" onClick={closeMenu}>
          <img src={logoImg} alt="Emi Logo" className="logo-img" />
          <span className="logo-text">Massage</span>
        </Link>
        
        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          {/* A sima menüpontok maradhatnak <a> tagek, mert egy oldalon belül görgetnek! */}
          <li><a href="#kezdolap" onClick={closeMenu}>Kezdőlap</a></li>
          <li><a href="#rolam" onClick={closeMenu}>Rólam</a></li>
          <li><a href="#szolgaltatasok" onClick={closeMenu}>Szolgáltatások</a></li>
          <li><a href="#kapcsolat" onClick={closeMenu}>Kapcsolat</a></li>
          
          {/* 1. GOMB (Mobilos menüben) - ÁTÍRVA LINKRE */}
          <li className="mobile-only">
            <Link to="/foglalas" className="nav-btn" onClick={closeMenu}>Időpontot kérek</Link>
          </li>
        </ul>
        
        {/* 2. GOMB (Asztali nézetben) - ÁTÍRVA LINKRE */}
        <Link to="/foglalas" className="nav-btn desktop-only">Időpontot kérek</Link>
      </nav>

      {/* Hero szekció - (Innen lefelé minden maradt a régi!) */}
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

      {/* Kapcsolat szekció */}
      <footer id="kapcsolat" className="contact">
        <div className="contact-container">
          <div className="contact-info">
            <h2>Foglalj időpontot!</h2>
            <p>Várlak szeretettel szalonomban. Keress bizalommal az alábbi elérhetőségeken!</p>
            <div className="info-items">
              <p><span>📍</span> 1111 Budapest, Példa utca 1.</p>
              <p><span>📞</span> +36 30 123 4567</p>
              <p><span>✉️</span> info@emimassage.hu</p>
            </div>
          </div>
          <div className="opening-hours">
            <h3>Nyitvatartás</h3>
            <ul>
              <li><span>Hétfő - Péntek:</span> 08:00 - 18:00</li>
              <li><span>Szombat:</span> 09:00 - 14:00</li>
              <li><span>Vasárnap:</span> Zárva</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Emi Massage. Minden jog fenntartva.</p>
        </div>
      </footer>
    </>
  );
}

export default Home;