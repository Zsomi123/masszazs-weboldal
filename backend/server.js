// backend/server.js
require('dotenv').config(); // Ez nagyon fontos az email jelszó titkosítása miatt!
const express = require('express');
const cors = require('cors');

// Beimportáljuk a szép új útvonalainkat a routes mappából
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Middleware-ek (Alapbeállítások)
app.use(cors());
app.use(express.json());

// Útvonalak (Routes) bekötése a fő "kapukhoz"
app.use('/api', authRoutes); // Belépéshez
app.use('/api/services', serviceRoutes); // Szolgáltatásokhoz
app.use('/api/appointments', appointmentRoutes); // Foglalásokhoz és naptárhoz (ITT FUT LE AZ EMAIL KÜLDÉS!)

// Szerver indítása
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`🚀 A szerver sikeresen elindult a http://localhost:${PORT} porton!`);
});