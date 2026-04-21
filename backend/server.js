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

// ==========================================
// KIKAPCSOLT (BLOKKOLT) IDŐPONTOK KEZELÉSE
// ==========================================

// 1. Blokkolások letöltése egy adott időszakra (A naptár kirajzolásához)
app.get('/api/admin/blocks/range', (req, res) => {
    const { start, end } = req.query;
    
    // Lekérjük azokat a blokkokat, amik a kért héten vannak
    const sql = "SELECT * FROM blocks WHERE start_time >= ? AND end_time <= ?";
    const startDate = start + 'T00:00:00';
    const endDate = end + 'T23:59:59';

    db.query(sql, [startDate, endDate], (err, results) => {
        if (err) {
            console.error("Hiba a blokkok lekérésekor:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// 2. Új blokkolás (kihúzás) mentése az adatbázisba
app.post('/api/admin/blocks', (req, res) => {
    const { start_time, end_time } = req.body;
    
    const sql = "INSERT INTO blocks (start_time, end_time) VALUES (?, ?)";
    db.query(sql, [start_time, end_time], (err, result) => {
        if (err) {
            console.error("Hiba a blokk mentésekor:", err);
            return res.status(500).json({ success: false, message: "Adatbázis hiba történt." });
        }
        res.json({ success: true, id: result.insertId, message: "Sikeres mentés" });
    });
});

// MAC MIATT AZ 5001-ES PORTOT HASZNÁLJUK!
const PORT = 5001;

// MINDIG EZ LEGYEN A FÁJL LEGALJÁN!
app.listen(PORT, () => {
    console.log(`🚀 A szerver sikeresen elindult a http://localhost:${PORT} porton!`);
});

// Kihúzás (blokkolás) törlése ID alapján
app.delete('/api/admin/blocks/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM blocks WHERE id = ?";
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Hiba a blokk törlésekor:", err);
            return res.status(500).json({ success: false, message: "Adatbázis hiba történt." });
        }
        res.json({ success: true, message: "Kihúzás sikeresen törölve!" });
    });
});