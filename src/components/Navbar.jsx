import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png'; // Figyelj a ../ útvonalra!

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
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
        {/* A /# biztosítja, hogy aloldalról is visszaugorjon a főoldal megfelelő részére */}
        <li><a href="/#kezdolap" onClick={closeMenu}>Kezdőlap</a></li>
        <li><a href="/#rolam" onClick={closeMenu}>Rólam</a></li>
        <li><a href="/#szolgaltatasok" onClick={closeMenu}>Szolgáltatások</a></li>
        <li><a href="/#kapcsolat" onClick={closeMenu}>Kapcsolat</a></li>
        
        <li className="mobile-only">
          <Link to="/foglalas" className="nav-btn" onClick={closeMenu}>Időpontot kérek</Link>
        </li>
      </ul>
      
      <Link to="/foglalas" className="nav-btn desktop-only">Időpontot kérek</Link>
    </nav>
  );
}

export default Navbar;