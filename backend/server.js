// backend/server.js
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api'); // Beimportáljuk a routerünket

const app = express();

// Middleware-ek
app.use(cors());
app.use(express.json());

// Útvonalak beállítása (Minden, ami a routes/api.js-ben van, a /api útvonalról indul)
app.use('/api', apiRoutes);

// Szerver indítása
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`A backend szerver fut a http://localhost:${PORT} porton.`);
});