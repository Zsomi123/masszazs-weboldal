import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// ITT IMPORTÁLJUK AZ ÚJ KÉPET
import logoImg from '../assets/osszerakva_es_massage.png'; 
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  return (
    <nav className="navbar">
      {/* LOGÓ RÉSZ - Most már CSAK a kép van itt, a szöveg nélkül */}
      <Link to="/" className="logo-link" onClick={closeMenu}>
        <img src={logoImg} alt="Emi Massage" className="logo-img" />
      </Link>
      
      {/* HAMBURGER IKON */}
      <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      <div className={`menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}></div>

      

      {/* MENÜPONTOK */}
      <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <li><a href="/#kezdolap" onClick={closeMenu}>Kezdőlap</a></li>
        <li><a href="/#rolam" onClick={closeMenu}>Rólam</a></li>
        <li><a href="/#szolgaltatasok" onClick={closeMenu}>Szolgáltatások</a></li>
        {/* ÚJ: Galéria menüpont beillesztése */}
        <li><a href="/#galeria" onClick={closeMenu}>Galéria</a></li> 
        <li><a href="/#kapcsolat" onClick={closeMenu}>Kapcsolat</a></li>
        
        {/* MOBIL GOMB */}
        <li className="mobile-only">
          <Link to="/foglalas" className="nav-btn mobile-btn" onClick={closeMenu}>
            Időpontot kérek
          </Link>
        </li>
      </ul>


      
      <Link to="/foglalas" className="nav-btn desktop-only">
        Időpontot kérek
      </Link>
    </nav>
  );
}

export default Navbar;