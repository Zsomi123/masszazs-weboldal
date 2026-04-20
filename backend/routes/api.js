// backend/routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Beimportáljuk az adatbázist a db.js-ből!

// 1. Szolgáltatások lekérése
// (Figyeld meg: már nem '/api/services', csak '/services', mert a 'server.js'-ben megadjuk a fix /api előtagot!)
router.get('/services', (req, res) => {
    db.query('SELECT * FROM services', (err, results) => {
        if (err) {
            console.error("Hiba a lekérdezésnél:", err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// 2. Új foglalás mentése
router.post('/appointments', (req, res) => {
    const { service_id, customer_name, customer_phone, start_time } = req.body;

    db.query('SELECT duration FROM services WHERE id = ?', [service_id], (err, serviceResult) => {
        if (err) return res.status(500).send(err);
        if (serviceResult.length === 0) return res.status(404).send("Nem található ilyen szolgáltatás.");

        const durationMinutes = serviceResult[0].duration;
        const startDate = new Date(start_time);
        const endDate = new Date(startDate.getTime() + durationMinutes * 60000); 

        const insertQuery = `
            INSERT INTO appointments (service_id, customer_name, customer_phone, start_time, end_time) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.query(insertQuery, [service_id, customer_name, customer_phone, startDate, endDate], (insertErr, result) => {
            if (insertErr) return res.status(500).send(insertErr);
            console.log("Új foglalás rögzítve! ID:", result.insertId);
            res.status(201).json({ message: "Sikeres foglalás!", id: result.insertId });
        });
    });
});

module.exports = router;