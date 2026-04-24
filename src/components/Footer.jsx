import './Footer.css';

function Footer() {
  return (
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
  );
}

export default Footer;