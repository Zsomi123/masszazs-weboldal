import './App.css'

function App() {
  return (
    <div className="container">
      {/* Navigációs menü */}
      <nav className="navbar">
        <div className="logo">Aranykezek</div>
        <ul className="nav-links">
          <li><a href="#kezdolap">Kezdőlap</a></li>
          <li><a href="#szolgaltatasok">Szolgáltatások</a></li>
          <li><a href="#kapcsolat">Kapcsolat</a></li>
        </ul>
      </nav>

      {/* Kezdőlap szekció */}
      <section id="kezdolap" className="hero">
        <h1>Aranykezek Masszázs Szalon</h1>
        <p>A nyugalom és felfrissülés szigete Hévíz szívében.</p>
        <button onClick={() => alert('Hamarosan indul az online foglalás!')}>
          Időpontfoglalás
        </button>
      </section>

      {/* Szolgáltatások szekció */}
      <section id="szolgaltatasok" className="services">
        <h2>Szolgáltatásaink</h2>
        <div className="price-card">
          <ul>
            <li><span>Svédmasszázs (60 perc)</span> <span>12.000 Ft</span></li>
            <li><span>Talpmasszázs (30 perc)</span> <span>8.000 Ft</span></li>
            <li><span>Hátmasszázs (45 perc)</span> <span>10.000 Ft</span></li>
          </ul>
        </div>
      </section>

      {/* Kapcsolat szekció */}
      <section id="kapcsolat" className="contact">
        <h2>Kapcsolat</h2>
        <p>📍 8380 Hévíz, Példa utca 12.</p>
        <p>📞 +36 30 123 4567</p>
        <p>✉️ info@aranykezek.hu</p>
      </section>
    </div>
  )
}

export default App