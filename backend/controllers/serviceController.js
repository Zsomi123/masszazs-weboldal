// backend/controllers/serviceController.js
const db = require('../config/db');

// Publikus: Összes szolgáltatás lekérése
exports.getAllServices = (req, res) => {
    db.query('SELECT * FROM services', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// Admin: Új szolgáltatás hozzáadása
exports.createService = (req, res) => {
    const { name, duration, price } = req.body;
    const query = "INSERT INTO services (name, duration, price) VALUES (?, ?, ?)";
    db.query(query, [name, duration, price], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Szolgáltatás hozzáadva!" });
    });
};

// Admin: Szolgáltatás szerkesztése
exports.updateService = (req, res) => {
    const { name, duration, price } = req.body;
    const query = "UPDATE services SET name = ?, duration = ?, price = ? WHERE id = ?";
    db.query(query, [name, duration, price, req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, message: "Szolgáltatás frissítve!" });
    });
};

// Admin: Szolgáltatás törlése
exports.deleteService = (req, res) => {
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
};