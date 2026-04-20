// backend/server.js
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Behúzzuk az adatbázist, hogy lássuk a sikeres csatlakozást
const apiRoutes = require('./routes/api'); // Behúzzuk az útvonalakat

const app = express();

// Engedélyezzük a kommunikációt a React és a Node.js között
app.use(cors());

// Megtanítjuk a szervert JSON-t olvasni
app.use(express.json());

// Minden "/api" kezdetű kérést a routes/api.js fog kezelni
app.use('/api', apiRoutes);

// MAC MIATT AZ 5001-ES PORTOT HASZNÁLJUK!
const PORT = 5001;

app.listen(PORT, () => {
    console.log(`🚀 A szerver sikeresen elindult a http://localhost:${PORT} porton!`);
});