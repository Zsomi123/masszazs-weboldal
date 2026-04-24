import './Footer.css';

function Footer() {
  return (
    <footer id="kapcsolat" className="contact">
      <div className="contact-container">
        
        {/* 1. OSZLOP: Elérhetőségek */}
        <div className="contact-column contact-info">
          <h2>Foglalj időpontot!</h2>
          <p>Várlak szeretettel szalonomban. Keress bizalommal az alábbi elérhetőségeken!</p>
          <div className="info-items">
            <p><span>📍</span> 1111 Budapest, Példa utca 1.</p>
            <p><span>📞</span> <a href="tel:+36301234567">+36 30 123 4567</a></p>
            <p><span>✉️</span> <a href="mailto:info@emimassage.hu">info@emimassage.hu</a></p>
          </div>
        </div>

        {/* 2. OSZLOP: Nyitvatartás */}
        <div className="contact-column opening-hours">
          <h3>Nyitvatartás</h3>
          <ul>
            <li><span>Hétfő - Péntek:</span> 08:00 - 18:00</li>
            <li><span>Szombat:</span> 09:00 - 14:00</li>
            <li><span>Vasárnap:</span> Zárva</li>
          </ul>
        </div>

        {/* 3. OSZLOP: Google Maps */}
        <div className="contact-column contact-map">
          <h3>Hol találsz meg?</h3>
          <div className="map-responsive">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m10!1m3!1d2695.5659!2d19.055!3d47.497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDI5JzQ5LjIiTiAxOcKwMDMnMTguMCJF!5e0!3m2!1shu!2shu!4v1620000000000!5m2!1shu!2shu" 
              width="100%" 
              height="200" 
              style={{ border: 0, borderRadius: '10px' }} 
              allowFullScreen="" 
              loading="lazy"
              title="Szalon helyszíne"
            ></iframe>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Emi Massage. Minden jog fenntartva.</p>
      </div>
    </footer>
  );
}

export default Footer;