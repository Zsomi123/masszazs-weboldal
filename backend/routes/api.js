// backend/routes/api.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db'); // Fontos: 1 vagy 2 pont attól függően, hol van a db.js! Ha hiba van, írd át './db'-re!

// 1. Szolgáltatások lekérése a legördülő menühöz
router.get('/services', (req, res) => {
    db.query('SELECT * FROM services', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 2. FOGLALÁS (Okos ütközésvizsgálattal!)
router.post('/appointments', (req, res) => {
    const { service_id, customer_name, customer_phone, start_time } = req.body;

    db.query('SELECT duration FROM services WHERE id = ?', [service_id], (err, serviceResult) => {
        if (err) return res.status(500).send(err);
        
        const duration = serviceResult[0].duration;
        const startDate = new Date(start_time);
        const endDate = new Date(startDate.getTime() + duration * 60000);

        // Ütközésvizsgálat
        const overlapQuery = `SELECT * FROM appointments WHERE (start_time < ?) AND (end_time > ?)`;
        db.query(overlapQuery, [endDate, startDate], (err, overlaps) => {
            if (err) return res.status(500).send(err);
            if (overlaps.length > 0) {
                return res.status(400).json({ message: "Sajnos ez az időpont már foglalt vagy átfedésbe kerülne." });
            }

            // Ha szabad, mentjük
            const insertQuery = `INSERT INTO appointments (service_id, customer_name, customer_phone, start_time, end_time) VALUES (?, ?, ?, ?, ?)`;
            db.query(insertQuery, [service_id, customer_name, customer_phone, startDate, endDate], (err, result) => {
                if (err) return res.status(500).send(err);
                res.status(201).json({ message: "Sikeres foglalás!" });
            });
        });
    });
});

// 3. ADMIN: A napi szabad/foglalt időpontok a React Naptárhoz
router.get('/appointments/:date', (req, res) => {
    const searchDate = req.params.date;
    const query = `SELECT start_time, end_time FROM appointments WHERE DATE(start_time) = ?`;
    db.query(query, [searchDate], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 4. ADMIN: Az összes foglalás lekérése a táblázathoz
router.get('/admin/appointments', (req, res) => {
    const query = `
        SELECT appointments.id, appointments.customer_name, appointments.customer_phone, appointments.start_time, services.name AS service_name, services.price
        FROM appointments
        JOIN services ON appointments.service_id = services.id
        ORDER BY appointments.start_time ASC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 5. VADONATÚJ: Bejelentkezés!
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(401).json({ success: false, message: "Nincs ilyen felhasználó!" });

        const user = results[0];
        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return res.status(500).send(err);
            if (isMatch) res.json({ success: true, message: "Sikeres belépés!" });
            else res.status(401).json({ success: false, message: "Hibás jelszó!" });
        });
    });
});

// 6. ADMIN: Foglalás törlése ID alapján
router.delete('/admin/appointments/:id', (req, res) => {
    const id = req.params.id;

    const query = "DELETE FROM appointments WHERE id = ?";
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Hiba a törlésnél:", err);
            return res.status(500).send(err);
        }
        res.json({ success: true, message: "Foglalás sikeresen törölve!" });
    });
});

// 7. ADMIN: Foglalás szerkesztése (Név és Telefonszám)
router.put('/admin/appointments/:id', (req, res) => {
    const id = req.params.id;
    const { customer_name, customer_phone } = req.body;

    const query = "UPDATE appointments SET customer_name = ?, customer_phone = ? WHERE id = ?";
    
    db.query(query, [customer_name, customer_phone, id], (err, result) => {
        if (err) {
            console.error("Hiba a frissítésnél:", err);
            return res.status(500).send(err);
        }
        res.json({ success: true, message: "Sikeresen frissítve!" });
    });
});

// ==========================================
// SZOLGÁLTATÁSOK (ÁRLISTA) KEZELÉSE (ADMIN)
// ==========================================

// Új szolgáltatás hozzáadása
router.post('/admin/services', (req, res) => {
    const { name, duration, price } = req.body;
    const query = "INSERT INTO services (name, duration, price) VALUES (?, ?, ?)";
    db.query(query, [name, duration, price], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Szolgáltatás hozzáadva!" });
    });
});

// Szolgáltatás szerkesztése (Ár, név, időtartam)
router.put('/admin/services/:id', (req, res) => {
    const { name, duration, price } = req.body;
    const query = "UPDATE services SET name = ?, duration = ?, price = ? WHERE id = ?";
    db.query(query, [name, duration, price, req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Szolgáltatás frissítve!" });
    });
});

// Szolgáltatás törlése
router.delete('/admin/services/:id', (req, res) => {
    const query = "DELETE FROM services WHERE id = ?";
    db.query(query, [req.params.id], (err) => {
        if (err) {
            // Ha a MySQL hiba "ER_ROW_IS_REFERENCED", az azt jelenti, hogy van hozzá foglalás!
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ success: false, message: "Nem törölheted, mert van hozzá aktív foglalás!" });
            }
            return res.status(500).send(err);
        }
        res.json({ success: true, message: "Szolgáltatás törölve!" });
    });
});

module.exports = router;