// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const db = require('../config/db');

// Admin bejelentkezés
exports.login = (req, res) => {
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
};