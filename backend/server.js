// backend/server.js
const express = require('express');
const cors = require('cors');

// Beimportáljuk az útvonalainkat
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Middleware-ek (Alapbeállítások)
app.use(cors());
app.use(express.json());

// Útvonalak (Routes) bekötése
// Így minden authRoute a /api prefixet kapja (pl. /api/login)
app.use('/api', authRoutes); 

// A szolgáltatások a /api/services alatt élnek majd
app.use('/api/services', serviceRoutes); 

// A foglalások és blokkolások a /api/appointments alatt élnek
app.use('/api/appointments', appointmentRoutes);

// Szerver indítása
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`🚀 A szerver sikeresen elindult a http://localhost:${PORT} porton!`);
});