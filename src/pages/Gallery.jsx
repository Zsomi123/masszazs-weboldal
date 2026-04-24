import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Gallery.css'; // A saját stíluslapja

function Gallery() {
  // Ide teheted a képeid elérési útját
  const photos = [
    { id: 1, src: 'https://images.unsplash.com/photo-1544161515-4ae6ce6db87e?q=80&w=2070', alt: 'Masszázs szalon belső' },
    { id: 2, src: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=2070', alt: 'Illóolajok és kövek' },
    { id: 3, src: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1974', alt: 'Relaxációs környezet' },
    { id: 4, src: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070', alt: 'Profi kezelés' },
    // Adj hozzá annyi képet, amennyit csak szeretnél!
  ];

  return (
    <div className="gallery-page">
      <Navbar />
      
      <main className="gallery-main">
        <header className="gallery-header">
          <h1>Galéria</h1>
          <div className="divider center"></div>
          <p>Tekints meg képeinket a szalonunkról és a kezeléseinkről.</p>
        </header>

        <div className="gallery-grid">
          {photos.map(photo => (
            <div key={photo.id} className="gallery-item">
              <img src={photo.src} alt={photo.alt} loading="lazy" />
              <div className="overlay">
                <span>{photo.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Gallery;