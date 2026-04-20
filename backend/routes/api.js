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

// ÚJ VÉGPONT: Lekérdezi egy adott nap FOGLALT időpontjait
router.get('/appointments/:date', (req, res) => {
    const searchDate = req.params.date; // Pl: "2026-10-12"
    
    // Csak a kezdési és befejezési időket kérjük le arra a napra
    const query = `
        SELECT start_time, end_time FROM appointments 
        WHERE DATE(start_time) = ?
    `;
    
    db.query(query, [searchDate], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

router.post('/appointments', (req, res) => {
    const { service_id, customer_name, customer_phone, start_time } = req.body;

    // 1. Megkeressük a szolgáltatás időtartamát
    db.query('SELECT duration FROM services WHERE id = ?', [service_id], (err, serviceResult) => {
        if (err) return res.status(500).send(err);
        
        const duration = serviceResult[0].duration;
        const startDate = new Date(start_time);
        const endDate = new Date(startDate.getTime() + duration * 60000);

        // 2. ÜTKÖZÉSVIZSGÁLAT: Van-e átfedés?
        const overlapQuery = `
            SELECT * FROM appointments 
            WHERE (start_time < ?) AND (end_time > ?)
        `;
        
        db.query(overlapQuery, [endDate, startDate], (err, overlaps) => {
            if (err) return res.status(500).send(err);

            if (overlaps.length > 0) {
                // Ha van találat, az időpont már foglalt!
                return res.status(400).json({ 
                    message: "Sajnos ez az időpont már foglalt vagy átfedésbe kerülne egy másik kezeléssel." 
                });
            }

            // 3. Ha nincs ütközés, jöhet a mentés
            const insertQuery = `
                INSERT INTO appointments (service_id, customer_name, customer_phone, start_time, end_time) 
                VALUES (?, ?, ?, ?, ?)
            `;
            
            db.query(insertQuery, [service_id, customer_name, customer_phone, startDate, endDate], (err, result) => {
                if (err) return res.status(500).send(err);
                res.status(201).json({ message: "Sikeres foglalás!" });
            });
        });
    });
});

module.exports = router;